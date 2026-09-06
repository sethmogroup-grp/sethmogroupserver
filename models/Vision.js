const mongoose = require('mongoose');

const VisionSchema = new mongoose.Schema({
  missionText: { type: String, default: '' },
  visionText: { type: String, default: '' },
  tagline: { type: String, default: '' },
  imageUrl: { type: String, default: '' }
}, { timestamps: true });

// Singleton pattern: ensure only one document
VisionSchema.statics.getSingleton = async function() {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({});
  }
  return doc;
};

module.exports = mongoose.model('Vision', VisionSchema);