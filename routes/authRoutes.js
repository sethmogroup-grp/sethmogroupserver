const express = require('express');
const multer = require('multer');
const User = require('../models/User');
const logActivity = require('../utils/logger');
const rateLimit = require('../middleware/rateLimit');
const { signToken } = require('../middleware/auth');
const { passwordProblem, sha256, createResetToken } = require('../utils/passwords');
const { uploadIdImage, signedIdImageUrl, deleteIdImage } = require('../utils/idImage');
const { sendResetEmail } = require('../utils/accountEmails');
const mailer = require('../utils/mailer');
const { permissionsFor, ROLE_LABELS, ROLE_DESCRIPTIONS } = require('../config/permissions');

const router = express.Router();

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

// What the admin panel stores after login / refreshes with GET /me
const sessionPayload = (user) => ({
  user: {
    ...user.toSafeJSON(),
    roleLabel: ROLE_LABELS[user.role],
    roleDescription: ROLE_DESCRIPTIONS[user.role],
    permissions: permissionsFor(user.role),
  },
});

// Every route below the public ones needs the user that accessPolicy attached
const needUser = (req, res, next) =>
  req.user ? next() : res.status(401).json({ error: 'Please log in to continue.' });

const idUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, cb) =>
    ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Please upload a JPG, PNG or WEBP image.')),
});

/* ================= PUBLIC ================= */

// POST /api/auth/login   { email | username, password }
router.post(
  '/login',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    keyFn: (req) => `${req.ip}|${String(req.body.email || req.body.username || '').toLowerCase()}`,
    message: 'Too many login attempts. Please wait a few minutes and try again.',
  }),
  async (req, res) => {
    const identifier = String(req.body.email || req.body.username || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const invalid = () => res.status(400).json({ error: 'Invalid email or password.' });

    try {
      if (!identifier || !password) return invalid();

      const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] }).select('+password');
      if (!user) return invalid();

      if (user.isLocked()) {
        return res.status(423).json({ error: 'This account is temporarily locked after too many failed attempts. Try again in a few minutes.' });
      }

      const ok = await user.comparePassword(password);
      if (!ok) {
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        if (user.failedLoginAttempts >= MAX_FAILED) {
          user.lockUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
          user.failedLoginAttempts = 0;
        }
        await user.save();
        return invalid();
      }

      if (user.status !== 'active') {
        return res.status(403).json({ error: 'Please use the link in your invitation email to set your password first.' });
      }
      if (!user.isActive) {
        return res.status(403).json({ error: 'This account has been deactivated. Contact the Super Admin.' });
      }

      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;
      user.lastLoginAt = new Date();
      if (!user.email) user.email = user.username; // accounts created before RBAC
      await user.save();

      res.json({ token: signToken(user), ...sessionPayload(user) });
    } catch (err) {
      console.error('Login Error:', err);
      res.status(500).json({ error: 'Server error during login' });
    }
  }
);

// POST /api/auth/forgot-password   { email }  - always answers the same, so emails can't be guessed
router.post(
  '/forgot-password',
  rateLimit({ windowMs: 60 * 60 * 1000, max: 8, message: 'Too many requests. Please try again later.' }),
  async (req, res) => {
    const generic = { message: 'If that email belongs to an account, a reset link is on its way.' };
    try {
      const email = String(req.body.email || '').trim().toLowerCase();
      const user = email && (await User.findOne({ $or: [{ email }, { username: email }] }));
      if (user && user.isActive && mailer.isConfigured()) {
        const { token, hash, expires } = createResetToken(1);
        user.passwordResetToken = hash;
        user.passwordResetExpires = expires;
        await user.save();
        try { await sendResetEmail(user, token); }
        catch (e) { console.error('Reset email failed:', e.message); }
      }
      res.json(generic);
    } catch (err) {
      console.error('Forgot password error:', err);
      res.json(generic);
    }
  }
);

// POST /api/auth/reset-password   { token, password }  - also used to accept an invitation
router.post(
  '/reset-password',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }),
  async (req, res) => {
    try {
      const token = String(req.body.token || '');
      const password = String(req.body.password || '');
      const problem = passwordProblem(password);
      if (problem) return res.status(400).json({ error: problem });
      if (!token) return res.status(400).json({ error: 'This link is not valid.' });

      const user = await User.findOne({
        passwordResetToken: sha256(token),
        passwordResetExpires: { $gt: new Date() },
      }).select('+password +passwordResetToken +passwordResetExpires');

      if (!user) return res.status(400).json({ error: 'This link is invalid or has expired. Ask for a new one.' });

      const wasInvited = user.status === 'invited';
      user.password = password;
      user.status = 'active';
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;
      user.tokenVersion = (user.tokenVersion || 0) + 1; // signs out any old sessions
      await user.save();

      await logActivity(wasInvited ? 'Activated account' : 'Reset password', 'Accounts', user.name || user.email);
      res.json({ message: 'Password saved. You can log in now.' });
    } catch (err) {
      console.error('Reset password error:', err);
      res.status(500).json({ error: 'Could not save the password.' });
    }
  }
);

/* ================= LOGGED-IN (any role) ================= */

// GET /api/auth/me - used by the panel to refresh role & permissions
router.get('/me', needUser, (req, res) => res.json(sessionPayload(req.user)));

// PATCH /api/auth/me   { name }
router.patch('/me', needUser, async (req, res) => {
  try {
    const name = String(req.body.name || '').trim().slice(0, 100);
    if (!name) return res.status(400).json({ error: 'Name cannot be empty.' });
    req.user.name = name;
    await req.user.save();
    res.json(sessionPayload(req.user));
  } catch (err) {
    res.status(500).json({ error: 'Could not update your profile.' });
  }
});

// POST /api/auth/change-password   { currentPassword, newPassword }  - changes the LOGGED-IN user's password
router.post(
  '/change-password',
  needUser,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10, keyFn: (req) => req.ip }),
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user._id).select('+password');
      if (!(await user.comparePassword(String(currentPassword || '')))) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
      const problem = passwordProblem(String(newPassword || ''));
      if (problem) return res.status(400).json({ error: problem });

      user.password = newPassword;
      user.tokenVersion = (user.tokenVersion || 0) + 1; // other devices are signed out
      await user.save();

      await logActivity('Changed own password', 'Accounts', user.name || user.email);
      // new token so THIS session keeps working
      res.json({ message: 'Password updated successfully', token: signToken(user) });
    } catch (err) {
      console.error('Password Change Error:', err);
      res.status(500).json({ error: 'Server error during password update' });
    }
  }
);

// ---- ID image (own) ----
router.get('/me/id-image', needUser, (req, res) => {
  const id = req.user.idImage && req.user.idImage.publicId;
  if (!id) return res.status(404).json({ error: 'No ID image uploaded yet.' });
  res.json({ url: signedIdImageUrl(id), uploadedAt: req.user.idImage.uploadedAt });
});

router.post('/me/id-image', needUser, (req, res) => {
  idUpload.single('file')(req, res, async (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'The image is too large. Maximum size is 5 MB.' : err.message;
      return res.status(400).json({ error: msg });
    }
    if (!req.file) return res.status(400).json({ error: 'Please choose an image first.' });

    try {
      const result = await uploadIdImage(req.file.buffer, req.user._id);
      const oldId = req.user.idImage && req.user.idImage.publicId;

      req.user.idImage = { publicId: result.public_id, uploadedAt: new Date() };
      await req.user.save();
      if (oldId) await deleteIdImage(oldId); // replace, don't pile up

      await logActivity('Uploaded ID image', 'Accounts', req.user.name || req.user.email);
      res.json({ ...sessionPayload(req.user), url: signedIdImageUrl(result.public_id) });
    } catch (e) {
      console.error('ID upload error:', e);
      res.status(500).json({ error: 'Upload failed. Please try again.' });
    }
  });
});

router.delete('/me/id-image', needUser, async (req, res) => {
  try {
    const oldId = req.user.idImage && req.user.idImage.publicId;
    if (!oldId) return res.json(sessionPayload(req.user));
    req.user.idImage = { publicId: '' };
    await req.user.save();
    await deleteIdImage(oldId);
    await logActivity('Removed ID image', 'Accounts', req.user.name || req.user.email);
    res.json(sessionPayload(req.user));
  } catch (err) {
    res.status(500).json({ error: 'Could not remove the image.' });
  }
});

module.exports = router;
