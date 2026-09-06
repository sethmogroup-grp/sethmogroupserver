const mongoose = require('mongoose');

const SectorItemSchema = new mongoose.Schema({
  slug: String,
  title: String,
  description: String,
  image: String,
  details: String
});

const SectorSchema = new mongoose.Schema({
  sectors: [SectorItemSchema]
});

SectorSchema.statics.getSingleton = async function() {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({ sectors: [] });
  return doc;
};

module.exports = mongoose.model('Sector', SectorSchema);