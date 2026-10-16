const createSingletonRouter = require('./singletonRouter');
module.exports = createSingletonRouter({
  Model: require('../models/BusinessFocus'),
  fields: ['title', 'description', 'autoplay', 'speedSeconds', 'items'],
  folder: 'business_focus',
});
