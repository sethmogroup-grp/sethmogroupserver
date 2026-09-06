const mongoose = require('mongoose');

const BusinessItemSchema = new mongoose.Schema({
  id: { type: String, required: true }, // e.g., 'agro', 'branding'
  title: { type: String, required: true },
  logo: { type: String, default: '' }, // URL from Cloudinary
  image: { type: String, default: '' } // URL from Cloudinary
}, { _id: false }); // <-- THIS IS THE MAGIC FIX! Stops Mongoose from crashing over the 'id' field

const HomeBusinessSchema = new mongoose.Schema({
  sectionTitle: { 
    type: String, 
    default: 'Our Businesses' 
  },
  sectionSubtitle: { 
    type: String, 
    default: 'As a diversified conglomerate, our interest in multiple industries indicates our determination to cater to our vision of providing basic needs.' 
  },
  businesses: [BusinessItemSchema]
}, { timestamps: true });

// Singleton pattern so we only ever have one document for this section
HomeBusinessSchema.statics.getSingleton = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({ businesses: [] }); 
  }
  return settings;
};

module.exports = mongoose.model('HomeBusiness', HomeBusinessSchema);