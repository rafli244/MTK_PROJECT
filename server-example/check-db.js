// ============================================
// Check Database Tables Status
// ============================================

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  console.log('🔍 Checking database tables...\n');

  try {
    // Test users table
    console.log('1️⃣  Checking "users" table...');
    const { data: users, error: usersError } = await supabase.from('users').select('count');
    if (usersError) {
      if (usersError.code === 'PGRST116' || usersError.message.includes('not found')) {
        console.log('   ❌ Table "users" NOT FOUND - Need to create');
      } else {
        console.log('   ❓ Error:', usersError.message);
      }
    } else {
      console.log('   ✅ Table "users" EXISTS');
    }

    // Test trusted_devices table
    console.log('\n2️⃣  Checking "trusted_devices" table...');
    const { data: devices, error: devicesError } = await supabase.from('trusted_devices').select('count');
    if (devicesError) {
      console.log('   ❌ Table "trusted_devices" NOT FOUND');
    } else {
      console.log('   ✅ Table "trusted_devices" EXISTS');
    }

    // Test login_logs table
    console.log('\n3️⃣  Checking "login_logs" table...');
    const { data: logs, error: logsError } = await supabase.from('login_logs').select('count');
    if (logsError) {
      console.log('   ❌ Table "login_logs" NOT FOUND');
    } else {
      console.log('   ✅ Table "login_logs" EXISTS');
    }

    if (usersError || devicesError || logsError) {
      console.log('\n⚠️  Database tables need to be created manually.');
      console.log('📍 Go to: https://app.supabase.com/project/hdikxjdwfxjwpzpbmijp/sql/new');
      console.log('\n📋 Copy and paste this SQL:');
      console.log('=' . repeat(80));
      console.log(`
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

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. BUAT TABEL TRUSTED_DEVICES
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

-- 3. BUAT TABEL LOGIN_LOGS
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
      `);
      console.log('=' . repeat(80));
      console.log('\n✅ Then click "Run" to execute the SQL');
      return false;
    }

    console.log('\n✅ All tables exist! Database ready.');
    return true;

  } catch (error) {
    console.error('❌ Error checking tables:', error);
    return false;
  }
}

checkTables().then(ready => {
  if (!ready) {
    console.log('\n⏳ Waiting for manual SQL setup in Supabase...');
  }
});
