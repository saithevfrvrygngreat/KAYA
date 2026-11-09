const express = require('express');
const router = express.Router();
const { getProducts, getAllProducts, getProduct } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getProducts);
router.get('/all', protect, adminOnly, getAllProducts);
router.get('/:id', getProduct);

module.exports = router;

