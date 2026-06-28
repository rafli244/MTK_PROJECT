import React, { useState } from 'react';
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

    // 1. Supabase direct register fallback
    if (supabase) {
      try {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id')
          .eq('username', formData.username.trim())
          .maybeSingle();

        if (existingUser) {
          throw new Error('Username sudah terdaftar');
        }

        const { data: existingEmail } = await supabase
          .from('users')
          .select('id')
          .eq('email', formData.email.trim())
          .maybeSingle();

        if (existingEmail) {
          throw new Error('Email sudah terdaftar');
        }

        const salt = await bcryptjs.genSalt(10);
        const passwordHash = await bcryptjs.hash(formData.password, salt);

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

    // 2. Express Backend API
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
    <div className="space-y-4 text-slate-800">
      {/* Main Form Border Box */}
      <div className="border border-slate-300 p-5 bg-white">
        <div className="mb-4 text-center border-b border-slate-200 pb-3">
          <h2 className="text-base font-bold text-slate-900">Buat Akun Baru</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Daftar untuk terintegrasi dengan database otentikasi.
          </p>
        </div>

        {/* Alert Messages */}
        {alertInfo && (
          <div className={`mb-4 p-3 border text-xs font-semibold ${
            alertInfo.type === 'success' 
              ? 'bg-green-50 border-green-300 text-green-800' 
              : 'bg-red-50 border-red-300 text-red-800'
          }`}>
            {alertInfo.message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Username */}
          <div>
            <label className="text-xs font-bold block mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full border border-slate-300 bg-white px-3 py-1.5 text-sm"
              placeholder="budi, siti, dewi, dsb."
              disabled={isLoading}
            />
          </div>

          {/* Name */}
          <div>
            <label className="text-xs font-bold block mb-1">Nama Lengkap</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full border border-slate-300 bg-white px-3 py-1.5 text-sm"
              placeholder="Dr. Budi Santoso, M.T."
              disabled={isLoading}
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-bold block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border border-slate-300 bg-white px-3 py-1.5 text-sm"
              placeholder="budi.santoso@univ.ac.id"
              disabled={isLoading}
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-xs font-bold block mb-1">Peran (Role)</label>
            <select
              name="roles"
              value={formData.roles[0]}
              onChange={(e) => setFormData(prev => ({ ...prev, roles: [e.target.value] }))}
              className="w-full border border-slate-300 bg-white px-3 py-1.5 text-sm"
              disabled={isLoading}
            >
              <option value="Dosen">Dosen</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-bold block mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full border border-slate-300 bg-white pl-3 pr-12 py-1.5 text-sm font-mono"
                placeholder="Minimal 6 karakter"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1.5 text-xs text-slate-500 hover:text-slate-700 bg-slate-100 border border-slate-300 px-1.5 py-0.5"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="text-xs font-bold block mb-1">Konfirmasi Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full border border-slate-300 bg-white pl-3 pr-12 py-1.5 text-sm font-mono"
                placeholder="Konfirmasi password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1.5 text-xs text-slate-500 hover:text-slate-700 bg-slate-100 border border-slate-300 px-1.5 py-0.5"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm cursor-pointer border-0 mt-3"
          >
            {isLoading ? 'Mendaftar...' : 'Buat Akun'}
          </button>
        </form>

        {/* Switch to Login */}
        <div className="text-center pt-3 border-t border-slate-200 mt-3">
          <p className="text-xs text-slate-600">
            Sudah punya akun?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:underline font-bold cursor-pointer"
            >
              Login di sini
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
