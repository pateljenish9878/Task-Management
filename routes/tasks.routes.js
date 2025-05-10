const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', taskController.getTasks);

router.get('/create', taskController.getCreateTaskForm);
router.post('/create', taskController.createTask);

router.get('/edit/:id', taskController.getEditTaskForm);
router.post('/edit/:id', taskController.updateTask);

router.get('/delete/:id', taskController.deleteTask);

module.exports = router; 