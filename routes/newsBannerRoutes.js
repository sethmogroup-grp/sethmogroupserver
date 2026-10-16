const express = require('express');
const router = express.Router();
const NewsBanner = require('../models/NewsBanner');

// GET /api/news-banner
router.get('/', async (req, res) => {
  try {
    const data = await NewsBanner.getSingleton();
    res.json(data);
  } catch (error) {
    console.error('Error fetching News Banner data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/news-banner
router.post('/', async (req, res) => {
  try {
    const data = await NewsBanner.getSingleton();

    data.title = req.body.title;
    data.subtitle = req.body.subtitle;
    data.linkText = req.body.linkText;
    data.linkUrl = req.body.linkUrl;

    await data.save();
    res.json(data);
  } catch (error) {
    console.error('Error updating News Banner data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
