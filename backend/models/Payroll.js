const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const payrollSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  month: {
    type: String,
    required: true
  },
  baseSalary: {
    type: String,
    set: (value) => encrypt(value.toString()),
    get: (value) => decrypt(value)
  },
  allowances: {
    type: Number,
    default: 0
  },
  deductions: {
    type: Number,
    default: 0
  },
  netPay: {
    type: String,
    set: (value) => encrypt(value.toString()),
    get: (value) => decrypt(value)
  },
  status: {
    type: String,
    enum: ['draft', 'processed'],
    default: 'draft'
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } });

module.exports = mongoose.model('Payroll', payrollSchema);