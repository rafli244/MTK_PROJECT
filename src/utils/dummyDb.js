import { sha256 } from './crypto.js';

/**
 * MATRIKS RELASI MANY-TO-MANY (M)
 * Mengaitkan Himpunan Semesta Pengguna (U) dengan Himpunan Peran (R = [Admin, Dosen])
 * 
 * Baris (U): [budi, siti, dewi, gede, anto]
 * Kolom (R): [Admin, Dosen]
 * 
 * Matriks Biner Relasi M (5x2):
 *           Admin   Dosen
 * budi    [   1,      1   ]  (budi ∈ A ∩ D)
 * siti    [   0,      1   ]  (siti ∈ D \ A)
 * dewi    [   0,      1   ]  (dewi ∈ D \ A)
 * gede    [   1,      0   ]  (gede ∈ A \ D)
 * anto    [   1,      0   ]  (anto ∈ A \ D)
 * 
 * Representasi Relasi Matematika:
 * M = { (budi, Admin), (budi, Dosen), (siti, Dosen), (dewi, Dosen), (gede, Admin), (anto, Admin) }
 */

/**
 * Universal Set (U) of Users
 * Passwords are encrypted using sha256 at runtime for maximum security
 */
export const usersDb = [
  {
    id: 'u1',
    username: 'budi',
    name: 'Dr. Budi Santoso, M.T.',
    roles: ['Admin', 'Dosen'],
    isActive: true,
    passwordCipher: sha256('budi123'),
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=budi',
    email: 'budi.santoso@univ.ac.id'
  },
  {
    id: 'u2',
    username: 'siti',
    name: 'Siti Rahma, M.Sc.',
    roles: ['Dosen'],
    isActive: true,
    passwordCipher: sha256('siti123'),
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=siti',
    email: 'siti.rahma@univ.ac.id'
  },
  {
    id: 'u3',
    username: 'gede',
    name: 'Gede Wiguna, S.Kom.',
    roles: ['Admin'],
    isActive: false, // Inactive account
    passwordCipher: sha256('adminabc'),
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=gede',
    email: 'gede.wiguna@univ.ac.id'
  },
  {
    id: 'u4',
    username: 'anto',
    name: 'Anto Wijaya, B.Sc.',
    roles: ['Admin'],
    isActive: true,
    passwordCipher: sha256('anto123'),
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=anto',
    email: 'anto.wijaya@univ.ac.id'
  },
  {
    id: 'u5',
    username: 'dewi',
    name: 'Dewi Lestari, Ph.D.',
    roles: ['Dosen'],
    isActive: true,
    passwordCipher: sha256('dewi123'),
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=dewi',
    email: 'dewi.lestari@univ.ac.id'
  }
];


/**
 * Set Theory Helpers
 */
export const SetU = usersDb; // Semesta
export const SetA = usersDb.filter(user => user.roles.includes('Admin')); // Himpunan Admin
export const SetD = usersDb.filter(user => user.roles.includes('Dosen')); // Himpunan Dosen

// A ∩ D (Irisan Admin dan Dosen)
export const SetIntersection = usersDb.filter(
  user => user.roles.includes('Admin') && user.roles.includes('Dosen')
);

// A \ D (Selisih: Admin yang bukan Dosen)
export const SetAdminOnly = usersDb.filter(
  user => user.roles.includes('Admin') && !user.roles.includes('Dosen')
);

// D \ A (Selisih: Dosen yang bukan Admin)
export const SetDosenOnly = usersDb.filter(
  user => !user.roles.includes('Admin') && user.roles.includes('Dosen')
);

// Inactive Users
export const SetInactive = usersDb.filter(user => !user.isActive);
