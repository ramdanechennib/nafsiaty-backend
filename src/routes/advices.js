const express = require('express');
const router = express.Router();
const Advice = require('../models/Advice');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
    try {
        const advices = await Advice.findAll(req.user.role);
        res.json({ success: true, data: advices });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

router.post('/', authenticate, authorize('counselor', 'admin'), async (req, res) => {
    try {
        const advice = await Advice.create({ ...req.body, author_id: req.user.id });
        res.status(201).json({ success: true, data: advice });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;