const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');
const auth = require('../middleware/auth');

// Lưu OTP vào payment_info khi user nhập
router.post('/save', auth, otpController.saveOTP);

module.exports = router;
