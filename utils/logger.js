const ActivityLog = require('../models/ActivityLog');

const logActivity = async (action, source) => {
  try {
    const newLog = new ActivityLog({ action, source });
    await newLog.save();
    
    // Auto-clean: Keep only the most recent 100 logs
    const count = await ActivityLog.countDocuments();
    if (count > 100) {
      const oldest = await ActivityLog.findOne().sort({ timestamp: 1 });
      await ActivityLog.findByIdAndDelete(oldest._id);
    }
  } catch (err) {
    console.error("Logging system error:", err.message);
  }
};

module.exports = logActivity;