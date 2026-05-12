const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth');

// Parent processes a payment
router.post('/process', authenticate, authorize('parent'), PaymentController.processPayment);

// Parent gets their own payments
router.get('/my', authenticate, authorize('parent'), PaymentController.getMyPayments);

// Admin gets all payments
router.get('/all', authenticate, authorize('admin'), PaymentController.getAllPayments);

// Admin gets financial stats
router.get('/stats', authenticate, authorize('admin'), PaymentController.getFinancialStats);

// Admin verifies a payment
router.patch('/:id/verify', authenticate, authorize('admin'), PaymentController.verifyPayment);

module.exports = router;
