'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

const APPT_TYPES = ['Consultation', 'Trip Planning', 'Intake', 'Follow-Up', 'VIP Meeting']
const APPT_STATUSES = ['Pending', 'Confirmed', 'Cancelled']

export default function AdminAppointmentsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [baseUrl, setBaseUrl] = useState('')
  const [copied, setCopied] = useState('')

  const [editModal, setEditModal] = useState(false)
  const [editRecord, setEditRecord] = useState<any>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [saving, setSaving] = useState(false)

  const [viewModal, setViewModal] = useState(false)
  const [viewRecord, setViewRecord] = useState<any>(null)

  const [shareModal, setShareModal] = useState(false)
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [sendMethod, setSendMethod] = useState<'email'|'sms'|'qr'|'copy'>('copy')
  const [shareLink, setShareLink] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [qrVisible, setQrVisible] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  useEffect(() => {
    setBaseUrl(window.location.origin)
    fetchRequests()
  }, [filter])

  useEffect(() => {
    if (clientName) {
      const slug = clientName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      setShareLink(`${baseUrl}/book-appointment?ref=${slug}&name=${encodeURIComponent(clientName.trim())}`)
    } else {
      setShareLink(`${baseUrl}/book-appointment`)
    }
  }, [clientName, baseUrl])

  useEffect(() => {
    if (qrVisible && shareLink && qrRef.current) {
      qrRef.current.innerHTML = ''
      const renderQR = () => {
        if (qrRef.current && (window as any).QRCode) {
          new (window as any).QRCode(qrRef.current, {
            text: shareLink, width: 200, height: 200,
            colorDark: '#076060', colorLight: '#ffffff',
          })
        }
      }
      if ((window as any).QRCode) {
        renderQR()
      } else {
        const script = document.createElement('script')
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
        script.onload = renderQR
        document.head.appendChild(script)
      }
    }
  }, [qrVisible, shareLink])

  const fetchRequests = async () => {
    setLoading(true)
    let q = supabase.from('appointment_requests').select('*').order('created_at', { ascending: false })
    if (filter !== 'All') q = q.eq('status', filter)
    const { data } = await q
    setRequests(data || [])
    setLoading(false)
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase.from('appointment_requests').update({ status }).eq('id', id)
      if (error) throw error
      fetchRequests()
    } catch (err: any) {
      alert('Failed to update status: ' + (err?.message || 'Unknown error'))
    }
  }

  const cancelWithConfirm = (id: string) => {
    if (window.confirm('Cancel this appointment?')) updateStatus(id, 'Cancelled')
  }

  const deleteRequest = async (id: string) => {
    if (!window.confirm('Permanently delete this appointment request? This cannot be undone.')) return
    try {
      const { error } = await supabase.from('appointment_requests').delete().eq('id', id)
      if (error) throw error
      fetchRequests()
    } catch (err: any) {
      alert('Failed to delete appointment: ' + (err?.message || 'Unknown error'))
    }
  }

  const openEdit = (r: any) => {
    setEditRecord(r)
    setEditForm({ date: r.date, time: r.time, type: r.type, status: r.status, notes: r.notes || '' })
    setEditModal(true)
  }

  const saveEdit = async () => {
    if (!editRecord) return
    setSaving(true)
    try {
      const { error } = await supabase.from('appointment_requests').update(editForm).eq('id', editRecord.id)
      if (error) throw error
      setEditModal(false)
      setEditRecord(null)
      fetchRequests()
    } catch (err: any) {
      alert('Failed to save changes: ' + (err?.message || 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(''), 2500)
  }

  const loadEmailJS = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).emailjs) {
        const ejs = (window as any).emailjs
        ejs.init('Ea5qbri-eVFF-RKFI')
        resolve(ejs)
        return
      }
      const script = document.createElement('script')
      script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js'
      script.onload = () => {
        const ejs = (window as any).emailjs
        ejs.init('Ea5qbri-eVFF-RKFI')
        resolve(ejs)
      }
      script.onerror = () => reject(new Error('Failed to load EmailJS'))
      document.head.appendChild(script)
    })
  }

  const sendViaEmailJS = async () => {
    if (!clientEmail) { alert('Please enter a client email address first.'); return }
    setSending(true)
    try {
      const ejs = await loadEmailJS()
      const name = clientName ? clientName.trim().replace(/\b\w/g, c => c.toUpperCase()) : 'Valued Client'
      await ejs.send('service_5eyyayc', 'template_0ai8is3', {
        to_email: clientEmail,
        to_name: name,
        from_name: 'FHJ Dream Destinations',
        reply_to: 'info@fhjdreamdestinations.com',
        booking_link: shareLink,
        subject: 'Your Personalized Booking Link — FHJ Dream Destinations',
        message: `Hi ${name},\n\nHere is your personalized booking link:\n\n${shareLink}\n\nClick the link to select your preferred date and time.\n\nWarm regards,\nFHJ Dream Destinations`,
      })
      setSent(true)
      setTimeout(() => { setSent(false); setSending(false) }, 3000)
    } catch (err: any) {
      alert('Email failed: ' + (err?.text || err?.message || 'Unknown error'))
      setSending(false)
    }
  }

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (canvas) {
      const link = document.createElement('a')
      link.download = `fhj-booking-${clientName || 'qr'}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  const openShareModal = () => {
    setClientName(''); setClientEmail(''); setClientPhone('')
    setSendMethod('copy'); setSent(false); setQrVisible(false)
    setShareModal(true)
  }

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: 'var(--teal)', marginBottom: 8, fontWeight: 600 }}>ADMIN</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 300, color: 'var(--text-rich)' }}>
          Appointment <em style={{ color: 'var(--teal-dark)' }}>Requests</em>
        </h1>
      </div>

      {/* Action Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
        <div style={{ background: 'white', border: '2px solid rgba(196,154,10,0.25)', borderRadius: 8, padding: 24, boxShadow: '0 2px 16px rgba(196,154,10,0.08)' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--teal-dark)', marginBottom: 10, fontWeight: 700 }}>🌐 PUBLIC BOOKING LINK</div>
          <div style={{ fontSize: 14, color: 'var(--text-rich)', fontFamily: 'monospace', background: 'var(--ivory)', padding: '10px 14px', borderRadius: 4, border: '1px solid rgba(196,154,10,0.2)', marginBottom: 12, wordBreak: 'break-all' }}>
            {baseUrl}/book-appointment
          </div>
          <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 14 }}>Anyone with this link can book a consultation.</p>
          <button className="btn-teal btn-sm" style={{ borderRadius: 4 }}
            onClick={() => copyToClipboard(`${baseUrl}/book-appointment`, 'public')}>
            {copied === 'public' ? '✓ Copied!' : '📋 Copy Public Link'}
          </button>
        </div>

        <div style={{ background: 'linear-gradient(135deg, var(--teal-dark), var(--teal))', borderRadius: 8, padding: 24, boxShadow: '0 4px 24px rgba(14,143,143,0.25)' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'rgba(255,255,255,0.8)', marginBottom: 10, fontWeight: 700 }}>✦ SEND TO A CLIENT</div>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.65, marginBottom: 18 }}>
            Generate a personalized booking link with QR code — send via email, text, or share directly.
          </p>
          <button className="btn-gold" style={{ borderRadius: 4, padding: '11px 28px', fontSize: 11 }}
            onClick={openShareModal}>
            ✦ Create Client Link
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, alignItems: 'center' }}>
        {['All', 'Pending', 'Confirmed', 'Cancelled'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={filter === f ? 'btn-teal btn-sm' : 'btn-ghost btn-sm'}
            style={{ borderRadius: 4 }}>{f}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 15, color: 'var(--muted)' }}>
          {requests.length} request{requests.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 8, border: '1px solid rgba(196,154,10,0.2)', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--muted)', fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontStyle: 'italic' }}>Loading...</div>
        ) : requests.length === 0 ? (
          <div style={{ padding: 64, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
            <p style={{ color: 'var(--muted)', fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontStyle: 'italic' }}>No {filter !== 'All' ? filter.toLowerCase() + ' ' : ''}appointment requests yet</p>
          </div>
        ) : (
          <table className="lux-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{r.name}</div>
                    {r.notes && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2, maxWidth: 180 }}>{r.notes.slice(0, 50)}{r.notes.length > 50 ? '…' : ''}</div>}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{new Date(r.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    <div style={{ color: 'var(--teal-dark)', fontSize: 14, marginTop: 2 }}>{r.time}</div>
                  </td>
                  <td><span className="badge badge-teal">{r.type}</span></td>
                  <td>
                    <div style={{ fontSize: 14 }}>{r.email}</div>
                    {r.phone && <div style={{ fontSize: 14, color: 'var(--muted)' }}>{r.phone}</div>}
                  </td>
                  <td>
                    <span className={`badge ${r.status === 'Confirmed' ? 'badge-success' : r.status === 'Cancelled' ? 'badge-danger' : 'badge-gold'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {r.status !== 'Confirmed' && (
                        <button onClick={() => updateStatus(r.id, 'Confirmed')}
                          style={{ background: 'rgba(26,122,74,0.1)', border: '1px solid rgba(26,122,74,0.3)', color: 'var(--success)', borderRadius: 4, padding: '6px 10px', cursor: 'pointer', fontSize: 12, fontFamily: 'Cinzel, serif', letterSpacing: 1 }}>
                          Confirm
                        </button>
                      )}
                      {r.status !== 'Cancelled' && (
                        <button onClick={() => cancelWithConfirm(r.id)}
                          style={{ background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)', color: 'var(--danger)', borderRadius: 4, padding: '6px 10px', cursor: 'pointer', fontSize: 12, fontFamily: 'Cinzel, serif', letterSpacing: 1 }}>
                          Cancel
                        </button>
                      )}
                      <button onClick={() => openEdit(r)}
                        style={{ background: 'rgba(14,143,143,0.1)', border: '1px solid rgba(14,143,143,0.3)', color: 'var(--teal-dark)', borderRadius: 4, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>
                        ✏️ Edit
                      </button>
                      <button onClick={() => { setViewRecord(r); setViewModal(true) }}
                        style={{ background: 'rgba(196,154,10,0.1)', border: '1px solid rgba(196,154,10,0.3)', color: 'var(--gold-dark)', borderRadius: 4, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>
                        👁 View
                      </button>
                      <button onClick={() => deleteRequest(r.id)}
                        style={{ background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)', color: 'var(--danger)', borderRadius: 4, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* EDIT MODAL */}
      {editModal && editRecord && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setEditModal(false) }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(196,154,10,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: 'var(--teal)', marginBottom: 4, fontWeight: 700 }}>EDIT APPOINTMENT</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, color: 'var(--text-rich)', fontWeight: 300 }}>{editRecord.name}</h3>
              </div>
              <button onClick={() => setEditModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
            </div>
            <div style={{ padding: 28 }}>
              <div style={{ background: 'var(--ivory)', borderRadius: 6, padding: '12px 16px', marginBottom: 24 }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, color: 'var(--teal-dark)', marginBottom: 6, fontWeight: 700 }}>CLIENT INFO</div>
                <div style={{ fontSize: 14 }}>{editRecord.name}</div>
                <div style={{ fontSize: 14, color: 'var(--muted)' }}>{editRecord.email}</div>
                {editRecord.phone && <div style={{ fontSize: 14, color: 'var(--muted)' }}>{editRecord.phone}</div>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                <div style={{ marginBottom: 20 }}>
                  <label className="lux-label">Date</label>
                  <input className="luxury-input" style={{ borderRadius: 4 }} type="date"
                    value={editForm.date || ''} onChange={e => setEditForm((p: any) => ({ ...p, date: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 20 }}>
                  <label className="lux-label">Time</label>
                  <input className="luxury-input" style={{ borderRadius: 4 }} type="text" placeholder="e.g. 10:00 AM"
                    value={editForm.time || ''} onChange={e => setEditForm((p: any) => ({ ...p, time: e.target.value }))} />
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="lux-label">Appointment Type</label>
                <select className="luxury-input" style={{ borderRadius: 4 }}
                  value={editForm.type || ''} onChange={e => setEditForm((p: any) => ({ ...p, type: e.target.value }))}>
                  {APPT_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="lux-label">Status</label>
                <select className="luxury-input" style={{ borderRadius: 4 }}
                  value={editForm.status || ''} onChange={e => setEditForm((p: any) => ({ ...p, status: e.target.value }))}>
                  {APPT_STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: 28 }}>
                <label className="lux-label">Notes</label>
                <textarea className="luxury-input" style={{ borderRadius: 4, resize: 'vertical' }} rows={3}
                  value={editForm.notes || ''} onChange={e => setEditForm((p: any) => ({ ...p, notes: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button className="btn-ghost" style={{ borderRadius: 4, padding: '12px 28px' }} onClick={() => setEditModal(false)}>Cancel</button>
                <button className="btn-teal" style={{ borderRadius: 4, padding: '13px 44px', opacity: saving ? 0.7 : 1 }} onClick={saveEdit} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes ✦'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewModal && viewRecord && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setViewModal(false) }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(196,154,10,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: 'var(--teal)', marginBottom: 4, fontWeight: 700 }}>APPOINTMENT DETAILS</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, color: 'var(--text-rich)', fontWeight: 300 }}>{viewRecord.name}</h3>
              </div>
              <button onClick={() => setViewModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
            </div>
            <div style={{ padding: 28 }}>
              {[
                ['Email', viewRecord.email],
                ['Phone', viewRecord.phone || '—'],
                ['Date', viewRecord.date],
                ['Time', viewRecord.time],
                ['Type', viewRecord.type],
                ['Status', viewRecord.status],
                ['Created', viewRecord.created_at ? new Date(viewRecord.created_at).toLocaleString() : '—'],
                ['ID', viewRecord.id],
              ].map(([label, value]) => (
                <div key={label} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid rgba(196,154,10,0.1)' }}>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--teal-dark)', marginBottom: 4, fontWeight: 700 }}>{label}</div>
                  <div style={{ fontSize: 15, color: 'var(--text-rich)', wordBreak: 'break-word' }}>{value}</div>
                </div>
              ))}
              {viewRecord.notes && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--teal-dark)', marginBottom: 4, fontWeight: 700 }}>NOTES</div>
                  <div style={{ fontSize: 15, color: 'var(--text-rich)', lineHeight: 1.7, background: 'var(--ivory)', padding: '12px 16px', borderRadius: 6 }}>{viewRecord.notes}</div>
                </div>
              )}
              <div style={{ textAlign: 'right', marginTop: 8 }}>
                <button className="btn-teal" style={{ borderRadius: 4, padding: '12px 36px' }} onClick={() => setViewModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SHARE MODAL */}
      {shareModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setShareModal(false) }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(196,154,10,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: 'var(--teal)', marginBottom: 4, fontWeight: 700 }}>SEND BOOKING LINK</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, color: 'var(--text-rich)', fontWeight: 300 }}>Create Client Link</h3>
              </div>
              <button onClick={() => setShareModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
            </div>
            <div style={{ padding: 28 }}>
              <div style={{ marginBottom: 20 }}>
                <label className="lux-label">Client Name (personalizes the link)</label>
                <input className="luxury-input" style={{ borderRadius: 4 }} placeholder="e.g. Sarah Johnson"
                  value={clientName} onChange={e => setClientName(e.target.value)} />
              </div>
              <div style={{ background: 'var(--ivory)', border: '1px solid rgba(14,143,143,0.2)', borderRadius: 6, padding: '12px 16px', marginBottom: 24 }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--teal-dark)', marginBottom: 6, fontWeight: 700 }}>YOUR BOOKING LINK</div>
                <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-rich)', wordBreak: 'break-all', lineHeight: 1.5 }}>{shareLink}</div>
              </div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--teal-dark)', marginBottom: 12, fontWeight: 700 }}>SEND VIA</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
                {[
                  { key: 'copy', icon: '📋', label: 'Copy' },
                  { key: 'email', icon: '✉️', label: 'Email' },
                  { key: 'sms', icon: '💬', label: 'Text/SMS' },
                  { key: 'qr', icon: '⬛', label: 'QR Code' },
                ].map(m => (
                  <button key={m.key} onClick={() => { setSendMethod(m.key as any); if (m.key === 'qr') setQrVisible(true) }}
                    style={{ padding: '12px 8px', borderRadius: 6, border: `2px solid ${sendMethod === m.key ? 'var(--teal)' : 'rgba(14,143,143,0.2)'}`, background: sendMethod === m.key ? 'rgba(14,143,143,0.08)' : 'white', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{m.icon}</div>
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, color: sendMethod === m.key ? 'var(--teal-dark)' : 'var(--muted)', fontWeight: 700 }}>{m.label}</div>
                  </button>
                ))}
              </div>

              {sendMethod === 'copy' && (
                <div style={{ textAlign: 'center' }}>
                  <button className="btn-teal" style={{ borderRadius: 4, padding: '13px 48px', fontSize: 12 }}
                    onClick={() => copyToClipboard(shareLink, 'modal')}>
                    {copied === 'modal' ? '✓ Copied to Clipboard!' : '📋 Copy Link'}
                  </button>
                  <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 12 }}>Paste into any message, email, or text</p>
                </div>
              )}

              {sendMethod === 'email' && (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <label className="lux-label">Client Email Address</label>
                    <input className="luxury-input" style={{ borderRadius: 4 }} type="email" placeholder="client@email.com"
                      value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
                  </div>
                  {sent ? (
                    <div style={{ padding: '14px', background: 'rgba(26,122,74,0.1)', border: '1px solid rgba(26,122,74,0.3)', color: 'var(--success)', borderRadius: 4, textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2 }}>
                      ✓ EMAIL SENT SUCCESSFULLY
                    </div>
                  ) : (
                    <button className="btn-teal" style={{ borderRadius: 4, padding: '13px 48px', fontSize: 13, opacity: sending || !clientEmail ? 0.6 : 1 }}
                      onClick={sendViaEmailJS} disabled={sending || !clientEmail}>
                      {sending ? 'Sending...' : '✉️ Send Booking Link'}
                    </button>
                  )}
                  <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 10 }}>Email will be sent from info@fhjdreamdestinations.com</p>
                </div>
              )}

              {sendMethod === 'sms' && (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <label className="lux-label">Client Phone Number</label>
                    <input className="luxury-input" style={{ borderRadius: 4 }} type="tel" placeholder="+1 (555) 000-0000"
                      value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
                  </div>
                  <a href={`sms:${clientPhone}?body=${encodeURIComponent(`Hi ${clientName || 'there'}! Here's your personal booking link: ${shareLink}`)}`}
                    className="btn-teal" style={{ borderRadius: 4, padding: '13px 48px', fontSize: 13, display: 'inline-block', opacity: clientPhone ? 1 : 0.5, pointerEvents: clientPhone ? 'auto' : 'none' }}>
                    💬 Open in Messages
                  </a>
                  <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 10 }}>Opens your default SMS app with the link pre-filled.</p>
                </div>
              )}

              {sendMethod === 'qr' && (
                <div style={{ textAlign: 'center' }}>
                  <div ref={qrRef} style={{ display: 'inline-block', padding: 16, background: 'white', border: '2px solid rgba(14,143,143,0.2)', borderRadius: 8, marginBottom: 16 }} />
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button className="btn-teal" style={{ borderRadius: 4, padding: '11px 28px', fontSize: 11 }} onClick={downloadQR}>⬇️ Download QR</button>
                    <button className="btn-ghost" style={{ borderRadius: 4, padding: '11px 28px', fontSize: 11 }}
                      onClick={() => copyToClipboard(shareLink, 'qr')}>
                      {copied === 'qr' ? '✓ Copied!' : '📋 Copy Link'}
                    </button>
                  </div>
                  <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 12 }}>Client scans the QR code to open booking page directly</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}