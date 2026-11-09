const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  getUserDetails,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.get('/details', protect, getUserDetails);
router.get('/profile', protect, getUserDetails);
router.put('/profile', protect, updateProfile);
router.patch('/profile', protect, updateProfile);
router.put('/details', protect, updateProfile);
router.patch('/details', protect, updateProfile);
router.put('/change-password', protect, changePassword);
router.post('/change-password', protect, changePassword);

module.exports = router;

