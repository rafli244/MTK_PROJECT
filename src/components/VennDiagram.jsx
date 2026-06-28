// VennDiagram.jsx: Komponen visualisasi interaktif diagram Venn untuk teori himpunan, 
// memetakan semesta pengguna (U) ke dalam himpunan Admin (A) dan Dosen (D).
import React, { useState } from 'react';

export default function VennDiagram({ highlightedUser, users }) {
  const [selectedRegion, setSelectedRegion] = useState(null);

  const SetU = users;
  const SetA = users.filter(user => user.roles.includes('Admin'));
  const SetD = users.filter(user => user.roles.includes('Dosen'));
  const SetIntersection = users.filter(
    user => user.roles.includes('Admin') && user.roles.includes('Dosen')
  );
  const SetAdminOnly = users.filter(
    user => user.roles.includes('Admin') && !user.roles.includes('Dosen')
  );
  const SetDosenOnly = users.filter(
    user => !user.roles.includes('Admin') && user.roles.includes('Dosen')
  );
  const SetInactive = users.filter(user => !user.isActive);

  const regions = {
    U: {
      name: 'Himpunan Semesta (U)',
      notation: 'U',
      description: 'Semesta pembicaraan yang berisi seluruh pengguna di dalam sistem.',
      members: SetU
    },
    A: {
      name: 'Himpunan Admin (A)',
      notation: 'A',
      description: 'Himpunan pengguna yang memiliki peran sebagai Admin.',
      members: SetA
    },
    D: {
      name: 'Himpunan Dosen (D)',
      notation: 'D',
      description: 'Himpunan pengguna yang memiliki peran sebagai Dosen.',
      members: SetD
    },
    Intersection: {
      name: 'Irisan Admin dan Dosen (A ∩ D)',
      notation: 'A \\cap D',
      description: 'Himpunan pengguna yang memiliki peran ganda: Admin sekaligus Dosen.',
      members: SetIntersection
    },
    AdminOnly: {
      name: 'Selisih Admin minus Dosen (A \\ D)',
      notation: 'A \\setminus D',
      description: 'Himpunan pengguna yang hanya berperan sebagai Admin tetapi bukan Dosen.',
      members: SetAdminOnly
    },
    DosenOnly: {
      name: 'Selisih Dosen minus Admin (D \\ A)',
      notation: 'D \\setminus A',
      description: 'Himpunan pengguna yang hanya berperan sebagai Dosen tetapi bukan Admin.',
      members: SetDosenOnly
    },
    Inactive: {
      name: 'Akun Ditangguhkan / Tidak Aktif (isActive: false)',
      notation: '\\{x \\in U \\mid \\neg \\text{isActive}(x)\\}',
      description: 'Himpunan pengguna yang status akunnya dinonaktifkan.',
      members: SetInactive
    }
  };

  const handleRegionClick = (regionKey) => {
    setSelectedRegion(regionKey === selectedRegion ? null : regionKey);
  };

  const getUserRegion = (username) => {
    if (!username) return null;
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) return null;
    
    const isAdmin = user.roles.includes('Admin');
    const isDosen = user.roles.includes('Dosen');
    
    if (isAdmin && isDosen) return 'Intersection';
    if (isAdmin) return 'AdminOnly';
    if (isDosen) return 'DosenOnly';
    return null;
  };

  const activeUserRegion = getUserRegion(highlightedUser);

  return (
    <div className="glass-panel-neon-purple panel-accent-top p-6 rounded-2xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-deep-purple-500/20 pb-3">
        <div>
          <h3 className="text-lg font-semibold text-deep-purple-200 flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-deep-purple-400"></span>
            Visualisasi Teori Himpunan (Venn Diagram)
          </h3>
          <p className="text-xs text-parchment-400 mt-0.5">
            Klik area diagram atau tombol di bawah untuk melihat operasi himpunan.
          </p>
        </div>
        <div className="text-xs font-mono-custom px-2.5 py-1 bg-deep-purple-950/50 border border-deep-purple-400/30 rounded text-deep-purple-300">
          U = A ∪ D
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-center justify-center grow">
        <div className="relative w-full max-w-85 aspect-4/3 bg-deep-navy-950/40 rounded-xl border border-parchment-800/30 p-2 flex items-center justify-center">
          <span className="absolute top-2 left-3 text-xs font-bold text-parchment-500 font-mono-custom">U</span>
          
          <svg viewBox="0 0 400 280" className="w-full h-full">
            <defs>
              <clipPath id="circleA">
                <circle cx="150" cy="135" r="80" />
              </clipPath>
              <clipPath id="circleD">
                <circle cx="250" cy="135" r="80" />
              </clipPath>
            </defs>

            <path
              d="M 150,135 m -80,0 a 80,80 0 1,0 160,0 a 80,80 0 1,0 -160,0"
              fill={
                selectedRegion === 'AdminOnly' || activeUserRegion === 'AdminOnly'
                  ? 'rgba(203, 52, 193, 0.70)'
                  : 'rgba(203, 52, 193, 0.12)'
              }
              stroke={
                selectedRegion === 'AdminOnly' || activeUserRegion === 'AdminOnly'
                  ? '#d55dcd'
                  : 'rgba(203, 52, 193, 0.4)'
              }
              strokeWidth={
                selectedRegion === 'AdminOnly' || activeUserRegion === 'AdminOnly' ? 4 : 1.5
              }
              className="cursor-pointer"
              onClick={() => handleRegionClick('AdminOnly')}
            />

            <path
              d="M 250,135 m -80,0 a 80,80 0 1,0 160,0 a 80,80 0 1,0 -160,0"
              fill={
                selectedRegion === 'DosenOnly' || activeUserRegion === 'DosenOnly'
                  ? 'rgba(66, 97, 189, 0.70)'
                  : 'rgba(66, 97, 189, 0.12)'
              }
              stroke={
                selectedRegion === 'DosenOnly' || activeUserRegion === 'DosenOnly'
                  ? '#6881ca'
                  : 'rgba(66, 97, 189, 0.4)'
              }
              strokeWidth={
                selectedRegion === 'DosenOnly' || activeUserRegion === 'DosenOnly' ? 4 : 1.5
              }
              className="cursor-pointer"
              onClick={() => handleRegionClick('DosenOnly')}
            />

            <circle
              cx="150"
              cy="135"
              r="80"
              clipPath="url(#circleD)"
              fill={
                selectedRegion === 'Intersection' || activeUserRegion === 'Intersection'
                  ? 'rgba(227, 28, 194, 0.75)'
                  : 'rgba(213, 93, 205, 0.25)'
              }
              stroke={
                selectedRegion === 'Intersection' || activeUserRegion === 'Intersection'
                  ? '#e949ce'
                  : 'rgba(213, 93, 205, 0.6)'
              }
              strokeWidth={
                selectedRegion === 'Intersection' || activeUserRegion === 'Intersection' ? 4 : 1.5
              }
              className="cursor-pointer"
              onClick={() => handleRegionClick('Intersection')}
            />

            <text x="100" y="45" fill="#d55dcd" fontSize="14" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              A (Admin)
            </text>
            <text x="300" y="45" fill="#6881ca" fontSize="14" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              D (Dosen)
            </text>

            <g>
              <circle
                cx="110"
                cy="110"
                r={highlightedUser === 'gede' ? 11 : 7}
                fill={highlightedUser === 'gede' ? '#e31cc2' : '#b6169b'}
                stroke={highlightedUser === 'gede' ? '#f5f1f0' : 'none'}
                strokeWidth={highlightedUser === 'gede' ? 2.5 : 0}
              />
              <text x="110" y="129" fill={highlightedUser === 'gede' ? '#f5f1f0' : '#d6c7c2'} fontSize="10" textAnchor="middle" fontWeight={highlightedUser === 'gede' ? 'bold' : 'normal'}>
                gede (✖)
              </text>
            </g>

            <g>
              <circle
                cx="110"
                cy="165"
                r={highlightedUser === 'anto' ? 11 : 7}
                fill={highlightedUser === 'anto' ? '#d55dcd' : '#cb34c1'}
                stroke={highlightedUser === 'anto' ? '#f5f1f0' : 'none'}
                strokeWidth={highlightedUser === 'anto' ? 2.5 : 0}
              />
              <text x="110" y="184" fill={highlightedUser === 'anto' ? '#f5f1f0' : '#d6c7c2'} fontSize="10" textAnchor="middle" fontWeight={highlightedUser === 'anto' ? 'bold' : 'normal'}>
                anto (✔)
              </text>
            </g>

            <g>
              <circle
                cx="290"
                cy="110"
                r={highlightedUser === 'siti' ? 11 : 7}
                fill={highlightedUser === 'siti' ? '#6881ca' : '#4261bd'}
                stroke={highlightedUser === 'siti' ? '#f5f1f0' : 'none'}
                strokeWidth={highlightedUser === 'siti' ? 2.5 : 0}
              />
              <text x="290" y="129" fill={highlightedUser === 'siti' ? '#f5f1f0' : '#d6c7c2'} fontSize="10" textAnchor="middle" fontWeight={highlightedUser === 'siti' ? 'bold' : 'normal'}>
                siti (✔)
              </text>
            </g>

            <g>
              <circle
                cx="290"
                cy="165"
                r={highlightedUser === 'dewi' ? 11 : 7}
                fill={highlightedUser === 'dewi' ? '#6881ca' : '#4261bd'}
                stroke={highlightedUser === 'dewi' ? '#f5f1f0' : 'none'}
                strokeWidth={highlightedUser === 'dewi' ? 2.5 : 0}
              />
              <text x="290" y="184" fill={highlightedUser === 'dewi' ? '#f5f1f0' : '#d6c7c2'} fontSize="10" textAnchor="middle" fontWeight={highlightedUser === 'dewi' ? 'bold' : 'normal'}>
                dewi (✔)
              </text>
            </g>

            <g>
              <circle
                cx="200"
                cy="135"
                r={highlightedUser === 'budi' ? 12 : 8}
                fill={highlightedUser === 'budi' ? '#e31cc2' : '#e949ce'}
                stroke={highlightedUser === 'budi' ? '#f5f1f0' : 'none'}
                strokeWidth={highlightedUser === 'budi' ? 2.5 : 0}
              />
              <text x="200" y="159" fill={highlightedUser === 'budi' ? '#fce8f9' : '#f9d2f3'} fontSize="11" fontWeight="bold" textAnchor="middle">
                budi (✔)
              </text>
            </g>
          </svg>
        </div>

        <div className="flex-1 w-full flex flex-col justify-between">
          <div className="bg-deep-navy-900/60 border border-parchment-800/30 p-4 rounded-xl min-h-35 flex flex-col justify-between">
            {selectedRegion || activeUserRegion ? (
              <div>
                <span className="text-xs font-mono-custom text-petal-frost-300 bg-petal-frost-950/40 px-2 py-0.5 border border-petal-frost-500/20 rounded">
                  {regions[selectedRegion || activeUserRegion].name}
                </span>
                <p className="text-sm text-parchment-200 mt-2">
                  {regions[selectedRegion || activeUserRegion].description}
                </p>
                <div className="mt-3">
                  <span className="text-xs text-parchment-400 block font-semibold mb-1">Anggota Himpunan:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {regions[selectedRegion || activeUserRegion].members.map(u => (
                      <span
                        key={u.username}
                        className={`text-xs px-2 py-0.5 rounded font-mono-custom border ${
                          u.username === highlightedUser
                            ? 'bg-deep-purple-500/20 text-deep-purple-200 border-deep-purple-400/40 font-bold'
                            : u.isActive
                            ? 'bg-deep-navy-900 text-parchment-200 border-parchment-700/40'
                            : 'bg-petal-frost-950/30 text-petal-frost-400 border-petal-frost-800/40'
                        }`}
                      >
                        {u.username} {!u.isActive && '(Suspended)'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full py-4 text-parchment-400">
                <svg className="w-8 h-8 text-parchment-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs">Pilih region diagram atau ketik username untuk memeriksa teori himpunan.</span>
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
            <button
              onClick={() => handleRegionClick('AdminOnly')}
              className={`text-[11px] font-mono-custom py-1.5 px-2 rounded border cursor-pointer ${
                selectedRegion === 'AdminOnly'
                  ? 'bg-deep-purple-950/60 border-deep-purple-400 text-deep-purple-200 font-bold'
                  : 'bg-deep-navy-950/30 border-parchment-800/30 hover:border-deep-purple-700 text-parchment-400 hover:text-deep-purple-300'
              }`}
            >
              A \ D
            </button>
            <button
              onClick={() => handleRegionClick('DosenOnly')}
              className={`text-[11px] font-mono-custom py-1.5 px-2 rounded border cursor-pointer ${
                selectedRegion === 'DosenOnly'
                  ? 'bg-lavender-950/60 border-lavender-400 text-lavender-200 font-bold'
                  : 'bg-deep-navy-950/30 border-parchment-800/30 hover:border-lavender-700 text-parchment-400 hover:text-lavender-300'
              }`}
            >
              D \ A
            </button>
            <button
              onClick={() => handleRegionClick('Intersection')}
              className={`text-[11px] font-mono-custom py-1.5 px-2 rounded border cursor-pointer ${
                selectedRegion === 'Intersection'
                  ? 'bg-petal-frost-950/60 border-petal-frost-400 text-petal-frost-200 font-bold'
                  : 'bg-deep-navy-950/30 border-parchment-800/30 hover:border-petal-frost-700 text-parchment-400 hover:text-petal-frost-300'
              }`}
            >
              A ∩ D
            </button>
            <button
              onClick={() => handleRegionClick('U')}
              className={`text-[11px] font-mono-custom py-1.5 px-2 rounded border cursor-pointer ${
                selectedRegion === 'U'
                  ? 'bg-parchment-800/40 border-parchment-500 text-parchment-100 font-bold'
                  : 'bg-deep-navy-950/30 border-parchment-800/30 hover:border-parchment-600 text-parchment-400 hover:text-parchment-200'
              }`}
            >
              Semesta (U)
            </button>
            <button
              onClick={() => handleRegionClick('Inactive')}
              className={`text-[11px] font-mono-custom py-1.5 px-2 rounded border cursor-pointer ${
                selectedRegion === 'Inactive'
                  ? 'bg-petal-frost-950/60 border-petal-frost-500 text-petal-frost-300 font-bold'
                  : 'bg-deep-navy-950/30 border-parchment-800/30 hover:border-petal-frost-800 text-parchment-400 hover:text-petal-frost-300'
              }`}
            >
              Nonaktif (q=F)
            </button>
            <button
              onClick={() => setSelectedRegion(null)}
              className="text-[11px] font-mono-custom py-1.5 px-2 rounded border border-petal-frost-900/30 text-petal-frost-400 hover:bg-petal-frost-950/20 cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
