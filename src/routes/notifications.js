const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, async (req, res) => {
    const notifications = await Notification.findByUser(req.user.id);
    res.json({ success: true, data: notifications });
});

router.get('/unread-count', authenticate, async (req, res) => {
    const count = await Notification.getUnreadCount(req.user.id);
    res.json({ success: true, data: { count } });
});

router.put('/:id/read', authenticate, async (req, res) => {
    await Notification.markAsRead(req.params.id);
    res.json({ success: true, message: 'تم تحديد الإشعار كمقروء' });
});

router.put('/read-all', authenticate, async (req, res) => {
    await Notification.markAllAsRead(req.user.id);
    res.json({ success: true, message: 'تم تحديد الكل كمقروء' });
});

module.exports = router;