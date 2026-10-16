const nodemailer = require('nodemailer');

/**
 * Nodemailer wrapper. Works with any SMTP provider (Gmail app password, Zoho, Outlook/365,
 * SendGrid/Mailgun SMTP, your hosting mail server...). Configure it in .env - see .env.example.
 */
let transporter = null;

const isConfigured = () =>
  !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

function getTransporter() {
  if (!isConfigured()) return null;
  if (transporter) return transporter;

  const port = Number(process.env.SMTP_PORT) || 587;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    // 465 = implicit TLS; 587 = STARTTLS (secure:false is correct there)
    secure: String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    pool: true,            // reuse connections - important for newsletters
    maxConnections: 3,
    maxMessages: 100,
    rateDelta: 1000,       // be polite to the provider: at most 5 mails per second
    rateLimit: 5,
  });
  return transporter;
}

const fromAddress = () => {
  const name = process.env.MAIL_FROM_NAME || 'Sethmo Group';
  const addr = process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER;
  return `"${name.replace(/"/g, '')}" <${addr}>`;
};

async function verifyMailer() {
  const t = getTransporter();
  if (!t) {
    console.log('Mailer: SMTP is not configured (set SMTP_HOST / SMTP_USER / SMTP_PASS). Emails are disabled.');
    return false;
  }
  try {
    await t.verify();
    console.log('Mailer: SMTP connection successful.');
    return true;
  } catch (err) {
    console.error('Mailer: SMTP connection failed -', err.message);
    return false;
  }
}

class MailNotConfiguredError extends Error {
  constructor() {
    super('Email is not set up on the server yet. Ask the Super Admin to add the SMTP settings.');
    this.code = 'MAIL_NOT_CONFIGURED';
  }
}

async function sendMail({ to, subject, html, text, replyTo, headers }) {
  const t = getTransporter();
  if (!t) throw new MailNotConfiguredError();
  return t.sendMail({
    from: fromAddress(),
    to,
    subject,
    html,
    text,
    replyTo: replyTo || process.env.MAIL_REPLY_TO || undefined,
    headers,
  });
}

/* ---------- small helpers for building safe HTML emails ---------- */

const esc = (v) =>
  String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// "line\nline\n\nnew paragraph" -> safe <p> blocks
const paragraphs = (text) =>
  String(text || '')
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;line-height:1.65;">${esc(p.trim()).replace(/\n/g, '<br>')}</p>`)
    .join('');

const BRAND_NAVY = '#0b2447';
const BRAND_ORANGE = '#f47b20';

function layout({ title, bodyHtml, footerHtml }) {
  return `<!doctype html><html><body style="margin:0;padding:0;background:#f3f4f6;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 12px;">
<tr><td align="center">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
    <tr><td style="background:${BRAND_NAVY};padding:20px 28px;border-bottom:4px solid ${BRAND_ORANGE};">
      <span style="color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:.5px;">SETHMO GROUP</span>
    </td></tr>
    <tr><td style="padding:28px;font-size:15px;">
      ${title ? `<h1 style="margin:0 0 18px;font-size:22px;color:${BRAND_NAVY};">${esc(title)}</h1>` : ''}
      ${bodyHtml}
    </td></tr>
    <tr><td style="padding:18px 28px;background:#f9fafb;font-size:12px;color:#6b7280;line-height:1.6;">
      ${footerHtml || 'Sethmo Group &middot; Plot 3520, 3521 Cairo Road, Lusaka, Zambia'}
    </td></tr>
  </table>
</td></tr></table></body></html>`;
}

module.exports = {
  isConfigured, verifyMailer, sendMail, MailNotConfiguredError,
  esc, paragraphs, layout, BRAND_NAVY, BRAND_ORANGE,
};
