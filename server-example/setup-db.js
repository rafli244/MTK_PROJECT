// ============================================
// Setup Script - Create Supabase Tables
// Run this ONCE to initialize the database
// ============================================

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const setupSQL = `
-- 1. BUAT TABEL USERS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  oauth_provider VARCHAR(20) DEFAULT 'local',
  oauth_id VARCHAR(255) UNIQUE,
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
`;

async function setupDatabase() {
  try {
    console.log('🚀 Starting database setup...');
    console.log(`📍 Supabase URL: ${supabaseUrl}`);

    // Execute SQL using RPC or direct query
    // Try using the SQL query execution method
    const { data, error } = await supabase.rpc('exec', { sql_query: setupSQL });

    if (error && error.message.includes('does not exist')) {
      // If RPC doesn't exist, we'll try a different approach
      console.log('⚠️  RPC method not available, trying alternative...');
      
      // Try creating tables one by one using the client
      console.log('Creating users table...');
      const { error: usersError } = await supabase.from('users').select('count');
      if (usersError && usersError.code === 'PGRST116') {
        // Table doesn't exist, need to create via SQL
        console.log('⚠️  Cannot create table directly via client. Please run SQL manually in Supabase dashboard.');
        console.log('\n📋 SQL to run in Supabase SQL Editor:');
        console.log('=' . repeat(80));
        console.log(setupSQL);
        console.log('=' . repeat(80));
        return false;
      }
    }

    if (error) {
      console.error('❌ Database setup error:', error.message);
      return false;
    }

    console.log('✅ Database setup completed successfully!');
    console.log('\n📊 Tables created:');
    console.log('  - users');
    console.log('  - trusted_devices');
    console.log('  - login_logs');
    
    return true;

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 Please run this SQL manually in Supabase SQL Editor:');
    console.log('=' . repeat(80));
    console.log(setupSQL);
    console.log('=' . repeat(80));
    return false;
  }
}

setupDatabase().then(success => {
  process.exit(success ? 0 : 1);
});
