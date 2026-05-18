# Gaixinh Album - Frontend

## Giới thiệu
Frontend cho nền tảng chia sẻ bộ sưu tập ảnh Gaixinh Album.

## Công nghệ
- React 18 + Vite
- TailwindCSS
- React Router
- Axios
- Sonner (toast notifications)
- Lucide React (icons)

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build
```

## Environment Variables

| Variable | Mô tả |
|----------|--------|
| VITE_API_URL | Backend API URL (default: /api) |

## Cấu trúc thư mục

```
src/
├── components/     # Reusable components
├── pages/          # Page components
├── context/        # React contexts
├── services/       # API services
└── assets/         # Static assets
```

## Tính năng

### Người dùng
- Đăng ký / Đăng nhập
- Xem bộ sưu tập ảnh
- Xem bộ sưu tập VIP (cần VIP)
- Gửi yêu cầu thanh toán

### Admin
- Dashboard thống kê
- Quản lý người dùng
- Quản lý thanh toán
- Tạo bộ sưu tập mới

## Demo Accounts
- Admin: admin@gaixinh.vn / admin123
- User: user01@gaixinh.vn / user123
