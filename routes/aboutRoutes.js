const createSingletonRouter = require('./singletonRouter');

// GET /api/about, POST /api/about, POST /api/about/upload
module.exports = createSingletonRouter({
  Model: require('../models/About'),
  fields: ['hero', 'history', 'values', 'purpose'],
  folder: 'about_page',
});
