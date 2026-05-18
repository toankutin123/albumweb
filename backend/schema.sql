-- =============================================
-- AlbumWeb Database Schema
-- PostgreSQL Docker Container
-- =============================================

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR NOT NULL UNIQUE,
    password VARCHAR NOT NULL,
    full_name VARCHAR DEFAULT '',
    phone VARCHAR DEFAULT '',
    avatar TEXT DEFAULT '',
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_premium BOOLEAN DEFAULT false,
    premium_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create collections table
CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT DEFAULT '',
    cover_image TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'mac-dinh' CHECK (category IN ('thoi-trang', 'phong-cach', 'cuoi-gioi', 'mac-dinh')),
    is_premium BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create images table
CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    caption VARCHAR DEFAULT ''
);

-- 4. Create collection_images junction table
CREATE TABLE IF NOT EXISTS collection_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    image_id UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    UNIQUE(collection_id, image_id)
);

-- 5. Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    bank_name VARCHAR NOT NULL,
    account_number VARCHAR NOT NULL,
    account_holder VARCHAR NOT NULL,
    transfer_note VARCHAR DEFAULT '',
    amount DECIMAL(10, 0) DEFAULT 100000,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_note VARCHAR DEFAULT '',
    processed_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Indexes
-- =============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Collections indexes
CREATE INDEX IF NOT EXISTS idx_collections_title ON collections(title);
CREATE INDEX IF NOT EXISTS idx_collections_category ON collections(category);
CREATE INDEX IF NOT EXISTS idx_collections_is_premium ON collections(is_premium);
CREATE INDEX IF NOT EXISTS idx_collections_created_by_id ON collections(created_by_id);

-- Images indexes
CREATE INDEX IF NOT EXISTS idx_images_url ON images(url);

-- Collection images indexes
CREATE INDEX IF NOT EXISTS idx_collection_images_collection_id ON collection_images(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_images_image_id ON collection_images(image_id);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- =============================================
-- Sample Data (Optional - for testing)
-- =============================================

-- Insert admin user (password: admin123)
INSERT INTO users (id, username, email, password, full_name, role, is_premium)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'admin',
    'admin@albumweb.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.H3P4PNBWTWX8Ly',
    'Administrator',
    'admin',
    true
) ON CONFLICT (username) DO NOTHING;

-- Insert sample collection
INSERT INTO collections (id, title, description, cover_image, category, is_premium, view_count, created_by_id)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'Bộ sưu tập thời trang mùa hè',
    'Khám phá bộ sưu tập thời trang mùa hè 2026 với những thiết kế độc đáo.',
    'https://picsum.photos/seed/fashion1/800/600',
    'thoi-trang',
    false,
    150,
    'a0000000-0000-0000-0000-000000000001'
) ON CONFLICT DO NOTHING;

-- Insert sample collection 2 (premium)
INSERT INTO collections (id, title, description, cover_image, category, is_premium, view_count, created_by_id)
VALUES (
    'b0000000-0000-0000-0000-000000000002',
    'Bộ sưu tập VIP - Phong cách cao cấp',
    'Bộ sưu tập dành riêng cho thành viên Premium với những hình ảnh chất lượng cao.',
    'https://picsum.photos/seed/vip1/800/600',
    'phong-cach',
    true,
    89,
    'a0000000-0000-0000-0000-000000000001'
) ON CONFLICT DO NOTHING;

-- Insert sample images
INSERT INTO images (id, url, caption) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'https://picsum.photos/seed/img1/800/600', 'Hình ảnh 1'),
    ('c0000000-0000-0000-0000-000000000002', 'https://picsum.photos/seed/img2/800/600', 'Hình ảnh 2'),
    ('c0000000-0000-0000-0000-000000000003', 'https://picsum.photos/seed/img3/800/600', 'Hình ảnh 3'),
    ('c0000000-0000-0000-0000-000000000004', 'https://picsum.photos/seed/img4/800/600', 'Hình ảnh VIP 1'),
    ('c0000000-0000-0000-0000-000000000005', 'https://picsum.photos/seed/img5/800/600', 'Hình ảnh VIP 2')
ON CONFLICT DO NOTHING;

-- Link images to collections
INSERT INTO collection_images (collection_id, image_id) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001'),
    ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002'),
    ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003'),
    ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000004'),
    ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000005')
ON CONFLICT DO NOTHING;

-- =============================================
-- Verification
-- =============================================

-- List all tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Show sample data
SELECT 'users' as table_name, count(*) as count FROM users
UNION ALL
SELECT 'collections', count(*) FROM collections
UNION ALL
SELECT 'images', count(*) FROM images
UNION ALL
SELECT 'collection_images', count(*) FROM collection_images
UNION ALL
SELECT 'payments', count(*) FROM payments;
