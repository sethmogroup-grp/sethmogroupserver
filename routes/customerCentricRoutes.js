const createSingletonRouter = require('./singletonRouter');
module.exports = createSingletonRouter({
  Model: require('../models/CustomerCentric'),
  fields: ['heading', 'body', 'buttonText', 'buttonUrl', 'personImage', 'sideImage'],
  folder: 'customer_centric',
});
