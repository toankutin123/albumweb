const { Payment, PaymentInfo, User } = require('../models');

const depositController = {
  // ========== USER ROUTES ==========

  // Tạo yêu cầu nạp tiền
  createDeposit: async (req, res) => {
    try {
      const { amount, transfer_note } = req.body;
      const user_id = req.user.id;

      if (!amount || amount < 10000) {
        return res.status(400).json({ message: 'Số tiền nạp tối thiểu là 10.000đ' });
      }

      const deposit = await Payment.create({
        user_id,
        amount,
        transfer_note,
        status: 'pending'
      });

      res.status(201).json({
        message: 'Tạo yêu cầu nạp tiền thành công',
        deposit
      });
    } catch (error) {
      console.error('Create deposit error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Lấy lịch sử nạp tiền của user
  getMyDeposits: async (req, res) => {
    try {
      const user_id = req.user.id;
      
      const deposits = await Payment.findAll({
        where: { user_id },
        include: [{ model: User, as: 'user', attributes: ['id', 'username'] }],
        order: [['created_at', 'DESC']]
      });

      res.json({ deposits });
    } catch (error) {
      console.error('Get deposits error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // ========== ADMIN ROUTES ==========

  // Lấy tất cả yêu cầu nạp tiền
  getAllDeposits: async (req, res) => {
    try {
      const { status } = req.query;
      const where = status && status !== 'all' ? { status } : {};
      
      const deposits = await Payment.findAll({
        where,
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'username'] 
          }
        ],
        order: [['created_at', 'DESC']]
      });

      // Lấy paymentInfo cho từng deposit
      const depositsWithInfo = await Promise.all(deposits.map(async (deposit) => {
        const paymentInfo = await PaymentInfo.findOne({
          where: { user_id: deposit.user_id },
          attributes: ['bank_name', 'account_number', 'account_holder']
        });
        return {
          ...deposit.toJSON(),
          paymentInfo: paymentInfo ? paymentInfo.toJSON() : null
        };
      }));

      res.json({ deposits: depositsWithInfo });
    } catch (error) {
      console.error('Get all deposits error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Duyệt yêu cầu nạp tiền
  approveDeposit: async (req, res) => {
    try {
      const { id } = req.params;
      
      const deposit = await Payment.findByPk(id, {
        include: [{ model: User, as: 'user' }]
      });

      if (!deposit) {
        return res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
      }

      if (deposit.status !== 'pending') {
        return res.status(400).json({ message: 'Yêu cầu đã được xử lý' });
      }

      // Cộng tiền vào tài khoản user
      const user = await User.findByPk(deposit.user_id);
      user.balance = parseFloat(user.balance) + parseFloat(deposit.amount);
      await user.save();

      deposit.status = 'approved';
      await deposit.save();

      res.json({ 
        message: 'Đã duyệt yêu cầu nạp tiền và cộng tiền vào tài khoản',
        deposit,
        newBalance: user.balance
      });
    } catch (error) {
      console.error('Approve deposit error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Từ chối yêu cầu nạp tiền
  rejectDeposit: async (req, res) => {
    try {
      const { id } = req.params;
      
      const deposit = await Payment.findByPk(id, {
        include: [{ model: User, as: 'user' }]
      });

      if (!deposit) {
        return res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
      }

      if (deposit.status !== 'pending') {
        return res.status(400).json({ message: 'Yêu cầu đã được xử lý' });
      }

      deposit.status = 'rejected';
      await deposit.save();

      res.json({ 
        message: 'Đã từ chối yêu cầu nạp tiền',
        deposit 
      });
    } catch (error) {
      console.error('Reject deposit error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
};

module.exports = depositController;
