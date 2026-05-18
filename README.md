# Gaixinh Album

Nền tảng web bán bộ sưu tập ảnh với React + Node.js + PostgreSQL

## Tính năng chính

- Đăng ký / Đăng nhập với JWT
- Xem bộ sưu tập ảnh công khai
- Bộ sưu tập VIP cho thành viên cao cấp
- Hệ thống thanh toán chuyển khoản
- Dashboard quản trị cho admin
- Giao diện tiếng Việt
- Dark theme với hiệu ứng neon

## Cấu trúc dự án

```
albumweb/
├── backend/          # Node.js + Express API
│   ├── controllers/ # Business logic
│   ├── models/       # Sequelize models (PostgreSQL)
│   ├── routes/       # API routes
│   ├── middleware/   # Auth & admin middleware
│   ├── config/       # Database config
│   ├── migrations/   # Database migrations
│   └── server.js     # Entry point
│
└── frontend/         # React + Vite
    ├── src/
    │   ├── components/ # UI components
    │   ├── pages/     # Page components
    │   ├── context/   # React contexts
    │   └── services/  # API services
    └── index.html
```

## Deploy lên Railway

### Yêu cầu
- Tài khoản [Railway](https://railway.app)
- Git repository (đã initialize với `git init`)

### Các bước deploy

#### 1. Initialize Git Repository
```bash
cd albumweb
git init
git add .
git commit -m "Initial commit"
```

#### 2. Connect Railway
1. Truy cập [railway.app](https://railway.app)
2. Click "New Project" > "Deploy from GitHub"
3. Chọn repository `albumweb`
4. Railway sẽ tự động detect `railway.toml`

#### 3. Thiết lập Database
1. Trong Railway Dashboard, click "New" > "Database" > "PostgreSQL"
2. Sau khi tạo xong, copy `DATABASE_URL`
3. Paste vào biến môi trường của backend service

#### 4. Thiết lập Environment Variables

**Backend Service:**
| Variable | Value |
|----------|-------|
| `DATABASE_URL` | (Auto từ Railway PostgreSQL) |
| `JWT_SECRET` | Một chuỗi secret ngẫu nhiên (VD: `openssl rand -hex 32`) |
| `NODE_ENV` | `production` |
| `PORT` | `5000` |

**Frontend Service:**
| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `/api` |

#### 5. Configure Service Order
1. Backend phải start trước frontend
2. Trong Railway Dashboard, kéo backend lên trên frontend

#### 6. Deploy
Railway sẽ tự động deploy khi bạn push lên GitHub:
```bash
git push origin main
```

### Kiểm tra sau deploy
1. Backend health check: `https://your-backend.up.railway.app/`
2. Frontend: `https://your-frontend.up.railway.app/`

### Tài khoản Demo
| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Admin | admin@gaixinh.vn | admin123 |
| User | user01@gaixinh.vn | user123 |

### Tạo tài khoản Admin (sau khi deploy)
```bash
cd backend
npm run create-admin
```

## Local Development

### Backend
```bash
cd backend
cp .env .env.local  # Chỉnh sửa .env.local với PostgreSQL local
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker (Local PostgreSQL)
```bash
docker-compose -f docker-compose.postgres.yml up -d
```

## API Documentation

Xem chi tiết tại `backend/README.md`
