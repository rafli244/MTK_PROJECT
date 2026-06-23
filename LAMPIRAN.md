# LAMPIRAN: LOG PROSES, PERNYATAAN AI, DAN REFERENSI

Dokumen lampiran ini disusun untuk memenuhi **Ketentuan Tambahan** dalam penilaian proyek mata kuliah **Matematika Diskrit & Keamanan Informasi**.

---

## 1. Log Proses Pertahapan Pengembangan (Step-by-Step Log)

Pengembangan sistem **MathSecure (Sistem Autentikasi Kontekstual)** dilakukan melalui 6 tahapan terstruktur berikut:

| Tahap | Aktivitas Utama | Output & Hasil |
| :--- | :--- | :--- |
| **Tahap 1** | **Pemodelan Logika Proposisional** | Memformulasikan logika evaluasi login dengan rumus:<br>$L = (p \land q \land r) \lor (p \land q \land \neg r \land s)$<br>dan menyusun Tabel Kebenaran 16 baris logika. |
| **Tahap 2** | **Visualisasi Teori Himpunan** | Membuat representasi himpunan pengguna ($U$), Admin ($A$), dan Dosen ($D$) menggunakan grafik SVG interaktif (Diagram Venn) untuk menggambarkan relasi *Many-to-Many*. |
| **Tahap 3** | **Pengembangan Lab Kriptografi** | Mengimplementasikan algoritma hashing satu-arah **SHA-256** murni di sisi klien, enkripsi gerbang logika **XOR** simetris, dan kalkulator kekuatan kunci berbasis kombinatorika $S^N$. |
| **Tahap 4** | **Penyusunan Slide Presentasi Dinamis** | Mengintegrasikan pustaka `PptxGenJS` untuk memproses slide PPTX dinamis langsung dari browser, serta memperbaiki galat parameter geometri `oval` menjadi `ellipse`. |
| **Tahap 5** | **Integrasi Supabase & Database Fallback** | Menghubungkan aplikasi ke Supabase Cloud. Membuat skema database SQL dan menambahkan sistem keamanan fallback tangguh agar demo aplikasi tetap berjalan lancar saat offline atau terhambat kebijakan RLS. |
| **Tahap 6** | **Deployment & Optimasi Vercel** | Mengatur file statis di dalam folder `/public` agar terbaca oleh compiler Vite, melakukan deployment ke platform Vercel, serta menguji validitas alur login di browser sandbox. |

---

## 2. Pernyataan Penggunaan Bantuan AI (AI Assistance Declaration)

Secara formal dideklarasikan bahwa proyek pengembangan **MathSecure** ini memanfaatkan bantuan asisten kecerdasan buatan (**AI Antigravity - Google DeepMind**) dengan kontribusi sebagai berikut:

* **Optimasi Kode Aljabar Boolean**: Penulisan fungsi evaluasi `evaluateBooleanAuth` dan rendering visual lintasan pohon keputusan (*decision tree*) secara real-time pada interface login.
* **Perbaikan Skema Enkripsi**: Penulisan komparator sinkronisasi password hash Bcrypt menggunakan pustaka `bcryptjs` pada modul otentikasi lokal klien.
* **Debugging Geometri PPTX**: Pemecahan masalah kompatibilitas objek shape pada pustaka `PptxGenJS` untuk mengekspor slide presentasi secara instan.
* **Pengembangan Arsitektur Fallback**: Pembuatan mekanisme *graceful fallback* dari koneksi database Supabase ke database simulasi statis (`dummyDb.js`) jika server mengalami kendala konektivitas.

*Penggunaan AI dalam proyek ini murni bertindak sebagai asisten pemrograman, sedangkan seluruh konsep matematika diskrit, desain sistem, dan logika relasi biner dirancang sepenuhnya oleh kelompok mahasiswa.*

---

## 3. Sumber Referensi (References)

Berikut adalah buku dan standardisasi akademik yang dirujuk dalam proyek ini:

1. **Munir, R. (2016).** *Matematika Diskrit* (Edisi Revisi). Bandung: Informatika.
   *(Referensi pemodelan teori himpunan, diagram Venn, relasi biner, matriks biner, dan aljabar boolean).*
2. **Rosen, K. H. (2012).** *Discrete Mathematics and Its Applications* (7th ed.). New York: McGraw-Hill.
   *(Referensi internasional untuk Logika Proposisional, Teori Himpunan, dan Matematika Kombinatorika $S^N$).*
3. **Schneier, B. (1996).** *Applied Cryptography: Protocols, Algorithms, and Source Code in C* (2nd ed.). New York: John Wiley & Sons.
   *(Referensi teoretis mengenai operasi logika gerbang bitwise XOR pada cipher simetris).*
4. **National Institute of Standards and Technology (NIST). (2015).** *FIPS PUB 180-4: Secure Hash Standard (SHS)*. U.S. Department of Commerce.
   *(Dokumen standar resmi algoritma fungsi hash satu-arah SHA-256).*

*(Rincian lengkap dokumentasi teknologi dan pustaka perangkat lunak terlampir pada file [DAFTAR_PUSTAKA.md](file:///c:/Users/Predator/Downloads/MTK%20for%20real%20(5)/MTK%20for%20real/DAFTAR_PUSTAKA.md)).*
