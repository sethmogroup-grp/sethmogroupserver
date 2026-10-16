const crypto = require('crypto');

// Stateless unsubscribe token: HMAC of the email. Nobody can unsubscribe someone else's address.
const unsubscribeToken = (email) =>
  crypto.createHmac('sha256', process.env.JWT_SECRET || '').update(`unsub:${String(email).toLowerCase()}`).digest('hex');

const verifyUnsubscribeToken = (email, token) => {
  const expected = Buffer.from(unsubscribeToken(email));
  const given = Buffer.from(String(token || ''));
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
};

// Public URL of THIS API (set API_PUBLIC_URL in .env, e.g. https://sethmogroup-backend.onrender.com)
const apiBase = () => (process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/+$/, '');

const unsubscribeUrl = (email) =>
  `${apiBase()}/api/newsletter-subscribers/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken(email)}`;

module.exports = { unsubscribeToken, verifyUnsubscribeToken, unsubscribeUrl };
