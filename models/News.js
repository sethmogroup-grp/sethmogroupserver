const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'Corporate' },
  date: { type: String, default: () => new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
  excerpt: { type: String, required: true },
  content: { type: String }, // For the full story page
  image: { type: String },   // Cloudinary URL
}, { timestamps: true });

module.exports = mongoose.model('News', NewsSchema);