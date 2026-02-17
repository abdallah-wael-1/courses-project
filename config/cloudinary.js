const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const usersStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    return {
      folder: 'coursesapp/users',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      public_id: `user-${Date.now()}`
    };
  }
});

const coursesStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: (req, file) => {
    return {
      folder: 'coursesapp/courses',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      public_id: `course-${Date.now()}`
    };
  }
});

const uploadUser = multer({ storage: usersStorage });
const uploadCourse = multer({ storage: coursesStorage });

module.exports = { cloudinary, uploadUser, uploadCourse };
