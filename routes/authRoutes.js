const express = require('express');
const router = express.Router(); // This line was likely missing or below the usage
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// --- 1. LOGIN ROUTE ---
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Check if user exists
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "Invalid Email or Password" });

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid Email or Password" });

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.json({ token, username: user.username });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// --- 2. CHANGE PASSWORD ROUTE ---
router.post('/change-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  // In a real multi-user system, you would get the ID from req.user (middleware).
  // For this admin panel, we target the main admin email.
  const adminEmail = 'info@sethmogroup.com';

  try {
    const user = await User.findOne({ username: adminEmail });
    if (!user) return res.status(404).json({ error: "Admin user not found" });

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Set new password (Model hook will hash this automatically)
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Password Change Error:", err);
    res.status(500).json({ error: "Server error during password update" });
  }
});

module.exports = router;