const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g., "Updated Hero Banner"
  source: { type: String, required: true }, // e.g., "Home", "Careers", "News"
  adminUser: { type: String, default: 'Admin' }, 
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);