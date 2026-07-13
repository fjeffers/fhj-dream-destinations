'use client'
import { useState, useEffect } from 'react'

const DESTINATIONS = [
  {
    key: 'website',
    icon: '🌐',
    label: 'Main Website',
    url: 'https://www.fhjdreamdestinations.com',
    action: 'Visit our website',
  },
  {
    key: 'booking',
    icon: '📅',
    label: 'Book Appointment',
    url: 'https://www.fhjdreamdestinations.com/book-appointment',
    action: 'Book an appointment',
  },
  {
    key: 'intake',
    icon: '📋',
    label: 'Trip Intake Form',
    url: 'https://www.fhjdreamdestinations.com/book',
    action: 'Submit an inquiry',
  },
]

export default function QRGeneratorPage() {
  const [selected, setSelected] = useState(0)
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const dest = DESTINATIONS[selected]

  useEffect(() => {
    setLoading(true)
    setQrDataUrl('')
    const encoded = encodeURIComponent(dest.url)
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}&color=073030&bgcolor=ffffff&ecc=H&qzone=1&format=png`
    fetch(apiUrl)
      .then(r => r.blob())
      .then(blob => {
        const reader = new FileReader()
        reader.onload = () => {
          setQrDataUrl(reader.result as string)
          setLoading(false)
        }
        reader.readAsDataURL(blob)
      })
      .catch(() => {
        setQrDataUrl(apiUrl)
        setLoading(false)
      })
  }, [selected])

  const downloadPlainQR = () => {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `FHJ-QR-${dest.key}.png`
    a.click()
    setStatus('Downloaded!')
    setTimeout(() => setStatus(''), 2500)
  }

  const downloadBrandedCard = async () => {
    if (!qrDataUrl) return
    try { await (document as any).fonts?.ready } catch {}

    const W = 900, H = 1180
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!

    // Cream background with double gold frame
    ctx.fillStyle = '#FDFAF3'
    ctx.fillRect(0, 0, W, H)
    ctx.strokeStyle = 'rgba(196,154,69,0.85)'
    ctx.lineWidth = 3
    ctx.strokeRect(26, 26, W - 52, H - 52)
    ctx.strokeStyle = 'rgba(196,154,69,0.3)'
    ctx.lineWidth = 1
    ctx.strokeRect(40, 40, W - 80, H - 80)

    // Header
    ctx.textAlign = 'center'
    ctx.fillStyle = '#073030'
    ctx.font = '700 42px Cinzel, Georgia, serif'
    ctx.fillText('FHJ DREAM DESTINATIONS', W / 2, 138)
    ctx.fillStyle = '#C49A45'
    ctx.font = '600 18px Cinzel, Georgia, serif'
    ctx.fillText('✦ CURATED JOURNEYS, CRAFTED WITH INTENTION ✦', W / 2, 180)

    // QR panel
    const qrSize = 520
    const qx = (W - qrSize) / 2
    const qy = 240
    ctx.fillStyle = 'white'
    ctx.fillRect(qx - 26, qy - 26, qrSize + 52, qrSize + 52)
    ctx.strokeStyle = '#C49A45'
    ctx.lineWidth = 4
    ctx.strokeRect(qx - 26, qy - 26, qrSize + 52, qrSize + 52)

    const img = new Image()
    if (!qrDataUrl.startsWith('data:')) img.crossOrigin = 'anonymous'
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = qrDataUrl })
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(img, qx, qy, qrSize, qrSize)

    // Action lines
    ctx.fillStyle = '#076060'
    ctx.font = '700 24px Cinzel, Georgia, serif'
    ctx.fillText('SCAN ME', W / 2, qy + qrSize + 92)
    ctx.fillStyle = '#2E2318'
    ctx.font = 'italic 400 40px "Cormorant Garamond", Georgia, serif'
    ctx.fillText(dest.action, W / 2, qy + qrSize + 148)

    // Footer contacts
    ctx.fillStyle = '#076060'
    ctx.font = '600 21px Cinzel, Georgia, serif'
    ctx.fillText('WWW.FHJDREAMDESTINATIONS.COM', W / 2, H - 118)
    ctx.fillStyle = '#8A7A6A'
    ctx.font = '400 26px "Cormorant Garamond", Georgia, serif'
    ctx.fillText('484-541-3573  ·  info@fhjdreamdestinations.com', W / 2, H - 76)

    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = `FHJ-QR-${dest.key}-card.png`
    a.click()
    setStatus('Downloaded!')
    setTimeout(() => setStatus(''), 2500)
  }

  const printSheet = () => {
    if (!qrDataUrl) { alert('QR code is still loading, please wait.'); return }
    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>FHJ Dream Destinations — Business Cards</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Cinzel:wght@400;600;700&display=swap" rel="stylesheet">
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{background:white;font-family:'Cormorant Garamond',serif;padding:0.5in;}
@page{size:8.5in 11in;margin:0;}
.header{display:flex;align-items:center;gap:20px;padding-bottom:20px;border-bottom:2.5px solid #C49A45;margin-bottom:24px;}
.logo-circle{width:76px;height:76px;border-radius:50%;border:3px solid #C49A45;background:#073030;display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:24px;color:#E8C87A;font-style:italic;font-weight:600;flex-shrink:0;}
.biz-name{font-family:'Cinzel',serif;font-size:26px;letter-spacing:4px;color:#073030;font-weight:700;line-height:1.2;}
.agent-name{font-family:'Cormorant Garamond',serif;font-size:20px;color:#8A7A6A;font-style:italic;margin:3px 0;}
.tagline{font-family:'Cinzel',serif;font-size:8px;letter-spacing:3px;color:#C49A45;}
.contact-bar{display:flex;gap:32px;padding:16px 24px;background:#F5ECD7;border:1px solid rgba(196,154,69,0.35);border-radius:8px;margin-bottom:28px;flex-wrap:wrap;align-items:center;}
.ci{display:flex;align-items:center;gap:10px;}
.ci-icon{width:30px;height:30px;border-radius:50%;background:#073030;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;}
.ci-label{font-family:'Cinzel',serif;font-size:7px;letter-spacing:2px;color:#8A7A6A;display:block;}
.ci-value{font-size:14px;color:#2E2318;display:block;}
.qr-row{display:flex;gap:28px;margin-bottom:28px;align-items:stretch;}
.qr-left{flex-shrink:0;text-align:center;}
.qr-frame{width:180px;height:180px;background:white;border:3px solid #C49A45;border-radius:12px;display:flex;align-items:center;justify-content:center;padding:10px;margin-bottom:8px;box-shadow:0 4px 20px rgba(196,154,69,0.2);}
.qr-frame img{width:156px;height:156px;display:block;}
.qr-scan-label{font-family:'Cinzel',serif;font-size:9px;letter-spacing:3px;color:#8A7A6A;margin-bottom:4px;}
.qr-url{font-family:'Cinzel',serif;font-size:7px;letter-spacing:1px;color:#073030;word-break:break-all;max-width:180px;}
.qr-right{flex:1;background:#073030;border-radius:12px;padding:24px 28px;color:white;display:flex;flex-direction:column;justify-content:center;}
.qr-right-eyebrow{font-family:'Cinzel',serif;font-size:9px;letter-spacing:5px;color:#E8C87A;margin-bottom:12px;}
.qr-right-title{font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:300;line-height:1.6;color:white;margin-bottom:16px;}
.qr-right-title em{color:#E8C87A;}
.qr-action{display:inline-block;padding:10px 22px;background:#C49A45;border-radius:4px;font-family:'Cinzel',serif;font-size:10px;letter-spacing:2px;color:#2E2318;font-weight:700;margin-bottom:14px;}
.qr-right-sub{font-family:'Cormorant Garamond',serif;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.75;font-style:italic;}
.cut-section{text-align:center;margin:20px 0 16px;}
.cut-line{border:none;border-top:1px dashed rgba(196,154,69,0.45);margin:6px 0;}
.cut-note{font-family:'Cinzel',serif;font-size:7px;letter-spacing:3px;color:rgba(196,154,69,0.5);}
.cards-grid{display:grid;grid-template-columns:3.5in 3.5in;gap:0.2in;justify-content:center;}
.card-f{width:3.5in;height:2in;background:linear-gradient(135deg,#073030 0%,#0d4a4a 45%,#073030 100%);border-radius:8px;border:1px solid rgba(196,154,69,0.6);display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:16px;position:relative;}
.card-f::after{content:'';position:absolute;inset:8px;border:1px solid rgba(196,154,69,0.2);border-radius:5px;pointer-events:none;}
.cf-logo{width:42px;height:42px;border-radius:50%;border:2px solid #C49A45;background:rgba(196,154,69,0.12);display:flex;align-items:center;justify-content:center;margin:0 auto 8px;font-family:'Cormorant Garamond',serif;font-size:15px;color:#E8C87A;font-style:italic;font-weight:600;}
.cf-brand{font-family:'Cinzel',serif;font-size:8px;letter-spacing:3px;color:#C49A45;font-weight:700;margin-bottom:2px;}
.cf-sub{font-family:'Cormorant Garamond',serif;font-size:8.5px;color:rgba(253,246,236,0.45);font-style:italic;margin-bottom:8px;}
.cf-divider{width:44px;height:1px;background:linear-gradient(90deg,transparent,#C49A45,transparent);margin:0 auto 8px;}
.cf-name{font-family:'Cormorant Garamond',serif;font-size:17px;color:white;font-weight:300;margin-bottom:2px;}
.cf-title{font-family:'Cinzel',serif;font-size:6px;letter-spacing:3px;color:rgba(196,154,69,0.65);}
.card-b{width:3.5in;height:2in;background:linear-gradient(160deg,#FDF6EC 0%,#F5ECD7 100%);border-radius:8px;border:1px solid rgba(196,154,69,0.5);display:flex;align-items:center;padding:13px 14px;gap:12px;position:relative;}
.card-b::after{content:'';position:absolute;inset:7px;border:1px solid rgba(196,154,69,0.2);border-radius:4px;pointer-events:none;}
.cb-qr{flex-shrink:0;text-align:center;z-index:1;}
.cb-qr-frame{width:84px;height:84px;background:white;border:2px solid #C49A45;border-radius:6px;display:flex;align-items:center;justify-content:center;padding:4px;margin-bottom:3px;}
.cb-qr-frame img{width:72px;height:72px;display:block;}
.cb-ql{font-family:'Cinzel',serif;font-size:6px;letter-spacing:2px;color:#8A7A6A;}
.cb-info{flex:1;z-index:1;}
.cb-brand{font-family:'Cinzel',serif;font-size:6px;letter-spacing:2px;color:#076060;font-weight:700;margin-bottom:3px;}
.cb-name{font-family:'Cormorant Garamond',serif;font-size:15px;color:#2E2318;margin-bottom:5px;line-height:1.2;}
.cb-row{font-family:'Cormorant Garamond',serif;font-size:9.5px;color:#8A7A6A;margin-bottom:2px;}
.cb-url{font-family:'Cinzel',serif;font-size:6.5px;letter-spacing:1px;color:#076060;margin-top:4px;display:block;}
</style>
</head>
<body>
<div class="header">
  <div class="logo-circle">FHJ</div>
  <div>
    <div class="biz-name">FHJ DREAM DESTINATIONS</div>
    <div class="agent-name">Hortense Jeffers</div>
    <div class="tagline">✦ LUXURY TRAVEL SPECIALIST &nbsp;·&nbsp; CURATED JOURNEYS, CRAFTED WITH INTENTION ✦</div>
  </div>
</div>
<div class="contact-bar">
  <div class="ci"><div class="ci-icon">📞</div><div><span class="ci-label">PHONE</span><span class="ci-value">484-541-3573</span></div></div>
  <div class="ci"><div class="ci-icon">✉</div><div><span class="ci-label">EMAIL</span><span class="ci-value">info@fhjdreamdestinations.com</span></div></div>
  <div class="ci"><div class="ci-icon">🌐</div><div><span class="ci-label">WEBSITE</span><span class="ci-value">fhjdreamdestinations.com</span></div></div>
</div>
<div class="qr-row">
  <div class="qr-left">
    <div class="qr-frame"><img src="${qrDataUrl}" /></div>
    <div class="qr-scan-label">✦ SCAN WITH YOUR PHONE ✦</div>
    <div class="qr-url">${dest.url}</div>
  </div>
  <div class="qr-right">
    <div class="qr-right-eyebrow">✦ SCAN TO CONNECT ✦</div>
    <div class="qr-right-title">Experience luxury travel planning at its finest.<br/><em>Let us craft your perfect journey.</em></div>
    <div class="qr-action">${dest.action.toUpperCase()}</div>
    <div class="qr-right-sub">FHJ Dream Destinations is a boutique luxury travel team dedicated to crafting extraordinary experiences — from private safaris to overwater bungalows, romantic getaways to family adventures.</div>
  </div>
</div>
<div class="cut-section">
  <hr class="cut-line">
  <div class="cut-note">✂ &nbsp; CUT ALONG THIS LINE &nbsp;—&nbsp; STANDARD BUSINESS CARDS BELOW (3.5" × 2") &nbsp; ✂</div>
  <hr class="cut-line">
</div>
<div class="cards-grid">
  <div class="card-f"><div class="cf-logo">FHJ</div><div class="cf-brand">FHJ DREAM DESTINATIONS</div><div class="cf-sub">Curated Journeys, Crafted with Intention</div><div class="cf-divider"></div><div class="cf-name">Hortense Jeffers</div><div class="cf-title">LUXURY TRAVEL SPECIALIST</div></div>
  <div class="card-b"><div class="cb-qr"><div class="cb-qr-frame"><img src="${qrDataUrl}" /></div><div class="cb-ql">SCAN ME</div></div><div class="cb-info"><div class="cb-brand">FHJ DREAM DESTINATIONS</div><div class="cb-name">Hortense Jeffers</div><div class="cb-row">📞 484-541-3573</div><div class="cb-row">✉ info@fhjdreamdestinations.com</div><span class="cb-url">fhjdreamdestinations.com</span></div></div>
  <div class="card-f"><div class="cf-logo">FHJ</div><div class="cf-brand">FHJ DREAM DESTINATIONS</div><div class="cf-sub">Curated Journeys, Crafted with Intention</div><div class="cf-divider"></div><div class="cf-name">Hortense Jeffers</div><div class="cf-title">LUXURY TRAVEL SPECIALIST</div></div>
  <div class="card-b"><div class="cb-qr"><div class="cb-qr-frame"><img src="${qrDataUrl}" /></div><div class="cb-ql">SCAN ME</div></div><div class="cb-info"><div class="cb-brand">FHJ DREAM DESTINATIONS</div><div class="cb-name">Hortense Jeffers</div><div class="cb-row">📞 484-541-3573</div><div class="cb-row">✉ info@fhjdreamdestinations.com</div><span class="cb-url">fhjdreamdestinations.com</span></div></div>
</div>
</body></html>`
    const w = window.open('', '_blank', 'width=900,height=700')
    if (!w) { alert('Please allow popups for this site, then try again.'); return }
    w.document.write(html)
    w.document.close()
    setTimeout(() => { w.focus(); w.print() }, 1200)
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: 'var(--teal)', marginBottom: 8, fontWeight: 600 }}>MARKETING TOOLS</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 300, color: 'var(--text-rich)' }}>
          QR Code <em style={{ color: 'var(--teal-dark)' }}>Generator</em>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>Generate printable business cards and QR codes to hand out or leave at partner businesses.</p>
      </div>

      <div style={{ background: 'white', border: '1px solid rgba(196,154,10,0.2)', borderRadius: 10, padding: 24, marginBottom: 28 }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: 'var(--teal)', marginBottom: 16, fontWeight: 700 }}>STEP 1 — WHERE SHOULD THE QR CODE DIRECT?</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {DESTINATIONS.map((d, i) => (
            <button key={d.key} onClick={() => setSelected(i)}
              style={{ padding: '16px 12px', borderRadius: 8, border: `2px solid ${selected === i ? 'var(--teal)' : 'rgba(196,154,10,0.2)'}`, background: selected === i ? 'rgba(14,143,143,0.08)' : 'white', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' }}>
              <div style={{ fontSize: 26, marginBottom: 8 }}>{d.icon}</div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: selected === i ? 'var(--teal-dark)' : 'var(--muted)', fontWeight: 700, marginBottom: 4 }}>{d.label.toUpperCase()}</div>
              <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: 1.4 }}>
                {d.url.replace('https://www.fhjdreamdestinations.com', '') || '/'}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid rgba(196,154,10,0.2)', borderRadius: 10, padding: 24, marginBottom: 28 }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: 'var(--teal)', marginBottom: 20, fontWeight: 700 }}>STEP 2 — PREVIEW YOUR CARDS</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>

          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 3, color: 'var(--muted)', marginBottom: 10 }}>FRONT</div>
            <div style={{ width: '100%', aspectRatio: '3.5/2', background: 'linear-gradient(135deg, #073030, #0d4a4a 45%, #073030)', borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 20, border: '1px solid rgba(196,154,69,0.5)', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 10, border: '1px solid rgba(196,154,69,0.2)', borderRadius: 6, pointerEvents: 'none' }} />
              <div style={{ width: 46, height: 46, borderRadius: '50%', border: '2px solid #C49A45', background: 'rgba(196,154,69,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: '#E8C87A', fontStyle: 'italic', fontWeight: 600, marginBottom: 8 }}>FHJ</div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: '#C49A45', fontWeight: 700, marginBottom: 2 }}>FHJ DREAM DESTINATIONS</div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 10, color: 'rgba(253,246,236,0.45)', fontStyle: 'italic', marginBottom: 8 }}>Curated Journeys, Crafted with Intention</div>
              <div style={{ width: 44, height: 1, background: 'linear-gradient(90deg,transparent,#C49A45,transparent)', marginBottom: 8 }} />
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'white', fontWeight: 300, marginBottom: 2 }}>Hortense Jeffers</div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 6, letterSpacing: 3, color: 'rgba(196,154,69,0.65)' }}>LUXURY TRAVEL SPECIALIST</div>
            </div>
          </div>

          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 3, color: 'var(--muted)', marginBottom: 10 }}>BACK</div>
            <div style={{ width: '100%', aspectRatio: '3.5/2', background: 'linear-gradient(160deg, #FDF6EC, #F5ECD7)', borderRadius: 10, display: 'flex', alignItems: 'center', padding: 16, gap: 14, border: '1px solid rgba(196,154,69,0.4)', boxShadow: '0 8px 32px rgba(196,154,10,0.1)', position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 8, border: '1px solid rgba(196,154,69,0.2)', borderRadius: 5, pointerEvents: 'none' }} />
              <div style={{ flexShrink: 0, textAlign: 'center', zIndex: 1 }}>
                <div style={{ width: 84, height: 84, background: 'white', border: '2px solid #C49A45', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4, marginBottom: 4 }}>
                  {loading ? (
                    <div style={{ fontSize: 9, color: '#8A7A6A', fontFamily: 'Cinzel, serif', letterSpacing: 1, textAlign: 'center' }}>LOADING...</div>
                  ) : qrDataUrl ? (
                    <img src={qrDataUrl} style={{ width: 72, height: 72, display: 'block' }} alt="QR Code" />
                  ) : null}
                </div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 7, letterSpacing: 2, color: '#8A7A6A' }}>SCAN ME</div>
              </div>
              <div style={{ flex: 1, zIndex: 1 }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 7, letterSpacing: 2, color: '#076060', fontWeight: 700, marginBottom: 3 }}>FHJ DREAM DESTINATIONS</div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, color: '#2E2318', marginBottom: 5 }}>Hortense Jeffers</div>
                <div style={{ fontSize: 10, color: '#8A7A6A', marginBottom: 2, fontFamily: 'Cormorant Garamond, serif' }}>📞 484-541-3573</div>
                <div style={{ fontSize: 9, color: '#8A7A6A', marginBottom: 2, fontFamily: 'Cormorant Garamond, serif', wordBreak: 'break-all' }}>✉ info@fhjdreamdestinations.com</div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 7, letterSpacing: 1, color: '#076060' }}>fhjdreamdestinations.com</div>
                <div style={{ marginTop: 5, padding: '3px 7px', background: 'rgba(58,125,125,0.1)', borderLeft: '2px solid #3A7D7D', borderRadius: 2 }}>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 6, letterSpacing: 1, color: '#3A7D7D' }}>SCAN TO</div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 9, color: '#2E2318', fontStyle: 'italic' }}>{dest.action}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginBottom: 28 }}>
        <button onClick={printSheet} disabled={loading || !qrDataUrl}
          style={{ background: loading || !qrDataUrl ? 'rgba(7,96,96,0.4)' : 'linear-gradient(135deg, #076060, #0E8F8F)', color: 'white', border: 'none', padding: '14px 32px', borderRadius: 6, fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, fontWeight: 700, cursor: loading || !qrDataUrl ? 'not-allowed' : 'pointer', boxShadow: loading || !qrDataUrl ? 'none' : '0 6px 24px rgba(7,96,96,0.3)', transition: 'all 0.2s' }}>
          🖨 PRINT FULL SHEET
        </button>
        <button onClick={downloadBrandedCard} disabled={loading || !qrDataUrl}
          style={{ background: 'white', color: 'var(--teal-dark)', border: '2px solid var(--teal)', padding: '14px 28px', borderRadius: 6, fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, fontWeight: 700, cursor: loading || !qrDataUrl ? 'not-allowed' : 'pointer', opacity: loading || !qrDataUrl ? 0.5 : 1 }}>
          ⬇ DOWNLOAD BRANDED CARD
        </button>
        <button onClick={downloadPlainQR} disabled={loading || !qrDataUrl}
          style={{ background: 'transparent', color: 'var(--muted)', border: '1px solid rgba(196,154,10,0.35)', padding: '14px 22px', borderRadius: 6, fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, fontWeight: 700, cursor: loading || !qrDataUrl ? 'not-allowed' : 'pointer', opacity: loading || !qrDataUrl ? 0.5 : 1 }}>
          QR ONLY
        </button>
        {loading && <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, color: 'var(--muted)' }}>Generating QR...</span>}
        {status && <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, color: 'var(--teal)', fontWeight: 700 }}>✓ {status}</span>}
      </div>

      <div style={{ background: 'rgba(14,143,143,0.06)', border: '1.5px solid rgba(14,143,143,0.2)', borderRadius: 8, padding: '20px 24px', lineHeight: 1.9, color: 'var(--text)' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: 'var(--teal)', marginBottom: 12, fontWeight: 700 }}>HOW TO USE</div>
        {[
          ['1', 'Choose where the QR code directs — website, booking, intake form, or group trips'],
          ['2', 'Click "Print Full Sheet" — a new window opens with your full business info and cards'],
          ['3', 'Print on card stock (80–110 lb) and take to FedEx Office or Staples to cut at 3.5" × 2"'],
          ['4', 'Click "Download Branded Card" for a ready-to-share image with the business name and contact info — or "QR Only" for the bare code'],
        ].map(([n, t]) => (
          <div key={n} style={{ display: 'flex', gap: 12, marginBottom: 6, fontSize: 14 }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: 'var(--teal)', fontWeight: 700, minWidth: 16 }}>{n}.</span>
            <span>{t}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
