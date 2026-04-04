'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { GroupTrip } from '@/lib/types'

export default function GroupTripsManager({ initialTrips }: { initialTrips: GroupTrip[] }) {
  const [trips, setTrips] = useState(initialTrips)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<GroupTrip | null>(null)
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const openAdd = () => { setEditing(null); setForm({ spots: 12, booked: 0, status: 'Open' }); setModal(true) }
  const openEdit = (t: GroupTrip) => { setEditing(t); setForm({ ...t }); setModal(true) }

  const save = async () => {
    setSaving(true)
    const payload = { ...form, spots: parseInt(form.spots), booked: parseInt(form.booked || 0) }
    if (editing) {
      const { data } = await supabase.from('group_trips').update(payload).eq('id', editing.id).select().single()
      if (data) setTrips(p => p.map(t => t.id === editing.id ? data : t))
    } else {
      const { data } = await supabase.from('group_trips').insert(payload).select().single()
      if (data) setTrips(p => [...p, data])
    }
    setSaving(false)
    setModal(false)
  }

  const deleteTrip = async (id: string) => {
    if (!confirm('Delete this group trip?')) return
    await supabase.from('group_trips').delete().eq('id', id)
    setTrips(p => p.filter(t => t.id !== id))
  }

  const F = (label: string, field: string, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 14 }}>
      <label className="lux-label">{label}</label>
      <input className="luxury-input" type={type} placeholder={placeholder} value={form[field] ?? ''} onChange={e => setForm((p: any) => ({ ...p, [field]: e.target.value }))} />
    </div>
  )

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div className="section-eyebrow" style={{ marginBottom: 6 }}>Curated</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 38, fontWeight: 300 }}>
            Group <em style={{ color: 'var(--gold)' }}>Trips</em>
          </h2>
        </div>
        <button className="btn-gold btn-sm" onClick={openAdd}>+ Add Group Trip</button>
      </div>

      <div style={{ display: 'grid', gap: 16 }}>
        {trips.map(trip => {
          const pct = Math.min((trip.booked / trip.spots) * 100, 100)
          return (
            <div key={trip.id} className="luxury-card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22 }}>{trip.name}</h3>
                    <span className={`badge ${trip.status === 'Sold Out' ? 'badge-danger' : trip.status === 'Waitlist' ? 'badge-gold' : 'badge-success'}`}>{trip.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 20, fontSize: 12, color: 'var(--muted)', flexWrap: 'wrap' }}>
                    <span>📍 {trip.destination}</span>
                    {trip.date && <span>📅 {trip.date}</span>}
                    {trip.price && <span style={{ color: 'var(--gold)' }}>💰 {trip.price}</span>}
                  </div>
                  {trip.description && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.6 }}>{trip.description}</p>}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0, marginLeft: 20 }}>
                  <button className="btn-ghost btn-sm" onClick={() => openEdit(trip)}>Edit</button>
                  <button className="btn-danger" onClick={() => deleteTrip(trip.id)}>Delete</button>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, height: 6, background: 'var(--panel2)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, var(--gold-dark), ${pct >= 100 ? 'var(--danger)' : 'var(--gold)'})`, transition: 'width 0.5s ease' }} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--muted)', flexShrink: 0 }}>{trip.booked}/{trip.spots} booked ({Math.round(pct)}%)</span>
              </div>
            </div>
          )
        })}
        {trips.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--muted)' }} className="luxury-card">
            <div style={{ fontSize: 48, marginBottom: 16 }}>🌍</div>
            <p>No group trips yet. Create your first luxury group experience.</p>
          </div>
        )}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }} onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border-bright)', width: 'min(580px,95vw)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, color: 'var(--gold)' }}>{editing ? 'EDIT GROUP TRIP' : 'ADD GROUP TRIP'}</span>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <div style={{ padding: 24 }}>
              {F('Trip Name *', 'name')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
                {F('Destination *', 'destination')}
                {F('Departure Date', 'date', 'date')}
                {F('Total Spots', 'spots', 'number')}
                {F('Booked', 'booked', 'number')}
                {F('Price Per Person', 'price', 'text', '$0,000/pp')}
                <div style={{ marginBottom: 14 }}>
                  <label className="lux-label">Status</label>
                  <select className="luxury-input" value={form.status || 'Open'} onChange={e => setForm((p: any) => ({ ...p, status: e.target.value }))}>
                    {['Open', 'Sold Out', 'Waitlist'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label className="lux-label">Description</label>
                <textarea className="luxury-input" rows={3} value={form.description || ''} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                <button className="btn-gold" style={{ flex: 1, opacity: saving ? 0.7 : 1 }} onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Trip' : 'Add Trip'}</button>
                <button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
