const User = require('../models/User');

/**
 * Runs once at server start (safe to repeat).
 * Accounts that existed BEFORE roles were introduced (the single shared admin) already had full
 * power, so they become Super Admins - nobody is locked out and nobody gains anything new.
 * Uses the raw collection on purpose: going through the model would apply the "least privilege"
 * default and demote them.
 */
async function migrateLegacyUsers() {
  try {
    const res = await User.collection.updateMany(
      { role: { $exists: false } },
      [{
        $set: {
          role: 'super_admin',
          email: { $ifNull: ['$email', '$username'] },
          name: { $ifNull: ['$name', 'Administrator'] },
          status: { $ifNull: ['$status', 'active'] },
          isActive: { $ifNull: ['$isActive', true] },
          tokenVersion: { $ifNull: ['$tokenVersion', 0] },
        },
      }]
    );
    if (res.modifiedCount > 0) {
      console.log(`Accounts: ${res.modifiedCount} existing admin account(s) upgraded to Super Admin.`);
    }
    const supers = await User.countDocuments({ role: 'super_admin', isActive: true, status: 'active' });
    if (supers === 0) {
      console.warn('Accounts: there is no active Super Admin yet. Run "npm run seed:users" to create one.');
    }
  } catch (err) {
    console.error('Accounts migration failed:', err.message);
  }
}

module.exports = { migrateLegacyUsers };
