const express = require('express');
const {validationSchema} = require('../middlewares/validationSchema');
const router = express.Router();
    
const coursesController = require('../controllers/courses.controller');
const verifyToken = require('../middlewares/verifyToken');
const userRoles = require('../utils/userRoles');
const allowedTo = require('../middlewares/allowedTo'); 

router.route('/')
    .get(verifyToken, coursesController.getAllCourses)   
    .post(
        verifyToken, 
        allowedTo(userRoles.MANAGER), 
        ...validationSchema(),  
        coursesController.createCourse
    );

router.route('/:courseId')
    .get(coursesController.getSingleCourse)
    .patch(coursesController.updateCourse)
    .delete(verifyToken, allowedTo(userRoles.ADMIN, userRoles.MANAGER), coursesController.deleteCourse);

module.exports = router;