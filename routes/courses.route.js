const express = require('express');
const router = express.Router();
const coursesController = require('../controllers/courses.controller');
const verifyToken = require('../middlewares/verifyToken');
const allowedTo = require('../middlewares/allowedTo');
const userRoles = require('../utils/userRoles');

// Get all / Create course
router.route('/')
  .get(coursesController.getAllCourses)
  .post(
    verifyToken,
    allowedTo(userRoles.MANAGER, userRoles.ADMIN),
    coursesController.createCourse   // يقبل JSON مباشر بدون multer
  );

// Single course
router.route('/:courseId')
  .get(coursesController.getSingleCourse)
  .patch(
    verifyToken,
    allowedTo(userRoles.MANAGER, userRoles.ADMIN),
    coursesController.updateCourse   // يقبل JSON مباشر بدون multer
  )
  .delete(
    verifyToken,
    allowedTo(userRoles.MANAGER, userRoles.ADMIN),
    coursesController.deleteCourse
  );

module.exports = router;