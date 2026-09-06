const mongoose = require('mongoose');

const AboutSchema = new mongoose.Schema({
  summaryTitle: { type: String, default: '' },
  summaryText1: { type: String, default: '' },
  summaryText2: { type: String, default: '' }
}, { timestamps: true });

AboutSchema.statics.getSingleton = async function() {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({});
  }
  return doc;
};

module.exports = mongoose.model('About', AboutSchema);