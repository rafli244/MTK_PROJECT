# Analisis Komprehensif: Sistem Otentikasi Sadar Konteks (Context-Aware Authentication)
*Dibuat oleh: Pengembang Frontend Senior & Analis Keamanan*

Laporan ini menyajikan analisis mendalam terhadap basis kode **Sistem Otentikasi Sadar Konteks** berbasis React dan Kriptografi XOR. Analisis dibagi menjadi 5 bagian sesuai dengan kebutuhan evaluasi sistem.

---

## 1. Audit Logika Keamanan (Guard Clauses)

### A. Evaluasi Kesesuaian Rumus Formal
Rumus formal logika otentikasi kontekstual yang dideklarasikan adalah:
$$L = (p \land q \land r) \lor (p \land q \land \neg r \land s)$$

Mari kita lakukan penyederhanaan menggunakan Hukum Aljabar Boolean (Himpunan & Logika Proposisi):
1. **Faktorisasi (Hukum Distributif):**
   $$L = (p \land q) \land (r \lor (\neg r \land s))$$
2. **Penyederhanaan Term Kedua (Hukum Distributif / Eliminasi):**
   $$r \lor (\neg r \land s) \equiv (r \lor \neg r) \land (r \lor s)$$
   Karena $(r \lor \neg r) \equiv \text{True}$ (Hukum Komplemen), maka:
   $$\text{True} \land (r \lor s) \equiv r \lor s$$
3. **Hasil Penyederhanaan Logika (SOP Terkoneksi):**
   $$L = p \land q \land (r \lor s)$$

**Kesimpulan Audit Rumus:** 
Fungsi `getAuthStatus` pada [mathLogic.js](file:///c:/Users/Predator/Downloads/MTK%20for%20real%20%285%29/MTK%20for%20real/src/utils/mathLogic.js#L73-L119) secara fungsional **100% ekuivalen** dengan rumus formal di atas. Evaluasi berurutan pada kode:
* Menolak jika $\neg p$ (kredensial/role salah).
* Menolak jika $\neg q$ (akun tidak aktif).
* Menerima jika $r$ (perangkat dikenal).
* Menerima jika $s$ (captcha benar).
* Menolak jika keduanya ($\neg r \land \neg s$) salah.

Secara tidak langsung, kode tersebut mengeksekusi logika yang telah disederhanakan: $p \land q \land (r \lor s)$.

### B. Celah Logika (Loophole) & Redundansi Asinkronus
1. **Parameter `L` Tidak Digunakan (Decoupling):**
   Fungsi `getAuthStatus` menerima parameter `L` (hasil evaluasi dari `evaluateBooleanAuth` pada [mathLogic.js:L24-L38](file:///c:/Users/Predator/Downloads/MTK%20for%20real%20%285%29/MTK%20for%20real/src/utils/mathLogic.js#L24-L38)), namun parameter ini **sama sekali tidak dibaca atau digunakan** di dalam tubuh fungsi tersebut. Status akhir ditentukan secara manual menggunakan rangkaian `if-else` baru. 
   > [!WARNING]
   > Ini adalah celah pemeliharaan (*maintenance hazard*). Jika di masa mendatang rumus $L$ pada `evaluateBooleanAuth` diubah, status yang dikembalikan oleh `getAuthStatus` tidak akan sinkron dan berpotensi meloloskan otentikasi yang seharusnya gagal.
   
2. **Race Condition pada State Asinkronus:**
   Pada [LoginForm.jsx:L89-L191](file:///c:/Users/Predator/Downloads/MTK%20for%20real%20%285%29/MTK%20for%20real/src/components/LoginForm.jsx#L89-L191), saat tombol *Submit* ditekan, aplikasi memicu panggilan API asinkronus (`fetch`). Selama proses `fetch` berjalan (*in-flight*), state lokal seperti `rememberDevice` ($r$) atau `captchaInput` ($s$) **tetap dapat diubah oleh user** di antarmuka. 
   Ketika respons API kembali, pengecekan `captchaValid` dilakukan menggunakan state lokal *terbaru* (bukan state saat form dikirimkan). Hal ini dapat dieksploitasi dengan mengirimkan jawaban captcha yang salah lalu dengan cepat menggantinya ke jawaban yang benar sebelum API selesai merespons.

---

## 2. Bedah Implementasi Kriptografi XOR

### A. Penilaian Kerentanan (Vulnerability Assessment) Kunci XOR Statis ($K=90$)
Saat ini, enkripsi kata sandi untuk simulasi lab menggunakan operasi bitwise XOR dengan kunci statis $K = 90$ (`01011010` dalam biner). Pendekatan ini memiliki kerentanan kritis berikut:

1. **Known-Plaintext Attack (KPA):**
   Operasi XOR bersifat involutif ($P \oplus K = C$). Ini berarti penyerang yang mengetahui satu pasang *Plaintext* ($P$) dan *Ciphertext* ($C$) dapat dengan mudah menghitung kunci ($K$) menggunakan operasi:
   $$K = P \oplus C$$
2. **Hardcoded Key di Sisi Klien:**
   Nilai `XOR_KEY = 90` ditulis langsung secara statis di dalam file [crypto.js](file:///c:/Users/Predator/Downloads/MTK%20for%20real%20%285%29/MTK%20for%20real/src/utils/crypto.js#L6). Siapapun yang memiliki akses ke kode JavaScript sisi klien dapat mengekstrak kunci ini dalam hitungan detik.
3. **Penyebaran Karakter Null (Null-Byte Vulnerability):**
   Jika pengguna memasukkan huruf kapital `'Z'` (nilai ASCII = 90), hasil operasi XOR-nya adalah:
   $$90 \oplus 90 = 0 \quad (\text{Karakter Null } \backslash 0)$$
   Karakter null dalam string biner dapat memicu pemotongan string (*string truncation*) pada sistem backend (khususnya jika backend ditulis dalam bahasa tingkat rendah seperti C/C++ atau menggunakan pustaka parsing tertentu), yang berpotensi merusak logika otentikasi.

### B. Solusi: Contoh Implementasi Time-based Key (TBK) & Salt Dinamis
Untuk menjaga performa tetap ringan di sisi klien namun meningkatkan keamanan secara signifikan, kita dapat menggunakan **Time-based Key (TBK)** dengan jendela waktu (misalnya 30 detik) yang dikombinasikan dengan Salt dinamis berbasis username.

Berikut adalah usulan modifikasi kode pada `crypto.js`:

```javascript
import { sha256 } from './crypto.js';

/**
 * Menghasilkan Kunci Dinamis Berbasis Waktu (Time-based Key) dan Salt Dinamis
 * Kunci berubah setiap 30 detik agar kebal terhadap Replay Attacks dan KPA statis.
 * 
 * @param {string} username - Digunakan sebagai salt dinamis unik per pengguna
 * @param {string} sharedSecret - Kunci rahasia bersama (dapat disimpan di env)
 * @returns {number} - Kunci XOR dinamis (1 byte, nilai desimal 1 - 255)
 */
export function getDynamicTimeBasedKey(username, sharedSecret = 'DefaultSecretKey') {
  // Membuat interval waktu 30 detik (seperti algoritma TOTP)
  const timeWindow = Math.floor(Date.now() / 30000);
  
  // Menggabungkan waktu, username (salt), dan rahasia bersama
  const combinedSeed = `${timeWindow}:${username.toLowerCase()}:${sharedSecret}`;
  
  // Melakukan hashing SHA-256 pada seed
  const hash = sha256(combinedSeed);
  
  // Mengambil 2 karakter heksadesimal pertama untuk menghasilkan nilai 1 byte (0-255)
  // Menghindari nilai 0 dengan operator fallback agar tidak menghasilkan karakter Null
  const dynamicKey = parseInt(hash.substring(0, 2), 16) || 109;
  
  return dynamicKey;
}

/**
 * Enkripsi/Dekripsi XOR menggunakan kunci dinamis
 */
export function hashXORDynamic(password, username) {
  if (!password) return '';
  const dynamicKey = getDynamicTimeBasedKey(username);
  
  return password
    .split('')
    .map(char => String.fromCharCode(char.charCodeAt(0) ^ dynamicKey))
    .join('');
}
```

---

## 3. Analisis State Management React

### A. Penanganan Alur Perubahan State
Komponen antarmuka mengelola state untuk input kredensial, role, checkbox perangkat, dan captcha menggunakan React Hooks standar (`useState` dan `useEffect`).
1. **Sinkronisasi Input Sampingan:** Komponen [LoginForm.jsx](file:///c:/Users/Predator/Downloads/MTK%20for%20real%20%285%29/MTK%20for%20real/src/components/LoginForm.jsx) menggunakan properti `onInputChange` untuk mengirimkan state lokal (`username`, `password`, `cipher`) ke komponen induk [App.jsx](file:///c:/Users/Predator/Downloads/MTK%20for%20real%20%285%29/MTK%20for%20real/src/App.jsx). Ini digunakan untuk memperbarui visualisasi diagram Venn dan Lab Kriptografi secara real-time.
2. **Auto-Role Selection:** `useEffect` mendeteksi username secara real-time. Jika username terdaftar di basis data statis, role dropdown akan otomatis dibatasi hanya pada role yang dimiliki oleh user tersebut (`detectedUser.roles`).

### B. Isu Performa & Re-render Berlebihan (Bottleneck)
Implementasi saat ini memiliki **masalah performa serius** terkait re-render. 

Pada [LoginForm.jsx:L194](file:///c:/Users/Predator/Downloads/MTK%20for%20real%20%285%29/MTK%20for%20real/src/components/LoginForm.jsx#L194):
```javascript
const pVal = detectedUser ? authenticateUser(username, password, selectedRole, rememberDevice, captchaValid, users).variables.p : false;
```
Fungsi `authenticateUser` dipanggil secara langsung di dalam badan komponen (dieksekusi pada **setiap render**). Di dalam `authenticateUser` (pada [mathLogic.js:L52](file:///c:/Users/Predator/Downloads/MTK%20for%20real%20%285%29/MTK%20for%20real/src/utils/mathLogic.js#L52)), dilakukan hashing SHA-256 sinkronus terhadap kata sandi:
```javascript
const passwordValid = !!user && sha256(password) === user.passwordCipher;
```

> [!CAUTION]
> **Dampak Bottleneck Kritis:**
> Setiap kali pengguna mengetik satu karakter pada field Username, Password, atau Captcha, state lokal berubah, memicu render ulang komponen. Render ulang ini memaksa fungsi `sha256(password)` berjalan kembali secara sinkronus pada utas utama (*main thread*). 
> Jika password yang dimasukkan cukup panjang, pengetikan akan terasa sangat lambat (lag) karena CPU terbebani oleh komputasi hashing yang berulang-ulang tanpa memori (*no caching*).

### C. Rekomendasi Optimasi State
1. **Memoize Password Hashing:** 
   Gunakan `useMemo` untuk melakukan kalkulasi hash SHA-256 hanya ketika variabel `password` benar-benar berubah, bukan pada setiap perubahan input captcha atau username.
2. **Debounce / Tunda Sinkronisasi:**
   Penyampaian data input ke visualizer sampingan (`onInputChange`) sebaiknya didebounce sekitar 200-300ms agar visualizer tidak ter-render ulang pada setiap ketukan tombol keyboard.

---

## 4. Skenario Pengujian Edge-Case

Untuk memastikan keandalan sistem otentikasi kontekstual, berikut adalah 5 skenario pengujian ekstrem di luar skenario standar:

| No | Nama Skenario | Deskripsi Detail Uji | Ekspektasi Hasil & Mitigasi |
|:--:|---|---|---|
| 1 | **Null Byte Injection (`\0`)** | Mengirimkan username atau password yang berisi karakter null byte (`"budi\0"` atau `"budi123\0"`). | **Hasil:** Karakter null dapat merusak konversi biner dan enkripsi XOR. <br>**Mitigasi:** Bersihkan input menggunakan regex (`input.replace(/\0/g, '')`) sebelum diproses. |
| 2 | **Unicode / Emoji Password** | Menggunakan emoji atau karakter non-ASCII (seperti `“P@$$w0rd🔒”` atau `“汉字”`) dalam password. | **Hasil:** `charCodeAt(0)` akan mengembalikan nilai > 255. Operasi XOR `value ^ 90` akan meluap (overflow) dari batas 8-bit. Formatting Hex pad 2-digit (`stringToHex`) akan menampilkan kelompok karakter tidak rata.<br>**Mitigasi:** Lakukan encoding UTF-8 byte array sebelum XOR atau gunakan enkripsi berbasis standar (seperti Crypto API bawaan). |
| 3 | **State Manipulation via DevTools** | Pengguna membuka React Developer Tools dan memaksa mengubah state `rememberDevice` ($r$) menjadi `true` meskipun checkbox tidak dicentang, atau membajak variabel `L_val` menjadi `true`. | **Hasil:** Di sisi klien, visual sirkuit logika akan menyala hijau dan mengizinkan transisi UI.<br>**Mitigasi:** Selalu lakukan validasi ulang kondisi logika $L$ di sisi backend (server-side) dan jangan pernah memercayai status otentikasi dari state frontend. |
| 4 | **Asynchronous Suspension Race** | Pengguna sedang berada di form login dengan username `gede` (status mula-mula aktif). Admin menonaktifkan akun `gede` ($q$ menjadi `false`) di sesi lain. Pengguna menenang tombol "Sign In" sebelum client sempat menyinkronkan data user terbaru. | **Hasil:** API backend harus memvalidasi status terbaru secara real-time di database sebelum mengevaluasi formula Boolean $L$.<br>**Mitigasi:** Database checking bersifat *strict snapshot* pada saat request masuk. |
| 5 | **Password DoS (Denial of Service) Sisi Klien** | Memasukkan kata sandi acak dengan panjang 5.000+ karakter ke dalam input password. | **Hasil:** Tab browser akan membeku (freeze) beberapa detik karena pure JS SHA-256 mengeksekusi puluhan ribu putaran kompresi biner secara sinkronus pada main thread.<br>**Mitigasi:** Batasi panjang maksimal kata sandi pada elemen input (misalnya `maxLength={64}`). |

---

## 5. Rekomendasi Refactoring Kode

Untuk meningkatkan kebersihan kode (*clean code*) dan efisiensi matematis dalam menghitung relasi *Many-to-Many* peran pengguna (Admin dan Dosen), kita dapat mengganti logika kondisional `includes` yang berulang dengan representasi **Bitwise Masking** (Matriks Relasi Biner).

### Pendekatan Refactoring: Bitwise Role Relation

Dengan memetakan peran ke dalam nilai biner:
* **Admin** = `1` (biner `01`)
* **Dosen** = `2` (biner `10`)
* **Admin ∩ Dosen** = `3` (biner `11`)

Kita dapat menyederhanakan pengecekan set relasi menjadi operasi aritmetika bitwise yang sangat cepat dan elegan.

#### Contoh Refactoring pada `dummyDb.js` atau Komponen Dashboard:

```javascript
// 1. Definisikan Bit Mask Peran
export const ROLE_MASK = {
  NONE: 0,        // Biner: 00
  ADMIN: 1 << 0,  // Biner: 01 (Desimal: 1)
  DOSEN: 1 << 1,  // Biner: 10 (Desimal: 2)
};

// 2. Mapping Teks Role ke Bitmask
const ROLE_VALUE_MAP = {
  'Admin': ROLE_MASK.ADMIN,
  'Dosen': ROLE_MASK.DOSEN
};

/**
 * Mengonversi array peran pengguna menjadi nilai representasi matriks biner
 * @param {string[]} roles - Array peran (misal: ['Admin', 'Dosen'])
 * @returns {number} - Nilai bitmask relasi
 */
export const getUserRoleBitmask = (roles = []) => {
  return roles.reduce((mask, role) => mask | (ROLE_VALUE_MAP[role] || 0), 0);
};

/**
 * Menentukan Label Himpunan Berdasarkan Nilai Matriks Peran (Bitmask)
 * Menyederhanakan getSetLabel() dengan struktur pemetaan langsung (O(1) complexity)
 * 
 * @param {object} user - Objek Pengguna
 * @returns {string} - Label formal Teori Himpunan
 */
export const getSetLabelRefactored = (user) => {
  if (!user || !user.roles) return 'U';
  
  const mask = getUserRoleBitmask(user.roles);
  
  // Kamus Pemetaan Matriks Relasi ke Label
  const relationLabels = {
    [ROLE_MASK.ADMIN | ROLE_MASK.DOSEN]: 'A ∩ D (Admin & Dosen)', // Nilai 3
    [ROLE_MASK.ADMIN]: 'A \\ D (Admin Only)',                    // Nilai 1
    [ROLE_MASK.DOSEN]: 'D \\ A (Dosen Only)',                    // Nilai 2
  };

  return relationLabels[mask] || 'U';
};

/**
 * Helper untuk mengecek otorisasi peran menggunakan bitwise AND
 */
export const hasAccess = (userRoles, requiredRoleMask) => {
  const userMask = getUserRoleBitmask(userRoles);
  return (userMask & requiredRoleMask) !== 0;
};
```

### Keuntungan Refactoring Ini:
1. **Kesesuaian Konseptual:** Kode mencerminkan konsep Matriks Relasi Biner Matematika Diskrit secara langsung di level bitwise.
2. **Kinerja Tinggi:** Menghilangkan pencarian substring/array menggunakan `.includes()` yang memakan waktu jika array peran berukuran besar. Operasi bitwise dijalankan dalam 1 siklus CPU.
3. **Skalabilitas:** Jika di masa depan ditambahkan peran baru (misal: `Mahasiswa` = `4` / `100` biner), kita hanya perlu menambahkan entri bitmask baru tanpa merusak struktur logika `if-else` yang ada.
