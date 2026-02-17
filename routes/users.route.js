const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const verifyToken = require('../middlewares/verifyToken');
const appError = require('../utils/appError');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const usersUploadDir = path.join(__dirname, '../uploads/users');
if (!fs.existsSync(usersUploadDir)) {
  fs.mkdirSync(usersUploadDir, { recursive: true });
}

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/users');
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split('/')[1];  
    const fileName = `user-${Date.now()}.${ext}`;
    cb(null, fileName);
  }
});

const fileFilter = (req, file, cb) => {
  const imageType = file.mimetype.split('/')[0];

  if (imageType === 'image') {
    return cb(null, true);
  } else {
    return cb(appError.create('File must be an image', 400), false);
  }
};

const upload = multer({
  storage: diskStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
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