const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const FullBleed = require('../models/FullBleed');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/full-bleed
router.get('/', async (req, res) => {
  try {
    const data = await FullBleed.getSingleton();
    res.json(data);
  } catch (error) {
    console.error('Error fetching Full Bleed data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/full-bleed
router.post('/', async (req, res) => {
  try {
    const data = await FullBleed.getSingleton();

    data.image = req.body.image;
    data.eyebrow = req.body.eyebrow;
    data.title = req.body.title;
    data.linkText = req.body.linkText;
    data.linkUrl = req.body.linkUrl;

    await data.save();
    res.json(data);
  } catch (error) {
    console.error('Error updating Full Bleed data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/full-bleed/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'full_bleed_section' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;
