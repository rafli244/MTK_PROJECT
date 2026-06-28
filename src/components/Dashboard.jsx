import React, { useState } from 'react';
import { 
  Users, Shield, LogOut, CheckCircle, XCircle, BookOpen, 
  GraduationCap, Calendar, Activity, Key, LayoutDashboard, ToggleLeft
} from 'lucide-react';

export default function Dashboard({ user, initialRole, onLogout, onUpdateUserStatus, onUpdateUserRoles, users }) {
  if (!user) return null;
  const [currentView, setCurrentView] = useState(initialRole);
  const isMultiRole = user.roles.includes('Admin') && user.roles.includes('Dosen');
  
  const [students, setStudents] = useState([
    { id: 1, name: 'Bambang Tri', nim: '220101001', grade: 85, attendance: '100%' },
    { id: 2, name: 'Citra Kirana', nim: '220101002', grade: 92, attendance: '92%' },
    { id: 3, name: 'Eko Wahyudi', nim: '220101003', grade: 78, attendance: '85%' },
    { id: 4, name: 'Farhan Hanif', nim: '220101004', grade: 45, attendance: '70%' },
    { id: 5, name: 'Gita Gutawa', nim: '220101005', grade: 88, attendance: '95%' }
  ]);

  const handleGradeChange = (id, newGrade) => {
    setStudents(students.map(s => s.id === id ? { ...s, grade: Number(newGrade) || 0 } : s));
  };

  const toggleRole = (userId, currentRoles) => {
    if (!user.roles.includes('Admin')) {
      alert('Akses ditolak: Hanya Admin yang dapat mengubah peran.');
      return;
    }
    const newRoles = currentRoles.includes('Admin') ? ['Dosen'] : ['Admin'];
    if (onUpdateUserRoles) {
      onUpdateUserRoles(userId, newRoles);
    }
  };

  const getSetLabel = (u) => {
    const isAdmin = u.roles.includes('Admin');
    const isDosen = u.roles.includes('Dosen');
    if (isAdmin && isDosen) return 'A ∩ D (Admin & Dosen)';
    if (isAdmin) return 'A \\ D (Admin Only)';
    if (isDosen) return 'D \\ A (Dosen Only)';
    return 'U';
  };

  return (
    <div className="w-full space-y-6">
      {/* Dashboard Top Header */}
      <div className="glass-panel panel-accent-top p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-deep-purple-400 bg-deep-navy-900 shadow-sm">
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-parchment-50 leading-none">{user.name}</h2>
              <span className="text-xs px-2 py-0.5 rounded font-mono-custom bg-deep-purple-950/60 border border-deep-purple-400/30 text-deep-purple-300">
                @{user.username}
              </span>
            </div>
            <p className="text-xs text-parchment-400 mt-1 flex items-center gap-1">
              <span>Status Keanggotaan:</span>
              <span className="font-mono-custom text-lavender-300 font-semibold bg-lavender-950/30 px-1.5 py-px rounded border border-lavender-400/20">
                {getSetLabel(user)}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isMultiRole && (
            <div className="flex bg-deep-navy-950 p-1.5 rounded-lg border border-parchment-800/30">
              <button
                onClick={() => setCurrentView('Admin')}
                className={`text-xs py-1.5 px-3 rounded-md font-semibold cursor-pointer ${
                  currentView === 'Admin' 
                    ? 'bg-deep-purple-600 text-parchment-50 shadow-md' 
                    : 'text-parchment-500 hover:text-parchment-200'
                }`}
              >
                Admin Panel
              </button>
              <button
                onClick={() => setCurrentView('Dosen')}
                className={`text-xs py-1.5 px-3 rounded-md font-semibold cursor-pointer ${
                  currentView === 'Dosen' 
                    ? 'bg-lavender-600 text-parchment-50 shadow-md' 
                    : 'text-parchment-500 hover:text-parchment-200'
                }`}
              >
                Dosen Portal
              </button>
            </div>
          )}

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-4 py-2 bg-petal-frost-950/40 border border-petal-frost-700/30 hover:border-petal-frost-500/50 hover:bg-petal-frost-950/60 text-petal-frost-300 text-xs font-semibold rounded-lg cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {currentView === 'Admin' && user.roles.includes('Admin') ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel-neon-purple p-5 rounded-2xl">
              <h3 className="text-sm font-bold text-deep-purple-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-deep-purple-400" />
                Statistik Sistem
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-deep-navy-950/50 border border-parchment-900/30 p-3 rounded-xl">
                  <span className="text-[10px] text-parchment-500 block uppercase font-semibold">Total Pengguna (U)</span>
                  <span className="text-2xl font-bold font-mono-custom text-parchment-100">{users.length}</span>
                </div>
                <div className="bg-deep-navy-950/50 border border-parchment-900/30 p-3 rounded-xl">
                  <span className="text-[10px] text-parchment-500 block uppercase font-semibold">Irisan Peran (A ∩ D)</span>
                  <span className="text-2xl font-bold font-mono-custom text-petal-frost-400">
                    {users.filter(u => u.roles.includes('Admin') && u.roles.includes('Dosen')).length}
                  </span>
                </div>
                <div className="bg-deep-navy-950/50 border border-parchment-900/30 p-3 rounded-xl">
                  <span className="text-[10px] text-parchment-500 block uppercase font-semibold">Total Admin (A)</span>
                  <span className="text-2xl font-bold font-mono-custom text-deep-purple-400">
                    {users.filter(u => u.roles.includes('Admin')).length}
                  </span>
                </div>
                <div className="bg-deep-navy-950/50 border border-parchment-900/30 p-3 rounded-xl">
                  <span className="text-[10px] text-parchment-500 block uppercase font-semibold">Total Dosen (D)</span>
                  <span className="text-2xl font-bold font-mono-custom text-lavender-400">
                    {users.filter(u => u.roles.includes('Dosen')).length}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-deep-purple-500/15 space-y-2 text-xs">
                <span className="font-semibold text-parchment-400 block">Status Validasi Global:</span>
                <div className="flex justify-between items-center font-mono-custom text-parchment-400 bg-deep-navy-950/40 p-2 rounded border border-parchment-800/25">
                  <span>Kriptografi Login:</span>
                  <span className="text-deep-purple-400 font-bold">SHA-256 Hashing</span>
                </div>
                <div className="flex justify-between items-center font-mono-custom text-parchment-400 bg-deep-navy-950/40 p-2 rounded border border-parchment-800/25">
                  <span>Captcha Validasi:</span>
                  <span className="text-lavender-300 font-bold">Aktif (verifikasi input pengguna)</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl text-xs text-parchment-400 space-y-3">
              <h3 className="font-bold text-parchment-200 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-deep-purple-400" />
                Catatan Kontrol Admin
              </h3>
              <p className="leading-relaxed">
                Sebagai Administrator, Anda memiliki akses penuh ke manajemen status pengguna. Perubahan status <code className="bg-deep-navy-950 px-1 py-px font-mono-custom text-deep-purple-400 rounded">isActive</code> secara langsung memengaruhi nilai variabel proposisional <strong className="text-parchment-200">q</strong> dalam logika otentikasi login pengguna yang bersangkutan.
              </p>
              <p className="leading-relaxed">
                Jika akun dinonaktifkan (q = False), maka formula evaluasi Boolean <code className="bg-deep-navy-950 px-1 py-px font-mono-custom text-deep-purple-400 rounded">L = (p ∧ q ∧ r) ∨ (p ∧ q ∧ ¬r ∧ s)</code> akan bernilai False untuk kredensial apa pun, menggagalkan proses masuk secara instan.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 glass-panel p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4 border-b border-parchment-800/25 pb-3">
                <h3 className="text-sm font-bold text-parchment-100 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-deep-purple-400" />
                  Daftar Anggota Himpunan Semesta (U)
                </h3>
                <span className="text-xs text-parchment-500 font-mono-custom">A ∪ D ⊆ U</span>
              </div>

              <div className="overflow-x-auto">
                <table className="data-table w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-deep-navy-950/40 border-b border-parchment-800/30 text-parchment-400">
                      <th className="p-3">User</th>
                      <th className="p-3">Himpunan Relasi</th>
                      <th className="p-3 font-mono-custom">Hash SHA-256 (64-char Hex)</th>
                      <th className="p-3">Status (q)</th>
                      <th className="p-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-parchment-800/15 text-parchment-200">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-deep-navy-950/20">
                        <td className="p-3 flex items-center gap-2.5">
                          <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full bg-deep-navy-900" />
                          <div>
                            <span className="font-semibold block">{u.name}</span>
                            <span className="text-[10px] text-parchment-500 font-mono-custom">@{u.username}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono-custom border ${
                            u.roles.length > 1
                              ? 'bg-petal-frost-950/40 border-petal-frost-500/25 text-petal-frost-400'
                              : u.roles.includes('Admin')
                              ? 'bg-deep-purple-950/40 border-deep-purple-500/25 text-deep-purple-400'
                              : 'bg-lavender-950/40 border-lavender-500/25 text-lavender-400'
                          }`}>
                            {getSetLabel(u).split(' ')[0]}
                          </span>
                        </td>
                        <td className="p-3 font-mono-custom text-parchment-400 select-all font-semibold max-w-28 truncate" title={u.passwordCipher}>
                          "{u.passwordCipher}"
                        </td>
                        <td className="p-3">
                          {u.isActive ? (
                            <span className="flex items-center gap-1 text-lavender-300 font-medium">
                              <CheckCircle className="w-3.5 h-3.5" />
                              Aktif (q=T)
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-petal-frost-500 font-medium">
                              <XCircle className="w-3.5 h-3.5" />
                              Ditangguhkan (q=F)
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => toggleRole(u.id, u.roles)}
                            className="px-3 py-1 rounded text-[10px] font-semibold cursor-pointer bg-deep-purple-950/40 text-deep-purple-300 border border-deep-purple-800/40 hover:bg-deep-purple-950/70 mr-1.5"
                          >
                            Set Peran: {u.roles.includes('Admin') ? 'Dosen' : 'Admin'}
                          </button>
                          <button
                            onClick={() => onUpdateUserStatus(u.id, !u.isActive)}
                            className={`px-3 py-1 rounded text-[10px] font-semibold cursor-pointer ${
                              u.isActive
                                ? 'bg-petal-frost-950/40 text-petal-frost-400 border border-petal-frost-800/40 hover:bg-petal-frost-950/70'
                                : 'bg-lavender-950/40 text-lavender-300 border border-lavender-800/40 hover:bg-lavender-950/70'
                            }`}
                          >
                            {u.isActive ? 'Tangguhkan' : 'Aktifkan'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="text-[10px] text-parchment-500 border-t border-parchment-900/40 pt-3 mt-4 italic">
              * Perubahan status langsung diterapkan pada memori lokal server simpanan.
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel-neon-blue p-5 rounded-2xl">
              <h3 className="text-sm font-bold text-lavender-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-lavender-400" />
                Jadwal Mengajar Hari Ini
              </h3>
              
              <div className="space-y-3.5">
                <div className="p-3 bg-deep-navy-950/40 border border-parchment-800/25 rounded-xl">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-lavender-400 font-bold font-mono-custom">08:00 - 09:40</span>
                    <span className="text-[9px] bg-deep-navy-900 text-parchment-400 px-1.5 py-px rounded font-mono-custom">Ruang 302</span>
                  </div>
                  <h4 className="text-xs font-bold text-parchment-50 mt-1">Matematika Diskrit</h4>
                  <span className="text-[10px] text-parchment-500 block">Pembahasan: Aljabar Boolean & Rangkaian Logika</span>
                </div>

                <div className="p-3 bg-deep-navy-950/40 border border-parchment-800/25 rounded-xl">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-lavender-400 font-bold font-mono-custom">10:00 - 11:40</span>
                    <span className="text-[9px] bg-deep-navy-900 text-parchment-400 px-1.5 py-px rounded font-mono-custom">Laboratorium Komputer</span>
                  </div>
                  <h4 className="text-xs font-bold text-parchment-50 mt-1">Kriptografi & Teori Informasi</h4>
                  <span className="text-[10px] text-parchment-500 block">Pembahasan: Hashing Satu-Arah SHA-256 & Biner</span>
                </div>
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl">
              <h3 className="text-xs font-bold text-parchment-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-lavender-400" />
                Deskripsi Tugas Pengajaran
              </h3>
              <p className="text-xs text-parchment-400 leading-relaxed">
                Sebagai dosen pengampu, Anda berwenang untuk mencatat daftar kehadiran mahasiswa dan memberikan penilaian akhir semester secara dinamis. Nilai rata-rata kelas akan dihitung ulang secara otomatis berdasarkan input nilai Anda.
              </p>
            </div>
          </div>

          <div className="lg:col-span-2 glass-panel p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4 border-b border-parchment-800/25 pb-3">
                <h3 className="text-sm font-bold text-parchment-100 uppercase tracking-wider flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-lavender-400" />
                  Lembar Penilaian Mahasiswa - Kelas Matematika Diskrit
                </h3>
                <span className="text-xs font-mono-custom text-lavender-300 bg-lavender-950/30 px-2 py-0.5 border border-lavender-500/15 rounded">
                  Rata-rata: {(students.reduce((acc, curr) => acc + curr.grade, 0) / students.length).toFixed(1)}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="data-table w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-deep-navy-950/40 border-b border-parchment-800/30 text-parchment-400">
                      <th className="p-3">NIM</th>
                      <th className="p-3">Nama Lengkap</th>
                      <th className="p-3 text-center">Kehadiran</th>
                      <th className="p-3">Predikat Nilai</th>
                      <th className="p-3 text-center" style={{ width: '120px' }}>Angka Nilai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-parchment-800/15 text-parchment-200">
                    {students.map(s => (
                      <tr key={s.id} className="hover:bg-deep-navy-950/20">
                        <td className="p-3 font-mono-custom text-parchment-400">{s.nim}</td>
                        <td className="p-3 font-semibold text-parchment-100">{s.name}</td>
                        <td className="p-3 text-center text-parchment-300 font-mono-custom">{s.attendance}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono-custom ${
                            s.grade >= 80 
                              ? 'bg-lavender-950/40 text-lavender-300 border border-lavender-500/15' 
                              : s.grade >= 60
                              ? 'bg-parchment-900/40 text-parchment-300 border border-parchment-600/15'
                              : 'bg-petal-frost-950/40 text-petal-frost-400 border border-petal-frost-500/15'
                          }`}>
                            {s.grade >= 80 ? 'Grade A' : s.grade >= 70 ? 'Grade B' : s.grade >= 60 ? 'Grade C' : 'Grade E'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            value={s.grade}
                            onChange={(e) => handleGradeChange(s.id, e.target.value)}
                            min="0"
                            max="100"
                            className="w-16 bg-deep-navy-950 border border-parchment-800/40 text-center rounded py-1 px-1.5 focus:outline-none focus:border-lavender-400 font-mono-custom text-parchment-100 text-xs font-semibold"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="text-[10px] text-parchment-500 border-t border-parchment-900/40 pt-3 mt-4 flex items-center justify-between">
              <span>* Input nilai mahasiswa di atas disimulasikan penuh di sisi klien.</span>
              <span className="text-lavender-400 font-semibold font-mono-custom">MatDis_Sec_2026</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
