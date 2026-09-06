const express = require('express');
const router = express.Router();
const News = require('../models/News');

// GET: Fetch all articles for the Community Page
router.get('/', async (req, res) => {
  try {
    const articles = await News.find().sort({ createdAt: -1 });
    res.json({ articles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Sync the entire news feed
router.post('/', async (req, res) => {
  try {
    // 1. Clear existing articles to prevent duplicates during sync
    await News.deleteMany({});
    
    // 2. Insert the new list sent from the NewsManager
    const updatedArticles = await News.insertMany(req.body.articles);
    
    res.status(200).json({ 
      message: "News feed synced successfully", 
      articles: updatedArticles 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove a specific article permanently
router.delete('/:id', async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.json({ message: "Article deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;