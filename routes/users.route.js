const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const verifyToken = require('../middlewares/verifyToken');

// Get all users
router.route('/')
  .get(verifyToken, usersController.getAllUsers);
  
// Register
router.route('/register')
  .post(usersController.register);

// Login
router.route('/login')
  .post(usersController.login);


router.route('/profile')
  .get(verifyToken, usersController.getProfile)
  .patch(verifyToken, usersController.updateProfile);

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