const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Sector = require('./models/Sector');

dotenv.config();

const sectorsData = [
  { slug: "branding", title: "Branding & Design", description: "Comprehensive corporate branding solutions...", details: "We offer branding of all kinds..." },
  { slug: "agriculture", title: "Agribusiness", description: "Sustainable farming solutions...", details: "We leverage modern farming techniques..." },
  { slug: "mining", title: "Mining", description: "Responsible resource management...", details: "We prioritize safety and environmental stewardship..." }
  // Add more as needed
];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const doc = await Sector.getSingleton();
    doc.sectors = sectorsData;
    await doc.save();
    console.log("Sectors Seeded Successfully!");
    process.exit();
  })
  .catch(err => console.log(err));