const createSingletonRouter = require('./singletonRouter');
module.exports = createSingletonRouter({
  Model: require('../models/SustainabilityPage'),
  fields: [
    'heroHeading', 'heroSubtitle', 'heroImage', 'heroVideo',
    'introHeading', 'introBody',
    'items',
  ],
  folder: 'sustainability_page',
});
