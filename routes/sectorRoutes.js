const express = require('express');
const router = express.Router();
const Sector = require('../models/Sector');

// GET /api/sectors
router.get('/', async (req, res) => {
  try {
    const data = await Sector.getSingleton();
    // Ensure we always return an object with a sectors array
    res.json(data || { sectors: [] }); 
  } catch (err) {
    console.error("Backend Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sectors
router.post('/', async (req, res) => {
  try {
    const data = await Sector.getSingleton();
    data.sectors = req.body.sectors;
    await data.save();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;