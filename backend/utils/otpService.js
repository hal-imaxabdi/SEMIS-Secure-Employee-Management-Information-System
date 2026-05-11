const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Hash OTP before saving to database
const hashOTP = async (otp) => {
  return await bcrypt.hash(otp, 10);
};

// Verify OTP entered by user against hashed OTP in database
const verifyOTP = async (enteredOTP, hashedOTP) => {
  return await bcrypt.compare(enteredOTP, hashedOTP);
};

// Check if OTP is still valid (not expired)
const isOTPExpired = (otpExpiry) => {
  return Date.now() > new Date(otpExpiry).getTime();
};

module.exports = { generateOTP, hashOTP, verifyOTP, isOTPExpired };