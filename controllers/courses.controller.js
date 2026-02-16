const { validationResult } = require('express-validator');
const Course = require('../models/course.model');
const httpStatus = require('../utils/httpStatus');
const asyncWrapper = require('../middlewares/async-wrapper');
const appError = require('../utils/appError');

const getAllCourses = asyncWrapper(async (req, res) => {
  const { 
    page = 1, 
    limit = 12, 
    category, 
    level, 
    minPrice, 
    maxPrice,
    search,
    sort = '-createdAt' 
  } = req.query;
console.log(req.query);

  const skip = (page - 1) * limit;

  const filter = {};

  if (category) filter.category = category;
  if (level) filter.level = level;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { instructor: { $regex: search, $options: 'i' } },
    ];
  }

  const [courses, total] = await Promise.all([
    Course.find(filter, { __v: false })
      .sort(sort)
      .limit(Number(limit))
      .skip(skip),
    Course.countDocuments(filter),
  ]);

  res.json({
    status: httpStatus.SUCCESS,
    data: {
      courses,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// Get Single Course
const getSingleCourse = asyncWrapper(async (req, res, next) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    const error = appError.create('Course not found', 404, httpStatus.FAIL);
    return next(error);
  }

  res.json({ status: httpStatus.SUCCESS, data: course });
});


// Create Course
const createCourse = asyncWrapper(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = appError.create(errors.array(), 400, httpStatus.FAIL);
    return next(error);
  }

  const courseData = {
    ...req.body,
    createdBy: req.currentUser.id,
  };

  if (req.file) {
    courseData.thumbnail = `uploads/courses/${req.file.filename}`;
  }

  const newCourse = new Course(courseData);
  await newCourse.save();

  res.status(201).json({ 
    status: httpStatus.SUCCESS, 
    data: newCourse 
  });
});

// Update Course
const updateCourse = asyncWrapper(async (req, res, next) => {
  const courseId = req.params.courseId;

  const updateData = { ...req.body };

  if (req.file) {
    updateData.thumbnail = `uploads/courses/${req.file.filename}`;
  }

  const updatedCourse = await Course.findByIdAndUpdate(
    courseId,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!updatedCourse) {
    const error = appError.create('Course not found', 404, httpStatus.FAIL);
    return next(error);
  }

  res.status(200).json({ 
    status: httpStatus.SUCCESS, 
    data: updatedCourse 
  });
});

// Delete Course
const deleteCourse = asyncWrapper(async (req, res, next) => {
  const course = await Course.findByIdAndDelete(req.params.courseId);

  if (!course) {
    const error = appError.create('Course not found', 404, httpStatus.FAIL);
    return next(error);
  }

  res.status(200).json({
    status: httpStatus.SUCCESS,
    message: 'Course deleted successfully',
    data: null,
  });
});

module.exports = {
  getAllCourses,
  getSingleCourse,
  createCourse,
  updateCourse,
  deleteCourse,
};