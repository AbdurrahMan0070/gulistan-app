// ─── Urdu translations (real Urdu script, Jameel Khushkhati font) ────────────

export const T = {
  // Welcome / Auth
  login:            'لاگ ان کریں',
  newAdmission:     'نئی داخلہ',
  registerMaulana:  'مولانا کے طور پر رجسٹر کریں',
  signIn:           'اندر آئیں',
  email:            'ای میل لکھیں',
  password:         'پاس ورڈ لکھیں',
  fullName:         'پورا نام',
  confirmPassword:  'پاس ورڈ دوبارہ لکھیں',
  dateOfBirth:      'پیدائش کی تاریخ',
  classLevel:       'جماعت / درجہ',
  guardianName:     'والد / سرپرست کا نام',
  guardianPhone:    'والد کا نمبر',
  phoneNumber:      'فون نمبر',
  completeAdmission:'داخلہ مکمل کریں',
  submitForApproval:'منظوری کے لیے بھیجیں',
  student:          'طالب علم',
  maulana:          'مولانا (استاد)',
  pendingApproval:  'آپ کا اکاؤنٹ مولانا کی منظوری کا انتظار کر رہا ہے',

  // Tabs / Navigation
  home:             'گھر',
  myQr:             'میرا کیو آر کوڈ',
  fees:             'فیس',
  history:          'پچھلا ریکارڈ',
  profile:          'میری معلومات',
  attendance:       'حاضری',
  students:         'طلباء',

  // Home screen
  assalamu:         'السلام علیکم',
  daysPresent:      'حاضر دن',
  attendancePct:    'حاضری فیصد',
  streak:           'لگاتار دن',
  totalRecorded:    'کل دن',
  showQrCode:       'کیو آر کوڈ دکھائیں',
  viewDownloadPrint:'دیکھیں · ڈاؤنلوڈ کریں · پرنٹ کریں',
  recentAttendance: 'پچھلی حاضری',
  noRecordsYet:     'ابھی کوئی ریکارڈ نہیں',
  attendFirstClass:  'پہلی کلاس میں آئیں',

  // Fee related
  feeDue:           'فیس باقی ہے',
  payNow:           'ابھی فیس ادا کریں',
  awaitingVerify:   'مولانا چیک کر رہے ہیں',
  paid:             'ادا ہو گیا',
  unpaid:           'باقی ہے',
  notPaid:          'ابھی تک نہیں دیا',
  paymentHistory:   'پہلے کا حساب',
  payViaUpi:        'یو پی آئی سے فیس دیں',
  enterTxnId:       'ادائیگی کا نمبر لکھیں',
  txnIdHelp:        'آپ کے یو پی آئی ایپ میں یہ نمبر ملے گا',
  submitPayment:    'بھیج دیں',
  alreadyPaid:      'میں نے پیسے بھیج دیے ہیں',
  copyUpiId:        'یو پی آئی آئی ڈی کاپی کریں',
  copied:           'کاپی ہو گیا',
  selectMonth:      'مہینہ چنیں',
  current:          'اس مہینے کا',
  uploadProof:      'ادائیگی کی تصویر لگائیں',
  uploadProofHelp:  'اسکرین شاٹ ضروری ہے - مولانا اس سے تصدیق کریں گے',

  // Attendance / Scanning
  scanQr:           'کیو آر اسکین کریں',
  finalize:         'دن ختم کریں',
  finalizeHelp:     'باقی سب کو غیر حاضر لکھ دے گا',
  present:          'حاضر',
  absent:           'غیر حاضر',
  unmarked:         'ابھی نہیں لکھا',
  notMarkedYet:     'طلباء ابھی مارک نہیں ہوئے',
  todaysRegister:   'آج کا رجسٹر',
  searchStudents:   'طلباء تلاش کریں',

  // Teacher fee management
  markCashPaid:     'نقد ملا — لکھ دیں',
  verifyPayment:    'صحیح ہے — تصدیق کریں',
  reject:           'غلط ہے — منع کریں',
  markUnpaid:       'باقی لکھ دیں',
  collectionProgress:'کتنا پیسہ آیا',
  collected:        'جمع ہو گیا',

  // Profile
  signOut:          'باہر جائیں',
  studentId:        'طالب علم کا نمبر',
  joined:           'کب آئے',
  pendingApprovals: 'نئے مولانا کی منظوری',
  approve:          'ٹھیک ہے — منظور',

  // Misc
  download:         'ڈاؤنلوڈ کریں',
  print:            'پرنٹ کریں',
  cancel:           'رہنے دیں',
  save:             'محفوظ کریں',
  settings:         'ترتیبات',
  back:             'پیچھے جائیں',
  done:             'ہو گیا',
  address:          'گھر کا پتہ (مختصر)',
  chooseApp:        'ایپ چنیں',
  payDirect:        'یا سیدھا یو پی آئی آئی ڈی پر بھیجیں',
  alreadyPaidTap:   'پہلے سے بھیج دیا؟ یہاں ٹیپ کریں',
  paymentCode:      'ادائیگی کا کوڈ (یو ٹی آر)',
  codeHelp:         'یو پی آئی ایپ میں ادائیگی کی تاریخ میں ملے گا',
};

export const tr = (key) => T[key] || '';
