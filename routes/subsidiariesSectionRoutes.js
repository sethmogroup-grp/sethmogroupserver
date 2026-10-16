const createSingletonRouter = require('./singletonRouter');
module.exports = createSingletonRouter({
  Model: require('../models/SubsidiariesSection'),
  fields: ['title', 'hubLogo', 'items'],
  folder: 'subsidiaries_section',
});
