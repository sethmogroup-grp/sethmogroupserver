/**
 * Creates the three role accounts (replaces the old seedAdmin.js, which used a default
 * "admin" password).   Run:  npm run seed:users
 *
 * Put the emails in .env first:
 *   SUPER_ADMIN_EMAIL=...      SUPER_ADMIN_NAME="Justine Mophat Chuungwe"
 *   CONTENT_MANAGER_EMAIL=...  CONTENT_MANAGER_NAME="..."
 *   SUPPORT_AGENT_EMAIL=...    SUPPORT_AGENT_NAME="..."
 *
 * Nobody gets a password from this script. Each person receives a "set your password" link
 * (emailed if SMTP is configured, always printed here as a fallback). It works for 72 hours.
 */
const dotenv = require('dotenv');
dotenv.config();

const crypto = require('crypto');
const connectDB = require('./config/db');
const User = require('./models/User');
const mailer = require('./utils/mailer');
const { createResetToken } = require('./utils/passwords');
const { sendInviteEmail, resetLink } = require('./utils/accountEmails');
const { ROLES, ROLE_LABELS } = require('./config/permissions');

const ACCOUNTS = [
  { role: ROLES.SUPER_ADMIN, email: process.env.SUPER_ADMIN_EMAIL, name: process.env.SUPER_ADMIN_NAME || 'Justine Mophat Chuungwe' },
  { role: ROLES.CONTENT_MANAGER, email: process.env.CONTENT_MANAGER_EMAIL, name: process.env.CONTENT_MANAGER_NAME },
  { role: ROLES.SUPPORT_AGENT, email: process.env.SUPPORT_AGENT_EMAIL, name: process.env.SUPPORT_AGENT_NAME },
];

(async () => {
  await connectDB();
  let created = 0;

  for (const a of ACCOUNTS) {
    const email = String(a.email || '').trim().toLowerCase();
    if (!email) { console.log(`- ${ROLE_LABELS[a.role]}: skipped (no email in .env)`); continue; }

    const existing = await User.findOne({ $or: [{ email }, { username: email }] });
    if (existing) {
      existing.role = a.role;
      existing.email = email;
      if (a.name) existing.name = a.name;
      existing.isActive = true;
      await existing.save();
      console.log(`- ${ROLE_LABELS[a.role]}: ${email} already exists - role and name updated, password untouched`);
      continue;
    }

    const { token, hash, expires } = createResetToken(72);
    const user = await User.create({
      username: email, email, name: a.name || '', role: a.role, status: 'invited',
      password: crypto.randomBytes(32).toString('hex'),
      passwordResetToken: hash, passwordResetExpires: expires, createdBy: 'seed script',
    });
    created += 1;

    let emailed = false;
    if (mailer.isConfigured()) {
      try { await sendInviteEmail(user, token, 'The system administrator'); emailed = true; }
      catch (e) { console.log(`  (email failed: ${e.message})`); }
    }
    console.log(`- ${ROLE_LABELS[a.role]}: ${email} created${emailed ? ' and invitation emailed' : ''}`);
    console.log(`  Set-password link (72h): ${resetLink(token)}`);
  }

  console.log(`\nDone. ${created} account(s) created.`);
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
