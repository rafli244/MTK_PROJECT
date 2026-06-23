import PptxGenJS from 'pptxgenjs';

function testExport() {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';

  const COLOR_BG = 'E5F2C9';
  const COLOR_CARD = 'FFFFFF';
  const COLOR_PRIMARY = '7F534B';
  const COLOR_SECONDARY = '8C705F';
  const COLOR_HEADING = '1F0318';
  const COLOR_TEXT = '1E1A1D';

  // Slide 1
  {
    const slide = pptx.addSlide();
    slide.background = { fill: COLOR_BG };
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: 0.5, w: 9.0, h: 4.625,
      fill: { color: COLOR_CARD },
      line: { color: COLOR_SECONDARY, width: 2 }
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.5, y: 0.5, w: 9.0, h: 0.1,
      fill: { color: COLOR_PRIMARY }
    });
    slide.addText("STUDI KASUS MATEMATIKA DISKRIT", {
      x: 0.8, y: 1.0, w: 8.4, h: 0.3,
      fontSize: 11, fontFace: 'Trebuchet MS', color: COLOR_PRIMARY, bold: true
    });
    slide.addText("Sistem Autentikasi Berbasis React\ndan Kriptografi XOR", {
      x: 0.8, y: 1.4, w: 8.4, h: 1.4,
      fontSize: 32, fontFace: 'Trebuchet MS', color: COLOR_HEADING, bold: true
    });
    slide.addText("Media Pembelajaran Logika Proposisional, Teori Himpunan, Relasi Biner & Hashing SHA-256", {
      x: 0.8, y: 2.9, w: 8.4, h: 0.5,
      fontSize: 14, fontFace: 'Arial', color: COLOR_SECONDARY, italic: true
    });
    slide.addText("Oleh Kelompok:", {
      x: 0.8, y: 3.6, w: 8.4, h: 0.25,
      fontSize: 10, fontFace: 'Arial', color: COLOR_SECONDARY, bold: true
    });
    slide.addText("1. M Risqullah Naufal  |  2. Lingzhi  |  3. Rafli Hanafi  |  4. Victor", {
      x: 0.8, y: 3.9, w: 8.4, h: 0.3,
      fontSize: 12, fontFace: 'Arial', color: COLOR_TEXT, bold: true
    });
    slide.addText("Program Studi Teknik Informatika - Politeknik Caltex Riau  |  TA 2025/2026", {
      x: 0.8, y: 4.5, w: 8.4, h: 0.3,
      fontSize: 10, fontFace: 'Arial', color: COLOR_SECONDARY
    });
  }

  function createBaseSlide(category, title) {
    const slide = pptx.addSlide();
    slide.background = { fill: COLOR_BG };
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.4, y: 0.4, w: 9.2, h: 4.825,
      fill: { color: COLOR_CARD },
      line: { color: 'E2E8F0', width: 1 }
    });
    slide.addText(category, {
      x: 0.6, y: 0.6, w: 5.0, h: 0.25,
      fontSize: 9, fontFace: 'Trebuchet MS', color: COLOR_PRIMARY, bold: true
    });
    slide.addText(title, {
      x: 0.6, y: 0.85, w: 7.0, h: 0.5,
      fontSize: 20, fontFace: 'Trebuchet MS', color: COLOR_HEADING, bold: true
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.4, y: 0.4, w: 0.08, h: 4.825,
      fill: { color: COLOR_PRIMARY }
    });
    slide.addText("MathSecure - Sistem Autentikasi Kontekstual", {
      x: 0.6, y: 4.95, w: 6.0, h: 0.2,
      fontSize: 8, fontFace: 'Arial', color: COLOR_SECONDARY
    });
    return slide;
  }

  // Slide 2
  {
    const slide = createBaseSlide("BAB I - PENDAHULUAN", "Latar Belakang & Rumusan Masalah");
    slide.addText("Latar Belakang Proyek", {
      x: 0.7, y: 1.5, w: 4.0, h: 0.3,
      fontSize: 14, fontFace: 'Trebuchet MS', color: COLOR_PRIMARY, bold: true
    });
    slide.addText(
      "• Pentingnya aspek keamanan siber pada sistem otentikasi akun web modern.\n" +
      "• Konsep dasar pendukung keamanan (Logika Proposisional, Himpunan, Relasi) sering diajarkan secara sangat teoritis di perkuliahan.\n" +
      "• Kebutuhan media simulasi interaktif agar mahasiswa dapat memanipulasi parameter boolean/matriks secara praktis dan visual.",
      {
        x: 0.7, y: 1.9, w: 4.1, h: 2.8,
        fontSize: 11, fontFace: 'Arial', color: COLOR_TEXT, lineSpacing: 22
      }
    );
    slide.addShape(pptx.ShapeType.rect, {
      x: 5.1, y: 1.5, w: 4.2, h: 3.3,
      fill: { color: 'FAF8F5' },
      line: { color: 'E2D9D2', width: 1 }
    });
    slide.addText("Rumusan Masalah Utama", {
      x: 5.3, y: 1.7, w: 3.8, h: 0.3,
      fontSize: 14, fontFace: 'Trebuchet MS', color: COLOR_HEADING, bold: true
    });
    slide.addText(
      "1. Bagaimana memodelkan otentikasi login berdasarkan parameter lingkungan menggunakan Aljabar Boolean?\n\n" +
      "2. Bagaimana memetakan hak otorisasi pengguna (Admin & Dosen) secara visual melalui Diagram Venn?\n\n" +
      "3. Bagaimana memetakan relasi peran pengguna dalam bentuk representasi biner matriks?\n\n" +
      "4. Bagaimana memperlihatkan tahapan enkripsi bitwise XOR dan hash SHA-256?",
      {
        x: 5.3, y: 2.1, w: 3.8, h: 2.6,
        fontSize: 10, fontFace: 'Arial', color: COLOR_TEXT, lineSpacing: 18
      }
    );
  }

  // Slide 3
  {
    const slide = createBaseSlide("BAB I - PENDAHULUAN", "Tujuan & Manfaat Proyek");
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.7, y: 1.6, w: 4.1, h: 3.1,
      fill: { color: 'FFFFFF' },
      line: { color: COLOR_PRIMARY, width: 1.5 }
    });
    slide.addText("Tujuan Penelitian", {
      x: 0.9, y: 1.8, w: 3.7, h: 0.3,
      fontSize: 14, fontFace: 'Trebuchet MS', color: COLOR_PRIMARY, bold: true
    });
    slide.addText(
      "• Menerapkan ekspresi logika proposisional pada evaluasi login web.\n" +
      "• Membuat modul pembelajaran interaktif berupa visualisasi Diagram Venn untuk materi Teori Himpunan.\n" +
      "• Membangun representasi matriks relasi user-role biner.\n" +
      "• Menguji modul simulator bitwise XOR dan enkripsi SHA-256.",
      {
        x: 0.9, y: 2.2, w: 3.7, h: 2.3,
        fontSize: 11, fontFace: 'Arial', color: COLOR_TEXT, lineSpacing: 22
      }
    );
    slide.addShape(pptx.ShapeType.rect, {
      x: 5.1, y: 1.6, w: 4.1, h: 3.1,
      fill: { color: 'FFFFFF' },
      line: { color: COLOR_SECONDARY, width: 1.5 }
    });
    slide.addText("Manfaat Yang Dihasilkan", {
      x: 5.3, y: 1.8, w: 3.7, h: 0.3,
      fontSize: 14, fontFace: 'Trebuchet MS', color: COLOR_SECONDARY, bold: true
    });
    slide.addText(
      "• Bagi Akademik: Menyediakan perangkat ajar visual interaktif untuk mempermudah pemahaman Logika Diskrit bagi mahasiswa IT.\n" +
      "• Bagi Pengembang: Membuka wawasan implementasi otentikasi berbasis context-aware untuk meningkatkan keamanan aplikasi tanpa merusak UX login pengguna terpercaya.",
      {
        x: 5.3, y: 2.2, w: 3.7, h: 2.3,
        fontSize: 11, fontFace: 'Arial', color: COLOR_TEXT, lineSpacing: 22
      }
    );
  }

  // Slide 4
  {
    const slide = createBaseSlide("BAB II & IV - LOGIKA MATEMATIKA", "Logika Proposisional Otentikasi");
    slide.addText("Dalam merancang evaluasi keamanan login, didefinisikan 4 proposisi biner berikut:", {
      x: 0.7, y: 1.5, w: 8.5, h: 0.3,
      fontSize: 11, fontFace: 'Arial', color: COLOR_TEXT
    });
    const vars = [
      { tag: "p (Kredensial)", desc: "Username, password, dan pilihan role sesuai database." },
      { tag: "q (Akun Aktif)", desc: "Status akun tidak dinonaktifkan / ditangguhkan." },
      { tag: "r (Perangkat)", desc: "Perangkat terdaftar ('Remember Device' aktif)." },
      { tag: "s (Captcha)", desc: "Pengguna berhasil memasukkan Captcha matematika." }
    ];
    vars.forEach((v, idx) => {
      const xPos = 0.7 + (idx * 2.1);
      slide.addShape(pptx.ShapeType.rect, {
        x: xPos, y: 1.9, w: 1.9, h: 1.6,
        fill: { color: 'FAF8F5' },
        line: { color: 'E2D9D2', width: 1 }
      });
      slide.addText(v.tag, {
        x: xPos + 0.1, y: 2.0, w: 1.7, h: 0.3,
        fontSize: 12, fontFace: 'Trebuchet MS', color: COLOR_PRIMARY, bold: true
      });
      slide.addText(v.desc, {
        x: xPos + 0.1, y: 2.4, w: 1.7, h: 1.0,
        fontSize: 10, fontFace: 'Arial', color: COLOR_TEXT
      });
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.7, y: 3.7, w: 8.2, h: 1.1,
      fill: { color: 'FAF8F5' },
      line: { color: COLOR_PRIMARY, width: 1 }
    });
    slide.addText("FORMULA ALJABAR BOOLEAN (L = KELAYAKAN LOGIN)", {
      x: 0.9, y: 3.8, w: 7.8, h: 0.25,
      fontSize: 9, fontFace: 'Trebuchet MS', color: COLOR_SECONDARY, bold: true
    });
    slide.addText("L = (p ∧ q ∧ r) ∨ (p ∧ q ∧ ¬r ∧ s)", {
      x: 0.9, y: 4.1, w: 7.8, h: 0.4,
      fontSize: 18, fontFace: 'Courier New', color: COLOR_HEADING, bold: true
    });
    slide.addText("*Login sukses jika kredensial valid (p) dan akun aktif (q), SERTA (perangkat dikenal (r) ATAU captcha valid (s)).", {
      x: 0.9, y: 4.5, w: 7.8, h: 0.2,
      fontSize: 8, fontFace: 'Arial', color: COLOR_SECONDARY, italic: true
    });
  }

  // Slide 5
  {
    const slide = createBaseSlide("BAB IV - PEMBAHASAN", "Tabel Kebenaran Otentikasi");
    slide.addText("Evaluasi kombinasi logika proposisi login:", {
      x: 0.7, y: 1.4, w: 8.5, h: 0.3,
      fontSize: 11, fontFace: 'Arial', color: COLOR_TEXT
    });
    const rows = [
      ["p", "q", "r", "s", "p ∧ q ∧ r", "p ∧ q ∧ ¬r ∧ s", "Hasil (L)", "Kasus Status"],
      ["True", "True", "True", "Apapun", "True", "False", "True", "SUKSES: Login di Perangkat Terpercaya"],
      ["True", "True", "False", "True", "False", "True", "True", "SUKSES: Login lewat Verifikasi Captcha"],
      ["True", "True", "False", "False", "False", "False", "False", "GAGAL: Captcha tidak cocok"],
      ["True", "False", "Apapun", "Apapun", "False", "False", "False", "GAGAL: Akun sedang ditangguhkan"],
      ["False", "Apapun", "Apapun", "Apapun", "False", "False", "False", "GAGAL: Kredensial Salah / Tidak Valid"]
    ];
    slide.addTable(rows, {
      x: 0.7, y: 1.8, w: 8.2, h: 3.0,
      border: { pt: 1, color: 'D4DCC2' },
      fill: 'FFFFFF',
      fontSize: 9,
      fontFace: 'Arial',
      align: 'center',
      valign: 'middle',
      colW: [0.6, 0.6, 0.6, 0.8, 1.2, 1.4, 0.8, 2.2],
    });
  }

  // Slide 6
  {
    const slide = createBaseSlide("BAB IV - PEMBAHASAN", "Pohon Keputusan (Decision Tree) Login");
    slide.addText("Logika Alur Pengambilan Keputusan", {
      x: 0.7, y: 1.5, w: 4.2, h: 0.3,
      fontSize: 14, fontFace: 'Trebuchet MS', color: COLOR_PRIMARY, bold: true
    });
    slide.addText(
      "• Pohon keputusan membantu menyederhanakan rangkaian percabangan boolean rumit menjadi alur sekuensial yang mudah diikuti.\n\n" +
      "• Dalam modul web, alur ini dihubungkan langsung ke state input pengguna, sehingga node pohon akan berubah warna secara real-time berdasarkan input.\n\n" +
      "• Membantu melatih intuisi logika mahasiswa tentang signifikansi gerbang logika AND (&and;) dan OR (&or;).",
      {
        x: 0.7, y: 1.9, w: 4.2, h: 2.8,
        fontSize: 11, fontFace: 'Arial', color: COLOR_TEXT, lineSpacing: 20
      }
    );
    slide.addShape(pptx.ShapeType.rect, {
      x: 5.2, y: 1.5, w: 4.0, h: 3.3,
      fill: { color: 'FAF8F5' },
      line: { color: 'E2D9D2', width: 1 }
    });
    slide.addText(
      "[INPUT DATA]\n" +
      "       │\n" +
      "  Kredensial Valid? (p)\n" +
      "   ├───(Tidak)───► [LOGIN GAGAL]\n" +
      "   └───(Ya)\n" +
      "         │\n" +
      "    Akun Aktif? (q)\n" +
      "     ├───(Tidak)───► [LOGIN GAGAL]\n" +
      "     └───(Ya)\n" +
      "           │\n" +
      "      Ingat Perangkat? (r)\n" +
      "       ├───(Ya)──────────────► [LOGIN SUKSES]\n" +
      "       └───(Tidak)\n" +
      "             │\n" +
      "        Captcha Valid? (s)\n" +
      "         ├───(Ya)────────────► [LOGIN SUKSES]\n" +
      "         └───(Tidak)──────────► [LOGIN GAGAL]",
      {
        x: 5.3, y: 1.7, w: 3.8, h: 3.0,
        fontSize: 9, fontFace: 'Courier New', color: COLOR_HEADING, bold: true
      }
    );
  }

  // Slide 7
  {
    const slide = createBaseSlide("BAB II & IV - TEORI HIMPUNAN", "Teori Himpunan & Peran Pengguna");
    slide.addText("Otorisasi sistem memetakan pengguna ke dalam himpunan bagian berdasarkan peran:", {
      x: 0.7, y: 1.4, w: 8.5, h: 0.3,
      fontSize: 11, fontFace: 'Arial', color: COLOR_TEXT
    });
    const sets = [
      { name: "Himpunan Semesta (U)", data: "U = { Budi, Siti, Dewi, Gede, Anto }", desc: "Seluruh pengguna terdaftar di basis data." },
      { name: "Himpunan Admin (A)", data: "A = { Budi, Gede, Anto }", desc: "Pengguna dengan tingkat otorisasi Admin." },
      { name: "Himpunan Dosen (D)", data: "D = { Budi, Siti, Dewi }", desc: "Pengguna dengan tingkat otorisasi Dosen." }
    ];
    sets.forEach((s, idx) => {
      const xPos = 0.7 + (idx * 2.8);
      slide.addShape(pptx.ShapeType.rect, {
        x: xPos, y: 1.8, w: 2.6, h: 1.6,
        fill: { color: 'FAF8F5' },
        line: { color: 'E2D9D2', width: 1 }
      });
      slide.addText(s.name, {
        x: xPos + 0.1, y: 1.9, w: 2.4, h: 0.3,
        fontSize: 12, fontFace: 'Trebuchet MS', color: COLOR_PRIMARY, bold: true
      });
      slide.addText(s.data, {
        x: xPos + 0.1, y: 2.3, w: 2.4, h: 0.4,
        fontSize: 10, fontFace: 'Courier New', color: COLOR_HEADING, bold: true
      });
      slide.addText(s.desc, {
        x: xPos + 0.1, y: 2.8, w: 2.4, h: 0.5,
        fontSize: 9, fontFace: 'Arial', color: COLOR_TEXT
      });
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.7, y: 3.6, w: 8.2, h: 1.2,
      fill: { color: 'FAF8F5' },
      line: { color: COLOR_PRIMARY, width: 1 }
    });
    slide.addText("OPERASI HIMPUNAN HASIL PENENTUAN HAK AKSES", {
      x: 0.9, y: 3.7, w: 7.8, h: 0.25,
      fontSize: 9, fontFace: 'Trebuchet MS', color: COLOR_SECONDARY, bold: true
    });
    slide.addText(
      "• Irisan (A ∩ D) = { Budi }\n" +
      "• Selisih (A - D) = { Gede, Anto }\n" +
      "• Selisih (D - A) = { Siti, Dewi }",
      {
        x: 0.9, y: 4.0, w: 7.8, h: 0.7,
        fontSize: 11, fontFace: 'Courier New', color: COLOR_HEADING, bold: true, lineSpacing: 16
      }
    );
  }

  // Slide 8
  {
    const slide = createBaseSlide("BAB IV - PEMBAHASAN", "Visualisasi Diagram Venn");
    slide.addText("Visualisasi Diagram Venn Interaktif", {
      x: 0.7, y: 1.5, w: 4.2, h: 0.3,
      fontSize: 14, fontFace: 'Trebuchet MS', color: COLOR_PRIMARY, bold: true
    });
    slide.addText(
      "• Diagram Venn memvisualisasikan relasi keanggotaan secara grafis menggunakan objek lingkaran SVG.\n\n" +
      "• Area overlap mewakili irisan (A &cap; D), yaitu pengguna dengan hak akses ganda (Budi).\n\n" +
      "• Memudahkan dosen/mahasiswa melihat status database simulasi secara instan tanpa membaca kode SQL database secara langsung.",
      {
        x: 0.7, y: 1.9, w: 4.2, h: 2.8,
        fontSize: 11, fontFace: 'Arial', color: COLOR_TEXT, lineSpacing: 20
      }
    );
    const xCenter = 6.8;
    const yCenter = 2.8;
    slide.addShape(pptx.ShapeType.oval, {
      x: xCenter - 1.2, y: yCenter - 0.9, w: 2.0, h: 2.0,
      fill: { color: '7F534B', transparency: 85 },
      line: { color: '7F534B', width: 2 }
    });
    slide.addText("A", {
      x: xCenter - 1.0, y: yCenter - 1.1, w: 0.4, h: 0.3,
      fontSize: 12, fontFace: 'Trebuchet MS', color: COLOR_PRIMARY, bold: true
    });
    slide.addShape(pptx.ShapeType.oval, {
      x: xCenter - 0.2, y: yCenter - 0.9, w: 2.0, h: 2.0,
      fill: { color: '8C705F', transparency: 85 },
      line: { color: '8C705F', width: 2 }
    });
    slide.addText("D", {
      x: xCenter + 0.8, y: yCenter - 1.1, w: 0.4, h: 0.3,
      fontSize: 12, fontFace: 'Trebuchet MS', color: COLOR_SECONDARY, bold: true
    });
    slide.addText("gede\nanto", {
      x: xCenter - 1.0, y: yCenter - 0.2, w: 0.8, h: 0.6,
      fontSize: 10, fontFace: 'Arial', color: COLOR_TEXT, align: 'center'
    });
    slide.addText("budi", {
      x: xCenter - 0.1, y: yCenter, w: 0.8, h: 0.4,
      fontSize: 11, fontFace: 'Arial', color: COLOR_PRIMARY, bold: true, align: 'center'
    });
    slide.addText("siti\ndewi", {
      x: xCenter + 0.8, y: yCenter - 0.2, w: 0.8, h: 0.6,
      fontSize: 10, fontFace: 'Arial', color: COLOR_TEXT, align: 'center'
    });
  }

  // Slide 9
  {
    const slide = createBaseSlide("BAB II & IV - RELASI MATEMATIKA", "Relasi & Matriks Relasi Biner");
    slide.addText("Relasi Keanggotaan Peran", {
      x: 0.7, y: 1.5, w: 4.2, h: 0.3,
      fontSize: 14, fontFace: 'Trebuchet MS', color: COLOR_PRIMARY, bold: true
    });
    slide.addText(
      "• Relasi biner menghubungkan domain User ke kodomain Role.\n\n" +
      "• Dinyatakan dalam himpunan pasangan terurut:\n" +
      "  R = { (Budi, Admin), (Budi, Dosen), (Siti, Dosen), (Dewi, Dosen), (Gede, Admin), (Anto, Admin) }\n\n" +
      "• Tipe Relasi: One-to-Many. Oleh karena itu relasi ini tidak dapat dikategorikan sebagai fungsi.",
      {
        x: 0.7, y: 1.9, w: 4.2, h: 2.8,
        fontSize: 11, fontFace: 'Arial', color: COLOR_TEXT, lineSpacing: 20
      }
    );
    slide.addShape(pptx.ShapeType.rect, {
      x: 5.2, y: 1.5, w: 4.0, h: 3.3,
      fill: { color: 'FAF8F5' },
      line: { color: 'E2D9D2', width: 1 }
    });
    slide.addText("Representasi Matriks Biner (M)", {
      x: 5.4, y: 1.7, w: 3.6, h: 0.3,
      fontSize: 14, fontFace: 'Trebuchet MS', color: COLOR_HEADING, bold: true
    });
    const matrixRows = [
      ["Pengguna", "Admin", "Dosen"],
      ["Budi", "1", "1"],
      ["Siti", "0", "1"],
      ["Dewi", "0", "1"],
      ["Gede", "1", "0"],
      ["Anto", "1", "0"]
    ];
    slide.addTable(matrixRows, {
      x: 5.4, y: 2.1, w: 3.6, h: 2.4,
      border: { pt: 1, color: 'D4DCC2' },
      fill: 'FFFFFF',
      fontSize: 10,
      fontFace: 'Arial',
      align: 'center',
      valign: 'middle'
    });
  }

  // Slide 10
  {
    const slide = createBaseSlide("BAB II & IV - KRIPTOGRAFI", "Kriptografi: SHA-256 vs XOR Cipher");
    slide.addShape(pptx.ShapeType.rect, {
      x: 0.7, y: 1.5, w: 4.1, h: 3.2,
      fill: { color: 'FFFFFF' },
      line: { color: COLOR_PRIMARY, width: 1.5 }
    });
    slide.addText("1. Hashing SHA-256", {
      x: 0.9, y: 1.7, w: 3.7, h: 0.3,
      fontSize: 14, fontFace: 'Trebuchet MS', color: COLOR_PRIMARY, bold: true
    });
    slide.addText(
      "• Algoritma kriptografi satu-arah (One-way hashing) standar industri.\n" +
      "• Menghasilkan digest sepanjang 256-bit (64 karakter heksadesimal).\n" +
      "• Proses: Penyesuaian panjang pesan (padding), register inisialisasi pecahan akar bilangan prima, pemrosesan kompresi sebanyak 64 putaran.",
      {
        x: 0.9, y: 2.1, w: 3.7, h: 2.4,
        fontSize: 11, fontFace: 'Arial', color: COLOR_TEXT, lineSpacing: 20
      }
    );
    slide.addShape(pptx.ShapeType.rect, {
      x: 5.1, y: 1.5, w: 4.1, h: 3.2,
      fill: { color: 'FFFFFF' },
      line: { color: COLOR_SECONDARY, width: 1.5 }
    });
    slide.addText("2. Enkripsi XOR Simetris", {
      x: 5.3, y: 1.7, w: 3.7, h: 0.3,
      fontSize: 14, fontFace: 'Trebuchet MS', color: COLOR_SECONDARY, bold: true
    });
    slide.addText(
      "• Digunakan untuk visualisasi akademis bitwise biner di laboratorium.\n" +
      "• Setiap karakter di-XOR secara bitwise dengan kunci konstan K = 90 (01011010).\n" +
      "• Sifat involutif: (P &oplus; K) &oplus; K = P. Enkripsi dan dekripsi menggunakan fungsi biner biner simetris yang sama.",
      {
        x: 5.3, y: 2.1, w: 3.7, h: 2.4,
        fontSize: 11, fontFace: 'Arial', color: COLOR_TEXT, lineSpacing: 20
      }
    );
  }

  // Slide 11
  {
    const slide = createBaseSlide("BAB V - HASIL & ANALISIS", "Skenario Pengujian & Hasil");
    slide.addText("Hasil pengujian otentikasi berdasarkan parameter keamanan:", {
      x: 0.7, y: 1.4, w: 8.5, h: 0.3,
      fontSize: 11, fontFace: 'Arial', color: COLOR_TEXT
    });
    const testRows = [
      ["No", "Skenario Pengujian", "Hasil Ekspektasi", "Hasil Aktual", "Status"],
      ["1", "Kredensial Valid, Akun Aktif, Perangkat Terpercaya", "Login Sukses", "Login Sukses", "Sesuai"],
      ["2", "Kredensial Valid, Akun Aktif, Perangkat Asing, Captcha Valid", "Login Sukses", "Login Sukses", "Sesuai"],
      ["3", "Kredensial Tidak Valid", "Login Ditolak", "Login Ditolak", "Sesuai"],
      ["4", "Akun Ditangguhkan / Tidak Aktif", "Login Ditolak", "Login Ditolak", "Sesuai"],
      ["5", "Kredensial Valid, Perangkat Asing, Captcha Salah", "Login Ditolak", "Login Ditolak", "Sesuai"]
    ];
    slide.addTable(testRows, {
      x: 0.7, y: 1.8, w: 8.2, h: 3.0,
      border: { pt: 1, color: 'D4DCC2' },
      fill: 'FFFFFF',
      fontSize: 10,
      fontFace: 'Arial',
      align: 'center',
      valign: 'middle',
      colW: [0.5, 3.7, 1.4, 1.4, 1.2],
    });
  }

  // Slide 12
  {
    const slide = pptx.addSlide();
    slide.background = { fill: COLOR_BG };
    slide.addShape(pptx.ShapeType.rect, {
      x: 1.5, y: 1.0, w: 7.0, h: 3.625,
      fill: { color: COLOR_CARD },
      line: { color: COLOR_PRIMARY, width: 2 }
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: 1.5, y: 1.0, w: 7.0, h: 0.12,
      fill: { color: COLOR_PRIMARY }
    });
    slide.addText("KESIMPULAN PROYEK", {
      x: 2.0, y: 1.4, w: 6.0, h: 0.3,
      fontSize: 14, fontFace: 'Trebuchet MS', color: COLOR_PRIMARY, bold: true, align: 'center'
    });
    slide.addText(
      "1. Aplikasi MathSecure berhasil menjembatani teori matematika diskrit abstrak (Logika, Himpunan, Relasi, Kriptografi) dengan implementasi nyata pada web berbasis React.\n\n" +
      "2. Fitur visualisasi interaktif (Venn, Decision Tree, Cryptography Lab) mempermudah proses pemahaman akademis.\n\n" +
      "3. Penerapan Context-Aware Authentication berhasil menyeimbangkan aspek keamanan siber yang kuat dan kemudahan akses bagi pengguna sah.",
      {
        x: 2.0, y: 1.9, w: 6.0, h: 2.2,
        fontSize: 11, fontFace: 'Arial', color: COLOR_TEXT, align: 'left', lineSpacing: 18
      }
    );
    slide.addText("Sekian & Terima Kasih", {
      x: 2.0, y: 4.1, w: 6.0, h: 0.35,
      fontSize: 16, fontFace: 'Trebuchet MS', color: COLOR_HEADING, bold: true, align: 'center'
    });
  }

  pptx.writeFile({ fileName: "MathSecure_Presentasi_Matematika_Diskrit.pptx" })
    .then(() => {
      console.log("PPTX generation success!");
    })
    .catch(err => {
      console.error("PPTX generation error:", err);
    });
}

testExport();
