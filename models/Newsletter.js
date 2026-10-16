const mongoose = require('mongoose');

/**
 * The orange "Stay updated with our Newsletters" subscribe banner,
 * shown right under the Sethmo Highlights grid.
 */
const NewsletterSchema = new mongoose.Schema({
  heading: { type: String, default: 'Stay updated with our Newsletters' },
  body: {
    type: String,
    default:
      'Stay informed with the latest news, insights, and announcements from Sethmo Group. Subscribe to receive our latest newsletters and press releases directly in your inbox. You can unsubscribe at any time.',
  },
  placeholder: { type: String, default: 'Enter your email address' },
  buttonText: { type: String, default: 'Subscribe' },
  panelColor: { type: String, default: '#f47b20' },
  icon: { type: String, default: '' }, // optional custom icon, replaces the default envelope
}, { timestamps: true });

NewsletterSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({});
  return doc;
};

module.exports = mongoose.model('Newsletter', NewsletterSchema);
