const { validationResult} = require('express-validator');
const Course = require('../models/course.model');
const httpStatus = require('../utils/httpStatus');
const asyncWrapper = require('../middlewares/async-wrapper');
const appError = require('../utils/appError');
const getAllCourses = asyncWrapper ( async (req, res) => {
    const query = req.query
    const limit = query.limit || 10;
    const page = query.page || 1;
    const skip = (page - 1) * limit;
    const courses = await Course.find({price : {$gt : 400}} , {"__v" : false }).limit(limit).skip(skip);
    res.json({status : httpStatus.SUCCESS , data : courses});
})

const getSingleCourse = asyncWrapper(async (req, res, next) => {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
        const error = appError.create('Course not found', 404, httpStatus.FAIL);
        return next(error);
    }

    res.json({ status: httpStatus.SUCCESS, data: course });
});




const createCourse = asyncWrapper( async (req, res , next) => {
    const errors = validationResult(req);
    console.log("Errors :" , errors);
    if(!errors.isEmpty()){
        const error = appError.create(errors.array() , 400 , httpStatus.FAIL) ; 
        return next(error);
    }

    const newCourse = new Course(req.body);

    await newCourse.save();

    res.status(201).json({status : httpStatus.SUCCESS , data : newCourse});
})


const updateCourse = asyncWrapper ( async (req, res) => {
    const courseId = req.params.courseId;
    try  {   
    const updatedCourse = await Course.updateOne({_id : courseId},{$set:{ ...req.body}});
    res.status(200).json({status : httpStatus.SUCCESS , data : updatedCourse});
    }
    catch(err) {
        return res.status(500).json({status : httpStatus.ERROR , message : "Invalid object id" + err.message, data : null});
    }
})


const deleteCourse = asyncWrapper(async (req, res, next) => {
    const course = await Course.findByIdAndDelete(req.params.courseId);

    if (!course) {
        const error = appError.create('Course not found', 404, httpStatus.FAIL);
        return next(error);
    }

    res.status(200).json({
        status: httpStatus.SUCCESS,
        message: "Course deleted successfully",
        data: null
    });
});



module.exports = {
    getAllCourses,
    getSingleCourse,
    updateCourse,
    deleteCourse,
    createCourse 
}