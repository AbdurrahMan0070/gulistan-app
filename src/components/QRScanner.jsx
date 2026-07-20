import React, { useState, useEffect, useRef } from 'react';
import { X, Keyboard, ScanLine } from 'lucide-react';
import { getStudents } from '../utils/db';
import { Avatar } from './UI';

export function QRScanner({ onScan, onClose }) {
  const [manual, setManual]         = useState('');
  const [camError, setCamError]     = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef  = useRef(null);
  const streamRef = useRef(null);
  const timerRef  = useRef(null);
  const students  = getStudents();

  useEffect(() => { startCamera(); return stopCamera; }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video:{ facingMode:'environment', width:{ ideal:1280 }, height:{ ideal:720 } }
      });
      streamRef.current = stream;
      if(videoRef.current){ videoRef.current.srcObject = stream; videoRef.current.play(); setCameraActive(true); startDetection(); }
    } catch { setCamError(true); }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if(timerRef.current) clearInterval(timerRef.current);
  };

  const startDetection = async () => {
    if(!('BarcodeDetector' in window)) return;
    try {
      const det = new window.BarcodeDetector({ formats:['qr_code'] });
      timerRef.current = setInterval(async () => {
        if(!videoRef.current) return;
        try {
          const codes = await det.detect(videoRef.current);
          if(codes.length) handleValue(codes[0].rawValue);
        } catch{}
      }, 350);
    } catch{}
  };

  const handleValue = (val) => {
    if(!val?.startsWith('GULISTAN:')) return;
    const id = val.split(':')[1];
    const s  = students.find(x => x.id === id);
    if(s){ stopCamera(); onScan(s); }
    else alert('Student not found in system.');
  };

  const tryManual = () => {
    const id = manual.trim().toUpperCase();
    const s  = students.find(x => x.id === id);
    if(s) onScan(s);
    else alert('Student ID not found.');
  };

  return (
    <div className="scanner-overlay">
      {/* Top bar */}
      <div style={{ padding:'52px 20px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <div>
          <h3 style={{ color:'white', margin:0, fontSize:19, fontWeight:700, letterSpacing:-0.3 }}>Scan QR Code</h3>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:12, margin:'3px 0 0' }}>
            {cameraActive ? 'Point camera at student QR code' : 'Select student or enter ID manually'}
          </p>
        </div>
        <button onClick={onClose} style={{ background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.15)', color:'white', borderRadius:10, width:38, height:38, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <X size={18}/>
        </button>
      </div>

      {/* Viewfinder */}
      <div style={{ display:'flex', justifyContent:'center', padding:'0 20px 20px', flexShrink:0 }}>
        <div style={{ width:230, height:230, borderRadius:20, position:'relative', background:'rgba(29,158,117,0.04)', overflow:'hidden', border:'1.5px solid rgba(29,158,117,0.5)' }}>
          {/* Corners */}
          {[
            { top:'-1px', left:'-1px',  borderTop:'3px solid #1D9E75', borderLeft:'3px solid #1D9E75', borderRadius:'12px 0 0 0' },
            { top:'-1px', right:'-1px', borderTop:'3px solid #1D9E75', borderRight:'3px solid #1D9E75', borderRadius:'0 12px 0 0' },
            { bottom:'-1px', left:'-1px', borderBottom:'3px solid #1D9E75', borderLeft:'3px solid #1D9E75', borderRadius:'0 0 0 12px' },
            { bottom:'-1px', right:'-1px', borderBottom:'3px solid #1D9E75', borderRight:'3px solid #1D9E75', borderRadius:'0 0 12px 0' },
          ].map((s, i) => <div key={i} style={{ position:'absolute', width:30, height:30, ...s }}/>)}

          {cameraActive && <video ref={videoRef} style={{ width:'100%', height:'100%', objectFit:'cover' }} playsInline muted autoPlay/>}
          {cameraActive && <div style={{ position:'absolute', left:10, right:10, height:1.5, background:'rgba(29,158,117,0.75)', borderRadius:1, animation:'scanLine 2s ease-in-out infinite', top:'20%', boxShadow:'0 0 8px rgba(29,158,117,0.5)' }}/>}

          {!cameraActive && (
            <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10 }}>
              <ScanLine size={36} color="rgba(255,255,255,0.2)" strokeWidth={1.2}/>
              <div style={{ color:'rgba(255,255,255,0.22)', fontSize:12, textAlign:'center', lineHeight:1.6 }}>
                {camError ? 'Camera unavailable\nUse list below' : 'Starting camera…'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual input */}
      <div style={{ padding:'0 20px 14px', flexShrink:0 }}>
        <div style={{ display:'flex', gap:8 }}>
          <div style={{ position:'relative', flex:1 }}>
            <Keyboard size={15} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.3)' }}/>
            <input value={manual} onChange={e=>setManual(e.target.value.toUpperCase())}
              placeholder="Enter Student ID…"
              onKeyDown={e=>e.key==='Enter'&&tryManual()}
              style={{ width:'100%', padding:'11px 14px 11px 36px', borderRadius:10, border:'1.5px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.07)', color:'white', fontSize:14, fontFamily:'inherit' }}/>
          </div>
          <button onClick={tryManual} style={{ padding:'11px 16px', background:'#1D9E75', color:'white', border:'none', borderRadius:10, fontWeight:700, cursor:'pointer', fontSize:14, fontFamily:'inherit', whiteSpace:'nowrap' }}>
            Mark
          </button>
        </div>
      </div>

      {/* Student list */}
      <div style={{ flex:1, overflowY:'auto', borderTop:'1px solid rgba(255,255,255,0.07)', padding:'14px 20px 20px' }}>
        {students.length===0
          ? <div style={{ textAlign:'center', padding:'30px 0', color:'rgba(255,255,255,0.25)', fontSize:14 }}>No students registered yet</div>
          : <>
              <p style={{ color:'rgba(255,255,255,0.35)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:1, margin:'0 0 10px' }}>Tap to mark present</p>
              <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                {students.map(s => (
                  <button key={s.id} onClick={()=>onScan(s)} style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:12, color:'white', cursor:'pointer', textAlign:'left', width:'100%', transition:'background 0.15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(29,158,117,0.18)'}
                    onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                    <Avatar name={s.name} id={s.id} size={38}/>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:14, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{s.name}</div>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:2 }}>{s.class} · {s.id}</div>
                    </div>
                    <div style={{ background:'rgba(29,158,117,0.2)', borderRadius:7, padding:'4px 10px', fontSize:11, color:'#7DD9BA', fontWeight:600, flexShrink:0 }}>Select</div>
                  </button>
                ))}
              </div>
            </>
        }
      </div>
    </div>
  );
}
