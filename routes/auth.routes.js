const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, redirectIfAuthenticated } = require('../middleware/auth');

router.get('/login', redirectIfAuthenticated, authController.getLogin);
router.post('/login', redirectIfAuthenticated, authController.login);

router.get('/register', redirectIfAuthenticated, authController.getRegister);
router.post('/register', redirectIfAuthenticated, authController.register);

router.get('/logout', verifyToken, authController.logout);

router.get('/forgot-password', redirectIfAuthenticated, authController.getForgotPassword);
router.post('/forgot-password', redirectIfAuthenticated, authController.forgotPassword);
router.get('/verify-otp', redirectIfAuthenticated, authController.getVerifyOTP);
router.post('/verify-otp', redirectIfAuthenticated, authController.verifyOTP);
router.post('/reset-password', redirectIfAuthenticated, authController.resetPassword);

module.exports = router; 