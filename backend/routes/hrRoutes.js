const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  getEmployee,
  updateEmployee,
  archiveEmployee,
  recordAttendance,
  getAttendance,
  createPayroll,
  getPayroll,
  getAllLeave,
  reviewLeave
} = require('../controllers/hrController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// All routes below require login + hr or admin role
router.use(protect);
router.use(authorize('admin', 'hr'));

// Employee routes
router.get('/employees', getAllEmployees);
router.get('/employees/:id', getEmployee);
router.put('/employees/:id', updateEmployee);
router.put('/employees/:id/archive', archiveEmployee);

// Attendance routes
router.post('/attendance', recordAttendance);
router.get('/attendance/:employeeId', getAttendance);

// Payroll routes
router.post('/payroll', createPayroll);
router.get('/payroll/:employeeId', getPayroll);

// Leave routes
router.get('/leave', getAllLeave);
router.put('/leave/:id', reviewLeave);

module.exports = router;