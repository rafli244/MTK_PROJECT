import React from 'react';

export default function BooleanLogicMonitor({ pVal, qVal, rVal, sVal, gVal, L_val }) {
  const term1 = pVal && rVal;
  const term2 = pVal && !rVal && sVal;
  const orGatesCombined = term1 || term2 || gVal;

  return (
    <div className="p-6 rounded-2xl border-2 border-emerald-600/40 bg-white shadow-xl space-y-6 text-slate-800">
      <div className="border-b border-emerald-200 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h4 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Monitor Rangkaian Logika Boolean (Otentikasi)
          </h4>
          <p className="text-xs text-slate-600 mt-1 font-medium">
            Evaluasi proposisi lingkungan masuk secara real-time berdasarkan gerbang logika AND (∧), OR (∨), dan NOT (¬).
          </p>
        </div>
        <div className="font-mono-custom text-emerald-800 text-sm font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border-2 border-emerald-500/30 w-fit shrink-0">
          L = q ∧ ((p ∧ r) ∨ (p ∧ ¬r ∧ s) ∨ g)
        </div>
      </div>

      {/* Variables state indicators - Solid colors with high contrast white text */}
      <div>
        <span className="text-xs uppercase font-extrabold text-slate-700 block mb-3 tracking-wider">
          Status Input Proposisi (Himpunan Input)
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
          {/* p (Kredensial) */}
          <div className={`p-3 rounded-xl border-2 text-center transition-all shadow-sm ${
            pVal 
              ? 'bg-emerald-600 border-emerald-700 text-white' 
              : 'bg-rose-600 border-rose-700 text-white'
          }`}>
            <div className="text-[10px] uppercase font-bold text-white/90 tracking-wide">p (Kredensial)</div>
            <div className="text-lg font-bold mt-1 font-mono-custom">{pVal ? 'TRUE (T)' : 'FALSE (F)'}</div>
            <div className="text-[9px] text-white/80 mt-1 font-medium">Sandi &amp; Peran Valid</div>
          </div>

          {/* q (Akun Aktif) */}
          <div className={`p-3 rounded-xl border-2 text-center transition-all shadow-sm ${
            qVal 
              ? 'bg-emerald-600 border-emerald-700 text-white' 
              : 'bg-rose-600 border-rose-700 text-white'
          }`}>
            <div className="text-[10px] uppercase font-bold text-white/90 tracking-wide">q (Akun Aktif)</div>
            <div className="text-lg font-bold mt-1 font-mono-custom">{qVal ? 'TRUE (T)' : 'FALSE (F)'}</div>
            <div className="text-[9px] text-white/80 mt-1 font-medium">Akun Aktif</div>
          </div>

          {/* r (Ingat Device) */}
          <div className={`p-3 rounded-xl border-2 text-center transition-all shadow-sm ${
            rVal 
              ? 'bg-emerald-600 border-emerald-700 text-white' 
              : 'bg-blue-600 border-blue-700 text-white'
          }`}>
            <div className="text-[10px] uppercase font-bold text-white/90 tracking-wide">r (Ingat Device)</div>
            <div className="text-lg font-bold mt-1 font-mono-custom">{rVal ? 'TRUE (T)' : 'FALSE (F)'}</div>
            <div className="text-[9px] text-white/80 mt-1 font-medium">Device Dikenali</div>
          </div>

          {/* s (Captcha) */}
          <div className={`p-3 rounded-xl border-2 text-center transition-all shadow-sm ${
            sVal 
              ? 'bg-emerald-600 border-emerald-700 text-white' 
              : 'bg-rose-600 border-rose-700 text-white'
          }`}>
            <div className="text-[10px] uppercase font-bold text-white/90 tracking-wide">s (Captcha)</div>
            <div className="text-lg font-bold mt-1 font-mono-custom">{sVal ? 'TRUE (T)' : 'FALSE (F)'}</div>
            <div className="text-[9px] text-white/80 mt-1 font-medium">Captcha Valid</div>
          </div>

          {/* g (Google OAuth) */}
          <div className={`p-3 rounded-xl border-2 text-center transition-all shadow-sm ${
            gVal 
              ? 'bg-emerald-600 border-emerald-700 text-white' 
              : 'bg-blue-600 border-blue-700 text-white'
          }`}>
            <div className="text-[10px] uppercase font-bold text-white/90 tracking-wide">g (Google OAuth)</div>
            <div className="text-lg font-bold mt-1 font-mono-custom">{gVal ? 'TRUE (T)' : 'FALSE (F)'}</div>
            <div className="text-[9px] text-white/80 mt-1 font-medium">Google Auth Valid</div>
          </div>
        </div>
      </div>

      {/* Logical calculations visualization - High contrast labels and results */}
      <div className="bg-slate-50 border border-slate-300 rounded-xl p-5 space-y-4">
        <span className="text-xs uppercase font-extrabold text-slate-800 block tracking-wider">
          Tahapan Evaluasi Aljabar Boolean (Hukum Distributif)
        </span>
        
        <div className="space-y-3 font-mono-custom text-xs md:text-sm text-slate-800">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-slate-200 gap-1">
            <span className="font-semibold text-slate-700">1. Term Kredensial + Device Terpercaya (p ∧ r):</span>
            <span className={`font-bold px-2 py-0.5 rounded text-xs w-fit ${term1 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {pVal ? 'T' : 'F'} ∧ {rVal ? 'T' : 'F'} = {term1 ? 'True (T)' : 'False (F)'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-slate-200 gap-1">
            <span className="font-semibold text-slate-700">2. Term Kredensial + Device Baru + Captcha (p ∧ ¬r ∧ s):</span>
            <span className={`font-bold px-2 py-0.5 rounded text-xs w-fit ${term2 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {pVal ? 'T' : 'F'} ∧ ¬({rVal ? 'T' : 'F'}) ∧ {sVal ? 'T' : 'F'} = {term2 ? 'True (T)' : 'False (F)'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-slate-200 gap-1">
            <span className="font-semibold text-slate-700">3. Gabungan Syarat Metode Masuk ((p ∧ r) ∨ (p ∧ ¬r ∧ s) ∨ g):</span>
            <span className={`font-bold px-2 py-0.5 rounded text-xs w-fit ${orGatesCombined ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {term1 ? 'T' : 'F'} ∨ {term2 ? 'T' : 'F'} ∨ {gVal ? 'T' : 'F'} = {orGatesCombined ? 'True (T)' : 'False (F)'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 gap-1">
            <span className="font-semibold text-slate-700">4. Evaluasi Akhir dengan Syarat Akun Aktif (q ∧ [Gabungan]):</span>
            <span className={`font-bold px-2 py-0.5 rounded text-xs w-fit ${L_val ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {qVal ? 'T' : 'F'} ∧ {orGatesCombined ? 'T' : 'F'} = {L_val ? 'True (T)' : 'False (F)'}
            </span>
          </div>
        </div>
      </div>

      {/* Final Evaluation and Result - High Contrast Solid Badges */}
      <div className={`p-5 rounded-xl border-2 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-sm ${
        L_val 
          ? 'bg-emerald-50 border-emerald-500/50' 
          : 'bg-rose-50 border-rose-500/50'
      }`}>
        <div>
          <span className="text-sm font-extrabold text-slate-900 block">Hasil Akhir Evaluasi Boolean (L = q ∧ ((p ∧ r) ∨ (p ∧ ¬r ∧ s) ∨ g)):</span>
          <p className="text-xs text-slate-700 mt-1 font-medium">
            Otentikasi berhasil jika akun Anda aktif (q=T) DAN salah satu metode login (kredensial lokal / Google) terpenuhi.
          </p>
        </div>
        <div className="font-mono-custom shrink-0">
          <span className={`px-5 py-2.5 rounded-lg border-2 text-sm font-black tracking-wide inline-block shadow-sm ${
            L_val 
              ? 'bg-emerald-700 border-emerald-800 text-white' 
              : 'bg-rose-700 border-rose-800 text-white'
          }`}>
            {qVal ? 'T' : 'F'} ∧ (({term1 ? 'T' : 'F'} ∨ {term2 ? 'T' : 'F'}) ∨ {gVal ? 'T' : 'F'}) = {L_val ? 'LOGGED IN (True / T)' : 'DENIED (False / F)'}
          </span>
        </div>
      </div>

      {/* Detailed Logical Deduction - High contrast dark slate background and high contrast text */}
      <div className="bg-slate-100 border border-slate-300 rounded-xl p-5 text-xs text-slate-800 space-y-4 leading-relaxed">
        <span className="text-xs uppercase font-extrabold text-slate-900 block tracking-wider font-mono-custom">
          Penurunan Rumus &amp; Logika Gerbang (AND, OR, NOT)
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <strong className="text-slate-900 font-extrabold block text-sm">Gerbang NOT (Negasi / ¬)</strong>
            <p className="text-xs text-slate-700 font-medium">
              Membalikkan nilai kebenaran perangkat: <code className="text-rose-700 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">¬r</code> bernilai <code className="text-emerald-700 font-bold">True</code> jika masuk menggunakan perangkat baru, yang memicu syarat pengerjaan Captcha (s).
            </p>
          </div>
          <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-slate-300 pt-3 md:pt-0 md:pl-5">
            <strong className="text-slate-900 font-extrabold block text-sm">Gerbang AND (Konjungsi / ∧)</strong>
            <p className="text-xs text-slate-700 font-medium">
              Syarat mutlak di luar jalur: Akun aktif (<code className="text-rose-700 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">q</code>) bertindak sebagai gerbang seri utama (Hukum Distributif). Jika akun mati (<code className="text-rose-700 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">q = False</code>), maka gerbang AND bernilai False, mem-banned semua jalur login.
            </p>
          </div>
          <div className="space-y-1.5 border-t md:border-t-0 md:border-l border-slate-300 pt-3 md:pt-0 md:pl-5">
            <strong className="text-slate-900 font-extrabold block text-sm">Gerbang OR (Disjungsi / ∨)</strong>
            <p className="text-xs text-slate-700 font-medium">
              Menghubungkan 3 metode masuk: <code className="text-rose-700 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">(p ∧ r)</code>, <code className="text-rose-700 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">(p ∧ ¬r ∧ s)</code>, dan <code className="text-rose-700 font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200">g</code>. Jika salah satu dari 3 term bernilai True, gerbang OR mengeluarkan output True.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
