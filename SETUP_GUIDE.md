# Panduan Integrasi Supabase untuk Sign Up

## 📋 Ringkasan
Dokumentasi ini menjelaskan cara mengintegrasikan fitur Sign Up dengan database Supabase untuk sistem otentikasi sadar konteks.

---

## 🚀 Langkah-Langkah Setup

### 1️⃣ Setup Project Supabase

**A. Buat Project Supabase**
- Kunjungi https://supabase.com
- Klik "Create a new project"
- Isi nama project dan password
- Tunggu project selesai dibuat

**B. Ambil Credentials**
- Buka "Project Settings" → "API"
- Copy `Project URL` (VITE_SUPABASE_URL)
- Copy `anon public` key (VITE_SUPABASE_ANON_KEY)
- Copy `service_role` key (untuk backend)

---

### 2️⃣ Setup Database

**A. Jalankan SQL Query**
- Buka Supabase Query Editor (SQL Editor)
- Copy semua kode dari file `SUPABASE_SQL_SETUP.sql`
- Paste dan jalankan query

**Hasil yang akan dibuat:**
- ✅ Table `users` (untuk data pengguna)
- ✅ Table `trusted_devices` (untuk remember device)
- ✅ Table `login_logs` (untuk audit)
- ✅ Indexes untuk performance
- ✅ Row Level Security policies

---

### 3️⃣ Setup Frontend (.env.local)

Buat file `.env.local` di root folder project:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:5000
```

---

### 4️⃣ Setup Backend API

**A. Buat folder struktur**
```
project-root/
├── server/
│   ├── index.js (main server file)
│   ├── routes/
│   │   └── auth.js (auth endpoints)
│   └── controllers/
│       └── authController.js (auth logic)
└── .env (backend environment variables)
```

**B. Install dependencies**
```bash
npm install express bcryptjs dotenv cors
npm install --save-dev nodemon
```

**C. Setup .env (backend)**
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=5000
FRONTEND_URL=http://localhost:5173
```

**D. Setup server/index.js**
```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { signup, login } from './controllers/authController.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));
app.use(express.json());

// Routes
app.post('/api/auth/signup', signup);
app.post('/api/auth/login', login);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

**E. Copy kode dari SUPABASE_INTEGRATION_GUIDE.js**
- Copy function `signUp` dan `login` ke file `server/controllers/authController.js`
- Sesuaikan imports dan exports

**F. Jalankan server**
```bash
npm run dev  # atau node server/index.js
```

---

### 5️⃣ Update SignUpForm.jsx

Buka file `src/components/SignUpForm.jsx` dan ubah baris ~115:

**Dari:**
```javascript
const response = await fetch('YOUR_API_URL/auth/signup', {
```

**Menjadi:**
```javascript
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
```

---

### 6️⃣ Update App.jsx

Tambahkan state untuk toggle login/signup:

```javascript
import { useState } from 'react';
import LoginForm from './components/LoginForm.jsx';
import SignUpForm from './components/SignUpForm.jsx';
import Dashboard from './components/Dashboard.jsx';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState('');

  const handleSignUpSuccess = () => {
    setIsSignUpMode(false);
    // Auto switch ke login form
    alert('Pendaftaran berhasil! Silakan login dengan akun Anda.');
  };

  const handleLoginSuccess = (user, role) => {
    setCurrentUser(user);
    setCurrentRole(role);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentRole('');
    setIsSignUpMode(false);
  };

  if (isLoggedIn) {
    return <Dashboard user={currentUser} role={currentRole} onLogout={handleLogout} />;
  }

  return (
    <div>
      {isSignUpMode ? (
        <SignUpForm 
          onSignUpSuccess={handleSignUpSuccess}
          onSwitchToLogin={() => setIsSignUpMode(false)}
        />
      ) : (
        <LoginForm 
          onLoginSuccess={handleLoginSuccess}
          onInputChange={() => {}}
          users={[]}
          onSignUpClick={() => setIsSignUpMode(true)}
        />
      )}
    </div>
  );
}
```

---

### 7️⃣ Update LoginForm.jsx

Tambahkan tombol untuk ke halaman Sign Up. Cari bagian form dan tambahkan:

```javascript
<p className="text-center text-slate-400 mt-6">
  Belum punya akun?{' '}
  <button
    onClick={() => {/* panggil function untuk switch ke signup */}}
    className="text-blue-400 hover:text-blue-300 font-semibold"
  >
    Daftar di sini
  </button>
</p>
```

---

## 🔐 Keamanan

### Password Hashing
- Menggunakan **bcryptjs** dengan salt rounds 10
- Jangan simpan password plaintext di database
- Password di-hash di backend sebelum disimpan

### Row Level Security (RLS)
- Supabase sudah punya RLS policies
- Hanya user yang bisa melihat data mereka sendiri
- Public bisa registrasi

### Environment Variables
- Jangan commit `.env` ke git
- Gunakan `.env.local` untuk development
- Production: setup di platform deployment (Vercel, Netlify, etc)

---

## 📱 Testing

### Test Sign Up
1. Buka aplikasi di browser
2. Klik "Daftar di sini" atau tombol Sign Up
3. Isi form:
   - Username: `testuser1`
   - Nama: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
4. Klik "Buat Akun"
5. Cek Supabase Table `users` apakah data sudah tersimpan

### Test Login
1. Kembali ke halaman Login
2. Masukkan credentials yang baru dibuat:
   - Username: `testuser1`
   - Password: `password123`
3. Pilih Role: `Dosen`
4. Isi Captcha
5. Klik Login

### Lihat Logs
- Buka Supabase Query Editor
- Query: `SELECT * FROM login_logs ORDER BY created_at DESC LIMIT 10;`

---

## 🐛 Troubleshooting

### Error: "Cannot POST /api/auth/signup"
- ❌ Backend tidak running
- ✅ Solusi: Jalankan `npm run dev` di folder server

### Error: "VITE_SUPABASE_URL is undefined"
- ❌ File `.env.local` belum dibuat
- ✅ Solusi: Buat file dan restart dev server

### Error: "Username sudah terdaftar"
- ❌ Username sudah ada di database
- ✅ Solusi: Gunakan username yang berbeda

### Error: "Invalid email"
- ❌ Format email tidak valid
- ✅ Solusi: Gunakan format email yang benar (contoh@email.com)

### Password Hash tidak match
- ❌ Password di-hash dengan berbeda
- ✅ Solusi: Pastikan bcryptjs version sama di server

---

## 📊 Database Schema

### Tabel: users
```
id (UUID) - Primary Key
username (VARCHAR, UNIQUE) - Username unik
email (VARCHAR, UNIQUE) - Email unik
name (VARCHAR) - Nama lengkap
password_hash (VARCHAR) - Password terenkripsi
roles (TEXT[]) - Array roles [Admin, Dosen]
is_active (BOOLEAN) - Status akun
avatar_url (VARCHAR) - URL avatar
created_at (TIMESTAMP) - Waktu buat
updated_at (TIMESTAMP) - Waktu update
```

### Tabel: login_logs
```
id (UUID) - Primary Key
user_id (UUID) - Foreign Key ke users
username (VARCHAR) - Username untuk audit
login_status (VARCHAR) - success/failed_password/failed_inactive/failed_not_found
ip_address (VARCHAR) - IP penyerang
user_agent (TEXT) - Browser info
created_at (TIMESTAMP) - Waktu login
```

### Tabel: trusted_devices
```
id (UUID) - Primary Key
user_id (UUID) - Foreign Key ke users
device_identifier (VARCHAR) - Device ID unik
device_name (VARCHAR) - Nama perangkat
is_active (BOOLEAN) - Status trusted
created_at (TIMESTAMP) - Waktu register
last_used_at (TIMESTAMP) - Terakhir digunakan
```

---

## 📝 Checklist Implementasi

- [ ] Buat project Supabase
- [ ] Copy SUPABASE_URL dan SUPABASE_ANON_KEY
- [ ] Jalankan SQL query dari SUPABASE_SQL_SETUP.sql
- [ ] Buat file .env.local dengan credentials
- [ ] Buat folder server dan file index.js
- [ ] Install dependencies backend
- [ ] Copy kode dari SUPABASE_INTEGRATION_GUIDE.js ke authController.js
- [ ] Update SignUpForm.jsx API URL
- [ ] Update App.jsx dengan state isSignUpMode
- [ ] Tambahkan button Sign Up di LoginForm
- [ ] Test sign up dengan user baru
- [ ] Test login dengan user yang baru dibuat
- [ ] Cek data di Supabase Table
- [ ] Verify password di-hash (bukan plaintext)

---

## 📞 Support

Jika ada error atau pertanyaan:
1. Cek console browser (F12)
2. Cek console server (terminal backend)
3. Cek Supabase logs (Supabase Dashboard → Logs)
4. Pastikan backend dan frontend berjalan

---

## 🎉 Next Steps

Setelah implementasi basic selesai, tambahkan:
- [ ] Email verification
- [ ] Forgot password
- [ ] Update profile
- [ ] Change password
- [ ] 2FA (Two-Factor Authentication)
- [ ] OAuth (Google, GitHub login)

---

**Dibuat untuk Laporan Project - Sistem Otentikasi Sadar Konteks**
