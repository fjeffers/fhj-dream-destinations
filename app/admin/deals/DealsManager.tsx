'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Deal } from '@/lib/types'

const emojis = ['🏝️', '🇮🇹', '🦁', '🌺', '🏯', '🇬🇷', '✈️', '🏔️', '🌊', '🍾', '🎭', '🛥️']

export default function DealsManager({ initialDeals }: { initialDeals: Deal[] }) {
  const [deals, setDeals] = useState(initialDeals)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<Deal | null>(null)
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const openAdd = () => { setEditing(null); setForm({ image: '✈️', featured: false, active: true }); setModal(true) }
  const openEdit = (d: Deal) => { setEditing(d); setForm({ ...d }); setModal(true) }

  const save = async () => {
    setSaving(true)
    if (editing) {
      const { data } = await supabase.from('deals').update(form).eq('id', editing.id).select().single()
      if (data) setDeals(p => p.map(d => d.id === editing.id ? data : d))
    } else {
      const { data } = await supabase.from('deals').insert(form).select().single()
      if (data) setDeals(p => [data, ...p])
    }
    setSaving(false)
    setModal(false)
  }

  const toggleFeatured = async (d: Deal) => {
    const { data } = await supabase.from('deals').update({ featured: !d.featured }).eq('id', d.id).select().single()
    if (data) setDeals(p => p.map(x => x.id === d.id ? data : x))
  }

  const toggleActive = async (d: Deal) => {
    const { data } = await supabase.from('deals').update({ active: !d.active }).eq('id', d.id).select().single()
    if (data) setDeals(p => p.map(x => x.id === d.id ? data : x))
  }

  const deleteDeal = async (id: string) => {
    if (!confirm('Delete this deal?')) return
    await supabase.from('deals').delete().eq('id', id)
    setDeals(p => p.filter(d => d.id !== id))
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div className="section-eyebrow" style={{ marginBottom: 6 }}>Live on Homepage</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 38, fontWeight: 300 }}>
            Deals & <em style={{ color: 'var(--gold)' }}>Packages</em>
          </h2>
        </div>
        <button className="btn-gold btn-sm" onClick={openAdd}>+ Add Deal</button>
      </div>
      <div style={{ marginBottom: 12, padding: '10px 16px', background: 'rgba(201,168,76,0.06)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--muted)' }}>
        ✦ Featured deals appear on the public homepage in real-time. Toggle featured status below.
      </div>
      <div style={{ display: 'grid', gap: 14 }}>
        {deals.map(deal => (
          <div key={deal.id} className="luxury-card" style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20, opacity: deal.active ? 1 : 0.5 }}>
            <div style={{ fontSize: 40, flexShrink: 0 }}>{deal.image}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20 }}>{deal.title}</div>
                {deal.featured && <span className="badge badge-gold">Featured</span>}
                {!deal.active && <span className="badge badge-danger">Hidden</span>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>{deal.destination} · {deal.duration} · {deal.category}</div>
              {deal.description && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{deal.description}</div>}
            </div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, color: 'var(--gold)', flexShrink: 0 }}>{deal.price}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
              <button className="btn-ghost btn-sm" onClick={() => openEdit(deal)}>Edit</button>
              <button className="btn-ghost btn-sm" onClick={() => toggleFeatured(deal)} style={{ color: deal.featured ? 'var(--gold)' : 'var(--muted)' }}>
                {deal.featured ? '★ Featured' : '☆ Feature'}
              </button>
              <button className="btn-ghost btn-sm" onClick={() => toggleActive(deal)}>{deal.active ? 'Hide' : 'Show'}</button>
              <button className="btn-danger" onClick={() => deleteDeal(deal.id)}>Delete</button>
            </div>
          </div>
        ))}
        {deals.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--muted)' }} className="luxury-card">
            <p>No deals yet. Add your first luxury package.</p>
          </div>
        )}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }} onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border-bright)', width: 'min(620px,95vw)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 26px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 3, color: 'var(--gold)' }}>{editing ? 'EDIT DEAL' : 'ADD NEW DEAL'}</span>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <div style={{ padding: 26 }}>
              <div style={{ marginBottom: 16 }}>
                <label className="lux-label">Title</label>
                <input className="luxury-input" value={form.title || ''} onChange={e => setForm((p: any) => ({ ...p, title: e.target.value }))} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 18px' }}>
                {[['Destination', 'destination'], ['Price', 'price', '$0,000'], ['Duration', 'duration', '7 Nights'], ['Category', 'category']].map(([label, field, ph]) => (
                  <div key={field} style={{ marginBottom: 16 }}>
                    <label className="lux-label">{label}</label>
                    <input className="luxury-input" placeholder={ph || ''} value={form[field] || ''} onChange={e => setForm((p: any) => ({ ...p, [field]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="lux-label">Description</label>
                <textarea className="luxury-input" rows={3} value={form.description || ''} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="lux-label">Icon / Emoji</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                  {emojis.map(e => (
                    <div key={e} onClick={() => setForm((p: any) => ({ ...p, image: e }))} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, cursor: 'pointer', border: `1px solid ${form.image === e ? 'var(--gold)' : 'var(--border)'}`, background: form.image === e ? 'rgba(201,168,76,0.1)' : 'transparent', borderRadius: 3 }}>{e}</div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.featured || false} onChange={e => setForm((p: any) => ({ ...p, featured: e.target.checked }))} />
                  <span className="lux-label" style={{ margin: 0 }}>Featured on Homepage</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.active !== false} onChange={e => setForm((p: any) => ({ ...p, active: e.target.checked }))} />
                  <span className="lux-label" style={{ margin: 0 }}>Active / Visible</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-gold" style={{ flex: 1, opacity: saving ? 0.7 : 1 }} onClick={save} disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Deal' : 'Add Deal'}</button>
                <button className="btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
