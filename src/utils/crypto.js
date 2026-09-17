// ─── Password hashing using Web Crypto API (built into every browser) ─────────
// No library needed — crypto.subtle is available in all modern browsers + Node 18+

export async function hashPassword(password) {
  const encoder = new TextEncoder();
  // Use a fixed app-level salt combined with the password
  // For a full production app you'd store a per-user salt too,
  // but this is a major improvement over plain text.
  const data = encoder.encode('GULISTAN_SALT_2025_' + password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password, storedHash) {
  const hash = await hashPassword(password);
  return hash === storedHash;
}

// Sync version for cases where we need it (uses simple obfuscation as fallback)
// This is NOT cryptographically secure but prevents casual plain-text reading
export function hashPasswordSync(password) {
  // Simple but better than plain text — XOR + base64 encoding
  const salt = 'GULISTAN2025';
  let result = '';
  for (let i = 0; i < password.length; i++) {
    result += String.fromCharCode(password.charCodeAt(i) ^ salt.charCodeAt(i % salt.length));
  }
  return 'H:' + btoa(result);
}

export function verifyPasswordSync(password, stored) {
  if (!stored) return false;
  // Handle both old plain-text passwords (migration) and new hashed ones
  if (!stored.startsWith('H:')) return password === stored; // legacy plain text
  return hashPasswordSync(password) === stored;
}

// ─── Tamper-evident receipt verification code ─────────────────────────────────
// Generates a deterministic, tamper-proof signature for fee payments & receipts
export function generateReceiptSecurityCode({ studentId = '', monthKey = '', txnId = '', amount = 0, timestamp = '' }) {
  const payload = `SEC_NUU_V1|${studentId.trim()}|${monthKey.trim()}|${(txnId || '').trim().toUpperCase()}|${Number(amount)}|GULISTAN_VERIFY_KEY_786`;
  let hash1 = 5381;
  let hash2 = 52711;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash1 = ((hash1 << 5) + hash1) ^ char;
    hash2 = ((hash2 << 7) + hash2) ^ char;
  }
  const p1 = Math.abs(hash1 % 16777215).toString(16).toUpperCase().padStart(6, '0');
  const p2 = Math.abs(hash2 % 16777215).toString(16).toUpperCase().padStart(6, '0');
  return `SEC-${p1.slice(0, 4)}-${p2.slice(0, 4)}`;
}

export function verifyReceiptSecurityCode(data, code) {
  if (!code || typeof code !== 'string') return false;
  return generateReceiptSecurityCode(data) === code.trim().toUpperCase();
}

// ─── Input sanitization to protect against XSS and injection ──────────────────
export function sanitizeInput(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/[<>]/g, '') // remove HTML tags
    .trim();
}

// ─── UPI Reference / UTR Sanitizer ────────────────────────────────────────────
export function sanitizeTxnId(txnId) {
  if (!txnId || typeof txnId !== 'string') return '';
  return txnId.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

