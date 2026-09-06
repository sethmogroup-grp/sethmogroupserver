const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const Expertise = require('../models/Expertise');

// Configure multer for memory storage (50MB limit)
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// GET /api/expertise
router.get('/', async (req, res) => {
  try {
    const data = await Expertise.getSingleton();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/expertise - Overwrite data
router.post('/', async (req, res) => {
  try {
    const data = await Expertise.getSingleton();
    data.sectionTitle = req.body.sectionTitle || data.sectionTitle;
    data.sectionSubtitle = req.body.sectionSubtitle || data.sectionSubtitle;
    data.items = req.body.items || [];
    
    await data.save();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/expertise/upload - Upload an image to Cloudinary
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'expertise' },
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