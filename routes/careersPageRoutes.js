const createSingletonRouter = require('./singletonRouter');
module.exports = createSingletonRouter({
  Model: require('../models/CareersPage'),
  fields: [
    'pageTitle', 'heroImage', 'nextHeading', 'nextBody', 'nextClosing',
    'purposeHeading', 'purposeCards',
    'applyText', 'applyLink', 'profileSmall', 'profileTitle', 'profileImage', 'profileLink',
    'categoriesHeading', 'categoriesBody', 'categories',
    'detailPages',
  ],
  folder: 'careers_page',
});
