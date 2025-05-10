const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { verifyToken } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', profileController.getProfile);

router.get('/edit', profileController.getEditProfile);
router.post('/update', profileController.updateProfile);

router.get('/change-password', profileController.getChangePassword);
router.post('/update-password', profileController.updatePassword);

router.post('/upload-image', profileController.uploadProfileImage);

module.exports = router; 