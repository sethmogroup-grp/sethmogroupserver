const mongoose = require('mongoose');

/**
 * Social Impact -> "The Goodness Programme" page (/social-impact/the-goodness-programme).
 * One document holds every word, picture and link on that page, in the order they appear:
 *   1. Hero            2. What do we do?      3. Why do we care? (+ signature)
 *   4. Gallery banner  5. Register block      6. Thapelo Foundation logo
 * An empty picture field means "use the picture the website was designed with".
 */
const ParagraphSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, default: '' },
}, { _id: false });

const SlideSchema = new mongoose.Schema({
  id: { type: String, required: true },
  image: { type: String, default: '' }, // empty = the picture the page was designed with
}, { _id: false });

const PanelSchema = new mongoose.Schema({
  id: { type: String, required: true },
  color: { type: String, default: '#1a7769' },
  label: { type: String, default: '' },       // optional words on the colour before it slides up
  title: { type: String, default: '' },
  text: { type: String, default: '' },
  buttonText: { type: String, default: 'Read More' },
  buttonUrl: { type: String, default: '' },   // empty = no button
}, { _id: false });

const THAPELO_PANELS = [
  { id: 'c1', color: '#1a7769', label: '', title: 'Giving', text: 'Reaching out to communities and people who are in need all around the world through giving.', buttonText: 'Read More', buttonUrl: '' },
  { id: 'c2', color: '#00aff0', label: '', title: 'Praying', text: 'Praying together and sharing love.', buttonText: 'Read More', buttonUrl: '' },
  { id: 'c3', color: '#3b141f', label: '', title: 'Caring', text: 'Showing love to humankind through caring for those who are in need.', buttonText: 'Read More', buttonUrl: '' },
];

const WHAT_PARAGRAPHS = [
  'We are The Goodness Program, a charitable initiative under the Thapelo Foundation, dedicated to supporting, caring for, and protecting the girl child from harm, abuse, and exploitation.',
  'Our core purpose is to safeguard the well-being of every girl in our country, ensuring that she has access to education, is treated with dignity and equality, and has the opportunity to build a brighter future. We stand for a world where no girl isleft behind, no child is subjected to abuse, and every girl is protected from early and forced marriage and teenage pregnancy.',
  'We believe that every girl deserves a voice, a chance to stand confidently on any stage, and the freedom to express herself with pride. Through awareness, education, advocacy, and community support, we seek to help girls recognise their worth, understand their rights, discover their potential, and believe in the power of their dreams.',
  'At The Goodness Program, we are committed to creating a future where every girl is safe, educated, valued, and empowered to shape her own destiny.',
].map((text, i) => ({ id: `w${i + 1}`, text }));

// **double asterisks** = bold on the website
const WHY_PARAGRAPHS = [
  'At The Goodness Program, we believe that every girl child is just as valuable, capable, and deserving of opportunity as every boy. Her safety, well-being, education, and dignity must never be treated as secondary priorities. They must be a shared responsibility of parents, families, communities, and society as a whole, including boys and men.',
  'We care because a girl is more than the circumstances she is born into or the challenges she faces. She carries wisdom, potential, courage, and the promise of a better tomorrow. She is the next generation of leaders, innovators, mothers, professionals, and change-makers who will help shape our communities and our nation.',
  '**She deserves to be protected, not limited; heard, not silenced; encouraged, not overlooked; and treasured, not taken for granted.**',
  'At The Goodness Program, we are committed to a future where every girl knows her worth, stands proudly in her identity, and has the opportunity to become everything she is capable of being. **Because when we protect her future, we strengthen the future of us all..**',
].map((text, i) => ({ id: `y${i + 1}`, text }));

const SocialImpactSchema = new mongoose.Schema({
  // 1. Hero
  heroImage: { type: String, default: '' },
  heroLogo: { type: String, default: '' },
  heroTitle: { type: String, default: 'THE GOODNESS PROGRAM' },
  heroSubtitle: { type: String, default: 'Supporting, caring & protecting the girl child from the harm of the world' },

  // 2. What do we do?
  whatWatermark: { type: String, default: '' },
  welcomeLine: { type: String, default: 'Hello there, and welcome to The Goodness Program!' },
  introText: {
    type: String,
    default: 'We would like to share how we make a difference through our charitable initiatives, powered by\nTHAPELO FOUNDATION and SETHMO GROUP.',
  },
  whatHeading: { type: String, default: 'What do we do?' },
  whatParagraphs: { type: [ParagraphSchema], default: undefined },

  // 3. Why do we care?
  whyHeading: { type: String, default: 'Why Do We Care?' },
  whyParagraphs: { type: [ParagraphSchema], default: undefined },
  signatureName: { type: String, default: 'Hope Chuungwe' },
  signatureRole: { type: String, default: 'Patrone' },
  signatureBadge: { type: String, default: 'The Goodness Program' },

  // 4. Gallery banner
  bannerImage: { type: String, default: '' },
  bannerLogo: { type: String, default: '' },
  galleryButtonText: { type: String, default: 'Explore our Gallery of events and girls we Support' },
  galleryButtonUrl: { type: String, default: '' },

  // 5. Register
  girlImage: { type: String, default: '' },
  registerText: {
    type: String,
    default: 'Want to help and bring about a difference and change lives of so many children Register and be part of us as we go to change the world why child at a time\nevery hand is needed here for us to really bring about change and save a lot of children and young teens',
  },
  registerButtonText: { type: String, default: 'Click here to Register' },
  registerUrl: { type: String, default: '' },

  // 6. "Standing together" banner
  standImage: { type: String, default: '' },
  standLogo: { type: String, default: '' },
  standText: { type: String, default: 'Standing together as women\nto protect and guide the Teen Girls\nand women' },
  standButtonText: { type: String, default: 'CLICK HERE' },
  standButtonUrl: { type: String, default: '/social-impact/thapelo-foundation' },

  // Thapelo Foundation PAGE -> sliding hero
  thapeloSlides: {
    type: [SlideSchema],
    default: () => [{ id: 's1', image: '' }, { id: 's2', image: '' }, { id: 's3', image: '' }],
  },
  thapeloSlideSeconds: { type: Number, default: 7, min: 2, max: 60 },
  thapeloHeroLogo: { type: String, default: '' },

  // Thapelo Foundation PAGE -> Our Oath
  oathTitle: { type: String, default: 'Our Oath' },
  oathText: { type: String, default: 'Praying together and sharing love Reaching out to communities and people who are in need all around the world through giving praying caring showing love to humankind' },

  // Thapelo Foundation PAGE -> colour panels that slide up
  thapeloPanels: { type: [PanelSchema], default: () => THAPELO_PANELS },

  // Thapelo Foundation PAGE -> About block (big picture with words on it)
  aboutImage: { type: String, default: '' },
  aboutLogo: { type: String, default: '' },
  aboutText: { type: String, default: 'Thapelo Foundation is a humanitarian and charitable organization dedicated to spreading love, hope, and compassion to communities and individuals in need around the world. Through the power of prayer, the spirit of giving, and a commitment to caring for others, we strive to make a meaningful difference in the lives of the less privileged and vulnerable.' },
  aboutButtonText: { type: String, default: 'Read More' },
  aboutButtonUrl: { type: String, default: '' },

  // Thapelo Foundation PAGE -> Feeding Program block
  feedImage: { type: String, default: '' },
  feedTitle: { type: String, default: 'Feeding Program' },
  feedText: { type: String, default: 'At Thapelo Foundation, we believe that access to food is a fundamental human need and that no one should have to go hungry. Through our Feeding Program, we are committed to reaching vulnerable individuals, disadvantaged families, orphaned children, and undeserved communities with nutritious meals and essential food supplies.' },
  feedButtonText: { type: String, default: 'Read More' },
  feedButtonUrl: { type: String, default: '' },
  feedTagline: { type: String, default: 'Sharing Food. Spreading Love' },

  // 7. Thapelo Foundation logo (clicking it opens thapeloUrl)
  thapeloLogo: { type: String, default: '' },
  thapeloUrl: { type: String, default: '/social-impact/thapelo-foundation' },
}, { timestamps: true });

SocialImpactSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({ whatParagraphs: WHAT_PARAGRAPHS, whyParagraphs: WHY_PARAGRAPHS });
  return doc;
};

module.exports = mongoose.model('SocialImpact', SocialImpactSchema);
