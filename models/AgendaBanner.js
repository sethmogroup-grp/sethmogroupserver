const mongoose = require('mongoose');

/**
 * "Sustainability Agenda 2037" banner at the bottom of
 * "Sethmo Highlights And Latest Updates" on the home page.
 * Empty picture fields fall back to the artwork bundled with the website.
 */
const PillarSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, default: '' },
}, { _id: false });

const DEFAULT_PILLARS = [
  'People & Opportunity',
  'Environmental Responsibility',
  'Responsible Production & Circular',
  'EconomyCommunities & Zambia',
  'Responsible Business & Governance',
  'Innovation & Sustainable Growth',
].map((text, i) => ({ id: `p${i + 1}`, text }));

const AgendaBannerSchema = new mongoose.Schema({
  eyebrow: { type: String, default: 'Sustainability Agenda 2037' },
  heading: { type: String, default: 'Building\nBusinesses.\nSustaining People.\nGrowing Zambia.' },
  buttonText: { type: String, default: 'Read More' },
  buttonUrl: { type: String, default: '/sustainability' },

  intro: {
    type: String,
    default:
      'At Sethmo Group, we believe that growth\nshould create value not only for our\nbusinesses, but also for our people, our\ncommunities, our country and future\ngenerations.',
  },
  lead: { type: String, default: 'Our sustainability agenda is built around a\nsimple principle:' },
  quote: { type: String, default: 'To grow responsibly today while creating\na stronger tomorrow.' },
  pillarsTitle: { type: String, default: 'Our 6 Sustainable Pillars are:' },
  pillars: { type: [PillarSchema], default: undefined },

  visionHeading: { type: String, default: 'Vision 2037' },
  visionLogo: { type: String, default: '' },
  personImage: { type: String, default: '' },
  statBig: { type: String, default: '15+' },
  statText: { type: String, default: 'Subsidiaries\nGrowth' },
}, { timestamps: true });

AgendaBannerSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({ pillars: DEFAULT_PILLARS });
  return doc;
};

module.exports = mongoose.model('AgendaBanner', AgendaBannerSchema);
