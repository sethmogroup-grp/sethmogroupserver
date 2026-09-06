// S:\sethmo\sethmo-server\routes\heroRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const HeroSetting = require('../models/HeroSetting');
const logActivity = require('../utils/logger'); // Correct import

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi/;
    const ext = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
    const mime = allowedTypes.test(file.mimetype);
    if (ext && mime) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed'));
    }
  }
});

// GET /api/hero
router.get('/', async (req, res) => {
  try {
    const settings = await HeroSetting.getSingleton();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching hero settings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/hero – update hero settings
router.post('/', async (req, res) => {
  try {
    const settings = await HeroSetting.findOneAndUpdate(
      {}, 
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    );

    // ✅ MOVE LOG ACTIVITY HERE (Inside the async function)
    await logActivity("Updated Hero Banner text/links", "Home");

    res.json(settings);
  } catch (error) {
    console.error('Error updating hero settings:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/hero/upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const isVideo = req.file.mimetype.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { resource_type: resourceType, folder: 'hero' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // ✅ OPTIONAL: Log file uploads too
    await logActivity(`Uploaded new Hero ${resourceType}`, "Home");

    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

module.exports = router;