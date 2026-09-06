const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

const connectCloudinary = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    console.log(`Cloudinary Configured: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  } catch (error) {
    console.error(`Cloudinary Error: ${error.message}`);
  }
};

module.exports = connectCloudinary;