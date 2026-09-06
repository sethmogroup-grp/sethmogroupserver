const express = require('express');
const router = express.Router();
const Career = require('../models/career');

// GET all careers
router.get('/', async (req, res) => {
  try {
    const jobs = await Career.find().sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST sync all careers
router.post('/', async (req, res) => {
  try {
    await Career.deleteMany({});
    const savedJobs = await Career.insertMany(req.body.jobs);
    res.json({ jobs: savedJobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;