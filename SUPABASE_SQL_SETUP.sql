-- ============================================
-- SQL SYNTAX UNTUK SUPABASE
-- Sistem Otentikasi Sadar Konteks
-- ============================================

-- 1. BUAT TABEL USERS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  roles TEXT[] DEFAULT ARRAY['Dosen'],
  is_active BOOLEAN DEFAULT true,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes untuk performance
  CONSTRAINT username_length CHECK (LENGTH(username) >= 3),
  CONSTRAINT email_valid CHECK (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$')
);

-- 2. CREATE INDEX untuk username dan email (untuk login yang cepat)
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- 3. CREATE ENUM TYPE UNTUK ROLES (optional, untuk type safety)
CREATE TYPE user_role AS ENUM ('Admin', 'Dosen');

-- 4. BUAT TABEL TRUSTED_DEVICES (untuk remember device feature)
CREATE TABLE trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_identifier VARCHAR(255) NOT NULL,
  device_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  
  CONSTRAINT unique_user_device UNIQUE(user_id, device_identifier)
);

CREATE INDEX idx_trusted_devices_user ON trusted_devices(user_id);
CREATE INDEX idx_trusted_devices_identifier ON trusted_devices(device_identifier);

-- 5. BUAT TABEL LOGIN_LOGS (untuk audit trail)
CREATE TABLE login_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(50) NOT NULL,
  login_status VARCHAR(50) NOT NULL, -- 'success', 'failed_password', 'failed_inactive', 'failed_not_found'
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_login_logs_user ON login_logs(user_id);
CREATE INDEX idx_login_logs_created ON login_logs(created_at);

-- 6. INSERT DATA DEFAULT (optional - sesuai dengan dokumentasi project)
INSERT INTO users (username, email, name, password_hash, roles, is_active)
VALUES
  ('budi', 'budi.santoso@univ.ac.id', 'Dr. Budi Santoso, M.T.', '$2b$10$...', ARRAY['Admin', 'Dosen'], true),
  ('siti', 'siti.rahma@univ.ac.id', 'Siti Rahma, M.Sc.', '$2b$10$...', ARRAY['Dosen'], true),
  ('dewi', 'dewi.lestari@univ.ac.id', 'Dewi Lestari, S.Kom.', '$2b$10$...', ARRAY['Dosen'], true),
  ('gede', 'gede.wiguna@univ.ac.id', 'Gede Wiguna, S.Kom.', '$2b$10$...', ARRAY['Admin'], false),
  ('anto', 'anto.wijaya@univ.ac.id', 'Anto Wijaya, S.T.', '$2b$10$...', ARRAY['Admin'], true)
ON CONFLICT (username) DO NOTHING;

-- 7. ENABLE ROW LEVEL SECURITY (RLS) - UNTUK KEAMANAN
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;

-- 8. CREATE POLICIES (sesuaikan dengan logic aplikasi)
-- Policy: Users bisa melihat profile mereka sendiri
CREATE POLICY "Users can view their own profile" 
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Public dapat registrasi (insert ke users tanpa login)
CREATE POLICY "Anyone can sign up"
  ON users FOR INSERT
  WITH CHECK (true);

-- ============================================
-- CATATAN PENTING:
-- ============================================
-- 1. Password hash menggunakan bcrypt (gunakan library bcrypt di backend)
-- 2. Ganti $2b$10$... dengan hasil hash actual dari password
-- 3. Untuk development, kamu bisa gunakan password plaintext terlebih dahulu
--    tapi JANGAN di production
-- 4. Sesuaikan RLS policies sesuai requirement keamanan
-- 5. User roles adalah array TEXT[] supaya support multiple roles per user
