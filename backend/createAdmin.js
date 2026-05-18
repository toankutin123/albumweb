const sequelize = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('Kết nối database thành công!');

    await sequelize.sync({ alter: true });
    console.log('Đã đồng bộ models!');

    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    if (existingAdmin) {
      console.log('Tài khoản admin đã tồn tại!');
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await User.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Tài khoản admin đã được tạo!');
    console.log('Username: admin');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
};

createAdmin();
