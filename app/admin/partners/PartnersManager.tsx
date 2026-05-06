'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = [
  'Photography',
  'Videography',
  'Catering',
  'Florist',
  'Music & Entertainment',
  'Transportation',
  'Venue',
  'Beauty & Wellness',
  'Planning & Decor',
  'Fashion & Apparel',
  'Jewelry & Accessories',
  'Luxury Retail',
  'Private Aviation',
  'Yacht & Marine',
  'Hotels & Resorts',
  'Restaurants & Dining',
  'Spa & Wellness',
  'Fitness & Health',
  'Art & Culture',
  'Gift & Concierge',
  'Technology',
  'Insurance & Legal',
  'Financial Services',
  'Other',
]

function ImageUploader({ label, value, onChange }: { label: string, value: string, onChange: (url: string) => void }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please upload an image file.'); return }
    setUploading(true)
    setError('')
    const ext = file.name.split('.').pop()
    const filename = `partners/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { data, error: uploadError } = await supabase.storage.from('event-images').upload(filename, file, { upsert: true })
    if (uploadError) { setError(`Upload failed: ${uploadError.message}`); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('event-images').getPublicUrl(data.path)
    onChange(urlData.publicUrl)
    setUploading(false)
  }

  return (
    <div style={{ marginBottom: 18 }}>
      <label className="lux-label">{label}</label>
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) upload(f) }}
        onClick={() => inputRef.current?.click()}
        style={{ border: `2px dashed ${dragging ? 'var(--teal)' : 'rgba(196,154,10,0.35)'}`, borderRadius: 8, padding: '16px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'rgba(14,143,143,0.06)' : '#FAFAF7', transition: 'all 0.2s', minHeight: value ? 'auto' : 100, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {value ? (
          <img src={value} alt="Preview" style={{ maxHeight: 160, maxWidth: '100%', objectFit: 'contain', borderRadius: 6 }} />
        ) : uploading ? (
          <div style={{ fontSize: 13, color: 'var(--teal)' }}>Uploading...</div>
        ) : (
          <div>
            <div style={{ fontSize: 24, marginBottom: 4 }}>📁</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Drag & drop or click to upload</div>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f) }} />
      </div>
      <input className="luxury-input" style={{ borderRadius: 4, fontSize: 12, marginTop: 8 }} placeholder="Or paste image URL..." value={value} onChange={e => onChange(e.target.value)} />
      {error && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>⚠ {error}</div>}
      {value && <button onClick={() => onChange('')} style={{ marginTop: 4, fontSize: 11, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>✕ Remove</button>}
    </div>
  )
}

export default function PartnersManager({ initialPartners }: { initialPartners: any[] }) {
  const [partners, setPartners] = useState(initialPartners)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const supabase = createClient()

  const openAdd = () => { setEditing(null); setForm({ active: true, category: 'Photography' }); setSaveError(''); setModal(true) }
  const openEdit = (p: any) => { setEditing(p); setForm({ ...p }); setSaveError(''); setModal(true) }

  const save = async () => {
    if (!form.name?.trim()) { setSaveError('Partner name is required.'); return }
    setSaving(true)
    setSaveError('')
    const payload = {
      name: form.name,
      description: form.description || null,
      website_url: form.website_url || null,
      image_url: form.image_url || null,
      category: form.category || null,
      active: form.active !== false,
    }
    if (editing) {
      const { data, error } = await supabase.from('partners').update(payload).eq('id', editing.id).select().single()
      if (error) { setSaveError(error.message); setSaving(false); return }
      if (data) setPartners(p => p.map(x => x.id === editing.id ? data : x))
    } else {
      const { data, error } = await supabase.from('partners').insert(payload).select().single()
      if (error) { setSaveError(error.message); setSaving(false); return }
      if (data) setPartners(p => [data, ...p])
    }
    setSaving(false)
    setModal(false)
  }

  const toggleActive = async (partner: any) => {
    const { data } = await supabase.from('partners').update({ active: !partner.active }).eq('id', partner.id).select().single()
    if (data) setPartners(p => p.map(x => x.id === partner.id ? data : x))
  }

  const deletePartner = async (id: string) => {
    if (!confirm('Delete this partner?')) return
    await supabase.from('partners').delete().eq('id', id)
    setPartners(p => p.filter(x => x.id !== id))
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: 'var(--teal)', marginBottom: 8, fontWeight: 600 }}>VENDOR NETWORK</div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 300, color: 'var(--text-rich)' }}>
            Preferred <em style={{ color: 'var(--teal-dark)' }}>Partners</em>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>Manage your preferred vendors and business partners shown on the site.</p>
        </div>
        <button className="btn-teal" onClick={openAdd} style={{ borderRadius: 4, padding: '12px 28px', alignSelf: 'flex-end' }}>+ Add Partner</button>
      </div>

      <div style={{ marginBottom: 20, padding: '12px 16px', background: 'rgba(14,143,143,0.06)', border: '1.5px solid rgba(14,143,143,0.2)', borderRadius: 6, fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>
        💡 Partners marked <strong>Active</strong> appear in the footer and on the <strong>/partners</strong> page.
      </div>

      {partners.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', background: 'white', borderRadius: 8, border: '1px solid rgba(196,154,10,0.15)' }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🤝</div>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, color: 'var(--text-rich)', marginBottom: 12 }}>No Partners Yet</h3>
          <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 28 }}>Add your first preferred vendor or business partner.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {partners.map(p => (
            <div key={p.id} style={{ background: 'white', borderRadius: 8, border: '1px solid rgba(196,154,10,0.2)', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', overflow: 'hidden', display: 'flex', opacity: p.active ? 1 : 0.6 }}>
              {p.image_url && (
                <div style={{ width: 100, flexShrink: 0 }}>
                  <img src={p.image_url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ flex: 1, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: 'var(--text-rich)', fontWeight: 400 }}>{p.name}</h3>
                    {p.category && <span className="badge badge-teal" style={{ fontSize: 9 }}>{p.category}</span>}
                    {!p.active && <span className="badge badge-danger" style={{ fontSize: 9 }}>Hidden</span>}
                  </div>
                  {p.description && <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 8, lineHeight: 1.6 }}>{p.description}</p>}
                  {p.website_url && (
                    <a href={p.website_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--teal)', textDecoration: 'none', fontFamily: 'Cinzel, serif', letterSpacing: 1 }}>
                      🔗 {p.website_url}
                    </a>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
                  <button className="btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                  <button className="btn-ghost btn-sm" onClick={() => toggleActive(p)} style={{ color: p.active ? 'var(--teal)' : 'var(--muted)' }}>
                    {p.active ? 'Hide' : 'Show'}
                  </button>
                  <button className="btn-danger" onClick={() => deletePartner(p.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setModal(false) }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(196,154,10,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: 'var(--teal)', marginBottom: 4 }}>PARTNER</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, color: 'var(--text-rich)', fontWeight: 300 }}>{editing ? 'Edit Partner' : 'Add New Partner'}</h3>
              </div>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
            </div>
            <div style={{ padding: 28 }}>
              {saveError && <div style={{ padding: '12px 16px', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.3)', color: 'var(--danger)', borderRadius: 4, marginBottom: 20, fontSize: 14 }}>⚠ {saveError}</div>}

              <div style={{ marginBottom: 18 }}>
                <label className="lux-label">Partner / Business Name *</label>
                <input className="luxury-input" style={{ borderRadius: 4 }} placeholder="e.g. Photo Magique" value={form.name || ''} onChange={e => setForm((p: any) => ({ ...p, name: e.target.value }))} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label className="lux-label">Category</label>
                <select className="luxury-input" style={{ borderRadius: 4 }} value={form.category || ''} onChange={e => setForm((p: any) => ({ ...p, category: e.target.value }))}>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 18 }}>
                <label className="lux-label">Website URL</label>
                <input className="luxury-input" style={{ borderRadius: 4 }} placeholder="https://www.example.com" value={form.website_url || ''} onChange={e => setForm((p: any) => ({ ...p, website_url: e.target.value }))} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label className="lux-label">Description</label>
                <textarea className="luxury-input" style={{ borderRadius: 4, resize: 'vertical' }} rows={3} placeholder="What makes this partner special..." value={form.description || ''} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} />
              </div>
              <ImageUploader label="Partner Logo or Photo (drag & drop or paste URL)" value={form.image_url || ''} onChange={url => setForm((p: any) => ({ ...p, image_url: url }))} />
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.active !== false} onChange={e => setForm((p: any) => ({ ...p, active: e.target.checked }))} style={{ width: 16, height: 16 }} />
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, color: 'var(--teal-dark)' }}>ACTIVE (visible on site and footer)</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-teal" style={{ flex: 1, borderRadius: 4, opacity: saving ? 0.7 : 1 }} onClick={save} disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update Partner' : 'Add Partner'}
                </button>
                <button className="btn-ghost" style={{ borderRadius: 4 }} onClick={() => setModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}