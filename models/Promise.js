const mongoose = require('mongoose');

const PromiseItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  line1: { type: String, default: '' }, // e.g. "To be Honest"
  line2: { type: String, default: '' }, // e.g. "always." (bold line)
  image: { type: String, default: '' }  // URL from Cloudinary
}, { _id: false });

const PromiseSectionSchema = new mongoose.Schema({
  titleTop: {
    type: String,
    default: 'SETHMO GROUP'
  },
  titleBottom: {
    type: String,
    default: 'promises'
  },
  sectionSubtitle: {
    type: String,
    default: 'Driven by our motto Inspired By You, our excellence and a commitment to quality, we combine industry expertise with modern technology to create value for our clients, partners, and communities.'
  },
  promises: [PromiseItemSchema]
}, { timestamps: true });

PromiseSectionSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({ promises: [] });
  }
  return settings;
};

module.exports = mongoose.model('PromiseSection', PromiseSectionSchema);
