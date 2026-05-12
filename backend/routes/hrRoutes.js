const express = require('express');
const router = express.Router();
const {
  getAllEmployees, getEmployee, createEmployee, updateEmployee, archiveEmployee,
  getAllAttendance, recordAttendance, getAttendance,
  getAllPayroll, createPayroll, getPayroll,
  getAllLeave, reviewLeave
} = require('../controllers/hrController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.use(protect);
router.use(authorize('admin', 'hr'));

// Employees
router.get('/employees', getAllEmployees);
router.post('/employees', createEmployee);
router.get('/employees/:id', getEmployee);
router.put('/employees/:id', updateEmployee);
router.put('/employees/:id/archive', archiveEmployee);

// Attendance
router.get('/attendance', getAllAttendance);
router.post('/attendance', recordAttendance);
router.get('/attendance/:employeeId', getAttendance);

// Payroll
router.get('/payroll', getAllPayroll);
router.post('/payroll', createPayroll);
router.get('/payroll/:employeeId', getPayroll);

// Leave
router.get('/leave', getAllLeave);
router.put('/leave/:id', reviewLeave);

module.exports = router;