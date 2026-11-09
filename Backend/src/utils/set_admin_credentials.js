const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const UserDetails = require('../models/UserDetails');

const ADMIN_EMAIL = 'nandinigottipati2004@gmail.com';
const ADMIN_PASSWORD_RAW = 'Nandhini@2004';
const ADMIN_NAME = 'Nandini Gottipati';

async function setAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/kaya');
    console.log('Connected to MongoDB');

    let user = await User.findOne({ email: ADMIN_EMAIL }).select('+password');
    if (!user) {
      console.log(`User ${ADMIN_EMAIL} not found, creating new admin account...`);
      user = new User({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD_RAW,
        is_admin: true,
      });
      await user.save();
    } else {
      console.log(`User ${ADMIN_EMAIL} exists, updating credentials...`);
      user.name = ADMIN_NAME;
      user.is_admin = true;
      user.password = ADMIN_PASSWORD_RAW; // will be hashed by pre('save') hook
      await user.save();
    }

    // Ensure UserDetails exists
    let details = await UserDetails.findOne({ user: user._id });
    if (!details) {
      details = await UserDetails.create({
        user: user._id,
        name: user.name,
        email: user.email,
        phone: '+91 98765 43210',
        address: 'KaYa Executive Atelier',
        city: 'Mumbai',
        state: 'Maharashtra',
        postal_code: '400001',
        country: 'India',
        bio: 'Chief Executive Atelier Administrator for KaYa Luxury Home Curation.',
        preferred_style: 'Modern Luxury',
      });
      user.details = details._id;
      await user.save();
    }

    // Verify password comparison
    const verifiedUser = await User.findOne({ email: ADMIN_EMAIL }).select('+password');
    const isMatch = await verifiedUser.comparePassword(ADMIN_PASSWORD_RAW);
    console.log(`Admin user verification:`);
    console.log(`- Name: ${verifiedUser.name}`);
    console.log(`- Email: ${verifiedUser.email}`);
    console.log(`- is_admin: ${verifiedUser.is_admin}`);
    console.log(`- Password verification: ${isMatch ? 'PASSED (MATCH)' : 'FAILED'}`);

    if (isMatch && verifiedUser.is_admin) {
      console.log('\nSUCCESS: Admin credentials successfully set and verified in MongoDB.');
      process.exit(0);
    } else {
      console.error('\nERROR: Verification failed.');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error setting admin credentials:', err);
    process.exit(1);
  }
}

setAdmin();

