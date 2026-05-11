const User = require('../models/User');
const Employee = require('../models/Employee');
const AuditLog = require('../models/AuditLog');
const { sendOTPEmail } = require('../utils/emailService');

// @desc    Get all users
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -otpCode');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new user account
// @route   POST /api/admin/users
const createUser = async (req, res) => {
  const { email, role, firstName, lastName, department, jobTitle, hireDate } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with that email already exists.' });
    }

    // Create temp password
    const tempPassword = 'Temp@' + Math.random().toString(36).slice(-8);

    // Create user
    const user = await User.create({
      email,
      password: tempPassword,
      role,
      isActive: true,
      mustResetPassword: true
    });

    // Create employee profile
    const employeeCount = await Employee.countDocuments();
    const employeeId = `NXC-${String(employeeCount + 1).padStart(3, '0')}`;

    await Employee.create({
      userId: user._id,
      employeeId,
      firstName,
      lastName,
      department,
      jobTitle,
      hireDate: new Date(hireDate),
      status: 'active'
    });

    // Send welcome email with temp password
    await sendOTPEmail(email, tempPassword);

    // Log the action
    await AuditLog.create({
      userId: req.user._id,
      action: 'USER_CREATED',
      target: user._id,
      targetModel: 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { email, role }
    });

    res.status(201).json({ message: 'User created successfully.', employeeId });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Deactivate a user
// @route   PUT /api/admin/users/:id/deactivate
const deactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.isActive = false;
    await user.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'USER_DEACTIVATED',
      target: user._id,
      targetModel: 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { email: user.email }
    });

    res.status(200).json({ message: 'User deactivated successfully.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Change user role
// @route   PUT /api/admin/users/:id/role
const changeUserRole = async (req, res) => {
  const { role } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    await AuditLog.create({
      userId: req.user._id,
      action: 'USER_ROLE_CHANGED',
      target: user._id,
      targetModel: 'User',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { oldRole, newRole: role }
    });

    res.status(200).json({ message: 'User role updated successfully.' });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get audit logs
// @route   GET /api/admin/audit-logs
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('userId', 'email role')
      .sort({ timestamp: -1 })
      .limit(100);

    res.status(200).json(logs);

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getAllUsers, createUser, deactivateUser, changeUserRole, getAuditLogs };