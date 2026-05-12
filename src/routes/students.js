const express = require('express');
const router = express.Router();
const StudentController = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');

router.get('/all', authenticate, authorize('admin', 'counselor'), StudentController.getAllStudents);
router.get('/parents-list', authenticate, authorize('admin', 'counselor'), StudentController.getParentsList);

router.get('/my-children', authenticate, authorize('parent'), StudentController.getParentChildren);
router.get('/my-students', authenticate, authorize('teacher'), StudentController.getTeacherStudents);

router.get('/:id/dashboard', authenticate, StudentController.getStudentDashboard);
router.get('/:id', authenticate, StudentController.getStudentById);

router.get('/', authenticate, StudentController.getStudents);
router.post('/', authenticate, authorize('admin'), StudentController.createStudent);
router.put('/:id', authenticate, authorize('admin'), StudentController.updateStudent);
router.delete('/:id', authenticate, authorize('admin'), StudentController.deleteStudent);

module.exports = router;