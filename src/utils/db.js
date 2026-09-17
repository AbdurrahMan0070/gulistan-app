// ─── Database Layer ────────────────────────────────────────────────────────────
import { hashPasswordSync, verifyPasswordSync, generateReceiptSecurityCode, sanitizeInput, sanitizeTxnId } from './crypto';

const SyncDB = {
  get(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) {
      console.warn('Storage write failed:', e);
    }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch {}
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const uid = () => {
  // Use crypto.randomUUID if available (Chrome 92+, Firefox 95+, Safari 15.4+)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase();
  }
  // Fallback: timestamp + random
  return Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 8).toUpperCase();
};

export const todayStr = () => new Date().toISOString().split('T')[0];

export const fmtDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  } catch { return d; }
};

export const initials = (name = '') =>
  name.trim().split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase();

export const AVATAR_COLORS = [
  '#1D9E75','#2563EB','#7C3AED','#D85A30',
  '#DB2777','#D97706','#0891B2','#059669','#65A30D'
];

export const avatarColor = (id = '') =>
  AVATAR_COLORS[id.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];

// ─── Students ─────────────────────────────────────────────────────────────────
export const getStudents = () => SyncDB.get('gul_students') || [];
export const saveStudents = (s) => SyncDB.set('gul_students', s);

export const addStudent = (data) => {
  const student = {
    id: uid(),
    role: 'student',
    joinDate: todayStr(),
    ...data,
    name: sanitizeInput(data.name || '').trim(),
    email: (data.email || '').trim().toLowerCase(),
    phone: sanitizeInput(data.phone || ''),
    guardianName: sanitizeInput(data.guardianName || ''),
    class: sanitizeInput(data.class || 'General'),
    password: hashPasswordSync(data.password),
  };
  saveStudents([...getStudents(), student]);
  return { ...student }; // return copy without mutating
};

// ─── Teachers ─────────────────────────────────────────────────────────────────
export const getTeachers = () => SyncDB.get('gul_teachers') || [];
export const saveTeachers = (t) => SyncDB.set('gul_teachers', t);

export const addTeacher = (data) => {
  const teacher = {
    id: uid(),
    role: 'teacher',
    approved: false, // must be approved by first teacher / admin unless explicitly set
    joinDate: todayStr(),
    ...data,
    name: sanitizeInput(data.name || '').trim(),
    email: (data.email || '').trim().toLowerCase(),
    phone: sanitizeInput(data.phone || ''),
    password: hashPasswordSync(data.password),
  };
  saveTeachers([...getTeachers(), teacher]);
  return { ...teacher };
};

export const approveTeacher = (teacherId) => {
  const teachers = getTeachers().map(t =>
    t.id === teacherId ? { ...t, approved: true } : t
  );
  saveTeachers(teachers);
};

export const rejectTeacher = (teacherId) => {
  saveTeachers(getTeachers().filter(t => t.id !== teacherId));
};

// First teacher is auto-approved (they created the madrasa account)
export const isFirstTeacher = () => getTeachers().length === 0;

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const findUserByEmail = (email, password) => {
  const all = [...getStudents(), ...getTeachers()];
  const user = all.find(u => u.email === email.trim().toLowerCase());
  if (!user) return null;
  if (!verifyPasswordSync(password, user.password)) return null;
  return user;
};

export const emailExists = (email) => {
  const all = [...getStudents(), ...getTeachers()];
  return all.some(u => u.email === email.trim().toLowerCase());
};

export const validateEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

// Rate-limit: track login attempts per email (stored ephemerally in memory)
const _loginAttempts = {};
export const checkLoginRateLimit = (email) => {
  const key = email.toLowerCase();
  const now = Date.now();
  if (!_loginAttempts[key]) _loginAttempts[key] = [];
  // Keep only attempts in the last 5 minutes
  _loginAttempts[key] = _loginAttempts[key].filter(t => now - t < 5 * 60 * 1000);
  if (_loginAttempts[key].length >= 5) {
    return { blocked: true, remaining: Math.ceil((5 * 60 * 1000 - (now - _loginAttempts[key][0])) / 1000) };
  }
  _loginAttempts[key].push(now);
  return { blocked: false };
};

// ─── Attendance ───────────────────────────────────────────────────────────────
export const getAttendance = () => SyncDB.get('gul_attendance') || {};
export const saveAttendance = (a) => SyncDB.set('gul_attendance', a);

export const markAttendance = (date, studentId, status) => {
  // Prevent marking future dates
  if (date > todayStr()) return null;
  const att = getAttendance();
  att[date] = att[date] || {};
  att[date][studentId] = status;
  saveAttendance(att);
  return att;
};

export const finalizeDay = (date) => {
  const att = getAttendance();
  att[date] = att[date] || {};
  getStudents().forEach(s => {
    if (!att[date][s.id]) att[date][s.id] = 'absent';
  });
  saveAttendance(att);
  return att;
};

export const getDayRecord = (date) => getAttendance()[date] || {};

export const getStudentStats = (studentId) => {
  const att = getAttendance();
  const dates = Object.keys(att);
  const present = dates.filter(d => att[d][studentId] === 'present').length;
  const total   = dates.filter(d => att[d][studentId]).length;
  const pct     = total ? Math.round((present / total) * 100) : null;
  const history = dates
    .filter(d => att[d][studentId])
    .map(d => ({ date: d, status: att[d][studentId] }))
    .sort((a, b) => b.date.localeCompare(a.date));
  let streak = 0;
  for (const h of history) { if (h.status === 'present') streak++; else break; }
  return { present, total, pct, history, streak };
};

export const getOverallStats = () => {
  const students = getStudents();
  const teachers = getTeachers();
  const att      = getAttendance();
  const dates    = Object.keys(att);
  const avgAttendance = dates.length === 0 ? 0 : Math.round(
    dates.reduce((sum, d) => {
      const p = Object.values(att[d]).filter(v => v === 'present').length;
      return sum + (students.length ? (p / students.length) * 100 : 0);
    }, 0) / dates.length
  );
  return { totalStudents: students.length, totalTeachers: teachers.length, daysRecorded: dates.length, avgAttendance };
};

// ─── Session ──────────────────────────────────────────────────────────────────
export const getUser  = () => SyncDB.get('gul_user');
export const saveUser = (u) => {
  if (!u) { SyncDB.remove('gul_user'); return; }
  // Never store password in session
  const { password: _, ...safe } = u;
  SyncDB.set('gul_user', safe);
};

// ─── QR ───────────────────────────────────────────────────────────────────────
export const makeQRValue  = (s) => `GULISTAN:${s.id}:${s.name}`;
export const parseQRValue = (v) => {
  if (!v?.startsWith('GULISTAN:')) return null;
  return v.split(':')[1] || null;
};

// ─── Fees (single unified system) ─────────────────────────────────────────────
// Structure: { "2025-06": { "STUDENT_ID": { status, method, amount, paidAt, txnId } } }
export const getFees    = () => SyncDB.get('gul_fees') || {};
export const saveFees   = (f) => SyncDB.set('gul_fees', f);

export const getFeeSettings = () => {
  const s = SyncDB.get('gul_fee_settings');
  if (!s) {
    return {
      monthlyAmount: 200,
      upiId: '9820700711m@pnb',
      upiName: 'MADARSA NURUL ULOOM TRUST',
      currency: 'INR',
    };
  }
  // Auto-migrate legacy 500 default to 200
  if (s.monthlyAmount === 500 || !s.monthlyAmount) {
    s.monthlyAmount = 200;
  }
  return s;
};
export const saveFeeSettings = (s) => {
  const sanitized = {
    monthlyAmount: Math.max(1, Number(s.monthlyAmount) || 200),
    upiId: sanitizeInput(s.upiId || '9820700711m@pnb'),
    upiName: sanitizeInput(s.upiName || 'MADARSA NURUL ULOOM TRUST'),
    currency: 'INR',
  };
  return SyncDB.set('gul_fee_settings', sanitized);
};

export const currentMonthKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export const fmtMonth = (key) => {
  if (!key) return '—';
  try {
    const [y, m] = key.split('-');
    return new Date(+y, +m - 1, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  } catch { return key; }
};

export const last12Months = () => Array.from({ length: 12 }, (_, i) => {
  const d = new Date();
  d.setMonth(d.getMonth() - i);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
});

// Teacher: mark cash or verify online payment with audit trail & security hash
export const teacherMarkFee = (monthKey, studentId, payload) => {
  const fees = getFees();
  fees[monthKey] = fees[monthKey] || {};
  const existing = fees[monthKey][studentId] || {};
  const finalPayload = {
    ...existing,
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  // Attach tamper-proof security hash if marking paid
  if (finalPayload.status === 'paid' && !finalPayload.securityHash) {
    finalPayload.securityHash = generateReceiptSecurityCode({
      studentId,
      monthKey,
      txnId: finalPayload.txnId || 'CASH',
      amount: finalPayload.amount || 200,
      timestamp: finalPayload.paidAt || finalPayload.updatedAt,
    });
  }

  fees[monthKey][studentId] = finalPayload;
  saveFees(fees);
};

// Check for duplicate UPI transaction IDs / UTR across all students and months
export const checkDuplicateTxnId = (txnId, currentMonthKey, currentStudentId) => {
  const clean = sanitizeTxnId(txnId);
  if (!clean) return { duplicate: false };
  const fees = getFees();
  for (const [mKey, records] of Object.entries(fees)) {
    for (const [sId, rec] of Object.entries(records)) {
      // Exclude if it's the current student's existing record for this exact month (e.g. resubmitting)
      if (mKey === currentMonthKey && sId === currentStudentId) continue;
      if (rec?.txnId && sanitizeTxnId(rec.txnId) === clean) {
        return {
          duplicate: true,
          status: rec.status,
          month: mKey,
          studentId: sId,
        };
      }
    }
  }
  return { duplicate: false };
};

// Student: submit online payment for verification with fraud checks & tamper-evident signature
export const studentSubmitPayment = (monthKey, studentId, txnId, amount, screenshotDataUrl = null) => {
  const cleanTxnId = sanitizeTxnId(txnId);
  if (!cleanTxnId || cleanTxnId.length < 8 || cleanTxnId.length > 28) {
    return { ok: false, error: 'Invalid UPI Transaction Code / UTR. Must be 8–28 letters or numbers.' };
  }

  // Prevent duplicate UTR submission across the system
  const dup = checkDuplicateTxnId(cleanTxnId, monthKey, studentId);
  if (dup.duplicate) {
    return {
      ok: false,
      error: `This Transaction ID (${cleanTxnId}) was already recorded for ${fmtMonth(dup.month)}. Please enter the unique UPI UTR from your payment app.`
    };
  }

  const fees = getFees();
  fees[monthKey] = fees[monthKey] || {};
  // Only allow if not already paid
  if (fees[monthKey][studentId]?.status === 'paid') {
    return { ok: false, error: 'Fee for this month is already marked as Paid.' };
  }

  const finalAmount = Number(amount) > 0 ? Number(amount) : (getFeeSettings().monthlyAmount || 200);
  const now = new Date().toISOString();
  const securityHash = generateReceiptSecurityCode({
    studentId,
    monthKey,
    txnId: cleanTxnId,
    amount: finalAmount,
    timestamp: now,
  });

  fees[monthKey][studentId] = {
    status: 'pending',
    method: 'online',
    txnId: cleanTxnId,
    amount: finalAmount,
    // Store screenshot as data URL (base64). Kept small by resizing before upload.
    screenshot: screenshotDataUrl || null,
    submittedAt: now,
    securityHash,
  };
  saveFees(fees);
  return { ok: true, securityHash };
};

export const getMonthFeeRecord = (monthKey, studentId) =>
  getFees()[monthKey]?.[studentId] || null;

export const getStudentFeeHistory = (studentId) => {
  const fees = getFees();
  return Object.entries(fees)
    .map(([month, records]) => ({ month, record: records[studentId] || null }))
    .filter(x => x.record)
    .sort((a, b) => b.month.localeCompare(a.month));
};

export const getMonthFeeStats = (monthKey) => {
  const fees   = getFees()[monthKey] || {};
  const students = getStudents();
  const paid    = students.filter(s => fees[s.id]?.status === 'paid').length;
  const pending = students.filter(s => fees[s.id]?.status === 'pending').length;
  const unpaid  = students.length - paid - pending;
  const amount  = getFeeSettings().monthlyAmount || 200;
  const collected = students
    .filter(s => fees[s.id]?.status === 'paid')
    .reduce((sum, s) => sum + (fees[s.id]?.amount || amount), 0);
  return { paid, pending, unpaid, total: students.length, collected };
};

// ─── Full attendance record (live, whole year) ────────────────────────────────
// Every day marked goes into gul_attendance permanently — this never resets,
// so it naturally becomes the full yearly (and multi-year) record.
// These helpers make it easy to browse one student's complete history.

export const getYearsRecorded = () => {
  const dates = Object.keys(getAttendance());
  const years = [...new Set(dates.map(d => d.slice(0, 4)))].sort((a, b) => b.localeCompare(a));
  return years.length ? years : [String(new Date().getFullYear())];
};

export const getStudentFullRecord = (studentId, year) => {
  const att = getAttendance();
  const dates = Object.keys(att)
    .filter(d => !year || d.startsWith(year))
    .sort((a, b) => b.localeCompare(a));

  const entries = dates
    .filter(d => att[d][studentId])
    .map(d => ({ date: d, status: att[d][studentId] }));

  const present = entries.filter(e => e.status === 'present').length;
  const absent  = entries.filter(e => e.status === 'absent').length;
  const total   = entries.length;
  const pct     = total ? Math.round((present / total) * 100) : null;

  // Group by month for a clean calendar-style breakdown
  const byMonth = {};
  entries.forEach(({ date, status }) => {
    const mKey = date.slice(0, 7); // YYYY-MM
    byMonth[mKey] = byMonth[mKey] || [];
    byMonth[mKey].push({ date, status });
  });
  const months = Object.entries(byMonth)
    .map(([month, days]) => ({
      month,
      days: days.sort((a, b) => a.date.localeCompare(b.date)),
      present: days.filter(d => d.status === 'present').length,
      total: days.length,
    }))
    .sort((a, b) => b.month.localeCompare(a.month));

  return { entries, present, absent, total, pct, months };
};
