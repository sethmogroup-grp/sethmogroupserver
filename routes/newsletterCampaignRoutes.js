const express = require('express');
const mongoose = require('mongoose');
const NewsletterCampaign = require('../models/NewsletterCampaign');
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const logActivity = require('../utils/logger');
const mailer = require('../utils/mailer');
const { unsubscribeUrl } = require('../utils/unsubscribe');

const router = express.Router();

const clip = (v, max) => String(v == null ? '' : v).trim().slice(0, max);
const isHttps = (u) => { try { return new URL(u).protocol === 'https:'; } catch { return false; } };
const ACTIVE = { unsubscribed: { $ne: true } };

/* ---------- build the email ---------- */
function buildNewsletter({ headline, body, imageUrl, buttonText, buttonUrl, unsubUrl }) {
  const bodyHtml =
    (imageUrl ? `<img src="${mailer.esc(imageUrl)}" alt="" width="544" style="width:100%;max-width:544px;height:auto;border-radius:4px;margin:0 0 20px;display:block;">` : '') +
    mailer.paragraphs(body) +
    (buttonText && buttonUrl
      ? `<p style="margin:24px 0 8px;"><a href="${mailer.esc(buttonUrl)}" style="background:${mailer.BRAND_ORANGE};color:#fff;text-decoration:none;padding:12px 26px;border-radius:4px;font-weight:bold;display:inline-block;">${mailer.esc(buttonText)}</a></p>`
      : '');

  const footerHtml = `You are receiving this because you subscribed to Sethmo Group newsletters.<br>
    Sethmo Group &middot; Plot 3520, 3521 Cairo Road, Lusaka, Zambia<br>
    <a href="${mailer.esc(unsubUrl)}" style="color:#6b7280;">Unsubscribe</a>`;

  return {
    html: mailer.layout({ title: headline, bodyHtml, footerHtml }),
    text: `${headline ? headline + '\n\n' : ''}${body}${buttonText && buttonUrl ? `\n\n${buttonText}: ${buttonUrl}` : ''}\n\n---\nUnsubscribe: ${unsubUrl}`,
  };
}

// Validates the form fields; returns { error } or { content }
function readContent(b) {
  const subject = clip(b.subject, 150);
  const headline = clip(b.headline, 150);
  const body = clip(b.body, 20000);
  const imageUrl = clip(b.imageUrl, 1000);
  const buttonText = clip(b.buttonText, 40);
  const buttonUrl = clip(b.buttonUrl, 1000);

  if (!subject) return { error: 'Please enter a subject line.' };
  if (!body) return { error: 'Please write the newsletter message.' };
  if (imageUrl && !isHttps(imageUrl)) return { error: 'The image link must start with https://' };
  if ((buttonText || buttonUrl) && !(buttonText && isHttps(buttonUrl))) {
    return { error: 'A button needs both a label and a link that starts with https://' };
  }
  return { content: { subject, headline, body, imageUrl, buttonText, buttonUrl } };
}

const mailGuard = (req, res, next) =>
  mailer.isConfigured()
    ? next()
    : res.status(503).json({ error: 'Email is not set up on the server yet. Ask the Super Admin to add the SMTP settings.' });

/* ---------- background delivery ---------- */
async function deliver(campaignId, emails, content) {
  let sent = 0;
  const failedEmails = [];
  let failed = 0;

  try {
    for (let i = 0; i < emails.length; i++) {
      const to = emails[i];
      const unsubUrl = unsubscribeUrl(to);
      try {
        const { html, text } = buildNewsletter({ ...content, unsubUrl });
        await mailer.sendMail({
          to,
          subject: content.subject,
          html,
          text,
          headers: {
            'List-Unsubscribe': `<${unsubUrl}>`,
            'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          },
        });
        sent += 1;
      } catch (err) {
        failed += 1;
        if (failedEmails.length < 50) failedEmails.push(to);
        console.error(`Newsletter to ${to} failed:`, err.message);
      }
      // save progress now and then so the panel can show a live counter
      if ((i + 1) % 10 === 0) {
        await NewsletterCampaign.updateOne({ _id: campaignId }, { sent, failed });
      }
    }
  } catch (fatal) {
    console.error('Newsletter delivery crashed:', fatal);
  }

  const status = sent === 0 ? 'failed' : failed > 0 ? 'partial' : 'sent';
  await NewsletterCampaign.updateOne({ _id: campaignId }, { sent, failed, failedEmails, status, finishedAt: new Date() });
}

/* ---------- routes (permission: newsletter:send) ---------- */

// GET /api/newsletter-campaigns - history + whether email works
router.get('/', async (req, res) => {
  try {
    const [campaigns, subscriberCount] = await Promise.all([
      NewsletterCampaign.find().sort({ createdAt: -1 }).limit(30).select('-body -failedEmails'),
      NewsletterSubscriber.countDocuments(ACTIVE),
    ]);
    res.json({ campaigns, subscriberCount, mailConfigured: mailer.isConfigured() });
  } catch (err) {
    res.status(500).json({ error: 'Could not load newsletters.' });
  }
});

// POST /api/newsletter-campaigns/test - sends a preview to the logged-in user's own email
router.post('/test', mailGuard, async (req, res) => {
  const { error, content } = readContent(req.body);
  if (error) return res.status(400).json({ error });
  try {
    const to = req.user.email;
    const { html, text } = buildNewsletter({ ...content, unsubUrl: unsubscribeUrl(to) });
    await mailer.sendMail({ to, subject: `[TEST] ${content.subject}`, html, text });
    res.json({ message: `Test email sent to ${to}.` });
  } catch (err) {
    console.error('Test newsletter failed:', err.message);
    res.status(502).json({ error: 'The test email could not be sent. Check the email settings.' });
  }
});

// POST /api/newsletter-campaigns/send - starts sending to every active subscriber
router.post('/send', mailGuard, async (req, res) => {
  const { error, content } = readContent(req.body);
  if (error) return res.status(400).json({ error });

  try {
    // Guard against a double-click / two people sending at once
    const running = await NewsletterCampaign.findOne({
      status: 'sending',
      startedAt: { $gt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    });
    if (running) {
      return res.status(409).json({ error: 'A newsletter is still being sent. Please wait until it finishes.' });
    }

    const subscribers = await NewsletterSubscriber.find(ACTIVE).select('email -_id');
    const emails = subscribers.map((s) => s.email);
    if (emails.length === 0) return res.status(400).json({ error: 'There are no subscribers to send to yet.' });

    const campaign = await NewsletterCampaign.create({
      ...content,
      total: emails.length,
      sentBy: { userId: String(req.user._id), name: req.user.name, email: req.user.email, role: req.user.role },
    });

    await logActivity(`Sent newsletter "${content.subject}" to ${emails.length} subscribers`, 'Newsletter', req.user.name || req.user.email);

    // Answer straight away; delivery continues in the background (large lists take a while)
    res.status(202).json({ campaign: { _id: campaign._id, status: campaign.status, total: campaign.total, sent: 0, failed: 0 } });
    deliver(campaign._id, emails, content).catch((e) => console.error('deliver() error:', e));
  } catch (err) {
    console.error('Send newsletter error:', err);
    res.status(500).json({ error: 'Could not start sending the newsletter.' });
  }
});

// GET /api/newsletter-campaigns/:id - progress of one send
router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
  const c = await NewsletterCampaign.findById(req.params.id).select('-body');
  if (!c) return res.status(404).json({ error: 'Not found' });
  res.json(c);
});

module.exports = router;
