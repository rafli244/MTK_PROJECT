import React, { useState, useEffect } from 'react';
import { analyzePasswordCombinations, explainSHA256 } from '../utils/crypto.js';

export default function CryptoLab({ inputPassword, userCiphertext, targetUsername }) {
  const [text, setText] = useState('');
  
  useEffect(() => {
    if (inputPassword !== undefined) {
      setText(inputPassword);
    }
  }, [inputPassword]);

  const shaDetails = explainSHA256(text);
  const comboAnalysis = analyzePasswordCombinations(text);

  return (
    <div className="glass-panel-neon-blue panel-accent-top p-6 rounded-2xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-lavender-500/20 pb-3">
        <div>
          <h3 className="text-lg font-semibold text-lavender-200 flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-lavender-400"></span>
            Laboratorium Hashing & Kriptografi
          </h3>
          <p className="text-xs text-parchment-400 mt-0.5">
            Analisis pengamanan kata sandi menggunakan Hashing SHA-256 (satu-arah).
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="text-xs font-semibold text-parchment-400 block mb-1">Input Uji Coba Kriptografi:</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ketik password uji coba di sini..."
            className="w-full px-3 py-2 text-sm rounded-lg glass-input font-mono-custom text-lavender-200"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-parchment-400 block mb-1">
            Hash SHA-256 di Database ({targetUsername || 'None'}):
          </label>
          <div className="w-full px-3 py-2 text-sm rounded-lg bg-deep-navy-950/60 border border-parchment-800/30 text-parchment-400 font-mono-custom min-h-9.5 truncate select-all">
            {userCiphertext ? (
              <span className="text-petal-frost-300 text-xs">{userCiphertext}</span>
            ) : (
              <span className="italic text-parchment-600">Belum ada kredensial valid yang dicari</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Simulation Panels */}
      <div className="grow">
        <div className="space-y-4">
          <div className="p-3 bg-deep-navy-950/40 border border-parchment-800/30 rounded-xl">
            <span className="text-[10px] text-parchment-500 block uppercase font-semibold">1. Input ke Biner (UTF-8)</span>
            <div className="text-xs font-mono-custom text-lavender-300 mt-1 break-all select-all font-semibold">
              {shaDetails.binaryRaw || <span className="italic text-parchment-600 text-[11px]">Silakan ketik input uji coba di atas...</span>}
            </div>
          </div>

          <div className="p-3 bg-deep-navy-950/40 border border-parchment-800/30 rounded-xl">
            <span className="text-[10px] text-parchment-500 block uppercase font-semibold">2. Penskalaan Padding & Panjang Bit (512-bit Block)</span>
            <div className="text-xs font-mono-custom text-lavender-300 mt-1 break-all select-all">
              {shaDetails.paddedBinary || <span className="italic text-parchment-600 text-[11px]">Silakan ketik input uji coba di atas...</span>}
            </div>
            <p className="text-[9px] text-parchment-500 mt-1">
              * Pesan di-padding dengan bit '1' (`10000000`) lalu disusul bit '0'. 64 bit terakhir menyimpan ukuran panjang bit pesan asli.
            </p>
          </div>

          <div>
            <span className="text-[10px] text-parchment-500 block uppercase font-semibold mb-2">3. Konstanta Inisialisasi Register (H0 - H7)</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {shaDetails.hInitial.length > 0 ? (
                shaDetails.hInitial.map((item, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-deep-navy-950/60 border border-parchment-900/30 text-center">
                    <div className="text-[9px] font-bold text-deep-purple-300">{item.name} (Akar Prima {item.prime})</div>
                    <div className="text-xs font-mono-custom text-parchment-200 mt-0.5">0x{item.val}</div>
                  </div>
                ))
              ) : (
                [...Array(8)].map((_, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-deep-navy-950/20 border border-parchment-900/10 text-center">
                    <div className="text-[9px] font-bold text-parchment-600">H{idx}</div>
                    <div className="text-xs font-mono-custom text-parchment-700 mt-0.5">0x--------</div>
                  </div>
                ))
              )}
            </div>
            <p className="text-[9px] text-parchment-500 mt-1">
              * Diambil dari bagian pecahan akar kuadrat dari 8 bilangan prima pertama (2, 3, 5, 7, 11, 13, 17, 19).
            </p>
          </div>

          <div className="p-4 bg-deep-purple-950/20 border border-deep-purple-500/30 rounded-xl">
            <span className="text-[10px] text-deep-purple-300 block uppercase font-semibold">Hasil Akhir One-Way Hash (SHA-256 Hex)</span>
            <div className="text-xs sm:text-sm font-mono-custom text-petal-frost-300 font-bold mt-1 break-all select-all">
              {text ? `"${shaDetails.hash}"` : <span className="italic text-parchment-600">"e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" (Empty Hash)</span>}
            </div>
            <span className="text-[9px] text-parchment-500 block mt-1">
              * Sifat Satu-Arah (One-Way): Sangat mustahil mendekripsi balik hash di atas ke plaintext sandi asal.
            </span>
          </div>
        </div>
      </div>

      {/* Modul Kombinatorika Password (S^N) */}
      {text.length > 0 && (
        <div className="mt-5 p-4 rounded-xl border border-deep-purple-500/20 bg-deep-purple-950/10">
          <h4 className="text-xs font-bold text-deep-purple-300 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Kombinatorika Kekuatan Password (S^N)</span>
            <span className="font-mono-custom text-[10px] text-parchment-400 lowercase">Rumus: Jumlah Kombinasi = S^N</span>
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center mb-3">
            <div className={`p-2 rounded-lg border ${comboAnalysis.hasNumbers ? 'bg-deep-purple-950/40 border-deep-purple-400/40 text-deep-purple-200' : 'bg-deep-navy-950/60 border-parchment-900/20 text-parchment-600'}`}>
              <div className="text-[10px] font-bold">Angka (0-9)</div>
              <div className="text-xs font-mono-custom mt-0.5">{comboAnalysis.hasNumbers ? 'S = 10' : 'Tidak Aktif'}</div>
            </div>
            <div className={`p-2 rounded-lg border ${comboAnalysis.hasLowercase ? 'bg-deep-purple-950/40 border-deep-purple-400/40 text-deep-purple-200' : 'bg-deep-navy-950/60 border-parchment-900/20 text-parchment-600'}`}>
              <div className="text-[10px] font-bold">Huruf Kecil (a-z)</div>
              <div className="text-xs font-mono-custom mt-0.5">{comboAnalysis.hasLowercase ? 'S = 26' : 'Tidak Aktif'}</div>
            </div>
            <div className={`p-2 rounded-lg border ${comboAnalysis.hasUppercase ? 'bg-deep-purple-950/40 border-deep-purple-400/40 text-deep-purple-200' : 'bg-deep-navy-950/60 border-parchment-900/20 text-parchment-600'}`}>
              <div className="text-[10px] font-bold">Huruf Besar (A-Z)</div>
              <div className="text-xs font-mono-custom mt-0.5">{comboAnalysis.hasUppercase ? 'S = 26' : 'Tidak Aktif'}</div>
            </div>
            <div className={`p-2 rounded-lg border ${comboAnalysis.hasSymbols ? 'bg-deep-purple-950/40 border-deep-purple-400/40 text-deep-purple-200' : 'bg-deep-navy-950/60 border-parchment-900/20 text-parchment-600'}`}>
              <div className="text-[10px] font-bold">Simbol (ASCII)</div>
              <div className="text-xs font-mono-custom mt-0.5">{comboAnalysis.hasSymbols ? 'S = 32' : 'Tidak Aktif'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-deep-navy-950/50 border border-parchment-900/30 p-3 rounded-lg flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-parchment-500 block uppercase font-semibold">Detail Parameter Matematika</span>
                <div className="mt-1.5 space-y-1 font-mono-custom">
                  <div className="flex justify-between">
                    <span>Panjang Password (N):</span>
                    <span className="text-lavender-300 font-bold">{comboAnalysis.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ukuran Set Karakter (S):</span>
                    <span className="text-lavender-300 font-bold">{comboAnalysis.setSize}</span>
                  </div>
                  <div className="flex justify-between border-t border-parchment-800/30 pt-1 mt-1 font-semibold">
                    <span>Rumus S^N:</span>
                    <span className="text-petal-frost-300">{comboAnalysis.setSize}<sup>{comboAnalysis.length}</sup></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-deep-navy-950/50 border border-parchment-900/30 p-3 rounded-lg flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-parchment-500 block uppercase font-semibold">Total Ruang Kunci (Key Space) & Kekuatan</span>
                <div className="mt-1.5 space-y-1 font-mono-custom">
                  <div className="flex justify-between">
                    <span>Total Kombinasi:</span>
                    <span className="text-lavender-300 font-bold text-right">
                      {comboAnalysis.totalCombinations > 1000000 
                        ? comboAnalysis.totalCombinations.toExponential(2) 
                        : comboAnalysis.totalCombinations.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Waktu Pecah GPU:</span>
                    <span className={`font-bold text-right ${
                      comboAnalysis.totalCombinations > 1e12 
                        ? 'text-lavender-300' 
                        : comboAnalysis.totalCombinations > 1e8 
                        ? 'text-deep-purple-300' 
                        : 'text-petal-frost-400'
                    }`}>
                      {comboAnalysis.crackTimeLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[9px] text-parchment-500 mt-2.5 leading-relaxed">
            * Estimasi brute force diasumsikan menggunakan superkomputer GPU berkecepatan <strong>10 miliar (10¹⁰) tebakan per detik</strong>.
          </p>
        </div>
      )}

      {/* Dynamic Educational Explanations */}
      <div className="mt-4 text-xs text-parchment-400 bg-lavender-950/20 border border-lavender-800/30 p-3 rounded-lg flex gap-2">
        <svg className="w-4 h-4 text-lavender-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="leading-relaxed">
          <strong className="text-lavender-200">Teorema Hashing SHA-256:</strong> Merupakan algoritma hash kriptografi satu-arah (*one-way*). Input teks diproses melalui modifikasi bitwise, pergeseran rotasi biner, dan penambahan modular (\pmod{2^32}) sebanyak 64 putaran. Menghasilkan sidik jari digital 256-bit unik yang tidak dapat dipecahkan/didekripsi kembali.
        </p>
      </div>
    </div>
  );
}
