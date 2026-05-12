const express = require('express');
const router = express.Router();
const BehavioralNoteController = require('../controllers/behavioralNoteController');
const { authenticate, authorize } = require('../middleware/auth');

// Teacher creates behavioral note
router.post('/', authenticate, authorize('teacher'), BehavioralNoteController.create);

// Fetch all notes (for counselor/admin)
router.get('/', authenticate, authorize('counselor', 'admin'), BehavioralNoteController.getAll);

// Optional: fetch notes for a student (teacher/counselor/admin/parent)
router.get('/student/:studentId', authenticate, authorize('teacher', 'counselor', 'admin', 'parent'), BehavioralNoteController.getByStudent);

module.exports = router;

