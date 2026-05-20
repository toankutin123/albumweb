const { AdminOTP, User } = require('../models');

const otpController = {
  // Tạo OTP mới cho user
  createOTP: async (req, res) => {
    try {
      const user_id = req.user.id;
      
      // Đánh dấu các OTP cũ của user là đã sử dụng
      await AdminOTP.update(
        { is_used: true },
        { where: { user_id } }
      );

      // Tạo OTP mới (6 số)
      const otp_code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires_at = new Date(Date.now() + 5 * 60 * 1000); // 5 phút

      const otp = await AdminOTP.create({
        user_id,
        otp_code,
        expires_at
      });

      res.status(201).json({
        message: 'Tạo OTP thành công',
        otp_code,
        expires_at
      });
    } catch (error) {
      console.error('=== Create OTP error ===');
      console.error('Error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Xác minh OTP
  verifyOTP: async (req, res) => {
    try {
      const { otp_code, user_id } = req.body;

      if (!otp_code) {
        return res.status(400).json({ message: 'Vui lòng nhập mã OTP' });
      }

      const otp = await AdminOTP.findOne({
        where: {
          otp_code,
          user_id,
          is_used: false
        },
        order: [['created_at', 'DESC']]
      });

      if (!otp) {
        return res.status(400).json({ message: 'Mã OTP không hợp lệ' });
      }

      // Kiểm tra hết hạn
      if (new Date() > new Date(otp.expires_at)) {
        return res.status(400).json({ message: 'Mã OTP đã hết hạn' });
      }

      // Đánh dấu OTP đã sử dụng
      otp.is_used = true;
      await otp.save();

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
      
      const otp = await AdminOTP.findOne({
        where: {
          user_id,
          is_used: false
        },
        order: [['created_at', 'DESC']]
      });

      if (!otp) {
        return res.json({ message: 'Không có OTP', otp: null });
      }

      // Kiểm tra hết hạn
      if (new Date() > new Date(otp.expires_at)) {
        return res.json({ message: 'OTP đã hết hạn', otp: null });
      }

      res.json({
        message: 'OTP hiện tại',
        otp_code: otp.otp_code,
        expires_at: otp.expires_at
      });
    } catch (error) {
      console.error('=== Get current OTP error ===');
      console.error('Error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
};

module.exports = otpController;
