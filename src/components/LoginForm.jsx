import React, { useState, useEffect } from 'react';
import { authenticateUser } from '../utils/mathLogic.js';
import { sha256 } from '../utils/crypto.js';
import { ShieldAlert, ShieldCheck, KeyRound, Monitor, ArrowRight, RotateCcw, Sparkles, UserRound } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { username: 'budi', password: 'budi123', role: 'Admin', tag: 'A ∩ D', color: 'petal-frost' },
  { username: 'siti', password: 'siti123', role: 'Dosen', tag: 'D \\ A', color: 'lavender' },
  { username: 'anto', password: 'anto123', role: 'Admin', tag: 'A \\ D', color: 'deep-purple' },
  { username: 'dewi', password: 'dewi123', role: 'Dosen', tag: 'D \\ A', color: 'lavender' },
  { username: 'gede', password: 'adminabc', role: 'Admin', tag: 'Suspended', color: 'petal-frost' },
];

export default function LoginForm({ onLoginSuccess, onInputChange, users, onSignUp }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [alertInfo, setAlertInfo] = useState(null);
  const [detectedUser, setDetectedUser] = useState(null);

  const allRoles = Array.from(new Set(users.flatMap((user) => user.roles)));
  const roleOptions = allRoles;

  useEffect(() => {
    if (!selectedRole && allRoles.length > 0) {
      setSelectedRole(allRoles[0]);
    }
  }, [allRoles, selectedRole]);

  useEffect(() => {
    const user = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());

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
    const a = Math.floor(Math.random() * 8) + 1;
    const b = Math.floor(Math.random() * 8) + 1;
    const operator = ['+', '-', '*'][Math.floor(Math.random() * 3)];
    let question = '';
    let answer = '';

    if (operator === '+') {
      question = `${a} + ${b} = ?`;
      answer = String(a + b);
    } else if (operator === '-') {
      const [x, y] = a >= b ? [a, b] : [b, a];
      question = `${x} - ${y} = ?`;
      answer = String(x - y);
    } else {
      question = `${a} × ${b} = ?`;
      answer = String(a * b);
    }

    return { question, answer };
  };

  const refreshCaptcha = () => {
    const nextCaptcha = generateCaptcha();
    setCaptchaQuestion(nextCaptcha.question);
    setCaptchaAnswer(nextCaptcha.answer);
    setCaptchaInput('');
  };

  const captchaValid = captchaInput.trim() === captchaAnswer;

  const handleInitialSubmit = async (e) => {
    e.preventDefault();
    setAlertInfo(null);

    if (!username || !password || !selectedRole) {
      setAlertInfo({
        type: 'error',
        code: 'EMPTY_FIELDS',
        message: 'Mohon isi semua kolom: username, password, role, dan captcha.'
      });
      return;
    }

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

      // Check captcha locally if success (since s = captchaValid)
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

      // Compute SHA-256 hash of password on the fly for the Cryptography Lab
      const loggedInUser = {
        ...data.data,
        passwordCipher: password ? sha256(password) : ''
      };

      setTimeout(() => {
        onLoginSuccess(loggedInUser, selectedRole);
      }, 1500);

    } catch (error) {
      console.warn("Backend login API unavailable, trying local fallback.", error);
      
      const authResult = authenticateUser(username, password, selectedRole, rememberDevice, captchaValid, users);
      const { evaluation, status } = authResult;

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


  const pVal = detectedUser ? authenticateUser(username, password, selectedRole, rememberDevice, captchaValid, users).variables.p : false;
  const qVal = detectedUser ? detectedUser.isActive : false;
  const rVal = rememberDevice;
  const sVal = captchaValid;
  const term1 = pVal && qVal && rVal;
  const term2 = pVal && qVal && !rVal && sVal;
  const L_val = term1 || term2;

  const fillDemoAccount = (account) => {
    setUsername(account.username);
    setPassword(account.password);
    setSelectedRole(account.role);
    setAlertInfo(null);
  };

  const chipColorClass = {
    'petal-frost': 'bg-petal-frost-950/40 border-petal-frost-500/25 text-petal-frost-300 hover:border-petal-frost-400/50',
    lavender: 'bg-lavender-950/40 border-lavender-500/25 text-lavender-300 hover:border-lavender-400/50',
    'deep-purple': 'bg-deep-purple-950/40 border-deep-purple-500/25 text-deep-purple-300 hover:border-deep-purple-400/50',
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Dynamic Alerts */}
      {alertInfo && (
        <div className={`p-4 rounded-xl border flex gap-3 ${
          alertInfo.type === 'success'
            ? 'bg-lavender-950/50 border-lavender-400/30 text-lavender-200'
            : 'bg-petal-frost-950/50 border-petal-frost-500/30 text-petal-frost-200'
        }`}>
          {alertInfo.type === 'success' ? (
            <ShieldCheck className="w-5 h-5 shrink-0 text-lavender-300" />
          ) : (
            <ShieldAlert className="w-5 h-5 shrink-0 text-petal-frost-400" />
          )}
          <div>
            <div className="font-semibold text-sm">{alertInfo.message}</div>
            <p className="text-xs text-parchment-400 mt-1">
              {alertInfo.code === 'SUCCESS_TRUSTED' && 'Kredensial valid (p), akun aktif (q), perangkat dikenal (r).'}
              {alertInfo.code === 'SUCCESS_CAPTCHA' && 'Kredensial valid (p), akun aktif (q), perangkat baru (¬r), Captcha terverifikasi (s).'}
              {alertInfo.code === 'INVALID_ROLE' && 'Peran yang dipilih tidak sesuai dengan akun.'}
              {alertInfo.code === 'CAPTCHA_INVALID' && 'Captcha salah. Silakan refresh dan coba lagi.'}
              {alertInfo.code === 'INVALID_CREDENTIALS' && 'Uji kekuatan kata sandi Anda di Lab Kriptografi.'}
              {alertInfo.code === 'ACCOUNT_SUSPENDED' && 'Hubungi admin utama untuk mengaktifkan kembali status keanggotaan Anda.'}
            </p>
          </div>
        </div>
      )}

      {/* Demo Accounts */}
      <div className="glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-3.5 h-3.5 text-lavender-400" />
          <span className="text-xs font-semibold text-parchment-300">Akun Demo — klik untuk mengisi otomatis</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.username}
              type="button"
              onClick={() => fillDemoAccount(account)}
              className={`text-[10px] font-mono-custom px-2.5 py-1.5 rounded-lg border cursor-pointer ${chipColorClass[account.color]}`}
            >
              <UserRound className="w-3 h-3 inline mr-1 -mt-px" />
              {account.username} · {account.tag}
            </button>
          ))}
        </div>
      </div>

      {/* Main Glass Form Panel */}
      <div className="glass-panel panel-accent-top p-6 rounded-2xl">
        <div className="mb-6 text-center pt-1">
          <h2 className="text-xl font-bold text-parchment-50 glow-text-purple">Sistem Otentikasi Kontekstual</h2>
          <p className="text-xs text-parchment-400 mt-1">
            Mengevaluasi variabel proposisional lingkungan masuk secara real-time.
          </p>
        </div>

        <form onSubmit={handleInitialSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-parchment-400 block mb-1.5">Username</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="budi, siti, gede, dsb."
                className="w-full pl-9 pr-3 py-2 rounded-lg glass-input text-sm"
              />
              <span className="absolute left-3 top-2.5 text-parchment-500 text-sm">@</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-parchment-400 block mb-1.5">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-lg glass-input text-sm font-mono-custom"
              />
              <KeyRound className="absolute left-3 top-2.5 text-parchment-500 w-4 h-4" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-parchment-400 block mb-1.5">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full rounded-lg border border-parchment-800/40 bg-deep-navy-950/80 text-sm text-parchment-100 px-3 py-2 focus:outline-none focus:border-deep-purple-400"
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
            <p className="text-[10px] text-parchment-500 mt-1">
              Pilih peran sesuai akun Anda. Role ikut dihitung dalam validasi login.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-deep-navy-950/50 border border-parchment-800/30 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <label className="text-xs font-semibold text-parchment-200 block mb-1">Captcha</label>
                <div className="captcha-display">{captchaQuestion}</div>
              </div>
              <button
                type="button"
                onClick={refreshCaptcha}
                className="inline-flex items-center gap-1 rounded-lg border border-parchment-700/40 px-3 py-2 text-[11px] text-parchment-300 hover:bg-deep-navy-900/60"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
            <input
              type="text"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              placeholder="Masukkan jawaban Captcha"
              className="w-full rounded-lg border border-parchment-800/40 bg-deep-navy-950/90 px-3 py-2 text-sm text-parchment-100 focus:outline-none focus:border-deep-purple-400"
            />
            <p className="text-[10px] text-parchment-500">
              Captcha hanya diperlukan untuk verifikasi perangkat baru jika Anda tidak memilih &quot;Ingat Perangkat&quot;.
            </p>
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="rememberDevice"
              checked={rememberDevice}
              onChange={(e) => setRememberDevice(e.target.checked)}
              className="w-4 h-4 rounded text-deep-purple-500 bg-deep-navy-950 border-parchment-800/50 focus:ring-deep-purple-400/50"
            />
            <label htmlFor="rememberDevice" className="text-xs font-medium text-parchment-200 cursor-pointer flex items-center gap-1.5 select-none">
              <Monitor className="w-3.5 h-3.5 text-parchment-400" />
              Ingat Perangkat Ini (r = True)
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm glass-btn-primary flex items-center justify-center gap-1.5 mt-2 cursor-pointer"
          >
            Sign In
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Sign Up Link - Inside Form */}
          <div className="text-center pt-3 border-t border-parchment-800/30 mt-4">
            <p className="text-xs text-parchment-400">
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={onSignUp}
                className="text-lavender-300 hover:text-lavender-200 font-semibold cursor-pointer"
              >
                Daftar di sini
              </button>
            </p>
          </div>
        </form>
      </div>

      {/* Propositional Logic Circuit Visualizer */}
      <div className="glass-panel-neon-emerald p-5 rounded-2xl">
        <h4 className="text-xs font-bold text-parchment-400 uppercase tracking-wider mb-3 flex items-center justify-between border-b border-lavender-500/15 pb-2">
          <span>Monitor Rangkaian Logika Boolean</span>
          <span className="font-mono-custom text-lavender-300 lowercase">L = (p ∧ q ∧ r) ∨ (p ∧ q ∧ ¬r ∧ s)</span>
        </h4>

        {/* Variables state indicators */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono-custom mb-4">
          <div className={`p-1.5 rounded-lg border ${
            pVal ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]' : 'bg-rose-50 border-rose-300 text-rose-700'
          }`}>
            p (Kredensial): {pVal ? 'T' : 'F'}
          </div>
          <div className={`p-1.5 rounded-lg border ${
            qVal ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]' : 'bg-rose-50 border-rose-300 text-rose-700'
          }`}>
            q (Aktif): {qVal ? 'T' : 'F'}
          </div>
          <div className={`p-1.5 rounded-lg border ${
            rVal ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]' : 'bg-rose-50 border-rose-300 text-rose-700'
          }`}>
            r (Device): {rVal ? 'T' : 'F'}
          </div>
          <div className={`p-1.5 rounded-lg border ${
            sVal ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold shadow-[0_0_12px_rgba(16,185,129,0.2)]' : 'bg-rose-50 border-rose-300 text-rose-700'
          }`}>
            s (Captcha): {sVal ? 'T' : 'F'}
          </div>
        </div>

        {/* Logical calculations visualization */}
        <div className="space-y-2 text-[11px] font-mono-custom text-parchment-400">
          <div className="flex justify-between items-center py-1 border-b border-parchment-800/25">
            <span>Irisan Utama (p ∧ q):</span>
            <span className={pVal && qVal ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}>
              {pVal ? 'T' : 'F'} ∧ {qVal ? 'T' : 'F'} = {pVal && qVal ? 'True' : 'False'}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-parchment-800/25">
            <span>Term 1 - Kepercayaan Perangkat (p ∧ q ∧ r):</span>
            <span className={term1 ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}>
              {(pVal && qVal) ? 'T' : 'F'} ∧ {rVal ? 'T' : 'F'} = {term1 ? 'True' : 'False'}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-parchment-800/25">
            <span>Negasi Perangkat Baru (¬r):</span>
            <span className={!rVal ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}>
              ¬({rVal ? 'T' : 'F'}) = {!rVal ? 'True' : 'False'}
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-b border-parchment-800/25">
            <span>Term 2 - Verifikasi Cadangan (p ∧ q ∧ ¬r ∧ s):</span>
            <span className={term2 ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}>
              {(pVal && qVal) ? 'T' : 'F'} ∧ {!rVal ? 'T' : 'F'} ∧ {sVal ? 'T' : 'F'} = {term2 ? 'True' : 'False'}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 text-xs">
            <span className="font-bold text-parchment-200">Hasil Evaluasi Boolean (L = Term1 ∨ Term2):</span>
            <span className={`px-3 py-1 rounded border text-xs font-bold ${
              L_val 
                ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-[0_0_12px_rgba(16,185,129,0.15)]' 
                : 'bg-rose-50 border-rose-300 text-rose-700'
            }`}>
              {term1 ? 'True' : 'False'} ∨ {term2 ? 'True' : 'False'} = {L_val ? 'LOGGED IN (True)' : 'DENIED (False)'}
            </span>
          </div>
        </div>
      </div>

      {/* Visualisasi Pohon Keputusan (Decision Tree) Login */}
      {(() => {
        const pTyped = username.trim().length > 0 && password.length > 0;
        const pState = pTyped ? (pVal ? 'true' : 'false') : 'inactive';
        const qState = pState === 'true' ? (qVal ? 'true' : 'false') : 'inactive';
        const rState = qState === 'true' ? (rememberDevice ? 'true' : 'false') : 'inactive';
        const sState = rState === 'false' ? (captchaValid ? 'true' : 'false') : 'inactive';

        return (
          <div className="glass-panel-neon-purple p-5 rounded-2xl mt-4">
            <h4 className="text-xs font-bold text-parchment-400 uppercase tracking-wider mb-3 flex items-center justify-between border-b border-deep-purple-500/15 pb-2">
              <span>Pohon Keputusan Otentikasi (Decision Tree)</span>
              <span className="font-mono-custom text-deep-purple-300 text-[10px]">Kelompok 3: Himpunan & Pohon Keputusan</span>
            </h4>
            
            <div className="flex justify-center bg-slate-50/50 rounded-xl p-4 border border-slate-200/80">
              <svg viewBox="0 0 400 355" className="w-full h-auto">
                <defs>
                  <marker id="arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#10b981" />
                  </marker>
                  <marker id="arrow-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#ef4444" />
                  </marker>
                  <marker id="arrow-gray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#cbd5e1" />
                  </marker>
                </defs>

                {/* Edges / Lines with active highlight */}
                {/* Start to p? */}
                <line x1="200" y1="40" x2="200" y2="70" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrow-green)" />

                {/* p? to Gagal p */}
                <line 
                  x1="175" y1="100" 
                  x2="95" y2="130" 
                  stroke={pState === 'false' ? '#ef4444' : '#cbd5e1'} 
                  strokeWidth={pState === 'false' ? 3.5 : 1.5} 
                  markerEnd={pState === 'false' ? 'url(#arrow-red)' : 'url(#arrow-gray)'} 
                />

                {/* p? to q? */}
                <line 
                  x1="200" y1="100" 
                  x2="200" y2="130" 
                  stroke={pState === 'true' ? '#10b981' : '#cbd5e1'} 
                  strokeWidth={pState === 'true' ? 3.5 : 1.5} 
                  markerEnd={pState === 'true' ? 'url(#arrow-green)' : 'url(#arrow-gray)'} 
                />

                {/* q? to Gagal q */}
                <line 
                  x1="225" y1="160" 
                  x2="305" y2="190" 
                  stroke={qState === 'false' ? '#ef4444' : '#cbd5e1'} 
                  strokeWidth={qState === 'false' ? 3.5 : 1.5} 
                  markerEnd={qState === 'false' ? 'url(#arrow-red)' : 'url(#arrow-gray)'} 
                />

                {/* q? to r? */}
                <line 
                  x1="200" y1="160" 
                  x2="200" y2="190" 
                  stroke={qState === 'true' ? '#10b981' : '#cbd5e1'} 
                  strokeWidth={qState === 'true' ? 3.5 : 1.5} 
                  markerEnd={qState === 'true' ? 'url(#arrow-green)' : 'url(#arrow-gray)'} 
                />

                {/* r? to Sukses r */}
                <line 
                  x1="175" y1="220" 
                  x2="120" y2="250" 
                  stroke={rState === 'true' ? '#10b981' : '#cbd5e1'} 
                  strokeWidth={rState === 'true' ? 3.5 : 1.5} 
                  markerEnd={rState === 'true' ? 'url(#arrow-green)' : 'url(#arrow-gray)'} 
                />

                {/* r? to s? */}
                <line 
                  x1="225" y1="220" 
                  x2="245" y2="250" 
                  stroke={rState === 'false' ? '#10b981' : '#cbd5e1'} 
                  strokeWidth={rState === 'false' ? 3.5 : 1.5} 
                  markerEnd={rState === 'false' ? 'url(#arrow-green)' : 'url(#arrow-gray)'} 
                />

                {/* s? to Sukses s */}
                <line 
                  x1="235" y1="280" 
                  x2="205" y2="310" 
                  stroke={sState === 'true' ? '#10b981' : '#cbd5e1'} 
                  strokeWidth={sState === 'true' ? 3.5 : 1.5} 
                  markerEnd={sState === 'true' ? 'url(#arrow-green)' : 'url(#arrow-gray)'} 
                />

                {/* s? to Gagal s */}
                <line 
                  x1="285" y1="280" 
                  x2="300" y2="310" 
                  stroke={sState === 'false' ? '#ef4444' : '#cbd5e1'} 
                  strokeWidth={sState === 'false' ? 3.5 : 1.5} 
                  markerEnd={sState === 'false' ? 'url(#arrow-red)' : 'url(#arrow-gray)'} 
                />

                {/* Nodes Render */}
                
                {/* 1. Mulai (Start) */}
                <rect x="162" y="10" width="76" height="30" rx="6" ry="6" fill="#ecfdf5" stroke="#10b981" strokeWidth="2.5" />
                <text x="200" y="29" fill="#047857" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Mulai</text>

                {/* 2. p? (Kredensial) */}
                <rect 
                  x="162" y="70" width="76" height="30" rx="6" ry="6" 
                  fill={pState === 'inactive' ? '#f8fafc' : (pState === 'true' ? '#ecfdf5' : '#fef2f2')} 
                  stroke={pState === 'inactive' ? '#cbd5e1' : (pState === 'true' ? '#10b981' : '#ef4444')} 
                  strokeWidth={pState === 'inactive' ? 1.5 : 3.0} 
                />
                <text 
                  x="200" y="89" 
                  fill={pState === 'inactive' ? '#475569' : (pState === 'true' ? '#047857' : '#b91c1c')} 
                  fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace"
                >
                  Kredensial p?
                </text>

                {/* 3. Gagal p */}
                <rect 
                  x="32" y="130" width="76" height="30" rx="6" ry="6" 
                  fill={pState === 'false' ? '#fef2f2' : '#f8fafc'} 
                  stroke={pState === 'false' ? '#ef4444' : '#cbd5e1'} 
                  strokeWidth={pState === 'false' ? 3.0 : 1.5} 
                />
                <text 
                  x="70" y="149" 
                  fill={pState === 'false' ? '#b91c1c' : '#475569'} 
                  fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace"
                >
                  Gagal (p=F)
                </text>

                {/* 4. Akun Aktif q? */}
                <rect 
                  x="162" y="130" width="76" height="30" rx="6" ry="6" 
                  fill={qState === 'inactive' ? '#f8fafc' : (qState === 'true' ? '#ecfdf5' : '#fef2f2')} 
                  stroke={qState === 'inactive' ? '#cbd5e1' : (qState === 'true' ? '#10b981' : '#ef4444')} 
                  strokeWidth={qState === 'inactive' ? 1.5 : 3.0} 
                />
                <text 
                  x="200" y="149" 
                  fill={qState === 'inactive' ? '#475569' : (qState === 'true' ? '#047857' : '#b91c1c')} 
                  fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace"
                >
                  Akun Aktif q?
                </text>

                {/* 5. Gagal q */}
                <rect 
                  x="292" y="190" width="76" height="30" rx="6" ry="6" 
                  fill={qState === 'false' ? '#fef2f2' : '#f8fafc'} 
                  stroke={qState === 'false' ? '#ef4444' : '#cbd5e1'} 
                  strokeWidth={qState === 'false' ? 3.0 : 1.5} 
                />
                <text 
                  x="330" y="209" 
                  fill={qState === 'false' ? '#b91c1c' : '#475569'} 
                  fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace"
                >
                  Gagal (q=F)
                </text>

                {/* 6. Device r? */}
                <rect 
                  x="162" y="190" width="76" height="30" rx="6" ry="6" 
                  fill={rState === 'inactive' ? '#f8fafc' : (rState === 'true' ? '#ecfdf5' : '#eff6ff')} 
                  stroke={rState === 'inactive' ? '#cbd5e1' : (rState === 'true' ? '#10b981' : '#3b82f6')} 
                  strokeWidth={rState === 'inactive' ? 1.5 : 3.0} 
                />
                <text 
                  x="200" y="209" 
                  fill={rState === 'inactive' ? '#475569' : (rState === 'true' ? '#047857' : '#1d4ed8')} 
                  fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace"
                >
                  Device r?
                </text>

                {/* 7. Sukses r */}
                <rect 
                  x="62" y="250" width="76" height="30" rx="6" ry="6" 
                  fill={rState === 'true' ? '#ecfdf5' : '#f8fafc'} 
                  stroke={rState === 'true' ? '#10b981' : '#cbd5e1'} 
                  strokeWidth={rState === 'true' ? 3.0 : 1.5} 
                />
                <text 
                  x="100" y="269" 
                  fill={rState === 'true' ? '#047857' : '#475569'} 
                  fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace"
                >
                  Sukses (L=T)
                </text>

                {/* 8. Captcha s? */}
                <rect 
                  x="222" y="250" width="76" height="30" rx="6" ry="6" 
                  fill={rState === 'false' ? (sState === 'inactive' ? '#f8fafc' : (sState === 'true' ? '#ecfdf5' : '#fef2f2')) : '#f8fafc'} 
                  stroke={rState === 'false' ? (sState === 'inactive' ? '#cbd5e1' : (sState === 'true' ? '#10b981' : '#ef4444')) : '#cbd5e1'} 
                  strokeWidth={rState === 'false' ? (sState === 'inactive' ? 1.5 : 3.0) : 1.5} 
                />
                <text 
                  x="260" y="269" 
                  fill={rState === 'false' ? (sState === 'inactive' ? '#475569' : (sState === 'true' ? '#047857' : '#b91c1c')) : '#475569'} 
                  fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace"
                >
                  Captcha s?
                </text>

                {/* 9. Sukses s */}
                <rect 
                  x="162" y="310" width="76" height="30" rx="6" ry="6" 
                  fill={sState === 'true' ? '#ecfdf5' : '#f8fafc'} 
                  stroke={sState === 'true' ? '#10b981' : '#cbd5e1'} 
                  strokeWidth={sState === 'true' ? 3.0 : 1.5} 
                />
                <text 
                  x="200" y="329" 
                  fill={sState === 'true' ? '#047857' : '#475569'} 
                  fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace"
                >
                  Sukses (L=T)
                </text>

                {/* 10. Gagal s */}
                <rect 
                  x="282" y="310" width="76" height="30" rx="6" ry="6" 
                  fill={sState === 'false' ? '#fef2f2' : '#f8fafc'} 
                  stroke={sState === 'false' ? '#ef4444' : '#cbd5e1'} 
                  strokeWidth={sState === 'false' ? 3.0 : 1.5} 
                />
                <text 
                  x="320" y="329" 
                  fill={sState === 'false' ? '#b91c1c' : '#475569'} 
                  fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace"
                >
                  Gagal (s=F)
                </text>
              </svg>
            </div>

            <div className="mt-3 text-[10px] text-parchment-500 leading-relaxed">
              * Jalur pohon keputusan di atas akan menyala secara real-time: <span className="text-emerald-400 font-semibold">Hijau</span> menunjukkan keputusan positif (True/Ya), <span className="text-red-400 font-semibold">Merah</span> menunjukkan keputusan negatif (False/Tidak), dan <span className="text-slate-600 font-semibold">Abu-abu</span> menunjukkan jalur tidak aktif.
            </div>
          </div>
        );
      })()}
    </div>
  );
}

