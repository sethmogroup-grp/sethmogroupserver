const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 80 * 1024 * 1024 }, // 80 MB - covers a short hero video, plenty for images
  fileFilter: (req, file, cb) => {
    if (/^(image|video)\//.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only image or video files are allowed'));
  },
});

/**
 * Builds GET / , POST / and POST /upload for a "single document" content section
 * (one record that the admin edits, the public site reads).
 *
 *  Model  - mongoose model exposing a static getSingleton()
 *  fields - allow-list of top-level keys the admin may update
 *  folder - Cloudinary folder for uploaded images
 */
module.exports = function createSingletonRouter({ Model, fields, folder }) {
  const router = express.Router();

  // GET - public site + admin both read from here
  router.get('/', async (req, res) => {
    try {
      const doc = await Model.getSingleton();
      res.json(doc);
    } catch (error) {
      console.error(`Error fetching ${folder}:`, error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // POST - admin saves the whole section
  router.post('/', async (req, res) => {
    try {
      const doc = await Model.getSingleton();
      fields.forEach((key) => {
        if (req.body[key] !== undefined) doc[key] = req.body[key];
      });
      await doc.save();
      res.json(doc);
    } catch (error) {
      console.error(`Error updating ${folder}:`, error);
      res.status(500).json({ error: 'Server error' });
    }
  });

  // POST /upload - admin uploads one image, gets the Cloudinary URL back
  router.post('/upload', (req, res) => {
    upload.single('file')(req, res, async (err) => {
      if (err) return res.status(400).json({ error: err.message });
      if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

      try {
        const result = await new Promise((resolve, reject) => {
          // resource_type 'auto' lets this same endpoint accept a video (e.g. a hero
          // background video) as well as images, without a separate upload route
          const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'auto' },
            (error, out) => (error ? reject(error) : resolve(out))
          );
          stream.end(req.file.buffer);
        });
        res.json({ url: result.secure_url });
      } catch (error) {
        console.error('Cloudinary upload error:', error);
        res.status(500).json({ error: 'Upload failed' });
      }
    });
  });

  return router;
};
