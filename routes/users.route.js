const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const verifyToken = require('../middlewares/verifyToken');
const multer = require('multer');
const { usersStorage } = require('../config/cloudinary');
const appError = require('../utils/appError');

// File filter for images only
const fileFilter = (req, file, cb) => {
  const imageType = file.mimetype.split('/')[0];
  if (imageType === 'image') {
    cb(null, true);
  } else {
    cb(appError.create('File must be an image', 400), false);
  }
};

// Configure multer with Cloudinary storage
const upload = multer({
  storage: usersStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});


// Get all users (Admin only)
router.route('/')
  .get(verifyToken, usersController.getAllUsers);

// Register user + upload avatar
router.route('/register')
  .post(upload.single('avatar'), usersController.register);

// Login
router.route('/login')
  .post(usersController.login);

// Profile: get & update (avatar can be updated)
router.route('/profile')
  .get(verifyToken, usersController.getProfile)
  .patch(verifyToken, upload.single('avatar'), usersController.updateProfile);

// Change password
router.route('/change-password')
  .patch(verifyToken, usersController.updatePassword);

// Delete account
router.route('/account')
  .delete(verifyToken, usersController.deleteAccount);

// Dashboard
router.route('/dashboard')
  .get(verifyToken, usersController.getDashboard);

module.exports = router;
