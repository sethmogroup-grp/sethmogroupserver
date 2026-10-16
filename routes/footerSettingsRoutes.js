const createSingletonRouter = require('./singletonRouter');
module.exports = createSingletonRouter({
  Model: require('../models/FooterSettings'),
  fields: ['addressLines', 'phones', 'emails', 'facebook', 'x', 'instagram', 'youtube', 'linkedin'],
  folder: 'footer_settings',
});
