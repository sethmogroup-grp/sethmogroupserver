const mongoose = require('mongoose');

/**
 * One document = one page view on the public website.
 * No raw IP addresses or personal data are stored - visitors are identified
 * only by a random id generated in their own browser.
 */
const VisitSchema = new mongoose.Schema(
  {
    visitorId: { type: String, required: true, index: true }, // random id kept in the visitor's browser
    sessionId: { type: String, required: true },               // one per browser tab session
    newVisitor: { type: Boolean, default: false },                  // first time this browser was ever seen
    path: { type: String, default: '/' },
    referrerHost: { type: String, default: '' },               // '' = direct visit
    device: { type: String, enum: ['Desktop', 'Mobile', 'Tablet'], default: 'Desktop' },
    browser: { type: String, default: 'Other' },
    os: { type: String, default: 'Other' },
    country: { type: String, default: '' },                    // ISO code e.g. "ZM"
    timezone: { type: String, default: '' },
    language: { type: String, default: '' },
    duration: { type: Number, default: 0 },                    // seconds actively spent on this page
    maxScroll: { type: Number, default: 0 },                   // 0-100 (% of page scrolled)
    engaged: { type: Boolean, default: false },                // >= 10s on page OR scrolled >= 50%
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

VisitSchema.index({ createdAt: -1 });
// Keep 13 months of history, then Mongo removes old rows automatically
VisitSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 400 });

module.exports = mongoose.model('Visit', VisitSchema);
