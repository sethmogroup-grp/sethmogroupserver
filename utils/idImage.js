const cloudinary = require('cloudinary').v2;

/**
 * Staff ID images are sensitive, so they are uploaded as Cloudinary "authenticated" assets:
 * the plain URL does NOT work. The server hands out a signed link only to the account owner
 * and to Super Admins.
 */
const FOLDER = 'sethmo-staff-ids';

function uploadIdImage(buffer, userId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: FOLDER,
        public_id: `user-${userId}-${Date.now()}`,
        resource_type: 'image',
        type: 'authenticated',
        // Keep the file reasonable and strip nothing else - the ID must stay readable
        transformation: [{ width: 1800, height: 1800, crop: 'limit', quality: 'auto:good' }],
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
}

function signedIdImageUrl(publicId) {
  return cloudinary.url(publicId, {
    resource_type: 'image',
    type: 'authenticated',
    sign_url: true,
    secure: true,
  });
}

async function deleteIdImage(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      type: 'authenticated',
      invalidate: true,
    });
  } catch (err) {
    console.error('Could not delete ID image from Cloudinary:', err.message);
  }
}

module.exports = { uploadIdImage, signedIdImageUrl, deleteIdImage };
