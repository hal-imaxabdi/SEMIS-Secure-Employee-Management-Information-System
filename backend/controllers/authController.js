const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateOTP, hashOTP, verifyOTP, isOTPExpired } = require('../utils/otpService');
const { sendOTPEmail } = require('../utils/emailService');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Login - Step 1
// @route   POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    if (!user.isActive)
      return res.status(401).json({ message: 'Account is deactivated. Contact your administrator.' });

    if (user.lockedUntil && user.lockedUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockedUntil - Date.now()) / 60000);
      return res.status(423).json({ message: `Account locked. Try again in ${minutesLeft} minute(s).` });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      user.failedAttempts += 1;
      if (user.failedAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        user.failedAttempts = 0;
        await user.save();
        return res.status(423).json({ message: 'Too many failed attempts. Account locked for 15 minutes.' });
      }
      await user.save();
      return res.status(401).json({
        message: `Invalid email or password. ${5 - user.failedAttempts} attempt(s) remaining.`
      });
    }

    user.failedAttempts = 0;
    user.lockedUntil = null;

    const otp = generateOTP();
    user.otpCode = await hashOTP(otp);
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendOTPEmail(user.email, otp);

    res.status(200).json({
      message: 'OTP sent to your email. Please verify to continue.',
      email: user.email
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Login - Step 2 (verify OTP)
// @route   POST /api/auth/verify-otp
const verifyLoginOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.otpCode || !user.otpExpiry)
      return res.status(400).json({ message: 'No OTP found. Please login again.' });

    if (isOTPExpired(user.otpExpiry))
      return res.status(400).json({ message: 'OTP has expired. Please login again.' });

    const isValid = await verifyOTP(otp, user.otpCode);
    if (!isValid) return res.status(400).json({ message: 'Invalid OTP code.' });

    user.otpCode = null;
    user.otpExpiry = null;
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      message: 'Login successful',
      token,
      role: user.role,
      mustResetPassword: user.mustResetPassword
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Forgot password - Step 1 (send OTP)
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with that email.' });

    const otp = generateOTP();
    user.otpCode = await hashOTP(otp);
    user.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    await sendOTPEmail(user.email, otp);

    res.status(200).json({ message: 'OTP sent to your email.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Forgot password - Step 2 (reset with OTP, public)
// @route   POST /api/auth/forgot-password/reset
const forgotPasswordReset = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (isOTPExpired(user.otpExpiry))
      return res.status(400).json({ message: 'OTP has expired. Please try again.' });

    const isValid = await verifyOTP(otp, user.otpCode);
    if (!isValid) return res.status(400).json({ message: 'Invalid OTP code.' });

    user.password = newPassword;
    user.otpCode = null;
    user.otpExpiry = null;
    user.mustResetPassword = false;
    await user.save();

    res.status(200).json({ message: 'Password reset successful. Please login.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    First login forced password reset (protected — needs JWT)
// @route   PUT /api/auth/set-password
const setPassword = async (req, res) => {
  const { password } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.password = password;
    user.mustResetPassword = false;
    user.otpCode = null;
    user.otpExpiry = null;
    await user.save();

    res.status(200).json({ message: 'Password updated. Please log in again.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { login, verifyLoginOTP, forgotPassword, forgotPasswordReset, setPassword };