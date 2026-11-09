const mongoose = require('mongoose');

const userDetailsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: [255, 'Name cannot exceed 255 characters'],
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    state: {
      type: String,
      trim: true,
      default: '',
    },
    postal_code: {
      type: String,
      trim: true,
      default: '',
    },
    country: {
      type: String,
      trim: true,
      default: 'India',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
      default: '',
    },
    profile_image: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    preferred_style: {
      type: String,
      trim: true,
      default: 'Contemporary Minimalist',
    },
    design_firm: {
      type: String,
      trim: true,
      default: '',
    },
    shipping_notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
    collection: 'user_details',
  }
);

userDetailsSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('UserDetails', userDetailsSchema);

