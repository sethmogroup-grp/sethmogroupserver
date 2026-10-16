const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = require('../models/User');
const logActivity = require('../utils/logger');
const mailer = require('../utils/mailer');
const { requirePermission } = require('../middleware/auth');
const { createResetToken } = require('../utils/passwords');
const { signedIdImageUrl, deleteIdImage } = require('../utils/idImage');
const { sendInviteEmail, sendResetEmail, resetLink } = require('../utils/accountEmails');
const {
  ROLES, ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_PERMISSIONS, isValidRole,
} = require('../config/permissions');

const router = express.Router();
router.use(requirePermission('users:manage')); // Super Admin only (also enforced in accessPolicy)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const who = (req) => req.user.name || req.user.email;

const validId = (req, res, next) =>
  mongoose.isValidObjectId(req.params.id) ? next() : res.status(400).json({ error: 'Invalid user id' });

const activeSuperAdmins = () =>
  User.countDocuments({ role: ROLES.SUPER_ADMIN, isActive: true, status: 'active' });

// GET /api/users/roles - role catalogue for the "Add user" form
router.get('/roles', (req, res) => {
  res.json(Object.values(ROLES).map((r) => ({
    value: r, label: ROLE_LABELS[r], description: ROLE_DESCRIPTIONS[r], permissions: ROLE_PERMISSIONS[r],
  })));
});

// GET /api/users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: 1 });
    res.json(users.map((u) => u.toSafeJSON()));
  } catch (err) {
    res.status(500).json({ error: 'Could not load users.' });
  }
});

// POST /api/users   { name, email, role }  -> creates the account and emails an invitation
router.post('/', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim().slice(0, 100);
    const email = String(req.body.email || '').trim().toLowerCase();
    const role = req.body.role;

    if (!name) return res.status(400).json({ error: 'Please enter the person\'s full name.' });
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
    if (!isValidRole(role)) return res.status(400).json({ error: 'Please choose a valid role.' });
    if (await User.findOne({ $or: [{ email }, { username: email }] })) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const { token, hash, expires } = createResetToken(72);
    const user = await User.create({
      username: email,
      email,
      name,
      role,
      status: 'invited',
      // nobody knows this; the owner chooses their own through the invitation link
      password: crypto.randomBytes(32).toString('hex'),
      passwordResetToken: hash,
      passwordResetExpires: expires,
      createdBy: who(req),
    });

    let emailSent = false;
    let emailError = '';
    if (mailer.isConfigured()) {
      try { await sendInviteEmail(user, token, who(req)); emailSent = true; }
      catch (e) { emailError = e.message; }
    } else {
      emailError = 'Email is not configured on the server.';
    }

    await logActivity(`Created ${ROLE_LABELS[role]} account for ${name}`, 'Users', who(req));
    res.status(201).json({
      user: user.toSafeJSON(),
      emailSent,
      emailError,
      // Shown to the Super Admin only so the link can be shared by hand if email is unavailable
      inviteLink: emailSent ? undefined : resetLink(token),
    });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Could not create the user.' });
  }
});

// PATCH /api/users/:id   { name?, role?, isActive? }
router.patch('/:id', validId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const isSelf = String(user._id) === String(req.user._id);
    const { name, role, isActive } = req.body;
    let sessionsMustEnd = false;

    if (name !== undefined) {
      const n = String(name).trim().slice(0, 100);
      if (!n) return res.status(400).json({ error: 'Name cannot be empty.' });
      user.name = n;
    }

    if (role !== undefined && role !== user.role) {
      if (!isValidRole(role)) return res.status(400).json({ error: 'Invalid role.' });
      if (isSelf) return res.status(400).json({ error: 'You cannot change your own role.' });
      if (user.role === ROLES.SUPER_ADMIN && (await activeSuperAdmins()) <= 1) {
        return res.status(400).json({ error: 'There must always be at least one active Super Admin.' });
      }
      await logActivity(`Changed role of ${user.name || user.email}: ${ROLE_LABELS[user.role]} to ${ROLE_LABELS[role]}`, 'Users', who(req));
      user.role = role;
      sessionsMustEnd = true;
    }

    if (isActive !== undefined && Boolean(isActive) !== user.isActive) {
      if (isSelf) return res.status(400).json({ error: 'You cannot deactivate your own account.' });
      if (!isActive && user.role === ROLES.SUPER_ADMIN && (await activeSuperAdmins()) <= 1) {
        return res.status(400).json({ error: 'There must always be at least one active Super Admin.' });
      }
      user.isActive = Boolean(isActive);
      sessionsMustEnd = true;
      await logActivity(`${user.isActive ? 'Re-activated' : 'Deactivated'} account of ${user.name || user.email}`, 'Users', who(req));
    }

    if (sessionsMustEnd) user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();
    res.json(user.toSafeJSON());
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Could not update the user.' });
  }
});

// POST /api/users/:id/send-link - (re)send the invitation (invited users) or a password reset (active users)
router.post('/:id/send-link', validId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const invited = user.status === 'invited';
    const { token, hash, expires } = createResetToken(invited ? 72 : 1);
    user.passwordResetToken = hash;
    user.passwordResetExpires = expires;
    await user.save();

    let emailSent = false;
    let emailError = '';
    if (mailer.isConfigured()) {
      try {
        if (invited) await sendInviteEmail(user, token, who(req));
        else await sendResetEmail(user, token);
        emailSent = true;
      } catch (e) { emailError = e.message; }
    } else {
      emailError = 'Email is not configured on the server.';
    }

    await logActivity(`Sent ${invited ? 'invitation' : 'password reset'} link to ${user.name || user.email}`, 'Users', who(req));
    res.json({ emailSent, emailError, link: emailSent ? undefined : resetLink(token) });
  } catch (err) {
    console.error('Send link error:', err);
    res.status(500).json({ error: 'Could not send the link.' });
  }
});

// GET /api/users/:id/id-image - Super Admin views a staff member's ID (logged)
router.get('/:id/id-image', validId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const id = user.idImage && user.idImage.publicId;
    if (!id) return res.status(404).json({ error: 'This user has not uploaded an ID yet.' });
    await logActivity(`Viewed ID image of ${user.name || user.email}`, 'Users', who(req));
    res.json({ url: signedIdImageUrl(id), uploadedAt: user.idImage.uploadedAt });
  } catch (err) {
    res.status(500).json({ error: 'Could not load the ID image.' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', validId, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (String(user._id) === String(req.user._id)) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }
    if (user.role === ROLES.SUPER_ADMIN && user.isActive && (await activeSuperAdmins()) <= 1) {
      return res.status(400).json({ error: 'There must always be at least one active Super Admin.' });
    }
    await deleteIdImage(user.idImage && user.idImage.publicId);
    await user.deleteOne();
    await logActivity(`Deleted account of ${user.name || user.email}`, 'Users', who(req));
    res.json({ success: true });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Could not delete the user.' });
  }
});

module.exports = router;
