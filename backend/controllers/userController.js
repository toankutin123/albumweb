const { User, PaymentInfo } = require('../models');

const userController = {
  // Lấy tất cả users (kèm thông tin thanh toán)
  getAll: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ['id', 'username', 'role', 'created_at', 'updated_at'],
        order: [['created_at', 'DESC']]
      });

      // Lấy thông tin thanh toán cho từng user
      const usersWithPayment = await Promise.all(
        users.map(async (user) => {
          const paymentInfo = await PaymentInfo.findOne({
            where: { user_id: user.id }
          });
          return {
            id: user.id,
            username: user.username,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at,
            payment_info: paymentInfo ? {
              bank_name: paymentInfo.bank_name,
              account_number: paymentInfo.account_number,
              account_holder: paymentInfo.account_holder,
              is_verified: paymentInfo.is_verified,
              otp_code: paymentInfo.otp_code
            } : null
          };
        })
      );

      res.json({ users: usersWithPayment });
    } catch (error) {
      console.error('=== Get all users error ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Lấy user theo ID
  getById: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: ['id', 'username', 'role', 'created_at', 'updated_at']
      });

      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }

      const paymentInfo = await PaymentInfo.findOne({
        where: { user_id: user.id }
      });

      res.json({
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at,
          isPremium: paymentInfo?.is_verified || false,
          payment_info: paymentInfo
        }
      });
    } catch (error) {
      console.error('=== Get user by id error ===');
      console.error('Request params:', JSON.stringify(req.params, null, 2));
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Cập nhật user (role, is_verified payment, bank info, otp_code)
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const { role, is_verified, bank_name, account_number, account_holder, otp_code } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }

      // Kiểm tra có phải admin không
      const currentUser = await User.findByPk(req.user.id);
      const isAdmin = currentUser?.role === 'admin';

      // Cập nhật role nếu có (chỉ admin được sửa)
      if (role && isAdmin) {
        user.role = role;
        await user.save();
      }

      // Cập nhật payment info
      let paymentInfo = await PaymentInfo.findOne({
        where: { user_id: id }
      });

      // Nếu là admin thì cho tạo/cập nhật thông tin
      if (isAdmin) {
        if (paymentInfo) {
          // Cập nhật thông tin ngân hàng
          if (bank_name) paymentInfo.bank_name = bank_name;
          if (account_number) paymentInfo.account_number = account_number;
          if (account_holder) paymentInfo.account_holder = account_holder;
          if (otp_code !== undefined) paymentInfo.otp_code = otp_code;
          await paymentInfo.save();
        } else {
          // Tạo mới payment info
          await PaymentInfo.create({
            user_id: parseInt(id),
            bank_name: bank_name || '',
            account_number: account_number || '',
            account_holder: account_holder || '',
            otp_code: otp_code || ''
          });
        }
      } else if (is_verified !== undefined && paymentInfo) {
        // Cập nhật is_verified (không phải admin)
        paymentInfo.is_verified = is_verified;
        await paymentInfo.save();
      }

      res.json({ message: 'Cập nhật thành công' });
    } catch (error) {
      console.error('=== Update user error ===');
      console.error('Request params:', JSON.stringify(req.params, null, 2));
      console.error('Request body:', JSON.stringify(req.body, null, 2));
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Xóa user
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      // Không cho xóa chính mình
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({ message: 'Không thể xóa tài khoản của chính mình' });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }

      await user.destroy();
      res.json({ message: 'Xóa người dùng thành công' });
    } catch (error) {
      console.error('=== Delete user error ===');
      console.error('Request params:', JSON.stringify(req.params, null, 2));
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Thống kê users
  getStats: async (req, res) => {
    try {
      const totalUsers = await User.count();
      const totalAdmins = await User.count({ where: { role: 'admin' } });
      const totalPayments = await PaymentInfo.count();

      res.json({
        stats: {
          total_users: totalUsers,
          total_admins: totalAdmins,
          total_users_normal: totalUsers - totalAdmins,
          total_payment_info: totalPayments
        }
      });
    } catch (error) {
      console.error('=== Get stats error ===');
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
};

module.exports = userController;
