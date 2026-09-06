const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');
const logActivity = require('../utils/logger');

router.get('/', async (req, res) => {
  try {
    const data = await Settings.getSingleton();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const settings = await Settings.getSingleton();
    Object.assign(settings, req.body);
    await settings.save();
    
    await logActivity("Updated Global System Settings", "Settings");
    
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: "Failed to update settings" });
  }
});

module.exports = router;
