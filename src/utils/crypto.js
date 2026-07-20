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
