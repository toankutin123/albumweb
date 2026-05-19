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

// Request logging middleware — logs every inbound request
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)` +
      (req.user ? ` | user=${req.user.id}` : '')
    );
  });
  next();
});

// Dynamic CORS configuration
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
    
    // Allow Render domains (including subdomains)
    if (origin.includes('onrender.com')) {
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

// Health check — reachable via nginx proxy at /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'albumweb-backend', timestamp: new Date().toISOString() });
});

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'AlbumWeb API đang chạy!' });
});

// Global error handler — catches any error passed via next(err)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('=== UNHANDLED ERROR ===');
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.error('Request body:', JSON.stringify(req.body, null, 2));
  console.error('Request params:', JSON.stringify(req.params, null, 2));
  console.error('Request query:', JSON.stringify(req.query, null, 2));
  console.error('Error message:', err.message);
  console.error('Error stack:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Lỗi server',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Sync database và start server
const startServer = async () => {
  const MAX_RETRIES = 30;
  const RETRY_DELAY_MS = 2000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`Đang kết nối database... (lần thử ${attempt}/${MAX_RETRIES})`);
      await sequelize.authenticate();
      console.log('Kết nối database thành công!');

      // Sync models (tự động tạo bảng nếu chưa có)
      await sequelize.sync({ alter: true });
      console.log('Đã đồng bộ models!');

      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server đang chạy tại http://0.0.0.0:${PORT}`);
      });

      return;
    } catch (error) {
      console.error(`Không thể kết nối database (lần thử ${attempt}/${MAX_RETRIES}):`, error.message);

      if (attempt === MAX_RETRIES) {
        console.error('Đã hết số lần thử. Dừng server.');
        process.exit(1);
      }

      console.log(`Thử lại sau ${RETRY_DELAY_MS / 1000} giây...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
};

startServer();
