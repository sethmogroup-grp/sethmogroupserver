const createSingletonRouter = require('./singletonRouter');
module.exports = createSingletonRouter({
  Model: require('../models/FootprintTabs'),
  fields: ['autoplay', 'intervalSeconds', 'slides'],
  folder: 'footprint_tabs',
});
