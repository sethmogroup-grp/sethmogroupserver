const mongoose = require('mongoose');

/**
 * The "Careers Topics" page as one editable document:
 * title, full-width hero picture, and the "THE NEXT BIG THING HERE IS. YOU" message.
 * (Job openings are managed separately in the existing Careers manager.)
 * In nextBody every line break is a line on the page, and [[words]] show in orange.
 */
const DEFAULT_BODY = [
  'Welcome to the Sethmo Group family.',
  'We are building businesses, creating opportunities, and growing across a diverse range of products,',
  'services, and industries. As we continue to grow, we know that our greatest strength will always be our people',
  'individuals who bring new ideas, different perspectives, passion, talent, and the courage to move forward.',
  'Maybe that person is you.',
  'At Sethmo, we believe that every meaningful change begins with a thought.',
  'An idea. A question. A dream. Sometimes, it starts with simply asking, [[\u201cWhat if?\u201d]]',
  'When curiosity meets passion, when talent meets opportunity, and when ambitious people',
  'come together with others who share their drive, something powerful happens. Ideas become action.',
  'Challenges become opportunities. And together, we can create things that make a difference',
  'in the lives of people and communities around us.',
  'That is the kind of environment we are building at Sethmo Group.',
  'We want people to feel free to think, to ask questions, to challenge the ordinary, to learn, to grow,',
  'and to bring their authentic selves to work. We value different backgrounds, experiences, perspectives, and ways',
  'of thinking because we believe diversity makes us stronger.',
  'Your ideas matter here. Your ambition matters. Your experiences matter.',
  'And the contribution you make can reach far beyond your individual role.',
  'As part of the Sethmo Group, you will have the opportunity to grow alongside a diverse group of',
  'businesses and people, take on new challenges,',
  'develop your capabilities, and be part of something that is still being built.',
  "We don't expect you to have everything figured out.",
  'We are looking for people who are willing to learn, willing to contribute, willing to grow, and',
  'willing to move forward with us.',
  'Because the future of Sethmo Group will not be built by one person.',
  'It will be built by people like you.',
].join('\n');

const CardSchema = new mongoose.Schema({
  id: { type: String, required: true },
  image: { type: String, default: '' },
  caption: { type: String, default: '' },
  link: { type: String, default: '' },
}, { _id: false });

const CategorySchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, default: '' },
}, { _id: false });

const DetailSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, default: '' },
  image: { type: String, default: '' },
  body: { type: String, default: '' },
}, { _id: false });

const DEFAULT_CATEGORIES = [
  'Sethmo Cement', 'Sethmo Beverages', 'Sethmo Steel', 'Sethmo Agro', 'Sethmo Brand Consutancy', 'Sethmo Beverages',
  'Riel Electronics', 'Press X Embroidery', 'Suriel Maison Hotels', 'Wanchi Dairy', 'Sethmo Beef', 'SethGold Printing',
].map((name, i) => ({ id: `cat-${i + 1}`, name }));

const CareersPageSchema = new mongoose.Schema({
  pageTitle: { type: String, default: 'Careers' },
  heroImage: { type: String, default: '' },
  nextHeading: { type: String, default: 'THE NEXT BIG THING HERE IS. YOU' },
  nextBody: { type: String, default: DEFAULT_BODY },
  nextClosing: { type: String, default: 'The next big thing here is You.' },

  // Sethmo's Purpose and Our President Message
  purposeHeading: { type: String, default: 'Sethmo\u2019s Purpose and Our President Message' },
  purposeCards: { type: [CardSchema], default: undefined },

  // Apply button + corporate profile box
  applyText: { type: String, default: 'Apply for Job Opportunities' },
  applyLink: { type: String, default: '#job-categories' },
  profileSmall: { type: String, default: 'Sethmo Group' },
  profileTitle: { type: String, default: 'Corporate Profile' },
  profileImage: { type: String, default: '' },
  profileLink: { type: String, default: '' },

  // Job Categories
  categoriesHeading: { type: String, default: 'Job Categories' },
  categoriesBody: {
    type: String,
    default:
      'From the very beginning, we have found great value in welcoming new people into the Sethmo Group family. Every new person brings a fresh mind, a different perspective, a new challenge, and an opportunity for us to become better at what we do.We believe growth happens when people are given the opportunity to think, contribute, challenge ideas, and create something better together.As Sethmo Group continues to grow, so does our need for people who are ready to learn, bring their ideas, embrace new challenges, and help shape what comes next.',
  },
  categories: { type: [CategorySchema], default: undefined },

  // Detail pages opened from the Purpose / President links
  detailPages: { type: [DetailSchema], default: undefined },
}, { timestamps: true });

CareersPageSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({
      purposeCards: [
        { id: 'purpose', caption: 'Sethmo\u2019s Purpose', link: '/careers/purpose' },
        { id: 'president', caption: 'Our President', link: '/careers/president' },
      ],
      categories: DEFAULT_CATEGORIES,
      detailPages: [
        { id: 'purpose', title: 'Sethmo\u2019s Purpose' },
        { id: 'president', title: 'Our President Message' },
      ],
    });
  }
  return doc;
};

module.exports = mongoose.model('CareersPage', CareersPageSchema);
