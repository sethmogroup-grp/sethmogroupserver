const mongoose = require('mongoose');

const PillarItemSchema = new mongoose.Schema({
  id: String,
  title: String,
  desc: String,
  image: String
}, { _id: false }); // Stops Mongoose from overriding your string IDs

const PillarSchema = new mongoose.Schema({
  pillars: [PillarItemSchema]
}, { timestamps: true });

// Ensure this specific static method exists!
PillarSchema.statics.getSingleton = async function() {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({ pillars: [] });
  }
  return doc;
};

module.exports = mongoose.model('Pillar', PillarSchema);