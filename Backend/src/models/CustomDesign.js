const mongoose = require('mongoose');

const customDesignSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required'],
  },
  design_json: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Design data is required'],
  },
  preview_image_path: {
    type: String,
    default: null,
  },
  room_image_path: {
    type: String,
    default: null,
  },
  status: {
    type: String,
    enum: ['saved', 'ordered'],
    default: 'saved',
  },
}, { timestamps: true });

customDesignSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    return ret;
  },
});

module.exports = mongoose.model('CustomDesign', customDesignSchema);

