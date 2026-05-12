const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, ChatController.sendMessage);
router.get('/conversations', authenticate, ChatController.getRecentConversations);
router.get('/conversation/:userId', authenticate, ChatController.getConversation);
router.get('/unread', authenticate, ChatController.getUnreadCount);
router.get('/users-to-chat', authenticate, ChatController.getUsersToChat);
router.put('/read/:messageId', authenticate, ChatController.markAsRead);
router.get('/school-contact', authenticate, ChatController.getSchoolContact);
module.exports = router;