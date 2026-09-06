const express = require('express');
const router = express.Router();
const Pillar = require('../models/Pillar');

// GET /api/pillars
router.get('/', async (req, res) => {
  try {
    const data = await Pillar.getSingleton();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/pillars
router.post('/', async (req, res) => {
  try {
    const data = await Pillar.getSingleton();
    data.pillars = req.body.pillars || []; // Fallback to empty array
    await data.save();
    res.json(data);
  } catch (err) {
    console.error("🔥 PILLAR SAVE ERROR:", err); // Added error logging for Render
    res.status(500).json({ error: err.message, details: err });
  }
});

module.exports = router;