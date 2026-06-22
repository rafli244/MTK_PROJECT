# Context-Aware Authentication System & Discrete Mathematics Laboratory
**Projek Akhir Mata Kuliah Matematika Diskrit — Program Studi Teknik Informatika**
**Kelompok 3: Role Pengguna Berbasis Himpunan & Pohon Keputusan**

Projek ini adalah sebuah sistem otentikasi sadar konteks (*context-aware authentication*) berbasis web yang diintegrasikan dengan laboratorium interaktif Matematika Diskrit. Sistem ini mendemonstrasikan bagaimana konsep teori himpunan, logika proposisional, matriks relasi biner, dan kombinatorika kekuatan kata sandi diterapkan pada skenario keamanan siber dunia nyata.

---

## 🎯 Kesesuaian dengan Aturan Originalitas (Kelompok 3)

Berdasarkan **Ketentuan Pembeda Projek Antar Kelompok** dari program studi Teknik Informatika, projek ini memenuhi seluruh spesifikasi Kelompok 3 untuk tema terkait:

1.  **Sistem Validasi Login (Kelompok 3)**:
    *   **Role Pengguna Berbasis Himpunan**: Memetakan status otorisasi pengguna ke dalam Himpunan Semesta ($U$), Himpunan Admin ($A$), dan Himpunan Dosen ($D$) menggunakan matriks relasi biner many-to-many. Visualisasi digambarkan menggunakan **Diagram Venn SVG interaktif** yang menyala secara real-time.
    *   **Pohon Keputusan (Decision Tree)**: Evaluasi logika proposisi login divisualisasikan dalam bentuk rangkaian pohon keputusan biner SVG dinamis (menyala hijau jika proposisi bernilai *True* dan merah jika *False*).
2.  **Password Aman (Kelompok 3)**:
    *   **Kekuatan Sandi Berbasis Karakter**: Laboratorium kombinatorika menganalisis kekuatan password berdasarkan rumus ruang kunci $S^N$. Sistem secara dinamis mendeteksi keberadaan angka ($S=10$), huruf kecil ($S=26$), huruf besar ($S=26$), dan simbol ($S=32$) untuk mengukur total kombinasi dan mengestimasi waktu retak brute force.
3.  **Pembeda Khusus Kelompok Tambahan**:
    *   **Inputan Captcha ($s$)** untuk memverifikasi perangkat baru.
    *   **Ingat Perangkat Ini ($r$)** untuk menetapkan kepercayaan perangkat.

---

## 🛠️ Log Proses Pertahapan Projek (Project Log)

Berikut adalah catatan tahapan perancangan dan pengerjaan projek dari awal hingga selesai:

| Tahap | Aktivitas Utama | Output / Hasil | Tanggal |
|:---:|---|---|:---:|
| **1** | **Inisiasi & Analisis Kebutuhan** | Dokumen rencana konsep logika proposisi login ($L$) dan pemetaan relasi himpunan peran. | 12 Juni 2026 |
| **2** | **Desain Basis Data & Skema** | Pembuatan skema tabel basis data SQL (`users`, `login_logs`, `trusted_devices`) dan matrik relasi. | 14 Juni 2026 |
| **3** | **Pembuatan Mesin Logika Biner** | Penulisan fungsi `evaluateBooleanAuth` dan penentuan status kelulusan login di [`mathLogic.js`](file:///c:/Users/Predator/Downloads/MTK%20for%20real%20%285%29/MTK%20for%20real/src/utils/mathLogic.js). | 16 Juni 2026 |
| **4** | **Pengembangan Visualisasi Diagram Venn** | Implementasi file [`VennDiagram.jsx`](file:///c:/Users/Predator/Downloads/MTK%20for%20real%20%285%29/MTK%20for%20real/src/components/VennDiagram.jsx) untuk merender SVG interaktif relasi subset. | 18 Juni 2026 |
| **5** | **Pengembangan Pohon Keputusan Login** | Implementasi komponen pohon biner interaktif SVG pada [`LoginForm.jsx`](file:///c:/Users/Predator/Downloads/MTK%20for%20real%20%285%29/MTK%20for%20real/src/components/LoginForm.jsx). | 19 Juni 2026 |
| **6** | **Implementasi Hashing & Laboratorium** | Penerapan algoritma hashing SHA-256 sinkronus dan rumus kekuatan sandi $S^N$ pada [`crypto.js`](file:///c:/Users/Predator/Downloads/MTK%20for%20real%20%285%29/MTK%20for%20real/src/utils/crypto.js) dan [`CryptoLab.jsx`](file:///c:/Users/Predator/Downloads/MTK%20for%20real%20%285%29/MTK%20for%20real/src/components/CryptoLab.jsx). | 21 Juni 2026 |
| **7** | **Integrasi API & Backend Supabase** | Menghubungkan registrasi akun baru pada [`SignUpForm.jsx`](file:///c:/Users/Predator/Downloads/MTK%20for%20real%20%285%29/MTK%20for%20real/src/components/SignUpForm.jsx) dengan server express dan database cloud Supabase. | 22 Juni 2026 |
| **8** | **Refactoring Kode & Penyederhanaan** | Pembersihan kode XOR statis demi kepatuhan keamanan dan penyederhanaan sintaksis menggunakan struktur kode dasar agar mudah dipelajari. | 23 Juni 2026 |

---

## 📚 Sumber Referensi

Projek ini dikembangkan dengan merujuk pada materi-materi teoretis dan pustaka berikut:

1.  **Buku Teori Utama**:
    *   Rosen, Kenneth H. (2012). *Discrete Mathematics and its Applications* (7th ed.). McGraw-Hill. (Bab 1: Logika dan Bukti; Bab 2: Himpunan dan Fungsi; Bab 6: Kombinatorika).
    *   Stallings, William. (2017). *Cryptography and Network Security: Principles and Practice* (7th ed.). Pearson. (Bab 3: Blok Cipher dan Standar Enkripsi Data).
2.  **Pustaka Dokumentasi Teknologi**:
    *   Dokumentasi Resmi React: [react.dev](https://react.dev)
    *   Dokumentasi Resmi Vite: [vite.dev](https://vite.dev)
    *   Dokumentasi SQL & Row Level Security Supabase: [supabase.com/docs](https://supabase.com/docs)

---

## 🤖 Lampiran Pernyataan Penggunaan Kecerdasan Buatan (AI)

Sesuai dengan **Ketentuan Tambahan Poin 3** pada Aturan Originalitas Projek TI, dengan ini dideklarasikan secara transparan bahwa kelompok kami **menggunakan bantuan AI** (dalam hal ini asisten koding berbasis AI, **Gemini / Antigravity**) selama proses pengerjaan projek dengan batasan sebagai berikut:

*   **Tujuan Penggunaan AI**:
    1.  Membantu melakukan optimalisasi penulisan algoritma matematika hashing SHA-256 versi Javascript murni yang berjalan secara sinkronus.
    2.  Membantu pembuatan koordinat visual dan penyusunan struktur SVG dinamis pada Diagram Venn serta Pohon Keputusan (Decision Tree) interaktif.
    3.  Memberikan panduan dalam melakukan penyederhanaan struktur kode agar lebih modular dan mudah dipelajari sebagai media pembelajaran.
*   **Peran Manusia (Originalitas)**:
    1.  Merancang formula logika proposisional $L = (p \land q \land r) \lor (p \land q \land \neg r \land s)$ yang disesuaikan dengan fitur captcha dan perangkat terpercaya.
    2.  Merancang matriks relasi many-to-many antara user dan peran di dalam sistem.
    3.  Melakukan pengujian pengoperasian dan integrasi antarmuka secara keseluruhan.
