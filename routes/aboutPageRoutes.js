const createSingletonRouter = require('./singletonRouter');
module.exports = createSingletonRouter({
  Model: require('../models/AboutPage'),
  fields: [
    'heroImage', 'heroTitle', 'heroSubtitle',
    'historyHeading', 'historyBody', 'historyButtonText', 'historyButtonUrl', 'historyImage',
    'valuesHeading', 'values',
    'presidentImage', 'presidentRole', 'presidentName', 'presidentBody', 'presidentButtonText', 'presidentButtonUrl',
    'leadershipHeading', 'leadershipSubtitle', 'leaders',
    'purposeHeading', 'purposeBody', 'purposeBigText', 'purposeImage',
  ],
  folder: 'about_page',
});
