const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, PaymentInfo } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here_change_in_production';
const JWT_EXPIRES_IN = '7d';

const authController = {
  // Đăng ký
  register: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
      }

      if (username.length < 3 || username.length > 50) {
        return res.status(400).json({ message: 'Tên đăng nhập phải từ 3-50 ký tự' });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
      }

      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        username,
        password: hashedPassword,
        role: 'user'
      });

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.status(201).json({
        message: 'Đăng ký thành công',
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          balance: user.balance
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ message: 'Lỗi server khi đăng ký' });
    }
  },

  // Đăng nhập
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
      }

      const user = await User.findOne({ where: { username } });
      if (!user) {
        return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({
        message: 'Đăng nhập thành công',
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          balance: user.balance
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Lỗi server khi đăng nhập' });
    }
  },

  // Lấy thông tin user hiện tại
  getMe: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: ['id', 'username', 'role', 'created_at', 'balance']
      });

      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }

      // Lấy payment info để xác định isPremium
      const paymentInfo = await PaymentInfo.findOne({
        where: { user_id: user.id }
      });

      res.json({ 
        user: {
          ...user.toJSON(),
          isPremium: paymentInfo?.is_verified || false,
          payment_info: paymentInfo
        }
      });
    } catch (error) {
      console.error('GetMe error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  },

  // Lấy số dư
  getBalance: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: ['id', 'username', 'balance']
      });

      if (!user) {
        return res.status(404).json({ message: 'Không tìm thấy người dùng' });
      }

      res.json({ balance: user.balance });
    } catch (error) {
      console.error('GetBalance error:', error);
      res.status(500).json({ message: 'Lỗi server' });
    }
  }
};

module.exports = authController;
