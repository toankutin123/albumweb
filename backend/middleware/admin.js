const { User } = require('../models');

const admin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập trang này' });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

module.exports = admin;
