const createSingletonRouter = require('./singletonRouter');
module.exports = createSingletonRouter({
  Model: require('../models/SocialImpact'),
  fields: [
    'heroImage', 'heroLogo', 'heroTitle', 'heroSubtitle',
    'whatWatermark', 'welcomeLine', 'introText', 'whatHeading', 'whatParagraphs',
    'whyHeading', 'whyParagraphs', 'signatureName', 'signatureRole', 'signatureBadge',
    'bannerImage', 'bannerLogo', 'galleryButtonText', 'galleryButtonUrl',
    'girlImage', 'registerText', 'registerButtonText', 'registerUrl',
    'standImage', 'standLogo', 'standText', 'standButtonText', 'standButtonUrl',
    'thapeloLogo', 'thapeloUrl', 'thapeloSlides', 'thapeloSlideSeconds', 'thapeloHeroLogo',
    'oathTitle', 'oathText', 'thapeloPanels',
    'aboutImage', 'aboutLogo', 'aboutText', 'aboutButtonText', 'aboutButtonUrl',
    'feedImage', 'feedTitle', 'feedText', 'feedButtonText', 'feedButtonUrl', 'feedTagline',
  ],
  folder: 'social_impact',
});
