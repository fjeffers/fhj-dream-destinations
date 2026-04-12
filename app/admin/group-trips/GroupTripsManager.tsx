'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function ImageUploader({ label, value, onChange }: { label: string, value: string, onChange: (url: string) => void }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const upload = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please upload an image file.'); return }
    setUploading(true); setError('')
    const ext = file.name.split('.').pop()
    const filename = `trips/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
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
        style={{ border: `2px dashed ${dragging ? 'var(--teal)' : 'rgba(196,154,10,0.35)'}`, borderRadius: 8, padding: '16px', textAlign: 'center', cursor: 'pointer', background: dragging ? 'rgba(14,143,143,0.06)' : '#FAFAF7', transition: 'all 0.2s', minHeight: value ? 'auto' : 80, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {value ? (
          <img src={value} alt="Preview" style={{ maxHeight: 140, maxWidth: '100%', objectFit: 'cover', borderRadius: 6, width: '100%' }} />
        ) : uploading ? (
          <div style={{ fontSize: 13, color: 'var(--teal)' }}>Uploading...</div>
        ) : (
          <div><div style={{ fontSize: 22, marginBottom: 4 }}>📁</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>Drag & drop or click</div></div>
        )}
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f) }} />
      </div>
      <input className="luxury-input" style={{ borderRadius: 4, fontSize: 12, marginTop: 8 }} placeholder="Or paste image URL..." value={value} onChange={e => onChange(e.target.value)} />
      {error && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>⚠ {error}</div>}
      {value && <button onClick={() => onChange('')} style={{ marginTop: 4, fontSize: 11, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>✕ Remove</button>}
    </div>
  )
}

export default function GroupTripsManager({ initialTrips }: { initialTrips: any[] }) {
  const [trips, setTrips] = useState(initialTrips)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [regsView, setRegsView] = useState<any>(null)
  const [regs, setRegs] = useState<any[]>([])
  const [loadingRegs, setLoadingRegs] = useState(false)
  const supabase = createClient()

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://fhjdreamdestinations.com'

  const getJoinLink = (trip: any) => `${baseUrl}/group-trips/${trip.slug || trip.id}/join`

  const copyLink = (trip: any) => {
    navigator.clipboard.writeText(getJoinLink(trip))
    setCopied(trip.id)
    setTimeout(() => setCopied(null), 2500)
  }

  const openAdd = () => {
    setEditing(null)
    setForm({ spots: 12, booked: 0, status: 'Open' })
    setModal(true)
  }

  const openEdit = (t: any) => { setEditing(t); setForm({ ...t }); setModal(true) }

  const viewRegs = async (trip: any) => {
    setRegsView(trip)
    setLoadingRegs(true)
    const { data } = await supabase.from('group_trip_registrations').select('*').eq('trip_id', trip.id).order('created_at', { ascending: false })
    setRegs(data || [])
    setLoadingRegs(false)
  }

  const save = async () => {
    setSaving(true)
    const slug = form.slug || slugify(form.name || '')
    const payload = {
      name: form.name,
      destination: form.destination,
      date: form.date || null,
      spots: parseInt(form.spots) || 12,
      booked: parseInt(form.booked) || 0,
      price: form.price || null,
      status: form.status || 'Open',
      description: form.description || null,
      slug,
      image_url: form.image_url || null,
      background_image_url: form.background_image_url || null,
      includes: form.includes || null,
      itinerary: form.itinerary || null,
    }
    if (editing) {
      const { data } = await supabase.from('group_trips').update(payload).eq('id', editing.id).select().single()
      if (data) setTrips(p => p.map(t => t.id === editing.id ? data : t))
    } else {
      const { data } = await supabase.from('group_trips').insert(payload).select().single()
      if (data) setTrips(p => [data, ...p])
    }
    setSaving(false)
    setModal(false)
  }

  const deleteTrip = async (id: string) => {
    if (!confirm('Delete this group trip?')) return
    await supabase.from('group_trips').delete().eq('id', id)
    setTrips(p => p.filter(t => t.id !== id))
  }

  const updateRegStatus = async (regId: string, status: string) => {
    await supabase.from('group_trip_registrations').update({ status }).eq('id', regId)
    setRegs(p => p.map(r => r.id === regId ? { ...r, status } : r))
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: 'var(--teal)', marginBottom: 8, fontWeight: 600 }}>CURATED EXPERIENCES</div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 300, color: 'var(--text-rich)' }}>
            Group <em style={{ color: 'var(--teal-dark)' }}>Trips</em>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>Create group trips, share the join link, and manage registrations.</p>
        </div>
        <button className="btn-teal" onClick={openAdd} style={{ borderRadius: 4, padding: '12px 28px', alignSelf: 'flex-end' }}>+ Add Group Trip</button>
      </div>

      <div style={{ background: 'rgba(14,143,143,0.06)', border: '1.5px solid rgba(14,143,143,0.2)', borderRadius: 6, padding: '14px 20px', marginBottom: 28, fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>
        💡 Create a trip → Copy the join link → Share with clients → They register → Their info appears here.
      </div>

      <div style={{ display: 'grid', gap: 20 }}>
        {trips.map(trip => {
          const pct = Math.min(((trip.booked || 0) / (trip.spots || 1)) * 100, 100)
          const joinLink = getJoinLink(trip)
          const isCopied = copied === trip.id
          return (
            <div key={trip.id} style={{ background: 'white', borderRadius: 8, border: '1px solid rgba(196,154,10,0.2)', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
              <div style={{ height: 3, background: `linear-gradient(90deg, var(--teal-dark), var(--gold), var(--teal-light))` }} />
              <div style={{ display: 'flex', gap: 0 }}>
                {trip.image_url && (
                  <div style={{ width: 140, flexShrink: 0 }}>
                    <img src={trip.image_url} alt={trip.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ flex: 1, padding: '24px 28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, color: 'var(--text-rich)', fontWeight: 400 }}>{trip.name}</h3>
                        <span className={`badge ${trip.status === 'Sold Out' ? 'badge-danger' : trip.status === 'Waitlist' ? 'badge-gold' : 'badge-success'}`}>{trip.status}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--muted)', flexWrap: 'wrap' }}>
                        {trip.destination && <span>📍 {trip.destination}</span>}
                        {trip.date && <span>📅 {new Date(trip.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>}
                        {trip.price && <span style={{ color: 'var(--gold-dark)', fontWeight: 600 }}>💰 {trip.price}</span>}
                      </div>
                      {trip.description && <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8, lineHeight: 1.6 }}>{trip.description}</p>}
                    </div>
                    <div style={{ textAlign: 'center', minWidth: 80 }}>
                      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, color: 'var(--teal)', lineHeight: 1 }}>{trip.booked || 0}</div>
                      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 2, color: 'var(--muted)', marginTop: 2 }}>BOOKED</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>of {trip.spots}</div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ height: 5, background: '#F0EAD8', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: pct >= 90 ? 'var(--danger)' : 'linear-gradient(90deg, var(--teal-dark), var(--teal))', transition: 'width 0.5s', borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{(trip.spots || 0) - (trip.booked || 0)} spots remaining</div>
                  </div>

                  {/* Join link + actions */}
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    {trip.slug && (
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: '#F9F7F2', border: '1.5px solid rgba(14,143,143,0.2)', borderRadius: 4, overflow: 'hidden', minWidth: 240 }}>
                        <div style={{ padding: '9px 14px', fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>🔗 {joinLink}</div>
                        <button onClick={() => copyLink(trip)} style={{ padding: '9px 16px', background: isCopied ? 'var(--success)' : 'var(--teal)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, whiteSpace: 'nowrap', fontWeight: 700 }}>
                          {isCopied ? '✓ COPIED' : 'COPY LINK'}
                        </button>
                      </div>
                    )}
                    <button className="btn-ghost btn-sm" onClick={() => viewRegs(trip)} style={{ borderRadius: 4 }}>👥 Registrations</button>
                    <button className="btn-ghost btn-sm" onClick={() => openEdit(trip)} style={{ borderRadius: 4 }}>Edit</button>
                    <button className="btn-danger" onClick={() => deleteTrip(trip.id)} style={{ borderRadius: 4 }}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {trips.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', background: 'white', borderRadius: 8, border: '1px solid rgba(196,154,10,0.15)' }}>
            <div style={{ fontSize: 56, marginBottom: 20 }}>🌍</div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, color: 'var(--text-rich)', marginBottom: 12 }}>No Group Trips Yet</h3>
            <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 28 }}>Create your first luxury group experience.</p>
            <button className="btn-teal" onClick={openAdd} style={{ borderRadius: 4 }}>+ Add Group Trip</button>
          </div>
        )}
      </div>

      {/* Registrations Modal */}
      {regsView && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setRegsView(null) }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 720, maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(196,154,10,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: 'var(--teal)', marginBottom: 4 }}>REGISTRATIONS</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, color: 'var(--text-rich)', fontWeight: 300 }}>{regsView.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{regs.length} registrations</p>
              </div>
              <button onClick={() => setRegsView(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
            </div>
            <div style={{ padding: '20px 28px' }}>
              {loadingRegs ? (
                <div style={{ textAlign: 'center', padding: 40, color: 'var(--muted)' }}>Loading...</div>
              ) : regs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  <p>No registrations yet. Share the join link to get started!</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 14 }}>
                  {regs.map(r => (
                    <div key={r.id} style={{ background: '#FAFAF7', border: '1.5px solid rgba(196,154,10,0.15)', borderRadius: 8, padding: '18px 22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal-dark), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Cinzel, serif', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{(r.full_name || '?')[0].toUpperCase()}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-rich)' }}>{r.full_name}</div>
                            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{r.email}{r.phone && <span style={{ marginLeft: 12 }}>· {r.phone}</span>}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: 'var(--teal-dark)' }}>👥 {r.travelers || 1} traveler{(r.travelers || 1) !== 1 ? 's' : ''}</span>
                          {r.deposit_acknowledged && <span className="badge badge-success" style={{ fontSize: 8 }}>Deposit ✓</span>}
                          <select value={r.status || 'pending'} onChange={e => updateRegStatus(r.id, e.target.value)} style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, border: '1.5px solid var(--border)', borderRadius: 4, padding: '5px 8px', background: 'white', color: 'var(--teal-dark)', cursor: 'pointer', outline: 'none' }}>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                      {r.special_requests && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(196,154,10,0.1)', fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}>
                          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, color: 'var(--gold-dark)', fontStyle: 'normal', marginRight: 6 }}>REQUESTS:</span>"{r.special_requests}"
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: 'rgba(44,32,16,0.35)', marginTop: 8 }}>
                        Registered {r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setModal(false) }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 640, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(196,154,10,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: 'var(--teal)', marginBottom: 4 }}>GROUP TRIP</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, color: 'var(--text-rich)', fontWeight: 300 }}>{editing ? 'Edit Trip' : 'Add New Trip'}</h3>
              </div>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
            </div>
            <div style={{ padding: 28 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                <div style={{ marginBottom: 18, gridColumn: '1 / -1' }}>
                  <label className="lux-label">Trip Name *</label>
                  <input className="luxury-input" style={{ borderRadius: 4 }} placeholder="e.g. Northern Lights Iceland" value={form.name || ''}
                    onChange={e => setForm((p: any) => ({ ...p, name: e.target.value, slug: slugify(e.target.value) }))} />
                </div>
                <div style={{ marginBottom: 18, gridColumn: '1 / -1' }}>
                  <label className="lux-label">URL Slug (auto-generated)</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#F9F7F2', border: '1.5px solid rgba(196,154,10,0.25)', borderRadius: 4, padding: '10px 14px' }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>/group-trips/</span>
                    <input style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, color: 'var(--teal-dark)', outline: 'none', fontFamily: 'monospace' }}
                      value={form.slug || ''} onChange={e => setForm((p: any) => ({ ...p, slug: e.target.value }))} />
                    <span style={{ fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap' }}>/join</span>
                  </div>
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label className="lux-label">Destination *</label>
                  <input className="luxury-input" style={{ borderRadius: 4 }} placeholder="e.g. Reykjavik, Iceland" value={form.destination || ''} onChange={e => setForm((p: any) => ({ ...p, destination: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label className="lux-label">Departure Date</label>
                  <input className="luxury-input" style={{ borderRadius: 4 }} type="date" value={form.date || ''} onChange={e => setForm((p: any) => ({ ...p, date: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label className="lux-label">Total Spots</label>
                  <input className="luxury-input" style={{ borderRadius: 4 }} type="number" min="1" value={form.spots || 12} onChange={e => setForm((p: any) => ({ ...p, spots: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label className="lux-label">Price Per Person</label>
                  <input className="luxury-input" style={{ borderRadius: 4 }} placeholder="$0,000/pp" value={form.price || ''} onChange={e => setForm((p: any) => ({ ...p, price: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 18, gridColumn: '1 / -1' }}>
                  <label className="lux-label">Status</label>
                  <select className="luxury-input" style={{ borderRadius: 4 }} value={form.status || 'Open'} onChange={e => setForm((p: any) => ({ ...p, status: e.target.value }))}>
                    {['Open', 'Sold Out', 'Waitlist'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 18, gridColumn: '1 / -1' }}>
                  <label className="lux-label">Description</label>
                  <textarea className="luxury-input" style={{ borderRadius: 4, resize: 'vertical' }} rows={3} value={form.description || ''} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} placeholder="Describe the trip experience..." />
                </div>
                <div style={{ marginBottom: 18, gridColumn: '1 / -1' }}>
                  <label className="lux-label">What's Included</label>
                  <textarea className="luxury-input" style={{ borderRadius: 4, resize: 'vertical' }} rows={3} value={form.includes || ''} onChange={e => setForm((p: any) => ({ ...p, includes: e.target.value }))} placeholder="e.g. Flights&#10;5-star hotel&#10;Private tours&#10;Daily breakfast" />
                </div>
                <div style={{ marginBottom: 18, gridColumn: '1 / -1' }}>
                  <label className="lux-label">Itinerary</label>
                  <textarea className="luxury-input" style={{ borderRadius: 4, resize: 'vertical' }} rows={4} value={form.itinerary || ''} onChange={e => setForm((p: any) => ({ ...p, itinerary: e.target.value }))} placeholder="e.g. Day 1 — Arrive in Reykjavik&#10;Day 2 — Golden Circle tour&#10;Day 3 — Northern Lights chase" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <ImageUploader label="Trip Card Image" value={form.image_url || ''} onChange={url => setForm((p: any) => ({ ...p, image_url: url }))} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <ImageUploader label="Background Image for Join Page" value={form.background_image_url || ''} onChange={url => setForm((p: any) => ({ ...p, background_image_url: url }))} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button className="btn-teal" style={{ flex: 1, borderRadius: 4, opacity: saving ? 0.7 : 1 }} onClick={save} disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update Trip' : 'Create Trip & Get Link'}
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
