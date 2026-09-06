const express = require('express');
const router = express.Router();
const Vision = require('../models/Vision');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// GET /api/vision
router.get('/', async (req, res) => {
  try {
    const vision = await Vision.getSingleton();
    res.json(vision);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vision (update)
router.post('/', async (req, res) => {
  try {
    const vision = await Vision.getSingleton();
    Object.assign(vision, req.body);
    await vision.save();
    res.json(vision);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vision/upload (for image)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file' });
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'vision' },
        (err, result) => err ? reject(err) : resolve(result)
      );
      uploadStream.end(req.file.buffer);
    });
    res.json({ url: result.secure_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;