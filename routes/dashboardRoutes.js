const express = require('express');
const router = express.Router();
const News = require('../models/News');
const Career = require('../models/career'); // Check case sensitivity for your filename
const Team = require('../models/Team');
const ActivityLog = require('../models/ActivityLog');

router.get('/stats', async (req, res) => {
  try {
    const [newsCount, jobsCount, teamCount, logs] = await Promise.all([
      News.countDocuments(),
      Career.countDocuments(),
      Team.countDocuments(),
      ActivityLog.find().sort({ timestamp: -1 }).limit(5)
    ]);

    const recentActivity = logs.map(log => ({
      action: log.action,
      source: log.source,
      time: new Date(log.timestamp).toLocaleString('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit',
        day: 'numeric',
        month: 'short'
      })
    }));

    res.json({
      newsCount,
      jobsCount,
      teamCount,
      recentActivity
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

module.exports = router;