const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  companyEmail: { type: String, default: 'info@sethmogroup.com' },
  contactPhone: { type: String, default: '+260972276257' },
  officeAddress: { type: String, default: 'Lusaka, Zambia' },
  socialLinks: {
    linkedin: { type: String, default: '' },
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' }
  },
  siteTitle: { type: String, default: 'Sethmo Group' },
  seoDescription: { type: String, default: 'Leading Pan-African Conglomerate' }
}, { timestamps: true });

// CRITICAL: This allows the route to fetch data without a specific ID
SettingsSchema.statics.getSingleton = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', SettingsSchema);