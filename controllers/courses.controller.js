const Course = require('../models/course.model');
const asyncWrapper = require('../middlewares/async-wrapper');
const httpStatus = require('../utils/httpStatus');

// Get all courses with pagination and filtering
const getAllCourses = asyncWrapper(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    search = '',
    category = '',
    level = '',
    sort = '-createdAt'
  } = req.query;

  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { instructor: { $regex: search, $options: 'i' } }
    ];
  }

  if (category) query.category = category;
  if (level) query.level = level;

  const skip = (page - 1) * limit;

  const courses = await Course.find(query)
    .sort(sort)
    .limit(parseInt(limit))
    .skip(skip)
    .select('-__v');

  const total = await Course.countDocuments(query);

  res.json({
    status: httpStatus.SUCCESS,
    data: {
      courses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// Get single course by ID
const getSingleCourse = asyncWrapper(async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId).select('-__v');

  if (!course) {
    return res.status(404).json({
      status: httpStatus.ERROR,
      message: "Course not found"
    });
  }

  res.json({
    status: httpStatus.SUCCESS,
    data: { course }
  });
});

const createCourse = asyncWrapper(async (req, res) => {
  const { title, description, price, category, level, duration, instructor, tags } = req.body;

  if (!title || !description || !price || !duration || !instructor) {
    return res.status(400).json({
      status: httpStatus.FAIL,
      message: "All required fields must be provided"
    });
  }

  const newCourse = new Course({
    title,
    description,
    price,
    category: category || 'Other',
    level: level || 'All Levels',
    duration,
    instructor,
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=675',
    tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
    createdBy: req.currentUser.id
  });

  await newCourse.save();

  res.status(201).json({
    status: httpStatus.SUCCESS,
    data: { course: newCourse }
  });
});

const updateCourse = asyncWrapper(async (req, res) => {
  const courseId = req.params.courseId;
  const updates = req.body;
  if ('thumbnail' in updates) delete updates.thumbnail;

  if (updates.tags && typeof updates.tags === 'string') {
    updates.tags = updates.tags.split(',').map(tag => tag.trim());
  }

  const course = await Course.findByIdAndUpdate(
    courseId,
    updates,
    { new: true, runValidators: true }
  );

  if (!course) {
    return res.status(404).json({
      status: httpStatus.ERROR,
      message: "Course not found"
    });
  }

  res.json({
    status: httpStatus.SUCCESS,
    data: { course }
  });
});

// Delete course
const deleteCourse = asyncWrapper(async (req, res) => {
  const courseId = req.params.courseId;

  const course = await Course.findByIdAndDelete(courseId);

  if (!course) {
    return res.status(404).json({
      status: httpStatus.ERROR,
      message: "Course not found"
    });
  }

  res.json({
    status: httpStatus.SUCCESS,
    message: "Course deleted successfully",
    data: null
  });
});

module.exports = {
  getAllCourses,
  getSingleCourse,
  createCourse,
  updateCourse,
  deleteCourse
};