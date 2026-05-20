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

      // Validate: OTP phải là 6 số
      if (!/^\d{6}$/.test(otp_code)) {
        return res.status(400).json({ message: 'Mã OTP phải là 6 chữ số' });
      }

      // Tìm hoặc tạo payment_info
      const [paymentInfo, created] = await PaymentInfo.findOrCreate({
        where: { user_id },
        defaults: {
          bank_name: '',
          account_number: '',
          account_holder: '',
          otp_attempts: 0
        }
      });

      // Reset số lần thử khi lưu OTP mới
      await paymentInfo.update({ 
        otp_code,
        otp_attempts: 0,
        otp_locked_until: null
      });

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

  // Lấy OTP hiện tại (chỉ trả về masked)
  getCurrentOTP: async (req, res) => {
    try {
      const user_id = req.user.id;
      const paymentInfo = await PaymentInfo.findOne({ where: { user_id } });

      if (!paymentInfo || !paymentInfo.otp_code) {
        return res.json({ otp_code: null, message: 'Chưa có mã OTP' });
      }

      res.json({
        otp_code: '******' + paymentInfo.otp_code.slice(-2),
        has_otp: true,
        attempts: paymentInfo.otp_attempts || 0
      });
    } catch (error) {
      console.error('=== Get OTP error ===');
      console.error('Error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Verify OTP khi rút tiền - trả về success/fail để frontend xử lý
  verifyForWithdraw: async (req, res) => {
    const t = await require('../models').sequelize.transaction();
    try {
      const user_id = req.user.id;
      const { otp_code, withdrawal_amount } = req.body;

      if (!otp_code) {
        await t.rollback();
        return res.status(400).json({ valid: false, message: 'Vui lòng nhập mã OTP' });
      }

      // Validate: OTP phải là 6 số
      if (!/^\d{6}$/.test(otp_code)) {
        await t.rollback();
        return res.status(400).json({ valid: false, message: 'Mã OTP phải là 6 chữ số' });
      }

      const paymentInfo = await PaymentInfo.findOne({ 
        where: { user_id },
        transaction: t 
      });

      if (!paymentInfo) {
        await t.rollback();
        return res.status(400).json({ valid: false, message: 'Không tìm thấy thông tin OTP' });
      }

      // Kiểm tra có OTP chưa
      if (!paymentInfo.otp_code) {
        await t.rollback();
        return res.status(400).json({ valid: false, message: 'Bạn chưa có mã OTP. Vui lòng cập nhật OTP trước.' });
      }

      // Kiểm tra có đang bị khóa không
      if (paymentInfo.otp_locked_until && new Date() < new Date(paymentInfo.otp_locked_until)) {
        const remainingSeconds = Math.ceil((new Date(paymentInfo.otp_locked_until) - new Date()) / 1000);
        await t.rollback();
        return res.status(400).json({ 
          valid: false, 
          message: `Tài khoản bị khóa. Vui lòng thử lại sau ${remainingSeconds} giây.`,
          locked: true,
          locked_until: paymentInfo.otp_locked_until
        });
      }

      // Kiểm tra OTP
      if (otp_code === paymentInfo.otp_code) {
        // OTP đúng - reset số lần thử
        await paymentInfo.update({ 
          otp_attempts: 0,
          otp_locked_until: null
        }, { transaction: t });
        
        await t.commit();
        return res.json({ valid: true, message: 'OTP hợp lệ' });
      } else {
        // OTP sai - tăng số lần thử
        const newAttempts = (paymentInfo.otp_attempts || 0) + 1;
        
        if (newAttempts >= 5) {
          // Khóa 1 tiếng và trừ tiền
          const lockUntil = new Date(Date.now() + 60 * 60 * 1000); // 1 tiếng
          await paymentInfo.update({
            otp_attempts: newAttempts,
            otp_locked_until: lockUntil
          }, { transaction: t });
          
          // Trừ tiền tài khoản
          const { User } = require('../models');
          const user = await User.findByPk(user_id, { transaction: t });
          if (user) {
            user.balance = parseFloat(user.balance) - parseFloat(withdrawal_amount);
            await user.save({ transaction: t });
          }
          
          await t.commit();
          return res.json({
            valid: false,
            locked: true,
            attempts: newAttempts,
            message: `Bạn đã nhập sai OTP 5 lần. Tài khoản bị khóa 1 tiếng và bị trừ ${parseInt(withdrawal_amount).toLocaleString()}đ`,
            lock_until: lockUntil,
            deducted: true
          });
        } else {
          await paymentInfo.update({ otp_attempts: newAttempts }, { transaction: t });
          await t.commit();
          return res.json({
            valid: false,
            attempts: newAttempts,
            remaining: 5 - newAttempts,
            message: `Mã OTP không đúng. Còn ${5 - newAttempts} lần thử.`
          });
        }
      }
    } catch (error) {
      await t.rollback();
      console.error('=== Verify OTP error ===');
      console.error('Error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
};

module.exports = otpController;
