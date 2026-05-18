const { PaymentInfo } = require('../models');

const paymentController = {
  // Lấy thông tin thanh toán của user
  getMyPaymentInfo: async (req, res) => {
    try {
      const paymentInfo = await PaymentInfo.findOne({
        where: { user_id: req.user.id }
      });

      if (!paymentInfo) {
        return res.json({ paymentInfo: null, message: 'Chưa có thông tin thanh toán' });
      }

      res.json({ paymentInfo });
    } catch (error) {
      console.error('Get payment info error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Tạo/Cập nhật thông tin thanh toán
  savePaymentInfo: async (req, res) => {
    try {
      const { bank_name, account_number, account_holder } = req.body;

      if (!bank_name || !account_number || !account_holder) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
      }

      if (account_number.length < 6 || account_number.length > 20) {
        return res.status(400).json({ message: 'Số tài khoản không hợp lệ' });
      }

      const existingInfo = await PaymentInfo.findOne({
        where: { user_id: req.user.id }
      });

      if (existingInfo) {
        return res.status(400).json({ 
          message: 'Đã có thông tin thanh toán, không thể thêm mới. Liên hệ admin để chỉnh sửa.' 
        });
      }

      const paymentInfo = await PaymentInfo.create({
        user_id: req.user.id,
        bank_name,
        account_number,
        account_holder
      });

      res.status(201).json({
        message: 'Lưu thông tin thanh toán thành công',
        paymentInfo
      });
    } catch (error) {
      console.error('Save payment info error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
};

module.exports = paymentController;
