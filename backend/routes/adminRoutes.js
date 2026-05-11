const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUser,
  deactivateUser,
  changeUserRole,
  getAuditLogs
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

// All routes below require login + admin role
router.use(protect);
router.use(authorize('admin'));

// User management
router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id/deactivate', deactivateUser);
router.put('/users/:id/role', changeUserRole);

// Audit logs
router.get('/audit-logs', getAuditLogs);

module.exports = router;