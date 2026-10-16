const mongoose = require('mongoose');

/**
 * The whole "About Us" page as one editable document: hero, History, Our Values,
 * the Group President spotlight, Group Executive Leadership, and Our Purpose.
 */
const ValueItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, default: '' },
  tagline: { type: String, default: '' },
}, { _id: false });

const LeaderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, default: '' },
  role: { type: String, default: '' },
  image: { type: String, default: '' },
  body: { type: String, default: '' },
}, { _id: false });

const DEFAULT_VALUES = [
  { id: 'integrity', title: 'Integrity', tagline: 'We Do What Is Right' },
  { id: 'stewardship', title: 'Stewardship', tagline: 'We Build for what Comes Next' },
  { id: 'customer-centricity', title: 'Customer Centricity', tagline: 'Inspired By You' },
  { id: 'sustainable-impact', title: 'Sustainable Impact', tagline: 'We Grow With Purpose\n1. Integrity by doing what Right Always' },
  { id: 'excellence', title: 'Excellence', tagline: 'We Raise the Standard' },
  { id: 'innovation', title: 'Innovation', tagline: 'We keep moving forward' },
  { id: 'diversity', title: 'Diversity', tagline: 'Different People, one Purpose' },
];

const DEFAULT_LEADERS = [
  { id: 'ireen-phiri-1', name: 'Ireen Phiri', role: 'Group Vice President', body: 'We Grow With Purpose\n1. Integrity by doing what Right Always' },
  { id: 'hope-chuungwe-1', name: 'Hope Chuungwe', role: 'Vice President', body: 'We Grow With Purpose\n1. Integrity by doing what Right Always' },
  { id: 'ruth-mwinsa-1', name: 'Ruth Mwinsa', role: 'Group CEO', body: 'We Grow With Purpose\n1. Integrity by doing what Right Always' },
  { id: 'ireen-phiri-2', name: 'Ireen Phiri', role: 'Group Vice President', body: 'We Grow With Purpose\n1. Integrity by doing what Right Always' },
  { id: 'hope-chuungwe-2', name: 'Hope Chuungwe', role: 'Vice President', body: 'We Grow With Purpose\n1. Integrity by doing what Right Always' },
  { id: 'ruth-mwinsa-2', name: 'Ruth Mwinsa', role: 'Group CEO', body: 'We Grow With Purpose\n1. Integrity by doing what Right Always' },
];

const AboutPageSchema = new mongoose.Schema({
  // Hero
  heroImage: { type: String, default: '' },
  heroTitle: { type: String, default: 'About Sethmo Group of Companies Limited' },
  heroSubtitle: {
    type: String,
    default:
      'Sethmo Group is a diversified conglomerate housing more than 15 companies across Zambia, building businesses, strengthening industries, and driving the economy toward a more prosperous, resilient, and efficient future.',
  },

  // History
  historyHeading: { type: String, default: 'History' },
  historyBody: {
    type: String,
    default:
      'Mr Justine Mophat Chuungwe is the founder / President and the Chief Executive of Sethmo Group Originated in Zambia. Mr Justine began his career in 2008 as a Graphic Designer where he worked for Platinum Printers Limited, and started developing his clientele while strengthening his skills in trading agro products.',
  },
  historyButtonText: { type: String, default: 'Read More' },
  historyButtonUrl: { type: String, default: '' },
  historyImage: { type: String, default: '' },

  // Our Values
  valuesHeading: { type: String, default: 'Our Values' },
  values: { type: [ValueItemSchema], default: undefined },

  // Group President
  presidentImage: { type: String, default: '' },
  presidentRole: { type: String, default: 'Group President & Chief Executive' },
  presidentName: { type: String, default: 'Justine Mophat Chuungwe' },
  presidentBody: {
    type: String,
    default:
      'Mr Justine Mophat Chuungwe is the founder / President and the Chief Executive of Sethmo Group Originated in Zambia. Mr Justine began his career in 2008 as a Graphic Designer where he worked for Platinum Printers Limited, and started developing his clientele while strengthening his skills in trading agro products.',
  },
  presidentButtonText: { type: String, default: 'Read More' },
  presidentButtonUrl: { type: String, default: '' },

  // Group Executive Leadership
  leadershipHeading: { type: String, default: 'Group Executive Leadership' },
  leadershipSubtitle: {
    type: String,
    default:
      'Our senior leadership brings deep industry expertise, strategic foresight, and decisive leadership to Sethmo Group. Through strong governance, strategic oversight, disciplined investment, and the development of our subsidiaries, they shape the Group\u2019s direction, strengthen business performance, unlock new opportunities, and build the foundation for sustainable long-term growth.',
  },
  leaders: { type: [LeaderItemSchema], default: undefined },

  // Our Purpose
  purposeHeading: { type: String, default: 'Our Purpose' },
  purposeBody: {
    type: String,
    default:
      'To build, develop, and steward businesses that create lasting value for Zambia, giving income and opportunity to the average person, and giving hope to the next Generation of heroes.',
  },
  purposeBigText: { type: String, default: 'INSPIRED BY YOU' },
  purposeImage: { type: String, default: '' },
}, { timestamps: true });

AboutPageSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({ values: DEFAULT_VALUES, leaders: DEFAULT_LEADERS });
  return doc;
};

module.exports = mongoose.model('AboutPage', AboutPageSchema);
