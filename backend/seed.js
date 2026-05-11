const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Delete existing admin if any
    await User.deleteMany({ email: 'admin@nexcore.com' });

    // Create admin user
    const admin = await User.create({
     email: 'hassmium108@gmail.com',
      password: 'Admin@123456',
      role: 'admin',
      isActive: true,
      mustResetPassword: false
    });

    console.log('✅ Admin user created:', admin.email);
    console.log('✅ Password: Admin@123456');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();