const mongoose = require('mongoose');

/**
 * "OUR FOOTPRINT | OUR VISION | OUR MISSION" looping tabbed banner.
 * Each slide keeps its own layout (footprint / vision / mission) - the admin edits
 * the words, colours and pictures, the layout itself is fixed by `id`.
 */
const SlideSchema = new mongoose.Schema({
  id: { type: String, enum: ['footprint', 'vision', 'mission'], required: true },
  tabLabel: { type: String, default: '' },
  heading: { type: String, default: '' },
  subheading: { type: String, default: '' },
  quote: { type: String, default: '' },
  body: { type: String, default: '' },
  buttonText: { type: String, default: '' },
  buttonUrl: { type: String, default: '' },
  panelColor: { type: String, default: '' },
  photo: { type: String, default: '' },      // rounded photo on the card
  sideImage: { type: String, default: '' },  // footprint: map | vision: person cut-out | mission: flag
}, { _id: false });

const DEFAULT_SLIDES = [
  {
    id: 'footprint',
    tabLabel: 'OUR FOOTPRINT',
    heading: 'OUR FOOTPRINT',
    subheading: 'From local presence to regional ambition.',
    body: 'Sethmo Group is building a diversified business footprint designed to connect industries, serve growing markets, and create value across the economy.',
    buttonText: 'Read More',
    buttonUrl: '/about',
    panelColor: '#f58a35',
  },
  {
    id: 'vision',
    tabLabel: 'OUR VISION',
    heading: 'OUR VISION',
    quote: '\u201COur vision is as clear as day light\u201D',
    body: 'To be a world-class enterprise and a trusted household name, delivering essential services and manufacturing solutions that enhance quality of life, create sustainable value, and generate strong returns for our clients and stakeholders through our Subsidiaries.',
    panelColor: '#272f4d',
  },
  {
    id: 'mission',
    tabLabel: 'OUR MISSION',
    heading: 'OUR MISSION',
    body: 'To positively touch lives by providing essential needs through high-quality services, Product and manufacturing, while sustaining and strengthening our market leadership across branding, agribusiness, manufacturing, printing, hospitality, shipping, and mining. Driven by innovation, excellence, and customer focus, we remain proudly Inspired By You',
    panelColor: '#6d6e70',
  },
];

const FootprintTabsSchema = new mongoose.Schema({
  autoplay: { type: Boolean, default: true },
  intervalSeconds: { type: Number, default: 7, min: 2, max: 60 }, // time each tab stays on screen
  slides: { type: [SlideSchema], default: undefined },
}, { timestamps: true });

FootprintTabsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({ slides: DEFAULT_SLIDES });
  return doc;
};

module.exports = mongoose.model('FootprintTabs', FootprintTabsSchema);
