-- ==========================================
-- SQL SETUP UNTUK SAFA.NET CUSTOM CONFIG
-- Copy-paste seluruh kode di bawah ini ke
-- Supabase -> SQL Editor -> New Query -> Run
-- ==========================================

-- 1. Buat tabel app_settings jika belum ada
CREATE TABLE IF NOT EXISTS app_settings (
    id INT PRIMARY KEY DEFAULT 1,
    app_name TEXT DEFAULT 'SAFA.NET',
    logo_data TEXT, -- Menyimpan data gambar logo format Base64
    role_permissions JSONB DEFAULT '{
        "admin": ["home", "pelanggan", "tagihan", "laporan", "pengaturan"],
        "teknisi": ["tagihan"],
        "owner": ["laporan"],
        "petugas": ["home", "pelanggan"]
    }'::jsonb,
    CONSTRAINT one_row_only CHECK (id = 1) -- Memastikan hanya ada 1 baris pengaturan aplikasi
);

-- Inisialisasi data pengaturan bawaan (default) jika belum ada
INSERT INTO app_settings (id, app_name, role_permissions)
VALUES (1, 'SAFA.NET', '{
    "admin": ["home", "pelanggan", "tagihan", "laporan", "pengaturan"],
    "teknisi": ["tagihan"],
    "owner": ["laporan"],
    "petugas": ["home", "pelanggan"]
}'::jsonb)
ON CONFLICT (id) DO UPDATE 
SET app_name = EXCLUDED.app_name;

-- 2. Buat tabel app_users jika belum ada
CREATE TABLE IF NOT EXISTS app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Inisialisasi akun Admin default bawaan (username: admin, password: admin123)
INSERT INTO app_users (username, password, role, name, phone)
VALUES ('admin', 'admin123', 'admin', 'Administrator', '081234567890')
ON CONFLICT (username) DO NOTHING;
