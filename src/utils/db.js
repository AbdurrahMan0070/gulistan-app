// ─── Database Layer ────────────────────────────────────────────────────────────
import { hashPasswordSync, verifyPasswordSync } from './crypto';

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
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
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
    approved: false, // NEW: must be approved by first teacher / admin
    joinDate: todayStr(),
    ...data,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
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

export const getFeeSettings = () => SyncDB.get('gul_fee_settings') || {
  monthlyAmount: 500,
  upiId: '',
  upiName: 'Noorul-Uloom Gulistan',
  currency: 'INR',
};
export const saveFeeSettings = (s) => SyncDB.set('gul_fee_settings', s);

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

// Teacher: mark cash or verify online payment
export const teacherMarkFee = (monthKey, studentId, payload) => {
  const fees = getFees();
  fees[monthKey] = fees[monthKey] || {};
  fees[monthKey][studentId] = {
    ...fees[monthKey][studentId],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  saveFees(fees);
};

// Student: submit online payment for verification (pending)
export const studentSubmitPayment = (monthKey, studentId, txnId, amount, screenshotDataUrl = null) => {
  const fees = getFees();
  fees[monthKey] = fees[monthKey] || {};
  // Only allow if not already paid
  if (fees[monthKey][studentId]?.status === 'paid') return false;
  fees[monthKey][studentId] = {
    status: 'pending',
    method: 'online',
    txnId: txnId.trim().toUpperCase(),
    amount,
    // Store screenshot as data URL (base64). Kept small by resizing before upload.
    screenshot: screenshotDataUrl || null,
    submittedAt: new Date().toISOString(),
  };
  saveFees(fees);
  return true;
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
  const amount  = getFeeSettings().monthlyAmount || 500;
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
