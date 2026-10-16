const mongoose = require('mongoose');

const NewsBannerSchema = new mongoose.Schema({
  title: { type: String, default: 'Press Releases and News' },
  subtitle: { type: String, default: 'Recent News and Events' },
  linkText: { type: String, default: 'SEE ALL' },
  linkUrl: { type: String, default: '/news' }
}, { timestamps: true });

NewsBannerSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('NewsBanner', NewsBannerSchema);
