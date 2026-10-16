const mongoose = require('mongoose');

// One document per newsletter that was sent from the admin panel
const NewsletterCampaignSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  headline: { type: String, default: '' },
  body: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  buttonText: { type: String, default: '' },
  buttonUrl: { type: String, default: '' },

  sentBy: { userId: String, name: String, email: String, role: String },

  status: { type: String, enum: ['sending', 'sent', 'partial', 'failed'], default: 'sending', index: true },
  total: { type: Number, default: 0 },
  sent: { type: Number, default: 0 },
  failed: { type: Number, default: 0 },
  failedEmails: { type: [String], default: [] }, // first 50 only
  startedAt: { type: Date, default: Date.now },
  finishedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('NewsletterCampaign', NewsletterCampaignSchema);
