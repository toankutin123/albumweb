const { PaymentInfo, User } = require('../models');

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
  },

  // Xác minh OTP từ payment_info
  verifyOTP: async (req, res) => {
    try {
      const { otp_code, user_id } = req.body;

      if (!otp_code) {
        return res.status(400).json({ message: 'Vui lòng nhập mã OTP' });
      }

      const paymentInfo = await PaymentInfo.findOne({
        where: { user_id }
      });

      if (!paymentInfo || !paymentInfo.otp_code) {
        return res.status(400).json({ message: 'Mã OTP không hợp lệ' });
      }

      // Kiểm tra OTP khớp
      if (paymentInfo.otp_code !== otp_code) {
        return res.status(400).json({ message: 'Mã OTP không hợp lệ' });
      }

      // Xóa OTP sau khi xác minh thành công
      await paymentInfo.update({ otp_code: null });

      res.json({
        message: 'Xác minh OTP thành công',
        valid: true
      });
    } catch (error) {
      console.error('=== Verify OTP error ===');
      console.error('Error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Lấy OTP hiện tại của user (chỉ dùng trong dev)
  getCurrentOTP: async (req, res) => {
    try {
      const user_id = parseInt(req.params.userId);
      
      const paymentInfo = await PaymentInfo.findOne({
        where: { user_id }
      });

      if (!paymentInfo || !paymentInfo.otp_code) {
        return res.json({ message: 'Không có OTP', otp: null });
      }

      res.json({
        message: 'OTP hiện tại',
        otp_code: paymentInfo.otp_code
      });
    } catch (error) {
      console.error('=== Get current OTP error ===');
      console.error('Error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
};

module.exports = otpController;
