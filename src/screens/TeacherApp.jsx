import React, { useState } from 'react';
import {
  Home, ClipboardList, Users, BarChart3, User,
  QrCode, Lock, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  TrendingUp, Calendar, AlertTriangle, Search,
  Phone, Mail, Hash, UserCheck, Shield, LogOut,
  IndianRupee, Clock, AlertCircle, Banknote, Receipt,
  X, Settings, UserCog, History, MapPin, ArrowLeft,
} from 'lucide-react';
import { Header, Avatar, Toast, Card, StatCard, Pill, Empty, ProgressBar, SearchBar, BigBtn, Sub } from '../components/UI';
import { QRScanner } from '../components/QRScanner';
import { T } from '../utils/translate';
import {
  getStudents, getTeachers, getAttendance, markAttendance, finalizeDay,
  getDayRecord, getStudentStats, getOverallStats, fmtDate, todayStr, initials,
  currentMonthKey, fmtMonth, last12Months, getFees, getFeeSettings, saveFeeSettings,
  teacherMarkFee, getMonthFeeStats, approveTeacher, rejectTeacher,
  getYearsRecorded, getStudentFullRecord,
} from '../utils/db';

// 5 tabs — short, clear, with Urdinglish
const TABS = [
  { id:'home',     Icon:Home,          label:'Home',       ur:"گھر" },
  { id:'mark',     Icon:ClipboardList, label:'Attendance', ur:"حاضری" },
  { id:'fees',     Icon:IndianRupee,   label:'Fees',       ur:"فیس" },
  { id:'students', Icon:Users,         label:'Students',   ur:"طلباء" },
  { id:'profile',  Icon:User,          label:'Profile',    ur:"میری معلومات" },
];

export function TeacherApp({ user, onLogout }) {
  const [tab,      setTab]      = useState('home');
  const [showScan, setShowScan] = useState(false);
  const [selDate,  setSelDate]  = useState(todayStr());
  const [toast,    setToast]    = useState(null);
  const [,         tick]        = useState(0);
  const refresh  = () => tick(n => n+1);
  const toast_   = (msg, type='success') => setToast({ msg, type });

  const handleScan = (student) => {
    setShowScan(false);
    const rec = getDayRecord(selDate);
    if (rec[student.id]==='present') {
      toast_(`${student.name.split(' ')[0]} already marked Present`, 'error');
    } else {
      markAttendance(selDate, student.id, 'present');
      refresh();
      toast_(`${student.name.split(' ')[0]} marked Present`);
    }
  };

  const handleFinalize = () => {
    finalizeDay(selDate);
    refresh();
    const rec = getDayRecord(selDate);
    const p  = Object.values(rec).filter(v=>v==='present').length;
    const ab = Object.values(rec).filter(v=>v==='absent').length;
    toast_(`Done — ${p} present, ${ab} absent`, 'info');
  };

  const scanBtn = (
    <button onClick={()=>setShowScan(true)} style={{
      background:'rgba(255,255,255,0.16)', border:'1px solid rgba(255,255,255,0.24)',
      color:'white', borderRadius:10, padding:'9px 15px', fontWeight:600, fontSize:13,
      cursor:'pointer', display:'flex', alignItems:'center', gap:7, fontFamily:'inherit',
    }}>
      <QrCode size={15} strokeWidth={2}/> Scan
    </button>
  );

  const shared = { selDate, setSelDate, onScan:()=>setShowScan(true), onFinalize:handleFinalize, refresh, toast_ };

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:'var(--n50)', overflow:'hidden' }}>
      <div className="scroll">
        <div key={tab} className="tab-screen">
          {tab==='home'     && <THome       user={user} scanBtn={scanBtn} {...shared}/>}
          {tab==='mark'     && <TAttendance scanBtn={scanBtn} {...shared}/>}
          {tab==='fees'     && <TFees       toast_={toast_} refresh={refresh}/>}
          {tab==='students' && <TStudents/>}
          {tab==='profile'  && <TProfile    user={user} onLogout={onLogout} toast_={toast_} refresh={refresh}/>}
        </div>
      </div>
      <div className="tab-bar">
        {TABS.map(t=>(
          <button key={t.id} className={`tab-btn${tab===t.id?' active':''}`} onClick={()=>setTab(t.id)}>
            {tab===t.id && <div className="tab-active-dot"/>}
            <div className="tab-icon"><t.Icon size={21} strokeWidth={tab===t.id?2.2:1.8}/></div>
            <span className="tab-label">{t.label}</span>
          </button>
        ))}
      </div>
      {showScan && <QRScanner onScan={handleScan} onClose={()=>setShowScan(false)}/>}
      {toast    && <Toast msg={toast.msg} type={toast.type} onDone={()=>setToast(null)}/>}
    </div>
  );
}

// ── Home — simplified: 1 stat row, 2 buttons, 1 list. Reports/details moved out. ──
function THome({ user, scanBtn, selDate, onScan, onFinalize }) {
  const students = getStudents();
  const rec      = getDayRecord(selDate);
  const present  = Object.values(rec).filter(v=>v==='present').length;
  const absent   = Object.values(rec).filter(v=>v==='absent').length;
  const unmarked = students.filter(s=>!rec[s.id]).length;
  const feeStats = getMonthFeeStats(currentMonthKey());

  return (
    <>
      <Header title={`Assalamu Alaykum, Maulana ${user.name.split(' ')[0]}`} sub={fmtDate(selDate)} rightEl={scanBtn}/>
      <div className="page-body">

        {/* Most important numbers only — present / absent / unmarked */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          <StatCard label="Present Today" value={present} color="var(--g400)"  iconBg="var(--g50)"     Icon={CheckCircle2} sub={{text:'Hazir',color:'var(--n400)'}}/>
          <StatCard label="Absent Today"  value={absent}  color="var(--danger)" iconBg="var(--danger-bg)" Icon={XCircle} sub={{text:'Ghair Hazir',color:'var(--n400)'}}/>
        </div>

        {unmarked>0 && (
          <div className="warning-banner">
            <AlertTriangle size={18} color="var(--warning)" strokeWidth={2} style={{ flexShrink:0 }}/>
            <div>
              <p style={{ margin:0, fontSize:13, color:'#92400E', fontWeight:600 }}>{unmarked} student{unmarked>1?'s':''} not marked yet</p>
              <span className="urdu-sub" style={{ color:'#B45309', display:'block', marginTop:2 }}>ابھی تک مارک نہیں ہوئے</span>
            </div>
          </div>
        )}

        {/* The two main actions, big and clear */}
        <BigBtn en="Scan QR Code"   ur="کیو آر اسکین کریں"     icon={QrCode} onClick={onScan}/>
        <BigBtn en="Finish the Day" ur="دن ختم کریں"  icon={Lock}   onClick={onFinalize} variant="ghost"/>

        {/* Fee snapshot — single line, no detail */}
        {students.length>0 && feeStats.unpaid + feeStats.pending > 0 && (
          <Card style={{ background:'#FFFBEB', border:'1px solid #FDE68A' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:'#92400E', margin:0 }}>{feeStats.unpaid} students haven't paid fees</p>
                <span className="urdu-sub" style={{ color:'#B45309', display:'block', marginTop:2 }}>فیس نہیں دی</span>
              </div>
            </div>
          </Card>
        )}

        <Card>
          <div style={{ marginBottom:12 }}>
            <p style={{ fontSize:13, fontWeight:700, color:'var(--n700)', margin:'0 0 2px' }}>Today's Register</p>
            <span className="urdu-sub" style={{textAlign:"center",display:"block",width:"100%"}}>"آج کا رجسٹر"</span>
          </div>
          {students.length===0
            ? <p style={{ color:'var(--n400)', fontSize:13, textAlign:'center', padding:'14px 0' }}>No students registered yet</p>
            : students.slice(0,6).map(s=>{
              const st = rec[s.id];
              return (
                <div key={s.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 0', borderBottom:'1px solid var(--n100)' }}>
                  <Avatar name={s.name} id={s.id} size={32}/>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--n900)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</div>
                  </div>
                  <Pill color={st==='present'?'green':st==='absent'?'red':'gray'}>
                    {st==='present'?'Present':st==='absent'?'Absent':'—'}
                  </Pill>
                </div>
              );
            })
          }
          {students.length>6&&<p style={{ fontSize:12, color:'var(--g400)', textAlign:'center', margin:'10px 0 0', fontWeight:600 }}>+{students.length-6} more</p>}
        </Card>
      </div>
    </>
  );
}

// ── Attendance Tab — search + list, scan button up top ─────────────────────────
function TAttendance({ selDate, setSelDate, scanBtn, onScan, onFinalize, refresh, toast_ }) {
  const [search, setSearch] = useState('');
  const students = getStudents();
  const rec      = getDayRecord(selDate);
  const present  = Object.values(rec).filter(v=>v==='present').length;
  const absent   = Object.values(rec).filter(v=>v==='absent').length;
  const unmarked = students.filter(s=>!rec[s.id]).length;
  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.class.toLowerCase().includes(search.toLowerCase())
  );
  const today = todayStr();
  const isFuture = selDate > today;

  const mark = (id, status) => {
    if (isFuture) { toast_('Cannot pick a future date', 'error'); return; }
    markAttendance(selDate, id, status);
    refresh();
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    if (val > today) { toast_('Cannot pick a future date', 'error'); return; }
    setSelDate(val);
  };

  return (
    <>
      <Header title="Mark Attendance" urdu="حاضری لگائیں" sub="Scan or tap to mark" rightEl={scanBtn}/>
      <div className="page-body">
        <div className="summary-row">
          <div className="summary-cell sc-present"><div className="sc-val">{present}</div><div className="sc-lbl">Present</div></div>
          <div className="summary-cell sc-absent"> <div className="sc-val">{absent}</div> <div className="sc-lbl">Absent</div></div>
          <div className="summary-cell sc-unmarked"><div className="sc-val">{unmarked}</div><div className="sc-lbl">Unmarked</div></div>
        </div>

        <div style={{ marginBottom:4 }}>
          <label className="field-label" style={{ display:'block', marginBottom:6 }}>Date</label>
          <input type="date" value={selDate} max={today} onChange={handleDateChange} className="field-input" style={{ width:'100%' }}/>
        </div>

        <BigBtn en="Scan QR Code" ur="کیو آر اسکین کریں" icon={QrCode} onClick={onScan}/>

        <SearchBar value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search students…"/>

        {filtered.length===0
          ? <Empty Icon={Search} title="No students found"/>
          : filtered.map(s=>{
            const st = getDayRecord(selDate)[s.id];
            return (
              <div key={s.id} className={`student-item${st==='present'?' is-present':st==='absent'?' is-absent':''}`}>
                <Avatar name={s.name} id={s.id} size={40}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:600, fontSize:14, color:'var(--n900)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</div>
                  <div style={{ fontSize:11, color:'var(--n400)', marginTop:2 }}>{s.class}</div>
                </div>
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  <button className={`mark-btn ${st==='present'?'mark-present-on':'mark-present-off'}`} onClick={()=>mark(s.id,'present')}>
                    <CheckCircle2 size={16} strokeWidth={2.5}/>
                  </button>
                  <button className={`mark-btn ${st==='absent'?'mark-absent-on':'mark-absent-off'}`} onClick={()=>mark(s.id,'absent')}>
                    <XCircle size={16} strokeWidth={2.5}/>
                  </button>
                </div>
              </div>
            );
          })
        }

        <button onClick={onFinalize} style={{ width:'100%', padding:'13px', borderRadius:'var(--r-sm)', border:'1.5px solid var(--n200)', background:'transparent', color:'var(--n600)', fontWeight:600, fontSize:13.5, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:7, marginTop:4 }}>
          <Lock size={14}/> Finish Day
        </button>
      </div>
    </>
  );
}

// ── Fees Tab ───────────────────────────────────────────────────────────────────
function TFees({ toast_, refresh: parentRefresh }) {
  const [month,    setMonth]    = useState(currentMonthKey());
  const [expanded, setExpanded] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [, tick] = useState(0);
  const re = () => { tick(n=>n+1); parentRefresh(); };

  const students  = getStudents();
  const settings  = getFeeSettings();
  const amount    = settings.monthlyAmount || 500;
  const fees      = getFees();
  const monthFees = fees[month] || {};
  const months    = last12Months();
  const stats     = getMonthFeeStats(month);

  const statusOf = (s) => {
    const r = monthFees[s.id];
    if (!r) return 'unpaid';
    if (r.status==='pending') return 'pending';
    if (r.status==='paid') return 'paid';
    return 'unpaid';
  };

  const statusStyles = {
    paid:    { bg:'#EDF9F4', tc:'#0A6640', bc:'#9FE1CB', label:'Paid',   Icon:CheckCircle2, ic:'var(--g400)' },
    pending: { bg:'#FFFBEB', tc:'#92400E', bc:'#FDE68A', label:'Check',  Icon:Clock,        ic:'#D97706' },
    unpaid:  { bg:'#FEF2F0', tc:'#B91C1C', bc:'#FECACA', label:'Unpaid', Icon:AlertCircle,  ic:'var(--danger)' },
  };

  const handleMarkCash = (studentId) => {
    teacherMarkFee(month, studentId, { status:'paid', method:'cash', amount, paidAt:new Date().toISOString(), markedByTeacher:true });
    toast_('Marked as paid');
    re();
  };
  const handleVerify = (studentId) => {
    const existing = monthFees[studentId] || {};
    teacherMarkFee(month, studentId, { ...existing, status:'paid', paidAt: existing.paidAt || new Date().toISOString() });
    toast_('Payment confirmed');
    re();
  };
  const handleReject = (studentId) => {
    teacherMarkFee(month, studentId, { status:'unpaid', method:null, txnId:null, rejectedAt:new Date().toISOString() });
    toast_('Marked unpaid', 'info');
    re();
  };
  const handleMarkUnpaid = (studentId) => {
    teacherMarkFee(month, studentId, { status:'unpaid', method:null });
    toast_('Marked unpaid', 'info');
    re();
  };

  const paidPct = stats.total ? Math.round((stats.paid/stats.total)*100) : 0;

  return (
    <>
      <Header title="Fees" urdu="فیس" sub="Check who has paid"
        rightEl={
          <button onClick={()=>setShowSettings(true)} style={{ background:'rgba(255,255,255,.16)', border:'1px solid rgba(255,255,255,.24)', color:'white', borderRadius:10, padding:'9px 13px', fontWeight:600, fontSize:12, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:6 }}>
            <Settings size={13} strokeWidth={2}/> Settings
          </button>
        }
      />
      <div className="page-body">
        <div>
          <label className="field-label" style={{ display:'block', marginBottom:6 }}>Month</label>
          <select value={month} onChange={e=>setMonth(e.target.value)} className="field-select">
            {months.map(m => <option key={m} value={m}>{fmtMonth(m)}{m===currentMonthKey()?' (Current)':''}</option>)}
          </select>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
          {[
            { label:'Paid',    value:stats.paid,    color:'#1D9E75', bg:'#EDF9F4', bc:'#9FE1CB' },
            { label:'Check',   value:stats.pending, color:'#D97706', bg:'#FFFBEB', bc:'#FDE68A' },
            { label:'Unpaid',  value:stats.unpaid,  color:'#E5412A', bg:'#FEF2F0', bc:'#FECACA' },
          ].map(c => (
            <div key={c.label} style={{ background:c.bg, borderRadius:'var(--r)', padding:'14px 8px', textAlign:'center', border:`1px solid ${c.bc}` }}>
              <p style={{ fontSize:24, fontWeight:800, color:c.color, margin:0, letterSpacing:-1 }}>{c.value}</p>
              <p style={{ fontSize:11, color:c.color, margin:'5px 0 0', fontWeight:600 }}>{c.label}</p>
            </div>
          ))}
        </div>

        <Card>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--n700)', textAlign:'center', display:'block' }}>کتنا پیسہ آیا</span>
            <span style={{ fontSize:13, fontWeight:800, color:paidPct>=75?'var(--g400)':'var(--danger)' }}>{paidPct}%</span>
          </div>
          <ProgressBar pct={paidPct}/>
          <p style={{ fontSize:11, color:'var(--n400)', margin:'9px 0 0' }}>₹{stats.collected.toLocaleString()} of ₹{(stats.total*amount).toLocaleString()}</p>
        </Card>

        <div>
          <div style={{marginBottom:10}}><p style={{fontSize:13,fontWeight:700,color:'var(--n700)',margin:'0 0 2px'}}>Each Student</p><span className="urdu-sub" style={{textAlign:"center",display:"block",width:"100%"}}>ہر طالب علم</span></div>
          {students.length===0
            ? <Empty Icon={Receipt} title="No students registered" sub="Add students first"/>
            : students.map(s => {
              const rec    = monthFees[s.id];
              const status = statusOf(s);
              const isOpen = expanded===s.id;
              const ss     = statusStyles[status];
              return (
                <div key={s.id} style={{ background:'white', borderRadius:'var(--r)', marginBottom:8, border:`1.5px solid ${isOpen?'var(--g400)':'var(--n200)'}`, overflow:'hidden' }}>
                  <div onClick={()=>setExpanded(isOpen?null:s.id)} style={{ display:'flex', alignItems:'center', gap:12, padding:'13px 16px', cursor:'pointer' }}>
                    <Avatar name={s.name} id={s.id} size={42}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:14, fontWeight:700, color:'var(--n900)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</p>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                      <div style={{ background:ss.bg, border:`1px solid ${ss.bc}`, borderRadius:8, padding:'5px 10px', display:'flex', alignItems:'center', gap:5 }}>
                        <ss.Icon size={13} color={ss.ic} strokeWidth={2.5}/>
                        <span style={{ fontSize:11, fontWeight:700, color:ss.tc }}>{ss.label}</span>
                      </div>
                      {isOpen ? <ChevronUp size={16} color="var(--n400)"/> : <ChevronDown size={16} color="var(--n400)"/>}
                    </div>
                  </div>
                  {isOpen && (
                    <div style={{ borderTop:'1px solid var(--n100)', padding:'14px 16px', background:'var(--n50)', display:'flex', flexDirection:'column', gap:10 }}>
                      {rec?.txnId && (
                        <div style={{ display:'flex', justifyContent:'space-between' }}>
                          <span style={{ fontSize:12, color:'var(--n500)' }}>Payment Code</span>
                          <span style={{ fontSize:12, fontWeight:600, fontFamily:'monospace' }}>{rec.txnId}</span>
                        </div>
                      )}
                      {rec?.screenshot && (
                        <div>
                          <p style={{ fontSize:11, fontWeight:700, color:'var(--n500)', textTransform:'uppercase', letterSpacing:0.6, margin:'0 0 6px' }}>Payment Screenshot</p>
                          <img
                            src={rec.screenshot}
                            alt="Payment proof"
                            style={{ width:'100%', borderRadius:'var(--r-sm)', border:'1.5px solid var(--n200)', objectFit:'cover', maxHeight:180, display:'block', cursor:'pointer' }}
                            onClick={() => window.open(rec.screenshot, '_blank')}
                          />
                          <p style={{ fontSize:10.5, color:'var(--n400)', margin:'5px 0 0' }}>Tap to view full size</p>
                        </div>
                      )}
                      {status==='pending' && !rec?.screenshot && (
                        <div style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:'var(--r-sm)', padding:'9px 12px' }}>
                          <p style={{ fontSize:12, color:'#92400E', margin:0 }}>No screenshot uploaded by student</p>
                        </div>
                      )}
                      <div style={{ display:'flex', gap:8 }}>
                        {status==='unpaid' && (
                          <button onClick={()=>handleMarkCash(s.id)} style={{ flex:1, padding:'12px', borderRadius:'var(--r-sm)', border:'none', background:'var(--g400)', color:'white', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                            <Banknote size={15}/>Got Cash
                          </button>
                        )}
                        {status==='pending' && (
                          <>
                            <button onClick={()=>handleVerify(s.id)} style={{ flex:1, padding:'12px', borderRadius:'var(--r-sm)', border:'none', background:'var(--g400)', color:'white', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                              <CheckCircle2 size={15}/>Confirm
                            </button>
                            <button onClick={()=>handleReject(s.id)} style={{ padding:'12px 16px', borderRadius:'var(--r-sm)', border:'1.5px solid #FECACA', background:'#FEF2F0', color:'#B91C1C', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
                              Reject
                            </button>
                          </>
                        )}
                        {status==='paid' && (
                          <button onClick={()=>handleMarkUnpaid(s.id)} style={{ flex:1, padding:'12px', borderRadius:'var(--r-sm)', border:'1.5px solid var(--n200)', background:'transparent', color:'var(--n600)', fontWeight:600, fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
                            Undo
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          }
        </div>
      </div>
      {showSettings && <FeeSettingsSheet onClose={()=>{setShowSettings(false);re();}} toast_={toast_}/>}
    </>
  );
}

function FeeSettingsSheet({ onClose, toast_ }) {
  const s = getFeeSettings();
  const [form, setForm] = useState({ monthlyAmount: s.monthlyAmount || 500, upiId: s.upiId || '', upiName: s.upiName || 'Noor Ulum Trust' });
  const f = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const save = () => { saveFeeSettings({ ...s, ...form, monthlyAmount: Number(form.monthlyAmount) || 500 }); toast_('Saved'); onClose(); };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(10,20,12,0.75)', zIndex:3000, display:'flex', alignItems:'flex-end', backdropFilter:'blur(4px)' }}>
      <div style={{ background:'white', borderRadius:'24px 24px 0 0', width:'100%', padding:'0 0 32px', maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 8px' }}>
          <div style={{ width:40, height:4, background:'var(--n200)', borderRadius:2 }}/>
        </div>
        <div style={{ padding:'0 20px 16px', borderBottom:'1px solid var(--n100)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ fontSize:16.5, fontWeight:700, color:'var(--n900)', margin:0 }}>Fee Settings</h3>
          <button onClick={onClose} style={{ background:'var(--n100)', border:'none', borderRadius:'50%', width:34, height:34, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <X size={16} color="var(--n600)"/>
          </button>
        </div>
        <div style={{ padding:'18px 20px', display:'flex', flexDirection:'column', gap:14 }}>
          <div className="field">
            <label className="field-label">Monthly Fee Amount (₹)</label>
            <input type="number" value={form.monthlyAmount} onChange={f('monthlyAmount')} className="field-input"/>
          </div>
          <div className="field">
            <label className="field-label">Your UPI ID</label>
            <input type="text" value={form.upiId} onChange={f('upiId')} placeholder="madrasa@ybl" className="field-input" style={{ fontFamily:'monospace' }}/>
            <p style={{ fontSize:11, color:'var(--n400)', marginTop:6 }}>Students will pay to this UPI ID</p>
          </div>
          <button onClick={save} style={{ width:'100%', padding:'13px', borderRadius:'var(--r-sm)', border:'none', background:'var(--g400)', color:'white', fontWeight:700, fontSize:14.5, cursor:'pointer', fontFamily:'inherit', boxShadow:'var(--shadow-green)' }}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Students Tab — directory by default, reports as a toggle ───────────────────
function TStudents() {
  const [view,     setView]     = useState('list');
  const [search,   setSearch]   = useState('');
  const [expanded, setExpanded] = useState(null);
  const [fullRecordStudent, setFullRecordStudent] = useState(null);
  const students   = getStudents();
  const attendance = getAttendance();
  const dates      = Object.keys(attendance).sort((a,b)=>b.localeCompare(a));
  const { avgAttendance } = getOverallStats();
  const teachers   = getTeachers();

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.class.toLowerCase().includes(search.toLowerCase()) ||
    s.id.includes(search.toUpperCase())
  );

  const CLASSES = ['Nursery (Qaida)','Class 1 — Quran Nazra','Class 2 — Hifz','Class 3 — Urdu & Arabic','Class 4 — Advanced Deen','General'];

  return (
    <>
      <Header title="Students" urdu="طلباء" sub={`${students.length} registered`}/>
      <div className="page-body">
        <div className="segment" style={{ marginBottom:4 }}>
          <button className={`seg-btn${view==='list'?' active':''}`} onClick={()=>setView('list')}>
            <Users size={14}/> List
          </button>
          <button className={`seg-btn${view==='reports'?' active':''}`} onClick={()=>setView('reports')}>
            <BarChart3 size={14}/> Reports
          </button>
        </div>

        {view==='list' && <>
          <SearchBar value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search students…"/>
          {filtered.length===0
            ? <Empty Icon={Users} title="No students found"/>
            : filtered.map(s=>{
              const stats   = getStudentStats(s.id);
              const isOpen  = expanded===s.id;
              return (
                <Card key={s.id} style={{ cursor:'pointer' }} onClick={()=>setExpanded(isOpen?null:s.id)}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <Avatar name={s.name} id={s.id} size={46}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:700, fontSize:15, color:'var(--n900)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</div>
                      <div style={{ fontSize:12, color:'var(--n400)', marginTop:2 }}>{s.class}</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                      {stats.pct!=null && <Pill color={stats.pct>=75?'green':'red'}>{stats.pct}%</Pill>}
                      {isOpen ? <ChevronUp size={16} color="var(--n400)"/> : <ChevronDown size={16} color="var(--n400)"/>}
                    </div>
                  </div>
                  {isOpen && (
                    <div className="expand-body anim-fadeup">
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12 }}>
                        {[['Present',stats.present,'var(--g400)'],['Absent',stats.total-stats.present,'var(--danger)'],['Total',stats.total,'var(--n500)']].map(([l,v,c])=>(
                          <div key={l} style={{ textAlign:'center', background:'var(--n50)', borderRadius:'var(--r-sm)', padding:'9px 4px' }}>
                            <div style={{ fontWeight:800, color:c, fontSize:19 }}>{v}</div>
                            <div style={{ fontSize:10, color:'var(--n400)', marginTop:2 }}>{l}</div>
                          </div>
                        ))}
                      </div>
                      {[[Mail,'Email',s.email],[Phone,'Student Phone',s.phone||'—'],[MapPin,'Address',s.address||'—'],[UserCheck,'Guardian',s.guardianName||'—'],[Phone,'Guardian Phone',s.guardianPhone||'—'],[Hash,'ID',s.id]].map(([Ic,k,v])=>(
                        <div key={k} className="list-row">
                          <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                            <Ic size={13} color="var(--n400)" strokeWidth={2}/>
                            <span className="list-row-label">{k}</span>
                          </div>
                          <span className="list-row-value">{v}</span>
                        </div>
                      ))}
                      <button onClick={(e)=>{e.stopPropagation();setFullRecordStudent(s);}} style={{ width:'100%', marginTop:12, padding:'12px', borderRadius:'var(--r-sm)', border:'1.5px solid var(--g400)', background:'var(--g50)', color:'var(--g500)', fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:7 }}>
                        <History size={15} strokeWidth={2}/>View Full Year Record
                      </button>
                    </div>
                  )}
                </Card>
              );
            })
          }
        </>}

        {view==='reports' && <>
          <div className="stats-grid">
            <StatCard label="Students"  value={students.length} color="var(--info)" iconBg="#EFF6FF" Icon={Users}/>
            <StatCard label="Avg Attendance" value={avgAttendance+'%'} color={avgAttendance>=70?'var(--g400)':'var(--danger)'} iconBg={avgAttendance>=70?'var(--g50)':'var(--danger-bg)'} Icon={TrendingUp}/>
          </div>

          {students.length>0&&<>
            <p style={{ fontSize:13, fontWeight:700, color:'var(--n700)', margin:'4px 0 10px' }}>By Class</p>
            {CLASSES.map(cls=>{
              const cls_s = students.filter(s=>s.class===cls);
              if(!cls_s.length) return null;
              const cp = cls_s.reduce((sum,s)=>sum+dates.filter(d=>attendance[d][s.id]==='present').length,0);
              const ct = cls_s.reduce((sum,s)=>sum+dates.filter(d=>attendance[d][s.id]).length,0);
              const pct= ct?Math.round(cp/ct*100):0;
              return (
                <Card key={cls}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                    <div style={{ fontWeight:600, fontSize:13, color:'var(--n900)' }}>{cls}</div>
                    <span style={{ fontWeight:800, fontSize:15, color:pct>=75?'var(--g400)':'var(--danger)' }}>{pct}%</span>
                  </div>
                  <ProgressBar pct={pct}/>
                </Card>
              );
            })}
          </>}

          <p style={{ fontSize:13, fontWeight:700, color:'var(--n700)', margin:'8px 0 10px' }}>Day by Day</p>
          {dates.length===0
            ? <Empty Icon={BarChart3} title="No records yet"/>
            : dates.map(date=>{
              const rec = attendance[date];
              const p   = Object.values(rec).filter(v=>v==='present').length;
              const tot = Object.values(rec).length;
              const pct = tot?Math.round(p/tot*100):0;
              return (
                <Card key={date}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                    <span style={{ fontWeight:600, fontSize:14, color:'var(--n900)' }}>{fmtDate(date)}</span>
                    <span style={{ fontWeight:800, fontSize:14, color:pct>=75?'var(--g400)':'var(--danger)' }}>{pct}%</span>
                  </div>
                  <ProgressBar pct={pct}/>
                </Card>
              );
            })
          }
        </>}
      </div>

      {fullRecordStudent && (
        <StudentFullRecord student={fullRecordStudent} onClose={() => setFullRecordStudent(null)}/>
      )}
    </>
  );
}

// ── Full Year Attendance Record — every day, live, for one student ────────────
function StudentFullRecord({ student, onClose }) {
  const years = getYearsRecorded();
  const [year, setYear] = useState(years[0]);
  const record = getStudentFullRecord(student.id, year);

  return (
    <div style={{ position:'fixed', inset:0, background:'var(--n50)', zIndex:2500, display:'flex', flexDirection:'column' }}>
      <Header
        title={`${student.name.split(' ')[0]}'s Record`}
        urdu="پچھلا ریکارڈ"
        sub={student.class}
        showBack onBack={onClose}
      />
      <div className="scroll">
        <div className="page-body">

          {/* Year selector */}
          <div>
            <label className="field-label" style={{ display:'block', marginBottom:6 }}>Year</label>
            <select value={year} onChange={e => setYear(e.target.value)} className="field-select">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Summary */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
            <div style={{ background:'var(--g50)', borderRadius:'var(--r)', padding:'14px 8px', textAlign:'center', border:'1px solid var(--g100)' }}>
              <p style={{ fontSize:22, fontWeight:800, color:'var(--g400)', margin:0 }}>{record.present}</p>
              <p style={{ fontSize:11, color:'var(--g500)', margin:'4px 0 0', fontWeight:600 }}>Present</p>
            </div>
            <div style={{ background:'var(--danger-bg)', borderRadius:'var(--r)', padding:'14px 8px', textAlign:'center', border:'1px solid #FECACA' }}>
              <p style={{ fontSize:22, fontWeight:800, color:'var(--danger)', margin:0 }}>{record.absent}</p>
              <p style={{ fontSize:11, color:'#B91C1C', margin:'4px 0 0', fontWeight:600 }}>Absent</p>
            </div>
            <div style={{ background:'var(--n100)', borderRadius:'var(--r)', padding:'14px 8px', textAlign:'center', border:'1px solid var(--n200)' }}>
              <p style={{ fontSize:22, fontWeight:800, color:'var(--n700)', margin:0 }}>{record.pct!=null?record.pct+'%':'—'}</p>
              <p style={{ fontSize:11, color:'var(--n500)', margin:'4px 0 0', fontWeight:600 }}>Attendance</p>
            </div>
          </div>

          {/* Month by month breakdown */}
          {record.months.length === 0 ? (
            <Empty Icon={History} title="No record for this year" sub="Attendance will appear here once marked"/>
          ) : record.months.map(({ month, days, present, total }) => {
            const pct = total ? Math.round((present/total)*100) : 0;
            return (
              <Card key={month}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <span style={{ fontWeight:700, fontSize:14, color:'var(--n900)' }}>{fmtMonth(month)}</span>
                  <Pill color={pct>=75?'green':'red'}>{present}/{total} · {pct}%</Pill>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {days.map(({ date, status }) => (
                    <div key={date} title={fmtDate(date)} style={{
                      width:30, height:30, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center',
                      background: status==='present' ? 'var(--g50)' : 'var(--danger-bg)',
                      border: `1px solid ${status==='present' ? 'var(--g100)' : '#FECACA'}`,
                      fontSize:10.5, fontWeight:700, color: status==='present' ? 'var(--g500)' : 'var(--danger)',
                    }}>
                      {new Date(date).getDate()}
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Profile — includes approvals ────────────────────────────────────────────────
function TProfile({ user, onLogout, toast_, refresh: parentRefresh }) {
  const { totalStudents, totalTeachers, daysRecorded, avgAttendance } = getOverallStats();
  const [, tick] = useState(0);
  const re = () => { tick(n=>n+1); parentRefresh(); };
  const teachers = getTeachers();
  const pendingTeachers = teachers.filter(t => !t.approved && t.id !== user.id);

  const handleApprove = (id, name) => { approveTeacher(id); toast_(`${name.split(' ')[0]} approved`); re(); };
  const handleReject  = (id, name) => { rejectTeacher(id);  toast_(`${name.split(' ')[0]} rejected`, 'info'); re(); };

  return (
    <>
      <Header title="My Profile" urdu="میری معلومات" sub="Maulana Account"/>
      <div className="page-body">
        <Card style={{ display:'flex', alignItems:'center', gap:14 }}>
          <Avatar name={user.name} id={user.id} size={62}/>
          <div>
            <h2 style={{ fontSize:18, fontWeight:700, margin:'0 0 6px', color:'var(--n900)' }}>Maulana {user.name}</h2>
            <Pill color="purple"><Shield size={11}/>Teacher</Pill>
          </div>
        </Card>

        {pendingTeachers.length>0 && (
          <Card style={{ border:'1px solid #FDE68A', background:'#FFFBEB' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
              <UserCog size={16} color="#D97706" strokeWidth={2}/>
              <p style={{ fontSize:13, fontWeight:700, color:'#92400E', margin:0 }}>New Maulana Requests ({pendingTeachers.length})</p>
            </div>
            {pendingTeachers.map(t => (
              <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10, background:'white', borderRadius:'var(--r-sm)', padding:'10px 12px', marginBottom:8, border:'1px solid #FDE68A' }}>
                <Avatar name={t.name} id={t.id} size={36}/>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:'var(--n900)', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.name}</p>
                </div>
                <div style={{ display:'flex', gap:6, flexShrink:0 }}>
                  <button onClick={()=>handleApprove(t.id, t.name)} style={{ width:32, height:32, borderRadius:8, border:'none', background:'var(--g50)', color:'var(--g500)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <CheckCircle2 size={16} strokeWidth={2.5}/>
                  </button>
                  <button onClick={()=>handleReject(t.id, t.name)} style={{ width:32, height:32, borderRadius:8, border:'none', background:'var(--danger-bg)', color:'var(--danger)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <X size={16} strokeWidth={2.5}/>
                  </button>
                </div>
              </div>
            ))}
          </Card>
        )}

        <Card accent>
          <p style={{ fontSize:13, fontWeight:700, color:'var(--n700)', margin:'0 0 12px' }}>Madrasa Overview</p>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {[['Students',totalStudents,'var(--g400)'],['Teachers',totalTeachers,'#7F77DD'],['Days',daysRecorded,'var(--info)'],['Attendance',avgAttendance+'%',avgAttendance>=70?'var(--g400)':'var(--danger)']].map(([l,v,c])=>(
              <div key={l} style={{ background:'white', borderRadius:'var(--r-sm)', padding:'12px 10px', textAlign:'center', border:'1px solid var(--n200)' }}>
                <div style={{ fontWeight:800, fontSize:22, color:c }}>{v}</div>
                <div style={{ fontSize:11, color:'var(--n400)', marginTop:3 }}>{l}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          {[[Hash,'Teacher ID',user.id],[Mail,'Email',user.email],[Phone,'Phone',user.phone||'—']].map(([Ic,k,v])=>(
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
          <LogOut size={16} strokeWidth={2.2}/>Sign Out
        </button>
      </div>
    </>
  );
}
