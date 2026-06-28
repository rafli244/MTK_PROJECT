import { sha256 as jsSha256 } from 'js-sha256';

export function toBinary8Bit(num) {
  let binary = num.toString(2);
  while (binary.length < 8) {
    binary = "0" + binary;
  }
  return binary;
}

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
  // =========================================================================
  // ⚠️ LOGIKA MATEMATIKA UTAMA (WAJIB MASUK LAPORAN) ⚠️
  // Rumus Kombinatorika Kekuatan Kunci Sandi:
  // Rumus : Total Kemungkinan Kombinasi = S^N
  // di mana:
  // S = Ukuran ruang set karakter (angka=10, lowercase=26, uppercase=26, simbol=32)
  // N = Panjang karakter password
  // =========================================================================
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

export function sha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }

  let h0 = 1779033703; 
  let h1 = 3144134277; 
  let h2 = 1013904242; 
  let h3 = 2773483578; 
  let h4 = 1359899775; 
  let h5 = 2600822924; 
  let h6 = 528771500;  
  let h7 = 1541459225; 
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c82, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
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

  for (let i = 0; i < words.length; i += 16) {
    let w = [];
    for (let j = 0; j < 64; j++) {
      if (j < 16) {
        w[j] = words[i + j] | 0;
      } else {
        let s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        let s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
      }
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let j = 0; j < 64; j++) {
      let S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      let ch = (e & f) ^ (~e & g);
      let temp1 = (h + S1 + ch + k[j] + w[j]) | 0;
      let S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      let maj = (a & b) ^ (a & c) ^ (b & c);
      let temp2 = (S0 + maj) | 0;

      h = g; g = f; f = e; e = (d + temp1) | 0; d = c; c = b; b = a; a = (temp1 + temp2) | 0;
    }

    h0 = (h0 + a) | 0; h1 = (h1 + b) | 0; h2 = (h2 + c) | 0; h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0; h5 = (h5 + f) | 0; h6 = (h6 + g) | 0; h7 = (h7 + h) | 0;
  }

  let resultHex = "";
  let registers = [h0, h1, h2, h3, h4, h5, h6, h7];
  for (let i = 0; i < registers.length; i++) {
    let regVal = (registers[i] >>> 0).toString(16);
    while (regVal.length < 8) regVal = "0" + regVal;
    resultHex += regVal;
  }
  return resultHex;
}

export function explainSHA256(text) {
  if (!text) return { binaryRaw: "", paddedBinary: "", hInitial: [], hash: "" };
  let binaryParts = [];
  for (let i = 0; i < text.length; i++) {
    binaryParts.push(toBinary8Bit(text.charCodeAt(i)));
  }
  let asciiLength = text.length * 8;
  let msg = text + "\x80";
  while ((msg.length * 8) % 512 !== 448) msg += "\x00";

  let paddedParts = [];
  for (let i = 0; i < msg.length; i++) {
    let byteStr = msg.charCodeAt(i).toString(2);
    while (byteStr.length < 8) byteStr = "0" + byteStr;
    paddedParts.push(i === text.length ? "[10000000]" : byteStr);
    if (i >= 8 && msg.length > 16) {
      paddedParts.push("... (byte padding nol) ...");
      break;
    }
  }

  let lenBin = asciiLength.toString(2);
  while (lenBin.length < 64) lenBin = "0" + lenBin;
  let formattedLen = lenBin.substring(48, 56) + " " + lenBin.substring(56, 64);
  let paddedBinary = paddedParts.join(" ") + " [Panjang: ... " + formattedLen + "]";

  const hInitial = [
    { name: "H0", val: "6a09e667", prime: 2 },
    { name: "H1", val: "bb67ae85", prime: 3 },
    { name: "H2", val: "3c6ef372", prime: 5 },
    { name: "H3", val: "a54ff53a", prime: 7 },
    { name: "H4", val: "510e527f", prime: 11 },
    { name: "H5", val: "9b05688c", prime: 13 },
    { name: "H6", val: "1f83d9ab", prime: 17 },
    { name: "H7", val: "5be0cd19", prime: 19 }
  ];

  return {
    binaryRaw: binaryParts.join(" "),
    paddedBinary: paddedBinary,
    hInitial: hInitial,
    hash: sha256(text)
  };
}

export function sha1(ascii) {
  function leftRotate(value, amount) {
    return (value << amount) | (value >>> (32 - amount));
  }

  var words = [];
  var asciiLength = ascii.length * 8;
  
  ascii += '\x80';
  while (ascii.length % 64 - 56) ascii += '\x00';
  
  for (var i = 0; i < ascii.length; i++) {
    var j = ascii.charCodeAt(i);
    words[i>>2] |= j << ((3 - i)%4)*8;
  }
  words.push(0);
  words.push(asciiLength | 0);

  var h0 = 0x67452301;
  var h1 = 0xEFCDAB89;
  var h2 = 0x98BADCFE;
  var h3 = 0x10325476;
  var h4 = 0xC3D2E1F0;

  for (var i = 0; i < words.length; i += 16) {
    var w = words.slice(i, i + 16);
    for (var j = 16; j < 80; j++) {
      w[j] = leftRotate(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
    }

    var a = h0;
    var b = h1;
    var c = h2;
    var d = h3;
    var e = h4;

    for (var j = 0; j < 80; j++) {
      var f, k;
      if (j < 20) {
        f = (b & c) | (~b & d);
        k = 0x5A827999;
      } else if (j < 40) {
        f = b ^ c ^ d;
        k = 0x6ED9EBA1;
      } else if (j < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8F1BBCDC;
      } else {
        f = b ^ c ^ d;
        k = 0xCA62C1D6;
      }

      var temp = (leftRotate(a, 5) + f + e + w[j] + k) | 0;
      e = d;
      d = c;
      c = leftRotate(b, 30);
      b = a;
      a = temp;
    }

    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
  }

  var resultHex = "";
  var hash = [h0, h1, h2, h3, h4];
  for (var i = 0; i < 5; i++) {
    var regVal = (hash[i] >>> 0).toString(16);
    while (regVal.length < 8) regVal = "0" + regVal;
    resultHex += regVal;
  }
  return resultHex;
}

export function explainSHA1(text) {
  if (!text) return { binaryRaw: "", paddedBinary: "", hInitial: [], hash: "" };
  let binaryParts = [];
  for (let i = 0; i < text.length; i++) {
    binaryParts.push(toBinary8Bit(text.charCodeAt(i)));
  }
  let asciiLength = text.length * 8;
  let msg = text + "\x80";
  while ((msg.length * 8) % 512 !== 448) msg += "\x00";

  let paddedParts = [];
  for (let i = 0; i < msg.length; i++) {
    let byteStr = msg.charCodeAt(i).toString(2);
    while (byteStr.length < 8) byteStr = "0" + byteStr;
    paddedParts.push(i === text.length ? "[10000000]" : byteStr);
    if (i >= 8 && msg.length > 16) {
      paddedParts.push("... (byte padding nol) ...");
      break;
    }
  }

  let lenBin = asciiLength.toString(2);
  while (lenBin.length < 64) lenBin = "0" + lenBin;
  let formattedLen = lenBin.substring(48, 56) + " " + lenBin.substring(56, 64);
  let paddedBinary = paddedParts.join(" ") + " [Panjang: ... " + formattedLen + "]";

  const hInitial = [
    { name: "H0", val: "67452301", label: "Awal A" },
    { name: "H1", val: "efcdab89", label: "Awal B" },
    { name: "H2", val: "98badcfe", label: "Awal C" },
    { name: "H3", val: "10325476", label: "Awal D" },
    { name: "H4", val: "c3d2e1f0", label: "Awal E" }
  ];

  return {
    binaryRaw: binaryParts.join(" "),
    paddedBinary: paddedBinary,
    hInitial: hInitial,
    hash: sha1(text)
  };
}
