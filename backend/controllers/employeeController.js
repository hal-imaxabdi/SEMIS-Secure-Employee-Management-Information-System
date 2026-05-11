const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const Leave = require('../models/Leave');

// @desc    Get own profile
// @route   GET /api/employee/profile
const getMyProfile = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Profile not found.' });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update own profile
// @route   PUT /api/employee/profile
const updateMyProfile = async (req, res) => {
  // Only allow updating safe fields
  const { phone, address } = req.body;

  try {
    const employee = await Employee.findOneAndUpdate(
      { userId: req.user._id },
      { phone, address },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    res.status(200).json({ message: 'Profile updated successfully.', employee });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get own attendance
// @route   GET /api/employee/attendance
const getMyAttendance = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    const records = await Attendance.find({ employeeId: employee._id })
      .sort({ date: -1 });

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get own payslips
// @route   GET /api/employee/payroll
const getMyPayroll = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    const records = await Payroll.find({ employeeId: employee._id })
      .sort({ month: -1 });

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Submit leave request
// @route   POST /api/employee/leave
const submitLeave = async (req, res) => {
  const { type, startDate, endDate, reason } = req.body;

  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    // Calculate days
    const days = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)
    ) + 1;

    const leave = await Leave.create({
      employeeId: employee._id,
      type,
      startDate,
      endDate,
      days,
      reason,
      status: 'pending'
    });

    res.status(201).json({ message: 'Leave request submitted.', leave });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get own leave requests
// @route   GET /api/employee/leave
const getMyLeave = async (req, res) => {
  try {
    const employee = await Employee.findOne({ userId: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    const leaves = await Leave.find({ employeeId: employee._id })
      .sort({ createdAt: -1 });

    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  getMyAttendance,
  getMyPayroll,
  submitLeave,
  getMyLeave
};