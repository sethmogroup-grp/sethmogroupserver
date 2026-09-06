const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const existing = await User.findOne({ username: 'info@sethmogroup.com' });
    if (existing) {
      console.log("Admin account already exists.");
      process.exit();
    }

    // Create the new admin
    const admin = new User({
      username: 'info@sethmogroup.com',
      password: 'admin' // The User model's .pre('save') will hash this automatically
    });

    await admin.save();
    console.log("✅ Admin account created: info@sethmogroup.com / admin");
    process.exit();
  } catch (err) {
    console.error("Error seeding admin:", err);
    process.exit(1);
  }
};

seedAdmin();