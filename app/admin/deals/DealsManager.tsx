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
  const [saveError, setSaveError] = useState('')
  const supabase = createClient()

  const openAdd = () => {
    setEditing(null)
    setForm({ image: '✈️', featured: false, active: true, image_url: '' })
    setSaveError('')
    setModal(true)
  }

  const openEdit = (d: Deal) => {
    setEditing(d)
    setForm({ ...d })
    setSaveError('')
    setModal(true)
  }

  const save = async () => {
    if (!form.title?.trim()) {
      setSaveError('Please enter a title for this deal.')
      return
    }
    setSaving(true)
    setSaveError('')

    const payload = {
      title:       form.title,
      destination: form.destination || null,
      price:       form.price || null,
      duration:    form.duration || null,
      category:    form.category || null,
      description: form.description || null,
      image:       form.image || '✈️',
      image_url:   form.image_url || null,
      featured:    form.featured || false,
      active:      form.active !== false,
    }

    if (editing) {
      const { data, error } = await supabase
        .from('deals').update(payload).eq('id', editing.id).select().single()
      if (error) { setSaveError(`Failed to update: ${error.message}`); setSaving(false); return }
      if (data) setDeals(p => p.map(d => d.id === editing.id ? data : d))
    } else {
      const { data, error } = await supabase
        .from('deals').insert(payload).select().single()
      if (error) { setSaveError(`Failed to save: ${error.message}`); setSaving(false); return }
      if (data) setDeals(p => [data, ...p])
    }

    setSaving(false)
    setModal(false)
  }

  const toggleFeatured = async (d: Deal) => {
    const { data, error } = await supabase.from('deals').update({ featured: !d.featured }).eq('id', d.id).select().single()
    if (error) { alert(error.message); return }
    if (data) setDeals(p => p.map(x => x.id === d.id ? data : x))
  }

  const toggleActive = async (d: Deal) => {
    const { data, error } = await supabase.from('deals').update({ active: !d.active }).eq('id', d.id).select().single()
    if (error) { alert(error.message); return }
    if (data) setDeals(p => p.map(x => x.id === d.id ? data : x))
  }

  const deleteDeal = async (id: string) => {
    if (!confirm('Delete this deal?')) return
    const { error } = await supabase.from('deals').delete().eq('id', id)
    if (error) { alert(error.message); return }
    setDeals(p => p.filter(d => d.id !== id))
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <div className="section-eyebrow" style={{ marginBottom: 6 }}>Travel Packages</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 38, fontWeight: 300 }}>
            Deals & <em style={{ color: 'var(--gold)' }}>Packages</em>
          </h2>
        </div>
        <button className="btn-gold btn-sm" onClick={openAdd}>+ Add Deal</button>
      </div>

      <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(201,168,76,0.06)', border: '1px solid var(--border)', fontSize: 13, color: 'var(--muted)', borderRadius: 4, lineHeight: 1.6 }}>
        ✦ Deals marked <strong style={{ color: 'var(--gold)' }}>Active</strong> appear on the home page. Add an <strong>Image URL</strong> to show a photo instead of an emoji.
      </div>

      <div style={{ display: 'grid', gap: 14 }}>
        {deals.map(deal => (
          <div key={deal.id} className="luxury-card" style={{ padding: 0, overflow: 'hidden', opacity: deal.active ? 1 : 0.55, display: 'flex' }}>
            {/* Image preview */}
            <div style={{ width: 120, flexShrink: 0, background: '#f0f0f0', position: 'relative', overflow: 'hidden' }}>
              {(deal as any).image_url ? (
                <img src={(deal as any).image_url} alt={deal.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>{deal.image}</div>
              )}
            </div>
            <div style={{ flex: 1, padding: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20 }}>{deal.title}</div>
                  {deal.featured && <span className="badge badge-gold">Featured</span>}
                  {!deal.active && <span className="badge badge-danger">Hidden</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {[deal.destination, deal.duration, deal.category].filter(Boolean).join(' · ')}
                </div>
                {deal.description && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{deal.description}</div>}
              </div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, color: 'var(--gold)', flexShrink: 0 }}>{deal.price}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                <button className="btn-ghost btn-sm" onClick={() => openEdit(deal)}>Edit</button>
                <button className="btn-ghost btn-sm" onClick={() => toggleFeatured(deal)} style={{ color: deal.featured ? 'var(--gold)' : 'var(--muted)' }}>
                  {deal.featured ? '★ Featured' : '☆ Feature'}
                </button>
                <button className="btn-ghost btn-sm" onClick={() => toggleActive(deal)}>
                  {deal.active ? 'Hide' : 'Show'}
                </button>
                <button className="btn-danger" onClick={() => deleteDeal(deal.id)}>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {deals.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 40px', color: 'var(--muted)' }} className="luxury-card">
            <div style={{ fontSize: 48, marginBottom: 16 }}>✈️</div>
            <p style={{ fontSize: 16, marginBottom: 8 }}>No deals yet.</p>
            <p style={{ fontSize: 13 }}>Click <strong>+ Add Deal</strong> to create your first travel package.</p>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}
          onClick={e => { if (e.target === e.currentTarget) { setModal(false); setSaveError('') } }}>
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border-bright)', width: 'min(640px,95vw)', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '22px 26px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 3, color: 'var(--gold)' }}>
                {editing ? 'EDIT DEAL' : 'ADD NEW DEAL'}
              </span>
              <button onClick={() => { setModal(false); setSaveError('') }}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>

            <div style={{ padding: 26 }}>
              {saveError && (
                <div style={{ padding: '12px 16px', background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.35)', color: 'var(--danger)', borderRadius: 4, marginBottom: 20, fontSize: 14 }}>
                  ⚠ {saveError}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label className="lux-label">Title *</label>
                <input className="luxury-input" placeholder="e.g. Caribbean Escape — 7 Nights All-Inclusive"
                  value={form.title || ''}
                  onChange={e => setForm((p: any) => ({ ...p, title: e.target.value }))} />
              </div>

              {/* Image URL */}
              <div style={{ marginBottom: 16 }}>
                <label className="lux-label">Image URL (paste any image link)</label>
                <input className="luxury-input" placeholder="https://images.unsplash.com/..."
                  value={form.image_url || ''}
                  onChange={e => setForm((p: any) => ({ ...p, image_url: e.target.value }))} />
                {form.image_url && (
                  <div style={{ marginTop: 10, borderRadius: 8, overflow: 'hidden', height: 160 }}>
                    <img src={form.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={e => (e.currentTarget.style.display = 'none')} />
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 18px' }}>
                <div style={{ marginBottom: 16 }}>
                  <label className="lux-label">Destination</label>
                  <input className="luxury-input" placeholder="e.g. Cancun, Mexico"
                    value={form.destination || ''}
                    onChange={e => setForm((p: any) => ({ ...p, destination: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="lux-label">Price</label>
                  <input className="luxury-input" placeholder="e.g. From $1,299"
                    value={form.price || ''}
                    onChange={e => setForm((p: any) => ({ ...p, price: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="lux-label">Duration</label>
                  <input className="luxury-input" placeholder="e.g. 7 Nights"
                    value={form.duration || ''}
                    onChange={e => setForm((p: any) => ({ ...p, duration: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="lux-label">Category</label>
                  <input className="luxury-input" placeholder="e.g. All-Inclusive, Cruise, Safari"
                    value={form.category || ''}
                    onChange={e => setForm((p: any) => ({ ...p, category: e.target.value }))} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="lux-label">Description</label>
                <textarea className="luxury-input" rows={3}
                  placeholder="What's included? What makes this deal special?"
                  value={form.description || ''}
                  onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))}
                  style={{ resize: 'vertical' }} />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label className="lux-label">Whats Included</label>
                <textarea className="luxury-input" rows={4}
                  placeholder="e.g. Round-trip flights, 7 nights accommodation, daily breakfast, airport transfers, private excursions..."
                  value={form.includes || ''}
                  onChange={e => setForm((p: any) => ({ ...p, includes: e.target.value }))}
                  style={{ resize: 'vertical' }} />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label className="lux-label">Emoji Icon (fallback if no image URL)</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                  {emojis.map(em => (
                    <div key={em} onClick={() => setForm((p: any) => ({ ...p, image: em }))}
                      style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, cursor: 'pointer', border: `2px solid ${form.image === em ? 'var(--gold)' : 'var(--border)'}`, background: form.image === em ? 'rgba(201,168,76,0.12)' : 'transparent', borderRadius: 6, transition: 'all 0.2s' }}>
                      {em}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 24, marginBottom: 24, padding: '14px 18px', background: 'rgba(201,168,76,0.05)', borderRadius: 6, border: '1px solid var(--border)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.featured || false}
                    onChange={e => setForm((p: any) => ({ ...p, featured: e.target.checked }))}
                    style={{ width: 16, height: 16 }} />
                  <div>
                    <div className="lux-label" style={{ margin: 0 }}>Featured</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>Highlighted on home page</div>
                  </div>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.active !== false}
                    onChange={e => setForm((p: any) => ({ ...p, active: e.target.checked }))}
                    style={{ width: 16, height: 16 }} />
                  <div>
                    <div className="lux-label" style={{ margin: 0 }}>Active</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)' }}>Visible to clients on site</div>
                  </div>
                </label>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-gold" style={{ flex: 1, opacity: saving ? 0.7 : 1 }}
                  onClick={save} disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update Deal' : 'Add Deal'}
                </button>
                <button className="btn-ghost" onClick={() => { setModal(false); setSaveError('') }}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
