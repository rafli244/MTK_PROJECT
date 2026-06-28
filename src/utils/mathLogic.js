import { usersDb } from './dummyDb.js';
import { sha256 } from './crypto.js';
import bcryptjs from 'bcryptjs';

/**
 * Propositional Variables:
 * p : Kredensial Benar (Username, password, dan role sesuai)
 * q : Akun Aktif (isActive === true)
 * r : Perangkat Dikenali / Terpercaya (Remember Device checked)
 * s : Captcha Benar (jawaban Captcha valid)
 * 
 * Formula:
 * L = q ∧ ((p ∧ r) ∨ (p ∧ ¬r ∧ s) ∨ g)
 */

/**
 * Core function to evaluate the boolean authentication expression
 * 
 * @param {boolean} p - Credentials validity
 * @param {boolean} q - Account active status
 * @param {boolean} r - Trusted device checkbox
 * @param {boolean} s - Captcha validity
 * @param {boolean} g - Google OAuth validity
 * @returns {Object} - Complete truth value map of the logical terms
 */
export function evaluateBooleanAuth(p, q, r, s, g = false) {
  const L = q && ((p && r) || (p && !r && s) || g);

  return {
    p,
    q,
    r,
    s,
    g,
    not_r: !r,
    term1: p && q && r,
    term2: p && q && !r && s,
    term3: g && q,
    L
  };
}

/**
 * Validates the credentials and executes the full logical authentication workflow
 * 
 * @param {string} username - User input username
 * @param {string} password - User input password
 * @param {string} selectedRole - Role selected by the user
 * @param {boolean} rememberDevice - Represents 'r'
 * @param {boolean} captchaValid - Represents 's' (Captcha matches expected answer)
 * @param {boolean} g - Represents 'g' (Google OAuth success)
 * @returns {Object} - Result details including boolean variables and evaluation logs
 */
export function authenticateUser(username, password, selectedRole, rememberDevice, captchaValid, g = false, users = usersDb) {
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  
  let passwordValid = false;
  if (user) {
    if (user.passwordCipher && (user.passwordCipher.startsWith('$2a$') || user.passwordCipher.startsWith('$2b$'))) {
      try {
        passwordValid = bcryptjs.compareSync(password, user.passwordCipher);
      } catch (e) {
        console.error("Bcrypt sync compare failed, falling back to simple comparison", e);
        passwordValid = sha256(password) === user.passwordCipher;
      }
    } else {
      passwordValid = sha256(password) === user.passwordCipher;
    }
  }

  const roleValid = !!user && selectedRole && user.roles.includes(selectedRole);
  // =========================================================================
  // ⚠️ LOGIKA MATEMATIKA UTAMA (WAJIB MASUK LAPORAN) ⚠️
  // Definisi Variabel Proposisi Keadaan Lingkungan:
  // p (Kredensial Valid): Password benar dan Role yang dipilih cocok.
  // q (Akun Aktif): Akun tidak dalam status ditangguhkan/suspended.
  // r (Device Dikenal): Pengguna mencentang "Ingat Perangkat Ini".
  // s (Captcha Valid): Pengguna menjawab captcha dengan benar.
  // =========================================================================
  const p = passwordValid && roleValid;

  const q = !!user && user.isActive;
  const r = !!rememberDevice;
  const s = !!captchaValid;

  const evaluation = evaluateBooleanAuth(p, q, r, s, g);

  return {
    user,
    variables: { p, q, r, s, g, roleValid },
    evaluation,
    status: getAuthStatus(passwordValid, p, q, r, s, g, evaluation.L, roleValid)
  };
}

/**
 * Determines the readable status of the authentication request
 */
function getAuthStatus(passwordValid, p, q, r, s, g, L, roleValid) {
  if (g) {
    if (!q) {
      return {
        code: 'ACCOUNT_SUSPENDED',
        message: 'Login Gagal: Otentikasi Google valid (g=T) tetapi akun ditangguhkan (q=F). L = False.',
        type: 'error'
      };
    }
    return {
      code: 'SUCCESS_GOOGLE',
      message: 'Login Sukses via Google: L bernilai TRUE (Melalui q ∧ g)',
      type: 'success'
    };
  }

  if (!passwordValid) {
    return {
      code: 'INVALID_CREDENTIALS',
      message: 'Login Gagal: Proposisi p bernilai FALSE (Kredensial Salah)',
      type: 'error'
    };
  }

  if (!roleValid) {
    return {
      code: 'INVALID_ROLE',
      message: 'Login Gagal: Role tidak sesuai dengan akun.',
      type: 'error'
    };
  }
  
  if (!q) {
    return {
      code: 'ACCOUNT_SUSPENDED',
      message: 'Login Gagal: Proposisi q bernilai FALSE (Akun Ditangguhkan)',
      type: 'error'
    };
  }

  if (r) {
    return {
      code: 'SUCCESS_TRUSTED',
      message: 'Login Sukses: L bernilai TRUE (Melalui p ∧ q ∧ r)',
      type: 'success'
    };
  }

  if (s) {
    return {
      code: 'SUCCESS_CAPTCHA',
      message: 'Login Sukses: L bernilai TRUE (Melalui p ∧ q ∧ ¬r ∧ s)',
      type: 'success'
    };
  }

  return {
    code: 'CAPTCHA_INVALID',
    message: 'Login Gagal: Perangkat baru dan Captcha tidak valid.',
    type: 'error'
  };
}
