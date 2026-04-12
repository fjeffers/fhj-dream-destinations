'use client'
import { useState, useEffect } from 'react'
import { notifyAppointmentBooked, sendClientConfirmation } from '@/lib/sendEmail'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useParams } from 'next/navigation'

const TYPES = ['Consultation', 'Trip Planning', 'Intake', 'Follow-Up', 'VIP Meeting']
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

// Schedule: Mon-Fri 4pm-10:30pm, Sat 8am-10:30pm, Sun 12pm-9pm
const DAY_SCHEDULE: Record<number, { start: string, end: string }> = {
  0: { start: '12:00', end: '21:00' },
  1: { start: '16:00', end: '22:30' },
  2: { start: '16:00', end: '22:30' },
  3: { start: '16:00', end: '22:30' },
  4: { start: '16:00', end: '22:30' },
  5: { start: '16:00', end: '22:30' },
  6: { start: '08:00', end: '22:30' },
}

function generateSlots(start: string, end: string): string[] {
  const slots: string[] = []
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
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

function slugToName(slug: string): string {
  return slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

function getFirstName(fullName: string): string {
  return fullName.split(' ')[0]
}

export default function PersonalizedBookingPage() {
  const params = useParams()
  const slug = params?.slug as string || ''
  const clientName = slugToName(slug)
  const firstName = getFirstName(clientName)

  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [confirmId, setConfirmId] = useState('')
  const [bookedSlots, setBookedSlots] = useState<{date: string, time: string}[]>([])
  const [blockedDays, setBlockedDays] = useState<string[]>([])
  const [blockedSlots, setBlockedSlots] = useState<{date: string, time: string}[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState('')
  const [calMonth, setCalMonth] = useState(new Date())
  const [form, setForm] = useState({ name: clientName, email: '', phone: '', type: 'Consultation', notes: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const year = calMonth.getFullYear()
  const month = calMonth.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date(); today.setHours(0,0,0,0)

  useEffect(() => {
    supabase.from('appointments').select('date, time').then(({ data }) => setBookedSlots(data || []))
    supabase.from('appointment_requests').select('date, time').eq('status', 'Confirmed').then(({ data }) => {
      if (data) setBookedSlots(p => [...p, ...data])
    })
    supabase.from('blocked_dates').select('date').then(({ data }) => {
      if (data) setBlockedDays(data.map((d: any) => d.date))
    })
    supabase.from('blocked_slots').select('date, time').then(({ data }) => {
      if (data) setBlockedSlots(data)
    })
  }, [])

  const isAvailable = (date: Date) => {
    if (date < today) return false
    const dateStr = date.toISOString().split('T')[0]
    if (blockedDays.includes(dateStr)) return false
    const dow = date.getDay()
    return !!DAY_SCHEDULE[dow]
  }

  const getSlotsForDate = (date: Date) => {
    const dow = date.getDay()
    const sched = DAY_SCHEDULE[dow]
    if (!sched) return []
    const dateStr = date.toISOString().split('T')[0]
    const booked = bookedSlots.filter(b => b.date === dateStr).map(b => b.time)
    const blocked = blockedSlots.filter(s => s.date === dateStr).map(s => s.time)
    return generateSlots(sched.start, sched.end).filter(s => !booked.includes(s) && !blocked.includes(s))
  }

  const submit = async () => {
    if (!selectedDate || !selectedTime || !form.name || !form.email) {
      setError('Please fill in all required fields'); return
    }
    setLoading(true); setError('')
    const dateStr = selectedDate.toISOString().split('T')[0]
    const { data, error: err } = await supabase.from('appointment_requests').insert({
      ...form, date: dateStr, time: selectedTime, status: 'Pending'
    }).select().single()
    if (err) { setError(err.message); setLoading(false); return }

    await notifyAppointmentBooked({
      name: form.name, email: form.email, phone: form.phone,
      date: dateStr, time: selectedTime, type: form.type, notes: form.notes
    })
    await sendClientConfirmation({
      to_email: form.email,
      to_name: form.name,
      subject: 'Your Appointment — FHJ Dream Destinations',
      message: `Hi ${firstName},\n\nThank you for booking with FHJ Dream Destinations!\n\nDate: ${selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}\nTime: ${selectedTime}\nType: ${form.type}\n\nWe will confirm your appointment within 2 hours.\n\nWarm regards,\nFHJ Dream Destinations`
    })

    setConfirmId(data.token || data.id)
    setSubmitted(true); setLoading(false)
  }

  if (submitted) return (
    <div style={{ minHeight: '100vh', background: '#FDFAF3', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ maxWidth: 540, textAlign: 'center' }}>
        <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg, #076060, #0E8F8F)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', fontSize: 36, color: 'white' }}>✓</div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#076060', marginBottom: 16, fontWeight: 700 }}>YOU'RE ALL SET, {firstName.toUpperCase()}!</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 48, fontWeight: 300, marginBottom: 16, color: '#2E2318', lineHeight: 1.1 }}>
          We can't wait to <em style={{ color: '#076060' }}>meet you!</em>
        </h2>
        <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, rgba(196,154,10,0.5), transparent)', margin: '0 auto 24px', maxWidth: 200 }} />
        <p style={{ fontSize: 18, color: 'rgba(44,35,24,0.65)', lineHeight: 1.8, marginBottom: 28, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>
          Your appointment request for <strong style={{ fontStyle: 'normal', color: '#2E2318' }}>{selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</strong> at <strong style={{ fontStyle: 'normal', color: '#2E2318' }}>{selectedTime}</strong> has been received. We'll confirm within 2 hours.
        </p>
        <div style={{ background: 'white', border: '1px solid rgba(196,154,10,0.25)', borderRadius: 8, padding: '16px 24px', marginBottom: 32 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: '#076060', marginBottom: 6 }}>CONFIRMATION ID</div>
          <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#2E2318', wordBreak: 'break-all' }}>{confirmId}</div>
        </div>
        <Link href="/" style={{ display: 'inline-block', background: '#076060', color: 'white', padding: '14px 44px', borderRadius: 6, fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, textDecoration: 'none', fontWeight: 700 }}>Return Home</Link>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#FDFAF3' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '2px solid rgba(196,154,10,0.2)', padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid #C49A45', background: 'white', padding: 4, boxShadow: '0 2px 12px rgba(196,154,10,0.2)', flexShrink: 0 }}>
            <img src="/logo.png" alt="FHJ" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: '#C49A45', fontWeight: 700, letterSpacing: 2 }}>FHJ DREAM</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 4, color: '#076060', fontWeight: 600 }}>DESTINATIONS</div>
          </div>
        </Link>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: '#076060', fontWeight: 600 }}>PRIVATE BOOKING</div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 24px' }}>
        {/* Personalized hero */}
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div style={{ width: 48, height: 1, background: 'rgba(196,154,10,0.4)' }} />
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#076060', fontWeight: 700 }}>PRIVATE RESERVATION</span>
            <div style={{ width: 48, height: 1, background: 'rgba(196,154,10,0.4)' }} />
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(36px,6vw,64px)', fontWeight: 300, color: '#2E2318', lineHeight: 1.1, marginBottom: 16 }}>
            Welcome, <em style={{ color: '#076060' }}>{firstName}</em>
          </h1>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'rgba(44,35,24,0.6)', lineHeight: 1.7, fontStyle: 'italic', maxWidth: 560, margin: '0 auto' }}>
            We're delighted to have you. Please select a date and time for your private consultation with FHJ Dream Destinations.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 48 }}>
          {['Select Date', 'Choose Time', 'Confirm'].map((s, i) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: step > i + 1 ? '#0E8F8F' : step === i + 1 ? '#076060' : 'white', border: step <= i + 1 ? (step === i + 1 ? 'none' : '2px solid rgba(14,143,143,0.3)') : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: step >= i + 1 ? 'white' : 'rgba(44,35,24,0.4)', fontFamily: 'Cinzel, serif', fontSize: 13, fontWeight: 700, transition: 'all 0.3s' }}>
                  {step > i + 1 ? '✓' : i + 1}
                </div>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: step === i + 1 ? '#076060' : 'rgba(44,35,24,0.4)', fontWeight: 600 }}>{s}</span>
              </div>
              {i < 2 && <div style={{ width: 80, height: 2, background: step > i + 1 ? '#0E8F8F' : 'rgba(14,143,143,0.2)', margin: '0 8px', marginBottom: 24, transition: 'background 0.3s' }} />}
            </div>
          ))}
        </div>

        {error && <div style={{ padding: '14px 18px', background: 'rgba(192,57,43,0.08)', border: '2px solid rgba(192,57,43,0.3)', color: '#C0392B', fontSize: 15, marginBottom: 24, borderRadius: 6 }}>{error}</div>}

        {/* Step 1: Calendar */}
        {step === 1 && (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(196,154,10,0.2)', boxShadow: '0 4px 32px rgba(0,0,0,0.06)', padding: 36 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
              <button onClick={() => setCalMonth(new Date(year, month - 1, 1))} style={{ padding: '8px 18px', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, border: '1px solid rgba(196,154,10,0.3)', background: 'transparent', color: '#2E2318', cursor: 'pointer', borderRadius: 4 }}>← Prev</button>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 14, letterSpacing: 2, color: '#2E2318', fontWeight: 700 }}>{MONTHS[month]} {year}</span>
              <button onClick={() => setCalMonth(new Date(year, month + 1, 1))} style={{ padding: '8px 18px', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, border: '1px solid rgba(196,154,10,0.3)', background: 'transparent', color: '#2E2318', cursor: 'pointer', borderRadius: 4 }}>Next →</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
              {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, color: '#076060', padding: '6px 0', fontWeight: 700 }}>{d}</div>)}
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
                    style={{ aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, cursor: avail ? 'pointer' : 'default', background: isSelected ? '#076060' : avail ? 'rgba(14,143,143,0.06)' : 'transparent', color: isSelected ? 'white' : isPast ? '#ccc' : avail ? '#2E2318' : '#ccc', fontWeight: isSelected ? 700 : 400, fontSize: 15, border: isSelected ? 'none' : avail ? '1px solid rgba(14,143,143,0.2)' : 'none', transition: 'all 0.2s' }}>
                    {d}
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(196,154,10,0.1)' }}>
              <button onClick={() => selectedDate && setStep(2)}
                style={{ background: selectedDate ? '#076060' : 'rgba(14,96,96,0.3)', color: 'white', border: 'none', padding: '13px 36px', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, cursor: selectedDate ? 'pointer' : 'default', borderRadius: 6, fontWeight: 700 }}>
                CONTINUE →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Time */}
        {step === 2 && selectedDate && (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(196,154,10,0.2)', boxShadow: '0 4px 32px rgba(0,0,0,0.06)', padding: 36 }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 300, color: '#2E2318', marginBottom: 6 }}>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <p style={{ color: 'rgba(44,35,24,0.55)', fontSize: 15, marginBottom: 28, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>Select your preferred time, {firstName}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {getSlotsForDate(selectedDate).map(slot => (
                <button key={slot} onClick={() => setSelectedTime(slot)}
                  style={{ padding: '12px 8px', borderRadius: 6, border: `2px solid ${selectedTime === slot ? '#076060' : 'rgba(14,143,143,0.2)'}`, background: selectedTime === slot ? 'rgba(7,96,96,0.08)' : 'white', color: selectedTime === slot ? '#076060' : '#2E2318', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 1, cursor: 'pointer', fontWeight: selectedTime === slot ? 700 : 400, transition: 'all 0.2s' }}>
                  {slot}
                </button>
              ))}
              {getSlotsForDate(selectedDate).length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', color: 'rgba(44,35,24,0.5)', fontSize: 16, fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>No slots available — please select another date</div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 20, borderTop: '1px solid rgba(196,154,10,0.1)' }}>
              <button onClick={() => setStep(1)} style={{ padding: '12px 28px', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, border: '1px solid rgba(196,154,10,0.3)', background: 'transparent', color: '#2E2318', cursor: 'pointer', borderRadius: 6 }}>← Back</button>
              <button onClick={() => selectedTime && setStep(3)}
                style={{ background: selectedTime ? '#076060' : 'rgba(14,96,96,0.3)', color: 'white', border: 'none', padding: '13px 36px', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, cursor: selectedTime ? 'pointer' : 'default', borderRadius: 6, fontWeight: 700 }}>
                CONTINUE →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(196,154,10,0.2)', boxShadow: '0 4px 32px rgba(0,0,0,0.06)', padding: 36 }}>
            {/* Summary */}
            <div style={{ background: 'rgba(7,96,96,0.05)', border: '1px solid rgba(7,96,96,0.15)', borderRadius: 8, padding: '16px 20px', marginBottom: 32, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: '#076060', marginBottom: 4 }}>DATE</div>
                <div style={{ fontSize: 15, color: '#2E2318', fontWeight: 600 }}>{selectedDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
              </div>
              <div style={{ width: 1, background: 'rgba(7,96,96,0.15)' }} />
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: '#076060', marginBottom: 4 }}>TIME</div>
                <div style={{ fontSize: 15, color: '#2E2318', fontWeight: 600 }}>{selectedTime}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              <div style={{ marginBottom: 20, gridColumn: '1 / -1' }}>
                <label style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: '#076060', display: 'block', marginBottom: 8, fontWeight: 700 }}>FULL NAME</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  style={{ width: '100%', border: '1.5px solid rgba(196,154,10,0.3)', padding: '13px 16px', fontFamily: 'Cormorant Garamond, serif', fontSize: 17, color: '#2E2318', outline: 'none', borderRadius: 6, boxSizing: 'border-box' as const }} />
              </div>
              {[['EMAIL ADDRESS *', 'email', 'email'], ['PHONE NUMBER', 'phone', 'tel']].map(([label, field, type]) => (
                <div key={field} style={{ marginBottom: 20 }}>
                  <label style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: '#076060', display: 'block', marginBottom: 8, fontWeight: 700 }}>{label}</label>
                  <input type={type} value={(form as any)[field]} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                    style={{ width: '100%', border: '1.5px solid rgba(196,154,10,0.3)', padding: '13px 16px', fontFamily: 'Cormorant Garamond, serif', fontSize: 17, color: '#2E2318', outline: 'none', borderRadius: 6, boxSizing: 'border-box' as const }} />
                </div>
              ))}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: '#076060', display: 'block', marginBottom: 8, fontWeight: 700 }}>APPOINTMENT TYPE</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  style={{ width: '100%', border: '1.5px solid rgba(196,154,10,0.3)', padding: '13px 16px', fontFamily: 'Cormorant Garamond, serif', fontSize: 17, color: '#2E2318', outline: 'none', borderRadius: 6, background: 'white', boxSizing: 'border-box' as const }}>
                  {TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: '#076060', display: 'block', marginBottom: 8, fontWeight: 700 }}>NOTES <span style={{ color: 'rgba(7,96,96,0.5)', fontWeight: 400 }}>(OPTIONAL)</span></label>
              <textarea rows={3} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                placeholder={`What would you like to discuss, ${firstName}?`}
                style={{ width: '100%', border: '1.5px solid rgba(196,154,10,0.3)', padding: '13px 16px', fontFamily: 'Cormorant Garamond, serif', fontSize: 17, color: '#2E2318', outline: 'none', borderRadius: 6, resize: 'vertical', boxSizing: 'border-box' as const }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button onClick={() => setStep(2)} style={{ padding: '12px 28px', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, border: '1px solid rgba(196,154,10,0.3)', background: 'transparent', color: '#2E2318', cursor: 'pointer', borderRadius: 6 }}>← Back</button>
              <button onClick={submit} disabled={loading}
                style={{ background: loading ? 'rgba(7,96,96,0.5)' : '#076060', color: 'white', border: 'none', padding: '14px 44px', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, cursor: loading ? 'not-allowed' : 'pointer', borderRadius: 6, fontWeight: 700, boxShadow: loading ? 'none' : '0 6px 24px rgba(7,96,96,0.3)' }}>
                {loading ? 'CONFIRMING...' : 'CONFIRM MY APPOINTMENT ✦'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}