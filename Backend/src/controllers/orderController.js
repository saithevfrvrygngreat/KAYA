const mongoose = require('mongoose');
const Order = require('../models/Order');
const CustomDesign = require('../models/CustomDesign');

// Generate order number: ORD-{YYYYMMDD}-{6RANDOM}
const generateOrderNumber = () => {
  const now = new Date();
  const dateStr = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${dateStr}-${random}`;
};

// GET /api/orders — user's orders (dashboard)
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate({ path: 'custom_design', populate: { path: 'product' } })
      .sort({ createdAt: -1 });
    res.json({ data: orders });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch orders.' });
  }
};

// GET /api/orders/:id — single order
const getOrder = async (req, res) => {
  try {
    const idOrNumber = req.params.id;
    let order = null;

    if (mongoose.Types.ObjectId.isValid(idOrNumber)) {
      order = await Order.findById(idOrNumber)
        .populate({ path: 'custom_design', populate: { path: 'product' } })
        .populate('user', 'name email');
    }
    if (!order) {
      order = await Order.findOne({ order_number: idOrNumber })
        .populate({ path: 'custom_design', populate: { path: 'product' } })
        .populate('user', 'name email');
    }
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    // Users can only see their own orders
    if (req.user && order.user && order.user._id.toString() !== req.user._id.toString() && !req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    res.json({ data: order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch order.' });
  }
};

// POST /api/orders — place order from custom design
const createOrder = async (req, res) => {
  try {
    const { custom_design_id, shipping_address, customer_name, customer_phone, customer_email, payment_id } = req.body;

    const errors = {};
    if (!custom_design_id) errors.custom_design_id = 'Design ID is required.';
    if (!shipping_address) errors.shipping_address = 'Shipping address is required.';
    if (!customer_name) errors.customer_name = 'Customer name is required.';
    if (!customer_phone) errors.customer_phone = 'Phone number is required.';
    if (!customer_email || !/^\S+@\S+\.\S+$/.test(customer_email)) errors.customer_email = 'Valid email is required.';
    if (!payment_id) errors.payment_id = 'Payment ID is required.';

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ message: 'Validation failed', errors });
    }

    const design = await CustomDesign.findById(custom_design_id).populate('product');
    if (!design) return res.status(422).json({ message: 'Design not found.' });
    if (!design.product) return res.status(422).json({ message: 'Design product not found.', errors: { custom_design_id: 'Selected design has no product linked.' } });

    // Total price = base price + 18% GST
    const totalPrice = parseFloat((design.product.base_price * 1.18).toFixed(2));

    const order = await Order.create({
      user: req.user ? req.user._id : null,
      custom_design: design._id,
      order_number: generateOrderNumber(),
      total_price: totalPrice,
      status: 'placed',
      shipping_address,
      customer_name,
      customer_phone,
      customer_email,
      cart_items: null,
      payment_id,
      payment_status: 'paid',
      placed_at: new Date(),
    });

    await order.populate({ path: 'custom_design', populate: { path: 'product' } });

    res.status(201).json({
      status: 'placed',
      order_id: order._id,
      order_number: order.order_number,
      data: order,
    });
  } catch (err) {
    console.error('Create order error:', err);
    res.status(500).json({ message: 'Failed to create order.' });
  }
};

// POST /api/orders/cart-checkout — cart-based order (no design)
const cartCheckout = async (req, res) => {
  try {
    const { cart_items, total_price, shipping_address, customer_name, customer_phone, customer_email, payment_id } = req.body;

    const errors = {};
    if (!cart_items) errors.cart_items = 'Cart items are required.';
    if (total_price === undefined || total_price < 0) errors.total_price = 'Valid total price is required.';
    if (!shipping_address) errors.shipping_address = 'Shipping address is required.';
    if (!customer_name) errors.customer_name = 'Customer name is required.';
    if (!customer_phone) errors.customer_phone = 'Phone number is required.';
    if (!customer_email || !/^\S+@\S+\.\S+$/.test(customer_email)) errors.customer_email = 'Valid email is required.';
    if (!payment_id) errors.payment_id = 'Payment ID is required.';

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ message: 'Validation failed', errors });
    }

    let parsedCartItems;
    try {
      parsedCartItems = typeof cart_items === 'string' ? JSON.parse(cart_items) : cart_items;
    } catch {
      return res.status(422).json({ message: 'Invalid cart items format.' });
    }

    const order = await Order.create({
      user: req.user ? req.user._id : null,
      custom_design: null,
      order_number: generateOrderNumber(),
      total_price: parseFloat(total_price),
      status: 'placed',
      shipping_address,
      customer_name,
      customer_phone,
      customer_email,
      cart_items: parsedCartItems,
      payment_id,
      payment_status: 'paid',
      placed_at: new Date(),
    });

    res.status(201).json({
      status: 'placed',
      order_id: order._id,
      order_number: order.order_number,
      data: order,
    });
  } catch (err) {
    console.error('Cart checkout error:', err);
    res.status(500).json({ message: 'Failed to process cart checkout.' });
  }
};

// PATCH /api/orders/:id/cancel — cancel user's order
const cancelOrder = async (req, res) => {
  try {
    const idOrNumber = req.params.id;
    let order = null;

    if (mongoose.Types.ObjectId.isValid(idOrNumber)) {
      order = await Order.findById(idOrNumber);
    }
    if (!order) {
      order = await Order.findOne({ order_number: idOrNumber });
    }
    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Users can only cancel their own order (or admin)
    if (req.user && order.user) {
      const orderUserId = order.user._id ? order.user._id.toString() : order.user.toString();
      const currentUserId = req.user._id.toString();
      if (orderUserId !== currentUserId && !req.user.is_admin) {
        return res.status(403).json({ message: 'Access denied: You cannot cancel this order.' });
      }
    }

    // Cancellation condition: only if status is placed, processing, or shipping
    const cancellableStatuses = ['placed', 'processing', 'shipping'];
    if (!cancellableStatuses.includes(order.status)) {
      return res.status(422).json({
        message: `Order cannot be cancelled because its current status is '${order.status}'. Cancellation is only permitted while status is Placed, Processing, or Shipping.`
      });
    }

    // Determine who is cancelling
    const isCancelledByAdmin = req.user && req.user.is_admin;
    const cancelledBy = isCancelledByAdmin ? 'admin' : 'user';

    const updated = await Order.findByIdAndUpdate(
      order._id,
      {
        status: 'cancelled',
        cancelled_by: cancelledBy,
        cancelled_at: new Date(),
      },
      { new: true }
    );

    res.json({
      message: `Order ${updated.order_number} has been cancelled successfully.`,
      data: updated
    });
  } catch (err) {
    console.error('Cancel order error:', err);
    res.status(500).json({ message: err.message || 'Failed to cancel order.' });
  }
};

module.exports = { getMyOrders, getOrder, createOrder, cartCheckout, cancelOrder };

