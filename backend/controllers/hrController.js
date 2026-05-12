const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const Leave = require('../models/Leave');
const AuditLog = require('../models/AuditLog');

// ─── EMPLOYEES ───────────────────────────────────────────

const getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().populate('userId', 'email role isActive');
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).populate('userId', 'email role isActive');
    if (!employee) return res.status(404).json({ message: 'Employee not found.' });
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!employee) return res.status(404).json({ message: 'Employee not found.' });
    await AuditLog.create({
      userId: req.user._id, action: 'EMPLOYEE_UPDATED', target: employee._id,
      targetModel: 'Employee', ipAddress: req.ip, userAgent: req.headers['user-agent'], details: req.body
    });
    res.status(200).json({ message: 'Employee updated successfully.', employee });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const archiveEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, { status: 'archived' }, { new: true });
    if (!employee) return res.status(404).json({ message: 'Employee not found.' });
    await AuditLog.create({
      userId: req.user._id, action: 'EMPLOYEE_ARCHIVED', target: employee._id,
      targetModel: 'Employee', ipAddress: req.ip, userAgent: req.headers['user-agent'],
      details: { employeeId: employee.employeeId }
    });
    res.status(200).json({ message: 'Employee archived successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── ATTENDANCE ───────────────────────────────────────────

const getAllAttendance = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate('employeeId', 'firstName lastName department')
      .sort({ date: -1 })
      .limit(500);
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const recordAttendance = async (req, res) => {
  const { employeeId, date, checkIn, checkOut, status, notes } = req.body;
  try {
    let hoursWorked = 0;
    if (checkIn && checkOut) {
      hoursWorked = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60);
    }
    const attendance = await Attendance.create({
      employeeId, date, checkIn, checkOut,
      hoursWorked: parseFloat(hoursWorked.toFixed(2)), status, notes
    });
    res.status(201).json({ message: 'Attendance recorded.', attendance });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getAttendance = async (req, res) => {
  try {
    const records = await Attendance.find({ employeeId: req.params.employeeId })
      .populate('employeeId', 'firstName lastName department')
      .sort({ date: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── PAYROLL ───────────────────────────────────────────

const getAllPayroll = async (req, res) => {
  try {
    const records = await Payroll.find()
      .populate('employeeId', 'firstName lastName department')
      .sort({ month: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const createPayroll = async (req, res) => {
  const { employeeId, month, baseSalary, allowances, deductions } = req.body;
  try {
    const netPay = (parseFloat(baseSalary) + parseFloat(allowances || 0) - parseFloat(deductions || 0)).toString();
    const payroll = await Payroll.create({
      employeeId, month,
      baseSalary: baseSalary.toString(),
      allowances: allowances || 0,
      deductions: deductions || 0,
      netPay,
      status: 'processed',
      generatedBy: req.user._id
    });
    await AuditLog.create({
      userId: req.user._id, action: 'PAYROLL_CREATED', target: payroll._id,
      targetModel: 'Payroll', ipAddress: req.ip, userAgent: req.headers['user-agent'],
      details: { employeeId, month }
    });
    res.status(201).json({ message: 'Payroll record created.', payroll });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getPayroll = async (req, res) => {
  try {
    const records = await Payroll.find({ employeeId: req.params.employeeId })
      .populate('employeeId', 'firstName lastName department')
      .sort({ month: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ─── LEAVE ───────────────────────────────────────────

const getAllLeave = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate('employeeId', 'firstName lastName department')
      .sort({ createdAt: -1 });
    res.status(200).json(leaves);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const reviewLeave = async (req, res) => {
  const { status } = req.body;
  try {
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status, reviewedBy: req.user._id, reviewedAt: new Date() },
      { new: true }
    );
    if (!leave) return res.status(404).json({ message: 'Leave request not found.' });
    await AuditLog.create({
      userId: req.user._id, action: `LEAVE_${status.toUpperCase()}`, target: leave._id,
      targetModel: 'Leave', ipAddress: req.ip, userAgent: req.headers['user-agent'], details: { status }
    });
    res.status(200).json({ message: `Leave ${status} successfully.`, leave });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getAllEmployees, getEmployee, updateEmployee, archiveEmployee,
  getAllAttendance, recordAttendance, getAttendance,
  getAllPayroll, createPayroll, getPayroll,
  getAllLeave, reviewLeave
};