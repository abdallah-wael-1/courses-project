const express = require('express');
const router = express.Router();
const coursesController = require('../controllers/courses.controller');
const verifyToken = require('../middlewares/verifyToken');
const allowedTo = require('../middlewares/allowedTo');
const userRoles = require('../utils/userRoles');
const multer = require('multer');
const { coursesStorage } = require('../config/cloudinary');
const appError = require('../utils/appError');

// File filter for images only
const fileFilter = (req, file, cb) => {
  const imageType = file.mimetype.split('/')[0];
  if (imageType === 'image') cb(null, true);
  else cb(appError.create('File must be an image', 400), false);
};

// Configure multer with Cloudinary storage
const upload = multer({
  storage: coursesStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});


// Get all courses
router.route('/')
  .get(coursesController.getAllCourses)
  .post(
    verifyToken,
    allowedTo(userRoles.MANAGER, userRoles.ADMIN),
    upload.single('thumbnail'),  // important! same name as frontend
    coursesController.createCourse
  );

// Single course
router.route('/:courseId')
  .get(coursesController.getSingleCourse)
  .patch(
    verifyToken,
    allowedTo(userRoles.MANAGER, userRoles.ADMIN),
    upload.single('thumbnail'),
    coursesController.updateCourse
  )
  .delete(
    verifyToken,
    allowedTo(userRoles.MANAGER, userRoles.ADMIN),
    coursesController.deleteCourse
  );

module.exports = router;
