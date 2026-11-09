const express = require('express');
const router = express.Router();
const { getDashboard, updateOrderStatus, storeProduct, toggleProductStock, toggleProductActive, destroyProduct } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/', getDashboard);
router.get('/dashboard', getDashboard);
router.patch('/orders/:id/status', updateOrderStatus);
router.post('/products', storeProduct);
router.patch('/products/:id/toggle-stock', toggleProductStock);
router.patch('/products/:id/toggle-active', toggleProductActive);
router.delete('/products/:id', destroyProduct);

module.exports = router;

