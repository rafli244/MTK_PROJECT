# Panduan Logika, Himpunan, & Kriptografi Sistem Login

Dokumen ini menjelaskan secara mendalam konsep **Matematika Diskrit** (Logika Proposisional, Teori Himpunan, Relasi, Kombinatorika) dan **Kriptografi (XOR & Hashing SHA-256)** yang diimplementasikan pada aplikasi web ini.

---

## 1. Arsitektur & Struktur File
Aplikasi ini dikembangkan menggunakan **React** dan memiliki pembagian tugas kode (separation of concerns) sebagai berikut:

```
src/
├── utils/
│   ├── crypto.js         # Fungsi SHA-256, enkripsi XOR, & kalkulator S^N
│   ├── dummyDb.js        # Himpunan data pengguna (database simulasi dengan hash)
│   └── mathLogic.js      # Mesin logika proposisional evaluasi login
├── components/
│   ├── LoginForm.jsx     # Form login, verifikasi captcha, & sirkuit/pohon keputusan
│   ├── CryptoLab.jsx     # Lab interaktif pembanding SHA-256, XOR, & Kombinatorika S^N
│   ├── VennDiagram.jsx   # Visualisasi grafik SVG dari teori himpunan
│   └── Dashboard.jsx     # Panel setelah login (Admin Control & Portal Dosen)
└── App.jsx               # Komponen utama yang mengatur state & sinkronisasi data
```

---

## 2. Kriptografi & Hashing Password

Sistem ini membandingkan dua pendekatan kriptografi di **Laboratorium Kriptografi**:
1. **Hashing SHA-256 (Standar Industri)**: Metode satu-arah (*one-way*) yang digunakan untuk memverifikasi password di database secara aman.
2. **XOR Cipher (Logika Akademis)**: Metode dua-arah (*symmetric cipher*) dengan kunci $K = 90$ untuk mendemonstrasikan operasi bitwise dan logika biner.

### A. Hashing SHA-256 (One-Way Hashing)
SHA-256 (Secure Hash Algorithm 256-bit) menghasilkan sidik jari digital unik sepanjang 256 bit (64 karakter heksadesimal). Algoritma ini bersifat **satu-arah** (tidak ada kunci dekripsi untuk mengembalikan hash ke bentuk password asli).

* **Alur Perhitungan SHA-256 di Kode (`crypto.js`)**:
  1. **Biner UTF-8**: Mengonversi teks password menjadi deretan bit biner.
  2. **Padding Block 512-bit**: Pesan ditambahkan bit '1' (`10000000`) dan bit '0' agar panjang totalnya kongruen dengan 448 mod 512. Kemudian 64 bit terakhir diisi dengan ukuran panjang bit pesan asli.
  3. **Inisialisasi Register ($H_0 \dots H_7$)**: Nilai register awal diambil dari 32 bit pertama bagian pecahan dari akar kuadrat dari 8 bilangan prima pertama:
     * $H_0 = \text{0x6a09e667} \quad (\sqrt{2})$
     * $H_1 = \text{0xbb67ae85} \quad (\sqrt{3})$
     * $H_2 = \text{0x3c6ef372} \quad (\sqrt{5})$
     * $H_3 = \text{0xa54ff53a} \quad (\sqrt{7})$
     * $H_4 = \text{0x510e527f} \quad (\sqrt{11})$
     * $H_5 = \text{0x9b05688c} \quad (\sqrt{13})$
     * $H_6 = \text{0x1f83d9ab} \quad (\sqrt{17})$
     * $H_7 = \text{0x5be0cd19} \quad (\sqrt{19})$
  4. **Kompresi 64 Putaran**: Blok pesan diproses menggunakan operasi gerbang logika bitwise ($Ch, Maj, \Sigma_0, \Sigma_1$) dan penambahan modular 32-bit sebanyak 64 putaran.
  5. **Output**: Menghasilkan 64 karakter heksadesimal yang dicocokkan dengan database saat login.

### B. Enkripsi XOR Simetris
Digunakan untuk visualisasi akademis di web. Setiap karakter di-XOR secara bitwise dengan kunci desimal **90** (biner: `01011010`).
* **Sifat Involutif**: $(P \oplus K) \oplus K = P$. Enkripsi dan dekripsi menggunakan fungsi biner yang sama secara simetris.

---

## 3. Matematika Kombinatorika Password ($S^N$)

Kombinatorika digunakan untuk mengukur jumlah kemungkinan ruang pencarian (*key space*) yang harus ditebak peretas saat melakukan serangan *Brute Force*.

### A. Rumus Kombinatorika Password
Jika password memiliki panjang **$N$** karakter, dan setiap karakter diambil dari sebuah set (ruang karakter) berukuran **$S$**, maka jumlah total kombinasi password unik yang dapat dibentuk adalah:

$$\text{Total Kombinasi} = S^N$$

### B. Hubungan Set Karakter ($S$)
Ukuran set karakter ($S$) bergantung pada jenis karakter yang diketik oleh pengguna:
* Hanya Angka $\implies \mathbf{S = 10}$
* Huruf Kecil saja $\implies \mathbf{S = 26}$
* Huruf Besar saja $\implies \mathbf{S = 26}$
* Simbol Spesial $\implies \mathbf{S = 32}$

Jika password dicampur (misal mengandung angka, huruf kecil, huruf besar, dan simbol), ukuran set karakter dijumlahkan menjadi **$S = 94$**. Semakin besar nilai $S$ dan panjang $N$, total kombinasi $S^N$ meningkat secara eksponensial.

---

## 4. Teori Himpunan & Matriks Relasi (`dummyDb.js`)

Aplikasi memetakan otorisasi pengguna menggunakan **Teori Himpunan** dan **Matriks Relasi Biner**.

### A. Himpunan dan Notasi
* **$U$ (Himpunan Semesta)**: Seluruh pengguna terdaftar di database.
* **$A$ (Himpunan Admin)**: Himpunan pengguna dengan peran Admin.
* **$D$ (Himpunan Dosen)**: Himpunan pengguna dengan peran Dosen.
* **$A \cap D$ (Irisan)**: Pengguna dengan peran ganda Admin sekaligus Dosen (`budi`).
* **$A \setminus D$ (Selisih)**: Pengguna yang hanya berperan sebagai Admin (`gede`, `anto`).

### B. Matriks Biner Relasi
Relasi Many-to-Many antara pengguna dan perannya digambarkan dalam matriks biner berikut:

$$
M = 
\begin{pmatrix}
1 & 1 \\
0 & 1 \\
0 & 1 \\
1 & 0 \\
1 & 0
\end{pmatrix}
\begin{matrix}
\text{budi} \in A \cap D \\
\text{siti} \in D \setminus A \\
\text{dewi} \in D \setminus A \\
\text{gede} \in A \setminus D \text{ (Akun ditangguhkan)} \\
\text{anto} \in A \setminus D
\end{matrix}
$$

---

## 5. Logika Proposisional Otentikasi (`mathLogic.js`)

Keberhasilan login dihitung berdasarkan parameter lingkungan masuk menggunakan **Aljabar Boolean** dengan formula:

$$L = (p \land q \land r) \lor (p \land q \land \neg r \land s)$$

* **$p$ (Kredensial Benar)**: Username cocok, password hash SHA-256 cocok, dan role yang dipilih sesuai.
* **$q$ (Akun Aktif)**: Status akun `isActive === true`.
* **$r$ (Perangkat Dikenali)**: Kotak centang "Ingat Perangkat Ini" dipilih.
* **$s$ (Captcha Valid)**: Jawaban matematika Captcha bernilai benar.

### A. Tabel Kebenaran (Truth Table) Otentikasi

| Kredensial ($p$) | Akun Aktif ($q$) | Perangkat Dikenal ($r$) | Captcha Valid ($s$) | Term 1 ($p \land q \land r$) | Term 2 ($p \land q \land \neg r \land s$) | Hasil Login ($L$) | Keterangan Status |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **True** | **True** | **True** | *Apapun* | **True** | **False** | **True** | **SUKSES**: Login lewat Perangkat Terpercaya |
| **True** | **True** | **False** | **True** | **False** | **True** | **True** | **SUKSES**: Login lewat Captcha |
| **True** | **True** | **False** | **False** | **False** | **False** | **False** | **GAGAL**: Captcha tidak valid |
| **True** | **False** | *Apapun* | *Apapun* | **False** | **False** | **False** | **GAGAL**: Akun Ditangguhkan ($q = \text{False}$) |
| **False** | *Apapun* | *Apapun* | *Apapun* | **False** | **False** | **False** | **GAGAL**: Kredensial Salah ($p = \text{False}$) |

---

## 6. Pohon Keputusan (Decision Tree) Login

Alur evaluasi logika proposisional di atas divisualisasikan dalam bentuk pohon keputusan interaktif pada formulir login:

```
                        [ INPUT LOGIN ]
                               │
                       Apakah Kredensial Valid? (p)
                         /           \
                     (Ya)             (Tidak)
                       │                 │
             Apakah Akun Aktif? (q)   [ Login Gagal (p = False) ]
               /            \
           (Ya)              (Tidak)
             │                 │
     Ingat Perangkat? (r)    [ Login Gagal (q = False) ]
       /          \
    (Ya)          (Tidak)
     │               │
[ SUKSES ]     Apakah Captcha Valid? (s)
                 /          \
              (Ya)          (Tidak)
               │               │
           [ SUKSES ]      [ Login Gagal (s = False) ]
```

Setiap kali pengguna mengetik kredensial, memilih peran, mencentang checkbox perangkat, dan mengisi Captcha, **jalur pohon keputusan ini akan menyala (highlight) secara dinamis** (Hijau untuk jalur positif/True, Merah untuk jalur negatif/False) sehingga alur evaluasi logika biner dapat dipahami secara visual secara instan.
