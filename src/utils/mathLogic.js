import { usersDb } from './dummyDb.js';
import { sha256 } from './crypto.js';

/**
 * Propositional Variables:
 * p : Kredensial Benar (Username, password, dan role sesuai)
 * q : Akun Aktif (isActive === true)
 * r : Perangkat Dikenali / Terpercaya (Remember Device checked)
 * s : Captcha Benar (jawaban Captcha valid)
 * 
 * Formula:
 * L = (p ∧ q ∧ r) ∨ (p ∧ q ∧ ¬r ∧ s)
 */

/**
 * Core function to evaluate the boolean authentication expression
 * 
 * @param {boolean} p - Credentials validity
 * @param {boolean} q - Account active status
 * @param {boolean} r - Trusted device checkbox
 * @param {boolean} s - Captcha validity
 * @returns {Object} - Complete truth value map of the logical terms
 */
export function evaluateBooleanAuth(p, q, r, s) {
  const L = (p && q && r) || (p && q && !r && s);

  return {
    p,
    q,
    r,
    s,
    not_r: !r,
    p_and_q: p && q,
    term1: p && q && r,
    term2: p && q && !r && s,
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
 * @returns {Object} - Result details including boolean variables and evaluation logs
 */
export function authenticateUser(username, password, selectedRole, rememberDevice, captchaValid, users = usersDb) {
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  const passwordValid = !!user && sha256(password) === user.passwordCipher;
  const roleValid = !!user && selectedRole && user.roles.includes(selectedRole);
  const p = passwordValid && roleValid;

  const q = !!user && user.isActive;
  const r = !!rememberDevice;
  const s = !!captchaValid;

  const evaluation = evaluateBooleanAuth(p, q, r, s);

  return {
    user,
    variables: { p, q, r, s, roleValid },
    evaluation,
    status: getAuthStatus(passwordValid, p, q, r, s, evaluation.L, roleValid)
  };
}

/**
 * Determines the readable status of the authentication request
 */
function getAuthStatus(passwordValid, p, q, r, s, L, roleValid) {
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
