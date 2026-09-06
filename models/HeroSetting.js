// S:\sethmo\sethmo-server\models\HeroSetting.js
const mongoose = require('mongoose');

const HeroSettingSchema = new mongoose.Schema({
  mediaType: {
    type: String,
    enum: ['video', 'image'],
    required: true,
    default: 'video'
  },
  videoUrl: {
    type: String,
    default: ''
  },
  imageUrl: {
    type: String,
    default: ''
  },
  button1Text: {
    type: String,
    default: 'Explore Our Sectors'
  },
  button1Link: {
    type: String,
    default: '/services'
  },
  button2Text: {
    type: String,
    default: 'Partner With Us'
  },
  button2Link: {
    type: String,
    default: '/contact'
  },
  overlayColor: {
    type: String,
    default: 'linear-gradient(to bottom, rgba(4,64,102,0.2), rgba(4,64,102,0.8))'
  }
}, { timestamps: true });

// Ensure only one document exists (singleton pattern)
HeroSettingSchema.statics.getSingleton = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({}); // creates with defaults
  }
  return settings;
};

module.exports = mongoose.model('HeroSetting', HeroSettingSchema);