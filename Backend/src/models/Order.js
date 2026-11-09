const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  custom_design: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CustomDesign',
    default: null,
  },
  order_number: {
    type: String,
    required: true,
    unique: true,
  },
  total_price: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Price cannot be negative'],
  },
  status: {
    type: String,
    enum: ['placed', 'processing', 'shipping', 'delivered', 'cancelled'],
    default: 'placed',
  },
  cancelled_by: {
    type: String,
    enum: ['user', 'admin', null],
    default: null,
  },
  cancelled_at: {
    type: Date,
    default: null,
  },
  shipping_address: {
    type: String,
    default: null,
  },
  customer_name: {
    type: String,
    default: null,
  },
  customer_phone: {
    type: String,
    default: null,
  },
  customer_email: {
    type: String,
    default: null,
  },
  cart_items: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
  payment_id: {
    type: String,
    default: null,
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  placed_at: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

orderSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    return ret;
  },
});

module.exports = mongoose.model('Order', orderSchema);

