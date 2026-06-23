import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle, Eye, EyeOff, UserPlus } from 'lucide-react';
import { supabase } from '../utils/supabaseClient.js';
import bcryptjs from 'bcryptjs';

export default function SignUpForm({ onSignUpSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    roles: ['Dosen'] // Default role
  });

  const [alertInfo, setAlertInfo] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    setAlertInfo(null);

    if (!formData.username.trim()) {
      setAlertInfo({
        type: 'error',
        message: 'Username tidak boleh kosong'
      });
      return false;
    }

    if (formData.username.length < 3) {
      setAlertInfo({
        type: 'error',
        message: 'Username minimal 3 karakter'
      });
      return false;
    }

    if (!formData.name.trim()) {
      setAlertInfo({
        type: 'error',
        message: 'Nama lengkap tidak boleh kosong'
      });
      return false;
    }

    if (!formData.email.trim()) {
      setAlertInfo({
        type: 'error',
        message: 'Email tidak boleh kosong'
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setAlertInfo({
        type: 'error',
        message: 'Format email tidak valid'
      });
      return false;
    }

    if (!formData.password) {
      setAlertInfo({
        type: 'error',
        message: 'Password tidak boleh kosong'
      });
      return false;
    }

    if (formData.password.length < 6) {
      setAlertInfo({
        type: 'error',
        message: 'Password minimal 6 karakter'
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setAlertInfo({
        type: 'error',
        message: 'Password dan konfirmasi password tidak cocok'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // 1. Try to register directly to Supabase first if available (Vercel static deployment)
    if (supabase) {
      try {
        // Cek username sudah ada
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('username', formData.username.trim())
          .maybeSingle();

        if (existingUser) {
          throw new Error('Username sudah terdaftar');
        }

        // Cek email sudah ada
        const { data: existingEmail } = await supabase
          .from('users')
          .select('id')
          .eq('email', formData.email.trim())
          .maybeSingle();

        if (existingEmail) {
          throw new Error('Email sudah terdaftar');
        }

        // Hash password with bcryptjs
        const salt = await bcryptjs.genSalt(10);
        const passwordHash = await bcryptjs.hash(formData.password, salt);

        // Insert ke database
        const { data, error } = await supabase
          .from('users')
          .insert([
            {
              username: formData.username.trim(),
              name: formData.name.trim(),
              email: formData.email.trim(),
              password_hash: passwordHash,
              roles: formData.roles,
              is_active: true
            }
          ])
          .select()
          .single();

        if (error) {
          throw new Error('Gagal mendaftar: ' + error.message);
        }

        setAlertInfo({
          type: 'success',
          message: 'Pendaftaran berhasil! Silakan login dengan akun Anda.'
        });

        const registeredUser = {
          id: data.id,
          username: data.username,
          name: data.name,
          email: data.email,
          roles: data.roles,
          isActive: data.is_active,
          passwordCipher: data.password_hash
        };

        setFormData({
          username: '',
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          roles: ['Dosen']
        });

        setTimeout(() => {
          onSignUpSuccess(registeredUser);
        }, 2000);
        setIsLoading(false);
        return;
      } catch (err) {
        console.warn("Direct Supabase registration failed, trying backend API fallback.", err);
        if (err.message === 'Username sudah terdaftar' || err.message === 'Email sudah terdaftar') {
          setAlertInfo({
            type: 'error',
            message: err.message
          });
          setIsLoading(false);
          return;
        }
      }
    }

    // 2. Fallback to Express Backend API
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          roles: formData.roles
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal mendaftar');
      }

      const data = await response.json();

      setAlertInfo({
        type: 'success',
        message: 'Pendaftaran berhasil! Silakan login dengan akun Anda.'
      });

      const registeredUser = {
        id: data.data.id,
        username: data.data.username,
        name: data.data.name,
        email: data.data.email,
        roles: data.data.roles,
        isActive: true,
        passwordCipher: data.data.password_hash || ''
      };

      setFormData({
        username: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        roles: ['Dosen']
      });

      setTimeout(() => {
        onSignUpSuccess(registeredUser);
      }, 2000);
      setIsLoading(false);
      return;
    } catch (error) {
      console.warn("Backend sign up API unavailable, performing local registration fallback.", error);

      // 3. Fallback to Local Simulation
      const { sha256 } = await import('../utils/crypto.js');
      const passwordHash = sha256(formData.password);

      const newUser = {
        id: 'u' + Date.now(),
        username: formData.username.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        passwordCipher: passwordHash,
        roles: formData.roles,
        isActive: true,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${formData.username.trim()}`
      };

      setAlertInfo({
        type: 'success',
        message: 'Pendaftaran berhasil secara lokal (Simulasi Sandbox)!'
      });

      setFormData({
        username: '',
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        roles: ['Dosen']
      });

      setTimeout(() => {
        onSignUpSuccess(newUser);
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Main Glass Form Panel */}
      <div className="glass-panel panel-accent-top p-6 rounded-2xl">
        <div className="mb-6 text-center pt-1">
          <h2 className="text-xl font-bold text-parchment-50 glow-text-purple">Buat Akun Baru</h2>
          <p className="text-xs text-parchment-400 mt-1">
            Daftar untuk terintegrasi dengan database otentikasi.
          </p>
        </div>

        {/* Alert Messages */}
        {alertInfo && (
          <div className={`mb-6 p-4 rounded-xl border flex gap-3 ${
            alertInfo.type === 'success' 
              ? 'bg-lavender-950/50 border-lavender-400/30 text-lavender-200' 
              : 'bg-petal-frost-950/50 border-petal-frost-500/30 text-petal-frost-200'
          }`}>
            {alertInfo.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-lavender-300 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-petal-frost-400 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`text-sm font-semibold ${alertInfo.type === 'success' ? 'text-lavender-200' : 'text-petal-frost-200'}`}>
                {alertInfo.message}
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div>
            <label className="text-xs font-semibold text-parchment-400 block mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-parchment-500 text-sm">@</span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3 py-2 rounded-lg glass-input text-sm"
                placeholder="budi, siti, dewi, dsb."
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-semibold text-parchment-400 block mb-1.5">
              Nama Lengkap
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-parchment-500 w-4 h-4" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3 py-2 rounded-lg glass-input text-sm"
                placeholder="Dr. Budi Santoso, M.T."
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-semibold text-parchment-400 block mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 text-parchment-500 w-4 h-4" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-9 pr-3 py-2 rounded-lg glass-input text-sm"
                placeholder="budi.santoso@univ.ac.id"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="text-xs font-semibold text-parchment-400 block mb-1.5">
              Peran (Role)
            </label>
            <select
              name="roles"
              value={formData.roles[0]}
              onChange={(e) => setFormData(prev => ({ ...prev, roles: [e.target.value] }))}
              className="w-full rounded-lg border border-parchment-800/40 bg-deep-navy-950/80 text-sm text-parchment-100 px-3 py-2 focus:outline-none focus:border-deep-purple-400"
              disabled={isLoading}
            >
              <option value="Dosen">Dosen</option>
              <option value="Admin">Admin</option>
            </select>
            <p className="text-[10px] text-parchment-500 mt-1">
              Pilih peran utama Anda untuk pemetaan relasi teori himpunan.
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold text-parchment-400 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-parchment-500 w-4 h-4" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-9 pr-10 py-2 rounded-lg glass-input text-sm font-mono-custom"
                placeholder="Minimal 6 karakter"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-parchment-500 hover:text-parchment-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs font-semibold text-parchment-400 block mb-1.5">
              Konfirmasi Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-parchment-500 w-4 h-4" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-9 pr-10 py-2 rounded-lg glass-input text-sm font-mono-custom"
                placeholder="Konfirmasi password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-parchment-500 hover:text-parchment-300 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm glass-btn-primary flex items-center justify-center gap-1.5 mt-6 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-parchment-100/30 border-t-parchment-100 rounded-full animate-spin-fast" />
                <span>Mendaftar...</span>
              </>
            ) : (
              <>
                <span>Buat Akun</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch to Login */}
        <div className="text-center pt-3 border-t border-parchment-800/30 mt-4">
          <p className="text-xs text-parchment-400">
            Sudah punya akun?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-lavender-300 hover:text-lavender-200 font-semibold cursor-pointer"
            >
              Login di sini
            </button>
          </p>
        </div>
      </div>
    </div>

  );
}
