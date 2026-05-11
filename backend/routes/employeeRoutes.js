const express = require('express');
const router = express.Router();
const {
  getMyProfile,
  updateMyProfile,
  getMyAttendance,
  getMyPayroll,
  submitLeave,
  getMyLeave
} = require('../controllers/employeeController');
const { protect } = require('../middleware/auth');

// All routes below require login
router.use(protect);

// Profile
router.get('/profile', getMyProfile);
router.put('/profile', updateMyProfile);

// Attendance
router.get('/attendance', getMyAttendance);

// Payroll
router.get('/payroll', getMyPayroll);

// Leave
router.post('/leave', submitLeave);
router.get('/leave', getMyLeave);

module.exports = router;