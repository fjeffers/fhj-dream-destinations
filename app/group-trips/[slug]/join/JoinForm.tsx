'use client'
import { useState } from 'react'

export default function JoinForm({ trip }: { trip: { id: string, name: string, price?: string, spotsLeft: number, isWaitlist: boolean } }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', travelers: '1', special_requests: '', deposit_acknowledged: false })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [submittedName, setSubmittedName] = useState('')
  const [focused, setFocused] = useState('')

  const set = (field: string, value: any) => setForm(p => ({ ...p, [field]: value }))

  const inputStyle = (field: string) => ({
    width: '100%',
    background: 'white',
    border: `2px solid ${focused === field ? '#0E8F8F' : 'rgba(196,154,10,0.25)'}`,
    color: '#2C2010',
    padding: '16px 20px',
    fontFamily: 'Cormorant Garamond, serif',
    fontSize: 18,
    outline: 'none',
    borderRadius: 8,
    transition: 'border-color 0.3s, box-shadow 0.3s',
    boxShadow: focused === field ? '0 0 0 3px rgba(14,143,143,0.1)' : 'none',
    boxSizing: 'border-box' as const,
  })

  const labelStyle = {
    fontFamily: 'Cinzel, serif',
    fontSize: 10,
    letterSpacing: 3,
    color: '#076060',
    display: 'block' as const,
    marginBottom: 10,
    fontWeight: 700,
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name.trim() || !form.email.trim()) return
    if (!form.deposit_acknowledged) {
      setErrorMsg('Please acknowledge the deposit requirement to continue.')
      setStatus('error')
      return
    }
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/group-trip-join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, trip_id: trip.id, travelers: parseInt(form.travelers) || 1 })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Something went wrong.')
      setSubmittedName(form.full_name.split(' ')[0])
      setStatus('success')
    } catch (err: any) {
      setErrorMsg(err.message)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div style={{ background: 'white', border: '2px solid rgba(14,143,143,0.3)', borderRadius: 16, padding: '64px 48px', textAlign: 'center', boxShadow: '0 8px 48px rgba(14,143,143,0.1)' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #076060, #0E8F8F)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: 36 }}>✓</div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#076060', marginBottom: 16, fontWeight: 700 }}>
          {trip.isWaitlist ? "YOU'RE ON THE WAITLIST" : "YOU'RE ON THE LIST"}
        </div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 300, color: '#2C2010', marginBottom: 16, lineHeight: 1.1 }}>
          {trip.isWaitlist ? `We'll be in touch, ${submittedName}!` : `Adventure awaits, ${submittedName}!`}
        </h2>
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, rgba(196,154,10,0.5), transparent)', margin: '0 auto 24px', maxWidth: 200 }} />
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'rgba(44,32,16,0.65)', fontStyle: 'italic', lineHeight: 1.7, maxWidth: 440, margin: '0 auto 28px' }}>
          Your spot request for <strong style={{ fontStyle: 'normal', color: '#2C2010' }}>{trip.name}</strong> has been received. Our team will reach out within 24 hours to confirm your booking.
        </p>
        <p style={{ fontSize: 13, color: 'rgba(44,32,16,0.4)', fontFamily: 'Cinzel, serif', letterSpacing: 2 }}>CHECK YOUR EMAIL FOR NEXT STEPS</p>
      </div>
    )
  }

  return (
    <div style={{ background: 'white', border: '1px solid rgba(196,154,10,0.2)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 48px rgba(196,154,10,0.08)' }}>
      <div style={{ background: 'linear-gradient(135deg, #076060, #0E8F8F)', padding: '32px 40px' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 4, color: 'rgba(232,200,122,0.8)', marginBottom: 8, fontWeight: 700 }}>YOUR REGISTRATION</div>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 30, fontWeight: 300, color: 'white', marginBottom: 6 }}>Tell Us About Yourself</h3>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>
          {trip.spotsLeft} spot{trip.spotsLeft !== 1 ? 's' : ''} remaining{trip.price && ` · ${trip.price}`}
        </p>
      </div>

      <form onSubmit={submit} style={{ padding: '40px' }}>
        {status === 'error' && (
          <div style={{ padding: '16px 20px', background: 'rgba(192,57,43,0.06)', border: '2px solid rgba(192,57,43,0.25)', color: '#C0392B', fontSize: 15, marginBottom: 28, borderRadius: 8, fontFamily: 'Cormorant Garamond, serif', lineHeight: 1.6 }}>
            ⚠ {errorMsg}
          </div>
        )}

        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>WHAT IS YOUR FULL NAME?</label>
          <input required type="text" placeholder="Your full name" value={form.full_name}
            onChange={e => set('full_name', e.target.value)}
            onFocus={() => setFocused('full_name')} onBlur={() => setFocused('')}
            style={inputStyle('full_name')} />
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>WHAT IS YOUR EMAIL ADDRESS?</label>
          <input required type="email" placeholder="Your email address" value={form.email}
            onChange={e => set('email', e.target.value)}
            onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
            style={inputStyle('email')} />
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>YOUR PHONE NUMBER? <span style={{ color: 'rgba(7,96,96,0.5)', fontWeight: 400 }}>(OPTIONAL)</span></label>
          <input type="tel" placeholder="+1 (555) 000-0000" value={form.phone}
            onChange={e => set('phone', e.target.value)}
            onFocus={() => setFocused('phone')} onBlur={() => setFocused('')}
            style={inputStyle('phone')} />
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>HOW MANY TRAVELERS IN YOUR PARTY?</label>
          <select value={form.travelers} onChange={e => set('travelers', e.target.value)}
            onFocus={() => setFocused('travelers')} onBlur={() => setFocused('')}
            style={{ ...inputStyle('travelers'), appearance: 'none', cursor: 'pointer' }}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <option key={n} value={n}>{n === 1 ? 'Just me — traveling solo' : `${n} travelers total`}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>ANY SPECIAL REQUESTS OR QUESTIONS? <span style={{ color: 'rgba(7,96,96,0.5)', fontWeight: 400 }}>(OPTIONAL)</span></label>
          <textarea rows={4} placeholder="Dietary needs, accessibility requirements, questions about the trip..." value={form.special_requests}
            onChange={e => set('special_requests', e.target.value)}
            onFocus={() => setFocused('special_requests')} onBlur={() => setFocused('')}
            style={{ ...inputStyle('special_requests'), resize: 'vertical' }} />
        </div>

        <div style={{ marginBottom: 36, padding: '20px 24px', background: 'rgba(196,154,10,0.06)', border: '2px solid rgba(196,154,10,0.2)', borderRadius: 10 }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.deposit_acknowledged} onChange={e => set('deposit_acknowledged', e.target.checked)}
              style={{ width: 20, height: 20, marginTop: 2, accentColor: '#076060', flexShrink: 0 }} />
            <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: '#2C2010', lineHeight: 1.6 }}>
              I understand that a deposit is required to secure my spot and that a member of the FHJ Dream Destinations team will contact me within 24 hours with payment details and next steps.
            </span>
          </label>
        </div>

        <button type="submit" disabled={status === 'loading'}
          style={{ width: '100%', background: status === 'loading' ? 'rgba(14,96,96,0.6)' : 'linear-gradient(135deg, #076060, #0E8F8F)', color: 'white', border: 'none', padding: '20px', fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 4, cursor: status === 'loading' ? 'not-allowed' : 'pointer', borderRadius: 8, fontWeight: 700, boxShadow: status === 'loading' ? 'none' : '0 6px 28px rgba(14,143,143,0.35)' }}>
          {status === 'loading' ? 'SUBMITTING...' : trip.isWaitlist ? 'JOIN THE WAITLIST ✦' : 'RESERVE MY SPOT ✦'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'rgba(44,32,16,0.4)', fontFamily: 'Cinzel, serif', letterSpacing: 1, lineHeight: 1.6 }}>
          No payment collected here. Our team will follow up within 24 hours.
        </p>
      </form>
    </div>
  )
}
