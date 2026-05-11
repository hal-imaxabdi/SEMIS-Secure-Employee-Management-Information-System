const mongoose = require('mongoose');
const { encrypt, decrypt } = require('../utils/encryption');

const employeeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  employeeId: {
    type: String,
    unique: true,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  department: {
    type: String,
    enum: ['Engineering', 'Product', 'DevOps', 'Sales', 'Finance', 'HR', 'Legal'],
    required: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  nationalId: {
    type: String,
    set: (value) => value ? encrypt(value) : value,
    get: (value) => value ? decrypt(value) : value
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  hireDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  }
}, { timestamps: true, toJSON: { getters: true }, toObject: { getters: true } });

module.exports = mongoose.model('Employee', employeeSchema);