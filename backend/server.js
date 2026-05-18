const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const userRoutes = require('./routes/user');
const albumRoutes = require('./routes/album');
const favoriteRoutes = require('./routes/favorite');
const depositRoutes = require('./routes/deposit');

const app = express();
const PORT = process.env.PORT || 5000;

// Dynamic CORS configuration for Railway
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow Railway domains
    if (origin.endsWith('.up.railway.app') || 
        origin.endsWith('.railway.app') ||
        origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Allow explicit ALLOWED_ORIGIN env var
    if (process.env.ALLOWED_ORIGIN && origin === process.env.ALLOWED_ORIGIN) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/deposit', depositRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'AlbumWeb API đang chạy!' });
});

// Sync database và start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Kết nối database thành công!');

    // Sync models (tự động tạo bảng nếu chưa có)
    await sequelize.sync({ alter: true });
    console.log('Đã đồng bộ models!');

    app.listen(PORT, () => {
      console.log(`Server đang chạy tại http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Không thể kết nối database:', error);
    process.exit(1);
  }
};

startServer();
