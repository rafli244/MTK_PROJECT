// SecurityChallenge.jsx: Halaman verifikasi keamanan MFA (Captcha & Trusted Device) 
// dengan persistence state (sessionStorage) dan visualisasi evaluasi logika proposisional L.
import React, { useState, useEffect } from 'react';
import { Shield, Key, Eye, CheckCircle, RefreshCw, XCircle } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

export default function SecurityChallenge({ user, onSuccess, onCancel }) {
  const [captchaInput, setCaptchaInput] = useState(() => sessionStorage.getItem('sec_captchaInput') || '');
  const [captchaQuestion, setCaptchaQuestion] = useState(() => sessionStorage.getItem('sec_captchaQuestion') || '');
  const [captchaAnswer, setCaptchaAnswer] = useState(() => sessionStorage.getItem('sec_captchaAnswer') || '');
  const [clientIp, setClientIp] = useState('Memuat IP...');
  const [isTrustedDevice, setIsTrustedDevice] = useState(() => sessionStorage.getItem('sec_isTrustedDevice') === 'true');
  const [alertInfo, setAlertInfo] = useState(null);

  // Generate combinations-based captcha (n=32, r=5)
  const generateCaptcha = () => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const n = characters.length;
    const r = 5;
    let result = '';
    for (let i = 0; i < r; i++) {
      const randomIndex = Math.floor(Math.random() * n);
      result += characters[randomIndex];
    }
    return result;
  };

  const refreshCaptcha = () => {
    const code = generateCaptcha();
    setCaptchaQuestion(`Salin kode otentikasi berikut: ${code}`);
    setCaptchaAnswer(code);
    setCaptchaInput('');
  };

  const clearSecurityStorage = () => {
    sessionStorage.removeItem('sec_captchaInput');
    sessionStorage.removeItem('sec_captchaQuestion');
    sessionStorage.removeItem('sec_captchaAnswer');
    sessionStorage.removeItem('sec_isTrustedDevice');
    sessionStorage.removeItem('sec_challenge_pending');
  };

  // Observes changes to sync states with sessionStorage
  useEffect(() => {
    sessionStorage.setItem('sec_captchaInput', captchaInput);
  }, [captchaInput]);

  useEffect(() => {
    sessionStorage.setItem('sec_captchaQuestion', captchaQuestion);
  }, [captchaQuestion]);

  useEffect(() => {
    sessionStorage.setItem('sec_captchaAnswer', captchaAnswer);
  }, [captchaAnswer]);

  useEffect(() => {
    sessionStorage.setItem('sec_isTrustedDevice', isTrustedDevice.toString());
  }, [isTrustedDevice]);

  useEffect(() => {
    // Mark that we are currently on the security challenge page
    sessionStorage.setItem('sec_challenge_pending', 'true');

    // Generate new captcha only if none has been persisted yet
    if (!sessionStorage.getItem('sec_captchaQuestion')) {
      refreshCaptcha();
    }
    
    // Fetch client IP address
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setClientIp(data.ip))
      .catch(() => setClientIp('192.168.1.15 (Local LAN)'));
  }, []);

  const captchaValid = captchaInput.trim().toUpperCase() === captchaAnswer;
  const qVal = user.isActive; // Akun aktif
  const gVal = true; // Jalur Google OAuth
  const rVal = isTrustedDevice; // Perangkat tepercaya
  const sVal = captchaValid; // Captcha valid

  // Formula Otentikasi: L = q ∧ (g ∨ (p ∧ r) ∨ (p ∧ ¬r ∧ s))
  // Karena login Google (g=True), maka syarat kelolosan adalah: q ∧ (r ∨ s)
  // Artinya user harus aktif (q) dan (perangkat tepercaya (r) ATAU captcha valid (s))
  const isAuthorized = qVal && (rVal || sVal);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertInfo(null);

    if (!user.isActive) {
      setAlertInfo({
        type: 'error',
        message: 'Otentikasi Gagal: Akun ditangguhkan (q = False).'
      });
      return;
    }

    if (!isAuthorized) {
      setAlertInfo({
        type: 'error',
        message: 'Tantangan Keamanan Gagal: Mohon selesaikan tantangan Captcha atau aktifkan perangkat tepercaya.'
      });
      return;
    }

    // Registrasi trusted device di database jika dicentang
    if (isTrustedDevice && supabase) {
      try {
        await supabase.from('trusted_devices').upsert({
          user_id: user.id,
          device_identifier: 'google-oauth-device',
          device_name: `Google OAuth Client (${clientIp})`,
          last_used_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,device_identifier'
        });
      } catch (err) {
        console.warn("Gagal mencatat perangkat tepercaya ke database", err);
      }
    }

    // Catat login log sukses
    if (supabase) {
      try {
        await supabase.from('login_logs').insert({
          user_id: user.id,
          username: user.username,
          login_status: 'success_oauth_challenge',
          ip_address: clientIp
        });
      } catch (err) {
        console.warn("Gagal menyimpan log login", err);
      }
    }

    clearSecurityStorage();

    setAlertInfo({
      type: 'success',
      message: 'Tantangan Keamanan Lolos! Menyiapkan Dasbor...'
    });

    setTimeout(() => {
      onSuccess(user, user.roles[0]);
    }, 1500);
  };

  return (
    <div className="max-w-md w-full mx-auto glass-panel-neon-purple p-6 sm:p-8 rounded-2xl border-2 border-deep-purple-500/30 shadow-2xl relative overflow-hidden bg-deep-navy-950/80">
      <div className="absolute top-0 right-0 p-3 text-deep-purple-400 opacity-20">
        <Shield className="w-24 h-24" />
      </div>

      <div className="relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-deep-purple-950/60 border border-deep-purple-500/40 flex items-center justify-center text-deep-purple-300">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-parchment-50">Tantangan Keamanan Tambahan</h2>
          <p className="text-xs text-parchment-400">
            Google OAuth Berhasil. Selesaikan verifikasi keamanan multi-faktor berikut.
          </p>
        </div>

        {alertInfo && (
          <div className={`p-3.5 rounded-xl border text-xs font-medium ${
            alertInfo.type === 'success'
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
              : 'bg-rose-950/40 text-rose-300 border-rose-500/30'
          }`}>
            {alertInfo.message}
          </div>
        )}

        {/* IP and Identity Info */}
        <div className="bg-deep-navy-900/60 border border-parchment-800/20 p-4 rounded-xl space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-parchment-500">Nama Akun:</span>
            <span className="font-semibold text-parchment-200">{user.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-parchment-500">Alamat IP Anda:</span>
            <span className="font-mono-custom text-deep-purple-300 font-semibold">{clientIp}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Captcha challenge */}
          <div className="border border-parchment-800/20 p-3 bg-deep-navy-900/30 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <div>
                <label className="text-xs font-bold block text-parchment-300">Captcha Otentikasi</label>
                <div className="text-[10px] font-mono-custom font-bold text-deep-purple-300 mt-0.5">{captchaQuestion}</div>
              </div>
              <button
                type="button"
                onClick={refreshCaptcha}
                className="border border-parchment-800/40 bg-deep-navy-950 text-parchment-300 hover:text-parchment-100 p-1.5 rounded-md text-xs cursor-pointer hover:bg-deep-navy-900"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              type="text"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              placeholder="Masukkan kode captcha di atas"
              className="w-full border border-parchment-800/30 bg-deep-navy-950/80 px-3 py-2 text-sm rounded-lg text-parchment-100 placeholder-parchment-600 focus:outline-none focus:border-deep-purple-500"
            />
          </div>

          {/* Trusted Device */}
          <div className="flex items-center gap-2 bg-deep-navy-900/20 p-3 rounded-xl border border-parchment-800/10">
            <input
              type="checkbox"
              id="isTrustedDevice"
              checked={isTrustedDevice}
              onChange={(e) => setIsTrustedDevice(e.target.checked)}
              className="w-4 h-4 cursor-pointer accent-deep-purple-600"
            />
            <label htmlFor="isTrustedDevice" className="text-xs font-semibold cursor-pointer select-none text-parchment-300">
              Daftarkan sebagai Perangkat Tepercaya (r = True)
            </label>
          </div>

          {/* Boolean Logic Preview (Discrete Math Sandbox context) */}
          <div className="border border-parchment-800/20 p-3.5 bg-deep-navy-950/40 rounded-xl space-y-2 text-[11px] font-mono-custom text-parchment-400">
            <div className="flex justify-between items-center text-xs text-parchment-300 font-semibold border-b border-parchment-800/15 pb-1">
              <span>Status Formula Proposisional (L)</span>
              <span className={isAuthorized ? "text-emerald-400" : "text-rose-400"}>
                L = {isAuthorized ? 'TRUE' : 'FALSE'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div>q (Akun Aktif): <span className={qVal ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>{qVal ? 'T' : 'F'}</span></div>
              <div>g (Google OAuth): <span className="text-emerald-400 font-bold">T</span></div>
              <div>r (Trusted Dev): <span className={rVal ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>{rVal ? 'T' : 'F'}</span></div>
              <div>s (Captcha Valid): <span className={sVal ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>{sVal ? 'T' : 'F'}</span></div>
            </div>
            <div className="text-[10px] text-parchment-500 pt-1 text-center border-t border-parchment-800/10 mt-1">
              Formula: L = q ∧ (g ∨ (p ∧ r) ∨ (p ∧ ¬r ∧ s))
            </div>
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            className="w-full py-2.5 bg-deep-purple-600 hover:bg-deep-purple-700 text-parchment-50 font-bold text-sm rounded-lg shadow-lg shadow-deep-purple-500/20 cursor-pointer border-0"
          >
            Loloskan Verifikasi &amp; Masuk
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={() => {
              clearSecurityStorage();
              onCancel();
            }}
            className="w-full py-2 bg-transparent hover:bg-parchment-900/10 text-parchment-400 font-bold text-xs rounded-lg cursor-pointer border border-parchment-800/20"
          >
            Batal
          </button>
        </form>
      </div>
    </div>
  );
}
