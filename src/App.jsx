import React, { useState, useEffect } from 'react';
import { usersDb } from './utils/dummyDb.js';
import LoginForm from './components/LoginForm.jsx';
import SignUpForm from './components/SignUpForm.jsx';
import VennDiagram from './components/VennDiagram.jsx';
import CryptoLab from './components/CryptoLab.jsx';
import Dashboard from './components/Dashboard.jsx';
import { Binary, Info } from 'lucide-react';
import { supabase } from './utils/supabaseClient.js';

export default function App() {
  const [users, setUsers] = useState(usersDb);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState('');

  const fetchUsers = async () => {
    // 1. Try to fetch directly from Supabase first
    if (supabase) {
      try {
        const { data, error } = await supabase.from('users').select('*');
        if (!error && Array.isArray(data)) {
          const mappedUsers = data.map(u => ({
            id: u.id,
            username: u.username,
            email: u.email,
            name: u.name,
            passwordCipher: u.password_hash,
            roles: u.roles,
            isActive: u.is_active
          }));

          setUsers(prevUsers => {
            const merged = [...prevUsers];
            mappedUsers.forEach(dbUser => {
              const idx = merged.findIndex(u => u.username.toLowerCase() === dbUser.username.toLowerCase());
              if (idx !== -1) {
                merged[idx] = { ...merged[idx], ...dbUser };
              } else {
                merged.push(dbUser);
              }
            });
            return merged;
          });
          return; // Success, skip other fallbacks
        }
      } catch (err) {
        console.warn("Direct Supabase fetch failed, trying backend API URL fallback.", err);
      }
    }

    // 2. Try to fetch from Express Backend API
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/users`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setUsers(prevUsers => {
            const merged = [...prevUsers];
            result.data.forEach(dbUser => {
              const idx = merged.findIndex(u => u.username.toLowerCase() === dbUser.username.toLowerCase());
              if (idx !== -1) {
                merged[idx] = { ...merged[idx], ...dbUser };
              } else {
                merged.push(dbUser);
              }
            });
            return merged;
          });
        }
      }
    } catch (err) {
      console.warn("Backend users API unavailable, falling back to local static users list.", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // =========================================================================
  // ⚠️ LOGIKA SINKRONISASI DATA (WAJIB MASUK LAPORAN) ⚠️
  // Pengikat masukan (data input binding) untuk sinkronisasi state
  // username, password, dan ciphertext ke Venn Diagram dan Cryptography Lab
  // =========================================================================
  // States to bind LoginForm inputs to the right-side visualizers (Sandbox)
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [userCiphertext, setUserCiphertext] = useState('');

  // Sandbox Tab Selection
  const [activeSandboxTab, setActiveSandboxTab] = useState('venn'); // 'venn' | 'crypto'

  // Handler for credential input changes inLoginForm
  const handleCredentialChange = (username, password, cipher) => {
    setInputUsername(username);
    setInputPassword(password);
    setUserCiphertext(cipher);
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
    // Reset inputs
    setInputUsername('');
    setInputPassword('');
    setUserCiphertext('');
  };

  // Reactively updates the user status from Admin Dashboard
  const handleUpdateUserStatus = async (userId, newStatus) => {
    setUsers(prevUsers => 
      prevUsers.map(u => u.id === userId ? { ...u, isActive: newStatus } : u)
    );

    // Sync to Supabase directly if available
    if (supabase) {
      try {
        await supabase
          .from('users')
          .update({ is_active: newStatus })
          .eq('id', userId);
      } catch (err) {
        console.error("Failed to update status in Supabase:", err);
      }
    }
    
    // Sync active session if admin suspends themselves (unlikely but handles state edge cases)
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, isActive: newStatus }));
      if (!newStatus) {
        handleLogout(); // immediately logout if account is suspended
      }
    }
  };

  return (
    <div className="app-shell min-h-screen py-6 sm:py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-between">


      {/* Top Application Navbar / Header */}
      <header className="sticky top-4 z-50 mb-8 glass-panel rounded-2xl px-5 py-4 border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Binary className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold gradient-text tracking-tight">
                Context-Aware Authentication System
              </h1>
              <p className="text-xs text-lavender-300 font-medium mt-0.5">
                Discrete Mathematics & One-Way Hashing (SHA-256) Laboratory
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex h-2 w-2 rounded-full bg-petal-frost-400" />
            </span>
            <span className="text-[11px] font-mono-custom text-parchment-400 border border-parchment-800/40 bg-deep-navy-950/60 py-1 px-2.5 rounded-lg">
              {isLoggedIn ? `Session: @${currentUser?.username}` : 'Sandbox Mode'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="grow flex flex-col justify-center">
        {!isLoggedIn ? (
          /* ================= LOGIN SCREEN / LANDING PAGE ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Side: Auth Panel */}
            <div className="lg:col-span-5">
              <div className="section-label mb-3">Panel Otentikasi</div>
              {isSignUpMode ? (
                <SignUpForm 
                  onSignUpSuccess={(newUser) => {
                    setIsSignUpMode(false);
                    if (newUser) {
                      setUsers(prevUsers => {
                        const merged = [...prevUsers];
                        const idx = merged.findIndex(u => u.username.toLowerCase() === newUser.username.toLowerCase());
                        if (idx !== -1) {
                          merged[idx] = { ...merged[idx], ...newUser };
                        } else {
                          merged.push(newUser);
                        }
                        return merged;
                      });
                    }
                    fetchUsers();
                  }}
                  onSwitchToLogin={() => setIsSignUpMode(false)}
                />
              ) : (
                <LoginForm 
                  onLoginSuccess={handleLoginSuccess}
                  onInputChange={handleCredentialChange}
                  users={users}
                  onSignUp={() => setIsSignUpMode(true)}
                />
              )}
            </div>

            {/* Right Side: Math Sandbox */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="section-label">Laboratorium Interaktif</div>
              {/* Sandbox Tabs */}
              <div className="glass-panel p-1.5 rounded-xl flex border border-parchment-800/25 w-fit">
                <button
                  onClick={() => setActiveSandboxTab('venn')}
                  className={`text-xs py-1.5 px-4 rounded-lg font-semibold cursor-pointer ${
                    activeSandboxTab === 'venn'
                      ? 'bg-deep-purple-600/30 text-deep-purple-200 border border-deep-purple-400/30'
                      : 'text-parchment-500 hover:text-parchment-200 border border-transparent'
                  }`}
                >
                  Set Theory (Venn Diagram)
                </button>
                <button
                  onClick={() => setActiveSandboxTab('crypto')}
                  className={`text-xs py-1.5 px-4 rounded-lg font-semibold cursor-pointer ${
                    activeSandboxTab === 'crypto'
                      ? 'bg-lavender-600/30 text-lavender-200 border border-lavender-400/30'
                      : 'text-parchment-500 hover:text-parchment-200 border border-transparent'
                  }`}
                >
                  Cryptography & Hashing Lab
                </button>
              </div>

              {/* Sandbox Panels */}
              <div key={activeSandboxTab} className="min-h-115 flex flex-col justify-between">
                {activeSandboxTab === 'venn' ? (
                  <VennDiagram 
                    highlightedUser={inputUsername}
                    users={users}
                  />
                ) : (
                  <CryptoLab 
                    inputPassword={inputPassword}
                    userCiphertext={userCiphertext}
                    targetUsername={inputUsername}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ================= LOGGED IN DASHBOARD SCREEN ================= */
          <div className="space-y-8">
            <Dashboard 
              user={currentUser}
              initialRole={currentRole}
              onLogout={handleLogout}
              onUpdateUserStatus={handleUpdateUserStatus}
              users={users}
            />

            {/* Interactive Math Inspector inside Dashboard */}
            <div className="border-t border-parchment-800/25 pt-6">
              <div className="glass-panel p-4 rounded-xl flex items-center justify-between mb-4 border border-parchment-800/25">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-deep-purple-400" />
                  <span className="text-xs font-semibold text-parchment-200">
                    Eksplorasi Lab Matematika Diskrit Tetap Aktif saat Anda Masuk Sistem
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveSandboxTab(activeSandboxTab === 'venn' ? 'crypto' : 'venn')}
                    className="text-[11px] font-mono-custom text-deep-purple-300 hover:text-petal-frost-200 bg-deep-purple-950/30 border border-deep-purple-500/20 py-1 px-2.5 rounded hover:bg-deep-purple-950/50 cursor-pointer"
                  >
                    Beralih ke Lab {activeSandboxTab === 'venn' ? 'Kriptografi' : 'Teori Himpunan'}
                  </button>
                </div>
              </div>

              <div key={activeSandboxTab} className="grid grid-cols-1 gap-6">
                {activeSandboxTab === 'venn' ? (
                  <VennDiagram 
                    highlightedUser={currentUser.username}
                    users={users}
                  />
                ) : (
                  <CryptoLab 
                    inputPassword=""
                    userCiphertext={currentUser.passwordCipher}
                    targetUsername={currentUser.username}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="mt-12 pt-6 footer-gradient-border text-center text-xs text-parchment-500 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div>
          © 2026 Context-Aware Authentication System. All simulated data.
        </div>
        {/* =========================================================================
        // ⚠️ LOGIKA FORMULA DI LAYAR (WAJIB MASUK LAPORAN) ⚠️
        // Representasi visual rumus Teori Himpunan, Aljabar Boolean, dan Hash di UI
        // ========================================================================= */}
        <div className="font-mono-custom flex gap-3 text-[10px]">
          <span className="text-deep-purple-400">U = A ∪ D</span>
          <span className="text-parchment-700">|</span>
          <span className="text-lavender-400">L = (p∧q∧r) ∨ (p∧q∧¬r∧s)</span>
          <span className="text-parchment-700">|</span>
          <span className="text-petal-frost-400">Hash = SHA-256(pw)</span>
        </div>
      </footer>
    </div>
  );
}
