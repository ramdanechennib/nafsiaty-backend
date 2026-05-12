const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('teacher', 'counselor'), ReportController.createReport);
router.get('/all', authenticate, authorize('admin', 'counselor'), ReportController.getAllReports);
router.get('/my-reports', authenticate, authorize('parent'), ReportController.getReportsByParent);
router.get('/student/:studentId', authenticate, ReportController.getReportsByStudent);
router.put('/:id/read', authenticate, ReportController.markAsRead);

module.exports = router;