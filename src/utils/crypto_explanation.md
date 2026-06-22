# Penjelasan Kode block-by-block `crypto.js`

Dokumen ini menjelaskan secara detail setiap fungsi dan variabel yang ada pada file [`crypto.js`](file:///c:/Users/Predator/Downloads/MTK%20for%20real%20%285%29/MTK%20for%20real/src/utils/crypto.js) menggunakan bahasa pemrograman dasar.

---

## 1. Fungsi Konversi Desimal ke Biner (`toBinary8Bit`)

```javascript
export function toBinary8Bit(num) {
  let binary = num.toString(2);
  while (binary.length < 8) {
    binary = "0" + binary;
  }
  return binary;
}
```

*   **Tujuan**: Mengubah angka desimal biasa (0 - 255) menjadi deretan biner 8-bit yang rapi.
*   **Penjelasan Kode**:
    1.  `num.toString(2)` mengubah angka desimal menjadi string biner.
    2.  Loop `while` memeriksa panjang biner. Jika kurang dari 8 karakter, sistem akan menambahkan karakter `"0"` di depan string hingga panjangnya tepat 8-bit.

---

## 2. Fungsi Analisis Kombinatorika Password (`analyzePasswordCombinations`)

```javascript
export function analyzePasswordCombinations(password) {
  if (!password) {
    return { length: 0, setSize: 0, totalCombinations: 0, hasNumbers: false, hasLowercase: false, hasUppercase: false, hasSymbols: false, crackTimeLabel: "0 detik" };
  }
  let N = password.length;
  let hasNumbers = false, hasLowercase = false, hasUppercase = false, hasSymbols = false;
  for (let i = 0; i < password.length; i++) {
    let char = password.charAt(i);
    if (char >= "0" && char <= "9") hasNumbers = true;
    else if (char >= "a" && char <= "z") hasLowercase = true;
    else if (char >= "A" && char <= "Z") hasUppercase = true;
    else hasSymbols = true;
  }
  let S = (hasNumbers ? 10 : 0) + (hasLowercase ? 26 : 0) + (hasUppercase ? 26 : 0) + (hasSymbols ? 32 : 0);
  let totalCombinations = Math.pow(S, N);
  let seconds = totalCombinations / 10000000000;

  let crackTimeLabel = "Instan (< 1 detik)";
  if (seconds < 0.001) crackTimeLabel = "Instan (< 1 milidetik)";
  else if (seconds < 60) crackTimeLabel = Math.round(seconds) + " detik";
  else if (seconds < 3600) crackTimeLabel = Math.round(seconds / 60) + " menit";
  else if (seconds < 86400) crackTimeLabel = Math.round(seconds / 3600) + " jam";
  else if (seconds < 31536000) crackTimeLabel = Math.round(seconds / 86400) + " hari";
  else if (seconds < 3153600000) crackTimeLabel = Math.round(seconds / 31536000) + " tahun";
  else crackTimeLabel = (seconds / 31536000).toExponential(2) + " tahun";

  return {
    length: N, setSize: S, totalCombinations: totalCombinations,
    hasNumbers: hasNumbers, hasLowercase: hasLowercase, hasUppercase: hasUppercase, hasSymbols: hasSymbols,
    crackTimeLabel: crackTimeLabel
  };
}
```

*   **Tujuan**: Menganalisis kekuatan kata sandi menggunakan rumus teori kombinatorika matematika $S^N$.
*   **Penjelasan Kode**:
    1.  `N` menyimpan panjang karakter kata sandi.
    2.  Loop `for` menyusuri setiap huruf untuk mendeteksi jenis karakter (angka, huruf kecil, huruf besar, simbol).
    3.  `S` dijumlahkan berdasarkan jenis karakter yang ditemukan.
    4.  `Math.pow(S, N)` menghitung total kemungkinan kombinasi ($S^N$).
    5.  `seconds` menghitung durasi brute force dalam detik dengan asumsi GPU superkomputer dapat mencoba 10 miliar ($10^{10}$) kombinasi per detik.
    6.  Kondisi `if-else` mengonversi nilai detik mentah menjadi satuan waktu yang mudah dibaca.

---

## 3. Fungsi Algoritma Hash SHA-256 (`sha256`)

```javascript
export function sha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  // Register nilai awal H0 - H7 ditulis dalam bilangan desimal murni
  let h0 = 1779033703; // setara 0x6a09e667
  let h1 = 3144134277; // setara 0xbb67ae85
  let h2 = 1013904242; // setara 0x3c6ef372
  let h3 = 2773483578; // setara 0xa54ff53a
  let h4 = 1359899775; // setara 0x510e527f
  let h5 = 2600822924; // setara 0x9b05688c
  let h6 = 528771500;  // setara 0x1f83d9ab
  let h7 = 1541459225; // setara 0x5be0cd19
  const k = [
    // 64 Konstanta heksadesimal 32-bit
    0x428a2f98, 0x71374491, ...
  ];

  let msg = ascii + "\x80";
  let asciiLength = ascii.length * 8;
  while ((msg.length * 8) % 512 !== 448) msg += "\x00";

  let words = [];
  for (let i = 0; i < msg.length; i++) {
    let wordIndex = i >> 2;
    if (words[wordIndex] === undefined) words[wordIndex] = 0;
    words[wordIndex] |= msg.charCodeAt(i) << (24 - (i % 4) * 8);
  }
  words.push((asciiLength / Math.pow(2, 32)) | 0, asciiLength | 0);

  // Pemrosesan blok 512-bit
  ...
```

*   **Tujuan**: Mengubah teks sandi asli menjadi nilai hash SHA-256 sepanjang 64 karakter heksadesimal secara searah (one-way).
*   **Penjelasan Pemrosesan Dasar**:
    1.  **Rotasi Bit (`rightRotate`)**: Fungsi internal untuk menggeser bit ke kanan secara sirkuler. Berguna untuk mengacak bit pada proses kompresi.
    2.  **Inisialisasi Register (`h0` - `h7`)**: Nilai awal berupa konstanta pecahan akar kuadrat 8 bilangan prima pertama.
    3.  **Konstanta Putaran (`k`)**: 64 bilangan bulat 32-bit yang diambil dari pecahan akar pangkat tiga 64 bilangan prima pertama.
    4.  **Padding Bit**:
        *   Teks asli (`ascii`) ditambahkan karakter `"\x80"`.
        *   Loop `while` menambahkan byte kosong `"\x00"` agar panjang pesan dalam bit kongruen dengan $448 \pmod{512}$.
    5.  **Konversi ke Words**: Sekelompok 4 byte (32 bit) digabungkan menjadi satu angka biner 32-bit (`words[wordIndex]`).
    6.  **Penggabungan Panjang**: Panjang pesan asli (dalam bit) ditambahkan di 64 bit terakhir blok.
    7.  **Kompresi Blok**:
        *   Untuk setiap blok 512-bit, dilakukan kompresi sebanyak 64 putaran menggunakan gerban logika biner (`AND`, `XOR`, `NOT`, dll).
        *   Nilai register `h0` - `h7` diupdate secara kumulatif pada akhir setiap kompresi blok.
    8.  **Output**: Mengubah nilai register desimal ke bentuk string heksadesimal 8 karakter dan menggabungkan kedelapan register menjadi satu string hash sepanjang 64 karakter.

---

## 4. Fungsi Visualisasi Hashing SHA-256 (`explainSHA256`)

*   **Tujuan**: Mensimulasikan dan menghasilkan visualisasi penambahan padding serta register awal untuk ditampilkan pada modul laboratorium kriptografi web.
*   **Penjelasan Kode**:
    1.  `binaryRaw` dibentuk dengan mengubah setiap huruf input langsung menjadi representasi biner 8-bit.
    2.  `paddedParts` mensimulasikan padding di mana indeks ke-`text.length` ditandai khusus dengan teks `"[10000000]"` untuk menandai bit padding pertama.
    3.  Tampilan padding biner dibatasi hingga 8 byte awal demi kerapian antarmuka UI.
    4.  Panjang bit pesan asli diubah ke string biner 64-bit dan diambil 16-bit terakhirnya untuk dicetak di akhir string.
    5.  Menyertakan konstanta register awal dan memanggil `sha256(text)` untuk memproses hash finalnya.
