/**
 * Lost an admin password?   Run from the sethmogroupserver folder:
 *
 *     node resetAdminPassword.js you@example.com
 *
 * (or, with no email, it resets the first active Super Admin it finds)
 *
 * It does NOT choose a password for anyone. It prints a one-time "choose a new password" link
 * (valid 1 hour) and clears any login lock. Open the link in your browser and pick a new password
 * (10+ characters, at least one letter and one number). Any old sessions are signed out when you save.
 */
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const User = require('./models/User');
const { createResetToken } = require('./utils/passwords');
const { resetLink } = require('./utils/accountEmails');

(async () => {
  await connectDB();
  const email = String(process.argv[2] || '').trim().toLowerCase();

  const user = email
    ? await User.findOne({ $or: [{ email }, { username: email }] })
    : await User.findOne({ role: 'super_admin', isActive: true }).sort({ createdAt: 1 });

  if (!user) {
    console.log(email ? `No account found for ${email}.` : 'No Super Admin account found. Run:  npm run seed:users');
    const all = await User.find({}).select('email role isActive');
    if (all.length) { console.log('\nAccounts in the database:'); all.forEach((u) => console.log(` - ${u.email || u.username}  (${u.role}${u.isActive ? '' : ', deactivated'})`)); }
    process.exit(1);
  }

  const { token, hash, expires } = createResetToken(1);
  user.passwordResetToken = hash;
  user.passwordResetExpires = expires;
  user.failedLoginAttempts = 0;
  user.lockUntil = undefined;
  user.isActive = true;
  await user.save();

  console.log(`\nAccount: ${user.email || user.username}  (${user.role})`);
  console.log('Open this link within 1 hour and choose a new password:\n');
  console.log(`  ${resetLink(token)}\n`);
  console.log('(The link uses ADMIN_URL from your .env - make sure it is your real admin address.)');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
