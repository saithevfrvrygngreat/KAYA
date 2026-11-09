const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [255, 'Name cannot exceed 255 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [function () { return this.isNew; }, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  is_admin: {
    type: Boolean,
    default: false,
  },
  profile_image: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    default: '',
    trim: true,
  },
  address: {
    type: String,
    default: '',
    trim: true,
  },
  city: {
    type: String,
    default: '',
    trim: true,
  },
  postal_code: {
    type: String,
    default: '',
    trim: true,
  },
  bio: {
    type: String,
    default: '',
    trim: true,
    maxlength: [1000, 'Bio cannot exceed 1000 characters'],
  },
  details: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserDetails',
  },
  email_verified_at: {
    type: Date,
    default: null,
  },
  reset_password_otp: {
    type: String,
    default: null,
  },
  reset_password_expires: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Virtual for order count (used in admin)
userSchema.virtual('ordersCount', {
  ref: 'Order',
  localField: '_id',
  foreignField: 'user',
  count: true,
});
userSchema.virtual('customDesignsCount', {
  ref: 'CustomDesign',
  localField: '_id',
  foreignField: 'user',
  count: true,
});
userSchema.virtual('roomImagesCount', {
  ref: 'RoomImage',
  localField: '_id',
  foreignField: 'user',
  count: true,
});
userSchema.virtual('userDetails', {
  ref: 'UserDetails',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
});

userSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);

