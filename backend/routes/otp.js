const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Lưu OTP vào payment_info khi user nhập
router.post('/save', auth, otpController.saveOTP);

// Xác minh OTP (admin xác minh)
router.post('/verify', auth, adminAuth, otpController.verifyOTP);

// Lấy OTP hiện tại của user (admin xem để gửi cho user)
router.get('/user/:userId', auth, adminAuth, otpController.getCurrentOTP);

module.exports = router;
