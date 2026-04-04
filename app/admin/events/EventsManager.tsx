'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function EventsManager({ initialEvents }: { initialEvents: any[] }) {
  const [events, setEvents] = useState(initialEvents)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [rsvpView, setRsvpView] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const openAdd = () => { setEditing(null); setForm({ exclusive: true, active: true, capacity: 50 }); setModal(true) }
  const openEdit = (e: any) => { setEditing(e); setForm({ ...e }); setModal(true) }

  const save = async () => {
    setSaving(true)
    const payload = { title: form.title, description: form.description, date: form.date, time: form.time, location: form.location, capacity: parseInt(form.capacity), exclusive: form.exclusive, active: form.active }
    if (editing) {
      const { data } = await supabase.from('events').update(payload).eq('id', editing.id).select('*, event_rsvps(id, client_id, profiles(full_name, email))').single()
      if (data) setEvents(p => p.map(e => e.id === editing.id ? data : e))
    } else {
      const { data } = await supabase.from('events').insert(payload).select('*, event_rsvps(id, client_id, profiles(full_name, email))').single()
      if (data) setEvents(p => [data, ...p])
    }
    setSaving(false)
    setModal(false)
  }

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this event?')) return
    await supabase.from('events').delete().eq('id', id)
    setEvents(p => p.filter(e => e.id !== id))
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div className="section-eyebrow" style={{ marginBottom: 6 }}>Client-Exclusive</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 38, fontWeight: 300 }}>
            Events & <em style={{ color: 'var(--gold)' }}>RSVP</em>
          </h2>
        </div>
        <button className="btn-gold btn-sm" onClick={openAdd}>+ Add Event</button>
      </div>
      <div className="luxury-card" style={{ overflow: 'hidden' }}>
        <table className="lux-table">
          <thead><tr><th>Event</th><th>Date</th><th>Location</th><th>RSVPs</th><th>Exclusive</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {events.map(ev => {
              const rsvpCount = ev.event_rsvps?.length || 0
              return (
                <tr key={ev.id}>
                  <td style={{ fontWeight: 500 }}>{ev.title}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{ev.date}{ev.time ? ` · ${ev.time}` : ''}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{ev.location || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 60, height: 3, background: 'var(--panel2)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min((rsvpCount / ev.capacity) * 100, 100)}%`, height: '100%', background: 'var(--teal)' }} />
                      </div>
                      <button onClick={() => setRsvpView(ev)} style={{ fontSize: 12, color: 'var(--teal)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                        {rsvpCount}/{ev.capacity}
                      </button>
                    </div>
                  </td>
                  <td><span className={`badge ${ev.exclusive ? 'badge-gold' : 'badge-teal'}`}>{ev.exclusive ? 'Exclusive' : 'Open'}</span></td>
                  <td><span className={`badge ${ev.active ? 'badge-success' : 'badge-danger'}`}>{ev.active ? 'Active' : 'Hidden'}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-ghost btn-sm" onClick={() => openEdit(ev)}>Edit</button>
                      <button className="btn-danger" onClick={() => deleteEvent(ev.id)}>Del</button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {events.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px' }}>No events yet</td></tr>}
          </tbody>
        </table>
      </div>

      {/* RSVP List Modal */}
      {rsvpView && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }} onClick={e => e.target === e.currentTarget && setRsvpView(null)}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border-bright)', width: 'min(500px,95vw)', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, color: 'var(--gold)' }}>RSVP LIST — {rsvpView.title.toUpperCase()}</span>
              <button onClick={() => setRsvpView(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <div style={{ padding: 24 }}>
              {rsvpView.event_rsvps?.length === 0
                ? <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '24px' }}>No RSVPs yet</p>
                : rsvpView.event_rsvps?.map((r: any, i: number) => (
                  <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold-dark),var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cinzel, serif', fontSize: 11, color: 'var(--obsidian)', flexShrink: 0 }}>{i + 1}</div>
                    <div>
                      <div style={{ fontSize: 13, color: 'var(--text)' }}>{r.profiles?.full_name || 'Unknown'}</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{r.profiles?.email}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }} onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border-bright)', width: 'min(600px,95vw)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 26px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 3, color: 'var(--gold)' }}>{editing ? 'EDIT EVENT' : 'ADD EVENT'}</span>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <div style={{ padding: 26 }}>
              <div style={{ marginBottom: 16 }}><label className="lux-label">Event Title</label><input className="luxury-input" value={form.title || ''} onChange={e => setForm((p: any) => ({ ...p, title: e.target.value }))} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 18px' }}>
                <div style={{ marginBottom: 16 }}><label className="lux-label">Date</label><input className="luxury-input" type="date" value={form.date || ''} onChange={e => setForm((p: any) => ({ ...p, date: e.target.value }))} /></div>
                <div style={{ marginBottom: 16 }}><label className="lux-label">Time</label><input className="luxury-input" placeholder="7:00 PM" value={form.time || ''} onChange={e => setForm((p: any) => ({ ...p, time: e.target.value }))} /></div>
                <div style={{ marginBottom: 16 }}><label className="lux-label">Location</label><input className="luxury-input" value={form.location || ''} onChange={e => setForm((p: any) => ({ ...p, location: e.target.value }))} /></div>
                <div style={{ marginBottom: 16 }}><label className="lux-label">Capacity</label><input className="luxury-input" type="number" value={form.capacity || 50} onChange={e => setForm((p: any) => ({ ...p, capacity: e.target.value }))} /></div>
              </div>
              <div style={{ marginBottom: 16 }}><label className="lux-label">Description</label><textarea className="luxury-input" rows={3} value={form.description || ''} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} /></div>
              <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" checked={form.exclusive !== false} onChange={e => setForm((p: any) => ({ ...p, exclusive: e.target.checked }))} /><span className="lux-label" style={{ margin: 0 }}>Clients-Only</span></label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}><input type="checkbox" checked={form.active !== false} onChange={e => setForm((p: any) => ({ ...p, active: e.target.checked }))} /><span className="lux-label" style={{ margin: 0 }}>Active</span></label>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-gold" style={{ flex: 1, opacity: saving ? 0.7 : 1 }} onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Event' : 'Add Event'}</button>
                <button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
