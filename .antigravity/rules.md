# Developer Philosophy: Minimalist & Pragmatic
- YAGNI (You Ain't Gonna Need It): Jangan tambahkan fitur atau kode kecuali benar-benar diperlukan saat ini.
- Simplicity First: Gunakan solusi paling sederhana yang bisa bekerja. Hindari abstraksi berlebihan (tidak perlu membuat kelas/fungsi jika satu blok kode cukup).
- Readability > Elegance: Kode harus mudah dipahami manusia. Gunakan penamaan variabel yang deskriptif dan komentar hanya jika logika sangat kompleks.
- Dead Code Elimination: Hapus kode, variabel, atau import yang tidak digunakan secara aktif.
- Security-First: Fitur keamanan (Auth, Rate Limiting, Persistence) adalah prioritas mutlak dan tidak boleh dikurangi demi kesederhanaan.