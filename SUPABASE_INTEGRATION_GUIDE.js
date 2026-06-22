// ============================================
// DOKUMENTASI INTEGRASI SUPABASE
// Sistem Otentikasi Sadar Konteks
// ============================================

/*
LANGKAH-LANGKAH SETUP:

1. SETUP SUPABASE PROJECT:
   - Buka https://supabase.com
   - Buat project baru
   - Ambil SUPABASE_URL dan SUPABASE_ANON_KEY dari project settings
   
2. JALANKAN SQL QUERY:
   - Buka Supabase Query Editor
   - Copy semua query dari SUPABASE_SQL_SETUP.sql
   - Jalankan query tersebut

3. INSTALL DEPENDENCIES:
   npm install @supabase/supabase-js bcryptjs dotenv

4. SETUP ENVIRONMENT VARIABLES:
   Buat file .env.local di root project:
   
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

5. BUAT SERVICE BACKEND:
   Ikuti kode di bawah ini untuk API endpoint

6. UPDATE App.jsx:
   Tambahkan state untuk sign up toggle dan integrasi Supabase client
*/

// ============================================
// BACKEND SERVICE (Node.js + Express)
// ============================================

/*
INSTALL: npm install express bcryptjs dotenv cors

File: server/authService.js atau routes/auth.js
*/

import bcryptjs from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key di backend
const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// SIGN UP ENDPOINT
// ============================================

export const signUp = async (req, res) => {
  try {
    const { username, name, email, password, roles } = req.body;

    // Validasi input
    if (!username || !name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi'
      });
    }

    if (username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username minimal 3 karakter'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password minimal 6 karakter'
      });
    }

    // Cek username sudah ada
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username.trim())
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username sudah terdaftar'
      });
    }

    // Cek email sudah ada
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.trim())
      .single();

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcryptjs.hash(password, saltRounds);

    // Insert ke database
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username: username.trim(),
          name: name.trim(),
          email: email.trim(),
          password_hash: passwordHash,
          roles: roles || ['Dosen'],
          is_active: true
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal mendaftar: ' + error.message
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil',
      data: {
        id: data.id,
        username: data.username,
        email: data.email,
        name: data.name,
        roles: data.roles
      }
    });

  } catch (error) {
    console.error('Sign up error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// ============================================
// LOGIN ENDPOINT
// ============================================

export const login = async (req, res) => {
  try {
    const { username, password, selectedRole, rememberDevice } = req.body;

    if (!username || !password || !selectedRole) {
      return res.status(400).json({
        success: false,
        message: 'Username, password, dan role harus diisi'
      });
    }

    // Cari user berdasarkan username
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username.trim())
      .single();

    if (!user || error) {
      // Log failed login attempt
      await supabase.from('login_logs').insert({
        username: username.trim(),
        login_status: 'failed_not_found',
        ip_address: req.ip
      });

      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    // Cek apakah akun aktif
    if (!user.is_active) {
      await supabase.from('login_logs').insert({
        user_id: user.id,
        username: username.trim(),
        login_status: 'failed_inactive',
        ip_address: req.ip
      });

      return res.status(403).json({
        success: false,
        message: 'Akun ini telah ditangguhkan',
        code: 'ACCOUNT_SUSPENDED'
      });
    }

    // Verifikasi password
    const passwordMatch = await bcryptjs.compare(password, user.password_hash);

    if (!passwordMatch) {
      await supabase.from('login_logs').insert({
        user_id: user.id,
        username: username.trim(),
        login_status: 'failed_password',
        ip_address: req.ip
      });

      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    // Cek apakah user punya role yang diminta
    if (!user.roles.includes(selectedRole)) {
      return res.status(403).json({
        success: false,
        message: 'User tidak memiliki role ini'
      });
    }

    // Log successful login
    await supabase.from('login_logs').insert({
      user_id: user.id,
      username: username.trim(),
      login_status: 'success',
      ip_address: req.ip
    });

    // Jika remember device, simpan device info
    if (rememberDevice) {
      const deviceId = req.body.deviceId || generateDeviceId();
      
      await supabase.from('trusted_devices').upsert({
        user_id: user.id,
        device_identifier: deviceId,
        device_name: req.body.deviceName || 'Unknown Device',
        last_used_at: new Date()
      }, {
        onConflict: 'user_id,device_identifier'
      });
    }

    // Return user data (jangan return password!)
    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        roles: user.roles,
        selectedRole: selectedRole
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// Helper function untuk generate device ID
const generateDeviceId = () => {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

// ============================================
// EXPRESS SETUP (server/index.js)
// ============================================

/*
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
app.use(express.json());

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
*/

// ============================================
// FRONTEND INTEGRATION (utils/supabaseClient.js)
// ============================================

/*
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
*/

// ============================================
// UPDATE App.jsx - TAMBAHKAN INI:
// ============================================

/*
import { useState } from 'react';
import LoginForm from './components/LoginForm.jsx';
import SignUpForm from './components/SignUpForm.jsx';

export default function App() {
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  // ... state lainnya

  return (
    <div>
      {!isLoggedIn ? (
        isSignUpMode ? (
          <SignUpForm 
            onSignUpSuccess={() => {
              setIsSignUpMode(false);
              // Bisa juga redirect langsung ke login
            }}
            onSwitchToLogin={() => setIsSignUpMode(false)}
          />
        ) : (
          <LoginForm 
            onLoginSuccess={handleLoginSuccess}
            onSignUpClick={() => setIsSignUpMode(true)}
            onInputChange={handleCredentialChange}
            users={users}
          />
        )
      ) : (
        <Dashboard {...} />
      )}
    </div>
  );
}
*/

// ============================================
// UPDATE SignUpForm.jsx - GANTI API URL
// ============================================

/*
Di SignUpForm.jsx, baris ~115, ganti:

const response = await fetch('YOUR_API_URL/auth/signup', {

Dengan:

const response = await fetch('http://localhost:5000/api/auth/signup', {
  // atau
const response = await fetch(import.meta.env.VITE_API_URL + '/auth/signup', {

Untuk production, gunakan API URL yang sesuai (misal: https://api.yourserver.com/auth/signup)
*/
