const mongoose = require('mongoose');

const SubsidiaryItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, default: '' },
  logo: { type: String, default: '' },
  link: { type: String, default: '' },
}, { _id: false });

// Order matters: it decides which spot around the Sethmo Group logo each company gets.
const DEFAULT_ITEMS = [
  { id: 'riel', name: 'Riel Electronics' },
  { id: 'brand', name: 'Sethmo Brand Consultancy' },
  { id: 'beverages', name: 'Sethmo Beverages' },
  { id: 'suriel', name: 'Suriel Maison Hotels' },
  { id: 'sethgold', name: 'Sethgold Printing Press' },
  { id: 'agro', name: 'Sethmo Agro Industries' },
  { id: 'cement', name: 'Sethmo Cement' },
  { id: 'pressx', name: 'Press X Embroidery' },
  { id: 'cargo', name: 'Sethmo Cargo Logistics' },
];

const SubsidiariesSectionSchema = new mongoose.Schema({
  title: { type: String, default: 'Sethmo Group, and its Subsidiaries' },
  hubLogo: { type: String, default: '' },
  items: { type: [SubsidiaryItemSchema], default: undefined },
}, { timestamps: true });

SubsidiariesSectionSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({ items: DEFAULT_ITEMS });
  return doc;
};

module.exports = mongoose.model('SubsidiariesSection', SubsidiariesSectionSchema);
