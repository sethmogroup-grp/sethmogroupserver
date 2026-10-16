const mongoose = require('mongoose');

const FocusItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, default: '' },
  image: { type: String, default: '' },
  link: { type: String, default: '' },
}, { _id: false });

const DEFAULT_ITEMS = [
  { id: 'agriculture', label: 'Agriculture' },
  { id: 'manufacturing', label: 'Manufacturing' },
  { id: 'advertising', label: 'Advertising Agency' },
  { id: 'hospitality', label: 'Hospitality' },
  { id: 'transport', label: 'Transport and Logistics' },
  { id: 'printing', label: 'Commercial Printing' },
  { id: 'food', label: 'Food' },
  { id: 'mining', label: 'Mining' },
];

const BusinessFocusSchema = new mongoose.Schema({
  title: { type: String, default: 'BUSINESS FOCUS' },
  description: {
    type: String,
    default:
      'As a diversified conglomerate, our presence across multiple industries reflects a deliberate commitment to our vision and mission: to make essential products, services, and solutions accessible to every household and individual. Through this diversified approach, we seek not only to meet everyday needs, but also to create opportunities, strengthen communities, and contribute meaningfully to the growth of our economy.',
  },
  autoplay: { type: Boolean, default: true },
  speedSeconds: { type: Number, default: 4, min: 1, max: 30 }, // seconds between each step of the 3D loop (bigger = slower)
  items: { type: [FocusItemSchema], default: undefined },
}, { timestamps: true });

BusinessFocusSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({ items: DEFAULT_ITEMS });
  return doc;
};

module.exports = mongoose.model('BusinessFocus', BusinessFocusSchema);
