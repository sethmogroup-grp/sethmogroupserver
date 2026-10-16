const mongoose = require('mongoose');

const CustomerCentricSchema = new mongoose.Schema({
  heading: { type: String, default: 'Our Brands. Centered on You.' },
  // Blank line = new paragraph. Single line breaks are kept.
  body: {
    type: String,
    default:
      'At Sethmo Group, every brand begins with one simple belief: you matter.\n' +
      'Our businesses, products, services, and innovations are shaped around the people and communities we serve. We listen, we understand, and we continually evolve to create solutions that are relevant, meaningful, and built around real needs.\n\n' +
      'From the way we develop our brands to the way we deliver our products and services, you remain at the center of what we do.\n\n' +
      'Because we are not simply building companies. We are building brands inspired by the people who trust us, work with us, and grow with us.\n' +
      'Sethmo Group. Inspired By You.',
  },
  buttonText: { type: String, default: 'Read More' },
  buttonUrl: { type: String, default: '/about' },
  personImage: { type: String, default: '' }, // transparent cut-out on the left
  sideImage: { type: String, default: '' },   // photo on the right
}, { timestamps: true });

CustomerCentricSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({});
  return doc;
};

module.exports = mongoose.model('CustomerCentric', CustomerCentricSchema);
