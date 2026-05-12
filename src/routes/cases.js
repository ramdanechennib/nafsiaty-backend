const express = require('express');
const router = express.Router();
const CaseController = require('../controllers/caseController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('teacher', 'counselor'), CaseController.createCase);
router.get('/', authenticate, CaseController.getAllCases);
router.get('/my-cases', authenticate, authorize('counselor'), CaseController.getCounselorCases);
router.get('/stats', authenticate, authorize('counselor', 'admin'), CaseController.getDashboardStats);
router.get('/:id', authenticate, CaseController.getCaseById);
router.put('/:id', authenticate, authorize('counselor'), CaseController.updateCase);
router.post('/:id/sessions', authenticate, authorize('counselor'), CaseController.addSession);

module.exports = router;