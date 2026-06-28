import React, { useState, useEffect } from 'react';
import { analyzePasswordCombinations, explainSHA1 } from '../utils/crypto.js';

export default function CryptoLab({ inputPassword, userCiphertext, targetUsername }) {
  const [text, setText] = useState('');
  
  useEffect(() => {
    if (inputPassword !== undefined) {
      setText(inputPassword);
    }
  }, [inputPassword]);

  const shaDetails = explainSHA1(text);
  const comboAnalysis = analyzePasswordCombinations(text);

  return (
    <div className="glass-panel-neon-blue panel-accent-top p-6 rounded-2xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-lavender-500/20 pb-3">
        <div>
          <h3 className="text-lg font-semibold text-lavender-200 flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-lavender-400"></span>
            Laboratorium Hashing &amp; Kriptografi
          </h3>
          <p className="text-xs text-parchment-400 mt-0.5">
            Analisis pengamanan kata sandi menggunakan Hashing SHA-1 (satu-arah).
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
            <span className="text-[10px] text-parchment-500 block uppercase font-semibold">2. Penskalaan Padding &amp; Panjang Bit (512-bit Block)</span>
            <div className="text-xs font-mono-custom text-lavender-300 mt-1 break-all select-all">
              {shaDetails.paddedBinary || <span className="italic text-parchment-600 text-[11px]">Silakan ketik input uji coba di atas...</span>}
            </div>
            <p className="text-[9px] text-parchment-500 mt-1">
              * Pesan di-padding dengan bit '1' (`10000000`) lalu disusul bit '0'. 64 bit terakhir menyimpan ukuran panjang bit pesan asli.
            </p>
          </div>

          <div>
            <span className="text-[10px] text-parchment-500 block uppercase font-semibold mb-2">3. Konstanta Inisialisasi Register (H0 - H4)</span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {shaDetails.hInitial.length > 0 ? (
                shaDetails.hInitial.map((item, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-deep-navy-950/60 border border-parchment-900/30 text-center">
                    <div className="text-[9px] font-bold text-deep-purple-300">{item.name} ({item.label})</div>
                    <div className="text-xs font-mono-custom text-parchment-200 mt-0.5">0x{item.val}</div>
                  </div>
                ))
              ) : (
                [...Array(5)].map((_, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-deep-navy-950/20 border border-parchment-900/10 text-center">
                    <div className="text-[9px] font-bold text-parchment-600">H{idx}</div>
                    <div className="text-xs font-mono-custom text-parchment-700 mt-0.5">0x--------</div>
                  </div>
                ))
              )}
            </div>
            <p className="text-[9px] text-parchment-500 mt-1">
              * Konstanta inisialisasi default register 32-bit (H0 - H4) untuk algoritma SHA-1.
            </p>
          </div>

          <div className="p-4 bg-deep-purple-950/20 border border-deep-purple-500/30 rounded-xl">
            <span className="text-[10px] text-deep-purple-300 block uppercase font-semibold">Hasil Akhir One-Way Hash (SHA-1 Hex)</span>
            <div className="text-xs sm:text-sm font-mono-custom text-petal-frost-300 font-bold mt-1 break-all select-all">
              {text ? `"${shaDetails.hash}"` : <span className="italic text-parchment-600">"da39a3ee5e6b4b0d3255bfef95601890afd80709" (Empty Hash)</span>}
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
                <span className="text-[10px] text-parchment-500 block uppercase font-semibold">Total Ruang Kunci (Key Space) &amp; Kekuatan</span>
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

      {/* Dynamic Educational Explanations - All Math Logic in SHA-1 */}
      <div className="mt-4 text-xs text-parchment-400 bg-lavender-950/20 border border-lavender-800/30 p-4 rounded-lg space-y-3">
        <div className="flex gap-2 items-center border-b border-lavender-800/30 pb-2">
          <svg className="w-4 h-4 text-lavender-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <strong className="text-lavender-200 text-sm">Eksplorasi Logika Matematika dalam SHA-1</strong>
        </div>
        <p className="leading-relaxed">
          Algoritma SHA-1 memproses masukan teks menjadi sidik jari digital 160-bit melalui serangkaian operasi aljabar Boolean, teori himpunan, dan aritmatika modular:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1 text-[11px] leading-relaxed">
          {/* 1. Gerbang Logika Dasar */}
          <div className="bg-deep-navy-950/40 p-3 rounded border border-parchment-800/20">
            <span className="text-lavender-300 font-bold block mb-1">1. Gerbang Logika Dasar (AND, OR, NOT)</span>
            Manipulasi bitwise dasar pada register biner 32-bit:
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-parchment-400">
              <li><code className="text-petal-frost-300">AND (∧)</code>: Penyaringan bit (bit-masking) untuk mengisolasi posisi bit tertentu.</li>
              <li><code className="text-petal-frost-300">OR (∨)</code>: Penggabungan bitwise.</li>
              <li><code className="text-petal-frost-300">NOT (¬)</code>: Negasi/inversi bit (pembalikan nilai biner).</li>
            </ul>
          </div>

          {/* 2. Pengacakan Bit (XOR & NOR) */}
          <div className="bg-deep-navy-950/40 p-3 rounded border border-parchment-800/20">
            <span className="text-lavender-300 font-bold block mb-1">2. Pengacakan Bit (XOR &amp; NOR)</span>
            Gerbang khusus untuk performa tinggi &amp; sirkuit universal:
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-parchment-400">
              <li><code className="text-petal-frost-300">XOR (⊕)</code>: Digunakan untuk perluasan jadwal pesan (<code className="text-petal-frost-300">W_t</code>) dan putaran 20-39 &amp; 60-79 (<code className="text-petal-frost-300">B ⊕ C ⊕ D</code>).</li>
              <li><code className="text-petal-frost-300">NOR (↓)</code>: Gerbang universal. Operasi seperti <code className="text-petal-frost-300">¬B ∧ D</code> dapat diekspresikan sebagai sirkuit gerbang NOR untuk efisiensi transistor silikon.</li>
            </ul>
          </div>

          {/* 3. Fungsi Boolean Putaran */}
          <div className="bg-deep-navy-950/40 p-3 rounded border border-parchment-800/20">
            <span className="text-lavender-300 font-bold block mb-1">3. Fungsi Boolean Putaran (Ch &amp; Maj)</span>
            Fungsi kondisional bertingkat per putaran:
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-parchment-400">
              <li><code className="text-petal-frost-300">Ch(B, C, D)</code>: <code className="text-petal-frost-300">(B ∧ C) ⊕ (¬B ∧ D)</code>. Memilih bit dari register C atau D bergantung pada status bit B.</li>
              <li><code className="text-petal-frost-300">Maj(B, C, D)</code>: <code className="text-petal-frost-300">(B ∧ C) ⊕ (B ∧ D) ⊕ (C ∧ D)</code>. Menghasilkan bit mayoritas yang dominan.</li>
            </ul>
          </div>

          {/* 4. Aritmatika Modular */}
          <div className="bg-deep-navy-950/40 p-3 rounded border border-parchment-800/20">
            <span className="text-lavender-300 font-bold block mb-1">4. Aritmatika Modular (\pmod{2^32})</span>
            Semua penjumlahan biner 32-bit dibatasi oleh modulus:
            <code className="text-petal-frost-300 block my-1 font-mono-custom text-[10px]">Result = (A + B + C + D + E) \pmod{2^32}</code>
            Jika penjumlahan melebihi batas maksimum bit register, nilai akan meluap (*overflow*). Sifat meluap inilah yang membuang informasi carry bit sehingga hash bersifat **satu-arah** (*irreversible*).
          </div>

          {/* 5. Pergeseran Siklik Biner */}
          <div className="bg-deep-navy-950/40 p-3 rounded border border-parchment-800/20">
            <span className="text-lavender-300 font-bold block mb-1">5. Pergeseran Siklik Biner (Circular Shift ⋘)</span>
            Pergeseran bit melingkar ke kiri sebanyak s posisi:
            <code className="text-petal-frost-300 block my-1 font-mono-custom text-[10px]">RotL(x, s) = (x ⋘ s)</code>
            Bit yang keluar di sisi kiri dimasukkan kembali di sisi kanan. Secara aljabar, ini adalah permutasi posisi bit yang mencegah eksploitasi keteraturan pola masukan asli.
          </div>

          {/* 6. Teori Himpunan & Sistem Bilangan */}
          <div className="bg-deep-navy-950/40 p-3 rounded border border-parchment-800/20">
            <span className="text-lavender-300 font-bold block mb-1">6. Teori Himpunan &amp; Sistem Bilangan</span>
            Transformasi representasi elemen antar-himpunan semesta:
            <code className="text-petal-frost-300 block my-1 font-mono-custom text-[10px]">Teks (Karakter) ➔ Biner (Base-2) ➔ Heksadesimal (Base-16)</code>
            Pemetaan korespondensi satu-satu (injeksi/bijeksi) digunakan pada tahap pengkodean input dan pembacaan digest akhir.
          </div>

          {/* 7. Logika & Teori Padding Bitwise */}
          <div className="bg-deep-navy-950/40 p-3 rounded border border-parchment-800/20 lg:col-span-3">
            <span className="text-lavender-300 font-bold block mb-1">7. Logika &amp; Teori Padding Bitwise (Depan vs Belakang)</span>
            Penyelarasan panjang bit biner ke arsitektur blok instruksi hardware CPU (32-bit / 64-bit):
            <ul className="list-disc list-inside mt-1 space-y-1 text-parchment-400">
              <li>
                <strong>Mengapa Padding Diperlukan?</strong> Komputer memproses aljabar biner dalam ukuran blok tetap (SHA-1 = 512 bit, dipecah menjadi 16 sub-blok 32-bit paralel). Jika input kurang dari 512 bit (misal pesan hanya 50 bit), ia wajib di-padding agar sirkuit logika instruksi CPU dapat mengeksekusi instruksi secara sinkron.
              </li>
              <li>
                <strong>Padding di Belakang (Hash Kriptografi)</strong>: Digunakan agar pesan asli tetap terbaca secara sekuensial di awal blok. SHA-1 menambahkan bit penanda akhir pesan <code className="text-petal-frost-300">1</code> (<code className="text-petal-frost-300">10000000...</code>) diikuti bit <code className="text-petal-frost-300">0</code>, lalu diakhiri ukuran bit pesan asli (64-bit) di ujung paling belakang.
              </li>
              <li>
                <strong>Padding di Depan (Register Angka/Tipe Data)</strong>: Digunakan saat menyeimbangkan angka biner kecil ke dalam register CPU 32-bit atau 64-bit (*Zero-Extension*). Dilakukan di depan agar **tidak mengubah nilai numerik asli** (contoh: biner <code className="text-petal-frost-300">101</code> [=5] di-padding depan menjadi <code className="text-petal-frost-300">00000101</code> tetap bernilai 5; jika di-padding belakang menjadi <code className="text-petal-frost-300">10100000</code> nilainya berubah menjadi 160).
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
