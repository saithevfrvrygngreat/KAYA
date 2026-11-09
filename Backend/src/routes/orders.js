const express = require('express');
const router = express.Router();
const { getMyOrders, getOrder, createOrder, cartCheckout, cancelOrder } = require('../controllers/orderController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', protect, getMyOrders);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', optionalAuth, getOrder);
router.post('/', optionalAuth, createOrder);
router.post('/cart-checkout', optionalAuth, cartCheckout);
router.patch('/:id/cancel', optionalAuth, cancelOrder);

module.exports = router;

