'use client'
import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const OCCASIONS = ['Anniversary', 'Birthday', 'Wedding', 'Honeymoon', 'Corporate Retreat', 'Family Reunion', 'Graduation', 'Retirement', 'Holiday Party', 'Custom']

function ImageUploader({ label, value, onChange, round = false }: { label: string, value: string, onChange: (url: string) => void, round?: boolean }) {
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
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const { data, error: uploadError } = await supabase.storage
      .from('event-images')
      .upload(filename, file, { upsert: true })
    if (uploadError) { setError(`Upload failed: ${uploadError.message}`); setUploading(false); return }
    const { data: urlData } = supabase.storage.from('event-images').getPublicUrl(data.path)
    onChange(urlData.publicUrl)
    setUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) upload(file)
  }

  return (
    <div style={{ marginBottom: 18 }}>
      <label className="lux-label">{label}</label>
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--teal)' : 'rgba(196,154,10,0.35)'}`,
          borderRadius: round ? '50%' : 8,
          padding: round ? 0 : '20px',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragging ? 'rgba(14,143,143,0.06)' : '#FAFAF7',
          transition: 'all 0.2s',
          width: round ? 100 : '100%',
          height: round ? 100 : 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative',
        }}>
        {value ? (
          <img src={value} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: round ? '50%' : 6 }} />
        ) : uploading ? (
          <div style={{ fontSize: 13, color: 'var(--teal)' }}>Uploading...</div>
        ) : (
          <div>
            <div style={{ fontSize: 28, marginBottom: 6 }}>📁</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>Drag & drop or click to upload</div>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>JPG, PNG, WEBP, GIF</div>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f) }} />
      </div>
      {/* Or paste URL */}
      <div style={{ marginTop: 8 }}>
        <input
          className="luxury-input"
          style={{ borderRadius: 4, fontSize: 12 }}
          placeholder="Or paste image URL here..."
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </div>
      {error && <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>⚠ {error}</div>}
      {value && (
        <button onClick={() => onChange('')} style={{ marginTop: 6, fontSize: 11, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          ✕ Remove image
        </button>
      )}
    </div>
  )
}

export default function EventsManager({ initialEvents }: { initialEvents: any[] }) {
  const [events, setEvents] = useState(initialEvents)
  const [modal, setModal] = useState(false)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [rsvpView, setRsvpView] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const supabase = createClient()

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://fhjdreamdestinations.com'

  const copyLink = (eventId: string) => {
    navigator.clipboard.writeText(`${baseUrl}/events/${eventId}/rsvp`)
    setCopied(eventId)
    setTimeout(() => setCopied(null), 2500)
  }

  const openAdd = () => {
    setEditing(null)
    setForm({ active: true, capacity: 50, occasion: 'Anniversary' })
    setSaveError('')
    setModal(true)
  }
  const openEdit = (ev: any) => { setEditing(ev); setForm({ ...ev }); setSaveError(''); setModal(true) }

  const save = async () => {
    if (!form.title) { setSaveError('Event title is required.'); return }
    setSaving(true)
    setSaveError('')
    const payload = {
      title: form.title,
      description: form.description || null,
      date: form.date || null,
      time: form.time || null,
      location: form.location || null,
      capacity: parseInt(form.capacity) || 50,
      active: form.active !== false,
      occasion: form.occasion || null,
      hosted_by: form.hosted_by || null,
      host_image_url: form.host_image_url || null,
      background_image_url: form.background_image_url || null,
    }
    if (editing) {
      const { data, error } = await supabase.from('events').update(payload).eq('id', editing.id)
        .select('*, event_rsvps(id, party_size, name, email, phone, dietary_needs, message, source, status, created_at, client_id)').single()
      if (error) { setSaveError(`Failed to update event: ${error.message}`); setSaving(false); return }
      if (data) setEvents(p => p.map(e => e.id === editing.id ? data : e))
    } else {
      const { data, error } = await supabase.from('events').insert(payload)
        .select('*, event_rsvps(id, party_size, name, email, phone, dietary_needs, message, source, status, created_at, client_id)').single()
      if (error) { setSaveError(`Failed to create event: ${error.message}`); setSaving(false); return }
      if (data) setEvents(p => [data, ...p])
    }
    setSaving(false)
    setModal(false)
  }

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this event and all its RSVPs? This cannot be undone.')) return
    const { error } = await supabase.from('events').delete().eq('id', id)
    if (error) { alert(`Failed to delete event: ${error.message}`); return }
    setEvents(p => p.filter(e => e.id !== id))
  }

  const updateRsvpStatus = async (eventId: string, rsvpId: string, status: string) => {
    const { error } = await supabase.from('event_rsvps').update({ status }).eq('id', rsvpId)
    if (error) { alert(`Failed to update status: ${error.message}`); return }
    setEvents(p => p.map(ev => ev.id === eventId
      ? { ...ev, event_rsvps: ev.event_rsvps.map((r: any) => r.id === rsvpId ? { ...r, status } : r) }
      : ev
    ))
    if (rsvpView?.id === eventId) {
      setRsvpView((prev: any) => ({
        ...prev,
        event_rsvps: prev.event_rsvps.map((r: any) => r.id === rsvpId ? { ...r, status } : r)
      }))
    }
  }

  const getTotalGuests = (ev: any) => ev.event_rsvps?.reduce((s: number, r: any) => s + (r.party_size || 1), 0) || 0

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: 'var(--teal)', marginBottom: 8, fontWeight: 600 }}>PRIVATE CELEBRATIONS</div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 300, color: 'var(--text-rich)' }}>
            Events & <em style={{ color: 'var(--teal-dark)' }}>RSVP</em>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>Create private events, share the RSVP link with your client, and watch guests roll in.</p>
        </div>
        <button className="btn-teal" onClick={openAdd} style={{ borderRadius: 4, padding: '12px 28px', alignSelf: 'flex-end' }}>
          + Create Event
        </button>
      </div>

      <div style={{ background: 'rgba(14,143,143,0.06)', border: '1.5px solid rgba(14,143,143,0.2)', borderRadius: 6, padding: '16px 22px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 20 }}>💡</span>
        <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>
          <strong style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 1, color: 'var(--teal-dark)' }}>HOW IT WORKS: </strong>
          Create an event → Copy the RSVP link → Send to your client → They share it with guests →
          Guests RSVP (no account needed) → Their info appears here and they become clients automatically.
        </div>
      </div>

      {events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 0', background: 'white', borderRadius: 8, border: '1px solid rgba(196,154,10,0.15)' }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>🎉</div>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, color: 'var(--text-rich)', marginBottom: 12 }}>No Events Yet</h3>
          <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 28 }}>Create your first private event to get started.</p>
          <button className="btn-teal" onClick={openAdd} style={{ borderRadius: 4 }}>+ Create Event</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 20 }}>
          {events.map(ev => {
            const totalGuests = getTotalGuests(ev)
            const rsvpCount = ev.event_rsvps?.length || 0
            const pct = Math.min((totalGuests / (ev.capacity || 1)) * 100, 100)
            const rsvpLink = `${baseUrl}/events/${ev.id}/rsvp`
            const isCopied = copied === ev.id
            return (
              <div key={ev.id} style={{ background: 'white', borderRadius: 8, border: '1px solid rgba(196,154,10,0.2)', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
                <div style={{ height: 3, background: ev.active ? 'linear-gradient(90deg, var(--teal-dark), var(--gold), var(--teal-light))' : '#ddd' }} />
                <div style={{ padding: '24px 28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      {ev.host_image_url && (
                        <img src={ev.host_image_url} alt={ev.hosted_by} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(196,154,10,0.3)', flexShrink: 0 }} />
                      )}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                          {ev.occasion && <span className="badge badge-gold">{ev.occasion}</span>}
                          <span className={`badge ${ev.active ? 'badge-success' : 'badge-danger'}`}>{ev.active ? 'Active' : 'Hidden'}</span>
                        </div>
                        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, color: 'var(--text-rich)', marginBottom: 6 }}>{ev.title}</h3>
                        {ev.hosted_by && <p style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic', marginBottom: 8 }}>Hosted by {ev.hosted_by}</p>}
                        <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--muted)', flexWrap: 'wrap' }}>
                          {ev.date && <span>📅 {new Date(ev.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}{ev.time ? ` at ${ev.time}` : ''}</span>}
                          {ev.location && <span>📍 {ev.location}</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', minWidth: 100 }}>
                      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 44, color: 'var(--teal)', lineHeight: 1 }}>{totalGuests}</div>
                      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 2, color: 'var(--muted)', marginTop: 2 }}>GUESTS</div>
                      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{rsvpCount} RSVP{rsvpCount !== 1 ? 's' : ''} · {ev.capacity} cap</div>
                    </div>
                  </div>
                  <div style={{ margin: '16px 0 20px' }}>
                    <div style={{ height: 5, background: '#F0EAD8', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: pct >= 90 ? 'var(--danger)' : 'linear-gradient(90deg, var(--teal-dark), var(--teal))', transition: 'width 0.5s', borderRadius: 3 }} />
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>
                      {ev.capacity - totalGuests > 0 ? `${ev.capacity - totalGuests} spots remaining` : '🔴 Event is Full'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 0, background: '#F9F7F2', border: '1.5px solid rgba(14,143,143,0.2)', borderRadius: 4, overflow: 'hidden', minWidth: 240 }}>
                      <div style={{ padding: '9px 14px', fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>🔗 {rsvpLink}</div>
                      <button onClick={() => copyLink(ev.id)} style={{ padding: '9px 16px', background: isCopied ? 'var(--success)' : 'var(--teal)', color: 'white', border: 'none', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, whiteSpace: 'nowrap', transition: 'background 0.2s', fontWeight: 700 }}>
                        {isCopied ? '✓ COPIED' : 'COPY LINK'}
                      </button>
                    </div>
                    <button className="btn-ghost btn-sm" onClick={() => setRsvpView(ev)} style={{ borderRadius: 4 }}>👥 View RSVPs ({rsvpCount})</button>
                    <button className="btn-ghost btn-sm" onClick={() => openEdit(ev)} style={{ borderRadius: 4 }}>Edit</button>
                    <button className="btn-danger" onClick={() => deleteEvent(ev.id)} style={{ borderRadius: 4 }}>Delete</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* RSVP Modal */}
      {rsvpView && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setRsvpView(null) }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 740, maxHeight: '88vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(196,154,10,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 1 }}>
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: 'var(--teal)', marginBottom: 4 }}>RSVP LIST</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, color: 'var(--text-rich)', fontWeight: 300 }}>{rsvpView.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
                  {rsvpView.event_rsvps?.length || 0} RSVP{rsvpView.event_rsvps?.length !== 1 ? 's' : ''} · {getTotalGuests(rsvpView)} total guests · {rsvpView.capacity} capacity
                </p>
              </div>
              <button onClick={() => setRsvpView(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
            </div>
            <div style={{ padding: '14px 28px', background: 'rgba(14,143,143,0.04)', borderBottom: '1px solid rgba(196,154,10,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>Share link:</span>
              <div style={{ flex: 1, fontSize: 12, color: 'var(--teal-dark)', background: '#F9F7F2', padding: '7px 12px', border: '1px solid rgba(14,143,143,0.2)', borderRadius: 3, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {`${baseUrl}/events/${rsvpView.id}/rsvp`}
              </div>
              <button onClick={() => copyLink(rsvpView.id)} className="btn-teal btn-sm" style={{ borderRadius: 4, flexShrink: 0 }}>
                {copied === rsvpView.id ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <div style={{ padding: '20px 28px' }}>
              {!rsvpView.event_rsvps?.length ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                  <p style={{ fontSize: 15 }}>No RSVPs yet. Share the link to get started!</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: 14 }}>
                  {rsvpView.event_rsvps.map((r: any) => (
                    <div key={r.id} style={{ background: r.status === 'cancelled' ? '#FFF5F5' : '#FAFAF7', border: `1.5px solid ${r.status === 'cancelled' ? 'rgba(192,57,43,0.2)' : 'rgba(196,154,10,0.15)'}`, borderRadius: 8, padding: '18px 22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal-dark), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Cinzel, serif', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                            {(r.name || '?')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-rich)' }}>{r.name || '—'}</div>
                            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{r.email}{r.phone && <span style={{ marginLeft: 12 }}>· {r.phone}</span>}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, color: 'var(--teal-dark)' }}>👥 {r.party_size || 1} guest{(r.party_size || 1) !== 1 ? 's' : ''}</span>
                          {r.source === 'public_link' && <span className="badge badge-teal" style={{ fontSize: 8 }}>Via Link</span>}
                          <select value={r.status || 'confirmed'} onChange={e => updateRsvpStatus(rsvpView.id, r.id, e.target.value)}
                            style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, border: '1.5px solid var(--border)', borderRadius: 4, padding: '5px 8px', background: 'white', color: 'var(--teal-dark)', cursor: 'pointer', outline: 'none' }}>
                            <option value="confirmed">Confirmed</option>
                            <option value="waitlist">Waitlist</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                      {(r.dietary_needs || r.message) && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(196,154,10,0.1)', display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                          {r.dietary_needs && <div style={{ fontSize: 13, color: 'var(--muted)' }}><span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, color: 'var(--gold-dark)', marginRight: 6 }}>DIETARY:</span>{r.dietary_needs}</div>}
                          {r.message && <div style={{ fontSize: 13, color: 'var(--muted)', fontStyle: 'italic' }}><span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, color: 'var(--gold-dark)', fontStyle: 'normal', marginRight: 6 }}>MESSAGE:</span>"{r.message}"</div>}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: 'rgba(44,32,16,0.35)', marginTop: 8 }}>
                        RSVPd {r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                        {r.client_id && <span style={{ marginLeft: 10, color: 'var(--success)' }}>✓ Added to Clients</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setModal(false) }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(196,154,10,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: 'var(--teal)', marginBottom: 4 }}>EVENT</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, color: 'var(--text-rich)', fontWeight: 300 }}>{editing ? 'Edit Event' : 'Create New Event'}</h3>
              </div>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
            </div>
            <div style={{ padding: 28 }}>
              {saveError && (
                <div style={{ padding: '12px 16px', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.3)', color: 'var(--danger)', borderRadius: 4, marginBottom: 20, fontSize: 14 }}>⚠ {saveError}</div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                <div style={{ marginBottom: 18, gridColumn: '1 / -1' }}>
                  <label className="lux-label">Occasion Type</label>
                  <select className="luxury-input" style={{ borderRadius: 4 }} value={form.occasion || ''} onChange={e => setForm((p: any) => ({ ...p, occasion: e.target.value }))}>
                    <option value="">No occasion tag</option>
                    {OCCASIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 18, gridColumn: '1 / -1' }}>
                  <label className="lux-label">Event Title *</label>
                  <input className="luxury-input" style={{ borderRadius: 4 }} placeholder="e.g. The Johnson Anniversary Celebration" value={form.title || ''} onChange={e => setForm((p: any) => ({ ...p, title: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 18, gridColumn: '1 / -1' }}>
                  <label className="lux-label">Hosted By (Primary Client)</label>
                  <input className="luxury-input" style={{ borderRadius: 4 }} placeholder="e.g. Marcus & Diana Johnson" value={form.hosted_by || ''} onChange={e => setForm((p: any) => ({ ...p, hosted_by: e.target.value }))} />
                </div>

                {/* Host Photo Upload */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <ImageUploader
                    label="Host Photo (drag & drop or paste URL)"
                    value={form.host_image_url || ''}
                    onChange={url => setForm((p: any) => ({ ...p, host_image_url: url }))}
                    round={true}
                  />
                </div>

                {/* Background Image Upload */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <ImageUploader
                    label="Background Image for RSVP Page (drag & drop or paste URL)"
                    value={form.background_image_url || ''}
                    onChange={url => setForm((p: any) => ({ ...p, background_image_url: url }))}
                  />
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label className="lux-label">Date *</label>
                  <input className="luxury-input" style={{ borderRadius: 4 }} type="date" value={form.date || ''} onChange={e => setForm((p: any) => ({ ...p, date: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label className="lux-label">Time</label>
                  <input className="luxury-input" style={{ borderRadius: 4 }} placeholder="e.g. 7:00 PM" value={form.time || ''} onChange={e => setForm((p: any) => ({ ...p, time: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label className="lux-label">Location / Venue</label>
                  <input className="luxury-input" style={{ borderRadius: 4 }} placeholder="Venue name or address" value={form.location || ''} onChange={e => setForm((p: any) => ({ ...p, location: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label className="lux-label">Guest Capacity</label>
                  <input className="luxury-input" style={{ borderRadius: 4 }} type="number" min="1" value={form.capacity || 50} onChange={e => setForm((p: any) => ({ ...p, capacity: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 18, gridColumn: '1 / -1' }}>
                  <label className="lux-label">Event Description</label>
                  <textarea className="luxury-input" style={{ borderRadius: 4, resize: 'vertical' }} rows={3} placeholder="A brief description shown on the RSVP page..." value={form.description || ''} onChange={e => setForm((p: any) => ({ ...p, description: e.target.value }))} />
                </div>
                <div style={{ gridColumn: '1 / -1', marginBottom: 8 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.active !== false} onChange={e => setForm((p: any) => ({ ...p, active: e.target.checked }))} style={{ width: 16, height: 16 }} />
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, color: 'var(--teal-dark)' }}>RSVP LINK IS ACTIVE (guests can access and RSVP)</span>
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button className="btn-teal" style={{ flex: 1, borderRadius: 4, opacity: saving ? 0.7 : 1 }} onClick={save} disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update Event' : 'Create Event & Get Link'}
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
