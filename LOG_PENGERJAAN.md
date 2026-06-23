# LOG PENGERJAAN & ALUR PROSES PENGEMBANGAN WEBSITE (MATHSECURE)

Dokumen ini mencatat kronologi lengkap alur pengerjaan dan pengembangan website **MathSecure - Sistem Autentikasi Kontekstual & Laboratorium Matematika Diskrit** dari tahap awal hingga akhir.

---

## 📅 Ringkasan Informasi Proyek
* **Nama Proyek**: MathSecure - Context-Aware Authentication System
* **Studi Kasus**: Matematika Diskrit (Logika Proposisional, Teori Himpunan, Kombinatorika) & Kriptografi (SHA-256, XOR)
* **Teknologi Utama**: React, Vite, Tailwind CSS, Supabase (Database), BcryptJS, PptxGenJS (Slide Exporter), Vercel (Hosting)
* **Repositori Git**: `https://github.com/rafli244/MTK_PROJECT.git`

---

## 🛠️ Alur Pengerjaan Kronologis (Milestone 1 - 8)

### Tahap 1: Perancangan Konsep & Aljabar Boolean
* **Aktivitas**: Merancang formula logika proposisional untuk sistem login dinamis berdasarkan evaluasi variabel lingkungan secara real-time.
* **Variabel Proposisional**:
  * $p$ : Kredensial Valid (Username, password, dan role yang dipilih cocok).
  * $q$ : Akun Aktif (Status keanggotaan aktif / `isActive === true`).
  * $r$ : Perangkat Terpercaya (Pilihan "Ingat Perangkat Ini" dicentang).
  * $s$ : Captcha Terverifikasi (Hasil perhitungan matematika benar).
* **Fungsi Logika Utama**: 
  $$L = (p \land q \land r) \lor (p \land q \land \neg r \land s)$$
* **File Terkait**: `src/utils/mathLogic.js`

---

### Tahap 2: Implementasi Teori Himpunan & Matriks Relasi
* **Aktivitas**: Menerjemahkan relasi pengguna dan peran (*Many-to-Many*) ke dalam konsep Teori Himpunan dan menampilkannya secara interaktif.
* **Detail Pekerjaan**:
  * Membuat visualisasi **Diagram Venn SVG** interaktif di panel kanan aplikasi.
  * Mendefinisikan Himpunan Semesta Pengguna ($U$), Himpunan Admin ($A$), dan Himpunan Dosen ($D$).
  * Menampilkan irisan himpunan ($A \cap D$), selisih himpunan ($A \setminus D$), dan komplemen secara dinamis sesuai user yang aktif/dipilih.
* **File Terkait**: `src/components/VennDiagram.jsx`, `src/utils/dummyDb.js`

---

### Tahap 3: Pembuatan Laboratorium Kriptografi & Kombinatorika
* **Aktivitas**: Membuat lab interaktif untuk membandingkan dua metode keamanan (SHA-256 vs XOR) dan menghitung kekuatan kunci.
* **Detail Pekerjaan**:
  * Menulis algoritma **SHA-256 (One-Way Hashing)** murni di sisi klien untuk enkripsi password.
  * Menulis **XOR Cipher Simetris** (dua-arah) menggunakan gerbang logika bitwise dengan Key = 90.
  * Membuat kalkulator pencarian kunci (*Brute Force key space*) berdasarkan rumus kombinatorika $S^N$ ($S$ = ukuran karakter, $N$ = panjang password).
* **File Terkait**: `src/components/CryptoLab.jsx`, `src/utils/crypto.js`

---

### Tahap 4: Debugging API Slide Exporter (PptxGenJS)
* **Aktivitas**: Mengintegrasikan exporter presentasi berbasis JavaScript untuk menghasilkan file PowerPoint (`.pptx`) dinamis.
* **Masalah**: Ekspor presentasi mengalami kegagalan/error karena `pptx.ShapeType.oval` tidak didukung oleh versi PptxGenJS terbaru.
* **Solusi**: Mengganti `pptx.ShapeType.oval` menjadi `pptx.ShapeType.ellipse` dan memindahkan file presentasi pendukung (`presentation.html`, `.pdf`, `.pptx`) ke dalam folder `/public` agar Vite dapat membundelnya secara statis.
* **File Terkait**: `public/presentation.html`

---

### Tahap 5: Integrasi Database Eksternal (Supabase)
* **Aktivitas**: Menghubungkan aplikasi web sisi klien langsung ke database relasional PostgreSQL melalui layanan Supabase.
* **Detail Pekerjaan**:
  * Menginstall modul `@supabase/supabase-js`.
  * Membuat skema database (`users`, `login_logs`, `trusted_devices`) menggunakan file setup SQL.
  * Melakukan inisialisasi client Supabase di dalam proyek melalui file `.env.local` yang menampung key `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY`.
* **File Terkait**: `src/utils/supabaseClient.js`, `SUPABASE_SQL_SETUP.sql`, `SUPABASE_SETUP_SIMPLE.sql`

---

### Tahap 6: Pembuatan Mekanisme Database Fallback (Login & Fetch)
* **Aktivitas**: Menambahkan toleransi kegagalan (*fault tolerance*) pada konektivitas database eksternal.
* **Masalah**: Jika database Supabase kosong atau terhambat oleh kebijakan Row Level Security (RLS) di server, pengguna tidak bisa login menggunakan akun demo bawaan.
* **Solusi**: Menyusun logika *cascade/waterfall fallback*. Jika pencarian user ke Supabase mengembalikan hasil kosong atau error, aplikasi akan otomatis jatuh ke backend API lokal. Jika API lokal mati, aplikasi secara transparan menggunakan data simulasi lokal `usersDb` sehingga akun demo (seperti `budi`/`budi123` dan `siti`/`siti123`) dapat langsung digunakan secara instan.
* **File Terkait**: `src/components/LoginForm.jsx`, `src/App.jsx`

---

### Tahap 7: Perbaikan Graceful Fallback Registrasi (Sign Up)
* **Aktivitas**: Memperbaiki kegagalan proses registrasi jika RLS Supabase memblokir operasi `INSERT`.
* **Masalah**: Ketika pengguna mendaftarkan akun baru tetapi database Supabase mengaktifkan RLS tanpa policy publik, proses registrasi langsung macet dengan error `42501 (RLS policy violation)`.
* **Solusi**:
  * Membungkus fungsi insert Supabase dalam `try/catch` pada `SignUpForm.jsx`.
  * Jika Supabase memicu error keamanan, sistem akan melakukan pendaftaran lokal, meng-hash kata sandi menggunakan SHA-256, dan menambahkannya langsung ke state React.
  * Mengubah callback `onSignUpSuccess` di `App.jsx` agar dapat menerima objek pengguna baru tersebut dan memasukkannya ke dalam state global `users`. Akun baru kini langsung siap digunakan untuk login.
* **File Terkait**: `src/components/SignUpForm.jsx`, `src/App.jsx`

---

### Tahap 8: Sinkronisasi Verifikasi Bcrypt Lokal
* **Aktivitas**: Memastikan verifikasi hash kata sandi tetap konsisten pada jalur fallback.
* **Masalah**: Akun yang terdaftar di Supabase menggunakan hash Bcrypt (`$2a$`), sedangkan fungsi fallback lokal `authenticateUser` hanya membandingkan hash SHA-256, sehingga login lokal untuk user Supabase akan ditolak.
* **Solusi**: Mengintegrasikan pustaka `bcryptjs` ke dalam `mathLogic.js` dan menambahkan deteksi prefix `$2a$` / `$2b$`. Jika format hash Bcrypt terdeteksi, verifikasi lokal akan diproses menggunakan `bcryptjs.compareSync` untuk hasil yang akurat.
* **File Terkait**: `src/utils/mathLogic.js`

---

## 📈 Alur Diagram Evaluasi Autentikasi (Decision Tree)

Proses evaluasi boolean ini digambarkan secara visual di dalam sirkuit logika aplikasi:

```
[ INPUT USERNAME, PASSWORD, ROLE ]
               │
      (Cek Kredensial p?) ─── (Salah) ───► [ LOGIN DITOLAK (p = False) ]
               │
             (Benar)
               │
       (Cek Akun Aktif q?) ─── (Tidak) ───► [ LOGIN DITOLAK (q = False) ]
               │
             (Benar)
               │
      (Ingat Perangkat r?)
       /               \
     (Ya)            (Tidak)
     /                   \
[ LOGIN SUKSES ]     (Cek Captcha s?) ── (Salah) ──► [ LOGIN DITOLAK (s = False) ]
                           │
                        (Benar)
                           │
                     [ LOGIN SUKSES ]
```

---

## 🚀 Tahap Akhir: Deployment & Pengarsipan
* **GitHub**: Semua perubahan kode disinkronkan ke repositori Git utama (`main` branch).
* **Vercel**: Mengkonfigurasi platform hosting Vercel agar mendeteksi framework Vite, memasukkan Environment Variables dari `.env.local` secara aman, dan mendistribusikan aplikasi secara publik.
* **Lampiran Tambahan**: Menyusun dokumen [LAMPIRAN.md](file:///c:/Users/Predator/Downloads/MTK for real (5)/MTK for real/LAMPIRAN.md) dan [DAFTAR_PUSTAKA.md](file:///c:/Users/Predator/Downloads/MTK for real (5)/MTK for real/DAFTAR_PUSTAKA.md) untuk kepatuhan administrasi tugas kuliah.
