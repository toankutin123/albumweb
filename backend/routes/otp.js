const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Tạo OTP mới (user tạo OTP cho mình)
router.post('/create', auth, otpController.createOTP);

// Xác minh OTP (admin xác minh)
router.post('/verify', auth, adminAuth, otpController.verifyOTP);

// Lấy OTP hiện tại của user (admin xem để gửi cho user)
router.get('/user/:userId', auth, adminAuth, otpController.getCurrentOTP);

module.exports = router;
