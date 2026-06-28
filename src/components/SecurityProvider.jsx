// SecurityProvider.jsx: Pengelola state sesi otentikasi global, sinkronisasi data Supabase,
// deteksi ketidakaktifan (auto-logout), dan mitigasi keamanan (rate limiting & state clear).
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { usersDb } from '../utils/dummyDb.js';

const SecurityContext = createContext(null);

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) throw new Error('useSecurity must be used within a SecurityProvider');
  return context;
};

export default function SecurityProvider({ children }) {
  const [users, setUsers] = useState(usersDb);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState('');
  const [showSecurityChallenge, setShowSecurityChallenge] = useState(false);
  const [pendingChallengeUser, setPendingChallengeUser] = useState(null);
  const [inactivityAlert, setInactivityAlert] = useState(false);

  // DURASI TIMEOUT: 15 detik untuk demo presentasi (Produksi: 5 menit / 300000 ms)
  const TIMEOUT_DURATION = 15000; 
  const timerRef = useRef(null);
  const usersRef = useRef(users);
  const isLoggingOutRef = useRef(false);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  const fetchUsers = async () => {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('users').select('*');
        if (!error && Array.isArray(data)) {
          const mappedUsers = data.map(u => ({
            id: u.id,
            username: u.username || '',
            email: u.email || '',
            name: u.name || '',
            passwordCipher: u.password_hash || '',
            roles: u.roles || ['Dosen'],
            isActive: u.is_active !== false,
            avatar: u.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.id}`
          }));

          setUsers(prevUsers => {
            const merged = [...prevUsers];
            mappedUsers.forEach(dbUser => {
              if (dbUser.username) {
                const idx = merged.findIndex(u => u.username && u.username.toLowerCase() === dbUser.username.toLowerCase());
                if (idx !== -1) {
                  merged[idx] = { ...merged[idx], ...dbUser };
                } else {
                  merged.push(dbUser);
                }
              }
            });
            return merged;
          });
          return;
        }
      } catch (err) {
        console.warn("Direct Supabase fetch failed, trying backend API URL fallback.", err);
      }
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/auth/users`);
      if (response.ok) {
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setUsers(prevUsers => {
            const merged = [...prevUsers];
            result.data.forEach(dbUser => {
              if (dbUser.username) {
                const idx = merged.findIndex(u => u.username && u.username.toLowerCase() === dbUser.username.toLowerCase());
                if (idx !== -1) {
                  merged[idx] = { ...merged[idx], ...dbUser };
                } else {
                  merged.push(dbUser);
                }
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

  const handleSupabaseSession = async (supabaseUser) => {
    const email = supabaseUser.email;
    let matchedUser = usersRef.current.find(u => u.email && email && u.email.toLowerCase() === email.toLowerCase());

    if (!matchedUser && supabase) {
      try {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (data) {
          matchedUser = {
            id: data.id,
            username: data.username || '',
            email: data.email || '',
            name: data.name || '',
            passwordCipher: data.password_hash || '',
            roles: data.roles || ['Dosen'],
            isActive: data.is_active !== false,
            avatar: data.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${data.id}`
          };
          
          setUsers(prev => {
            const idx = prev.findIndex(u => u.id === matchedUser.id);
            if (idx === -1) return [...prev, matchedUser];
            return prev.map(u => u.id === matchedUser.id ? matchedUser : u);
          });
        }
      } catch (err) {
        console.warn("Direct DB check failed", err);
      }
    }

    if (!matchedUser) {
      // JIT Provisioning: Buat user baru secara otomatis di Supabase
      const newUserObj = {
        id: supabaseUser.id,
        username: supabaseUser.email.split('@')[0],
        name: supabaseUser.user_metadata?.full_name || supabaseUser.email.split('@')[0],
        email: supabaseUser.email,
        roles: ['Dosen'], // Dipaksa role Dosen
        isActive: true,
        avatar: supabaseUser.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/adventurer/svg?seed=${supabaseUser.id}`
      };

      if (supabase) {
        try {
          await supabase
            .from('users')
            .insert([
              {
                id: newUserObj.id,
                username: newUserObj.username,
                email: newUserObj.email,
                name: newUserObj.name,
                roles: newUserObj.roles,
                is_active: newUserObj.isActive,
                avatar_url: newUserObj.avatar
              }
            ]);
        } catch (err) {
          console.error("Exception during JIT Provisioning:", err);
        }
      }

      setUsers(prev => [...prev, newUserObj]);
      matchedUser = newUserObj;
    }

    setPendingChallengeUser(matchedUser);
    setShowSecurityChallenge(true);
  };

  const handleLoginSuccess = (user, role) => {
    setCurrentUser(user);
    setCurrentRole(role);
    setIsLoggedIn(true);
    setInactivityAlert(false);
    resetInactivityTimer();
  };

  const handleLogout = async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentRole('');
    setShowSecurityChallenge(false);
    setPendingChallengeUser(null);
    setInactivityAlert(false);

    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (err) {
      console.warn("Storage cleanup error:", err);
    }
    
    if (timerRef.current) clearTimeout(timerRef.current);

    if (supabase) {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.auth.signOut();
        }
      } catch (err) {
        console.warn("Supabase sign out error:", err);
      }
    }

    isLoggingOutRef.current = false;
  };

  const handleUpdateUserStatus = async (userId, newStatus) => {
    setUsers(prevUsers => 
      prevUsers.map(u => u.id === userId ? { ...u, isActive: newStatus } : u)
    );

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
    
    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, isActive: newStatus }));
      if (!newStatus) {
        handleLogout();
      }
    }
  };

  const handleUpdateUserRoles = async (userId, newRoles) => {
    // Pastikan hanya dijalankan jika user aktif adalah Admin
    if (!currentUser?.roles?.includes('Admin')) {
      alert('Akses ditolak: Hanya Admin yang dapat mengubah peran.');
      return;
    }

    setUsers(prevUsers => 
      prevUsers.map(u => u.id === userId ? { ...u, roles: newRoles } : u)
    );

    if (supabase) {
      try {
        const { error } = await supabase
          .from('users')
          .update({ roles: newRoles })
          .eq('id', userId);
        if (error) throw error;
      } catch (err) {
        console.error("Failed to update user roles in Supabase:", err);
      }
    }

    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, roles: newRoles }));
      setCurrentRole(newRoles[0]);
    }
  };

  const resetInactivityTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    if (isLoggedIn) {
      timerRef.current = setTimeout(() => {
        setInactivityAlert(true);
        handleLogout();
      }, TIMEOUT_DURATION);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!supabase) return;

    // Check if we were in the middle of a security challenge before reload
    const wasPendingChallenge = sessionStorage.getItem('sec_challenge_pending') === 'true';
    if (wasPendingChallenge) {
      sessionStorage.removeItem('sec_challenge_pending');
      handleLogout();
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        handleSupabaseSession(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        handleSupabaseSession(session.user);
      } else if (event === 'SIGNED_OUT') {
        handleLogout();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const activityEvents = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
    
    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    if (isLoggedIn) {
      activityEvents.forEach(event => {
        window.addEventListener(event, handleUserActivity);
      });
      resetInactivityTimer();
    }

    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLoggedIn]);

  return (
    <SecurityContext.Provider value={{
      users,
      setUsers,
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
      handleUpdateUserRoles,
      inactivityAlert,
      setInactivityAlert,
      TIMEOUT_DURATION
    }}>
      {children}
      {inactivityAlert && (
        <div className="fixed bottom-4 right-4 z-50 p-4 rounded-xl border border-red-500/30 bg-red-950/95 text-red-200 shadow-2xl animate-bounce max-w-xs text-xs">
          <div className="font-bold flex items-center gap-1.5 mb-1 text-red-400">
            ⚠️ AUTO-LOGOUT AKTIF
          </div>
          Sesi Anda telah berakhir secara otomatis karena tidak ada aktivitas selama 15 detik (Mode Demo).
          <button 
            onClick={() => setInactivityAlert(false)}
            className="mt-2 w-full py-1 bg-red-800 hover:bg-red-700 font-bold rounded cursor-pointer text-[10px] border-0 text-white"
          >
            Tutup
          </button>
        </div>
      )}
    </SecurityContext.Provider>
  );
}
