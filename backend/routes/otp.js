const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpController');
const auth = require('../middleware/auth');

// Lưu OTP vào payment_info khi user nhập
router.post('/save', auth, otpController.saveOTP);

// Lấy OTP hiện tại của user từ payment_info
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { PaymentInfo } = require('../models');
    const paymentInfo = await PaymentInfo.findOne({ 
      where: { user_id: req.params.userId } 
    });
    
    res.json({ 
      otp_code: paymentInfo?.otp_code || null 
    });
  } catch (error) {
    console.error('Get OTP error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router;
