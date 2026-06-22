-- ============================================
-- SQL SIMPLE UNTUK SUPABASE - TESTING ONLY
-- Setup database schema tanpa RLS untuk testing
-- ============================================

-- 1. BUAT TABEL USERS
CREATE TABLE IF NOT EXISTS users (
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
  
  CONSTRAINT username_length CHECK (LENGTH(username) >= 3),
  CONSTRAINT email_valid CHECK (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$')
);

-- 2. CREATE INDEXES
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 3. BUAT TABEL TRUSTED_DEVICES
CREATE TABLE IF NOT EXISTS trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_identifier VARCHAR(255) NOT NULL,
  device_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP,
  
  CONSTRAINT unique_user_device UNIQUE(user_id, device_identifier)
);

CREATE INDEX IF NOT EXISTS idx_trusted_devices_user ON trusted_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_identifier ON trusted_devices(device_identifier);

-- 4. BUAT TABEL LOGIN_LOGS
CREATE TABLE IF NOT EXISTS login_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(50) NOT NULL,
  login_status VARCHAR(50) NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_login_logs_user ON login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_created ON login_logs(created_at);

-- Done! Tables created successfully.
-- Now you can test sign up and login.
