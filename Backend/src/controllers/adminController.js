const mongoose = require('mongoose');
const User = require('../models/User');
const Order = require('../models/Order');
const CustomDesign = require('../models/CustomDesign');
const Product = require('../models/Product');

// GET /api/admin — full dashboard data
const getDashboard = async (req, res) => {
  try {
    const [users, orders, designs, products] = await Promise.all([
      User.find().sort({ createdAt: -1 }),
      Order.find()
        .populate('user', 'name email')
        .populate({ path: 'custom_design', populate: { path: 'product', select: 'name' } })
        .sort({ createdAt: -1 }),
      CustomDesign.find()
        .populate('user', 'name email')
        .populate('product', 'name')
        .sort({ createdAt: -1 }),
      Product.find().sort({ category: 1, name: 1 }),
    ]);

    // Count relationships manually (MongoDB doesn't have withCount like Eloquent)
    const userIds = users.map(u => u._id.toString());
    const [orderCounts, designCounts, roomImageCounts] = await Promise.all([
      Order.aggregate([{ $match: { user: { $in: users.map(u => u._id) } } }, { $group: { _id: '$user', count: { $sum: 1 } } }]),
      CustomDesign.aggregate([{ $match: { user: { $in: users.map(u => u._id) } } }, { $group: { _id: '$user', count: { $sum: 1 } } }]),
      require('../models/RoomImage').aggregate([{ $match: { user: { $in: users.map(u => u._id) } } }, { $group: { _id: '$user', count: { $sum: 1 } } }]),
    ]);

    const orderCountMap = Object.fromEntries(orderCounts.map(x => [x._id.toString(), x.count]));
    const designCountMap = Object.fromEntries(designCounts.map(x => [x._id.toString(), x.count]));
    const roomCountMap = Object.fromEntries(roomImageCounts.map(x => [x._id.toString(), x.count]));

    const usersWithCounts = users.map(u => ({
      ...u.toJSON(),
      orders_count: orderCountMap[u._id.toString()] || 0,
      custom_designs_count: designCountMap[u._id.toString()] || 0,
      room_images_count: roomCountMap[u._id.toString()] || 0,
    }));

    // Statistics
    const paidNonCancelled = orders.filter(o => o.payment_status === 'paid' && o.status !== 'cancelled');
    const paidAll = orders.filter(o => o.payment_status === 'paid');
    const cancelled = orders.filter(o => o.status === 'cancelled');

    const stats = {
      total_users: users.length,
      total_admins: users.filter(u => u.is_admin).length,
      total_orders: orders.length,
      total_designs: designs.length,
      total_revenue: paidNonCancelled.reduce((sum, o) => sum + (o.total_price || 0), 0),
      gross_revenue: paidAll.reduce((sum, o) => sum + (o.total_price || 0), 0),
      cancelled_revenue: cancelled.reduce((sum, o) => sum + (o.total_price || 0), 0),
    };

    res.json({ users: usersWithCounts, orders, designs, products, stats });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ message: 'Failed to load admin dashboard.' });
  }
};

// PATCH /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['placed', 'processing', 'shipping', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(422).json({ message: 'Invalid status.', errors: { status: `Status must be one of: ${validStatuses.join(', ')}` } });
    }

    const idOrNumber = req.params.id;
    let order = null;
    if (mongoose.Types.ObjectId.isValid(idOrNumber)) {
      order = await Order.findById(idOrNumber);
    }
    if (!order) {
      order = await Order.findOne({ order_number: idOrNumber });
    }
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    // Strict Rule: If order was cancelled by the customer in the user page, admin CANNOT change the status!
    if (order.status === 'cancelled' && order.cancelled_by === 'user') {
      return res.status(403).json({
        message: `Order ${order.order_number} was cancelled by the customer. The status is permanently locked and cannot be changed by admin.`
      });
    }

    // Progression Sequence: Placed -> Processing -> Shipping -> Delivered
    // Admin cannot move backwards (e.g. from Processing back to Placed, or from Shipping back to Processing/Placed, or from Delivered backwards).
    // Cancellation is universally available at any active stage.
    const STAGES = ['placed', 'processing', 'shipping', 'delivered'];
    if (status !== 'cancelled' && order.status !== 'cancelled') {
      const currentIndex = STAGES.indexOf(order.status);
      const newIndex = STAGES.indexOf(status);
      if (currentIndex !== -1 && newIndex !== -1 && newIndex < currentIndex) {
        return res.status(422).json({
          message: `Cannot move order backwards from '${order.status.toUpperCase()}' to '${status.toUpperCase()}'. The order process is forward-only: Placed → Processing → Shipping → Delivered.`
        });
      }
    }

    const updateData = { status };
    if (status === 'cancelled') {
      updateData.cancelled_by = 'admin';
      updateData.cancelled_at = new Date();
    } else if (order.cancelled_by === 'admin') {
      // If previously cancelled by admin, admin can restore/change status anytime
      updateData.cancelled_by = null;
      updateData.cancelled_at = null;
    }

    const updated = await Order.findByIdAndUpdate(order._id, updateData, { new: true });
    res.json({
      message: `Order ${updated.order_number} status updated to '${status.charAt(0).toUpperCase() + status.slice(1)}' successfully!`,
      data: updated
    });
  } catch (err) {
    console.error('Admin order status update error:', err);
    res.status(500).json({ message: err.message || 'Failed to update order status.' });
  }
};

const DEFAULT_IMAGES = {
  'Wall Decor': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=700&q=80',
  'Lighting': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80',
  'Soft Furnishings': 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=700&q=80',
  'Decorative Accents': 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=700&q=80',
  'Rugs & Mats': 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=700&q=80',
};

// POST /api/admin/products
const storeProduct = async (req, res) => {
  try {
    const { name, category, description, base_price, image_path } = req.body;
    const validCategories = ['Wall Decor', 'Lighting', 'Soft Furnishings', 'Decorative Accents', 'Rugs & Mats'];
    const errors = {};
    if (!name || name.trim().length === 0) errors.name = 'Product name is required.';
    if (!category || !validCategories.includes(category)) errors.category = `Category must be one of: ${validCategories.join(', ')}`;
    if (!description || description.trim().length === 0) errors.description = 'Description is required.';
    if (base_price === undefined || isNaN(base_price) || Number(base_price) < 0) errors.base_price = 'Valid base price is required.';

    if (Object.keys(errors).length > 0) {
      return res.status(422).json({ message: 'Validation failed', errors });
    }

    // Check unique name
    const existing = await Product.findOne({ name: name.trim() });
    if (existing) {
      return res.status(422).json({ message: 'Validation failed', errors: { name: 'A product with this name already exists.' } });
    }

    const imagePath = (image_path && image_path.trim()) || DEFAULT_IMAGES[category] || DEFAULT_IMAGES['Wall Decor'];

    const product = await Product.create({
      name: name.trim(),
      category,
      description: description.trim(),
      base_price: Number(base_price),
      image_path: imagePath,
      is_active: true,
      in_stock: true,
    });

    res.status(201).json({ message: `New masterpiece curation '${product.name}' added successfully!`, data: product });
  } catch (err) {
    console.error('Store product error:', err);
    res.status(500).json({ message: 'Failed to create product.' });
  }
};

// PATCH /api/admin/products/:id/toggle-stock
const toggleProductStock = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    product.in_stock = !product.in_stock;
    await product.save();
    const status = product.in_stock ? 'In Stock' : 'Out of Stock';
    res.json({ message: `Masterpiece '${product.name}' is now marked as ${status}!`, data: product });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle stock.' });
  }
};

// PATCH /api/admin/products/:id/toggle-active
const toggleProductActive = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    product.is_active = !product.is_active;
    await product.save();
    const status = product.is_active ? 'Visible (Active)' : 'Hidden (Inactive)';
    res.json({ message: `Masterpiece '${product.name}' visibility is now ${status}!`, data: product });
  } catch (err) {
    res.status(500).json({ message: 'Failed to toggle active status.' });
  }
};

// DELETE /api/admin/products/:id
const destroyProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ message: `Masterpiece curation '${product.name}' has been completely deleted and removed from all lists!` });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product.' });
  }
};

module.exports = { getDashboard, updateOrderStatus, storeProduct, toggleProductStock, toggleProductActive, destroyProduct };

