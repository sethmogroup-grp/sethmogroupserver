const mongoose = require('mongoose');

// One value/pillar tile shown in the "Our Values" grid (e.g. Integrity — "We Do What Is Right")
const ValueItemSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    tagline: { type: String, default: '' },
  },
  { _id: false }
);

const AboutSchema = new mongoose.Schema(
  {
    // 1. Top page hero — dark photo banner with the page title + intro line
    hero: {
      title: { type: String, default: 'About Sethmo Group of Companies Limited' },
      subtitle: {
        type: String,
        default:
          'Sethmo Group is a diversified conglomerate housing more than 15 companies across Zambia, building businesses, strengthening industries, and driving the economy toward a more prosperous, resilient, and efficient future.',
      },
      backgroundImage: { type: String, default: '' }, // URL from Cloudinary
    },

    // 2. History — text on one side, a small rotating photo carousel on the other
    history: {
      heading: { type: String, default: 'History' },
      text: {
        type: String,
        default:
          'Mr Justine Mophat Chuungwe is the founder, President and Chief Executive of Sethmo Group, originated in Zambia. Mr Justine began his career in 2008 as a Graphic Designer, where he worked for Platinum Printers Limited, and started developing his clientele while strengthening his skills in trading agro products.',
      },
      buttonText: { type: String, default: 'Read More' },
      images: { type: [String], default: [] }, // Cloudinary URLs, shown as a dot-indicator carousel
    },

    // 3. Our Values — a grid of short value + tagline tiles
    values: {
      heading: { type: String, default: 'Our Values' },
      items: {
        type: [ValueItemSchema],
        default: [
          { title: 'Integrity', tagline: 'We Do What Is Right' },
          { title: 'Stewardship', tagline: 'We Build For What Comes Next' },
          { title: 'Customer Centricity', tagline: 'Inspired By You' },
          { title: 'Sustainable Impact', tagline: 'We Grow With Purpose' },
          { title: 'Excellence', tagline: 'We Raise The Standard' },
          { title: 'Innovation', tagline: 'We Keep Moving Forward' },
          { title: 'Diversity', tagline: 'Different People, One Purpose' },
        ],
      },
    },

    // 4. Our Purpose — closing banner with a big background photo
    purpose: {
      heading: { type: String, default: 'Our Purpose' },
      text: {
        type: String,
        default:
          'To build, develop, and steward businesses that create lasting value for Zambia, giving income and opportunity to the average person, and giving hope to the next generation of heroes.',
      },
      highlight: { type: String, default: 'Inspired By You' },
      backgroundImage: { type: String, default: '' }, // URL from Cloudinary
    },
  },
  { timestamps: true }
);

AboutSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({});
  }
  return doc;
};

module.exports = mongoose.model('About', AboutSchema);
