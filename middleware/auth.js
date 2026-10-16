const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { roleHas } = require('../config/permissions');

/**
 * Reads "Authorization: Bearer <token>", verifies it, then loads the user from the database
 * on every request. That means deleting a user, deactivating them, or changing their role
 * takes effect immediately - an old token cannot keep working.
 */
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token) return res.status(401).json({ error: 'Please log in to continue.' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
    }

    const user = await User.findById(payload.id);
    if (!user || !user.isActive || user.status !== 'active') {
      return res.status(401).json({ error: 'This account is no longer active.' });
    }
    if ((payload.tv || 0) !== (user.tokenVersion || 0)) {
      return res.status(401).json({ error: 'Your session has ended. Please log in again.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Authentication error.' });
  }
}

/** Use after authenticate(): allow only users whose role holds ALL listed permissions. */
const requirePermission = (...permissions) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Please log in to continue.' });
  const ok = permissions.every((p) => roleHas(req.user.role, p));
  if (!ok) return res.status(403).json({ error: 'You do not have permission to do this.' });
  next();
};

const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, tv: user.tokenVersion || 0 },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '12h' }
  );

module.exports = { authenticate, requirePermission, signToken };
