const express = require('express');
const router = express.Router();
const {
  login,
  verifyLoginOTP,
  forgotPassword,
  forgotPasswordReset,
  setPassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', login);
router.post('/verify-otp', verifyLoginOTP);
router.post('/forgot-password', forgotPassword);
router.post('/forgot-password/reset', forgotPasswordReset);
router.put('/set-password', protect, setPassword);

module.exports = router;