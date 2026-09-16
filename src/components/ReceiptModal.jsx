import React, { useRef, useState } from 'react';
import { X, Download, Share2, Printer, CheckCircle2, Clock, ShieldCheck, BookOpen } from 'lucide-react';

function fmtMonthLong(monthKey) {
  if (!monthKey) return '';
  const [y, m] = monthKey.split('-');
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

export function ReceiptModal({ student, monthKey, record, amount = 500, onClose }) {
  const receiptCardRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isPaid = record?.status === 'paid';
  const isPending = record?.status === 'pending';
  const monthName = fmtMonthLong(monthKey);
  const txnId = record?.txnId || 'N/A';
  const method = record?.method === 'cash' ? 'Cash / نقد' : 'UPI Online / آن لائن';
  const statusLabel = isPaid ? 'Verified & Paid' : isPending ? 'Submitted (Pending Verification)' : 'Unpaid';
  const statusUrdu = isPaid ? 'ادا شدہ' : isPending ? 'تصدیق کے لیے جمع' : 'غیر ادا شدہ';

  const dateStr = record?.submittedAt || record?.updatedAt
    ? new Date(record.submittedAt || record.updatedAt).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    : new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });

  const receiptNo = `REC-${(monthKey || '2026-09').replace('-', '')}-${(student?.id || '0000').slice(-4)}-${(txnId !== 'N/A' ? txnId : 'CASH').slice(-4)}`;

  // ── Formatted WhatsApp Text ────────────────────────────────────────────────
  const getWhatsAppMessage = () => {
    return (
`*NOORUL-ULOOM TRUST — GULISTAN*
*نور العلوم ٹرسٹ گلستان*
━━━━━━━━━━━━━━━━━━━━
📜 *FEE RECEIPT / فیس رسید*
━━━━━━━━━━━━━━━━━━━━
*Receipt No:* ${receiptNo}
*Date:* ${dateStr}
*Student:* ${student?.name || 'Student'}
*Student ID:* ${student?.id || 'N/A'}
*Class:* ${student?.class || 'Madrasa Noorul-Uloom'}
*Month:* ${monthName}
*Amount:* ₹${Number(record?.amount || amount).toLocaleString()}
*Payment Method:* ${method}
*Transaction ID / Code:* ${txnId}
*Status:* ${statusLabel} (${statusUrdu})
━━━━━━━━━━━━━━━━━━━━
جزاكم الله خيرا
_Official receipt from Noorul-Uloom Trust · Gulistan_`
    );
  };

  const handleShareWhatsApp = () => {
    const text = getWhatsAppMessage();
    const encoded = encodeURIComponent(text);
    // If student has a phone number, format for direct wa.me
    const phone = student?.phone ? student.phone.replace(/[^0-9]/g, '') : '';
    const url = phone && phone.length >= 10
      ? `https://api.whatsapp.com/send?phone=${phone}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;
    
    window.open(url, '_blank');
  };

  // ── High-DPI Canvas Download ────────────────────────────────────────────────
  const handleDownload = () => {
    setDownloading(true);
    try {
      const width = 800;
      const height = 1060;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Outer border (Emerald Green)
      ctx.strokeStyle = '#0a3d20';
      ctx.lineWidth = 14;
      ctx.strokeRect(18, 18, width - 36, height - 36);

      // Inner thin gold border
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(30, 30, width - 60, height - 60);

      // Header Banner
      const grad = ctx.createLinearGradient(0, 40, width, 180);
      grad.addColorStop(0, '#0a3d20');
      grad.addColorStop(1, '#1D9E75');
      ctx.fillStyle = grad;
      ctx.fillRect(34, 34, width - 68, 175);

      // Bismillah
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '22px "JameelKhushkhati", "Noto Nastaliq Urdu", serif';
      ctx.textAlign = 'center';
      ctx.fillText('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', width / 2, 75);

      // Trust Title
      ctx.font = 'bold 26px "Inter", -apple-system, sans-serif';
      ctx.fillText('NOORUL-ULOOM TRUST · GULISTAN', width / 2, 120);

      // Urdu Trust Title
      ctx.font = '22px "JameelKhushkhati", "Noto Nastaliq Urdu", serif';
      ctx.fillText('نور العلوم ٹرسٹ گلستان', width / 2, 155);

      // Sub-banner
      ctx.fillStyle = '#E8F7F0';
      ctx.fillRect(34, 210, width - 68, 48);
      ctx.strokeStyle = '#A3E2C7';
      ctx.lineWidth = 1;
      ctx.strokeRect(34, 210, width - 68, 48);

      ctx.fillStyle = '#0a3d20';
      ctx.font = 'bold 18px "Inter", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('FEE PAYMENT RECEIPT / فیس رسید', 55, 241);

      ctx.fillStyle = '#0a3d20';
      ctx.font = '15px "Inter", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`No: ${receiptNo}`, width - 55, 241);

      // Receipt Meta Box
      ctx.fillStyle = '#F8FAFC';
      ctx.fillRect(55, 275, width - 110, 80);
      ctx.strokeStyle = '#E2E8F0';
      ctx.strokeRect(55, 275, width - 110, 80);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#64748B';
      ctx.font = '13px "Inter", sans-serif';
      ctx.fillText('Date & Time:', 75, 305);
      ctx.fillText('Payment Status:', 75, 335);

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 14px "Inter", sans-serif';
      ctx.fillText(dateStr, 200, 305);

      ctx.fillStyle = isPaid ? '#15803D' : '#D97706';
      ctx.font = 'bold 15px "Inter", sans-serif';
      ctx.fillText(`${statusLabel} (${statusUrdu})`, 200, 335);

      // Table Header
      ctx.fillStyle = '#0a3d20';
      ctx.fillRect(55, 380, width - 110, 42);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px "Inter", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('PARTICULARS / تفصیل', 75, 406);
      ctx.textAlign = 'right';
      ctx.fillText('DETAILS / معلومات', width - 75, 406);

      // Row items
      const rows = [
        ['Student Name (طالب علم)', student?.name || '—'],
        ['Student ID (شناخت)', student?.id || '—'],
        ['Class (درجہ)', student?.class || 'General'],
        ['Guardian (سرپرست)', student?.guardianName || 'Parent / Guardian'],
        ['Fee Period (ماہانہ فیس)', monthName],
        ['Payment Method (طریقہ)', method],
        ['Transaction ID / Code', txnId],
      ];

      let startY = 445;
      rows.forEach(([label, val], idx) => {
        if (idx % 2 === 0) {
          ctx.fillStyle = '#F8FAFC';
          ctx.fillRect(55, startY - 24, width - 110, 38);
        }
        ctx.fillStyle = '#475569';
        ctx.font = '14px "Inter", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(label, 75, startY);

        ctx.fillStyle = '#0F172A';
        ctx.font = 'bold 14px "Inter", sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(val, width - 75, startY);

        // bottom separator
        ctx.strokeStyle = '#F1F5F9';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(55, startY + 14);
        ctx.lineTo(width - 55, startY + 14);
        ctx.stroke();

        startY += 40;
      });

      // Total Amount Highlight
      startY += 10;
      ctx.fillStyle = '#ECFDF5';
      ctx.fillRect(55, startY, width - 110, 60);
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.strokeRect(55, startY, width - 110, 60);

      ctx.fillStyle = '#065F46';
      ctx.font = 'bold 16px "Inter", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('Total Amount Paid (کل رقم):', 75, startY + 36);

      ctx.fillStyle = '#047857';
      ctx.font = 'bold 28px "Inter", sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`₹${Number(record?.amount || amount).toLocaleString()}`, width - 75, startY + 40);

      // Signatory Section
      startY += 120;
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(width - 280, startY);
      ctx.lineTo(width - 75, startY);
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = '13px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Authorized Signatory', width - 177, startY + 22);
      ctx.fillText('Noorul-Uloom Trust', width - 177, startY + 40);

      // Stamp badge
      ctx.strokeStyle = '#1D9E75';
      ctx.lineWidth = 2;
      ctx.strokeRect(75, startY - 45, 170, 75);
      ctx.fillStyle = '#0a3d20';
      ctx.font = 'bold 13px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('OFFICIAL RECEIPT', 160, startY - 18);
      ctx.font = '14px "JameelKhushkhati", serif';
      ctx.fillText('تصدیق شدہ رسید', 160, startY + 5);

      // Footer
      ctx.fillStyle = '#94A3B8';
      ctx.font = '12px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Computer Generated Official Receipt · Noorul-Uloom Trust Gulistan', width / 2, height - 50);

      // Save blob and trigger download
      canvas.toBlob((blob) => {
        if (!blob) return;
        const link = document.createElement('a');
        const fname = `Receipt-${(student?.name || 'Student').replace(/[^a-zA-Z0-9]/g, '_')}-${monthKey}.png`;
        link.download = fname;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
        setDownloading(false);
      }, 'image/png');
    } catch (e) {
      console.error(e);
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(10, 20, 12, 0.82)', zIndex: 4000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      backdropFilter: 'blur(6px)', overflowY: 'auto'
    }}>
      <div style={{
        background: 'white', borderRadius: '20px', width: '100%', maxWidth: '480px',
        maxHeight: '94vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column', position: 'relative'
      }}>
        
        {/* Top bar */}
        <div style={{
          padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderBottom: '1px solid var(--n100)', background: 'var(--n50)', borderRadius: '20px 20px 0 0'
        }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--n900)', margin: 0 }}>Fee Receipt</h3>
            <span className="urdu" style={{ fontSize: 15, color: 'var(--n500)', lineHeight: 1.6, display: 'block', textAlign: 'left' }}>
              فیس رسید
            </span>
          </div>
          <button onClick={onClose} style={{
            background: 'white', border: '1px solid var(--n200)', borderRadius: '50%',
            width: 34, height: 34, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X size={16} color="var(--n700)" strokeWidth={2}/>
          </button>
        </div>

        {/* Receipt Paper Card */}
        <div style={{ padding: '16px 20px' }}>
          <div ref={receiptCardRef} style={{
            background: '#FFFFFF', border: '2px solid var(--g400)', borderRadius: '16px',
            padding: '18px 16px', boxShadow: '0 4px 16px rgba(10,61,32,0.08)', position: 'relative'
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', borderBottom: '1.5px dashed var(--n200)', paddingBottom: '12px' }}>
              <p className="bismillah" style={{ fontSize: 17, color: 'var(--g500)', margin: '0 0 2px', lineHeight: 1.6 }}>
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--g500)', margin: '2px 0 0', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Noorul-Uloom Trust · Gulistan
              </h4>
              <p className="urdu" style={{ fontSize: 16, color: 'var(--n600)', margin: '2px 0 0', textAlign: 'center', lineHeight: 1.6 }}>
                نور العلوم ٹرسٹ گلستان
              </p>
              <div style={{
                display: 'inline-block', background: 'var(--g50)', border: '1px solid var(--g200)',
                borderRadius: '6px', padding: '2px 10px', marginTop: '6px'
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--g500)' }}>
                  OFFICIAL RECEIPT · {receiptNo}
                </span>
              </div>
            </div>

            {/* Status & Date */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0 10px' }}>
              <span style={{ fontSize: 12, color: 'var(--n500)' }}>{dateStr}</span>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: isPaid ? '#EDF9F4' : '#FFFBEB',
                border: `1px solid ${isPaid ? '#9FE1CB' : '#FDE68A'}`,
                padding: '3px 8px', borderRadius: '12px'
              }}>
                {isPaid ? <CheckCircle2 size={12} color="#1D9E75"/> : <Clock size={12} color="#D97706"/>}
                <span style={{ fontSize: 11, fontWeight: 700, color: isPaid ? '#1D9E75' : '#D97706' }}>
                  {statusLabel}
                </span>
              </div>
            </div>

            {/* Student & Payment Info */}
            <div style={{ background: 'var(--n50)', borderRadius: '10px', padding: '10px 12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: 12, color: 'var(--n500)' }}>Student / طالب علم:</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--n900)' }}>{student?.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: 12, color: 'var(--n500)' }}>Student ID:</span>
                <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'monospace' }}>{student?.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: 12, color: 'var(--n500)' }}>Class:</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{student?.class || 'General'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: 12, color: 'var(--n500)' }}>Fee Month / مہینہ:</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--g500)' }}>{monthName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: 12, color: 'var(--n500)' }}>Mode / طریقہ:</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>{method}</span>
              </div>
              {txnId && txnId !== 'N/A' && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: 'var(--n500)' }}>Payment Code / UTR:</span>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace' }}>{txnId}</span>
                </div>
              )}
            </div>

            {/* Total Paid banner */}
            <div style={{
              background: 'linear-gradient(135deg, #0a3d20, #1D9E75)', borderRadius: '10px',
              padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>Amount Paid / ادا شدہ رقم</span>
                <p style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: '2px 0 0', letterSpacing: -0.3 }}>
                  ₹{Number(record?.amount || amount).toLocaleString()}
                </p>
              </div>
              <span className="urdu" style={{ fontSize: 17, color: 'rgba(255,255,255,0.95)', textAlign: 'right', lineHeight: 1.6 }}>
                مکمل ادائیگی
              </span>
            </div>

            {/* Footer stamp */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '14px', paddingTop: '10px', borderTop: '1px dashed var(--n200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShieldCheck size={18} color="var(--g400)"/>
                <span style={{ fontSize: 11, color: 'var(--n500)', lineHeight: 1.3 }}>
                  Verified by<br/>Office Noorul-Uloom
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--n700)', margin: 0 }}>Authorized Signatory</p>
                <p className="urdu" style={{ fontSize: 15, color: 'var(--n500)', margin: '1px 0 0', textAlign: 'right', lineHeight: 1.6 }}>مولانا / دفتر</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 10
        }}>
          {/* WhatsApp button */}
          <button
            onClick={handleShareWhatsApp}
            style={{
              width: '100%', padding: '14px 18px', borderRadius: 'var(--r-sm)', border: 'none',
              background: '#25D366', color: 'white', fontWeight: 700, fontSize: 15,
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 9, boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)'
            }}
          >
            <Share2 size={18} strokeWidth={2.2}/>
            <span>Send on WhatsApp</span>
            <span className="urdu" style={{ fontSize: 15, color: 'rgba(255,255,255,0.95)', marginRight: -3, lineHeight: 1.5 }}>
              واٹس ایپ پر بھیجیں
            </span>
          </button>

          {/* Download & Print row */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                flex: 1, padding: '12px 14px', borderRadius: 'var(--r-sm)', border: '1.5px solid var(--g400)',
                background: 'var(--g50)', color: 'var(--g500)', fontWeight: 700, fontSize: 14,
                cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 7
              }}
            >
              <Download size={16} strokeWidth={2}/>
              <span>{downloading ? 'Saving…' : 'Download Receipt'}</span>
            </button>

            <button
              onClick={handlePrint}
              style={{
                padding: '12px 16px', borderRadius: 'var(--r-sm)', border: '1.5px solid var(--n200)',
                background: 'white', color: 'var(--n700)', fontWeight: 600, fontSize: 13,
                cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 6
              }}
            >
              <Printer size={15}/>
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
