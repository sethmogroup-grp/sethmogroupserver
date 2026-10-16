const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const PromiseSection = require('../models/Promise');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// GET /api/promises
router.get('/', async (req, res) => {
  try {
    const data = await PromiseSection.getSingleton();
    res.json(data);
  } catch (error) {
    console.error('Error fetching Promises data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/promises - Update entire section
router.post('/', async (req, res) => {
  try {
    const data = await PromiseSection.getSingleton();

    data.titleTop = req.body.titleTop;
    data.titleBottom = req.body.titleBottom;
    data.sectionSubtitle = req.body.sectionSubtitle;
    data.promises = req.body.promises || [];

    await data.save();
    res.json(data);
  } catch (error) {
    console.error('Error updating Promises data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/promises/upload - Upload a promise card image
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'promises_section' },
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
