// ============================================
// CONTOH UPDATE LoginForm.jsx
// Tambahkan di bagian bawah form, sebelum closing tag
// ============================================

// Cari baris ini di LoginForm.jsx (sekitar baris 200-250):
// <p className="text-center text-slate-400 mt-6">
//   Belum punya akun? ...
// </p>

// GANTI DENGAN INI:

/*
{isSignUpMode ? (
  <SignUpForm 
    onSignUpSuccess={() => {
      setAlertInfo({
        type: 'success',
        message: 'Pendaftaran berhasil! Silakan login dengan akun baru Anda.'
      });
      setTimeout(() => {
        setIsSignUpMode(false);
        // Reset form
        setUsername('');
        setPassword('');
        setCaptchaInput('');
      }, 2000);
    }}
    onSwitchToLogin={() => setIsSignUpMode(false)}
  />
) : (
  <>
    {/* Form Login di sini */}
    {/* ... existing form ... */}
    
    {/* Sign Up Link */}
    <p className="text-center text-slate-400 mt-6">
      Belum punya akun?{' '}
      <button
        onClick={() => setIsSignUpMode(true)}
        type="button"
        className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
      >
        Daftar di sini
      </button>
    </p>
  </>
)}
*/

// ============================================
// ATAU, UNTUK CARA YANG LEBIH SEDERHANA:
// ============================================

// Update file App.jsx untuk handle state isSignUpMode:

/*
export default function App() {
  const [users, setUsers] = useState(usersDb);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState('');

  // ... state lainnya

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

  const handleSignUpSuccess = () => {
    setIsSignUpMode(false);
    // Auto switch ke login
    alert('Pendaftaran berhasil! Silakan login dengan akun Anda.');
  };

  if (isLoggedIn) {
    return (
      <Dashboard 
        user={currentUser} 
        role={currentRole} 
        onLogout={handleLogout}
      />
    );
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
          onSignUp={() => setIsSignUpMode(true)}
          onInputChange={handleCredentialChange}
          users={users}
        />
      )}
    </div>
  );
}
*/

// ============================================
// JIKA MENGGUNAKAN SUPABASE LANGSUNG DI FRONTEND
// (Tanpa backend server)
// ============================================

/*
import { supabase } from './utils/supabaseClient.js';
import bcryptjs from 'bcryptjs';

// Di SignUpForm.jsx, ganti fetch dengan direct Supabase:

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsLoading(true);

  try {
    // Hash password di frontend
    const passwordHash = await bcryptjs.hash(formData.password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username: formData.username.trim(),
          name: formData.name.trim(),
          email: formData.email.trim(),
          password_hash: passwordHash,
          roles: formData.roles,
          is_active: true
        }
      ])
      .select()
      .single();

    if (error) throw error;

    setAlertInfo({
      type: 'success',
      message: 'Pendaftaran berhasil! Silakan login.'
    });

    setFormData({
      username: '',
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      roles: ['Dosen']
    });

    setTimeout(() => onSwitchToLogin(), 2000);

  } catch (error) {
    setAlertInfo({
      type: 'error',
      message: error.message
    });
  } finally {
    setIsLoading(false);
  }
};
*/

// ============================================
// CATATAN KEAMANAN:
// ============================================
/*
1. JANGAN hash password di frontend dengan cara di atas
   - Password bisa dilihat di network inspector
   - Selalu hash di backend

2. SELALU gunakan backend server untuk:
   - Hash password
   - Validasi
   - Rate limiting
   - Audit logging

3. Frontend hanya:
   - Collect input
   - Basic validation
   - Call backend API
*/
