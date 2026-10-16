const express = require('express');
const router = express.Router();
const NewsletterSubscriber = require('../models/NewsletterSubscriber');
const Message = require('../models/Message');
const { verifyUnsubscribeToken } = require('../utils/unsubscribe');
const { esc } = require('../utils/mailer');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ACTIVE = { unsubscribed: { $ne: true } };

// POST /api/newsletter-subscribers - public: the website's subscribe form
router.post('/', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // New address -> inserted. Someone who had unsubscribed and signs up again -> switched back on.
    const result = await NewsletterSubscriber.updateOne(
      { email },
      { $setOnInsert: { email }, $set: { unsubscribed: false }, $unset: { unsubscribedAt: '' } },
      { upsert: true }
    );

    // Brand-new subscriber -> also drop a notification into the admin Inbox
    if (result.upsertedCount > 0) {
      try {
        await Message.create({
          type: 'newsletter',
          name: 'Newsletter Subscriber',
          email,
          subject: 'New newsletter subscription',
          message: `${email} just subscribed to the Sethmo Group newsletter.`,
        });
      } catch (inboxErr) {
        console.error('Could not add newsletter notification to inbox:', inboxErr.message);
      }
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('Newsletter subscribe error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// GET /api/newsletter-subscribers - admin (newsletter:send): how many people are subscribed
router.get('/', async (req, res) => {
  try {
    const count = await NewsletterSubscriber.countDocuments(ACTIVE);
    const unsubscribedCount = await NewsletterSubscriber.countDocuments({ unsubscribed: true });
    const recent = await NewsletterSubscriber.find(ACTIVE).sort({ createdAt: -1 }).limit(20).select('email createdAt -_id');
    res.json({ count, unsubscribedCount, recent });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ---- Unsubscribe (public, linked from every newsletter) ----
   GET only shows a confirmation button - mail scanners "click" links automatically and must not
   unsubscribe people. The button (or a mail app's one-click header) sends the POST. */
const page = (title, bodyHtml) => `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;font-family:Arial,Helvetica,sans-serif;background:#f3f4f6;display:flex;min-height:100vh;align-items:center;justify-content:center;">
<div style="background:#fff;max-width:440px;margin:16px;padding:36px;border-radius:8px;border-top:4px solid #f47b20;text-align:center;color:#1f2937;">
<h2 style="color:#0b2447;margin-top:0;">${esc(title)}</h2>${bodyHtml}</div></body></html>`;

router.get('/unsubscribe', (req, res) => {
  const email = String(req.query.email || '').toLowerCase();
  if (!verifyUnsubscribeToken(email, req.query.token)) {
    return res.status(400).send(page('Link not valid', '<p>This unsubscribe link is not valid. Please use the link from the newsletter you received.</p>'));
  }
  res.send(page('Unsubscribe', `<p>Stop sending Sethmo Group newsletters to <strong>${esc(email)}</strong>?</p>
    <form method="POST" action="?email=${encodeURIComponent(email)}&token=${encodeURIComponent(req.query.token)}">
      <button type="submit" style="background:#f47b20;color:#fff;border:0;padding:12px 26px;border-radius:4px;font-weight:bold;cursor:pointer;">Yes, unsubscribe me</button>
    </form>`));
});

router.post('/unsubscribe', async (req, res) => {
  try {
    const email = String(req.query.email || '').toLowerCase();
    if (!verifyUnsubscribeToken(email, req.query.token)) {
      return res.status(400).send(page('Link not valid', '<p>This unsubscribe link is not valid.</p>'));
    }
    await NewsletterSubscriber.updateOne({ email }, { $set: { unsubscribed: true, unsubscribedAt: new Date() } });
    res.send(page('You are unsubscribed', '<p>You will no longer receive Sethmo Group newsletters. Sorry to see you go.</p>'));
  } catch (err) {
    console.error('Unsubscribe error:', err);
    res.status(500).send(page('Something went wrong', '<p>Please try again in a moment.</p>'));
  }
});

module.exports = router;
