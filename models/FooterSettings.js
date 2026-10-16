const mongoose = require('mongoose');

/**
 * Footer contact details + social links (edited from the admin "Footer & Contact" screen).
 * Everything left empty falls back to the defaults bundled with the website.
 */
const LineSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, default: '' },
}, { _id: false });

const FooterSettingsSchema = new mongoose.Schema({
  // One line per row, exactly as it should read in the footer
  addressLines: { type: String, default: 'Plot 3520, 3521 Cairo Road Lusaka\nZambia' },
  phones: { type: [LineSchema], default: undefined },
  emails: { type: [LineSchema], default: undefined },

  facebook: { type: String, default: 'https://www.facebook.com/share/1DJHvBsWiu/' },
  x: { type: String, default: 'https://x.com/SethmoGroup' },
  instagram: { type: String, default: 'https://www.instagram.com/sethmogroup?igsh=dmUxcHZ1Z200dXIy' },
  youtube: { type: String, default: 'https://www.youtube.com/@SethmoGroup' },
  linkedin: { type: String, default: '' },
}, { timestamps: true });

FooterSettingsSchema.statics.getSingleton = async function () {
  let doc = await this.findOne();
  if (!doc) {
    doc = await this.create({
      phones: [
        { id: 'ph1', text: '(+260) 767 841 135' },
        { id: 'ph2', text: '(+260) (0) 211 374 200' },
      ],
      emails: [
        { id: 'em1', text: 'Info@sethmogroup.com' },
        { id: 'em2', text: 'sales@sethmogroup.com' },
        { id: 'em3', text: 'Customer@sethmogroup.com' },
      ],
    });
  }
  return doc;
};

module.exports = mongoose.model('FooterSettings', FooterSettingsSchema);
