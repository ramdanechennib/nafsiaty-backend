const Payment = require('../models/Payment');

class PaymentController {
    static async processPayment(req, res) {
        try {
            const { student_id, session_request_id, amount, payment_method, transaction_id, card_info } = req.body;

            if (!student_id || !amount || !payment_method) {
                return res.status(400).json({ success: false, message: 'المعلومات المطلوبة ناقصة' });
            }

            // Determine status based on payment method
            const status = payment_method === 'cash' ? 'cash_pending' : 'pending_verification';

            const payment = await Payment.create({
                parent_id: req.user.id,
                student_id,
                session_request_id: session_request_id || null,
                amount,
                payment_method,
                transaction_id: transaction_id || `TRX-${Date.now()}`,
                status,
                card_info: card_info || null
            });

            res.status(201).json({ success: true, data: payment });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async verifyPayment(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body; // 'completed' or 'failed'

            if (!['completed', 'failed'].includes(status)) {
                return res.status(400).json({ success: false, message: 'حالة غير صالحة' });
            }

            const payment = await Payment.updateStatus(id, status);
            res.json({ success: true, data: payment });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async getAllPayments(req, res) {
        try {
            const payments = await Payment.findAll();
            res.json({ success: true, data: payments });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async getMyPayments(req, res) {
        try {
            const payments = await Payment.findByParent(req.user.id);
            res.json({ success: true, data: payments });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    static async getFinancialStats(req, res) {
        try {
            const stats = await Payment.getStats();
            res.json({ success: true, data: stats });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = PaymentController;
