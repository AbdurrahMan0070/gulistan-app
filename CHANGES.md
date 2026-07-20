# Gulistan App Tracker — v3 Update Notes

## 🔐 Security Fixes

### 1. Password hashing
Passwords are no longer stored as plain text. `src/utils/crypto.js` adds a
hashing layer (`hashPasswordSync` / `verifyPasswordSync`). All new
registrations are hashed before being saved to `localStorage`. Existing
plain-text passwords from before this update will still work (the verify
function detects and accepts the old format), but anyone re-registering
gets the new hashed format.

> Note: this is browser-side hashing (no salt-per-user yet), which is a big
> step up from plain text but is **not** equivalent to server-side bcrypt.
> For a production deployment with a real backend, move auth entirely
> server-side.

### 2. Teacher registration now requires approval
- The **first** teacher to register becomes the "lead Maulana" and is
  auto-approved — this is your madrasa admin account.
- Every subsequent teacher registration goes into a **pending** state
  (`approved: false`) and cannot log in until the lead Maulana approves
  them from **Profile → Pending Maulana Approvals**.
- This closes the "anyone can register as teacher and see all data" hole.

### 3. Login rate limiting
`checkLoginRateLimit()` in `db.js` blocks more than 5 login attempts per
email within a 5-minute window (in-memory, resets on page reload — a
real backend would persist this).

### 4. Stronger password requirements
Registration now requires **minimum 8 characters with at least one number**
(previously 6 chars, no complexity rules). Password fields have a show/hide
eye toggle for usability.

### 5. Session no longer stores password
`saveUser()` strips the password hash before writing the session to
`localStorage`, so the active session blob never contains credentials.

### 6. Removed the broken "cheat attempt" counter
The old `gul_cheat_attempts` localStorage counter was fully client-side and
trivially bypassable via DevTools. It has been removed. Fraudulent online
payments are now handled properly: students submit a Transaction ID, and
the **teacher must verify or reject** every online payment — rejecting
simply marks it `unpaid` again with no fake "security" theatre.

### 7. Removed base64 screenshot storage
The old fee system let students attach a base64-encoded payment screenshot,
which could be 1MB+ of text per submission — easily blowing through
localStorage's ~5–10MB limit after a handful of payments. Payments are now
verified by **Transaction ID (UTR number)** only, which is how UPI
verification actually works in practice.

---

## 🗂️ Unified Fee System

Previously there were two competing fee systems (`db.js` fee functions vs
a separate `fees.js` file with different data shapes). These have been
merged into a single source of truth in `db.js`:

- `getFeeSettings()` / `saveFeeSettings()` — monthly amount, UPI ID, display name
- `teacherMarkFee()` — teacher marks cash payment or verifies/rejects online payment
- `studentSubmitPayment()` — student submits a UPI transaction ID for verification
- `getMonthFeeStats()` — paid/pending/unpaid counts + total collected for a month
- `getStudentFeeHistory()` — full payment history for one student

### Student flow
1. Student goes to **Fees** tab, sees current month status
2. If unpaid, taps **Pay Now** → bottom sheet opens
3. Choose UPI app (GPay/PhonePe/Paytm/Any UPI) — opens the app via UPI deep
   link pre-filled with amount + the madrasa's UPI ID
4. After paying, comes back and enters the **Transaction ID (UTR)** from
   their UPI app
5. Status becomes "Awaiting Verification" — student **cannot** change this
   themselves

### Teacher flow
1. **Fees** tab shows Paid / Pending / Unpaid counts for selected month
2. Tap a student to expand → see method, amount, date, transaction ID
3. For pending online payments: **Verify** (marks paid) or **Reject**
   (back to unpaid)
4. For unpaid students who paid cash in person: **Mark Cash Paid**
5. **Settings** (top right) lets the lead Maulana set the monthly amount
   and UPI ID once for the whole madrasa

---

## 📱 Tab Bar — Fixed Cramping

**Before:** Teacher had 6 tabs (Home, Attendance, Fees, Students, Reports,
Profile) — too cramped on narrow phones, labels were getting cut off.

**After:** Teacher has **5 tabs**:
- Home
- Attendance
- Fees
- Students *(now includes Reports as a Directory/Reports toggle inside the tab)*
- Profile *(now also handles teacher approvals)*

Student app already had 5 tabs (Home, My QR, Fees, History, Profile) — kept
as-is, just restyled to match.

Tab icons are now `21px` (up from `20px`) with consistent spacing via the
`.tab-bar` / `.tab-btn` CSS classes — no more cramped icons.

---

## 📅 Date Validation

The attendance date picker (`TAttendance`) now:
- Has `max={today}` so the native date picker won't let you pick a future date
- Shows an inline error if a future date is somehow selected
- `markAttendance()` in `db.js` also rejects future dates server-side
  (well, "data-layer-side" since there's no server yet) as a second line
  of defense

---

## 🆔 Better ID Generation

`uid()` now uses `crypto.randomUUID()` when available (all modern browsers),
falling back to the old timestamp+random method only on very old browsers.
This eliminates the theoretical collision risk from two students
registering in the same millisecond.

---

## What's Still Recommended (Future Work)

These require backend infrastructure and were out of scope for this pass:

1. **Move to a real backend** (Firebase/Supabase) so data syncs across
   devices — currently everything is per-device localStorage
2. **Server-side password hashing** with bcrypt + per-user salts
3. **Real Razorpay/UPI webhook integration** for instant payment
   verification instead of manual Transaction ID entry
4. **Push notifications** for fee reminders at the start of each month
5. **Audit log** of who marked what attendance/payment and when
