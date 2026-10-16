const mongoose = require('mongoose');

/**
 * The whole "Sustainability" page as one editable document: a hero (with an
 * optional background video), an intro blurb, and a list of alternating
 * image + copy feature rows (image swaps side automatically by position).
 */
const FeatureItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  heading: { type: String, default: '' },
  body: { type: String, default: '' },
  buttonText: { type: String, default: '' },
  buttonUrl: { type: String, default: '' },
  image: { type: String, default: '' },
}, { _id: false });

const DEFAULT_ITEMS = [
  {
    id: 'green-options',
    heading: 'Green Options for Sustainable Lifestyle Shifts',
    body: 'We create modern retailing to address the needs and aspirations of the people we serve.',
    buttonText: 'Responsible Retail',
    buttonUrl: '',
    image: '',
  },
  {
    id: 'resilient-cities',
    heading: 'Sustainable and Resilient Integrated City Development Designs',
    body: 'We\u2019re shaping the future of urban living by creating eco-cities that turn second-tier towns into vibrant, sustainable hubs, with green spaces, walkable neighbourhoods, and smart design.',
    buttonText: 'Eco-Cities',
    buttonUrl: '',
    image: '',
  },
  {
    id: 'financial-inclusion',
    heading: 'Financial Inclusion, Job and Entrepreneurship Creation',
    body: 'We deliver a full range of banking and financing services to drive growth and financial inclusion.',
    buttonText: 'Sustainable Financing',
    buttonUrl: '',
    image: '',
  },
  {
    id: 'societal-wellbeing',
    heading: 'Societal Well-Being and Development',
    body: 'Wherever we operate, we help close social gaps by expanding access to education, healthcare, and livelihoods, and create space for careers to grow \u2014 with equal opportunity at the core of it all.',
    buttonText: 'People and Progress',
    buttonUrl: '',
    image: '',
  },
];

const SustainabilityPageSchema = new mongoose.Schema({
  // Hero
  heroHeading: { type: String, default: 'Building a Better Tomorrow' },
  heroSubtitle: {
    type: String,
    default: 'Our commitment to the environment, our people, and the communities we serve.',
  },
  heroImage: { type: String, default: '' },
  heroVideo: { type: String, default: '' }, // plays behind the hero instead of heroImage when set

  // Intro
  introHeading: { type: String, default: 'Purpose Beyond Profit' },
  introBody: {
    type: String,
    default:
      'At Sethmo Group, we believe that true market leadership is measured not just by financial returns, but by the positive impact we leave on the world. Our operations are deeply intertwined with sustainable practices, ensuring we protect our natural resources while driving economic growth.',
  },

  // Alternating feature rows (image swaps side automatically by position)
  items: { type: [FeatureItemSchema], default: undefined },
}, { timestamps: true });

SustainabilityPageSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({ items: DEFAULT_ITEMS });
  return doc;
};

module.exports = mongoose.model('SustainabilityPage', SustainabilityPageSchema);
