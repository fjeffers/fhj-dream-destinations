'use client'
import { useState } from 'react'

export default function RsvpForm({ event }: { event: { id: string, title: string, capacity: number, spotsLeft: number } }) {
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', party_size: '1', dietary_needs: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [submittedName, setSubmittedName] = useState('')
  const [focused, setFocused] = useState('')

  const set = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }))

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
      <div style={{ background: 'white', border: '2px solid rgba(14,143,143,0.3)', borderRadius: 16, padding: '64px 48px', textAlign: 'center', boxShadow: '0 8px 48px rgba(14,143,143,0.1)' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #076060, #0E8F8F)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: 36 }}>✓</div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#076060', marginBottom: 16, fontWeight: 700 }}>YOU'RE ON THE LIST</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 44, fontWeight: 300, color: '#2C2010', marginBottom: 16, lineHeight: 1.1 }}>
          We can't wait to see you, {submittedName}!
        </h2>
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, rgba(196,154,10,0.5), transparent)', margin: '0 auto 24px', maxWidth: 200 }} />
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'rgba(44,32,16,0.65)', fontStyle: 'italic', lineHeight: 1.7, maxWidth: 440, margin: '0 auto 28px' }}>
          Your RSVP for <strong style={{ fontStyle: 'normal', color: '#2C2010' }}>{event.title}</strong> has been confirmed. We look forward to celebrating with you!
        </p>
        <p style={{ fontSize: 13, color: 'rgba(44,32,16,0.4)', fontFamily: 'Cinzel, serif', letterSpacing: 2 }}>
          KEEP AN EYE ON YOUR EMAIL FOR DETAILS
        </p>
      </div>
    )
  }

  return (
    <div style={{ background: 'white', border: '1px solid rgba(196,154,10,0.2)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 48px rgba(196,154,10,0.08)' }}>
      {/* Form header */}
      <div style={{ background: 'linear-gradient(135deg, #076060, #0E8F8F)', padding: '32px 40px' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 4, color: 'rgba(232,200,122,0.8)', marginBottom: 8, fontWeight: 700 }}>YOUR RSVP</div>
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, fontWeight: 300, color: 'white', marginBottom: 6 }}>Tell Us About Yourself</h3>
        <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>
          {event.spotsLeft} spot{event.spotsLeft !== 1 ? 's' : ''} remaining — we'd love to save one for you
        </p>
      </div>

      <form onSubmit={submit} style={{ padding: '40px 40px' }}>
        {status === 'error' && (
          <div style={{ padding: '16px 20px', background: 'rgba(192,57,43,0.06)', border: '2px solid rgba(192,57,43,0.25)', color: '#C0392B', fontSize: 15, marginBottom: 28, borderRadius: 8, lineHeight: 1.6, fontFamily: 'Cormorant Garamond, serif' }}>
            ⚠ {errorMsg}
          </div>
        )}

        {/* Full Name */}
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>WHAT IS YOUR NAME?</label>
          <input required type="text" placeholder="Your full name, please" value={form.full_name}
            onChange={e => set('full_name', e.target.value)}
            onFocus={() => setFocused('full_name')} onBlur={() => setFocused('')}
            style={inputStyle('full_name')} />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>WHERE SHALL WE REACH YOU?</label>
          <input required type="email" placeholder="Your email address" value={form.email}
            onChange={e => set('email', e.target.value)}
            onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
            style={inputStyle('email')} />
        </div>

        {/* Phone */}
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>AND YOUR PHONE NUMBER? <span style={{ color: 'rgba(7,96,96,0.5)', fontWeight: 400 }}>(OPTIONAL)</span></label>
          <input type="tel" placeholder="e.g. +1 (555) 000-0000" value={form.phone}
            onChange={e => set('phone', e.target.value)}
            onFocus={() => setFocused('phone')} onBlur={() => setFocused('')}
            style={inputStyle('phone')} />
        </div>

        {/* Party Size */}
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>HOW MANY GUESTS WILL YOU BE BRINGING?</label>
          <select value={form.party_size} onChange={e => set('party_size', e.target.value)}
            onFocus={() => setFocused('party_size')} onBlur={() => setFocused('')}
            style={{ ...inputStyle('party_size'), appearance: 'none', cursor: 'pointer' }}>
            <option value="1">Just me — I'll be attending solo</option>
            <option value="2">2 of us — bringing one guest</option>
            <option value="3">3 guests total</option>
            <option value="4">4 guests total</option>
            <option value="5">5 guests total</option>
            <option value="6">6 guests total</option>
            <option value="7">7 guests total</option>
            <option value="8">8 guests total</option>
            <option value="9">9 guests total</option>
            <option value="10">10 guests total</option>
          </select>
        </div>

        {/* Dietary */}
        <div style={{ marginBottom: 28 }}>
          <label style={labelStyle}>ANY DIETARY NEEDS OR ALLERGIES? <span style={{ color: 'rgba(7,96,96,0.5)', fontWeight: 400 }}>(OPTIONAL)</span></label>
          <input type="text" placeholder="e.g. Vegetarian, gluten-free, nut allergy..." value={form.dietary_needs}
            onChange={e => set('dietary_needs', e.target.value)}
            onFocus={() => setFocused('dietary_needs')} onBlur={() => setFocused('')}
            style={inputStyle('dietary_needs')} />
        </div>

        {/* Message */}
        <div style={{ marginBottom: 36 }}>
          <label style={labelStyle}>ANYTHING YOU'D LIKE TO SHARE WITH THE HOST? <span style={{ color: 'rgba(7,96,96,0.5)', fontWeight: 400 }}>(OPTIONAL)</span></label>
          <textarea rows={4} placeholder="A personal note, well wishes, or anything special you'd like them to know..." value={form.message}
            onChange={e => set('message', e.target.value)}
            onFocus={() => setFocused('message')} onBlur={() => setFocused('')}
            style={{ ...inputStyle('message'), resize: 'vertical' }} />
        </div>

        <button type="submit" disabled={status === 'loading'}
          style={{ width: '100%', background: status === 'loading' ? 'rgba(14,96,96,0.6)' : 'linear-gradient(135deg, #076060, #0E8F8F)', color: 'white', border: 'none', padding: '20px', fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 4, cursor: status === 'loading' ? 'not-allowed' : 'pointer', borderRadius: 8, transition: 'all 0.3s', fontWeight: 700, boxShadow: status === 'loading' ? 'none' : '0 6px 28px rgba(14,143,143,0.35)' }}>
          {status === 'loading' ? 'CONFIRMING YOUR SPOT...' : 'YES, I\'LL BE THERE ✦'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'rgba(44,32,16,0.4)', fontFamily: 'Cinzel, serif', letterSpacing: 1, lineHeight: 1.6 }}>
          By submitting you agree to receive event communications from FHJ Dream Destinations.
        </p>
      </form>
    </div>
  )
}
