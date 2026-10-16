const { sendMail, layout, paragraphs, esc, BRAND_ORANGE } = require('./mailer');
const { ROLE_LABELS } = require('../config/permissions');

const adminUrl = () => (process.env.ADMIN_URL || 'http://localhost:3001').replace(/\/+$/, '');

const buttonHtml = (href, label) =>
  `<p style="margin:24px 0;"><a href="${esc(href)}" style="background:${BRAND_ORANGE};color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:4px;font-weight:bold;display:inline-block;">${esc(label)}</a></p>
   <p style="margin:0;font-size:12px;color:#6b7280;word-break:break-all;">If the button does not work, copy this link into your browser:<br>${esc(href)}</p>`;

function resetLink(token) {
  return `${adminUrl()}/reset-password?token=${token}`;
}

// New account: "choose your password"
async function sendInviteEmail(user, token, invitedBy) {
  const link = resetLink(token);
  const html = layout({
    title: 'Welcome to the Sethmo Group Admin Portal',
    bodyHtml:
      paragraphs(`Hello ${user.name || ''},\n\n${invitedBy || 'A Super Admin'} has created an admin account for you as ${ROLE_LABELS[user.role]}.`) +
      paragraphs('Click the button below to choose your password. The link works for 72 hours. After you sign in, please open "My Profile" and upload a clear photo of your ID.') +
      buttonHtml(link, 'Set my password'),
  });
  return sendMail({ to: user.email, subject: 'Your Sethmo Group admin account', html, text: `Set your password: ${link}` });
}

// Forgot password / reset by Super Admin
async function sendResetEmail(user, token) {
  const link = resetLink(token);
  const html = layout({
    title: 'Reset your password',
    bodyHtml:
      paragraphs(`Hello ${user.name || ''},\n\nWe received a request to reset the password for your Sethmo Group admin account. This link works for 1 hour.`) +
      buttonHtml(link, 'Choose a new password') +
      paragraphs('\nIf you did not ask for this, you can ignore this email - your password stays the same.'),
  });
  return sendMail({ to: user.email, subject: 'Reset your Sethmo Group admin password', html, text: `Reset your password: ${link}` });
}

module.exports = { sendInviteEmail, sendResetEmail, resetLink };
