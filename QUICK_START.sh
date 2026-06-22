#!/bin/bash
# ============================================
# QUICK START GUIDE - Sign Up dengan Supabase
# ============================================

# 📋 FILE-FILE YANG SUDAH DIBUAT:

# 1. KOMPONEN FRONTEND:
#    └─ src/components/SignUpForm.jsx
#       ✅ Form registrasi dengan validasi lengkap
#       ✅ Show/hide password
#       ✅ Loading state
#       ✅ Alert messages (success/error)
#       ✅ Switch ke login form

# 2. SETUP DATABASE:
#    └─ SUPABASE_SQL_SETUP.sql
#       ✅ Create table users
#       ✅ Create table trusted_devices
#       ✅ Create table login_logs
#       ✅ Create indexes
#       ✅ Create RLS policies
#       ✅ Insert sample data

# 3. DOKUMENTASI & INTEGRASI:
#    ├─ SETUP_GUIDE.md
#    │  ✅ Panduan lengkap step-by-step
#    │  ✅ Troubleshooting
#    │  ✅ Testing checklist
#    │
#    ├─ SUPABASE_INTEGRATION_GUIDE.js
#    │  ✅ Backend authentication logic
#    │  ✅ Sign up & login functions
#    │  ✅ Express setup example
#    │
#    └─ UPDATE_EXAMPLES.js
#       ✅ Contoh update LoginForm & App.jsx

# 4. BACKEND SERVER EXAMPLE:
#    └─ server-example/
#       ├─ index.js
#       │  ✅ Express server setup
#       │  ✅ CORS configuration
#       │  ✅ Middleware setup
#       │
#       ├─ authController.js
#       │  ✅ signup function
#       │  ✅ login function
#       │  ✅ getUserById function
#       │  ✅ checkUsernameAvailable function
#       │  ✅ checkEmailAvailable function
#       │
#       ├─ package.json
#       │  ✅ Dependencies list
#       │  ✅ Scripts
#       │
#       └─ .env.example
#          ✅ Environment variables template

# ============================================
# ⚡ QUICK START (10 MENIT)
# ============================================

# STEP 1: Setup Supabase (5 menit)
echo "STEP 1: Pergi ke https://supabase.com"
echo "  • Buat project baru"
echo "  • Copy SUPABASE_URL dan SUPABASE_ANON_KEY"
echo "  • Buka SQL Editor"
echo "  • Copy paste kode dari: SUPABASE_SQL_SETUP.sql"
echo "  • Jalankan query"

# STEP 2: Setup Frontend (3 menit)
echo ""
echo "STEP 2: Setup Frontend"
echo "  • Buat file .env.local di root project"
echo "  • Copy isi dari template di SETUP_GUIDE.md"
echo "  • Isi dengan SUPABASE credentials kamu"

# STEP 3: Setup Backend (2 menit)
echo ""
echo "STEP 3: Setup Backend"
echo "  • Copy folder 'server-example' menjadi 'server'"
echo "  • Jalankan: cd server && npm install"
echo "  • Copy .env.example menjadi .env"
echo "  • Isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY"
echo "  • Jalankan: npm run dev"

# ============================================
# 📚 DOKUMENTASI
# ============================================

# Baca dokumentasi dalam urutan ini:

# 1. SETUP_GUIDE.md
#    - Penjelasan lengkap untuk setiap langkah
#    - Screenshots apa yang diharapkan
#    - Troubleshooting common errors

# 2. SUPABASE_INTEGRATION_GUIDE.js
#    - Kode backend yang detailed
#    - Penjelasan setiap fungsi
#    - Database structure

# 3. UPDATE_EXAMPLES.js
#    - Contoh update untuk LoginForm
#    - Contoh update untuk App.jsx
#    - Catatan keamanan

# ============================================
# 🔑 CREDENTIALS YANG DIPERLUKAN
# ============================================

# Dari Supabase Project Settings > API:
# VITE_SUPABASE_URL=https://xxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
# SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs... (untuk backend)

# ============================================
# 🚀 DEVELOPMENT WORKFLOW
# ============================================

# Terminal 1 - Backend Server:
# $ cd server
# $ npm install
# $ npm run dev
# Server akan berjalan di http://localhost:5000

# Terminal 2 - Frontend Dev:
# $ npm run dev
# Frontend akan berjalan di http://localhost:5173

# ============================================
# 🧪 TEST SCENARIO
# ============================================

# 1. Test Sign Up:
#    - Klik "Daftar di sini"
#    - Isi form dengan data baru
#    - Klik "Buat Akun"
#    - Cek success message
#    - Verifikasi data di Supabase Table

# 2. Test Login:
#    - Klik "Login di sini"
#    - Masukkan credentials yang baru dibuat
#    - Isi Captcha
#    - Klik Login
#    - Seharusnya berhasil masuk ke Dashboard

# 3. Test Validation:
#    - Coba sign up dengan username < 3 karakter
#    - Coba sign up dengan password < 6 karakter
#    - Coba sign up dengan email invalid
#    - Semua harusnya show error message

# ============================================
# 📱 API ENDPOINTS
# ============================================

# Backend API yang tersedia:

# POST /api/auth/signup
# Body: { username, name, email, password, roles }
# Response: { success, message, data }

# POST /api/auth/login
# Body: { username, password, selectedRole, rememberDevice }
# Response: { success, message, data }

# GET /api/auth/user/:userId
# Response: { success, data }

# GET /api/auth/check-username?username=xxxxx
# Response: { success, available }

# GET /api/auth/check-email?email=xxxxx@xxx.com
# Response: { success, available }

# ============================================
# 🔐 SECURITY CHECKLIST
# ============================================

# ✅ Password di-hash dengan bcryptjs di backend
# ✅ CORS dikonfigurasi dengan benar
# ✅ Validation di backend dan frontend
# ✅ Login logs di-simpan untuk audit
# ✅ Trusted devices bisa disimpan
# ✅ Account status (active/suspended) dicek
# ✅ Email dan username di-validate

# ❌ JANGAN:
# - Hash password di frontend
# - Kirim password dalam logs
# - Skip backend validation
# - Expose service role key di frontend
# - Commit .env ke git

# ============================================
# 📞 FREQUENTLY ASKED QUESTIONS
# ============================================

# Q: Backend tidak konek ke Supabase
# A: Check SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env

# Q: SignUpForm tidak submit
# A: Check network tab (F12), lihat error response dari backend

# Q: Password tidak match saat login
# A: Pastikan bcryptjs version sama di frontend dan backend

# Q: CORS error
# A: Check FRONTEND_URL di backend .env

# Q: Database empty
# A: Pastikan SQL query sudah dijalankan di Supabase SQL Editor

# ============================================
# 📈 NEXT STEPS (FUTURE IMPROVEMENTS)
# ============================================

# Setelah implementasi basic selesai:

# 1. Email Verification
#    - Send verification email saat sign up
#    - User harus verify email sebelum bisa login

# 2. Forgot Password
#    - Form untuk reset password
#    - Send reset link ke email

# 3. Profile Management
#    - Update profile picture
#    - Update name dan email
#    - Change password

# 4. 2FA (Two-Factor Authentication)
#    - TOTP dengan Google Authenticator
#    - Backup codes

# 5. Social Login
#    - Google OAuth
#    - GitHub OAuth

# 6. Session Management
#    - Refresh tokens
#    - Session expiration
#    - Multiple device sessions

# ============================================
# 💡 TIPS & TRICKS
# ============================================

# Tip 1: Use Supabase Dashboard untuk monitor:
# - User registrations
# - Login success/failed rates
# - Trusted devices

# Tip 2: Supabase punya built-in auth juga:
# - Tapi untuk tutorial ini kita implement manual
# - Built-in auth lebih complex untuk learning

# Tip 3: Database ngga ada password column:
# - Password disimpan di password_hash column
# - Original password tidak di-store

# Tip 4: Roles adalah array:
# - User bisa punya multiple roles
# - Misal: budi adalah Admin AND Dosen

# ============================================
# 📖 READING ORDER
# ============================================

# 1. SETUP_GUIDE.md - Baca full dari atas sampai bawah
# 2. SUPABASE_SQL_SETUP.sql - Copy paste ke Supabase
# 3. server-example/* - Copy ke server folder
# 4. Jalankan setup commands (npm install, dll)
# 5. Test dengan sign up dan login
# 6. Check database di Supabase
# 7. Baca UPDATE_EXAMPLES.js untuk integrasi App.jsx

# ============================================
# ✅ COMPLETION CHECKLIST
# ============================================

echo "
=== COMPLETION CHECKLIST ===

Frontend:
[ ] Buat file .env.local dengan Supabase credentials
[ ] SignUpForm.jsx sudah di-create
[ ] Update App.jsx dengan isSignUpMode state
[ ] Tambahkan tombol \"Daftar\" di LoginForm
[ ] Test sign up form validation

Backend:
[ ] Copy folder server-example menjadi server
[ ] Install npm dependencies
[ ] Buat file .env dengan Supabase credentials
[ ] Test API endpoints (POST /api/auth/signup)

Database:
[ ] Jalankan SQL query dari SUPABASE_SQL_SETUP.sql
[ ] Verifikasi tables sudah dibuat
[ ] Check table struktur di Supabase
[ ] Test insert data manual

Testing:
[ ] Test sign up dengan valid data
[ ] Test sign up dengan invalid data
[ ] Test login dengan user yang baru dibuat
[ ] Check data di Supabase Table
[ ] Check logs di login_logs table

Production Ready:
[ ] Setup HTTPS di production
[ ] Setup proper CORS untuk production URL
[ ] Setup environment variables di production
[ ] Enable RLS policies
[ ] Backup database

=== JIKA SEMUA CHECKED, READY TO SUBMIT! ===
"
