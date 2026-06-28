// App.jsx: Komponen utama (shell aplikasi) yang me-render tata letak halaman masuk, dasbor,
// dan laboratorium matematika interaktif berdasarkan sesi otentikasi aktif.
import React, { useState } from 'react';
import LoginForm from './components/LoginForm.jsx';
import SecurityChallenge from './components/SecurityChallenge.jsx';
import VennDiagram from './components/VennDiagram.jsx';
import CryptoLab from './components/CryptoLab.jsx';
import Dashboard from './components/Dashboard.jsx';
import LogicSandbox from './components/LogicSandbox.jsx';
import { Binary, Info } from 'lucide-react';
import SecurityProvider, { useSecurity } from './components/SecurityProvider.jsx';

function AppContent() {
  const {
    users,
    isLoggedIn,
    currentUser,
    currentRole,
    showSecurityChallenge,
    pendingChallengeUser,
    setShowSecurityChallenge,
    setPendingChallengeUser,
    handleLoginSuccess,
    handleLogout,
    handleUpdateUserStatus,
    handleUpdateUserRoles
  } = useSecurity();

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
  const [activeSandboxTab, setActiveSandboxTab] = useState('venn'); // 'venn' | 'crypto' | 'logic'

  const [logicState, setLogicState] = useState({
    username: '',
    password: '',
    rememberDevice: false,
    captchaValid: false,
    pVal: false,
    qVal: false,
    term1: false,
    term2: false,
    L_val: false,
    gVal: false
  });

  // Handler for credential input changes in LoginForm
  const handleCredentialChange = (username, password, cipher) => {
    setInputUsername(username);
    setInputPassword(password);
    setUserCiphertext(cipher);
  };

  const triggerLogout = () => {
    handleLogout();
    setInputUsername('');
    setInputPassword('');
    setUserCiphertext('');
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
                Discrete Mathematics & One-Way Hashing (SHA-1) Laboratory
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
        {showSecurityChallenge ? (
          <SecurityChallenge 
            user={pendingChallengeUser}
            onSuccess={(user, role) => {
              setShowSecurityChallenge(false);
              setPendingChallengeUser(null);
              handleLoginSuccess(user, role);
            }}
            onCancel={() => {
              setShowSecurityChallenge(false);
              setPendingChallengeUser(null);
            }}
          />
        ) : !isLoggedIn ? (
          /* ================= LOGIN SCREEN / LANDING PAGE ================= */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Side: Auth Panel */}
            <div className="lg:col-span-5">
              <div className="section-label mb-3">Panel Otentikasi</div>
              <LoginForm 
                onLoginSuccess={handleLoginSuccess}
                onInputChange={handleCredentialChange}
                users={users}
                onLogicStateChange={setLogicState}
              />
            </div>

            {/* Right Side: Math Sandbox */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <div className="section-label">Laboratorium Interaktif</div>
              {/* Sandbox Tabs */}
              <div className="glass-panel p-1.5 rounded-xl flex border border-parchment-800/25 w-fit flex-wrap gap-1">
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
                <button
                  onClick={() => setActiveSandboxTab('logic')}
                  className={`text-xs py-1.5 px-4 rounded-lg font-semibold cursor-pointer ${
                    activeSandboxTab === 'logic'
                      ? 'bg-emerald-600/30 text-emerald-200 border border-emerald-400/30'
                      : 'text-parchment-500 hover:text-parchment-200 border border-transparent'
                  }`}
                >
                  Logic & Decision Tree
                </button>
              </div>

              {/* Sandbox Panels */}
              <div key={activeSandboxTab} className="min-h-115 flex flex-col justify-between">
                {activeSandboxTab === 'venn' ? (
                  <VennDiagram 
                    highlightedUser={inputUsername}
                    users={users}
                  />
                ) : activeSandboxTab === 'crypto' ? (
                  <CryptoLab 
                    inputPassword={inputPassword}
                    userCiphertext={userCiphertext}
                    targetUsername={inputUsername}
                  />
                ) : (
                  <LogicSandbox 
                    {...logicState}
                    users={users}
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
              onLogout={triggerLogout}
              onUpdateUserStatus={handleUpdateUserStatus}
              onUpdateUserRoles={handleUpdateUserRoles}
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
                    highlightedUser={currentUser?.username}
                    users={users}
                  />
                ) : (
                  <CryptoLab 
                    inputPassword=""
                    userCiphertext={currentUser?.passwordCipher}
                    targetUsername={currentUser?.username}
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
          <span className="text-lavender-400">L = q ∧ ((p∧r) ∨ (p∧¬r∧s) ∨ g)</span>
          <span className="text-parchment-700">|</span>
          <span className="text-petal-frost-400">Hash = SHA-1(pw)</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <SecurityProvider>
      <AppContent />
    </SecurityProvider>
  );
}
