const mongoose = require('mongoose');

/**
 * The whole "Employees" page as one editable document:
 *  - hero picture (full width, shown un-cropped)
 *  - "Inspired By you" block (heading, text, the two circle labels)
 *  - "Diverse Individuals Supporting Diversified Businesses" (hub + 6 subsidiaries)
 *  - "Employee Interview" looping carousel (as many cards as the admin adds)
 * Empty image fields fall back to the bundled design pictures on the website.
 */
const SubsidiarySchema = new mongoose.Schema({
  id: { type: String, required: true },
  logo: { type: String, default: '' },
  name: { type: String, default: '' },
  description: { type: String, default: '' },
}, { _id: false });

const InterviewSchema = new mongoose.Schema({
  id: { type: String, required: true },
  image: { type: String, default: '' },
  role: { type: String, default: '' },
  name: { type: String, default: '' },
  company: { type: String, default: '' },
  link: { type: String, default: '' },
}, { _id: false });

const PillarSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, default: '' },
  body: { type: String, default: '' },
}, { _id: false });

const DivCardSchema = new mongoose.Schema({
  id: { type: String, required: true },
  image: { type: String, default: '' },
  overlayText: { type: String, default: '' }, // big white words on top of the picture (optional)
  caption: { type: String, default: '' },     // clickable words under the picture
  link: { type: String, default: '/careers' },
}, { _id: false });

const DEFAULT_PILLARS = [
  {
    id: 'attract',
    title: 'Attract and Acquire',
    body: 'We seek out and welcome diverse, ambitious, and talented individuals who bring unique skills, perspectives, experiences, and aspirations to Sethmo Group.\nWe create opportunities for people who are motivated by challenge, innovation, responsibility, and the opportunity to build meaningful careers while contributing to the growth of our businesses.',
  },
  {
    id: 'develop',
    title: 'Develop and Grow',
    body: 'We invest in the continuous development and growth of our people, recognising that every individual has different strengths, capabilities, and ambitions. Through meaningful challenges, learning opportunities, mentorship, responsibility, and career development, we empower our employees to expand their capabilities, pursue their aspirations, and grow alongside the businesses they serve.',
  },
  {
    id: 'engage',
    title: 'Engage and Belong',
    body: 'We create an inclusive, respectful, and engaging workplace where every individual feels valued, heard, supported, and connected to the purpose of Sethmo Group. We encourage collaboration, recognise contribution, promote diversity, and foster an environment where our people can take ownership, perform with purpose, and feel a genuine sense of belonging.',
  },
];

const DEFAULT_DIV_CARDS = [
  { id: 'diversified', overlayText: 'Diversified', caption: 'Diversified', link: '/careers' },
  { id: 'career-information', overlayText: '', caption: 'Career Information', link: '/careers' },
];

const DEFAULT_SUBSIDIARIES = [
  { id: 'brand', name: 'Sethmo Brand Consultancy', description: 'Corporate Branding / advertising' },
  { id: 'suriel', name: 'Suriel Maison Hotels', description: 'Hospitality and Apartments' },
  { id: 'agro', name: 'Sethmo Agro industries', description: 'Commercial Farming and Grain mills products' },
  { id: 'cement', name: 'Sethmo Cement Limited', description: 'Cement Manufacturing and Distributions' },
  { id: 'sethgold', name: 'SethGold Printing Press Limited', description: 'Paper Printing and Book Publishing' },
  { id: 'beverages', name: 'Sethmo Beverages Limited', description: 'Beverage Manufacturing' },
];

const DEFAULT_INTERVIEWS = [
  { id: 'ruth-mwinsa', role: 'Overseeing the Sales and Market needs', name: 'Ruth Mwinsa', company: 'Sethmo Brand Consultancy' },
  { id: 'justine-mophat', role: 'International Relations', name: 'Justine Mophat', company: 'Sethmo Group' },
  { id: 'hope-mulenga-1', role: 'Quality Control', name: 'Hope Mulenga', company: 'Sethgold Printing Press' },
  { id: 'hope-mulenga-2', role: 'Quality Control', name: 'Hope Mulenga', company: 'Sethgold Printing Press' },
];

const EmployeesPageSchema = new mongoose.Schema({
  // Page title + hero
  pageTitle: { type: String, default: 'Employees' },
  heroImage: { type: String, default: '' },

  // Inspired By you
  inspiredHeading: { type: String, default: 'Inspired By you' },
  inspiredBody: {
    type: String,
    default:
      'Sethmo Group is built on the belief that people are the foundation of progress. We recognize The individuality of every person, nurture their potential, and create opportunities for them to learn, lead, and grow. By bringing together diverse talents, perspectives, and ambitions, we build a culture where our people and our businesses advance together.',
  },
  circleLeftLabel: { type: String, default: 'Inspired by you' },
  circleRightLabel: { type: String, default: 'Diversified Sethmo Group' },

  // Diverse Individuals Supporting Diversified Businesses
  diverseHeading: { type: String, default: 'Diverse Individuals Supporting Diversified Businesses' },
  diverseBody: {
    type: String,
    default:
      'At Sethmo Group, we believe our people are the strength behind every business we build. Inspired By You reflects our commitment to recognising the individuality, talent, and potential of every employee. We create an environment where people are respected, challenged to grow, encouraged to take initiative, and given opportunities to develop their skills and careers. By embracing diverse talents, perspectives, and ambitions, we build teams that learn from one another, perform with purpose, and grow together.',
  },
  hubLogo: { type: String, default: '' },
  subsidiaries: { type: [SubsidiarySchema], default: undefined },

  // People Strategy Centered on Diverse Individuals
  psHeading: { type: String, default: 'People Strategy Centered on Diverse Individuals' },
  psIntro1: {
    type: String,
    default:
      'At Sethmo Group, Inspired By You is the foundation of how we approach our people. We believe our strength comes from individuals with different talents, perspectives, experiences, and ambitions coming together to build something greater.',
  },
  psIntro2: {
    type: String,
    default:
      'Our People Strategy is designed to attract the right talent, unlock individual potential, and create a workplace where people can thrive and belong. Across our diverse businesses and operating environments, we aim to provide meaningful opportunities for our people to contribute, develop, take on new challenges, and build fulfilling careers.',
  },
  psBanner: { type: String, default: 'Our Group-wide People Strategy is built around three core priorities:' },
  pillars: { type: [PillarSchema], default: undefined },

  // Diversified / Career Information picture cards
  divCards: { type: [DivCardSchema], default: undefined },

  // Employee Interview carousel
  interviewHeading: { type: String, default: 'Employee Interview' },
  interviewSubtitle: {
    type: String,
    default:
      'Get to know our passionate employees who continuously embrace challenges, drive innovation, and create meaningful value through their dedication and determination.',
  },
  interviewButtonText: { type: String, default: 'See More Interview' },
  interviewButtonUrl: { type: String, default: '' },
  interviewSpeed: { type: Number, default: 3.5 }, // seconds each card stays before sliding on
  interviews: { type: [InterviewSchema], default: undefined },
}, { timestamps: true });

EmployeesPageSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({
      subsidiaries: DEFAULT_SUBSIDIARIES,
      interviews: DEFAULT_INTERVIEWS,
      pillars: DEFAULT_PILLARS,
      divCards: DEFAULT_DIV_CARDS,
    });
  } else if (!doc.pillars || !doc.pillars.length || !doc.divCards || !doc.divCards.length) {
    // page was created before these sections existed: fill them in once
    if (!doc.pillars || !doc.pillars.length) doc.pillars = DEFAULT_PILLARS;
    if (!doc.divCards || !doc.divCards.length) doc.divCards = DEFAULT_DIV_CARDS;
    await doc.save();
  }
  return doc;
};

module.exports = mongoose.model('EmployeesPage', EmployeesPageSchema);
