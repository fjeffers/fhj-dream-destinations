'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Appointment } from '@/lib/types'

const TYPES = ['Consultation', 'Trip Planning', 'Intake', 'Follow-Up', 'VIP Meeting']

export default function AppointmentsManager({ initialAppointments }: { initialAppointments: Appointment[] }) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Appointment | null>(null)
  const [form, setForm] = useState<any>({})
  const [filter, setFilter] = useState('all')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const openAdd = () => { setEditing(null); setForm({ type: 'Consultation', status: 'Confirmed', time: '10:00' }); setModal(true) }
  const openEdit = (a: Appointment) => { setEditing(a); setForm({ ...a }); setModal(true) }

  const save = async () => {
    setSaving(true)
    if (editing) {
      const { data } = await supabase.from('appointments').update(form).eq('id', editing.id).select().single()
      if (data) setAppointments(p => p.map(a => a.id === editing.id ? data : a))
    } else {
      const { data } = await supabase.from('appointments').insert(form).select().single()
      if (data) setAppointments(p => [...p, data])
    }
    setSaving(false)
    setModal(false)
  }

  const remove = async (id: string) => {
    await supabase.from('appointments').delete().eq('id', id)
    setAppointments(p => p.filter(a => a.id !== id))
  }

  const updateStatus = async (id: string, status: string) => {
    const { data } = await supabase.from('appointments').update({ status }).eq('id', id).select().single()
    if (data) setAppointments(p => p.map(a => a.id === id ? data : a))
  }

  const today = new Date().toISOString().split('T')[0]
  const filtered = appointments.filter(a => {
    if (filter === 'upcoming') return a.date >= today
    if (filter === 'past') return a.date < today
    if (filter === 'confirmed') return a.status === 'Confirmed'
    if (filter === 'pending') return a.status === 'Pending'
    return true
  }).sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div className="section-eyebrow" style={{ marginBottom: 6 }}>Scheduling</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 38, fontWeight: 300 }}>
            All <em style={{ color: 'var(--gold)' }}>Appointments</em>
          </h2>
        </div>
        <button className="btn-gold btn-sm" onClick={openAdd}>+ Add Appointment</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['all', 'All'], ['upcoming', 'Upcoming'], ['past', 'Past'], ['confirmed', 'Confirmed'], ['pending', 'Pending']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, padding: '7px 16px', border: `1px solid ${filter === val ? 'var(--gold)' : 'var(--border)'}`, background: filter === val ? 'rgba(201,168,76,0.1)' : 'transparent', color: filter === val ? 'var(--gold)' : 'var(--muted)', cursor: 'pointer', transition: 'all 0.2s' }}>{label}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--muted)', alignSelf: 'center' }}>{filtered.length} appointment{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="luxury-card" style={{ overflow: 'hidden' }}>
        <table className="lux-table">
          <thead><tr><th>Client</th><th>Date</th><th>Time</th><th>Type</th><th>Notes</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id}>
                <td style={{ fontWeight: 500 }}>{a.client_name}</td>
                <td style={{ color: 'var(--muted)', fontSize: 12 }}>{a.date}</td>
                <td style={{ color: 'var(--muted)', fontSize: 12 }}>{a.time}</td>
                <td><span className="badge badge-teal">{a.type}</span></td>
                <td style={{ color: 'var(--muted)', fontSize: 12, maxWidth: 200 }}>{a.notes || '—'}</td>
                <td>
                  <select value={a.status} onChange={e => updateStatus(a.id, e.target.value)} style={{ background: 'transparent', border: '1px solid var(--border)', color: a.status === 'Confirmed' ? 'var(--success)' : a.status === 'Cancelled' ? 'var(--danger)' : 'var(--gold)', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, padding: '4px 8px', cursor: 'pointer' }}>
                    {['Confirmed', 'Pending', 'Cancelled'].map(s => <option key={s} style={{ background: 'var(--panel)', color: 'var(--text)' }}>{s}</option>)}
                  </select>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-ghost btn-sm" onClick={() => openEdit(a)}>Edit</button>
                    <button className="btn-danger" onClick={() => remove(a.id)}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>No appointments found</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }} onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border-bright)', width: 'min(560px,95vw)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, color: 'var(--gold)' }}>{editing ? 'EDIT APPOINTMENT' : 'ADD APPOINTMENT'}</span>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <div style={{ padding: 24, display: 'grid', gap: 14 }}>
              <div><label className="lux-label">Client Name *</label><input className="luxury-input" value={form.client_name || ''} onChange={e => setForm((p: any) => ({ ...p, client_name: e.target.value }))} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
                <div><label className="lux-label">Date *</label><input className="luxury-input" type="date" value={form.date || ''} onChange={e => setForm((p: any) => ({ ...p, date: e.target.value }))} /></div>
                <div><label className="lux-label">Time *</label><input className="luxury-input" type="time" value={form.time || ''} onChange={e => setForm((p: any) => ({ ...p, time: e.target.value }))} /></div>
                <div><label className="lux-label">Type</label>
                  <select className="luxury-input" value={form.type || 'Consultation'} onChange={e => setForm((p: any) => ({ ...p, type: e.target.value }))}>
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className="lux-label">Status</label>
                  <select className="luxury-input" value={form.status || 'Confirmed'} onChange={e => setForm((p: any) => ({ ...p, status: e.target.value }))}>
                    {['Confirmed', 'Pending', 'Cancelled'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="lux-label">Notes</label><textarea className="luxury-input" rows={3} value={form.notes || ''} onChange={e => setForm((p: any) => ({ ...p, notes: e.target.value }))} style={{ resize: 'vertical' }} /></div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-gold" style={{ flex: 1, opacity: saving ? 0.7 : 1 }} onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Add'} Appointment</button>
                <button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
