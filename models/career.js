const mongoose = require('mongoose');

const CareerSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String, required: true }, // e.g., Agribusiness, Mining, Corporate
  location: { type: String, default: 'Zambia' },
  type: { type: String, default: 'Full-time' }, // e.g., Full-time, Contract
  applyLink: { type: String }, // Link to application form or email
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Career', CareerSchema);