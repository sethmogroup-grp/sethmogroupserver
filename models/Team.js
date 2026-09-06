const mongoose = require('mongoose');

const StaffMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  bio: { type: String, default: '' },
  imageUrl: { type: String, default: '' }
});

const TeamSchema = new mongoose.Schema({
  // The general description for the leadership section
  sectionDescription: { 
    type: String, 
    default: 'Our leadership team is comprised of industry veterans dedicated to excellence.' 
  },
  members: [StaffMemberSchema]
}, { timestamps: true });

TeamSchema.statics.getSingleton = async function() {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({ members: [] });
  return doc;
};

module.exports = mongoose.model('Team', TeamSchema);