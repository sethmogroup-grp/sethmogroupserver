const createSingletonRouter = require('./singletonRouter');
module.exports = createSingletonRouter({
  Model: require('../models/AgendaBanner'),
  fields: [
    'eyebrow', 'heading', 'buttonText', 'buttonUrl',
    'intro', 'lead', 'quote', 'pillarsTitle', 'pillars',
    'visionHeading', 'visionLogo', 'personImage', 'statBig', 'statText',
  ],
  folder: 'agenda_banner',
});
