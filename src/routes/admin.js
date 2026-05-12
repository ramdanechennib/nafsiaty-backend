const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const GroupController = require('../controllers/groupController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));

router.get('/dashboard', AdminController.getDashboard);
router.get('/users', AdminController.getAllUsers);
router.post('/notifications', AdminController.sendBulkNotification);
router.get('/monitor-messages', AdminController.monitorMessages);
router.get('/settings', AdminController.getSystemSettings);
router.put('/settings/:key', AdminController.updateSetting);
router.post('/users', AdminController.createUser);
router.put('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);
router.put('/messages/:id', AdminController.updateMessage);
router.delete('/messages/:id', AdminController.deleteMessage);

// Groups management
router.get('/groups', GroupController.list);
router.post('/groups', GroupController.create);
router.post('/groups/:groupId/students', GroupController.assignStudents);
router.post('/groups/:groupId/teacher', GroupController.assignTeacher);
router.get('/teachers', GroupController.listTeachers);

module.exports = router;