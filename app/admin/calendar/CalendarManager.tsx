'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Appointment, BlockedDate } from '@/lib/types'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const TYPES = ['Consultation','Trip Planning','Intake','Follow-Up','VIP Meeting']

// Schedule: Mon-Fri 4pm-10:30pm, Sat 8am-10:30pm, Sun 12pm-9pm, every 30 min
const DAY_SCHEDULE: Record<number, { start: string, end: string }> = {
  0: { start: '12:00', end: '21:00' }, // Sunday
  1: { start: '16:00', end: '22:30' }, // Monday
  2: { start: '16:00', end: '22:30' }, // Tuesday
  3: { start: '16:00', end: '22:30' }, // Wednesday
  4: { start: '16:00', end: '22:30' }, // Thursday
  5: { start: '16:00', end: '22:30' }, // Friday
  6: { start: '08:00', end: '22:30' }, // Saturday
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

function toRaw(slot: string): string {
  // Convert "4:00 PM" back to "16:00" format for storage
  const [time, ampm] = slot.split(' ')
  const [h, m] = time.split(':').map(Number)
  let hour = h
  if (ampm === 'PM' && h !== 12) hour += 12
  if (ampm === 'AM' && h === 12) hour = 0
  return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export default function CalendarManager({ initialAppointments, initialBlocked }: { initialAppointments: Appointment[], initialBlocked: BlockedDate[] }) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [blockedDays, setBlockedDays] = useState(initialBlocked.map(b => b.date))
  const [blockedSlots, setBlockedSlots] = useState<{date: string, time: string}[]>([])
  const [curr, setCurr] = useState(new Date())
  const [selected, setSelected] = useState<number | null>(null)
  const [modal, setModal] = useState(false)
  const [slotView, setSlotView] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ client_name: '', time: '10:00', type: 'Consultation', notes: '', status: 'Confirmed' })
  const supabase = createClient()

  const year = curr.getFullYear()
  const month = curr.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const ds = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const apptForDay = (d: number) => appointments.filter(a => a.date === ds(d))
  const isDayBlocked = (d: number) => blockedDays.includes(ds(d))
  const isToday = (d: number) => new Date(year, month, d).toDateString() === today.toDateString()

  const getSlotsForDay = (d: number) => {
    const date = new Date(year, month, d)
    const dow = date.getDay()
    const sched = DAY_SCHEDULE[dow]
    if (!sched) return []
    return generateSlots(sched.start, sched.end)
  }

  const isSlotBlocked = (d: number, slot: string) => {
    const dateStr = ds(d)
    return blockedSlots.some(s => s.date === dateStr && s.time === slot)
  }

  const isSlotBooked = (d: number, slot: string) => {
    const dateStr = ds(d)
    return appointments.some(a => a.date === dateStr && a.time === slot)
  }

  // Load blocked slots when a day is selected
  const loadBlockedSlots = async (d: number) => {
    const dateStr = ds(d)
    const { data } = await supabase.from('blocked_slots').select('date, time').eq('date', dateStr)
    if (data) {
      setBlockedSlots(prev => {
        const filtered = prev.filter(s => s.date !== dateStr)
        return [...filtered, ...data]
      })
    }
  }

  const selectDay = async (d: number) => {
    setSelected(d)
    setSlotView(false)
    await loadBlockedSlots(d)
  }

  const toggleDayBlock = async (d: number) => {
    const dateStr = ds(d)
    if (blockedDays.includes(dateStr)) {
      await supabase.from('blocked_dates').delete().eq('date', dateStr)
      setBlockedDays(p => p.filter(x => x !== dateStr))
    } else {
      await supabase.from('blocked_dates').insert({ date: dateStr })
      setBlockedDays(p => [...p, dateStr])
    }
  }

  const toggleSlotBlock = async (d: number, slot: string) => {
    const dateStr = ds(d)
    const rawTime = toRaw(slot)
    const already = blockedSlots.some(s => s.date === dateStr && s.time === slot)
    if (already) {
      await supabase.from('blocked_slots').delete().eq('date', dateStr).eq('time', slot)
      setBlockedSlots(p => p.filter(s => !(s.date === dateStr && s.time === slot)))
    } else {
      await supabase.from('blocked_slots').insert({ date: dateStr, time: slot })
      setBlockedSlots(p => [...p, { date: dateStr, time: slot }])
    }
  }

  const blockAllSlots = async (d: number) => {
    const dateStr = ds(d)
    const slots = getSlotsForDay(d)
    // Remove existing then add all
    await supabase.from('blocked_slots').delete().eq('date', dateStr)
    const inserts = slots.map(s => ({ date: dateStr, time: s }))
    if (inserts.length > 0) await supabase.from('blocked_slots').insert(inserts)
    setBlockedSlots(p => {
      const filtered = p.filter(s => s.date !== dateStr)
      return [...filtered, ...inserts]
    })
  }

  const unblockAllSlots = async (d: number) => {
    const dateStr = ds(d)
    await supabase.from('blocked_slots').delete().eq('date', dateStr)
    setBlockedSlots(p => p.filter(s => s.date !== dateStr))
  }

  const addAppointment = async () => {
    if (!form.client_name || !selected) return
    setSaving(true)
    const { data } = await supabase.from('appointments').insert({ ...form, date: ds(selected) }).select().single()
    if (data) setAppointments(p => [...p, data])
    setSaving(false)
    setModal(false)
    setForm({ client_name: '', time: '10:00', type: 'Consultation', notes: '', status: 'Confirmed' })
  }

  const deleteAppointment = async (id: string) => {
    await supabase.from('appointments').delete().eq('id', id)
    setAppointments(p => p.filter(a => a.id !== id))
  }

  const updateStatus = async (id: string, status: string) => {
    const { data } = await supabase.from('appointments').update({ status }).eq('id', id).select().single()
    if (data) setAppointments(p => p.map(a => a.id === id ? data : a))
  }

  const slots = selected ? getSlotsForDay(selected) : []
  const blockedSlotCount = selected ? slots.filter(s => isSlotBlocked(selected, s)).length : 0

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div className="section-eyebrow" style={{ marginBottom: 6 }}>Scheduling</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 38, fontWeight: 300 }}>
            Appointment <em style={{ color: 'var(--gold)' }}>Calendar</em>
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn-ghost btn-sm" onClick={() => setCurr(new Date(year, month - 1, 1))}>← Prev</button>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, padding: '8px 20px', border: '1px solid var(--border)', color: 'var(--gold)', minWidth: 160, textAlign: 'center' }}>{MONTHS[month]} {year}</span>
          <button className="btn-ghost btn-sm" onClick={() => setCurr(new Date(year, month + 1, 1))}>Next →</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        {/* Calendar Grid */}
        <div className="luxury-card" style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 8 }}>
            {DAYS.map(d => <div key={d} style={{ textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--gold)', padding: '6px 0' }}>{d}</div>)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
            {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} className="cal-day other-month" />)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const d = i + 1
              const dayAppts = apptForDay(d)
              const dayBlocked = isDayBlocked(d)
              const dateStr = ds(d)
              const daySlotBlocks = blockedSlots.filter(s => s.date === dateStr).length
              return (
                <div key={d}
                  className={`cal-day ${isToday(d) ? 'today' : ''} ${dayBlocked ? 'blocked' : ''} ${dayAppts.length > 0 ? 'has-event' : ''}`}
                  style={{ border: `1px solid ${selected === d ? 'var(--gold)' : 'transparent'}`, color: dayBlocked ? 'var(--danger)' : isToday(d) ? 'var(--gold)' : 'var(--text)', flexDirection: 'column', gap: 2, minHeight: 52, cursor: 'pointer' }}
                  onClick={() => selectDay(d)}>
                  <span>{d}</span>
                  {dayAppts.length > 0 && <span style={{ fontSize: 8, color: 'var(--teal)', fontFamily: 'Cinzel, serif' }}>{dayAppts.length} appt</span>}
                  {daySlotBlocks > 0 && !dayBlocked && <span style={{ fontSize: 7, color: 'var(--danger)', fontFamily: 'Cinzel, serif' }}>{daySlotBlocks} blocked</span>}
                </div>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
            {[['var(--gold)', 'Today'], ['var(--teal)', 'Has Appointment'], ['var(--danger)', 'Day Blocked'], ['rgba(192,57,43,0.4)', 'Slots Blocked']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: 'var(--muted)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />{l}
              </div>
            ))}
          </div>
        </div>

        {/* Day Detail Panel */}
        <div className="luxury-card" style={{ padding: 22 }}>
          {selected ? (
            <>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, color: 'var(--gold)', marginBottom: 12 }}>
                {MONTHS[month]} {selected}, {year}
              </div>

              {/* Day blocked warning */}
              {isDayBlocked(selected) && (
                <div style={{ padding: '10px 14px', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', marginBottom: 14, fontSize: 12, color: 'var(--danger)', borderRadius: 4 }}>
                  ⛔ Entire day is blocked
                </div>
              )}

              {/* Tab switcher */}
              <div style={{ display: 'flex', gap: 0, marginBottom: 16, border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                <button onClick={() => setSlotView(false)} style={{ flex: 1, padding: '8px 0', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, border: 'none', cursor: 'pointer', background: !slotView ? 'var(--teal)' : 'white', color: !slotView ? 'white' : 'var(--muted)', transition: 'all 0.2s' }}>
                  APPOINTMENTS
                </button>
                <button onClick={() => setSlotView(true)} style={{ flex: 1, padding: '8px 0', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, border: 'none', cursor: 'pointer', background: slotView ? 'var(--teal)' : 'white', color: slotView ? 'white' : 'var(--muted)', transition: 'all 0.2s' }}>
                  BLOCK SLOTS {blockedSlotCount > 0 ? `(${blockedSlotCount})` : ''}
                </button>
              </div>

              {/* Appointments tab */}
              {!slotView && (
                <>
                  <div style={{ marginBottom: 14, maxHeight: 260, overflowY: 'auto' }}>
                    {apptForDay(selected).map(a => (
                      <div key={a.id} style={{ padding: '12px 14px', background: 'var(--panel2)', border: '1px solid var(--border)', marginBottom: 8, borderRadius: 4 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, marginBottom: 2 }}>{a.client_name}</div>
                            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{a.time} · {a.type}</div>
                            {a.notes && <div style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>{a.notes}</div>}
                          </div>
                          <button onClick={() => deleteAppointment(a.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: 14, marginLeft: 8 }}>×</button>
                        </div>
                        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                          {['Confirmed', 'Pending', 'Cancelled'].map(s => (
                            <button key={s} onClick={() => updateStatus(a.id, s)} style={{ fontSize: 8, fontFamily: 'Cinzel, serif', letterSpacing: 1, padding: '3px 8px', border: `1px solid ${a.status === s ? 'var(--gold)' : 'var(--border)'}`, background: a.status === s ? 'rgba(201,168,76,0.15)' : 'transparent', color: a.status === s ? 'var(--gold)' : 'var(--muted)', cursor: 'pointer', transition: 'all 0.2s', borderRadius: 2 }}>{s}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {apptForDay(selected).length === 0 && (
                      <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)', fontSize: 12 }}>No appointments</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <button className="btn-gold btn-sm" style={{ width: '100%' }} onClick={() => setModal(true)}>+ Add Appointment</button>
                    <button className="btn-ghost btn-sm" style={{ width: '100%' }} onClick={() => toggleDayBlock(selected)}>
                      {isDayBlocked(selected) ? '✓ Unblock Entire Day' : '⛔ Block Entire Day'}
                    </button>
                  </div>
                </>
              )}

              {/* Time slot blocking tab */}
              {slotView && (
                <>
                  <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
                    <button onClick={() => blockAllSlots(selected)} style={{ flex: 1, padding: '7px 0', fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 1, border: '1px solid rgba(192,57,43,0.4)', background: 'rgba(192,57,43,0.06)', color: 'var(--danger)', cursor: 'pointer', borderRadius: 4 }}>
                      BLOCK ALL
                    </button>
                    <button onClick={() => unblockAllSlots(selected)} style={{ flex: 1, padding: '7px 0', fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 1, border: '1px solid rgba(14,143,143,0.3)', background: 'rgba(14,143,143,0.04)', color: 'var(--teal)', cursor: 'pointer', borderRadius: 4 }}>
                      UNBLOCK ALL
                    </button>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 12 }}>Click a slot to toggle it blocked/available. Blocked slots won't appear for clients.</p>
                  <div style={{ maxHeight: 320, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {slots.map(slot => {
                      const slotBlocked = isSlotBlocked(selected, slot)
                      const slotBooked = isSlotBooked(selected, slot)
                      return (
                        <button key={slot} onClick={() => !slotBooked && toggleSlotBlock(selected, slot)}
                          disabled={slotBooked}
                          style={{ padding: '8px 6px', borderRadius: 4, border: `1.5px solid ${slotBooked ? 'var(--border)' : slotBlocked ? 'rgba(192,57,43,0.5)' : 'rgba(14,143,143,0.25)'}`, background: slotBooked ? 'var(--panel2)' : slotBlocked ? 'rgba(192,57,43,0.08)' : 'white', color: slotBooked ? 'var(--muted)' : slotBlocked ? 'var(--danger)' : 'var(--text)', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, cursor: slotBooked ? 'not-allowed' : 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                          {slotBooked ? '📌' : slotBlocked ? '⛔' : '✓'} {slot}
                        </button>
                      )
                    })}
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 12, fontSize: 10, color: 'var(--muted)' }}>
                    <span>✓ Available</span>
                    <span>⛔ Blocked</span>
                    <span>📌 Booked</span>
                  </div>
                </>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
              <p style={{ fontSize: 13 }}>Select a date to manage appointments and block time slots</p>
            </div>
          )}
        </div>
      </div>

      {/* Upcoming list */}
      <div className="luxury-card" style={{ overflow: 'hidden', marginTop: 20 }}>
        <div style={{ padding: '14px 22px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--gold)' }}>ALL UPCOMING APPOINTMENTS THIS MONTH</span>
        </div>
        <table className="lux-table">
          <thead><tr><th>Date</th><th>Client</th><th>Time</th><th>Type</th><th>Notes</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {appointments.filter(a => a.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).sort((a, b) => a.date.localeCompare(b.date)).map(a => (
              <tr key={a.id}>
                <td style={{ color: 'var(--muted)', fontSize: 12 }}>{a.date}</td>
                <td style={{ fontWeight: 500 }}>{a.client_name}</td>
                <td style={{ color: 'var(--muted)', fontSize: 12 }}>{a.time}</td>
                <td><span className="badge badge-teal">{a.type}</span></td>
                <td style={{ color: 'var(--muted)', fontSize: 12 }}>{a.notes || '—'}</td>
                <td><span className={`badge ${a.status === 'Confirmed' ? 'badge-success' : a.status === 'Cancelled' ? 'badge-danger' : 'badge-gold'}`}>{a.status}</span></td>
                <td><button className="btn-danger" onClick={() => deleteAppointment(a.id)}>Remove</button></td>
              </tr>
            ))}
            {appointments.filter(a => a.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>No appointments this month</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Appointment Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }} onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border-bright)', width: 'min(520px,95vw)', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, color: 'var(--gold)' }}>ADD APPOINTMENT — {MONTHS[month].toUpperCase()} {selected}</span>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <div style={{ padding: 24, display: 'grid', gap: 14 }}>
              <div><label className="lux-label">Client Name *</label><input className="luxury-input" value={form.client_name} onChange={e => setForm(p => ({ ...p, client_name: e.target.value }))} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
                <div>
                  <label className="lux-label">Time</label>
                  <select className="luxury-input" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))}>
                    {selected && getSlotsForDay(selected).map(slot => (
                      <option key={slot} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
                <div><label className="lux-label">Type</label>
                  <select className="luxury-input" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="lux-label">Status</label>
                <select className="luxury-input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  {['Confirmed', 'Pending', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div><label className="lux-label">Notes</label><textarea className="luxury-input" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ resize: 'vertical' }} /></div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-gold" style={{ flex: 1, opacity: saving ? 0.7 : 1 }} onClick={addAppointment} disabled={saving}>{saving ? 'Adding...' : 'Add Appointment'}</button>
                <button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
