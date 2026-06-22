// ============================================
// server/controllers/authController.js
// Backend Authentication Logic
// ============================================

import bcryptjs from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const BCRYPT_ROUNDS = 10;

// ============================================
// SIGN UP HANDLER
// ============================================

export const signup = async (req, res) => {
  try {
    const { username, name, email, password, roles } = req.body;

    // Validasi input
    const errors = [];

    if (!username?.trim()) {
      errors.push('Username tidak boleh kosong');
    } else if (username.length < 3) {
      errors.push('Username minimal 3 karakter');
    }

    if (!name?.trim()) {
      errors.push('Nama lengkap tidak boleh kosong');
    }

    if (!email?.trim()) {
      errors.push('Email tidak boleh kosong');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.push('Format email tidak valid');
      }
    }

    if (!password) {
      errors.push('Password tidak boleh kosong');
    } else if (password.length < 6) {
      errors.push('Password minimal 6 karakter');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors.join('; ')
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
    const passwordHash = await bcryptjs.hash(password, BCRYPT_ROUNDS);

    // Insert ke database
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          username: username.trim(),
          name: name.trim(),
          email: email.trim(),
          password_hash: passwordHash,
          roles: roles?.length > 0 ? roles : ['Dosen'],
          is_active: true,
          avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username.trim()}`
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Gagal membuat akun: ' + error.message
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil! Silakan login.',
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        roles: newUser.roles
      }
    });

  } catch (error) {
    console.error('Sign up error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + error.message
    });
  }
};

// ============================================
// LOGIN HANDLER
// ============================================

export const login = async (req, res) => {
  try {
    const { username, password, selectedRole, rememberDevice, deviceId, deviceName } = req.body;

    // Validasi input
    if (!username?.trim() || !password || !selectedRole) {
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
      await logLoginAttempt(null, username.trim(), 'failed_not_found', req.ip);

      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    // Cek apakah akun aktif
    if (!user.is_active) {
      await logLoginAttempt(user.id, username.trim(), 'failed_inactive', req.ip);

      return res.status(403).json({
        success: false,
        message: 'Akun ini telah ditangguhkan',
        code: 'ACCOUNT_SUSPENDED'
      });
    }

    // Verifikasi password
    const passwordMatch = await bcryptjs.compare(password, user.password_hash);

    if (!passwordMatch) {
      await logLoginAttempt(user.id, username.trim(), 'failed_password', req.ip);

      return res.status(401).json({
        success: false,
        message: 'Username atau password salah'
      });
    }

    // Cek apakah user punya role yang diminta
    if (!Array.isArray(user.roles) || !user.roles.includes(selectedRole)) {
      return res.status(403).json({
        success: false,
        message: 'User tidak memiliki akses untuk role ini'
      });
    }

    // Log successful login
    await logLoginAttempt(user.id, username.trim(), 'success', req.ip, req.get('user-agent'));

    // Jika remember device, simpan device info
    if (rememberDevice && deviceId) {
      await saveTrustedDevice(user.id, deviceId, deviceName || 'Unknown Device');
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
        selectedRole: selectedRole,
        avatar: user.avatar_url
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server: ' + error.message
    });
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const logLoginAttempt = async (userId, username, status, ipAddress, userAgent = null) => {
  try {
    await supabase.from('login_logs').insert({
      user_id: userId,
      username: username,
      login_status: status,
      ip_address: ipAddress,
      user_agent: userAgent
    });
  } catch (error) {
    console.error('Failed to log login attempt:', error);
  }
};

const saveTrustedDevice = async (userId, deviceId, deviceName) => {
  try {
    await supabase.from('trusted_devices').upsert(
      {
        user_id: userId,
        device_identifier: deviceId,
        device_name: deviceName,
        is_active: true,
        last_used_at: new Date().toISOString()
      },
      {
        onConflict: 'user_id,device_identifier'
      }
    );
  } catch (error) {
    console.error('Failed to save trusted device:', error);
  }
};

// ============================================
// GET USER BY ID (untuk session verification)
// ============================================

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID tidak ditemukan'
      });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, name, email, roles, is_active, avatar_url')
      .eq('id', userId)
      .single();

    if (!user || error) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// ============================================
// CHECK USERNAME AVAILABILITY
// ============================================

export const checkUsernameAvailable = async (req, res) => {
  try {
    const { username } = req.query;

    if (!username || username.length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Username minimal 3 karakter'
      });
    }

    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('username', username.trim())
      .single();

    return res.status(200).json({
      success: true,
      available: !data
    });

  } catch (error) {
    console.error('Check username error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};

// ============================================
// CHECK EMAIL AVAILABILITY
// ============================================

export const checkEmailAvailable = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email tidak boleh kosong'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format email tidak valid'
      });
    }

    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.trim())
      .single();

    return res.status(200).json({
      success: true,
      available: !data
    });

  } catch (error) {
    console.error('Check email error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
};
