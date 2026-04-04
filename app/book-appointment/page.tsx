'use client'
import { useState, useEffect } from 'react'
import { notifyAppointmentBooked, sendClientConfirmation } from '@/lib/sendEmail'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const TYPES = ['Consultation', 'Trip Planning', 'Intake', 'Follow-Up', 'VIP Meeting']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function generateSlots(start: string, end: string): string[] {
  const slots: string[] = []
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number) // eslint-disable-line @typescript-eslint/no-unused-vars
  let h = sh, m = sm
  while (h < eh || (h === eh && m < em)) {
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
    const ampm = h >= 12 ? 'PM' : 'AM'
    slots.push(`${hour}:${m === 0 ? '00' : m} ${ampm}`)
    m += 30
    if (m >= 60) { m -= 60; h++ }
  }
  return slots
}

export default function BookAppointmentPage() {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [confirmId, setConfirmId] = useState('')
  const [availability, setAvailability] = useState<any[]>([])
  const [bookedSlots, setBookedSlots] = useState<{date: string, time: string}[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [calMonth, setCalMonth] = useState(new Date())
  const [form, setForm] = useState({ name: '', email: '', phone: '', type: 'Consultation', notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = useState(() => createClient())[0]

  useEffect(() => {
    supabase.from('availability_settings').select('*').eq('active', true).then(({ data }) => setAvailability(data || []))
    supabase.from('appointments').select('date, time').then(({ data }) => setBookedSlots(data || []))
    supabase.from('appointment_requests').select('date, time').eq('status', 'Confirmed').then(({ data }) => {
      setBookedSlots(p => [...p, ...(data || [])])
    })
  }, [])

  const year = calMonth.getFullYear()
  const month = calMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = useState(() => { const d = new Date(); d.setHours(0,0,0,0); return d })[0]

  const isAvailable = (date: Date) => {
    if (date < today) return false
    const dow = date.getDay()
    return availability.some(a => a.day_of_week === dow)
  }

  const getSlotsForDate = (date: Date) => {
    const dow = date.getDay()
    const avail = availability.find(a => a.day_of_week === dow)
    if (!avail) return []
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    const booked = bookedSlots.filter(b => b.date === dateStr).map(b => b.time)
    return generateSlots(avail.start_time, avail.end_time).filter(s => !booked.includes(s))
  }

  const submit = async () => {
    if (!selectedDate || !selectedTime || !form.name || !form.email) {
      setError('Please fill in all required fields'); return
    }
    setLoading(true); setError('')
    const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
    const { data, error: err } = await supabase.from('appointment_requests').insert({
      ...form, date: dateStr, time: selectedTime, status: 'Pending'
    }).select().single()
    if (err) { setError(err.message); setLoading(false); return }
    setConfirmId(data.token || data.id)
    // Send email notifications (non-blocking)
    notifyAppointmentBooked({
      name: form.name,
      email: form.email,
      phone: form.phone,
      date: dateStr,
      time: selectedTime,
      type: form.type,
      notes: form.notes,
    })
    sendClientConfirmation({
      to_email: form.email,
      to_name: form.name,
      subject: 'Your Appointment Request — FHJ Dream Destinations',
      message: `Hi ${form.name},\n\nThank you for requesting an appointment with FHJ Dream Destinations!\n\nYour requested time: ${selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at ${selectedTime}\nAppointment type: ${form.type}\n\nWe will confirm your appointment within 2 hours.\n\nWarm regards,\nThe FHJ Dream Destinations Team\ninfo@fhjdreamdestinations.com`
    })
    setSubmitted(true); setLoading(false)
  }

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ maxWidth: 520, textAlign: 'center', animation: 'fadeUp 0.8s ease' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal-dark), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: 32, color: 'white' }}>✓</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 44, fontWeight: 300, marginBottom: 16, color: 'var(--text-rich)' }}>Request <em style={{ color: 'var(--teal-dark)' }}>Received</em></h2>
        <p style={{ fontSize: 18, color: 'var(--muted)', lineHeight: 1.8, marginBottom: 24 }}>
          Your appointment request for <strong>{selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong> at <strong>{selectedTime}</strong> has been submitted. We'll confirm within 2 hours.
        </p>
        <div style={{ background: 'white', border: '1px solid rgba(196,154,10,0.25)', borderRadius: 8, padding: '16px 24px', marginBottom: 32 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 2, color: 'var(--teal-dark)', marginBottom: 6 }}>CONFIRMATION ID</div>
          <div style={{ fontFamily: 'monospace', fontSize: 15, color: 'var(--text-rich)', wordBreak: 'break-all' }}>{confirmId}</div>
        </div>
        <Link href="/" className="btn-teal" style={{ borderRadius: 4, padding: '14px 44px', display: 'inline-block' }}>Return Home</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ivory)' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '2px solid rgba(196,154,10,0.2)', padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid var(--gold)', background: 'white', padding: 4, boxShadow: '0 2px 12px rgba(196,154,10,0.2)', flexShrink: 0 }}>
            <img src="/logo.png" alt="FHJ" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 14, color: 'var(--gold-dark)', fontWeight: 700, letterSpacing: 2 }}>FHJ DREAM</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 4, color: 'var(--teal-dark)', fontWeight: 600 }}>DESTINATIONS</div>
          </div>
        </Link>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 3, color: 'var(--teal-dark)', fontWeight: 600 }}>SCHEDULE A CONSULTATION</div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 6, color: 'var(--teal)', marginBottom: 14, fontWeight: 600 }}>BOOK AN APPOINTMENT</div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 52, fontWeight: 300, color: 'var(--text-rich)', lineHeight: 1.05 }}>
            Schedule Your <em style={{ color: 'var(--teal-dark)' }}>Consultation</em>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 18, marginTop: 16, lineHeight: 1.7 }}>
            Select a date and time that works for you. We'll confirm your appointment within 2 hours.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 48 }}>
          {['Select Date', 'Choose Time', 'Your Details'].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: step > i + 1 ? 'var(--teal)' : step === i + 1 ? 'var(--teal-dark)' : 'white', border: step <= i + 1 ? (step === i + 1 ? 'none' : '2px solid rgba(14,143,143,0.3)') : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: step >= i + 1 ? 'white' : 'var(--muted)', fontFamily: 'Cinzel, serif', fontSize: 13, fontWeight: 700, transition: 'all 0.3s' }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 2, color: step === i + 1 ? 'var(--teal-dark)' : 'var(--muted)', fontWeight: 600 }}>{s}</span>
              </div>
              {i < 2 && <div style={{ width: 80, height: 2, background: step > i + 1 ? 'var(--teal)' : 'rgba(14,143,143,0.2)', margin: '0 8px', marginBottom: 24, transition: 'background 0.3s' }} />}
            </div>
          ))}
        </div>

        {error && <div style={{ padding: '14px 18px', background: 'rgba(192,57,43,0.08)', border: '2px solid rgba(192,57,43,0.3)', color: 'var(--danger)', fontSize: 16, marginBottom: 24, borderRadius: 6 }}>{error}</div>}

        {/* Step 1: Calendar */}
        {step === 1 && (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(196,154,10,0.2)', boxShadow: '0 4px 32px rgba(0,0,0,0.06)', padding: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <button className="btn-ghost" style={{ borderRadius: 4, padding: '8px 18px', fontSize: 11 }} onClick={() => setCalMonth(new Date(year, month - 1, 1))}>← Prev</button>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 15, letterSpacing: 2, color: 'var(--text-rich)', fontWeight: 700 }}>{MONTHS[month]} {year}</span>
              <button className="btn-ghost" style={{ borderRadius: 4, padding: '8px 18px', fontSize: 11 }} onClick={() => setCalMonth(new Date(year, month + 1, 1))}>Next →</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
              {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 2, color: 'var(--teal-dark)', padding: '6px 0', fontWeight: 700 }}>{d}</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
              {Array(daysInMonth).fill(null).map((_, i) => {
                const d = i + 1
                const date = new Date(year, month, d)
                const avail = isAvailable(date)
                const isSelected = selectedDate?.toDateString() === date.toDateString()
                const isPast = date < today
                return (
                  <div key={d} onClick={() => { if (avail) { setSelectedDate(date); setSelectedTime('') } }}
                    style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, cursor: avail ? 'pointer' : 'default', background: isSelected ? 'var(--teal-dark)' : avail ? 'rgba(14,143,143,0.06)' : 'transparent', color: isSelected ? 'white' : isPast ? '#ccc' : avail ? 'var(--text-rich)' : '#ccc', fontWeight: isSelected ? 700 : 400, fontSize: 16, border: isSelected ? 'none' : avail ? '1px solid rgba(14,143,143,0.2)' : 'none', transition: 'all 0.2s' }}>
                    {d}
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(196,154,10,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--muted)' }}><div style={{ width: 14, height: 14, borderRadius: 3, background: 'rgba(14,143,143,0.06)', border: '1px solid rgba(14,143,143,0.2)' }} /> Available</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--muted)' }}><div style={{ width: 14, height: 14, borderRadius: 3, background: 'var(--teal-dark)' }} /> Selected</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(196,154,10,0.1)' }}>
              <button className="btn-teal" style={{ borderRadius: 4, padding: '12px 36px', opacity: selectedDate ? 1 : 0.4, cursor: selectedDate ? 'pointer' : 'default' }} onClick={() => selectedDate && setStep(2)}>
                Continue → Select Time
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Time Slots */}
        {step === 2 && selectedDate && (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(196,154,10,0.2)', boxShadow: '0 4px 32px rgba(0,0,0,0.06)', padding: 36 }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 300, color: 'var(--text-rich)', marginBottom: 6 }}>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <p style={{ color: 'var(--muted)', fontSize: 16, marginBottom: 28 }}>Select a 30-minute time slot</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {getSlotsForDate(selectedDate).map(slot => (
                <button key={slot} onClick={() => setSelectedTime(slot)}
                  style={{ padding: '12px 8px', borderRadius: 6, border: `2px solid ${selectedTime === slot ? 'var(--teal)' : 'rgba(14,143,143,0.2)'}`, background: selectedTime === slot ? 'rgba(14,143,143,0.1)' : 'white', color: selectedTime === slot ? 'var(--teal-dark)' : 'var(--text)', fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 1, cursor: 'pointer', fontWeight: selectedTime === slot ? 700 : 400, transition: 'all 0.2s' }}>
                  {slot}
                </button>
              ))}
              {getSlotsForDate(selectedDate).length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', color: 'var(--muted)', fontSize: 16 }}>No slots available for this date</div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(196,154,10,0.1)' }}>
              <button className="btn-ghost" style={{ borderRadius: 4, padding: '12px 28px' }} onClick={() => setStep(1)}>← Back</button>
              <button className="btn-teal" style={{ borderRadius: 4, padding: '12px 36px', opacity: selectedTime ? 1 : 0.4, cursor: selectedTime ? 'pointer' : 'default' }} onClick={() => selectedTime && setStep(3)}>
                Continue → Your Details
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(196,154,10,0.2)', boxShadow: '0 4px 32px rgba(0,0,0,0.06)', padding: 36 }}>
            <div style={{ background: 'rgba(14,143,143,0.06)', border: '1px solid rgba(14,143,143,0.2)', borderRadius: 8, padding: '16px 20px', marginBottom: 32, display: 'flex', gap: 24 }}>
              <div><div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 2, color: 'var(--teal-dark)', marginBottom: 4 }}>DATE</div><div style={{ fontSize: 16, color: 'var(--text-rich)', fontWeight: 600 }}>{selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div></div>
              <div style={{ width: 1, background: 'rgba(14,143,143,0.2)' }} />
              <div><div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 2, color: 'var(--teal-dark)', marginBottom: 4 }}>TIME</div><div style={{ fontSize: 16, color: 'var(--text-rich)', fontWeight: 600 }}>{selectedTime}</div></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              {[['Full Name *', 'name', 'text'], ['Email *', 'email', 'email'], ['Phone', 'phone', 'tel']].map(([label, field, type]) => (
                <div key={field} style={{ marginBottom: 20 }}>
                  <label className="lux-label">{label}</label>
                  <input className="luxury-input" type={type} value={(form as any)[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))} style={{ borderRadius: 4 }} />
                </div>
              ))}
              <div style={{ marginBottom: 20 }}>
                <label className="lux-label">Appointment Type</label>
                <select className="luxury-input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} style={{ borderRadius: 4 }}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label className="lux-label">Notes (Optional)</label>
              <textarea className="luxury-input" rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="What would you like to discuss?" style={{ resize: 'vertical', borderRadius: 4 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn-ghost" style={{ borderRadius: 4, padding: '12px 28px' }} onClick={() => setStep(2)}>← Back</button>
              <button className="btn-teal" style={{ borderRadius: 4, padding: '14px 44px', opacity: loading ? 0.7 : 1 }} onClick={submit} disabled={loading}>
                {loading ? 'Submitting...' : 'Confirm Appointment ✦'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
