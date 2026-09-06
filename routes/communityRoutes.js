const express = require('express');
const router = express.Router();
const CommunitySettings = require('../models/CommunitySettings');

// GET /api/community-settings
router.get('/', async (req, res) => {
  try {
    const settings = await CommunitySettings.getSingleton();
    res.json(settings);
  } catch (err) {
    console.error("Error fetching community settings:", err.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// POST /api/community-settings
router.post('/', async (req, res) => {
  try {
    const settings = await CommunitySettings.getSingleton();
    
    // Update fields from the admin manager
    settings.heroTitle = req.body.heroTitle;
    settings.heroSubtext = req.body.heroSubtext;
    settings.impactHeading = req.body.impactHeading;
    settings.impactBody1 = req.body.impactBody1;
    settings.impactBody2 = req.body.impactBody2;
    settings.projectsLink = req.body.projectsLink;
    settings.impactImage = req.body.impactImage;

    await settings.save();
    res.json(settings);
  } catch (err) {
    console.error("Error saving community settings:", err.message);
    res.status(500).json({ error: "Failed to save settings" });
  }
});

module.exports = router;