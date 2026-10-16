const mongoose = require('mongoose');

const StaffMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  // Short line shown under the name on the leadership grid card (not used for the President spotlight)
  tagline: { type: String, default: '' },
  bio: { type: String, default: '' },
  imageUrl: { type: String, default: '' }
});

const TeamSchema = new mongoose.Schema({
  // Heading + intro paragraph shown above the leadership grid
  sectionHeading: {
    type: String,
    default: 'Group Executive Leadership'
  },
  sectionDescription: { 
    type: String, 
    default: "Our senior leadership brings deep industry expertise, strategic foresight, and decisive leadership to Sethmo Group. Through strong governance, strategic oversight, disciplined investment, and the development of our subsidiaries, they shape the Group's direction, strengthen business performance, unlock new opportunities, and build the foundation for sustainable long-term growth."
  },
  // NOTE: the first member in the list is always shown as the "Group President" spotlight;
  // every member after that appears as a tile in the "Group Executive Leadership" grid.
  members: [StaffMemberSchema]
}, { timestamps: true });

TeamSchema.statics.getSingleton = async function() {
  let doc = await this.findOne();
  if (!doc) doc = await this.create({ members: [] });
  return doc;
};

module.exports = mongoose.model('Team', TeamSchema);