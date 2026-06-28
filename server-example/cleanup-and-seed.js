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

async function runCleanupAndSeed() {
  console.log('🚀 Starting cleanup of Supabase tables...');

  try {
    // 1. Delete all existing records
    console.log('🗑️  Deleting all records from login_logs...');
    const { error: err1 } = await supabase.from('login_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err1) console.warn('Warning: delete logs failed:', err1.message);

    console.log('🗑️  Deleting all records from trusted_devices...');
    const { error: err2 } = await supabase.from('trusted_devices').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err2) console.warn('Warning: delete devices failed:', err2.message);

    console.log('🗑️  Deleting all records from users...');
    const { error: err3 } = await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (err3) console.warn('Warning: delete users failed:', err3.message);

    // 2. Create the Admin 'admin' account
    console.log('➕ Creating Admin "admin" account...');
    // Password is 'admin123'. sha256('admin123') = 240be518fabd2724ddb6f04eeb1da1b3cfcd8fca0d78ac1a1538bdfed4059c4c
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          username: 'admin',
          name: 'Admin Utama',
          email: 'admin@univ.ac.id',
          password_hash: '240be518fabd2724ddb6f04eeb1da1b3cfcd8fca0d78ac1a1538bdfed4059c4c',
          roles: ['Admin'],
          is_active: true,
          avatar_url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=admin'
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to insert Admin "admin":', insertError.message);
      return;
    }

    console.log('✅ Admin "admin" created successfully!');
    console.log('Details:', newUser);

  } catch (error) {
    console.error('❌ Error during cleanup and seed:', error);
  }
}

runCleanupAndSeed();
