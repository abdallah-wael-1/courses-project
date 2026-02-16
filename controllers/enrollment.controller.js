const Enrollment = require('../models/enrollment.model');
const Course = require('../models/course.model');
const asyncWrapper = require('../middlewares/async-wrapper');

exports.enrollInCourse = asyncWrapper(async (req, res) => {
  const { courseId } = req.body;
  const userId = req.currentUser.id || req.currentUser._id;

  console.log('📌 Enrolling user:', userId, 'in course:', courseId);

  const course = await Course.findById(courseId);
  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'Course not found'
    });
  }

  const existingEnrollment = await Enrollment.findOne({
    user: userId,
    course: courseId
  });

  if (existingEnrollment) {
    return res.status(400).json({
      success: false,
      message: 'You are already enrolled in this course'
    });
  }

  const enrollment = await Enrollment.create({
    user: userId,
    course: courseId
  });

  await Course.findByIdAndUpdate(courseId, {
    $inc: { studentsCount: 1 }
  });

  console.log('✅ Enrollment successful!');

  res.status(201).json({
    success: true,
    message: 'Successfully enrolled in course!',
    data: enrollment
  });
});

exports.getMyEnrollments = asyncWrapper(async (req, res) => {
  const userId = req.currentUser.id || req.currentUser._id;

  const enrollments = await Enrollment.find({ user: userId })
    .populate({
      path: 'course',
      select: 'title description instructor thumbnail price rating duration category level studentsCount'
    })
    .sort({ lastAccessed: -1 });

  res.status(200).json({
    success: true,
    count: enrollments.length,
    data: enrollments
  });
});

exports.updateProgress = asyncWrapper(async (req, res) => {
  const { enrollmentId } = req.params;
  const { progress, completedLessons } = req.body;
  const userId = req.currentUser.id || req.currentUser._id;

  const enrollment = await Enrollment.findOne({
    _id: enrollmentId,
    user: userId
  });

  if (!enrollment) {
    return res.status(404).json({
      success: false,
      message: 'Enrollment not found'
    });
  }

  enrollment.progress = progress !== undefined ? progress : enrollment.progress;
  enrollment.completedLessons = completedLessons !== undefined ? completedLessons : enrollment.completedLessons;
  enrollment.lastAccessed = Date.now();
  enrollment.status = progress >= 100 ? 'completed' : 'active';

  await enrollment.save();

  res.status(200).json({
    success: true,
    data: enrollment
  });
});

exports.updateCourseProgress = asyncWrapper(async (req, res) => {
  const { courseId } = req.params;
  const { progress, completedLessons } = req.body;
  const userId = req.currentUser.id || req.currentUser._id;

  console.log('📝 Updating progress for course:', courseId, 'user:', userId);
  console.log('📊 New progress:', { progress, completedLessons });

  const enrollment = await Enrollment.findOne({
    user: userId,
    course: courseId
  });

  if (!enrollment) {
    return res.status(404).json({
      success: false,
      message: 'Enrollment not found. Please enroll in this course first.'
    });
  }

  if (progress !== undefined) {
    enrollment.progress = Math.min(Math.max(progress, 0), 100); 
  }
  
  if (completedLessons !== undefined) {
    enrollment.completedLessons = completedLessons;
  }
  
  enrollment.lastAccessed = Date.now();
  enrollment.status = enrollment.progress >= 100 ? 'completed' : 'active';

  await enrollment.save();

  console.log('✅ Progress updated successfully:', {
    progress: enrollment.progress,
    status: enrollment.status
  });

  res.status(200).json({
    success: true,
    message: 'Progress updated successfully',
    data: enrollment
  });
});