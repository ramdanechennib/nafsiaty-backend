const express = require('express');
const router = express.Router();
const SessionRequestController = require('../controllers/sessionRequestController');
const { authenticate, authorize } = require('../middleware/auth');

// Create a session request (parent/teacher)
router.post('/', authenticate, authorize('parent', 'teacher'), SessionRequestController.create);

// Counselor fetches their session requests, Parents/Teachers fetch their own
router.get('/my', authenticate, authorize('counselor', 'parent', 'teacher'), SessionRequestController.getMyRequests);

// Counselor responds to a request
router.put('/:id', authenticate, authorize('counselor'), SessionRequestController.respond);

module.exports = router;

