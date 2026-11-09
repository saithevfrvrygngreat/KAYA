const jwt = require('jsonwebtoken');
const User = require('../models/User');
const UserDetails = require('../models/UserDetails');
const { sendPasswordResetOtpEmail } = require('../services/emailService');

// Generate JWT token
const JWT_SECRET = process.env.JWT_SECRET || 'kaya_luxury_super_secret_jwt_key_2026_modern_secure';

const signToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const formatUser = (user, details = null) => {
  const isAdmin = Boolean(user.is_admin === true || user.role === 'admin' || user.role === 'administrator');
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    is_admin: isAdmin,
    role: isAdmin ? 'admin' : (user.role || 'user'),
    profile_image: details?.profile_image || user.profile_image || '',
    avatar: details?.avatar || details?.profile_image || user.profile_image || '',
    phone: details?.phone || user.phone || '',
    address: details?.address || user.address || '',
    city: details?.city || user.city || '',
    state: details?.state || '',
    postal_code: details?.postal_code || user.postal_code || '',
    country: details?.country || 'India',
    bio: details?.bio || user.bio || '',
    preferred_style: details?.preferred_style || 'Contemporary Minimalist',
    design_firm: details?.design_firm || '',
    details_id: details?._id || user.details || null,
    createdAt: user.createdAt,
    updatedAt: details?.updatedAt || user.updatedAt,
  };
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, password_confirmation } = req.body;

    // Validation
    const errors = {};
    if (!name || name.trim().length === 0) errors.name = 'Name is required.';
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) errors.email = 'A valid email is required.';
    if (!password) {
      errors.password = 'Password is required.';
    } else {
      if (password.length < 8) errors.password = 'Password must be at least 8 characters long.';
      else if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
        errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
      }
    }
    if (password !== password_confirmation) errors.password_confirmation = 'The password confirmation does not match.';

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ message: 'Validation failed', errors });
    }

    // Check email uniqueness
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(422).json({ message: 'Validation failed', errors: { email: 'This email address is already in use.' } });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
    });

    // Automatically create corresponding UserDetails document in user_details collection
    const details = await UserDetails.create({
      user: user._id,
      name: user.name,
      email: user.email,
      phone: '',
      address: '',
      city: '',
      postal_code: '',
      bio: '',
      profile_image: '',
      preferred_style: 'Contemporary Minimalist',
    });

    user.details = details._id;
    await user.save();

    const token = signToken(user._id);

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: formatUser(user, details),
      details,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(422).json({ message: 'Validation failed', errors: { email: 'Email and password are required.' } });
    }

    const cleanEmail = String(email).trim();
    const cleanPassword = String(password);

    // Case-insensitive query to find user across any casing stored in MongoDB Atlas
    const user = await User.findOne({
      $or: [
        { email: cleanEmail.toLowerCase() },
        { email: cleanEmail },
        { email: new RegExp(`^${cleanEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      ],
    }).select('+password');

    if (!user) {
      console.warn(`[Auth] Login rejected: No user record found for email '${cleanEmail}'`);
      return res.status(401).json({ message: 'Validation failed', errors: { email: 'The provided credentials do not match our records.' } });
    }

    const passwordMatch = await user.comparePassword(cleanPassword);
    if (!passwordMatch) {
      console.warn(`[Auth] Login rejected: Password mismatch for user '${user.email}'`);
      return res.status(401).json({ message: 'Validation failed', errors: { email: 'The provided credentials do not match our records.' } });
    }

    // Determine admin status according to database record
    const isAdmin = Boolean(user.is_admin === true || user.role === 'admin' || user.role === 'administrator');

    // Retrieve or initialize user details
    let details = await UserDetails.findOne({ user: user._id });
    if (!details) {
      details = await UserDetails.create({
        user: user._id,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postal_code: user.postal_code || '',
        bio: user.bio || '',
        profile_image: user.profile_image || '',
        preferred_style: 'Contemporary Minimalist',
      });
      await User.findByIdAndUpdate(user._id, { details: details._id });
    }

    const token = signToken(user._id);

    console.log(`[Auth] User authenticated successfully: ${user.email} (Role: ${isAdmin ? 'Admin' : 'Customer'})`);

    res.json({
      message: isAdmin ? 'Welcome to the Admin Control Panel!' : 'Logged in successfully!',
      token,
      user: formatUser(user, details),
      details,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  try {
    let details = await UserDetails.findOne({ user: req.user._id });
    if (!details) {
      details = await UserDetails.create({
        user: req.user._id,
        name: req.user.name || '',
        email: req.user.email || '',
        phone: req.user.phone || '',
        address: req.user.address || '',
        city: req.user.city || '',
        postal_code: req.user.postal_code || '',
        bio: req.user.bio || '',
        profile_image: req.user.profile_image || '',
        preferred_style: 'Contemporary Minimalist',
      });
      await User.findByIdAndUpdate(req.user._id, { details: details._id });
    }
    res.json({
      user: formatUser(req.user, details),
      details,
    });
  } catch (err) {
    res.json({
      user: formatUser(req.user),
    });
  }
};

// GET /api/auth/details
const getUserDetails = async (req, res) => {
  try {
    let details = await UserDetails.findOne({ user: req.user._id });
    if (!details) {
      details = await UserDetails.create({
        user: req.user._id,
        name: req.user.name || '',
        email: req.user.email || '',
        phone: req.user.phone || '',
        address: req.user.address || '',
        city: req.user.city || '',
        postal_code: req.user.postal_code || '',
        bio: req.user.bio || '',
        profile_image: req.user.profile_image || '',
        preferred_style: 'Contemporary Minimalist',
      });
      await User.findByIdAndUpdate(req.user._id, { details: details._id });
    }
    res.json({
      success: true,
      details,
      user: formatUser(req.user, details),
    });
  } catch (err) {
    console.error('getUserDetails error:', err);
    res.status(500).json({ message: 'Failed to fetch user details.' });
  }
};

// PUT /api/auth/profile and PUT /api/auth/details
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      name,
      phone,
      address,
      city,
      state,
      postal_code,
      country,
      bio,
      profile_image,
      avatar,
      preferred_style,
      design_firm,
    } = req.body;

    // Strict constraint: User cannot edit their email
    if (req.body.email && req.body.email.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
      return res.status(400).json({ message: 'Email address is permanent and cannot be modified.' });
    }

    const userUpdate = {};
    const detailsUpdate = {
      user: userId,
      email: user.email,
    };

    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return res.status(422).json({ message: 'Name cannot be empty', errors: { name: 'Name is required' } });
      }
      userUpdate.name = name.trim();
      detailsUpdate.name = name.trim();
    }

    if (phone !== undefined) {
      userUpdate.phone = String(phone).trim();
      detailsUpdate.phone = String(phone).trim();
    }
    if (address !== undefined) {
      userUpdate.address = String(address).trim();
      detailsUpdate.address = String(address).trim();
    }
    if (city !== undefined) {
      userUpdate.city = String(city).trim();
      detailsUpdate.city = String(city).trim();
    }
    if (state !== undefined) {
      detailsUpdate.state = String(state).trim();
    }
    if (postal_code !== undefined) {
      userUpdate.postal_code = String(postal_code).trim();
      detailsUpdate.postal_code = String(postal_code).trim();
    }
    if (country !== undefined) {
      detailsUpdate.country = String(country).trim();
    }
    if (bio !== undefined) {
      userUpdate.bio = String(bio).trim();
      detailsUpdate.bio = String(bio).trim();
    }
    if (profile_image !== undefined) {
      userUpdate.profile_image = profile_image;
      detailsUpdate.profile_image = profile_image;
    }
    if (avatar !== undefined) {
      detailsUpdate.avatar = avatar;
    }
    if (preferred_style !== undefined) {
      detailsUpdate.preferred_style = String(preferred_style).trim();
    }
    if (design_firm !== undefined) {
      detailsUpdate.design_firm = String(design_firm).trim();
    }

    // 1. Update the User document directly via findByIdAndUpdate to avoid password validation bugs
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: userUpdate },
      { new: true, runValidators: true }
    );

    // 2. Upsert into dedicated UserDetails collection
    const updatedDetails = await UserDetails.findOneAndUpdate(
      { user: userId },
      { $set: detailsUpdate },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    // Ensure user has reference to details
    if (!updatedUser.details || String(updatedUser.details) !== String(updatedDetails._id)) {
      await User.findByIdAndUpdate(userId, { details: updatedDetails._id });
      updatedUser.details = updatedDetails._id;
    }

    res.json({
      message: 'Profile details updated successfully!',
      user: formatUser(updatedUser, updatedDetails),
      details: updatedDetails,
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({
      message: err.message || 'Failed to update profile details.',
    });
  }
};

// PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    if (!current_password) {
      return res.status(422).json({ message: 'Current password is required.' });
    }
    if (!new_password) {
      return res.status(422).json({ message: 'New password is required.' });
    }
    if (new_password.length < 8) {
      return res.status(422).json({ message: 'New password must be at least 8 characters long.' });
    }
    if (new_password !== confirm_password) {
      return res.status(422).json({ message: 'New password and confirm password do not match.' });
    }
    if (current_password.trim() === new_password.trim()) {
      return res.status(422).json({ message: 'New password cannot be the same as your current password.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await user.comparePassword(current_password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password does not match your records.' });
    }

    user.password = new_password;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully!',
    });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({
      message: 'Failed to update password. Please try again.',
    });
  }
};

// POST /api/auth/forgot-password — send 6-digit OTP to user's email
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(422).json({ message: 'A valid email address is required.' });
    }

    const user = await User.findOne({ email: new RegExp(`^${email.trim()}$`, 'i') });
    if (!user) {
      return res.status(404).json({ message: 'No registered account found with this email address.' });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.reset_password_otp = otp;
    user.reset_password_expires = expiresAt;
    await user.save();

    // Send email via emailService
    await sendPasswordResetOtpEmail(user.email, otp);

    res.json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${user.email}.`,
      expires_in_minutes: 10,
      dev_otp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Failed to process forgot password request.' });
  }
};

// POST /api/auth/verify-reset-otp — verify OTP before entering new password
const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(422).json({ message: 'Email and 6-digit verification code are required.' });
    }

    const user = await User.findOne({ email: new RegExp(`^${email.trim()}$`, 'i') });
    if (!user) {
      return res.status(404).json({ message: 'No registered account found with this email address.' });
    }

    if (!user.reset_password_otp || !user.reset_password_expires) {
      return res.status(400).json({ message: 'No active password reset request found. Please request a new code.' });
    }

    if (new Date() > user.reset_password_expires) {
      return res.status(400).json({ message: 'The verification code has expired. Please request a new code.' });
    }

    if (user.reset_password_otp.trim() !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid verification code. Please check and try again.' });
    }

    res.json({
      success: true,
      message: 'Verification code verified successfully. You may now enter your new password.',
    });
  } catch (err) {
    console.error('Verify reset OTP error:', err);
    res.status(500).json({ message: 'Failed to verify code.' });
  }
};

// POST /api/auth/reset-password — set new password once OTP is verified
const resetPassword = async (req, res) => {
  try {
    const { email, otp, new_password, confirm_password } = req.body;

    if (!email || !otp) {
      return res.status(422).json({ message: 'Email and verification code are required.' });
    }
    if (!new_password) {
      return res.status(422).json({ message: 'New password is required.' });
    }
    if (new_password.length < 8) {
      return res.status(422).json({ message: 'New password must be at least 8 characters long.' });
    }
    if (new_password !== confirm_password) {
      return res.status(422).json({ message: 'New password and confirm password do not match.' });
    }

    const user = await User.findOne({ email: new RegExp(`^${email.trim()}$`, 'i') }).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.reset_password_otp || !user.reset_password_expires) {
      return res.status(400).json({ message: 'No active password reset request found. Please request a new code.' });
    }

    if (new Date() > user.reset_password_expires) {
      return res.status(400).json({ message: 'The verification code has expired. Please request a new code.' });
    }

    if (user.reset_password_otp.trim() !== otp.trim()) {
      return res.status(400).json({ message: 'Invalid verification code.' });
    }

    // Assign new password (hashed automatically by pre('save'))
    user.password = new_password;
    user.reset_password_otp = null;
    user.reset_password_expires = null;
    await user.save();

    console.log(`✅ [KaYa Security] Password successfully reset for ${user.email}`);

    res.json({
      success: true,
      message: 'Your password has been successfully updated! You can now log in with your new credentials.',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Failed to reset password.' });
  }
};

module.exports = {
  register,
  login,
  getMe,
  getUserDetails,
  updateProfile,
  changePassword,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};


