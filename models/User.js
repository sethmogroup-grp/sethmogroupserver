const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES, isValidRole } = require('../config/permissions');

/**
 * Admin-panel account.
 *  - `username` is kept (and always equals `email`) so accounts created before RBAC keep working.
 *  - `role` decides what the account may do (see config/permissions.js).
 *  - ID image: the file lives in Cloudinary as a private ("authenticated") asset; only its
 *    public id is stored here and a signed link is generated on request.
 */
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, lowercase: true, trim: true },
  email: { type: String, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, select: false },

  name: { type: String, trim: true, default: '' },
  role: {
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.SUPPORT_AGENT, // least privilege if a role is ever missing
    validate: { validator: isValidRole, message: 'Invalid role' },
  },
  isActive: { type: Boolean, default: true },

  // "invited" = the account exists but its owner has not chosen a password yet
  status: { type: String, enum: ['invited', 'active'], default: 'active' },

  idImage: {
    publicId: { type: String, default: '' },
    uploadedAt: { type: Date },
  },

  // Bumping this signs the user out of every device (password change, role change, deactivation)
  tokenVersion: { type: Number, default: 0 },

  // Brute-force protection
  failedLoginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },

  // Set-password / forgot-password link. Only the SHA-256 hash is stored.
  passwordResetToken: { type: String, select: false },
  passwordResetExpires: { type: Date, select: false },

  lastLoginAt: { type: Date },
  createdBy: { type: String, default: '' },
}, { timestamps: true });

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

UserSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// What is safe to send to a browser
UserSchema.methods.toSafeJSON = function () {
  return {
    id: String(this._id),
    name: this.name || '',
    email: this.email || this.username,
    role: this.role,
    isActive: this.isActive,
    status: this.status,
    hasIdImage: !!(this.idImage && this.idImage.publicId),
    idUploadedAt: this.idImage && this.idImage.uploadedAt ? this.idImage.uploadedAt : null,
    lastLoginAt: this.lastLoginAt || null,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', UserSchema);
