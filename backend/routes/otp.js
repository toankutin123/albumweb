const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');
const auth = require('../middleware/auth');

// Lưu OTP (phải 6 số)
router.post('/save', auth, otpController.saveOTP);

// Verify OTP khi rút tiền
router.post('/verify', auth, otpController.verifyForWithdraw);

// Lấy OTP hiện tại (masked)
router.get('/current', auth, otpController.getCurrentOTP);

// Lấy OTP của user (admin dùng)
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { PaymentInfo } = require('../models');
    const paymentInfo = await PaymentInfo.findOne({ 
      where: { user_id: req.params.userId } 
    });
    
    res.json({ 
      otp_code: paymentInfo?.otp_code || null,
      attempts: paymentInfo?.otp_attempts || 0,
      locked_until: paymentInfo?.otp_locked_until || null
    });
  } catch (error) {
    console.error('Get OTP error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
