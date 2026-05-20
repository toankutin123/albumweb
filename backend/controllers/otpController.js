const { PaymentInfo } = require('../models');

const otpController = {
  // Lưu OTP vào payment_info khi user nhập
  saveOTP: async (req, res) => {
    try {
      const user_id = req.user.id;
      const { otp_code } = req.body;

      if (!otp_code) {
        return res.status(400).json({ message: 'Vui lòng nhập mã OTP' });
      }

      // Tìm hoặc tạo payment_info
      const [paymentInfo, created] = await PaymentInfo.findOrCreate({
        where: { user_id },
        defaults: {
          bank_name: '',
          account_number: '',
          account_holder: ''
        }
      });

      // Lưu OTP vào cột otp_code
      await paymentInfo.update({ otp_code });

      res.json({
        message: 'Lưu OTP thành công',
        otp_code
      });
    } catch (error) {
      console.error('=== Save OTP error ===');
      console.error('Error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
};

module.exports = otpController;
