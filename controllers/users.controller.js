const asyncWrapper = require('../middlewares/async-wrapper');
const User = require('../models/user.model');
const Enrollment = require('../models/enrollment.model');
const Course = require('../models/course.model');
const httpStatus = require('../utils/httpStatus');
const bcrypt = require('bcryptjs');
const generateJWT = require('../utils/generateJWT');

const getAllUsers = asyncWrapper(async (req, res) => {
  const query = req.query;
  const limit = query.limit || 10;
  const page = query.page || 1;
  const skip = (page - 1) * limit;

  const users = await User.find({}, { "__v": false, password: false })
    .limit(limit)
    .skip(skip);

  res.json({ status: httpStatus.SUCCESS, data: users });
});


const register = asyncWrapper(async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body;

  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({
      status: httpStatus.FAIL,
      message: "All required fields must be provided"
    });
  }

  const oldUser = await User.findOne({ email });
  if (oldUser) {
    return res.status(400).json({
      status: httpStatus.FAIL,
      message: "User already exists"
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role: role || 'USER',
  });

  const token = await generateJWT({
    email: newUser.email,
    id: newUser._id,
    role: newUser.role
  });

  newUser.token = token;
  await newUser.save();

  res.status(201).json({
    status: httpStatus.SUCCESS,
    data: {
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
      token
    }
  });

});


const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      status: httpStatus.FAIL,
      message: "Please enter email and password"
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({
      status: httpStatus.ERROR,
      message: "User not found"
    });
  }

  const matchedPassword = await bcrypt.compare(password, user.password);
  if (!matchedPassword) {
    return res.status(400).json({
      status: httpStatus.ERROR,
      message: "Invalid email or password"
    });
  }

  const token = await generateJWT({
    email: user.email,
    id: user._id,
    role: user.role
  });

  return res.json({
    status: httpStatus.SUCCESS,
    data: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      bio: user.bio,
      location: user.location,
      dateOfBirth: user.dateOfBirth,
      occupation: user.occupation,
      education: user.education,
      token
    }
  });
});

const getProfile = asyncWrapper(async (req, res) => {
  const userId = req.currentUser.id || req.currentUser._id;

  const user = await User.findById(userId).select('-password -__v');
  if (!user) {
    return res.status(404).json({
      status: httpStatus.ERROR,
      message: "User not found"
    });
  }

  res.json({ status: httpStatus.SUCCESS, data: user });
});

const updateProfile = asyncWrapper(async (req, res) => {
  const userId = req.currentUser.id;
  const updates = req.body;

  const allowedUpdates = [
    'firstName', 'lastName', 'phone', 'bio',
    'location', 'dateOfBirth', 'occupation', 'education'
  ];

  const filteredUpdates = {};
  Object.keys(updates).forEach(key => {
    if (allowedUpdates.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    userId,
    filteredUpdates,
    { new: true, runValidators: true }
  ).select('-password -__v');

  if (!user) {
    return res.status(404).json({
      status: httpStatus.ERROR,
      message: "User not found"
    });
  }

  res.json({
    status: httpStatus.SUCCESS,
    message: "Profile updated successfully",
    data: user
  });
});

const updatePassword = asyncWrapper(async (req, res) => {
  const userId = req.currentUser.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      status: httpStatus.FAIL,
      message: "Current password and new password are required"
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      status: httpStatus.FAIL,
      message: "New password must be at least 6 characters"
    });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      status: httpStatus.ERROR,
      message: "User not found"
    });
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    return res.status(400).json({
      status: httpStatus.FAIL,
      message: "Current password is incorrect"
    });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({
    status: httpStatus.SUCCESS,
    message: "Password updated successfully"
  });
});

const deleteAccount = asyncWrapper(async (req, res) => {
  const userId = req.currentUser.id;

  const user = await User.findByIdAndDelete(userId);
  if (!user) {
    return res.status(404).json({
      status: httpStatus.ERROR,
      message: "User not found"
    });
  }

  res.json({
    status: httpStatus.SUCCESS,
    message: "Account deleted successfully"
  });
});

const getDashboard = asyncWrapper(async (req, res) => {
  const userId = req.currentUser.id || req.currentUser._id;

  const enrollments = await Enrollment.find({ user: userId })
    .populate({
      path: 'course',
      select: 'title thumbnail instructor rating category duration level price studentsCount'
    })
    .sort({ lastAccessed: -1 });

  const totalEnrolled = enrollments.length;
  const completed = enrollments.filter(e => e.status === 'completed').length;
  const totalHours = enrollments.reduce((sum, e) => sum + (e.course?.duration || 0), 0);
  const certificates = enrollments.filter(e => e.progress === 100 || e.status === 'completed').length;
  const avgProgress = totalEnrolled > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / totalEnrolled)
    : 0;

  const recentActivity = enrollments.slice(0, 5).map(e => ({
    courseTitle: e.course?.title || 'Unknown Course',
    lastAccessed: e.lastAccessed,
    progress: e.progress
  }));

  const monthlyGoal = 3;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const completedThisMonth = enrollments.filter(e => {
    if (e.status !== 'completed') return false;
    const d = new Date(e.updatedAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  const formattedEnrollments = enrollments.map(e => ({
    id: e._id,
    courseId: e.course?._id,
    title: e.course?.title || 'Course Not Found',
    thumbnail: e.course?.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
    instructor: e.course?.instructor || 'Unknown',
    rating: e.course?.rating || 0,
    category: e.course?.category || 'Other',
    duration: e.course?.duration || 0,
    level: e.course?.level || 'All Levels',
    price: e.course?.price || 0,
    progress: e.progress,
    completedLessons: e.completedLessons,
    totalLessons: e.course?.lessonsCount || 0,
    lastAccessed: e.lastAccessed,
    enrolledAt: e.enrolledAt,
    status: e.status,
    studentsCount: e.course?.studentsCount || 0
  }));

  res.json({
    status: httpStatus.SUCCESS,
    data: {
      stats: { totalEnrolled, completed, totalHours, certificates, avgProgress },
      enrollments: formattedEnrollments,
      recentActivity,
      monthlyGoal: {
        target: monthlyGoal,
        completed: completedThisMonth,
        progress: Math.min(Math.round((completedThisMonth / monthlyGoal) * 100), 100)
      }
    }
  });
});

module.exports = {
  getAllUsers,
  register,
  login,
  getProfile,
  updateProfile,
  updatePassword,
  deleteAccount,
  getDashboard
};