const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const usersStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'coursesapp/users',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit', quality: 'auto' }],
    public_id: (req, file) => `user-${Date.now()}`
  }
});

const coursesStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'coursesapp/courses',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 675, crop: 'limit', quality: 'auto' }],
    public_id: (req, file) => `course-${Date.now()}`
  }
});

module.exports = { 
  cloudinary, 
  usersStorage, 
  coursesStorage 
};

