const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Message = require('../models/Message');
const logActivity = require('../utils/logger');
const mailer = require('../utils/mailer');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (v, max) => String(v == null ? '' : v).trim().slice(0, max);

// POST: Receive a new message from the public website (Contact Us form)
router.post('/', async (req, res) => {
  try {
    const name = clip(req.body.name, 120);
    const email = clip(req.body.email, 200).toLowerCase();
    const subject = clip(req.body.subject, 200) || 'No Subject';
    const message = clip(req.body.message, 5000);

    if (!name || !message) {
      return res.status(400).json({ error: 'Name and message are required.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // Only whitelisted fields are saved (the website can never set isRead / type itself)
    await Message.create({ name, email, subject, message, type: 'contact' });
    res.status(201).json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Fetch messages for the Admin Panel (newest first). Optional ?type=contact|newsletter
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (['contact', 'newsletter'].includes(req.query.type)) filter.type = req.query.type;
    const messages = await Message.find(filter).sort({ createdAt: -1 }).limit(1000);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Unread counter (used for the badge in the sidebar)
router.get('/unread-count', async (req, res) => {
  try {
    const count = await Message.countDocuments({ isRead: false });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH: Mark every message as read
router.patch('/read-all', async (req, res) => {
  try {
    const result = await Message.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true, modified: result.modifiedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const validId = (req, res, next) =>
  mongoose.isValidObjectId(req.params.id) ? next() : res.status(400).json({ error: 'Invalid message id' });

// PATCH: Mark a message as "Read"
router.patch('/:id/read', validId, async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH: Mark a message as "Unread" again
router.patch('/:id/unread', validId, async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, { isRead: false }, { new: true });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Delete a message from the Admin Panel
router.delete('/:id', validId, async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Reply to a client by email (sent through Nodemailer, saved on the message)
//       Permission: inbox:reply (Super Admin + Support Agent) - enforced in middleware/accessPolicy.js
router.post('/:id/reply', validId, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (msg.type === 'newsletter') {
      return res.status(400).json({ error: 'Newsletter sign-up notices cannot be replied to.' });
    }

    const body = clip(req.body.body, 5000);
    if (!body) return res.status(400).json({ error: 'Please write your reply first.' });
    if (!mailer.isConfigured()) {
      return res.status(503).json({ error: 'Email is not set up on the server yet. Ask the Super Admin to add the SMTP settings.' });
    }

    const agent = req.user;
    const subject = clip(req.body.subject, 200) || `Re: ${msg.subject || 'Your message to Sethmo Group'}`;
    const signature = `${agent.name || 'Sethmo Group Team'}\nSethmo Group`;

    const html = mailer.layout({
      bodyHtml:
        mailer.paragraphs(body) +
        mailer.paragraphs(`Kind regards,\n${signature}`) +
        `<div style="margin-top:24px;padding:12px 16px;border-left:3px solid #d1d5db;color:#6b7280;font-size:13px;">
           <div style="margin-bottom:6px;">On ${mailer.esc(new Date(msg.createdAt).toLocaleString('en-GB'))}, ${mailer.esc(msg.name)} wrote:</div>
           ${mailer.paragraphs(msg.message)}
         </div>`,
    });

    try {
      await mailer.sendMail({
        to: msg.email,
        subject,
        html,
        text: `${body}\n\nKind regards,\n${signature}\n\n---\nOn ${new Date(msg.createdAt).toISOString()}, ${msg.name} wrote:\n${msg.message}`,
        replyTo: process.env.MAIL_REPLY_TO || process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER,
      });
    } catch (mailErr) {
      console.error('Reply email failed:', mailErr.message);
      return res.status(502).json({ error: 'The email could not be sent. Check the email settings and try again.' });
    }

    msg.replies.push({
      subject,
      body,
      sentBy: { userId: String(agent._id), name: agent.name, email: agent.email, role: agent.role },
    });
    msg.repliedAt = new Date();
    msg.isRead = true;
    await msg.save();

    await logActivity(`Replied to ${msg.name} (${msg.email})`, 'Inbox', agent.name || agent.email);
    res.json(msg);
  } catch (err) {
    console.error('Reply error:', err);
    res.status(500).json({ error: 'Could not send the reply.' });
  }
});

module.exports = router;
