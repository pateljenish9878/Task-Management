const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', categoryController.getCategories);

router.get('/create', categoryController.getCreateCategoryForm);
router.post('/create', categoryController.createCategory);

router.get('/edit/:id', categoryController.getEditCategoryForm);
router.post('/edit/:id', categoryController.updateCategory);

router.get('/delete/:id', categoryController.deleteCategory);

module.exports = router; 