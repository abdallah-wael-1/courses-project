const express = require('express');
const router = express.Router();
const coursesController = require('../controllers/courses.controller');
const verifyToken = require('../middlewares/verifyToken');
const allowedTo = require('../middlewares/allowedTo');
const userRoles = require('../utils/userRoles');
const multer = require('multer');
const appError = require('../utils/appError');
const fs = require('fs');

const coursesUploadDir = path.join(__dirname, '../uploads/courses');
if (!fs.existsSync(coursesUploadDir)) {
  fs.mkdirSync(coursesUploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/courses');
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split('/')[1];
    const fileName = `course-${Date.now()}.${ext}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const imageType = file.mimetype.split('/')[0];
  if (imageType === 'image') {
    return cb(null, true);
  } else {
    return cb(appError.create('File must be an image', 400), false);
  }
};

const upload = multer({
  storage: diskStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

router.route('/')
  .get(coursesController.getAllCourses) 
  .post(
    verifyToken,
    allowedTo(userRoles.MANAGER, userRoles.ADMIN),
    upload.single('thumbnail'),
    coursesController.createCourse
  ); 

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
    allowedTo(userRoles.ADMIN, userRoles.MANAGER),
    coursesController.deleteCourse
  ); 

module.exports = router;