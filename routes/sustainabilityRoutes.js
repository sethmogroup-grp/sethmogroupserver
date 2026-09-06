const express = require('express');
const router = express.Router();
const Sustainability = require('../models/Sustainability');

router.get('/', async (req, res) => {
  try {
    const data = await Sustainability.getSingleton();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = await Sustainability.getSingleton();
    data.focusAreas = req.body.focusAreas;
    await data.save();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;