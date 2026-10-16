const createSingletonRouter = require('./singletonRouter');
module.exports = createSingletonRouter({
  Model: require('../models/Highlights'),
  fields: ['title', 'items'],
  folder: 'highlights',
});
