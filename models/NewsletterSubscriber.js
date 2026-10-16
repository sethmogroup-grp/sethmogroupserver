const mongoose = require('mongoose');

const NewsletterSubscriberSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  // Set when the person clicks "unsubscribe" in a newsletter. We keep the row so they are
  // not emailed again, and so a later re-subscribe simply switches it back.
  unsubscribed: { type: Boolean, default: false, index: true },
  unsubscribedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('NewsletterSubscriber', NewsletterSubscriberSchema);
