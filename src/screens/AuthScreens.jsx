import React, { useState } from 'react';
import { BookMarked, GraduationCap, Shield, Eye, EyeOff, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Header, Inp, Sel, Btn, Segment, Toast, Sub } from '../components/UI';
import { T } from '../utils/translate';
import {
  addStudent, addTeacher, findUserByEmail, saveUser,
  emailExists, validateEmail, checkLoginRateLimit, isFirstTeacher,
} from '../utils/db';

export function SplashScreen({ onDone }) {
  React.useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, []);
  return (
    <div style={{ flex:1, background:'linear-gradient(160deg,#020b05 0%,#041409 18%,#0a3d20 50%,#1D9E75 85%,#35C090 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden', padding:'2rem' }}>
      {[200,300,420].map((s,i) => <div key={i} style={{ position:'absolute', width:s, height:s, borderRadius:'50%', border:`1px solid rgba(255,255,255,${0.04+i*0.02})` }}/>)}
      <div className="anim-splash" style={{ textAlign:'center', position:'relative', zIndex:1 }}>

        {/* Bismillah block — Arabic, transliteration, translation */}
        <p className="bismillah" style={{ color:'white', fontSize:26, margin:'0 0 6px' }}>
          بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ
        </p>
        <p style={{ color:'rgba(255,255,255,0.58)', fontSize:12, margin:'0 0 3px', fontStyle:'italic', letterSpacing:0.3 }}>
          Bismillah ir-Rahman ir-Raheem
        </p>
        <p style={{ color:'rgba(255,255,255,0.38)', fontSize:10.5, margin:'0 0 26px' }}>
          In the name of Allah, the Most Gracious, the Most Merciful
        </p>

        <div style={{ width:84, height:84, borderRadius:24, background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px', backdropFilter:'blur(8px)', animation:'pulse 2.8s ease-in-out infinite', boxShadow:'0 0 40px rgba(29,158,117,0.3)' }}>
          <BookMarked size={36} color="white" strokeWidth={1.5}/>
        </div>
        <h1 style={{ color:'white', fontSize:26, fontWeight:800, margin:0, letterSpacing:-0.5, lineHeight:1.2 }}>Noorul-Uloom</h1>
        <p style={{ color:'rgba(255,255,255,0.82)', fontSize:16, margin:'4px 0 0', fontWeight:600, letterSpacing:1 }}>Gulistan</p>
        <p style={{ color:'rgba(255,255,255,0.45)', fontSize:10.5, margin:'6px 0 0', letterSpacing:2, textTransform:'uppercase', fontWeight:500 }}>Attendance System</p>
      </div>
    </div>
  );
}

// ── Welcome — 3 big clear choices, nothing else ────────────────────────────────
export function WelcomeScreen({ onLogin, onRegisterStudent, onRegisterTeacher }) {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
      <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
        <div style={{ flex:1, background:'linear-gradient(155deg,#020b05 0%,#0a3d20 45%,#1D9E75 85%,#7DD9BA 100%)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2.4rem 2rem 4.5rem', position:'relative', overflow:'hidden' }}>
          {[180,280,380].map((s,i) => <div key={i} style={{ position:'absolute', width:s, height:s, borderRadius:'50%', border:`1px solid rgba(255,255,255,${0.04+i*0.015})` }}/>)}
          <svg style={{ position:'absolute', bottom:0, left:0, right:0 }} viewBox="0 0 430 56" preserveAspectRatio="none">
            <path d="M0,56 C110,16 320,46 430,8 L430,56 Z" fill="#F8F8F8"/>
          </svg>
          <div className="anim-fadeup" style={{ textAlign:'center', position:'relative', zIndex:1 }}>

            {/* Bismillah block */}
            <p className="bismillah" style={{ color:'white', fontSize:22, margin:'0 0 6px' }}>
              بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ
            </p>
            <p style={{ color:'rgba(255,255,255,0.58)', fontSize:10.5, margin:'0 0 2px', fontStyle:'italic' }}>
              Bismillah ir-Rahman ir-Raheem
            </p>
            <p style={{ color:'rgba(255,255,255,0.38)', fontSize:9.5, margin:'0 0 20px' }}>
              In the name of Allah, the Most Gracious, the Most Merciful
            </p>

            <div style={{ width:76, height:76, borderRadius:22, background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', backdropFilter:'blur(10px)', boxShadow:'0 8px 32px rgba(0,0,0,0.2)' }}>
              <BookMarked size={32} color="white" strokeWidth={1.5}/>
            </div>
            <h1 style={{ color:'white', fontSize:24, fontWeight:800, margin:0, letterSpacing:-0.4, lineHeight:1.2 }}>Noorul-Uloom</h1>
            <p style={{ color:'rgba(255,255,255,0.82)', fontSize:15, margin:'4px 0 0', fontWeight:600, letterSpacing:1 }}>Gulistan</p>
            <p style={{ color:'rgba(255,255,255,0.38)', fontSize:11, margin:'6px 0 0', fontStyle:'italic' }}>Madrasa Attendance System</p>
          </div>
        </div>
        <div style={{ background:'#F8F8F8', padding:'1.75rem 1.5rem 2.25rem', display:'flex', flexDirection:'column', gap:12 }}>
          <p style={{ textAlign:'center', color:'var(--n500)', fontSize:13, marginBottom:2, fontWeight:500 }}>Choose how you want to continue</p>
          <BigChoiceBtn en="Login"           ur={T.login}           icon={BookMarked}    onClick={onLogin}/>
          <BigChoiceBtn en="New Student"      ur={T.newAdmission}    icon={GraduationCap} onClick={onRegisterStudent} variant="secondary"/>
          <BigChoiceBtn en="I am a Maulana"   ur={T.registerMaulana} icon={Shield}        onClick={onRegisterTeacher} variant="ghost"/>
        </div>
      </div>
    </div>
  );
}

function BigChoiceBtn({ en, ur, icon: Icon, onClick, variant='primary' }) {
  const styles = {
    primary:   { bg:'var(--g400)', color:'white', border:'none', shadow:'var(--shadow-green)' },
    secondary: { bg:'white', color:'var(--g500)', border:'1.5px solid var(--g400)', shadow:'none' },
    ghost:     { bg:'transparent', color:'var(--n600)', border:'1.5px solid var(--n200)', shadow:'none' },
  };
  const s = styles[variant];
  return (
    <button onClick={onClick} style={{ width:'100%', padding:'15px 18px', borderRadius:'var(--r)', border:s.border, background:s.bg, cursor:'pointer', display:'flex', alignItems:'center', gap:13, fontFamily:'inherit', boxShadow:s.shadow }}>
      <div style={{ width:36, height:36, borderRadius:10, background: variant==='primary'?'rgba(255,255,255,0.2)':'var(--g50)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={18} color={variant==='primary'?'white':'var(--g500)'} strokeWidth={2}/>
      </div>
      <div style={{ textAlign:'left' }}>
        <div style={{ fontSize:15.5, fontWeight:700, color:s.color, letterSpacing:-0.2 }}>{en}</div>
        <span className="urdu-sub" style={{ color: variant==='primary'?'rgba(255,255,255,0.72)':'var(--n400)', textAlign:'center', display:'block', width:'100%' }}>{ur}</span>
      </div>
    </button>
  );
}

function PasswordInp({ label, urdu, placeholder, value, onChange, err, onKeyDown }) {
  const [show, setShow] = useState(false);
  return (
    <div className="field">
      {label && <label className="field-label">{label}{urdu && <span className="urdu-sub" style={{ display:'block', textTransform:'none', fontWeight:500, fontStyle:'italic', letterSpacing:0.1, color:'var(--n400)', fontSize:10.5, marginTop:2 }}>{urdu}</span>}</label>}
      <div style={{ position:'relative' }}>
        <input className={`field-input${err?' has-error':''}`} type={show?'text':'password'}
          placeholder={placeholder} value={value} onChange={onChange} onKeyDown={onKeyDown}
          style={{ paddingRight:44 }}/>
        <button type="button" onClick={() => setShow(v=>!v)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:4, color:'var(--n400)', display:'flex', alignItems:'center' }}>
          {show ? <EyeOff size={16} strokeWidth={2}/> : <Eye size={16} strokeWidth={2}/>}
        </button>
      </div>
      {err && <span className="field-error">{err}</span>}
    </div>
  );
}

// ── Login — simplest possible: 2 fields, 1 button ──────────────────────────────
export function LoginScreen({ onBack, onSuccess }) {
  const [role,  setRole]  = useState('student');
  const [form,  setForm]  = useState({ email:'', password:'' });
  const [errs,  setErrs]  = useState({});
  const [toast, setToast] = useState(null);
  const f = k => e => setForm(p => ({ ...p, [k]:e.target.value }));
  const toast_ = (msg, type='error') => setToast({ msg, type });

  const submit = () => {
    const e = {};
    if (!form.email)    e.email    = 'Email is required';
    if (!form.password) e.password = 'Password is required';
    if (Object.keys(e).length) { setErrs(e); return; }
    const limit = checkLoginRateLimit(form.email);
    if (limit.blocked) { toast_(`Too many attempts. Try again in ${limit.remaining}s`); return; }
    const user = findUserByEmail(form.email, form.password);
    if (!user) { toast_('Wrong email or password — Email ya password ghalat hai'); return; }
    if (role==='teacher' && user.role!=='teacher') { toast_('This is a Student account, not Maulana'); return; }
    if (role==='student' && user.role!=='student') { toast_('This is a Maulana account, not Student'); return; }
    if (user.role==='teacher' && !user.approved) { toast_('Waiting for approval — Manzoori ka intezar', 'info'); return; }
    saveUser(user);
    toast_(`Welcome, ${user.role==='teacher'?'Maulana ':''}${user.name.split(' ')[0]}!`, 'success');
    setTimeout(() => onSuccess(user), 1100);
  };

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:'var(--n50)', overflowY:'auto' }}>
      <Header title="Login" urdu="اندر آئیں" sub="Sign in to your account" showBack onBack={onBack}/>
      <div style={{ padding:'1.5rem', flex:1 }}>
        <Segment value={role} onChange={setRole} options={[
          { value:'student', label:'Student', Icon:GraduationCap },
          { value:'teacher', label:'Maulana', Icon:Shield },
        ]}/>
        <Inp label="Email Address" urdu={T.email} type="email" placeholder="your@email.com"
          value={form.email} onChange={f('email')} err={errs.email}/>
        <PasswordInp label="Password" urdu={T.password} placeholder="Enter your password"
          value={form.password} onChange={f('password')} err={errs.password}
          onKeyDown={e => e.key==='Enter' && submit()}/>
        <div style={{ height:10 }}/>
        <Btn variant="primary" onClick={submit}>Sign In · {T.signIn}</Btn>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)}/>}
    </div>
  );
}

// ── Register — name, DOB, phone, address, guardian name always visible ────────
export function RegisterScreen({ initialRole='student', onBack, onSuccess }) {
  const [role,  setRole]  = useState(initialRole);
  const [form,  setForm]  = useState({ name:'', email:'', password:'', confirm:'', dob:'', class:'General', phone:'', address:'', guardianName:'' });
  const [errs,  setErrs]  = useState({});
  const [toast, setToast] = useState(null);
  const f = k => e => setForm(p => ({ ...p, [k]:e.target.value }));
  const toast_ = (msg, type='error') => setToast({ msg, type });
  const isFirst = isFirstTeacher();

  const validate = () => {
    const e = {};
    if (!form.name.trim())           e.name     = 'Please enter your name — Naam likhein';
    if (!validateEmail(form.email))  e.email    = 'Please enter a valid email — Sahi email likhein';
    if (form.password.length < 8)    e.password = 'Use at least 8 characters — Kam az kam 8 letters';
    else if (!/[0-9]/.test(form.password)) e.password = 'Add at least one number — Ek number zaroor dalein';
    if (form.password !== form.confirm) e.confirm = "Passwords don't match — Password match nahi karta";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    if (emailExists(form.email)) { toast_('This email is already used — Yeh email pehle se hai'); return; }
    if (role === 'student') {
      const user = addStudent({
        name: form.name, email: form.email, password: form.password,
        dob: form.dob, class: form.class || 'General',
        phone: form.phone, address: form.address,
        guardianName: form.guardianName,
      });
      saveUser(user);
      toast_(`Welcome, ${user.name.split(' ')[0]}!`, 'success');
      setTimeout(() => onSuccess(user), 1100);
    } else {
      addTeacher({ name:form.name, email:form.email, password:form.password, phone:form.phone, approved:isFirst });
      if (isFirst) {
        const user = findUserByEmail(form.email, form.password);
        saveUser(user);
        toast_(`Welcome, Maulana ${form.name.split(' ')[0]}!`, 'success');
        setTimeout(() => onSuccess(user), 1100);
      } else {
        toast_('Sent! Wait for the lead Maulana to approve you — Manzoori ka intezar karein', 'info');
        setTimeout(() => onBack(), 2800);
      }
    }
  };

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:'var(--n50)', overflowY:'auto' }}>
      <Header title="New Registration" urdu="نیا اکاؤنٹ بنائیں" sub="Join Noorul-Uloom Gulistan" showBack onBack={onBack}/>
      <div style={{ padding:'1.5rem' }}>
        <Segment value={role} onChange={setRole} options={[
          { value:'student', label:'Student', Icon:GraduationCap },
          { value:'teacher', label:'Maulana', Icon:Shield },
        ]}/>
        {role==='teacher' && !isFirst && (
          <div style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:12, padding:'12px 14px', marginBottom:16, display:'flex', gap:10, alignItems:'flex-start' }}>
            <AlertTriangle size={16} color="#D97706" strokeWidth={2} style={{ flexShrink:0, marginTop:1 }}/>
            <div>
              <p style={{ fontSize:12.5, color:'#92400E', margin:0, lineHeight:1.5, fontWeight:600 }}>The lead Maulana must approve you first</p>
              <p className="urdu-sub" style={{ fontSize:12.5, color:'#92400E', margin:'2px 0 0', textAlign:'center', display:'block' }}>{T.pendingApproval}</p>
            </div>
          </div>
        )}

        {/* Account fields */}
        <Inp label="Full Name" urdu={T.fullName} placeholder={role==='teacher'?'Maulana Muhammad Ali':'Muhammad Ahmed'}
          value={form.name} onChange={f('name')} err={errs.name}/>
        <Inp label="Email Address" urdu={T.email} type="email" placeholder="your@email.com"
          value={form.email} onChange={f('email')} err={errs.email}/>
        <PasswordInp label="Password (8+ characters, 1 number)" urdu="8 letters se zyada, 1 number zaroori"
          placeholder="e.g. Ahmed2025" value={form.password} onChange={f('password')} err={errs.password}/>
        <PasswordInp label="Confirm Password" urdu={T.confirmPassword}
          placeholder="Type it again" value={form.confirm} onChange={f('confirm')} err={errs.confirm}/>

        {role==='teacher' &&
          <Inp label="Phone Number" urdu={T.phoneNumber} type="tel" placeholder="+44 7700 000000"
            value={form.phone} onChange={f('phone')}/>
        }

        {/* Student personal details — always visible, kept short */}
        {role==='student' && (
          <>
            <div style={{ height:4 }}/>
            <p style={{ fontSize:11, fontWeight:700, color:'var(--n400)', textTransform:'uppercase', letterSpacing:0.8, margin:'4px 0 14px' }}>Student Details</p>

            <Sel label="Class" urdu={T.classLevel} value={form.class} onChange={f('class')}>
              <option value="Nursery (Qaida)">Nursery — Qaida</option>
              <option value="Class 1 — Quran Nazra">Class 1 — Quran Nazra</option>
              <option value="Class 2 — Hifz">Class 2 — Hifz</option>
              <option value="Class 3 — Urdu & Arabic">Class 3 — Urdu &amp; Arabic</option>
              <option value="Class 4 — Advanced Deen">Class 4 — Advanced Deen</option>
              <option value="General">General</option>
            </Sel>

            <Inp label="Date of Birth" urdu={T.dateOfBirth} type="date" value={form.dob} onChange={f('dob')}/>

            <Inp label="Phone Number" urdu="Apna Phone Number" type="tel" placeholder="+44 7700 000000"
              value={form.phone} onChange={f('phone')}/>

            <div className="field">
              <label className="field-label">Address<span className="urdu-sub" style={{ textTransform:'none', fontWeight:500 }}>{T.address}</span></label>
              <textarea
                value={form.address}
                onChange={f('address')}
                placeholder="House no, street, area"
                rows={2}
                maxLength={120}
                className="field-input"
                style={{ resize:'none', fontFamily:'inherit', lineHeight:1.5 }}
              />
            </div>

            <Inp label="Guardian Name" urdu={T.guardianName} placeholder="Parent or guardian full name"
              value={form.guardianName} onChange={f('guardianName')}/>
          </>
        )}

        <div style={{ height:6 }}/>
        <Btn variant="primary" onClick={submit}>
          {role==='teacher' ? (isFirst?'Create Account':'Send for Approval') : 'Finish Registration'}
        </Btn>
        <p className="urdu-sub" style={{ textAlign:'center', margin:'8px 0 0', fontSize:13, display:'block' }}>
          {role==='teacher' ? (isFirst ? T.completeAdmission : T.submitForApproval) : T.completeAdmission}
        </p>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)}/>}
    </div>
  );
}
