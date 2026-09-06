const mongoose = require('mongoose');

const CommunitySettingsSchema = new mongoose.Schema({
  heroTitle: { type: String, default: "Community & Insights" },
  heroSubtext: String,
  impactHeading: String,
  impactBody1: String,
  impactBody2: String,
  projectsLink: { type: String, default: "/projects" },
  impactImage: String
}, { timestamps: true });

// Singleton Pattern
CommunitySettingsSchema.statics.getSingleton = async function() {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({});
  return doc;
};

module.exports = mongoose.model('CommunitySettings', CommunitySettingsSchema);