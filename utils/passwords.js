const crypto = require('crypto');

// 10+ characters with at least one letter and one number
function passwordProblem(pw) {
  if (typeof pw !== 'string' || pw.length < 10) return 'Password must be at least 10 characters long.';
  if (pw.length > 128) return 'Password is too long.';
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'Password must contain at least one letter and one number.';
  return null;
}

const sha256 = (v) => crypto.createHash('sha256').update(v).digest('hex');

// Returns { token, hash, expires }. Email the token; store only the hash.
function createResetToken(hours = 24) {
  const token = crypto.randomBytes(32).toString('hex');
  return { token, hash: sha256(token), expires: new Date(Date.now() + hours * 3600 * 1000) };
}

module.exports = { passwordProblem, sha256, createResetToken };
