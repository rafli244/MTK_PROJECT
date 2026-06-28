import React, { useState, useEffect } from 'react';
import { authenticateUser } from '../utils/mathLogic.js';
import { sha256 } from '../utils/crypto.js';
import { supabase } from '../utils/supabaseClient.js';
import bcryptjs from 'bcryptjs';

const DEMO_ACCOUNTS = [
  { username: 'budi', password: 'budi123', role: 'Admin', tag: 'A ∩ D' },
  { username: 'siti', password: 'siti123', role: 'Dosen', tag: 'D \\ A' },
  { username: 'anto', password: 'anto123', role: 'Admin', tag: 'A \\ D' },
  { username: 'dewi', password: 'dewi123', role: 'Dosen', tag: 'D \\ A' },
  { username: 'gede', password: 'adminabc', role: 'Admin', tag: 'Suspended' },
];

export default function LoginForm({ onLoginSuccess, onInputChange, users, onSignUp, onLogicStateChange }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [alertInfo, setAlertInfo] = useState(null);
  const [detectedUser, setDetectedUser] = useState(null);

  const [clickTimestamps, setClickTimestamps] = useState([]);
  const [isLocked, setIsLocked] = useState(false);
  const [lockCountdown, setLockCountdown] = useState(0);

  const checkRateLimit = () => {
    if (isLocked) return false;
    const now = Date.now();
    const recentClicks = clickTimestamps.filter(time => now - time < 5000);
    const updatedClicks = [...recentClicks, now];
    setClickTimestamps(updatedClicks);

    if (updatedClicks.length >= 3) {
      setIsLocked(true);
      setLockCountdown(5);
      setAlertInfo({
        type: 'error',
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'BANYAK PERCOBAAN: Sistem mendeteksi spamming! Tombol login dikunci sementara selama 5 detik.'
      });
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (isLocked && lockCountdown > 0) {
      const timer = setTimeout(() => {
        setLockCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isLocked && lockCountdown === 0) {
      setIsLocked(false);
      setAlertInfo(null);
    }
  }, [isLocked, lockCountdown]);

  const allRoles = Array.from(new Set(users.flatMap((user) => user.roles)));
  const roleOptions = allRoles;

  useEffect(() => {
    if (!selectedRole && allRoles.length > 0) {
      setSelectedRole(allRoles[0]);
    }
  }, [allRoles, selectedRole]);

  useEffect(() => {
    const user = users.find((u) => u.username && username && u.username.toLowerCase() === username.trim().toLowerCase());

    if (user) {
      setDetectedUser(user);
      onInputChange(username, password, user.passwordCipher);
    } else {
      setDetectedUser(null);
      onInputChange(username, password, null);
    }
  }, [username, users]);

  useEffect(() => {
    onInputChange(username, password, detectedUser ? detectedUser.passwordCipher : null);
  }, [password, detectedUser]);

  useEffect(() => {
    refreshCaptcha();
  }, []);

  const generateCaptcha = () => {
    // 1. Definisi Himpunan Semesta (n = 32)
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const n = characters.length; 
    
    // 2. Definisi Panjang Kombinasi (r = 5)
    const r = 5; 
    let generatedString = '';

    // 3. Proses Permutasi dengan Pengulangan (n^r)
    for (let i = 0; i < r; i++) {
      const randomIndex = Math.floor(Math.random() * n);
      generatedString += characters[randomIndex];
    }

    // 4. Return Output
    return { 
      question: `Salin teks otentikasi berikut: ${generatedString}`, 
      answer: generatedString 
    };
  };

  const refreshCaptcha = () => {
    const nextCaptcha = generateCaptcha();
    setCaptchaQuestion(nextCaptcha.question);
    setCaptchaAnswer(nextCaptcha.answer);
    setCaptchaInput('');
  };

  const captchaValid = captchaInput.trim().toUpperCase() === captchaAnswer;

  const handleGoogleLogin = async () => {
    if (!checkRateLimit()) return;
    if (!supabase) {
      setAlertInfo({
        type: 'error',
        code: 'SUPABASE_UNAVAILABLE',
        message: 'Koneksi Supabase belum terkonfigurasi di lingkungan (.env).'
      });
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/callback',
          queryParams: {
            prompt: 'select_account'
          }
        }
      });

      if (error) {
        setAlertInfo({
          type: 'error',
          code: 'OAUTH_ERROR',
          message: error.message || 'Gagal login menggunakan Google.'
        });
      }
    } catch (err) {
      setAlertInfo({
        type: 'error',
        code: 'OAUTH_EXCEPTION',
        message: 'Terjadi kesalahan sistem saat mencoba menghubungi penyedia OAuth.'
      });
      console.error(err);
    }
  };

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    if (!checkRateLimit()) return;
    setAlertInfo(null);

    if (!username || !password || !selectedRole) {
      setAlertInfo({
        type: 'error',
        code: 'EMPTY_FIELDS',
        message: 'Mohon isi semua kolom: username, password, role, dan captcha.'
      });
      return;
    }

    // 1. Supabase login verification (Frontend connection)
    if (supabase) {
      try {
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', username.trim())
          .single();

        if (error || !user) {
          throw new Error("User not found in Supabase");
        }

        if (!user.is_active) {
          await supabase.from('login_logs').insert({
            user_id: user.id,
            username: username.trim(),
            login_status: 'failed_inactive',
            ip_address: 'client-side'
          });

          setAlertInfo({
            type: 'error',
            code: 'ACCOUNT_SUSPENDED',
            message: 'Akun ini telah ditangguhkan.'
          });
          return;
        }

        if (!user.roles.includes(selectedRole)) {
          setAlertInfo({
            type: 'error',
            code: 'INVALID_ROLE',
            message: 'User tidak memiliki role ini.'
          });
          return;
        }

        let isMatch = false;
        if (user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$')) {
          isMatch = await bcryptjs.compare(password, user.password_hash);
        } else {
          isMatch = password === user.password_hash || sha256(password) === user.password_hash;
        }

        if (!isMatch) {
          await supabase.from('login_logs').insert({
            user_id: user.id,
            username: username.trim(),
            login_status: 'failed_password',
            ip_address: 'client-side'
          });

          setAlertInfo({
            type: 'error',
            code: 'INVALID_CREDENTIALS',
            message: 'Username atau password salah.'
          });
          return;
        }

        if (!captchaValid && !rememberDevice) {
          setAlertInfo({
            type: 'error',
            code: 'CAPTCHA_INVALID',
            message: 'Login Gagal: Perangkat baru dan Captcha tidak valid.'
          });
          refreshCaptcha();
          return;
        }

        await supabase.from('login_logs').insert({
          user_id: user.id,
          username: username.trim(),
          login_status: 'success',
          ip_address: 'client-side'
        });

        if (rememberDevice) {
          await supabase.from('trusted_devices').upsert({
            user_id: user.id,
            device_identifier: 'simulated-device-id',
            device_name: 'Browser Sandbox',
            last_used_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,device_identifier'
          });
        }

        setAlertInfo({
          type: 'success',
          code: rememberDevice ? 'SUCCESS_TRUSTED' : 'SUCCESS_CAPTCHA',
          message: 'Login berhasil.'
        });

        const loggedInUser = {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          roles: user.roles,
          isActive: user.is_active,
          passwordCipher: user.password_hash
        };

        setTimeout(() => {
          onLoginSuccess(loggedInUser, selectedRole);
        }, 1500);
        return;

      } catch (err) {
        console.warn("Direct Supabase login failed, trying backend API URL fallback.", err);
      }
    }

    // 2. Express Backend API Fallback
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password,
          selectedRole: selectedRole,
          rememberDevice: rememberDevice,
          deviceId: 'simulated-device-id',
          deviceName: 'Browser Sandbox'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setAlertInfo({
          type: 'error',
          code: data.code || 'INVALID_CREDENTIALS',
          message: data.message || 'Login gagal.'
        });
        
        if (data.code === 'CAPTCHA_INVALID') {
          refreshCaptcha();
        }
        return;
      }

      if (!captchaValid && !rememberDevice) {
        setAlertInfo({
          type: 'error',
          code: 'CAPTCHA_INVALID',
          message: 'Login Gagal: Perangkat baru dan Captcha tidak valid.'
        });
        refreshCaptcha();
        return;
      }

      setAlertInfo({
        type: 'success',
        code: rememberDevice ? 'SUCCESS_TRUSTED' : 'SUCCESS_CAPTCHA',
        message: data.message || 'Login berhasil.'
      });

      const loggedInUser = {
        ...data.data,
        passwordCipher: password ? sha256(password) : ''
      };

      setTimeout(() => {
        onLoginSuccess(loggedInUser, selectedRole);
      }, 1500);

    } catch (error) {
      console.warn("Backend login API unavailable, trying local dummy db fallback.", error);
      
      const authResult = authenticateUser(username, password, selectedRole, rememberDevice, captchaValid, false, users);
      const { status } = authResult;

      if (status.type === 'error') {
        setAlertInfo({
          type: 'error',
          code: status.code,
          message: status.message
        });
        if (status.code === 'CAPTCHA_INVALID') {
          refreshCaptcha();
        }
        return;
      }

      if (status.type === 'success') {
        setAlertInfo({
          type: 'success',
          code: status.code,
          message: status.message
        });

        setTimeout(() => {
          onLoginSuccess(authResult.user, selectedRole);
        }, 1500);
      }
    }
  };

  const pVal = detectedUser ? authenticateUser(username, password, selectedRole, rememberDevice, captchaValid, false, users).variables.p : false;
  const qVal = detectedUser ? detectedUser.isActive : false;
  const rVal = rememberDevice;
  const sVal = captchaValid;
  const gVal = false;
  const term1 = pVal && qVal && rVal;
  const term2 = pVal && qVal && !rVal && sVal;
  const L_val = qVal && (term1 || term2 || gVal);

  useEffect(() => {
    if (onLogicStateChange) {
      onLogicStateChange({
        username,
        password,
        rememberDevice,
        captchaValid,
        pVal,
        qVal,
        term1,
        term2,
        L_val,
        gVal
      });
    }
  }, [username, password, rememberDevice, captchaValid, pVal, qVal, term1, term2, L_val, gVal, onLogicStateChange]);

  const fillDemoAccount = (account) => {
    setUsername(account.username);
    setPassword(account.password);
    setSelectedRole(account.role);
    setAlertInfo(null);
  };

  return (
    <div className="space-y-4 text-slate-800">
      {/* Dynamic Alerts */}
      {alertInfo && (
        <div className={`p-3.5 border-2 text-xs font-semibold ${
          alertInfo.code === 'RATE_LIMIT_EXCEEDED'
            ? 'bg-red-600 border-red-700 text-white animate-pulse font-bold'
            : alertInfo.type === 'success'
            ? 'bg-green-50 border-green-300 text-green-800'
            : 'bg-red-50 border-red-300 text-red-800'
        }`}>
          <div className="flex items-center gap-1.5 font-bold mb-0.5">
            {alertInfo.code === 'RATE_LIMIT_EXCEEDED' && '🚨 TERLALU BANYAK PERCOBAAN'}
            {alertInfo.code !== 'RATE_LIMIT_EXCEEDED' && alertInfo.code}
          </div>
          <div>{alertInfo.message} {lockCountdown > 0 ? `(${lockCountdown} detik)` : ''}</div>
          {alertInfo.code !== 'RATE_LIMIT_EXCEEDED' && (
            <p className="font-normal text-slate-600 mt-1">
              {alertInfo.code === 'SUCCESS_TRUSTED' && 'Kredensial valid (p), akun aktif (q), perangkat dikenal (r).'}
              {alertInfo.code === 'SUCCESS_CAPTCHA' && 'Kredensial valid (p), akun aktif (q), perangkat baru (¬r), Captcha terverifikasi (s).'}
              {alertInfo.code === 'INVALID_ROLE' && 'Peran yang dipilih tidak sesuai dengan akun.'}
              {alertInfo.code === 'CAPTCHA_INVALID' && 'Captcha salah. Silakan refresh dan coba lagi.'}
              {alertInfo.code === 'INVALID_CREDENTIALS' && 'Uji kekuatan kata sandi Anda di Lab Kriptografi.'}
              {alertInfo.code === 'ACCOUNT_SUSPENDED' && 'Hubungi admin utama untuk mengaktifkan kembali status keanggotaan Anda.'}
            </p>
          )}
        </div>
      )}

      {/* Demo Accounts Panel */}
      <div className="border border-slate-300 p-3 bg-slate-50">
        <div className="text-xs font-bold text-slate-700 mb-2">Akun Demo (Klik untuk mengisi otomatis):</div>
        <div className="flex flex-wrap gap-1.5">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.username}
              type="button"
              onClick={() => fillDemoAccount(account)}
              className="text-xs font-mono border border-slate-400 bg-white hover:bg-slate-100 px-2.5 py-1 cursor-pointer"
            >
              {account.username} ({account.tag})
            </button>
          ))}
        </div>
      </div>

      {/* Main Login Form Box */}
      <div className="border border-slate-300 p-5 bg-white">
        <div className="mb-4 text-center border-b border-slate-200 pb-3">
          <h2 className="text-base font-bold text-slate-900">Sistem Otentikasi Kontekstual</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Mengevaluasi variabel proposisional lingkungan masuk secara real-time.
          </p>
        </div>

        <form onSubmit={handleInitialSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-bold block mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="budi, siti, dsb."
              className="w-full border border-slate-300 bg-white px-3 py-1.5 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-slate-300 bg-white px-3 py-1.5 text-sm font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-bold block mb-1">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full border border-slate-300 bg-white px-3 py-1.5 text-sm"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Captcha Block */}
          <div className="border border-slate-300 p-3 bg-slate-50 space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <label className="text-xs font-bold block">Captcha</label>
                <div className="text-xs font-mono font-bold text-slate-700">{captchaQuestion}</div>
              </div>
              <button
                type="button"
                onClick={refreshCaptcha}
                className="border border-slate-400 bg-white hover:bg-slate-100 px-2 py-1 text-xs cursor-pointer"
              >
                🔄 Refresh
              </button>
            </div>
            <input
              type="text"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              placeholder="Masukkan jawaban Captcha"
              className="w-full border border-slate-300 bg-white px-3 py-1.5 text-sm"
            />
          </div>

          {/* Remember Device Checkbox */}
          <div className="flex flex-col gap-2 py-1">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberDevice"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              <label htmlFor="rememberDevice" className="text-xs font-semibold cursor-pointer select-none text-slate-700">
                Ingat Perangkat Ini (r = True)
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm cursor-pointer border-0"
          >
            Sign In
          </button>

          {/* Real Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="block text-center w-full py-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm cursor-pointer mt-2"
          >
            Login dengan Google
          </button>

          {/* Navigation to Sign Up Info */}
          <div className="text-center pt-3 border-t border-slate-200 mt-3">
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Registrasi dilakukan secara otomatis (Just-In-Time) saat pertama kali login menggunakan Google.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
