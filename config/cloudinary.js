const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');


const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';
const API_KEY = process.env.CLOUDINARY_API_KEY || '';
const API_SECRET = process.env.CLOUDINARY_API_SECRET || '';

console.log('🔧 Cloudinary Config Check:', {
  cloud_name: CLOUD_NAME ? ' Set' : ' Missing',
  api_key: API_KEY ? ' Set' : ' Missing',
  api_secret: API_SECRET ? ' Set' : ' Missing'
});

// Configure only if all variables exist
if (CLOUD_NAME && API_KEY && API_SECRET) {
  cloudinary.config({
    cloud_name: CLOUD_NAME,
    api_key: API_KEY,
    api_secret: API_SECRET
  });

  console.log(' Cloudinary configured successfully');
} else {
  console.warn(' Cloudinary not configured - missing environment variables');
}

// Create storages (will work only if configured)
const usersStorage = CLOUD_NAME ? new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'coursesapp/users',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit', quality: 'auto' }],
    public_id: (req, file) => `user-${Date.now()}`
  }
}) : null;

const coursesStorage = CLOUD_NAME ? new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'coursesapp/courses',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 675, crop: 'limit', quality: 'auto' }],
    public_id: (req, file) => `course-${Date.now()}`
  }
}) : null;

module.exports = { 
  cloudinary, 
  usersStorage, 
  coursesStorage 
};