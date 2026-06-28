import React from 'react';
import BooleanLogicMonitor from './BooleanLogicMonitor.jsx';

export default function LogicSandbox({ 
  username = '', 
  password = '', 
  rememberDevice = false, 
  captchaValid = false, 
  pVal = false, 
  qVal = false, 
  term1 = false, 
  term2 = false, 
  L_val = false,
  gVal = false,
  users = []
}) {
  const uStr = typeof username === 'string' ? username : '';
  const pStr = typeof password === 'string' ? password : '';
  const pTyped = uStr.trim().length > 0 || pStr.length > 0;
  
  // Decide which branch is active in the logic simulation
  const isGoogle = gVal;
  const isLocal = !gVal && pTyped;

  // Google Branch States
  const gState = isGoogle ? 'true' : 'inactive';
  const gQState = isGoogle ? (qVal ? 'true' : 'false') : 'inactive';

  // Local Branch States
  const pState = isLocal ? (pVal ? 'true' : 'false') : 'inactive';
  const localQState = isLocal && pState === 'true' ? (qVal ? 'true' : 'false') : 'inactive';
  const rState = isLocal && localQState === 'true' ? (rememberDevice ? 'true' : 'false') : 'inactive';
  const sState = rState === 'false' ? (captchaValid ? 'true' : 'false') : 'inactive';

  return (
    <div className="space-y-6">
      {/* 1. Boolean Logic Monitor */}
      <BooleanLogicMonitor 
        pVal={pVal} 
        qVal={qVal} 
        rVal={rememberDevice} 
        sVal={captchaValid} 
        gVal={gVal}
        L_val={L_val} 
      />

      {/* 2. Decision Tree */}
      <div className="glass-panel-neon-purple p-5 rounded-2xl bg-deep-navy-950/70 border-2 border-deep-purple-500/30 shadow-2xl">
        <h4 className="text-xs font-bold text-parchment-400 uppercase tracking-wider mb-3 flex items-center justify-between border-b border-deep-purple-500/15 pb-2">
          <span>Pohon Keputusan Otentikasi (Decision Tree)</span>
          <span className="font-mono-custom text-deep-purple-300 text-[10px]">Kelompok 3: Logika Google OAuth &amp; Kredensial</span>
        </h4>
        
        <div className="flex flex-col items-center justify-center bg-slate-50/50 rounded-xl p-4 border border-slate-200/80">
          <svg viewBox="0 0 400 330" className="w-full max-w-lg h-auto">
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
            
            {/* Start to Google OAuth g? */}
            <line 
              x1="200" y1="35" x2="100" y2="65" 
              stroke={isGoogle ? '#10b981' : '#cbd5e1'} 
              strokeWidth={isGoogle ? 3.0 : 1.5} 
              markerEnd={isGoogle ? 'url(#arrow-green)' : 'url(#arrow-gray)'} 
            />

            {/* Start to Local Credentials p? */}
            <line 
              x1="200" y1="35" x2="300" y2="65" 
              stroke={isLocal ? '#10b981' : '#cbd5e1'} 
              strokeWidth={isLocal ? 3.0 : 1.5} 
              markerEnd={isLocal ? 'url(#arrow-green)' : 'url(#arrow-gray)'} 
            />

            {/* GOOGLE PATHWAY */}
            {/* Google g? to Gagal OAuth (g=F) */}
            <line 
              x1="100" y1="90" x2="55" y2="120" 
              stroke={isGoogle && gState === 'false' ? '#ef4444' : '#cbd5e1'} 
              strokeWidth={isGoogle && gState === 'false' ? 3.0 : 1.5} 
              markerEnd={isGoogle && gState === 'false' ? 'url(#arrow-red)' : 'url(#arrow-gray)'} 
            />

            {/* Google g? to q? */}
            <line 
              x1="100" y1="90" x2="145" y2="120" 
              stroke={isGoogle && gState === 'true' ? '#10b981' : '#cbd5e1'} 
              strokeWidth={isGoogle && gState === 'true' ? 3.0 : 1.5} 
              markerEnd={isGoogle && gState === 'true' ? 'url(#arrow-green)' : 'url(#arrow-gray)'} 
            />

            {/* Google q? to Suspended (q=F) */}
            <line 
              x1="145" y1="145" x2="107" y2="175" 
              stroke={isGoogle && gQState === 'false' ? '#ef4444' : '#cbd5e1'} 
              strokeWidth={isGoogle && gQState === 'false' ? 3.0 : 1.5} 
              markerEnd={isGoogle && gQState === 'false' ? 'url(#arrow-red)' : 'url(#arrow-gray)'} 
            />

            {/* Google q? to Sukses (L=T) */}
            <line 
              x1="145" y1="145" x2="182" y2="175" 
              stroke={isGoogle && gQState === 'true' ? '#10b981' : '#cbd5e1'} 
              strokeWidth={isGoogle && gQState === 'true' ? 3.0 : 1.5} 
              markerEnd={isGoogle && gQState === 'true' ? 'url(#arrow-green)' : 'url(#arrow-gray)'} 
            />


            {/* LOCAL PATHWAY */}
            {/* Local p? to Gagal (p=F) */}
            <line 
              x1="300" y1="90" x2="347" y2="120" 
              stroke={isLocal && pState === 'false' ? '#ef4444' : '#cbd5e1'} 
              strokeWidth={isLocal && pState === 'false' ? 3.0 : 1.5} 
              markerEnd={isLocal && pState === 'false' ? 'url(#arrow-red)' : 'url(#arrow-gray)'} 
            />

            {/* Local p? to q? */}
            <line 
              x1="300" y1="90" x2="265" y2="120" 
              stroke={isLocal && pState === 'true' ? '#10b981' : '#cbd5e1'} 
              strokeWidth={isLocal && pState === 'true' ? 3.0 : 1.5} 
              markerEnd={isLocal && pState === 'true' ? 'url(#arrow-green)' : 'url(#arrow-gray)'} 
            />

            {/* Local q? to Suspended (q=F) */}
            <line 
              x1="265" y1="145" x2="342" y2="175" 
              stroke={isLocal && localQState === 'false' ? '#ef4444' : '#cbd5e1'} 
              strokeWidth={isLocal && localQState === 'false' ? 3.0 : 1.5} 
              markerEnd={isLocal && localQState === 'false' ? 'url(#arrow-red)' : 'url(#arrow-gray)'} 
            />

            {/* Local q? to Device r? */}
            <line 
              x1="265" y1="145" x2="262" y2="175" 
              stroke={isLocal && localQState === 'true' ? '#10b981' : '#cbd5e1'} 
              strokeWidth={isLocal && localQState === 'true' ? 3.0 : 1.5} 
              markerEnd={isLocal && localQState === 'true' ? 'url(#arrow-green)' : 'url(#arrow-gray)'} 
            />

            {/* Device r? to Sukses r (L=T) */}
            <line 
              x1="262" y1="200" x2="222" y2="230" 
              stroke={isLocal && rState === 'true' ? '#10b981' : '#cbd5e1'} 
              strokeWidth={isLocal && rState === 'true' ? 3.0 : 1.5} 
              markerEnd={isLocal && rState === 'true' ? 'url(#arrow-green)' : 'url(#arrow-gray)'} 
            />

            {/* Device r? to Captcha s? */}
            <line 
              x1="262" y1="200" x2="302" y2="230" 
              stroke={isLocal && rState === 'false' ? '#10b981' : '#cbd5e1'} 
              strokeWidth={isLocal && rState === 'false' ? 3.0 : 1.5} 
              markerEnd={isLocal && rState === 'false' ? 'url(#arrow-green)' : 'url(#arrow-gray)'} 
            />

            {/* Captcha s? to Sukses s (L=T) */}
            <line 
              x1="302" y1="255" x2="252" y2="285" 
              stroke={isLocal && sState === 'true' ? '#10b981' : '#cbd5e1'} 
              strokeWidth={isLocal && sState === 'true' ? 3.0 : 1.5} 
              markerEnd={isLocal && sState === 'true' ? 'url(#arrow-green)' : 'url(#arrow-gray)'} 
            />

            {/* Captcha s? to Gagal s (s=F) */}
            <line 
              x1="302" y1="255" x2="332" y2="285" 
              stroke={isLocal && sState === 'false' ? '#ef4444' : '#cbd5e1'} 
              strokeWidth={isLocal && sState === 'false' ? 3.0 : 1.5} 
              markerEnd={isLocal && sState === 'false' ? 'url(#arrow-red)' : 'url(#arrow-gray)'} 
            />


            {/* Nodes Render */}
            
            {/* 1. Mulai (Start) */}
            <rect x="162" y="10" width="76" height="25" rx="5" ry="5" fill="#ecfdf5" stroke="#10b981" strokeWidth="2.0" />
            <text x="200" y="26" fill="#047857" fontSize="9" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Mulai</text>

            {/* GOOGLE PATH NODES */}
            {/* Google g? */}
            <rect 
              x="60" y="65" width="80" height="25" rx="5" ry="5" 
              fill={isGoogle ? '#ecfdf5' : '#f8fafc'} 
              stroke={isGoogle ? '#10b981' : '#cbd5e1'} 
              strokeWidth={isGoogle ? 2.5 : 1.0} 
            />
            <text x="100" y="81" fill={isGoogle ? '#047857' : '#475569'} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Google OAuth?</text>

            {/* Gagal g */}
            <rect 
              x="20" y="120" width="70" height="25" rx="5" ry="5" 
              fill={isGoogle && gState === 'false' ? '#fef2f2' : '#f8fafc'} 
              stroke={isGoogle && gState === 'false' ? '#ef4444' : '#cbd5e1'} 
              strokeWidth={isGoogle && gState === 'false' ? 2.5 : 1.0} 
            />
            <text x="55" y="136" fill={isGoogle && gState === 'false' ? '#b91c1c' : '#475569'} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Gagal (g=F)</text>

            {/* q? (Google) */}
            <rect 
              x="110" y="120" width="70" height="25" rx="5" ry="5" 
              fill={isGoogle && gState === 'true' ? (gQState === 'true' ? '#ecfdf5' : '#fef2f2') : '#f8fafc'} 
              stroke={isGoogle && gState === 'true' ? (gQState === 'true' ? '#10b981' : '#ef4444') : '#cbd5e1'} 
              strokeWidth={isGoogle && gState === 'true' ? 2.5 : 1.0} 
            />
            <text x="145" y="136" fill={isGoogle && gState === 'true' ? (gQState === 'true' ? '#047857' : '#b91c1c') : '#475569'} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Akun Aktif q?</text>

            {/* Gagal q (Google) */}
            <rect 
              x="75" y="175" width="65" height="25" rx="5" ry="5" 
              fill={isGoogle && gQState === 'false' ? '#fef2f2' : '#f8fafc'} 
              stroke={isGoogle && gQState === 'false' ? '#ef4444' : '#cbd5e1'} 
              strokeWidth={isGoogle && gQState === 'false' ? 2.5 : 1.0} 
            />
            <text x="107" y="191" fill={isGoogle && gQState === 'false' ? '#b91c1c' : '#475569'} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Gagal (q=F)</text>

            {/* Sukses (Google) */}
            <rect 
              x="150" y="175" width="65" height="25" rx="5" ry="5" 
              fill={isGoogle && gQState === 'true' ? '#ecfdf5' : '#f8fafc'} 
              stroke={isGoogle && gQState === 'true' ? '#10b981' : '#cbd5e1'} 
              strokeWidth={isGoogle && gQState === 'true' ? 2.5 : 1.0} 
            />
            <text x="182" y="191" fill={isGoogle && gQState === 'true' ? '#047857' : '#475569'} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Sukses (L=T)</text>


            {/* LOCAL PATH NODES */}
            {/* Local p? */}
            <rect 
              x="260" y="65" width="80" height="25" rx="5" ry="5" 
              fill={isLocal ? (pState === 'true' ? '#ecfdf5' : '#fef2f2') : '#f8fafc'} 
              stroke={isLocal ? (pState === 'true' ? '#10b981' : '#ef4444') : '#cbd5e1'} 
              strokeWidth={isLocal ? 2.5 : 1.0} 
            />
            <text x="300" y="81" fill={isLocal ? (pState === 'true' ? '#047857' : '#b91c1c') : '#475569'} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Kredensial p?</text>

            {/* Gagal p */}
            <rect 
              x="310" y="120" width="75" height="25" rx="5" ry="5" 
              fill={isLocal && pState === 'false' ? '#fef2f2' : '#f8fafc'} 
              stroke={isLocal && pState === 'false' ? '#ef4444' : '#cbd5e1'} 
              strokeWidth={isLocal && pState === 'false' ? 2.5 : 1.0} 
            />
            <text x="347" y="136" fill={isLocal && pState === 'false' ? '#b91c1c' : '#475569'} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Gagal (p=F)</text>

            {/* q? (Local) */}
            <rect 
              x="230" y="120" width="70" height="25" rx="5" ry="5" 
              fill={isLocal && pState === 'true' ? (localQState === 'true' ? '#ecfdf5' : '#fef2f2') : '#f8fafc'} 
              stroke={isLocal && pState === 'true' ? (localQState === 'true' ? '#10b981' : '#ef4444') : '#cbd5e1'} 
              strokeWidth={isLocal && pState === 'true' ? 2.5 : 1.0} 
            />
            <text x="265" y="136" fill={isLocal && pState === 'true' ? (localQState === 'true' ? '#047857' : '#b91c1c') : '#475569'} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Akun Aktif q?</text>

            {/* Gagal q (Local) */}
            <rect 
              x="310" y="175" width="65" height="25" rx="5" ry="5" 
              fill={isLocal && localQState === 'false' ? '#fef2f2' : '#f8fafc'} 
              stroke={isLocal && localQState === 'false' ? '#ef4444' : '#cbd5e1'} 
              strokeWidth={isLocal && localQState === 'false' ? 2.5 : 1.0} 
            />
            <text x="342" y="191" fill={isLocal && localQState === 'false' ? '#b91c1c' : '#475569'} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Gagal (q=F)</text>

            {/* Device r? */}
            <rect 
              x="230" y="175" width="65" height="25" rx="5" ry="5" 
              fill={isLocal && localQState === 'true' ? (rState === 'true' ? '#ecfdf5' : '#eff6ff') : '#f8fafc'} 
              stroke={isLocal && localQState === 'true' ? (rState === 'true' ? '#10b981' : '#3b82f6') : '#cbd5e1'} 
              strokeWidth={isLocal && localQState === 'true' ? 2.5 : 1.0} 
            />
            <text x="262" y="191" fill={isLocal && localQState === 'true' ? (rState === 'true' ? '#047857' : '#1d4ed8') : '#475569'} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Device r?</text>

            {/* Sukses r */}
            <rect 
              x="190" y="230" width="65" height="25" rx="5" ry="5" 
              fill={isLocal && rState === 'true' ? '#ecfdf5' : '#f8fafc'} 
              stroke={isLocal && rState === 'true' ? '#10b981' : '#cbd5e1'} 
              strokeWidth={isLocal && rState === 'true' ? 2.5 : 1.0} 
            />
            <text x="222" y="246" fill={isLocal && rState === 'true' ? '#047857' : '#475569'} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Sukses (L=T)</text>

            {/* Captcha s? */}
            <rect 
              x="270" y="230" width="65" height="25" rx="5" ry="5" 
              fill={isLocal && rState === 'false' ? (sState === 'inactive' ? '#f8fafc' : (sState === 'true' ? '#ecfdf5' : '#fef2f2')) : '#f8fafc'} 
              stroke={isLocal && rState === 'false' ? (sState === 'inactive' ? '#cbd5e1' : (sState === 'true' ? '#10b981' : '#ef4444')) : '#cbd5e1'} 
              strokeWidth={isLocal && rState === 'false' ? 2.5 : 1.0} 
            />
            <text x="302" y="246" fill={isLocal && rState === 'false' ? (sState === 'inactive' ? '#475569' : (sState === 'true' ? '#047857' : '#b91c1c')) : '#475569'} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Captcha s?</text>

            {/* Sukses s */}
            <rect 
              x="220" y="285" width="65" height="25" rx="5" ry="5" 
              fill={isLocal && sState === 'true' ? '#ecfdf5' : '#f8fafc'} 
              stroke={isLocal && sState === 'true' ? '#10b981' : '#cbd5e1'} 
              strokeWidth={isLocal && sState === 'true' ? 2.5 : 1.0} 
            />
            <text x="252" y="301" fill={isLocal && sState === 'true' ? '#047857' : '#475569'} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Sukses (L=T)</text>

            {/* Gagal s */}
            <rect 
              x="300" y="285" width="65" height="25" rx="5" ry="5" 
              fill={isLocal && sState === 'false' ? '#fef2f2' : '#f8fafc'} 
              stroke={isLocal && sState === 'false' ? '#ef4444' : '#cbd5e1'} 
              strokeWidth={isLocal && sState === 'false' ? 2.5 : 1.0} 
            />
            <text x="332" y="301" fill={isLocal && sState === 'false' ? '#b91c1c' : '#475569'} fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Gagal (s=F)</text>
          </svg>
        </div>

        <div className="mt-3 text-[10px] text-parchment-500 leading-relaxed font-sans">
          * Jalur pohon keputusan di atas menyala secara real-time: <span className="text-emerald-400 font-semibold">Hijau</span> (True/Ya), <span className="text-red-400 font-semibold">Merah</span> (False/Tidak), dan <span className="text-slate-600 font-semibold font-sans">Abu-abu</span> (Jalur tidak aktif).
        </div>
      </div>
    </div>
  );
}
