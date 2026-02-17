const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const verifyToken = require('../middlewares/verifyToken');
const appError = require('../utils/appError');
const multer = require('multer');
const { usersStorage } = require('../config/cloudinary');  

// File filter for images only
const fileFilter = (req, file, cb) => {
  const imageType = file.mimetype.split('/')[0];
  if (imageType === 'image') {
    return cb(null, true);
  } else {
    return cb(appError.create('File must be an image', 400), false);
  }
};

// Configure multer with Cloudinary storage
const upload = multer({
  storage: usersStorage,  
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB
  }
});

// Get all users (Admin only)
router.route('/')
  .get(verifyToken, usersController.getAllUsers);

// Register
router.route('/register')
  .post(upload.single('avatar'), usersController.register);

// Login
router.route('/login')
  .post(usersController.login);

// Get current user profile
router.route('/profile')
  .get(verifyToken, usersController.getProfile)
  .patch(verifyToken, upload.single('avatar'), usersController.updateProfile);

// Update password
router.route('/change-password')
  .patch(verifyToken, usersController.updatePassword);

// Delete account
router.route('/account')
  .delete(verifyToken, usersController.deleteAccount);

// Get User Dashboard
router.route('/dashboard')
  .get(verifyToken, usersController.getDashboard);

module.exports = router;