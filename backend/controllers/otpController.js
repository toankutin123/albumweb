const { PaymentInfo, User } = require('../models');

const otpController = {
  // Tạo OTP mới cho user (lưu vào payment_info)
  createOTP: async (req, res) => {
    try {
      const user_id = req.user.id;
      
      // Tạo OTP mới (6 số)
      const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
      const otp_expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

      // Cập nhật hoặc tạo payment_info với OTP mới
      const [paymentInfo, created] = await PaymentInfo.findOrCreate({
        where: { user_id },
        defaults: {
          bank_name: '',
          account_number: '',
          account_holder: '',
          otp_code,
          otp_expires_at
        }
      });

      if (!created) {
        await paymentInfo.update({
          otp_code,
          otp_expires_at
        });
      }

      res.status(201).json({
        message: 'Tạo OTP thành công',
        otp_code,
        expires_at: otp_expires_at
      });
    } catch (error) {
      console.error('=== Create OTP error ===');
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

      // Kiểm tra hết hạn
      if (new Date() > new Date(paymentInfo.otp_expires_at)) {
        return res.status(400).json({ message: 'Mã OTP đã hết hạn' });
      }

      // Xóa OTP sau khi xác minh thành công
      await paymentInfo.update({
        otp_code: null,
        otp_expires_at: null
      });

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

      // Kiểm tra hết hạn
      if (new Date() > new Date(paymentInfo.otp_expires_at)) {
        return res.json({ message: 'OTP đã hết hạn', otp: null });
      }

      res.json({
        message: 'OTP hiện tại',
        otp_code: paymentInfo.otp_code,
        expires_at: paymentInfo.otp_expires_at
      });
    } catch (error) {
      console.error('=== Get current OTP error ===');
      console.error('Error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
};

module.exports = otpController;
