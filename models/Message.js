const mongoose = require('mongoose');

const ReplySchema = new mongoose.Schema({
  subject: String,
  body: { type: String, required: true },
  sentBy: {
    userId: String,
    name: String,
    email: String,
    role: String,
  },
  sentAt: { type: Date, default: Date.now },
}, { _id: true });

const MessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, default: 'No Subject' },
  message: { type: String, required: true },
  // 'contact'    = sent through the Contact Us form
  // 'newsletter' = someone subscribed through the newsletter box
  type: { type: String, enum: ['contact', 'newsletter'], default: 'contact', index: true },
  isRead: { type: Boolean, default: false }, // Helps you know if you've read it yet!

  // Replies sent from the admin panel through Nodemailer
  replies: { type: [ReplySchema], default: [] },
  repliedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);
