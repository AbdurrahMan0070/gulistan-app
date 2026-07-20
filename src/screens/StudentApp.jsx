import React, { useState, useRef } from 'react';
import {
  Home, QrCode, IndianRupee, ClipboardList, User, LogOut,
  CheckCircle2, XCircle, TrendingUp, Flame, Calendar,
  GraduationCap, Phone, Mail, Hash, UserCheck,
  Download, Printer, Info, CreditCard, Clock,
  AlertCircle, Smartphone, Copy, Check, MapPin, Image as ImageIcon,
} from 'lucide-react';
import { Header, Avatar, Toast, Card, StatCard, Pill, Empty, QRCode, ProgressBar, BigBtn, Sub } from '../components/UI';
import { T } from '../utils/translate';
import {
  getStudentStats, fmtDate, makeQRValue,
  currentMonthKey, fmtMonth, last12Months,
  getMonthFeeRecord, getStudentFeeHistory,
  studentSubmitPayment, getFeeSettings,
} from '../utils/db';

// 5 tabs — simple, short labels, each with Urdinglish under
const TABS = [
  { id:'home',    Icon:Home,         label:'Home',    ur:"گھر" },
  { id:'qr',      Icon:QrCode,       label:'My QR',   ur:"کیو آر کوڈ" },
  { id:'fees',    Icon:IndianRupee,  label:'Fees',    ur:"فیس" },
  { id:'history', Icon:ClipboardList,label:'History', ur:"پچھلا ریکارڈ" },
  { id:'profile', Icon:User,         label:'Profile', ur:"میری معلومات" },
];

export function StudentApp({ user, onLogout }) {
  const [tab, setTab]   = useState('home');
  const [, tick]        = useState(0);
  const refresh         = () => tick(n => n+1);
  const stats           = getStudentStats(user.id);

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:'var(--n50)', overflow:'hidden' }}>
      <div className="scroll">
        <div key={tab} className="tab-screen">
          {tab==='home'    && <SHome    user={user} stats={stats} goQR={()=>setTab('qr')} goFees={()=>setTab('fees')}/>}
          {tab==='qr'      && <SQR      user={user}/>}
          {tab==='fees'    && <SFees    user={user} refresh={refresh}/>}
          {tab==='history' && <SHistory stats={stats}/>}
          {tab==='profile' && <SProfile user={user} stats={stats} onLogout={onLogout}/>}
        </div>
      </div>

      <div className="tab-bar">
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn${tab===t.id?' active':''}`} onClick={()=>setTab(t.id)}>
            {tab===t.id && <div className="tab-active-dot"/>}
            <div className="tab-icon"><t.Icon size={21} strokeWidth={tab===t.id?2.2:1.8}/></div>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Home — only 2 key cards, no clutter ────────────────────────────────────────
function SHome({ user, stats, goQR, goFees }) {
  const { present, total, pct, streak, history } = stats;
  const settings = getFeeSettings();
  const currRec  = getMonthFeeRecord(currentMonthKey(), user.id);
  const feeStatus = !currRec ? 'unpaid' : currRec.status;

  return (
    <>
      <Header title={`Assalamu Alaykum, ${user.name.split(' ')[0]}`} sub="Your attendance summary" urdu="السلام علیکم ورحمۃ اللہ"/>
      <div className="page-body">

        {/* Fee alert — only if action needed */}
        {feeStatus !== 'paid' && (
          <div onClick={goFees} style={{ background: feeStatus==='pending' ? 'linear-gradient(135deg,#92400E,#D97706)' : 'linear-gradient(135deg,#991B1B,#E5412A)', borderRadius:'var(--r-lg)', padding:'16px 18px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 4px 16px rgba(229,65,42,0.25)' }}>
            <div>
              <p style={{ color:'white', fontSize:14.5, fontWeight:700, margin:0 }}>
                {feeStatus==='pending' ? 'Fee is being checked' : `Fee Due — ₹${settings.monthlyAmount || 500}`}
              </p>
              <p style={{ color:'rgba(255,255,255,0.7)', fontSize:11, margin:'2px 0 0', fontStyle:'italic' }}>
                {feeStatus==='pending' ? T.awaitingVerify : "فیس باقی ہے"}
              </p>
            </div>
            <div style={{ background:'rgba(255,255,255,0.18)', borderRadius:10, padding:'8px 14px' }}>
              <p style={{ color:'white', fontSize:12, fontWeight:700, margin:0 }}>{feeStatus==='pending'?'Check':'Pay'}</p>
            </div>
          </div>
        )}

        {/* Simple 2-number summary instead of 4 cards */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <StatCard label="Days Present" value={present} color="var(--g400)" iconBg="var(--g50)" Icon={CheckCircle2} sub={{text:'حاضر دن',color:'var(--n400)'}}/>
          <StatCard label="Attendance"   value={pct!=null?pct+'%':'—'} color={pct==null?'var(--n400)':pct>=75?'var(--g400)':'var(--danger)'} iconBg={pct==null?'var(--n100)':pct>=75?'var(--g50)':'var(--danger-bg)'} Icon={TrendingUp} sub={{text:'حاضری فیصد',color:'var(--n400)'}}/>
        </div>

        {/* QR shortcut — the most important action */}
        <div onClick={goQR} style={{ background:'linear-gradient(135deg,var(--g800),var(--g600))', borderRadius:'var(--r-lg)', padding:'20px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'var(--shadow-green)' }}>
          <div>
            <p style={{ color:'white', fontSize:16, fontWeight:700, margin:0, letterSpacing:-0.2 }}>Show My QR Code</p>
            <p style={{ color:'rgba(255,255,255,0.55)', fontSize:11.5, margin:'3px 0 0', fontStyle:'italic' }}>QR کوڈ دکھائیں</p>
          </div>
          <div style={{ background:'rgba(255,255,255,0.14)', borderRadius:12, padding:14 }}>
            <QrCode size={28} color="white" strokeWidth={1.8}/>
          </div>
        </div>

        {/* Recent attendance — just last 5, no extra cards */}
        <Card>
          <div style={{ marginBottom:12 }}>
            <p style={{ fontSize:13, fontWeight:700, color:'var(--n700)', margin:0 }}>Recent Attendance</p>
            <p className="urdu-sub" style={{textAlign:"center",display:"block",width:"100%",marginTop:3}}>پچھلی حاضری</p>
          </div>
          {history.length===0
            ? <p style={{ color:'var(--n400)', fontSize:13, padding:'16px 0', textAlign:'center' }}>No records yet</p>
            : history.slice(0,5).map(({date,status}) => (
              <div key={date} className="list-row">
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  {status==='present' ? <CheckCircle2 size={15} color="var(--g400)" strokeWidth={2.2}/> : <XCircle size={15} color="var(--danger)" strokeWidth={2.2}/>}
                  <span className="list-row-label">{fmtDate(date)}</span>
                </div>
                <Pill color={status==='present'?'green':'red'}>{status==='present'?'Present':'Absent'}</Pill>
              </div>
            ))
          }
        </Card>
      </div>
    </>
  );
}

// ── QR Tab ─────────────────────────────────────────────────────────────────────
function SQR({ user }) {
  const qrVal    = makeQRValue(user);
  const printRef = useRef(null);
  const [toast, setToast] = useState(null);
  const toast_ = (msg, type='success') => setToast({ msg, type });

  const downloadQR = () => {
    try {
      const svgEl = printRef.current?.querySelector('svg');
      if (!svgEl) { toast_('Could not find QR code', 'error'); return; }
      const PAD=32, QS=220, CW=QS+PAD*2, CH=360;
      const canvas = document.createElement('canvas');
      const DPR = 2; canvas.width=CW*DPR; canvas.height=CH*DPR;
      const ctx = canvas.getContext('2d'); ctx.scale(DPR, DPR);
      ctx.fillStyle='#FFFFFF'; ctx.beginPath(); ctx.roundRect(0,0,CW,CH,18); ctx.fill();
      ctx.fillStyle='#0a3d20'; ctx.beginPath(); ctx.roundRect(0,0,CW,56,[18,18,0,0]); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,0.6)'; ctx.font='500 11px Inter,sans-serif'; ctx.textAlign='center'; ctx.fillText('GULISTAN APP TRACKER',CW/2,24);
      ctx.fillStyle='white'; ctx.font='700 15px Inter,sans-serif'; ctx.fillText('Madrasa Attendance Card',CW/2,43);
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const blob = new Blob([svgData],{type:'image/svg+xml'});
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img,PAD,68,QS,QS); URL.revokeObjectURL(url);
        ctx.fillStyle='#0D0D0D'; ctx.font='700 17px Inter,sans-serif'; ctx.textAlign='center';
        ctx.fillText(user.name.length>26?user.name.slice(0,24)+'…':user.name, CW/2, 68+QS+28);
        ctx.fillStyle='#EDF9F4'; ctx.beginPath(); ctx.roundRect(CW/2-60,68+QS+36,120,24,12); ctx.fill();
        ctx.fillStyle='#0A6640'; ctx.font='600 11px Inter,sans-serif'; ctx.fillText(user.class||'General',CW/2,68+QS+52);
        ctx.fillStyle='#9A9A9A'; ctx.font='500 10px monospace'; ctx.fillText(`ID: ${user.id}`,CW/2,68+QS+80);
        ctx.fillStyle='#C4C4C4'; ctx.font='400 9.5px Inter,sans-serif'; ctx.fillText('Show this card to Maulana for attendance',CW/2,CH-14);
        canvas.toBlob(b => {
          const a=document.createElement('a'); a.href=URL.createObjectURL(b);
          a.download=`MNUT-QR-${user.name.replace(/\s+/g,'-')}.png`;
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          toast_('Downloaded! — Download Ho Gaya');
        },'image/png',0.95);
      };
      img.onerror = () => toast_('Download failed','error');
      img.src = url;
    } catch(err) { toast_('Download failed','error'); }
  };

  const printQR = () => {
    const svgEl = printRef.current?.querySelector('svg');
    if (!svgEl) return;
    const svgStr = new XMLSerializer().serializeToString(svgEl);
    const w = window.open('','_blank','width=600,height=760');
    if (!w) { toast_('Allow popups to print','error'); return; }
    w.document.write(`<!DOCTYPE html><html><head><title>Attendance QR — ${user.name}</title>
    <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,sans-serif;background:#f5f5f5;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:24px;gap:20px}.card{background:white;border-radius:20px;overflow:hidden;width:300px;box-shadow:0 8px 40px rgba(0,0,0,0.12)}.hdr{background:linear-gradient(135deg,#062010,#0F5230);padding:16px 20px;text-align:center}.brand{color:rgba(255,255,255,.5);font-size:10px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:4px}.title{color:white;font-size:15px;font-weight:700}.qr{padding:22px 24px 14px;display:flex;justify-content:center}.qr svg{border-radius:10px}.info{padding:0 20px 22px;text-align:center}.name{font-size:17px;font-weight:800;color:#0D0D0D;margin-bottom:8px}.cls{display:inline-block;background:#EDF9F4;color:#0A6640;border:1px solid #C4EEE1;padding:4px 14px;border-radius:20px;font-size:11px;font-weight:600;margin-bottom:9px}.id{font-family:monospace;font-size:15px;font-weight:700;color:#1D9E75;letter-spacing:2px;margin-bottom:8px}.note{font-size:11px;color:#9CA3AF;line-height:1.5}.footer{background:#F8F8F8;border-top:1px solid #F0F0F0;padding:10px 20px;text-align:center;font-size:9.5px;color:#C4C4C4}.guide{background:white;border-radius:14px;padding:16px 20px;width:300px;box-shadow:0 2px 12px rgba(0,0,0,0.06)}.guide h3{font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.8px;margin-bottom:10px}.guide ol{padding-left:16px}.guide li{font-size:12px;color:#6B6B6B;margin-bottom:5px;line-height:1.5}@media print{body{background:white}.card,.guide{box-shadow:none;border:1px solid #E5E7EB}}</style>
    </head><body>
    <div class="card"><div class="hdr"><div class="brand">Noor Ulum Trust</div><div class="title">Madrasa Attendance Card</div></div>
    <div class="qr">${svgStr}</div>
    <div class="info"><div class="name">${user.name}</div><div class="cls">${user.class||'General'}</div><div class="id">${user.id}</div><div class="note">Show this card to your Maulana every class day to mark attendance</div></div>
    <div class="footer">Noor Ulum Trust · Madrasa Attendance System</div></div>
    <div class="guide"><h3>Instructions</h3><ol><li>Print this card and cut it out.</li><li>Laminate or keep it safe.</li><li>Bring it to every class.</li><li>Show it to your Maulana.</li></ol></div>
    <script>window.onload=()=>window.print()<\/script></body></html>`);
    w.document.close();
  };

  return (
    <>
      <Header title="My QR Code" sub="Download or print your card" urdu="میرا QR کوڈ"/>
      <div style={{ padding:'1.5rem', display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
        <div ref={printRef} style={{ background:'white', borderRadius:20, overflow:'hidden', width:'100%', maxWidth:300, boxShadow:'var(--shadow-xl)' }}>
          <div style={{ background:'linear-gradient(135deg,#062010,#0F5230)', padding:'16px 20px', textAlign:'center' }}>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:10, fontWeight:600, letterSpacing:2.5, textTransform:'uppercase', margin:'0 0 3px' }}>Noor Ulum Trust</p>
            <p style={{ color:'white', fontSize:14, fontWeight:700, margin:0 }}>Madrasa Attendance Card</p>
          </div>
          <div style={{ padding:'22px 24px 14px', display:'flex', justifyContent:'center' }}>
            <QRCode value={qrVal} size={200}/>
          </div>
          <div style={{ padding:'0 20px 20px', textAlign:'center' }}>
            <h2 style={{ fontSize:17, fontWeight:800, color:'var(--n900)', margin:'0 0 8px', letterSpacing:-0.3 }}>{user.name}</h2>
            <div style={{ display:'flex', gap:7, flexWrap:'wrap', justifyContent:'center' }}>
              <Pill color="green"><GraduationCap size={11}/>{user.class||'General'}</Pill>
              <Pill color="purple"><Hash size={11}/>{user.id}</Pill>
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, width:'100%' }}>
          <button onClick={downloadQR} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'14px 16px', borderRadius:'var(--r-sm)', border:'none', background:'var(--g400)', color:'white', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit', boxShadow:'var(--shadow-green)' }}>
            <Download size={16} strokeWidth={2.2}/>Download
          </button>
          <button onClick={printQR} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'14px 16px', borderRadius:'var(--r-sm)', border:'1.5px solid var(--n200)', background:'white', color:'var(--n800)', fontWeight:700, fontSize:14, cursor:'pointer', fontFamily:'inherit' }}>
            <Printer size={16} strokeWidth={2}/>Print
          </button>
        </div>
        <p className="urdu-sub" style={{margin:"-4px 0 4px",textAlign:"center"}}>ڈاؤنلوڈ کریں · پرنٹ کریں</p>

        {/* Simple 3-step guide instead of long list */}
        <Card style={{ width:'100%' }}>
          <div style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:6 }}>
            <Info size={16} color="var(--g500)" strokeWidth={2} style={{ flexShrink:0, marginTop:2 }}/>
            <div>
              <p style={{ fontSize:13, fontWeight:700, color:'var(--n900)', margin:0 }}>Phones aren't allowed in Madrasa?</p>
              <p style={{ fontSize:11.5, color:'var(--n400)', margin:'2px 0 0', fontStyle:'italic' }}>مدرسے میں فون نہیں لے جا سکتے؟</p>
            </div>
          </div>
          <p style={{ fontSize:12.5, color:'var(--n600)', margin:'10px 0 0', lineHeight:1.7 }}>
            Print this card, cut it out, and bring it every day instead. Show it to Maulana to mark attendance.
          </p>
        </Card>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)}/>}
    </>
  );
}

// ── Fees Tab — simplified flow ──────────────────────────────────────────────────
function SFees({ user, refresh }) {
  const [month,    setMonth]    = useState(currentMonthKey());
  const [showPay,  setShowPay]  = useState(false);
  const [toast,    setToast]    = useState(null);
  const [, tick] = useState(0);
  const re = () => { tick(n=>n+1); refresh(); };
  const toast_ = (msg, type='success') => setToast({ msg, type });

  const settings = getFeeSettings();
  const amount   = settings.monthlyAmount || 500;
  const rec      = getMonthFeeRecord(month, user.id);
  const history  = getStudentFeeHistory(user.id);
  const months   = last12Months();

  const feeState = !rec ? 'unpaid' : rec.status;

  const stateStyle = {
    paid:    { bg:'#EDF9F4', border:'#9FE1CB', tc:'#0A6640', Icon:CheckCircle2, iconColor:'var(--g400)', label:'Paid',    ur:T.paid },
    pending: { bg:'#FFFBEB', border:'#FDE68A', tc:'#92400E', Icon:Clock,        iconColor:'#D97706',    label:'Checking', ur:T.awaitingVerify },
    unpaid:  { bg:'#FEF2F0', border:'#FECACA', tc:'#B91C1C', Icon:AlertCircle,  iconColor:'var(--danger)', label:'Not Paid', ur:T.unpaid },
  };
  const ss = stateStyle[feeState];

  return (
    <>
      <Header title="Fee Payment" sub="Pay or check your fee status" urdu="ماہانہ فیس"/>
      <div className="page-body">

        <div>
          <label className="field-label" style={{ display:'block', marginBottom:6 }}>Select Month<span style={{ display:'block', fontWeight:500, fontStyle:'italic', textTransform:'none', letterSpacing:0.1, fontSize:10.5, color:'var(--n400)', marginTop:2 }}>مہینہ چنیں</span></label>
          <select value={month} onChange={e => setMonth(e.target.value)} className="field-select">
            {months.map(m => <option key={m} value={m}>{fmtMonth(m)}{m===currentMonthKey()?' (Current)':''}</option>)}
          </select>
        </div>

        {/* Status card */}
        <div style={{ background:ss.bg, border:`1.5px solid ${ss.border}`, borderRadius:'var(--r-lg)', padding:'20px', display:'flex', alignItems:'center', gap:16 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:'white', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'var(--shadow-xs)' }}>
            <ss.Icon size={26} color={ss.iconColor} strokeWidth={2}/>
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:12, color:ss.tc, margin:'0 0 3px', fontWeight:600 }}>{fmtMonth(month)}</p>
            <p style={{ fontSize:17, fontWeight:800, color:ss.tc, margin:0, letterSpacing:-.3 }}>{ss.label}</p>
            <p style={{ fontSize:11, color:ss.tc, margin:'2px 0 0', fontStyle:'italic' }}>{ss.ur}</p>
            {feeState==='unpaid' && month===currentMonthKey() && <p style={{ fontSize:22, fontWeight:800, color:ss.tc, margin:'6px 0 0', letterSpacing:-1 }}>₹{amount.toLocaleString()}</p>}
          </div>
        </div>

        {feeState==='unpaid' && month===currentMonthKey() && (
          <BigBtn en="Pay Now" ur="ابھی فیس ادا کریں" icon={CreditCard} onClick={() => setShowPay(true)}/>
        )}

        {feeState==='pending' && (
          <Card style={{ background:'#FFFBEB', border:'1px solid #FDE68A' }}>
            <p style={{ fontSize:12.5, color:'#92400E', margin:0, lineHeight:1.6 }}>
              Your payment is being checked by Maulana. It usually takes a few hours.
              {rec?.txnId && <><br/>Your code: <strong style={{ fontFamily:'monospace' }}>{rec.txnId}</strong></>}
            </p>
          </Card>
        )}

        {/* History — compact */}
        <div>
          <p style={{ fontSize:13, fontWeight:700, color:'var(--n700)', margin:'0 0 10px' }}>Payment History <span style={{ fontSize:11, fontWeight:500, color:'var(--n400)', fontStyle:'italic' }}></span></p>
          {history.length===0
            ? <Card><p style={{ color:'var(--n400)', fontSize:13, textAlign:'center', padding:'16px 0' }}>No payments yet</p></Card>
            : history.map(({ month:m, record:r }) => {
              const st = r.status==='paid'?'paid':r.status==='pending'?'pending':'unpaid';
              const s  = stateStyle[st];
              return (
                <div key={m} style={{ display:'flex', alignItems:'center', gap:12, background:'white', borderRadius:'var(--r)', padding:'13px 16px', marginBottom:8, border:'1px solid var(--n200)' }}>
                  <div style={{ width:40, height:40, borderRadius:'var(--r-sm)', background:s.bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <s.Icon size={19} color={s.iconColor} strokeWidth={2}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13.5, fontWeight:600, color:'var(--n900)', margin:0 }}>{fmtMonth(m)}</p>
                    <p style={{ fontSize:11, color:'var(--n400)', margin:'2px 0 0' }}>{r.method==='cash'?'Cash':'Online'}</p>
                  </div>
                  <Pill color={st==='paid'?'green':st==='pending'?'amber':'red'}>{s.label}</Pill>
                </div>
              );
            })
          }
        </div>
      </div>

      {showPay && (
        <PaymentModal
          user={user} monthKey={month} amount={amount} settings={settings}
          onClose={() => setShowPay(false)}
          onPaid={() => { setShowPay(false); re(); toast_('Sent! Maulana will check it soon.'); }}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)}/>}
    </>
  );
}


// ── Resize image before storing (keeps localStorage safe) ────────────────────
function resizeImage(file, maxW = 800, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Payment Modal — UPI + screenshot proof ────────────────────────────────────
function PaymentModal({ user, monthKey, amount, settings, onClose, onPaid }) {
  const [step,       setStep]       = useState('choose');
  const [txnId,      setTxnId]      = useState('');
  const [screenshot, setScreenshot] = useState(null);
  const [copied,     setCopied]     = useState(false);
  const [err,        setErr]        = useState('');
  const [uploading,  setUploading]  = useState(false);
  const [usedApp,    setUsedApp]    = useState(null); // track which app was opened
  const fileInputRef                = useRef(null);

  const upiId   = settings.upiId   || 'noorulum@upi';
  const upiName = settings.upiName || 'Noor Ulum Trust';

  // UPI payment note shown to payee inside the app
  const payNote = encodeURIComponent(`Fees ${fmtMonth(monthKey)} - ${user.name}`);
  const amountStr = Number(amount).toFixed(2);

  // ── UPI deep link builders per app ──────────────────────────────────────────
  // Standard UPI intent URL — works on all Android apps when opened via window.location
  // Each app also has its own custom scheme for direct launch
  const buildUpiUrl = (scheme) =>
    `${scheme}?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${amountStr}&cu=INR&tn=${payNote}`;

  const UPI_APPS = [
    {
      id: 'gpay',
      label: 'Google Pay',
      color: '#4285F4',
      iconColor: '#fff',
      // GPay uses "tez" scheme on Android; iOS uses universal link
      androidUrl: buildUpiUrl('tez://upi/pay'),
      iosUrl:     `https://pay.google.com/payments/v4p0/app?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(upiName)}&am=${amountStr}&cu=INR&tn=${payNote}`,
      utrHelp:    'Open Google Pay → History → tap the payment → copy the UPI Reference ID (12 digits)',
      utrHelpUr:  'Google Pay کھولیں → History → ادائیگی → UPI Reference ID کاپی کریں',
    },
    {
      id: 'phonepe',
      label: 'PhonePe',
      color: '#5F259F',
      iconColor: '#fff',
      androidUrl: buildUpiUrl('phonepe://pay'),
      iosUrl:     buildUpiUrl('phonepe://pay'),
      utrHelp:    'Open PhonePe → History → tap the payment → copy the Transaction ID / UTR',
      utrHelpUr:  'PhonePe کھولیں → History → ادائیگی → Transaction ID کاپی کریں',
    },
    {
      id: 'paytm',
      label: 'Paytm',
      color: '#00BAF2',
      iconColor: '#fff',
      // Paytm uses paytmmp scheme
      androidUrl: buildUpiUrl('paytmmp://pay'),
      iosUrl:     buildUpiUrl('paytmmp://pay'),
      utrHelp:    'Open Paytm → Passbook → tap the payment → copy the Reference / UTR number',
      utrHelpUr:  'Paytm کھولیں → Passbook → ادائیگی → Reference نمبر کاپی کریں',
    },
    {
      id: 'other',
      label: 'Other UPI App',
      color: '#6B7280',
      iconColor: '#fff',
      // Universal UPI intent — Android shows app picker, iOS may prompt
      androidUrl: buildUpiUrl('upi://pay'),
      iosUrl:     buildUpiUrl('upi://pay'),
      utrHelp:    'Open your UPI app → payment history → find this payment → copy the UTR / Reference ID',
      utrHelpUr:  'اپنی UPI ایپ کھولیں → Payment History → یہ ادائیگی → UTR نمبر کاپی کریں',
    },
  ];

  // Detect iOS
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  const openUPI = (app) => {
    setUsedApp(app);
    const url = isIOS ? app.iosUrl : app.androidUrl;

    // Try to open the app; if it fails (app not installed), fall back to universal UPI
    const fallback = setTimeout(() => {
      // App didn't open — try universal UPI intent
      window.location.href = buildUpiUrl('upi://pay');
    }, 1200);

    window.location.href = url;

    // Clear fallback if page loses focus (app opened successfully)
    window.addEventListener('blur', () => clearTimeout(fallback), { once: true });

    // After returning from payment app, move to confirmation step
    // Use visibilitychange to detect when user comes back
    const handleReturn = () => {
      if (document.visibilityState === 'visible') {
        document.removeEventListener('visibilitychange', handleReturn);
        setStep('upi');
      }
    };
    document.addEventListener('visibilitychange', handleReturn);

    // Safety fallback: go to step after 3s even if visibilitychange doesn't fire
    setTimeout(() => {
      document.removeEventListener('visibilitychange', handleReturn);
      setStep('upi');
    }, 3000);
  };

  const copyUPI = () => {
    navigator.clipboard.writeText(upiId).catch(()=>{});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErr('Please select an image file'); return; }
    setUploading(true);
    try {
      const resized = await resizeImage(file);
      setScreenshot(resized);
      setErr('');
    } catch { setErr('Could not read image. Try again.'); }
    setUploading(false);
  };

  const confirmPayment = () => {
    if (!txnId.trim() || txnId.trim().length < 6) {
      setErr('Please enter the payment code from your UPI app');
      return;
    }
    if (!screenshot) {
      setErr('Please upload a screenshot of your payment');
      return;
    }
    const ok = studentSubmitPayment(monthKey, user.id, txnId, amount, screenshot);
    if (ok) onPaid();
    else setErr('Already submitted for this month');
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(10,20,12,0.78)', zIndex:3000, display:'flex', alignItems:'flex-end', backdropFilter:'blur(5px)' }}>
      <div style={{ background:'white', borderRadius:'24px 24px 0 0', width:'100%', maxHeight:'92vh', overflowY:'auto', paddingBottom:32 }}>

        {/* Handle */}
        <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 8px' }}>
          <div style={{ width:40, height:4, background:'var(--n200)', borderRadius:2 }}/>
        </div>

        {/* Header */}
        <div style={{ padding:'0 20px 14px', borderBottom:'1px solid var(--n100)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h3 style={{ fontSize:16.5, fontWeight:700, color:'var(--n900)', margin:0 }}>
              {step==='choose' ? 'Pay Fees' : 'Confirm Payment'}
            </h3>
            <span className="urdu-sub" style={{textAlign:"center",display:"block"}}>{step==='choose' ? 'ابھی فیس ادا کریں' : 'بھیج دیں'}</span>
          </div>
          <button onClick={onClose} style={{ background:'var(--n100)', border:'none', borderRadius:'50%', width:34, height:34, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <XCircle size={16} color="var(--n600)" strokeWidth={2}/>
          </button>
        </div>

        <div style={{ padding:'18px 20px', display:'flex', flexDirection:'column', gap:14 }}>

          {/* ── Step 1: Choose payment method ── */}
          {step==='choose' && <>
            <div style={{ background:'linear-gradient(135deg,#0a3d20,#1D9E75)', borderRadius:'var(--r-lg)', padding:'18px 20px', textAlign:'center' }}>
              <span className="urdu-sub" style={{ color:'rgba(255,255,255,0.65)', fontSize:12 }}>فیس باقی ہے</span>
              <p style={{ color:'white', fontSize:32, fontWeight:800, margin:'4px 0 0', letterSpacing:-1 }}>₹{amount.toLocaleString()}</p>
            </div>

            <div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <p style={{ fontSize:12, fontWeight:700, color:'var(--n600)', margin:0 }}>Choose UPI App</p>
                <span className="urdu-sub" style={{textAlign:"center",display:"block"}}>ایپ چنیں</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                {UPI_APPS.map(app => (
                  <button key={app.id} onClick={() => openUPI(app)}
                    style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'18px 10px', background:'white', border:'1.5px solid var(--n200)', borderRadius:'var(--r)', cursor:'pointer', textAlign:'center', fontFamily:'inherit', transition:'all .15s', position:'relative' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=app.color; e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow=`0 4px 16px ${app.color}28`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--n200)'; e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                    <div style={{ width:46, height:46, borderRadius:14, background:`${app.color}15`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Smartphone size={22} color={app.color} strokeWidth={2}/>
                    </div>
                    <div>
                      <p style={{ fontSize:13, fontWeight:700, color:'var(--n900)', margin:'0 0 3px' }}>{app.label}</p>
                      <div style={{ background:`${app.color}15`, borderRadius:20, padding:'2px 10px', display:'inline-block' }}>
                        <span style={{ fontSize:11.5, fontWeight:700, color:app.color }}>₹{Number(amount).toLocaleString()}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <p style={{ fontSize:11.5, color:'var(--n500)', margin:'4px 0 0', textAlign:'center', lineHeight:1.6 }}>
                Tap to open the app — amount and UPI ID will be filled automatically
              </p>
            </div>

            <div style={{ background:'var(--n50)', borderRadius:'var(--r)', padding:'14px 16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <p style={{ fontSize:11, color:'var(--n500)', margin:0, fontWeight:600 }}>Or pay directly to UPI ID</p>
                <span className="urdu-sub" style={{textAlign:"center",display:"block"}}>یا سیدھا UPI ID پر بھیجیں</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'white', border:'1.5px solid var(--n200)', borderRadius:'var(--r-sm)', padding:'11px 14px' }}>
                <span style={{ fontFamily:'monospace', fontSize:14.5, fontWeight:700, color:'var(--g400)' }}>{upiId}</span>
                <button onClick={copyUPI} style={{ display:'flex', alignItems:'center', gap:5, background:'var(--g50)', border:'1px solid var(--g100)', borderRadius:7, padding:'5px 10px', cursor:'pointer', fontSize:12, fontWeight:600, color:'var(--g500)', fontFamily:'inherit' }}>
                  {copied ? <><Check size={13}/> Copied!</> : <><Copy size={13}/> Copy</>}
                </button>
              </div>
            </div>

            <button onClick={() => setStep('upi')}
              style={{ width:'100%', padding:'13px', borderRadius:'var(--r-sm)', border:'1.5px solid var(--n200)', background:'transparent', color:'var(--n700)', fontWeight:600, fontSize:13.5, cursor:'pointer', fontFamily:'inherit' }}>
              Already Paid? Submit Proof
            </button>
          </>}

          {/* ── Step 2: Code + Screenshot ── */}
          {step==='upi' && <>

            {/* App-specific guidance — shows which app was used */}
            <div style={{ background: usedApp ? `${usedApp.color}0D` : '#EFF6FF', border:`1.5px solid ${usedApp ? usedApp.color+'35' : '#BFDBFE'}`, borderRadius:'var(--r)', padding:'14px 16px' }}>
              {usedApp ? (
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <div style={{ width:36, height:36, borderRadius:10, background:`${usedApp.color}20`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Smartphone size={18} color={usedApp.color} strokeWidth={2}/>
                  </div>
                  <p style={{ fontSize:14, fontWeight:700, color:'var(--n900)', margin:0 }}>Paid via {usedApp.label}?</p>
                </div>
              ) : null}
              <p style={{ fontSize:12.5, color:'var(--n700)', margin:0, lineHeight:1.7, fontWeight:500 }}>
                {usedApp ? usedApp.utrHelp : "Open your UPI app → payment history → find this payment → copy the UTR / Reference ID"}
              </p>
              {usedApp?.utrHelpUr && (
                <span className="urdu-sub" style={{ display:'block', marginTop:6, color:'var(--n500)' }}>{usedApp.utrHelpUr}</span>
              )}
            </div>

            {/* Transaction ID */}
            <div className="field">
              <label className="field-label">
                Payment Code (UTR / Reference ID)
                <span className="urdu-sub" style={{ textTransform:'none', fontWeight:500 }}>ادائیگی کا کوڈ</span>
              </label>
              <input
                className={`field-input${err && !txnId.trim() ? ' has-error' : ''}`}
                value={txnId}
                onChange={e => { setTxnId(e.target.value.toUpperCase()); setErr(''); }}
                placeholder="e.g. 428736192847"
                style={{ fontFamily:'monospace', fontSize:15, letterSpacing:.5 }}
              />
              <p style={{ fontSize:11, color:'var(--n400)', marginTop:5 }}>Usually 12 digits — find in your UPI app payment history</p>
            </div>

            {/* Screenshot upload */}
            <div className="field">
              <label className="field-label">
                Payment Screenshot
                <span className="urdu-sub" style={{ textTransform:'none', fontWeight:500 }}>ادائیگی کی تصویر لگائیں</span>
              </label>

              {screenshot ? (
                <div>
                  <div style={{ position:'relative' }}>
                    <img src={screenshot} alt="Payment proof"
                      style={{ width:'100%', borderRadius:'var(--r)', border:'2px solid var(--g200)', objectFit:'cover', maxHeight:200, display:'block' }}/>
                    <button onClick={() => setScreenshot(null)}
                      style={{ position:'absolute', top:8, right:8, background:'rgba(10,20,12,0.72)', border:'none', borderRadius:'50%', width:28, height:28, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <XCircle size={14} color="white" strokeWidth={2}/>
                    </button>
                  </div>
                  <div style={{ marginTop:7, display:'flex', alignItems:'center', gap:6 }}>
                    <CheckCircle2 size={14} color="var(--g400)" strokeWidth={2.2}/>
                    <span style={{ fontSize:12, color:'var(--g500)', fontWeight:600 }}>Screenshot uploaded</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  style={{ width:'100%', padding:'22px 16px', borderRadius:'var(--r)', border:'2px dashed var(--n300)', background:'var(--n50)', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:10, fontFamily:'inherit', transition:'border-color .15s, background .15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor='var(--g400)'; e.currentTarget.style.background='var(--g50)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor='var(--n300)'; e.currentTarget.style.background='var(--n50)'; }}
                >
                  <div style={{ width:48, height:48, borderRadius:14, background:'var(--g50)', border:'1px solid var(--g100)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <ImageIcon size={24} color="var(--g400)" strokeWidth={1.8}/>
                  </div>
                  <div style={{ textAlign:'center' }}>
                    <p style={{ fontSize:14, fontWeight:700, color:'var(--n700)', margin:0 }}>
                      {uploading ? 'Processing…' : 'Tap to upload screenshot'}
                    </p>
                    <span className="urdu-sub" style={{ display:'block', marginTop:3, textAlign:'center' }}>ادائیگی کی تصویر لگائیں</span>
                    <p style={{ fontSize:11, color:'var(--n400)', margin:'5px 0 0' }}>JPG, PNG — any payment screenshot</p>
                  </div>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display:'none' }}/>
            </div>

            {err && <p style={{ fontSize:13, color:'var(--danger)', margin:'-6px 0 0', fontWeight:500 }}>{err}</p>}

            <button onClick={confirmPayment}
              style={{ width:'100%', padding:'14px', borderRadius:'var(--r-sm)', border:'none', background:'var(--g400)', color:'white', fontWeight:700, fontSize:14.5, cursor:'pointer', fontFamily:'inherit', boxShadow:'var(--shadow-green)' }}>
              Submit for Verification
            </button>
            <span className="urdu-sub" style={{ textAlign:'center', display:'block', marginTop:-8 }}>بھیج دیں</span>

            <button onClick={() => { setStep('choose'); setErr(''); }}
              style={{ width:'100%', padding:'13px', borderRadius:'var(--r-sm)', border:'1.5px solid var(--n200)', background:'transparent', color:'var(--n600)', fontWeight:600, fontSize:13.5, cursor:'pointer', fontFamily:'inherit' }}>
              Back
            </button>
          </>}
        </div>
      </div>
    </div>
  );
}

// ── History ────────────────────────────────────────────────────────────────────
function SHistory({ stats }) {
  const { present, total, history } = stats;
  return (
    <>
      <Header title="Attendance History" sub={`${present} present of ${total} days`} urdu="پچھلا ریکارڈ"/>
      <div className="page-body">
        {history.length===0
          ? <Empty Icon={ClipboardList} title="No records yet" sub="Attend your first class to see history here"/>
          : history.map(({ date, status }) => (
            <div key={date} style={{ display:'flex', alignItems:'center', gap:12, background:'white', borderRadius:'var(--r)', padding:'13px 16px', border:'1px solid var(--n200)' }}>
              <div style={{ width:40, height:40, borderRadius:'var(--r-sm)', background:status==='present'?'var(--g50)':'var(--danger-bg)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                {status==='present' ? <CheckCircle2 size={20} color="var(--g400)" strokeWidth={2}/> : <XCircle size={20} color="var(--danger)" strokeWidth={2}/>}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:14, color:'var(--n900)' }}>{fmtDate(date)}</div>
              </div>
              <Pill color={status==='present'?'green':'red'}>{status==='present'?'Present':'Absent'}</Pill>
            </div>
          ))
        }
      </div>
    </>
  );
}

// ── Profile ────────────────────────────────────────────────────────────────────
function SProfile({ user, stats, onLogout }) {
  const { present, total, pct, streak } = stats;
  return (
    <>
      <Header title="My Profile" sub="Account information" urdu="میری معلومات"/>
      <div className="page-body">
        <Card style={{ display:'flex', alignItems:'center', gap:14 }}>
          <Avatar name={user.name} id={user.id} size={62}/>
          <div>
            <h2 style={{ fontSize:18, fontWeight:700, margin:'0 0 6px', color:'var(--n900)', letterSpacing:-0.3 }}>{user.name}</h2>
            <Pill color="green"><GraduationCap size={11}/>Student</Pill>
          </div>
        </Card>
        <div className="stats-grid">
          <StatCard label="Present Days" value={present} color="var(--g400)" iconBg="var(--g50)" Icon={CheckCircle2}/>
          <StatCard label="Attendance"   value={pct!=null?pct+'%':'—'} color={pct>=75?'var(--g400)':'var(--danger)'} iconBg={pct>=75?'var(--g50)':'var(--danger-bg)'} Icon={TrendingUp}/>
        </div>
        <Card>
          {[
            [Hash,         'Student ID',     user.id],
            [Mail,         'Email',          user.email],
            [GraduationCap,'Class',          user.class||'General'],
            [Calendar,     'Date of Birth',  fmtDate(user.dob)||'—'],
            [Phone,        'Phone',          user.phone||'—'],
            [MapPin,       'Address',        user.address||'—'],
            [UserCheck,    'Guardian',       user.guardianName||'—'],
          ].map(([Ic,k,v]) => (
            <div key={k} className="list-row">
              <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                <Ic size={14} color="var(--n400)" strokeWidth={2}/>
                <span className="list-row-label">{k}</span>
              </div>
              <span className="list-row-value">{v}</span>
            </div>
          ))}
        </Card>
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={16} strokeWidth={2.2}/>Sign Out <span style={{ fontStyle:'italic', fontWeight:400, fontSize:12, marginLeft:4 }}>— Bahar Jayein</span>
        </button>
      </div>
    </>
  );
}
