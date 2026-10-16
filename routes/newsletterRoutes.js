const createSingletonRouter = require('./singletonRouter');
module.exports = createSingletonRouter({
  Model: require('../models/Newsletter'),
  fields: ['heading', 'body', 'placeholder', 'buttonText', 'panelColor', 'icon'],
  folder: 'newsletter',
});
