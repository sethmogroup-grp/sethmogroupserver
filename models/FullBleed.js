const mongoose = require('mongoose');

const FullBleedSchema = new mongoose.Schema({
  image: { type: String, default: '' }, // URL from Cloudinary, fills edge-to-edge
  eyebrow: { type: String, default: '' },
  title: { type: String, default: '' },
  linkText: { type: String, default: '' },
  linkUrl: { type: String, default: '' }
}, { timestamps: true });

FullBleedSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('FullBleed', FullBleedSchema);
