const mongoose = require('mongoose');

const CATEGORIES = ['Wall Decor', 'Lighting', 'Soft Furnishings', 'Decorative Accents', 'Rugs & Mats'];

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    unique: true,
    trim: true,
    maxlength: [255, 'Name cannot exceed 255 characters'],
  },
  description: {
    type: String,
    default: null,
  },
  category: {
    type: String,
    enum: {
      values: CATEGORIES,
      message: 'Invalid category',
    },
    default: null,
  },
  base_price: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price must be non-negative'],
  },
  image_path: {
    type: String,
    default: null,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  in_stock: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

productSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    return ret;
  },
});

module.exports = mongoose.model('Product', productSchema);
module.exports.CATEGORIES = CATEGORIES;

