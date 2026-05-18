# SQL tạo bảng users cho PostgreSQL

## Thông tin kết nối
- Host: localhost
- Port: 5433
- User: postgres
- Password: postgres123
- Database: albumweb

## Cách chạy
```bash
# Kết nối PostgreSQL
psql -h localhost -p 5433 -U postgres -d albumweb

# Sau đó copy và paste code SQL bên dưới
```

## Code SQL tạo bảng

```sql
-- Tạo bảng users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tạo index để tối ưu tìm kiếm
CREATE INDEX idx_users_username ON users(username);

-- Thêm tài khoản admin đầu tiên
-- Password: admin123 (sẽ được hash trong code thực tế)
INSERT INTO users (username, password, role)
VALUES ('admin', '$2b$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'admin');

-- Xem lại bảng
SELECT * FROM users;
```

## Lưu ý quan trọng
- Password trong database phải được hash (sử dụng bcrypt)
- Khi user đăng ký qua form, code backend sẽ tự động hash password trước khi lưu
- Tài khoản admin trên chỉ là ví dụ, bạn có thể tạo sau qua code hoặc manual

## Nếu muốn tạo tài khoản admin thủ công (sau khi bảng đã tạo)
```sql
-- Cách 1: Dùng password chưa hash (chỉ dùng để test)
INSERT INTO users (username, password, role)
VALUES ('admin', 'admin123', 'admin');

-- Cách 2: Dùng password đã hash (hash với bcrypt cost 10)
-- Bạn có thể dùng website https://bcrypt-generator.com/ để tạo hash
-- Hoặc chạy code Node.js:
-- const bcrypt = require('bcryptjs');
-- bcrypt.hash('admin123', 10).then(hash => console.log(hash));
```

## Bảng payment_info

```sql
-- Tạo bảng payment_info
CREATE TABLE payment_info (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    bank_name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50) NOT NULL,
    account_holder VARCHAR(100) NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Tạo index
CREATE INDEX idx_payment_user_id ON payment_info(user_id);
```
