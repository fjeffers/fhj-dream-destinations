'use client'
import { useState } from 'react'

export default function RsvpForm({ event }: { event: { id: string, title: string, capacity: number, spotsLeft: number } }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', party_size: '1', dietary_needs: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [submittedName, setSubmittedName] = useState('')

  const set = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.full_name.trim() || !form.email.trim()) return
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, event_id: event.id, party_size: parseInt(form.party_size) || 1 })
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
      <div style={{ background: 'white', border: '2px solid rgba(14,143,143,0.3)', borderRadius: 4, padding: '56px 40px', textAlign: 'center', boxShadow: '0 4px 40px rgba(14,143,143,0.1)' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #076060, #0E8F8F)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>✓</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 38, fontWeight: 300, color: '#2C2010', marginBottom: 12 }}>
          You're on the list, {submittedName}!
        </h2>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'rgba(44,32,16,0.65)', fontStyle: 'italic', lineHeight: 1.7, maxWidth: 440, margin: '0 auto 28px' }}>
          Your RSVP for <strong>{event.title}</strong> has been confirmed. We look forward to celebrating with you!
        </p>
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, rgba(196,154,10,0.4), transparent)', margin: '0 auto 28px', maxWidth: 200 }} />
        <p style={{ fontSize: 13, color: 'rgba(44,32,16,0.5)', fontFamily: 'Cinzel, serif', letterSpacing: 2 }}>
          KEEP AN EYE ON YOUR EMAIL FOR DETAILS
        </p>
      </div>
    )
  }

  return (
    <div style={{ background: 'white', border: '2px solid rgba(196,154,10,0.2)', borderRadius: 4, boxShadow: '0 4px 40px rgba(196,154,10,0.08)', overflow: 'hidden' }}>
      {/* Form Header */}
      <div style={{ background: 'linear-gradient(135deg, #FDFAF3, #F4EFE0)', padding: '28px 40px', borderBottom: '2px solid rgba(196,154,10,0.15)' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 4, color: '#076060', fontWeight: 700, marginBottom: 8 }}>RSVP</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 300, color: '#2C2010' }}>
          Reserve Your Spot
        </h2>
        <p style={{ color: 'rgba(44,32,16,0.55)', fontSize: 14, marginTop: 6 }}>
          {event.spotsLeft} spot{event.spotsLeft !== 1 ? 's' : ''} remaining — secure yours now
        </p>
      </div>

      {/* Form Body */}
      <form onSubmit={submit} style={{ padding: '36px 40px' }}>
        {status === 'error' && (
          <div style={{ padding: '14px 18px', background: 'rgba(192,57,43,0.08)', border: '2px solid rgba(192,57,43,0.3)', color: '#C0392B', fontSize: 14, marginBottom: 24, borderRadius: 3, lineHeight: 1.6 }}>
            ⚠ {errorMsg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
          {/* Full Name */}
          <div style={{ marginBottom: 20, gridColumn: '1 / -1' }}>
            <label style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2.5, color: '#076060', display: 'block', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>
              Full Name *
            </label>
            <input
              required
              type="text"
              placeholder="Your full name"
              value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              style={{ width: '100%', background: 'white', border: '2px solid rgba(196,154,10,0.25)', color: '#2C2010', padding: '14px 18px', fontFamily: 'Lato, sans-serif', fontSize: 16, outline: 'none', borderRadius: 0, transition: 'border-color 0.3s' }}
              onFocus={e => (e.target.style.borderColor = '#0E8F8F')}
              onBlur={e => (e.target.style.borderColor = 'rgba(196,154,10,0.25)')}
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2.5, color: '#076060', display: 'block', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>
              Email Address *
            </label>
            <input
              required
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              style={{ width: '100%', background: 'white', border: '2px solid rgba(196,154,10,0.25)', color: '#2C2010', padding: '14px 18px', fontFamily: 'Lato, sans-serif', fontSize: 16, outline: 'none', borderRadius: 0, transition: 'border-color 0.3s' }}
              onFocus={e => (e.target.style.borderColor = '#0E8F8F')}
              onBlur={e => (e.target.style.borderColor = 'rgba(196,154,10,0.25)')}
            />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2.5, color: '#076060', display: 'block', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              style={{ width: '100%', background: 'white', border: '2px solid rgba(196,154,10,0.25)', color: '#2C2010', padding: '14px 18px', fontFamily: 'Lato, sans-serif', fontSize: 16, outline: 'none', borderRadius: 0, transition: 'border-color 0.3s' }}
              onFocus={e => (e.target.style.borderColor = '#0E8F8F')}
              onBlur={e => (e.target.style.borderColor = 'rgba(196,154,10,0.25)')}
            />
          </div>

          {/* Party Size */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2.5, color: '#076060', display: 'block', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>
              Number in Your Party
            </label>
            <select
              value={form.party_size}
              onChange={e => set('party_size', e.target.value)}
              style={{ width: '100%', background: 'white', border: '2px solid rgba(196,154,10,0.25)', color: '#2C2010', padding: '14px 18px', fontFamily: 'Lato, sans-serif', fontSize: 16, outline: 'none', borderRadius: 0, cursor: 'pointer', transition: 'border-color 0.3s', appearance: 'none' }}
              onFocus={e => (e.target.style.borderColor = '#0E8F8F')}
              onBlur={e => (e.target.style.borderColor = 'rgba(196,154,10,0.25)')}
            >
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <option key={n} value={n}>{n} {n === 1 ? 'person (just me)' : 'people'}</option>
              ))}
            </select>
          </div>

          {/* Dietary Needs */}
          <div style={{ marginBottom: 20, gridColumn: '1 / -1' }}>
            <label style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2.5, color: '#076060', display: 'block', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>
              Dietary Requirements / Allergies
            </label>
            <input
              type="text"
              placeholder="e.g. Vegetarian, Gluten-free, Nut allergy (optional)"
              value={form.dietary_needs}
              onChange={e => set('dietary_needs', e.target.value)}
              style={{ width: '100%', background: 'white', border: '2px solid rgba(196,154,10,0.25)', color: '#2C2010', padding: '14px 18px', fontFamily: 'Lato, sans-serif', fontSize: 16, outline: 'none', borderRadius: 0, transition: 'border-color 0.3s' }}
              onFocus={e => (e.target.style.borderColor = '#0E8F8F')}
              onBlur={e => (e.target.style.borderColor = 'rgba(196,154,10,0.25)')}
            />
          </div>

          {/* Message */}
          <div style={{ marginBottom: 32, gridColumn: '1 / -1' }}>
            <label style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2.5, color: '#076060', display: 'block', marginBottom: 8, textTransform: 'uppercase', fontWeight: 600 }}>
              Message to the Host
            </label>
            <textarea
              rows={3}
              placeholder="A personal note, well wishes, or anything you'd like the host to know (optional)"
              value={form.message}
              onChange={e => set('message', e.target.value)}
              style={{ width: '100%', background: 'white', border: '2px solid rgba(196,154,10,0.25)', color: '#2C2010', padding: '14px 18px', fontFamily: 'Lato, sans-serif', fontSize: 16, outline: 'none', borderRadius: 0, resize: 'vertical', transition: 'border-color 0.3s' }}
              onFocus={e => (e.target.style.borderColor = '#0E8F8F')}
              onBlur={e => (e.target.style.borderColor = 'rgba(196,154,10,0.25)')}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          style={{ width: '100%', background: status === 'loading' ? 'rgba(14,96,96,0.6)' : 'linear-gradient(135deg, #076060, #0E8F8F, #1AAFAF)', color: 'white', border: 'none', padding: '18px', fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', cursor: status === 'loading' ? 'not-allowed' : 'pointer', transition: 'all 0.3s', fontWeight: 600, boxShadow: status === 'loading' ? 'none' : '0 4px 24px rgba(14,143,143,0.35)' }}>
          {status === 'loading' ? 'Submitting...' : 'Confirm My RSVP ✦'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'rgba(44,32,16,0.45)', fontFamily: 'Lato, sans-serif', lineHeight: 1.6 }}>
          By submitting you agree to receive event communications from FHJ Dream Destinations.
        </p>
      </form>
    </div>
  )
}
