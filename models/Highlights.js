const mongoose = require('mongoose');

/**
 * "Sethmo Highlights And Latest Updates" grid, shown under the Press Releases / News banner.
 * `size` decides the layout: 'report' = the small top-row cards (image, then a white footer
 * with heading/subheading/year and an arrow button). 'feature' = the larger cards below
 * (image/photo, a coloured panel of text on the card, and a caption + button underneath it).
 */
const HighlightItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  size: { type: String, enum: ['report', 'feature'], default: 'report' },
  image: { type: String, default: '' },

  // report cards
  heading: { type: String, default: '' },     // bold line in the white footer, e.g. "Group Subsidiaries"
  subheading: { type: String, default: '' },  // regular line under it, e.g. "Sethmo Group Integrated Report"
  year: { type: String, default: '' },        // e.g. "2026"

  // feature cards
  panelColor: { type: String, default: '#272f4d' },
  panelHeading: { type: String, default: '' },   // big heading on the card, e.g. "Behind the Growth"
  panelSubheading: { type: String, default: '' }, // small line under it, e.g. "The People Behind the Impact"
  personName: { type: String, default: '' },     // optional name bar, e.g. "Joel Mwiba"
  personRole: { type: String, default: '' },     // e.g. "Non Executive Director"
  caption: { type: String, default: '' },        // paragraph shown under the card
  captionButtonText: { type: String, default: 'Read More' },

  buttonUrl: { type: String, default: '' },
}, { _id: false });

const DEFAULT_ITEMS = [
  {
    id: 'integrated-report', size: 'report',
    heading: 'Group Subsidiaries', subheading: 'Sethmo Group Integrated Report', year: '2026',
  },
  {
    id: 'sustainability-report', size: 'report',
    heading: 'Sustainability', subheading: 'Sethmo Group Sustainability Report', year: '2026',
  },
  {
    id: 'product-launch', size: 'report',
    heading: 'Upcoming Product Launch', subheading: 'Our products set to be Launched', year: '2027',
  },
  {
    id: 'investor-relations', size: 'report',
    heading: 'Investors Relations', subheading: 'Sethmo Group Investor Relations Report', year: '2026',
  },
  {
    id: 'behind-growth', size: 'feature', panelColor: '#1c2340',
    panelHeading: 'Behind the Growth', panelSubheading: 'The People Behind the Impact',
    caption: 'Behind every product we create, every service we deliver, and every experience we strive to make better, there are people who make it possible.',
    captionButtonText: 'Read More',
  },
  {
    id: 'executive-appointment', size: 'feature', panelColor: '#2c5c73',
    panelHeading: 'Executive Appointment',
    panelSubheading: 'The Board and Management of Sethmo Group are pleased to announce the appointment of Mr Joel Mwiba as our Non Executive Director. This appointment reflects our commitment to strengthening the Group\u2019s leadership, governance, and strategic decision making.',
    personName: 'Joel Mwiba', personRole: 'Non Executive Director',
    caption: 'Appointments and Changes in Management During the Year',
    captionButtonText: 'Read More',
  },
  {
    id: 'vision-2027', size: 'feature', panelColor: '#ffffff',
    panelHeading: 'Sethmo Group Launches Vision 2027',
    panelSubheading: 'Be Part of the race to modern independence in Zambia\u2019s industrial & Business Sectors',
    caption: 'Want to learn more about the Vision 2027? Click the below button to learn more and be part of the Race.',
    captionButtonText: 'Read More',
  },
];

const HighlightsSchema = new mongoose.Schema({
  title: { type: String, default: 'Sethmo Highlights And Latest Updates' },
  items: { type: [HighlightItemSchema], default: undefined },
}, { timestamps: true });

HighlightsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({ items: DEFAULT_ITEMS });
  return doc;
};

module.exports = mongoose.model('Highlights', HighlightsSchema);
