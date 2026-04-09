'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const STATUSES = ['Pending', 'Deposit Paid', 'Confirmed', 'Completed', 'Cancelled']

export default function BookingsManager({ initialBookings }: { initialBookings: any[] }) {
  const [bookings, setBookings] = useState(initialBookings)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [filter, setFilter] = useState('all')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const supabase = createClient()

  const openAdd = () => { setEditing(null); setForm({ status: 'Pending', group_size: 1 }); setModal(true) }
  const openEdit = (b: any) => { setEditing(b); setForm({ ...b }); setModal(true) }

  const save = async () => {
    if (!form.client_name?.trim()) { setSaveError('Client name is required.'); return }
    if (!form.package_name?.trim()) { setSaveError('Package name is required.'); return }
    setSaving(true)
    setSaveError('')
    const payload = {
      client_name: form.client_name,
      package_name: form.package_name,
      travel_date: form.travel_date || null,
      return_date: form.return_date || null,
      destination: form.destination || null,
      group_size: parseInt(form.group_size || 1),
      budget: form.budget || null,
      accommodation: form.accommodation || null,
      value: form.value ? parseFloat(form.value) : null,
      status: form.status || 'Pending',
      notes: form.notes || null,
    }
    if (editing) {
      const { data, error } = await supabase.from('bookings').update(payload).eq('id', editing.id).select('*, profiles(full_name, email, tier)').single()
      if (error) { setSaveError(`Failed to update booking: ${error.message}`); setSaving(false); return }
      if (data) setBookings(p => p.map(b => b.id === editing.id ? data : b))
    } else {
      const { data, error } = await supabase.from('bookings').insert(payload).select('*, profiles(full_name, email, tier)').single()
      if (error) { setSaveError(`Failed to create booking: ${error.message}`); setSaving(false); return }
      if (data) setBookings(p => [data, ...p])
    }
    setSaving(false)
    setModal(false)
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this booking? This cannot be undone.')) return
    const { error } = await supabase.from('bookings').delete().eq('id', id)
    if (error) { alert(`Failed to delete booking: ${error.message}`); return }
    setBookings(p => p.filter(b => b.id !== id))
  }

  const updateStatus = async (id: string, status: string) => {
    const { data, error } = await supabase.from('bookings').update({ status }).eq('id', id).select('*, profiles(full_name, email, tier)').single()
    if (error) { alert(`Failed to update status: ${error.message}`); return }
    if (data) setBookings(p => p.map(b => b.id === id ? data : b))
  }

  const filtered = bookings.filter(b => filter === 'all' || b.status === filter)
  const totalValue = filtered.reduce((sum, b) => sum + (b.value || 0), 0)

  const statusColor = (s: string) => s === 'Confirmed' ? 'badge-success' : s === 'Completed' ? 'badge-teal' : s === 'Deposit Paid' ? 'badge-teal' : s === 'Cancelled' ? 'badge-danger' : 'badge-gold'

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div className="section-eyebrow" style={{ marginBottom: 6 }}>Revenue Pipeline</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 38, fontWeight: 300 }}>
            Booking <em style={{ color: 'var(--gold)' }}>Management</em>
          </h2>
        </div>
        <button className="btn-gold btn-sm" onClick={openAdd}>+ Add Booking</button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 20 }}>
        {STATUSES.map(s => {
          const count = bookings.filter(b => b.status === s).length
          const val = bookings.filter(b => b.status === s).reduce((sum, b) => sum + (b.value || 0), 0)
          return (
            <div key={s} className="luxury-card" style={{ padding: '14px 16px', cursor: 'pointer', opacity: filter !== 'all' && filter !== s ? 0.5 : 1 }} onClick={() => setFilter(filter === s ? 'all' : s)}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, color: 'var(--gold)', lineHeight: 1 }}>{count}</div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 1, color: 'var(--muted)', marginTop: 4 }}>{s.toUpperCase()}</div>
              {val > 0 && <div style={{ fontSize: 11, color: 'var(--teal)', marginTop: 2 }}>${val.toLocaleString()}</div>}
            </div>
          )
        })}
      </div>

      <div className="luxury-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--gold)' }}>{filtered.length} BOOKING{filtered.length !== 1 ? 'S' : ''}</span>
          {totalValue > 0 && <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'var(--gold)' }}>Total: ${totalValue.toLocaleString()}</span>}
        </div>
        <table className="lux-table">
          <thead><tr><th>Client</th><th>Package</th><th>Destination</th><th>Travel Date</th><th>Value</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b.id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{b.client_name}</div>
                  {b.profiles?.tier && <span className={`badge ${b.profiles.tier === 'Platinum' ? 'badge-teal' : 'badge-gold'}`} style={{ marginTop: 4, display: 'inline-block' }}>{b.profiles.tier}</span>}
                </td>
                <td style={{ maxWidth: 200 }}>{b.package_name}</td>
                <td style={{ color: 'var(--muted)', fontSize: 12 }}>{b.destination || '—'}</td>
                <td style={{ color: 'var(--muted)', fontSize: 12 }}>{b.travel_date || '—'}</td>
                <td style={{ color: 'var(--gold)', fontFamily: 'Cormorant Garamond, serif', fontSize: 18 }}>{b.value ? `$${b.value.toLocaleString()}` : '—'}</td>
                <td>
                  <select value={b.status} onChange={e => updateStatus(b.id, e.target.value)} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 1, padding: '4px 8px', cursor: 'pointer' }}>
                    {STATUSES.map(s => <option key={s} style={{ background: 'var(--panel)', color: 'var(--text)' }}>{s}</option>)}
                  </select>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn-ghost btn-sm" onClick={() => openEdit(b)}>Edit</button>
                    <button className="btn-danger" onClick={() => remove(b.id)}>Del</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>No bookings found</td></tr>}
          </tbody>
        </table>
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }} onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border-bright)', width: 'min(620px,95vw)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, color: 'var(--gold)' }}>{editing ? 'EDIT BOOKING' : 'ADD BOOKING'}</span>
              <button onClick={() => { setModal(false); setSaveError('') }} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <div style={{ padding: 24, display: 'grid', gap: 14 }}>
              {saveError && (
                <div style={{ padding: '12px 16px', background: 'rgba(192,57,43,0.08)', border: '1.5px solid rgba(192,57,43,0.3)', color: 'var(--danger)', borderRadius: 4, fontSize: 14, lineHeight: 1.5 }}>
                  ⚠ {saveError}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
                <div><label className="lux-label">Client Name *</label><input className="luxury-input" value={form.client_name || ''} onChange={e => setForm((p: any) => ({ ...p, client_name: e.target.value }))} /></div>
                <div><label className="lux-label">Package Name *</label><input className="luxury-input" value={form.package_name || ''} onChange={e => setForm((p: any) => ({ ...p, package_name: e.target.value }))} /></div>
                <div><label className="lux-label">Destination</label><input className="luxury-input" value={form.destination || ''} onChange={e => setForm((p: any) => ({ ...p, destination: e.target.value }))} /></div>
                <div><label className="lux-label">Booking Value ($)</label><input className="luxury-input" type="number" value={form.value || ''} onChange={e => setForm((p: any) => ({ ...p, value: e.target.value }))} /></div>
                <div><label className="lux-label">Travel Date</label><input className="luxury-input" type="date" value={form.travel_date || ''} onChange={e => setForm((p: any) => ({ ...p, travel_date: e.target.value }))} /></div>
                <div><label className="lux-label">Return Date</label><input className="luxury-input" type="date" value={form.return_date || ''} onChange={e => setForm((p: any) => ({ ...p, return_date: e.target.value }))} /></div>
                <div><label className="lux-label">Group Size</label><input className="luxury-input" type="number" value={form.group_size || 1} onChange={e => setForm((p: any) => ({ ...p, group_size: e.target.value }))} /></div>
                <div><label className="lux-label">Status</label>
                  <select className="luxury-input" value={form.status || 'Pending'} onChange={e => setForm((p: any) => ({ ...p, status: e.target.value }))}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="lux-label">Notes</label><textarea className="luxury-input" rows={3} value={form.notes || ''} onChange={e => setForm((p: any) => ({ ...p, notes: e.target.value }))} style={{ resize: 'vertical' }} /></div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-gold" style={{ flex: 1, opacity: saving ? 0.7 : 1 }} onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Booking' : 'Add Booking'}</button>
                <button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

