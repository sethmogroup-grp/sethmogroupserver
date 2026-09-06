const mongoose = require('mongoose');

const ExpertiseItemSchema = new mongoose.Schema({
  slug: { type: String, required: true }, // Added slug (e.g., 'agriculture')
  title: { type: String, required: true },
  description: { type: String, required: true }, // The short summary
  details: { type: String, default: '' }, // Added details (The long paragraph)
  image: { type: String, default: '' } 
}, { _id: false }); 

const ExpertiseSchema = new mongoose.Schema({
  sectionTitle: { type: String, default: 'Our Expertise' },
  sectionSubtitle: { type: String, default: 'Delivering world-class solutions across multiple industries.' },
  items: [ExpertiseItemSchema]
}, { timestamps: true });

ExpertiseSchema.statics.getSingleton = async function() {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({ items: [] });
  return doc;
};

module.exports = mongoose.model('Expertise', ExpertiseSchema);