'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Appointment, BlockedDate } from '@/lib/types'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const TYPES = ['Consultation','Trip Planning','Intake','Follow-Up','VIP Meeting']

export default function CalendarManager({ initialAppointments, initialBlocked }: { initialAppointments: Appointment[], initialBlocked: BlockedDate[] }) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [blocked, setBlocked] = useState(initialBlocked.map(b => b.date))
  const [curr, setCurr] = useState(new Date())
  const [selected, setSelected] = useState<number | null>(null)
  const [modal, setModal] = useState(false)
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
  const isBlocked = (d: number) => blocked.includes(ds(d))
  const isToday = (d: number) => new Date(year, month, d).toDateString() === today.toDateString()

  const toggleBlock = async (d: number) => {
    const dateStr = ds(d)
    if (blocked.includes(dateStr)) {
      await supabase.from('blocked_dates').delete().eq('date', dateStr)
      setBlocked(p => p.filter(x => x !== dateStr))
    } else {
      await supabase.from('blocked_dates').insert({ date: dateStr })
      setBlocked(p => [...p, dateStr])
    }
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
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
              return (
                <div key={d}
                  className={`cal-day ${isToday(d) ? 'today' : ''} ${isBlocked(d) ? 'blocked' : ''} ${dayAppts.length > 0 ? 'has-event' : ''}`}
                  style={{ border: `1px solid ${selected === d ? 'var(--gold)' : 'transparent'}`, color: isBlocked(d) ? 'var(--danger)' : isToday(d) ? 'var(--gold)' : 'var(--text)', flexDirection: 'column', gap: 2, minHeight: 44 }}
                  onClick={() => setSelected(d)}>
                  <span>{d}</span>
                  {dayAppts.length > 0 && <span style={{ fontSize: 8, color: 'var(--teal)', fontFamily: 'Cinzel, serif' }}>{dayAppts.length} appt{dayAppts.length > 1 ? 's' : ''}</span>}
                </div>
              )
            })}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 20, marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
            {[['var(--gold)', 'Today'], ['var(--teal)', 'Has Appointment'], ['var(--danger)', 'Blocked']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, color: 'var(--muted)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />{l}
              </div>
            ))}
          </div>
        </div>

        {/* Day Detail */}
        <div className="luxury-card" style={{ padding: 22 }}>
          {selected ? (
            <>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, color: 'var(--gold)', marginBottom: 16 }}>
                {MONTHS[month]} {selected}, {year}
              </div>
              {isBlocked(selected) && (
                <div style={{ padding: '10px 14px', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)', marginBottom: 14, fontSize: 12, color: 'var(--danger)' }}>
                  ⛔ This date is blocked
                </div>
              )}
              <div style={{ marginBottom: 16, maxHeight: 280, overflowY: 'auto' }}>
                {apptForDay(selected).map(a => (
                  <div key={a.id} style={{ padding: '12px 14px', background: 'var(--panel2)', border: '1px solid var(--border)', marginBottom: 8 }}>
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
                        <button key={s} onClick={() => updateStatus(a.id, s)} style={{ fontSize: 8, fontFamily: 'Cinzel, serif', letterSpacing: 1, padding: '3px 8px', border: `1px solid ${a.status === s ? 'var(--gold)' : 'var(--border)'}`, background: a.status === s ? 'rgba(201,168,76,0.15)' : 'transparent', color: a.status === s ? 'var(--gold)' : 'var(--muted)', cursor: 'pointer', transition: 'all 0.2s' }}>{s}</button>
                      ))}
                    </div>
                  </div>
                ))}
                {apptForDay(selected).length === 0 && !isBlocked(selected) && (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--muted)', fontSize: 12 }}>No appointments</div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button className="btn-gold btn-sm" style={{ width: '100%' }} onClick={() => setModal(true)}>+ Add Appointment</button>
                <button className="btn-ghost btn-sm" style={{ width: '100%' }} onClick={() => toggleBlock(selected)}>
                  {isBlocked(selected) ? 'Unblock This Date' : 'Block This Date'}
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
              <p style={{ fontSize: 13 }}>Select a date to manage appointments</p>
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
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border-bright)', width: 'min(520px,95vw)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, color: 'var(--gold)' }}>ADD APPOINTMENT — {MONTHS[month].toUpperCase()} {selected}</span>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <div style={{ padding: 24, display: 'grid', gap: 14 }}>
              <div><label className="lux-label">Client Name *</label><input className="luxury-input" value={form.client_name} onChange={e => setForm(p => ({ ...p, client_name: e.target.value }))} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
                <div><label className="lux-label">Time</label><input className="luxury-input" type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} /></div>
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
