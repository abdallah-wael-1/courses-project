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

  // Search filter
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { instructor: { $regex: search, $options: 'i' } }
    ];
  }

  // Category filter
  if (category) {
    query.category = category;
  }

  // Level filter
  if (level) {
    query.level = level;
  }

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

// Create new course
const createCourse = asyncWrapper(async (req, res) => {
  try {
    const { title, description, price, category, level, duration, instructor, tags } = req.body;

    console.log(' Creating course:', {
      title,
      hasFile: !!req.file,
      fileDetails: req.file ? {
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size
      } : null
    });

    if (!title || !description || !price || !duration || !instructor) {
      return res.status(400).json({
        status: httpStatus.FAIL,
        message: "All required fields must be provided"
      });
    }

    //  Default thumbnail from Unsplash
    let thumbnailPath = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=675';
    
    if (req.file) {
      thumbnailPath = req.file.path; 
      console.log(' Thumbnail uploaded to Cloudinary:', thumbnailPath);
    } else {
      console.log(' No thumbnail uploaded, using default');
    }

    const newCourse = new Course({
      title,
      description,
      price,
      category: category || 'Other',
      level: level || 'All Levels',
      duration,
      instructor,
      thumbnail: thumbnailPath,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      createdBy: req.currentUser.id
    });

    await newCourse.save();

    console.log(' Course created successfully:', {
      id: newCourse._id,
      title: newCourse.title,
      thumbnail: newCourse.thumbnail
    });

    res.status(201).json({
      status: httpStatus.SUCCESS,
      data: { course: newCourse }
    });
  } catch (error) {
    console.error(' Create course error:', error);
    res.status(500).json({
      status: httpStatus.ERROR,
      message: error.message
    });
  }
});

// Update course
const updateCourse = asyncWrapper(async (req, res) => {
  const courseId = req.params.courseId;
  const updates = req.body;

  console.log(' Updating course:', courseId, {
    hasFile: !!req.file,
    updates: Object.keys(updates)
  });

  //  Use Cloudinary URL if new file uploaded
  if (req.file) {
    updates.thumbnail = req.file.path; 
    console.log(' Thumbnail updated to Cloudinary:', updates.thumbnail);
  }

  // Handle tags
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

  console.log('⚠️ Course deleted:', course.title);

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