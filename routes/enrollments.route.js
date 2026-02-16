const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const {
  enrollInCourse,
  getMyEnrollments,
  updateProgress,
  updateCourseProgress 
} = require('../controllers/enrollment.controller');


router.post('/enroll', verifyToken, enrollInCourse);

router.get('/my-courses', verifyToken, getMyEnrollments);

router.put('/:enrollmentId/progress', verifyToken, updateProgress);

router.patch('/course/:courseId/progress', verifyToken, updateCourseProgress);

module.exports = router;