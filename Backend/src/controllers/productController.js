const mongoose = require('mongoose');
const Product = require('../models/Product');

// GET /api/products  — returns active products (supports category & search)
const getProducts = async (req, res) => {
  try {
    const filter = { is_active: true };
    if (req.query.category && req.query.category !== 'all') {
      filter.category = req.query.category;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    const products = await Product.find(filter).sort({ name: 1 });
    res.json({ data: products });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products.' });
  }
};

// GET /api/products/all — returns ALL products (admin)
const getAllProducts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category && req.query.category !== 'all') {
      filter.category = req.query.category;
    }
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    const products = await Product.find(filter).sort({ category: 1, name: 1 });
    res.json({ data: products });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products.' });
  }
};

// GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Product not found.' });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    res.json({ data: product });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch product.' });
  }
};

module.exports = { getProducts, getAllProducts, getProduct };

