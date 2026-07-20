import React, { useEffect } from 'react';
import {
  Home, QrCode, ClipboardList, User, Users, BarChart3,
  CheckCircle2, XCircle, Clock, LogOut, ArrowLeft,
  Search, ChevronDown, ChevronUp, AlertTriangle,
  BookOpen, GraduationCap, Shield, Calendar,
  TrendingUp, Award, Flame, Check, X, Info,
  ScanLine, Fingerprint, BookMarked, Layers,
} from 'lucide-react';
import { initials, avatarColor, fmtDate } from '../utils/db';

export { Home, QrCode, ClipboardList, User, Users, BarChart3,
  CheckCircle2, XCircle, Clock, LogOut, ArrowLeft,
  Search, ChevronDown, ChevronUp, AlertTriangle,
  BookOpen, GraduationCap, Shield, Calendar,
  TrendingUp, Award, Flame, Check, X, Info,
  ScanLine, Fingerprint, BookMarked, Layers };

// ── Header ────────────────────────────────────────────────────────────────────
export function Header({ title, sub, urdu, showBack, onBack, rightEl }) {
  return (
    <div className="app-header">
      <svg className="pattern" viewBox="0 0 430 180" preserveAspectRatio="xMidYMid slice">
        {[0,1,2,3,4,5].map(i => (
          <g key={i} transform={`translate(${i * 82 - 18}, 0)`}>
            <circle cx={42} cy={42} r={38} fill="none" stroke="white" strokeWidth={1.4}/>
            <circle cx={42} cy={42} r={24} fill="none" stroke="white" strokeWidth={0.9}/>
            <circle cx={42} cy={148} r={38} fill="none" stroke="white" strokeWidth={1.4}/>
            <line x1={42} y1={4} x2={42} y2={80} stroke="white" strokeWidth={0.7}/>
            <line x1={4} y1={42} x2={80} y2={42} stroke="white" strokeWidth={0.7}/>
            <line x1={16} y1={16} x2={68} y2={68} stroke="white" strokeWidth={0.4}/>
            <line x1={68} y1={16} x2={16} y2={68} stroke="white" strokeWidth={0.4}/>
          </g>
        ))}
      </svg>
      <div className="hcontent" style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {showBack && (
            <button className="btn-icon" onClick={onBack}>
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
              <BookMarked size={13} color="rgba(255,255,255,0.55)" strokeWidth={2}/>
              <span style={{ color:'rgba(255,255,255,0.55)', fontSize:10, letterSpacing:1.5, textTransform:'uppercase', fontWeight:600 }}>Noorul-Uloom · Gulistan</span>
            </div>
            <h2 style={{ color:'white', fontSize:18, fontWeight:700, margin:0, lineHeight:1.3, letterSpacing:-0.3 }}>{title}</h2>
            {sub && <p style={{ color:'rgba(255,255,255,0.55)', fontSize:12, margin:'3px 0 0', fontWeight:400 }}>{sub}</p>}
            {urdu && <p className="urdu-sub" style={{ color:'rgba(255,255,255,0.6)', fontSize:13, margin:'4px 0 0', display:'block', textAlign:'center', width:'100%' }}>{urdu}</p>}
          </div>
        </div>
        {rightEl}
      </div>
    </div>
  );
}

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name, id, size = 40 }) {
  return (
    <div className="avatar" style={{
      width: size, height: size,
      background: avatarColor(id || name),
      fontSize: Math.round(size * 0.33),
    }}>
      {initials(name)}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
export function Toast({ msg, type = 'success', onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  const colors = { success:'#1D9E75', error:'#E5412A', info:'#2563EB', warning:'#D97706' };
  const icons  = { success:<Check size={12}/>, error:<X size={12}/>, info:<Info size={12}/>, warning:<AlertTriangle size={12}/> };
  return (
    <div className="toast" style={{ background: colors[type] || colors.success }}>
      <div className="toast-icon">{icons[type]}</div>
      {msg}
    </div>
  );
}

// ── Field (input) ─────────────────────────────────────────────────────────────
export function Field({ label, urdu, err, children }) {
  return (
    <div className="field">
      {label && <label className="field-label" style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:2 }}>{label}{urdu && <span className="urdu-sub" style={{ textTransform:'none', fontWeight:500, fontSize:12, display:'block', textAlign:'center', width:'100%' }}>{urdu}</span>}</label>}
      {children}
      {err && <span className="field-error">{err}</span>}
    </div>
  );
}

export function Inp({ label, urdu, err, ...props }) {
  return (
    <Field label={label} urdu={urdu} err={err}>
      <input className={`field-input${err ? ' has-error' : ''}`} {...props} />
    </Field>
  );
}

export function Sel({ label, urdu, children, ...props }) {
  return (
    <Field label={label} urdu={urdu}>
      <select className="field-select" {...props}>{children}</select>
    </Field>
  );
}

// ── Button ────────────────────────────────────────────────────────────────────
export function Btn({ children, variant='primary', size='md', icon: Icon, style:ext, ...props }) {
  return (
    <button className={`btn btn-${variant}${size==='sm'?' btn-sm':size==='xs'?' btn-xs':''}`} style={ext} {...props}>
      {Icon && <Icon size={size==='sm'?15:16} strokeWidth={2.2}/>}
      {children}
    </button>
  );
}

// ── Segment ───────────────────────────────────────────────────────────────────
export function Segment({ options, value, onChange }) {
  return (
    <div className="segment">
      {options.map(o => (
        <button key={o.value} className={`seg-btn${value===o.value?' active':''}`} onClick={() => onChange(o.value)}>
          {o.Icon && <o.Icon size={14} strokeWidth={value===o.value?2.5:2}/>}
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, color, iconBg, Icon, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: iconBg || '#F3F4F6' }}>
        {Icon && <Icon size={18} color={color || '#6B6B6B'} strokeWidth={2}/>}
      </div>
      <div className="stat-value" style={{ color: color || '#1A1A1A' }}>{value}</div>
      {sub && <div className="stat-sub" style={{ color: sub.color || '#9A9A9A' }}>{sub.text}</div>}
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, style, accent, dark, onClick }) {
  return (
    <div
      className={`card${accent?' card-accent':''}${dark?' card-dark':''}`}
      style={style} onClick={onClick}
    >{children}</div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
export function ProgressBar({ pct, color }) {
  const c = color || (pct >= 75 ? 'var(--g400)' : 'var(--danger)');
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width:`${Math.min(100, pct||0)}%`, background:c }}/>
    </div>
  );
}

// ── Pill ──────────────────────────────────────────────────────────────────────
export function Pill({ children, color='green' }) {
  return <span className={`pill pill-${color}`}>{children}</span>;
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function Empty({ Icon = ClipboardList, title, sub }) {
  return (
    <div className="empty-state">
      <div className="empty-icon" style={{ color:'#C4C4C4' }}>
        <Icon size={48} strokeWidth={1.2}/>
      </div>
      <h3>{title}</h3>
      {sub && <p>{sub}</p>}
    </div>
  );
}

// ── Search Bar ────────────────────────────────────────────────────────────────
export function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="search-wrap">
      <Search size={16} className="search-icon" strokeWidth={2}/>
      <input
        className="search-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder || 'Search…'}
      />
    </div>
  );
}

// ── QR Code (pure SVG) ────────────────────────────────────────────────────────
// ── Urdu subtitle — real Urdu script, Jameel Khushkhati font ────────────────
export function Sub({ children }) {
  if (!children) return null;
  return <span className="urdu-sub" style={{ textAlign:'center', display:'block', width:'100%' }}>{children}</span>;
}

// ── Label with English + Urdu stacked ────────────────────────────────────────
export function Label2({ en, ur, size = 14, weight = 700, color = 'var(--n900)' }) {
  return (
    <div>
      <div style={{ fontSize: size, fontWeight: weight, color, letterSpacing: -0.2 }}>{en}</div>
      {ur && <span className="urdu-sub">{ur}</span>}
    </div>
  );
}

// ── Big action button with English + Urdu subtitle ───────────────────────────
export function BigBtn({ en, ur, icon: Icon, onClick, variant = 'primary', style: ext }) {
  const bg    = variant === 'primary' ? 'var(--g400)' : variant === 'danger' ? 'var(--danger)' : 'white';
  const color = variant === 'ghost' ? 'var(--n700)' : 'white';
  const border = variant === 'ghost' ? '1.5px solid var(--n200)' : 'none';
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '16px 18px', borderRadius: 'var(--r)', border, background: bg,
      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, fontFamily: 'inherit',
      boxShadow: variant === 'primary' ? 'var(--shadow-green)' : variant === 'danger' ? '0 4px 16px rgba(229,65,42,0.22)' : 'none',
      ...ext,
    }}>
      {Icon && (
        <div style={{ width: 38, height: 38, borderRadius: 10, background: variant === 'ghost' ? 'var(--n100)' : 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={19} color={variant === 'ghost' ? 'var(--n600)' : 'white'} strokeWidth={2}/>
        </div>
      )}
      <div style={{ textAlign: 'left', flex: 1 }}>
        <div style={{ fontSize: 15.5, fontWeight: 700, color, letterSpacing: -0.2 }}>{en}</div>
        {ur && <span className="urdu-sub" style={{ color: variant === 'ghost' ? 'var(--n400)' : 'rgba(255,255,255,0.72)', textAlign:'center', display:'block', width:'100%' }}>{ur}</span>}
      </div>
    </button>
  );
}

export function QRCode({ value, size = 190 }) {
  const CELLS = 21;
  const cell  = size / CELLS;
  const hash  = [...value].reduce((a,c) => ((a*31)+c.charCodeAt(0))&0x7FFFFFFF, 0);

  const inFinder    = (r,c) => (r<7&&c<7)||(r<7&&c>=CELLS-7)||(r>=CELLS-7&&c<7);
  const finderBorder= (r,c) => {
    if(r<7&&c<7)          return r===0||r===6||c===0||c===6;
    if(r<7&&c>=CELLS-7)   return r===0||r===6||c===CELLS-1||c===CELLS-7;
    if(r>=CELLS-7&&c<7)   return r===CELLS-1||r===CELLS-7||c===0||c===6;
    return false;
  };
  const finderCore  = (r,c) =>
    (r>=2&&r<=4&&c>=2&&c<=4)||(r>=2&&r<=4&&c>=CELLS-5&&c<=CELLS-3)||(r>=CELLS-5&&r<=CELLS-3&&c>=2&&c<=4);
  const timing      = (r,c) => (r===6&&c>7&&c<CELLS-7)||(c===6&&r>7&&r<CELLS-7);

  const dark = [];
  for(let r=0;r<CELLS;r++) for(let c=0;c<CELLS;c++) {
    let d = false;
    if(inFinder(r,c))  d = finderBorder(r,c)||finderCore(r,c);
    else if(timing(r,c)) d = (r+c)%2===0;
    else d = !!((hash>>((r*CELLS+c)%29))&1)^((r*c+r+c)%3===0?1:0);
    if(d) dark.push([r,c]);
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display:'block', borderRadius:10 }}>
      <rect width={size} height={size} fill="white"/>
      {dark.map(([r,c]) => <rect key={`${r}-${c}`} x={c*cell} y={r*cell} width={cell-.3} height={cell-.3} fill="#0a1f12"/>)}
    </svg>
  );
}
