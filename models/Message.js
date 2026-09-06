const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, default: 'No Subject' },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false } // Helps you know if you've read it yet!
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);