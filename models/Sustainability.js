const mongoose = require('mongoose');

const FocusAreaSchema = new mongoose.Schema({
  id: Number,
  title: String,
  desc: String,
  icon: String
});

const SustainabilitySchema = new mongoose.Schema({
  focusAreas: [FocusAreaSchema]
}, { timestamps: true });

SustainabilitySchema.statics.getSingleton = async function() {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({ focusAreas: [] });
  }
  return doc;
};

module.exports = mongoose.model('Sustainability', SustainabilitySchema);