'use client'
import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

type Rec = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  trip_history: string | null
  notes: string | null
  source: string | null
  invited: boolean
  created_at: string
}

const EMPTY = { full_name: '', email: '', phone: '', address: '', city: '', state: '', country: '', trip_history: '', notes: '', source: 'Manual entry' }

// Parse pasted spreadsheet text (tab- or comma-separated). Optional header row
// maps columns; otherwise assumes: Name, Email, Phone, City, Trip history, Notes.
function parsePaste(text: string): Partial<Rec>[] {
  const lines = text.split('\n').map(l => l.replace(/\r$/, '')).filter(l => l.trim())
  if (!lines.length) return []
  const delim = lines[0].includes('\t') ? '\t' : ','
  const cells = (l: string) => l.split(delim).map(c => c.trim())
  const FIELDS = ['full_name', 'email', 'phone', 'city', 'trip_history', 'notes', 'address', 'state', 'country']
  const ALIASES: Record<string, string> = {
    name: 'full_name', 'full name': 'full_name', client: 'full_name', 'client name': 'full_name',
    email: 'email', 'e-mail': 'email', phone: 'phone', mobile: 'phone', 'phone number': 'phone',
    city: 'city', 'trip history': 'trip_history', trips: 'trip_history', history: 'trip_history',
    notes: 'notes', note: 'notes', address: 'address', street: 'address', state: 'state', country: 'country',
  }
  const first = cells(lines[0]).map(c => c.toLowerCase())
  const looksHeader = first.some(c => ALIASES[c])
  let map: string[]
  let start = 0
  if (looksHeader) {
    map = first.map(c => ALIASES[c] || '')
    start = 1
  } else {
    map = ['full_name', 'email', 'phone', 'city', 'trip_history', 'notes']
  }
  const out: Partial<Rec>[] = []
  for (let i = start; i < lines.length; i++) {
    const row = cells(lines[i])
    const rec: any = {}
    row.forEach((val, j) => { const key = map[j]; if (key && FIELDS.includes(key) && val) rec[key] = val })
    if (rec.full_name) { rec.source = 'Imported'; out.push(rec) }
  }
  return out
}

export default function DirectoryManager({ initialRecords }: { initialRecords: Rec[] }) {
  const supabase = createClient()
  const [records, setRecords] = useState<Rec[]>(initialRecords)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'add' | 'import' | null>(null)
  const [editing, setEditing] = useState<Rec | null>(null)
  const [form, setForm] = useState<any>(EMPTY)
  const [pasteText, setPasteText] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const preview = useMemo(() => parsePaste(pasteText), [pasteText])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return records
    return records.filter(r =>
      [r.full_name, r.email, r.phone, r.city, r.trip_history, r.notes].some(v => v?.toLowerCase().includes(q)))
  }, [records, search])

  const openAdd = () => { setEditing(null); setForm(EMPTY); setErr(''); setModal('add') }
  const openEdit = (r: Rec) => { setEditing(r); setForm({ ...EMPTY, ...r }); setErr(''); setModal('add') }

  const save = async () => {
    if (!form.full_name?.trim()) { setErr('Name is required.'); return }
    setBusy(true); setErr('')
    const payload = { ...form }
    delete payload.id; delete payload.created_at; delete payload.invited
    if (editing) {
      const { data, error } = await supabase.from('client_records').update(payload).eq('id', editing.id).select().single()
      if (error) { setErr(error.message); setBusy(false); return }
      setRecords(p => p.map(r => r.id === editing.id ? data : r))
    } else {
      const { data, error } = await supabase.from('client_records').insert(payload).select().single()
      if (error) { setErr(error.message); setBusy(false); return }
      setRecords(p => [data, ...p])
    }
    setBusy(false); setModal(null)
  }

  const doImport = async () => {
    const rows = parsePaste(pasteText)
    if (!rows.length) { setErr('Nothing to import — paste rows first.'); return }
    setBusy(true); setErr('')
    const { data, error } = await supabase.from('client_records').insert(rows).select()
    if (error) { setErr(error.message); setBusy(false); return }
    setRecords(p => [...(data || []), ...p])
    setBusy(false); setModal(null); setPasteText('')
    setMsg(`Imported ${data?.length || 0} clients.`); setTimeout(() => setMsg(''), 4000)
  }

  const remove = async (r: Rec) => {
    if (!confirm(`Delete ${r.full_name} from the directory?`)) return
    await supabase.from('client_records').delete().eq('id', r.id)
    setRecords(p => p.filter(x => x.id !== r.id))
  }

  const invite = async (r: Rec) => {
    if (!r.email) { alert('Add an email address first, then invite.'); return }
    if (!confirm(`Send a portal invite to ${r.full_name} (${r.email})?`)) return
    setBusy(true)
    try {
      const res = await fetch('/api/invite-client', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: r.full_name, email: r.email, phone: r.phone || '', tier: 'Silver', notes: r.notes || '' }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to invite')
      await supabase.from('client_records').update({ invited: true }).eq('id', r.id)
      setRecords(p => p.map(x => x.id === r.id ? { ...x, invited: true } : x))
      setMsg(`Invite sent to ${r.email}.`); setTimeout(() => setMsg(''), 4000)
    } catch (e: any) { alert(e.message) }
    setBusy(false)
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="section-eyebrow" style={{ marginBottom: 6 }}>Your Book of Business</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 38, fontWeight: 300 }}>Client <em style={{ color: 'var(--gold)' }}>Directory</em></h2>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 6 }}>{records.length} {records.length === 1 ? 'client' : 'clients'} on file</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-ghost btn-sm" onClick={() => { setPasteText(''); setErr(''); setModal('import') }}>⬆ Import</button>
          <button className="btn-gold btn-sm" onClick={openAdd}>+ Add Client</button>
        </div>
      </div>

      {msg && <div style={{ padding: '10px 16px', background: 'rgba(26,122,74,0.08)', border: '1px solid rgba(26,122,74,0.3)', color: 'var(--success)', fontSize: 13, borderRadius: 4, marginBottom: 16 }}>{msg}</div>}

      <input className="luxury-input" placeholder="Search name, email, phone, city, trip…" value={search} onChange={e => setSearch(e.target.value)} style={{ marginBottom: 18, maxWidth: 420 }} />

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '70px 0', color: 'var(--muted)' }}>
          <div style={{ fontSize: 44, marginBottom: 14 }}>📇</div>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, marginBottom: 10 }}>{records.length ? 'No matches' : 'No clients yet'}</h3>
          <p style={{ fontSize: 14 }}>{records.length ? 'Try a different search.' : 'Import a spreadsheet or add clients to build your directory.'}</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--muted)', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1 }}>
                <th style={{ padding: '10px 8px' }}>NAME</th>
                <th style={{ padding: '10px 8px' }}>CONTACT</th>
                <th style={{ padding: '10px 8px' }}>LOCATION</th>
                <th style={{ padding: '10px 8px' }}>TRIP HISTORY</th>
                <th style={{ padding: '10px 8px' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ color: 'var(--text)', fontWeight: 500 }}>{r.full_name}</div>
                    {r.invited && <span className="badge badge-teal" style={{ marginTop: 4 }}>Portal invited</span>}
                  </td>
                  <td style={{ padding: '12px 8px', color: 'var(--muted)' }}>
                    {r.email && <div>{r.email}</div>}
                    {r.phone && <div>{r.phone}</div>}
                  </td>
                  <td style={{ padding: '12px 8px', color: 'var(--muted)' }}>{[r.city, r.state, r.country].filter(Boolean).join(', ')}</td>
                  <td style={{ padding: '12px 8px', color: 'var(--muted)', maxWidth: 240 }}>{r.trip_history}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {!r.invited && <button onClick={() => invite(r)} disabled={busy} style={{ background: 'rgba(196,154,10,0.08)', border: '1px solid rgba(196,154,10,0.3)', color: 'var(--gold-dark, #8B6914)', borderRadius: 4, padding: '5px 10px', cursor: 'pointer', fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: 1 }}>Invite to Portal</button>}
                      <button onClick={() => openEdit(r)} style={{ background: 'rgba(14,143,143,0.08)', border: '1px solid rgba(14,143,143,0.25)', color: 'var(--teal-dark)', borderRadius: 4, padding: '5px 10px', cursor: 'pointer', fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: 1 }}>Edit</button>
                      <button onClick={() => remove(r)} style={{ background: 'rgba(192,57,43,0.06)', border: '1px solid rgba(192,57,43,0.25)', color: 'var(--danger)', borderRadius: 4, padding: '5px 10px', cursor: 'pointer', fontSize: 10, fontFamily: 'Cinzel, serif', letterSpacing: 1 }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit modal */}
      {modal === 'add' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setModal(null)}>
          <div className="luxury-card" style={{ width: '100%', maxWidth: 560, maxHeight: '88vh', overflowY: 'auto', padding: 26 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, marginBottom: 18 }}>{editing ? 'Edit Client' : 'Add Client'}</h3>
            {err && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{err}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
              <div><label className="lux-label">Full Name *</label><input className="luxury-input" value={form.full_name} onChange={e => setForm((f: any) => ({ ...f, full_name: e.target.value }))} /></div>
              <div><label className="lux-label">Email</label><input className="luxury-input" value={form.email} onChange={e => setForm((f: any) => ({ ...f, email: e.target.value }))} /></div>
              <div><label className="lux-label">Phone</label><input className="luxury-input" value={form.phone} onChange={e => setForm((f: any) => ({ ...f, phone: e.target.value }))} /></div>
              <div><label className="lux-label">City</label><input className="luxury-input" value={form.city} onChange={e => setForm((f: any) => ({ ...f, city: e.target.value }))} /></div>
              <div><label className="lux-label">State</label><input className="luxury-input" value={form.state} onChange={e => setForm((f: any) => ({ ...f, state: e.target.value }))} /></div>
              <div><label className="lux-label">Country</label><input className="luxury-input" value={form.country} onChange={e => setForm((f: any) => ({ ...f, country: e.target.value }))} /></div>
            </div>
            <div><label className="lux-label">Address</label><input className="luxury-input" value={form.address} onChange={e => setForm((f: any) => ({ ...f, address: e.target.value }))} /></div>
            <div><label className="lux-label">Trip History</label><textarea className="luxury-input" rows={2} value={form.trip_history} onChange={e => setForm((f: any) => ({ ...f, trip_history: e.target.value }))} style={{ resize: 'vertical' }} /></div>
            <div><label className="lux-label">Notes</label><textarea className="luxury-input" rows={2} value={form.notes} onChange={e => setForm((f: any) => ({ ...f, notes: e.target.value }))} style={{ resize: 'vertical' }} /></div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn-gold" style={{ flex: 1, opacity: busy ? 0.7 : 1 }} onClick={save} disabled={busy}>{busy ? 'Saving…' : editing ? 'Update' : 'Add Client'}</button>
              <button className="btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Import modal */}
      {modal === 'import' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setModal(null)}>
          <div className="luxury-card" style={{ width: '100%', maxWidth: 640, maxHeight: '88vh', overflowY: 'auto', padding: 26 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, marginBottom: 8 }}>Import Clients</h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16, lineHeight: 1.6 }}>
              Copy rows straight from Excel or Google Sheets and paste below. Include a header row like
              <strong> Name, Email, Phone, City, Trip History, Notes</strong> — or just paste in that order.
            </p>
            {err && <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{err}</div>}
            <textarea className="luxury-input" rows={8} value={pasteText} onChange={e => setPasteText(e.target.value)}
              placeholder={'Name\tEmail\tPhone\tCity\tTrip History\tNotes\nJane Smith\tjane@email.com\t(555) 123-4567\tBoston\tMaldives 2024\tPrefers overwater villas'}
              style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }} />
            <div style={{ margin: '12px 0', fontSize: 13, color: preview.length ? 'var(--teal-dark)' : 'var(--muted)' }}>
              {preview.length ? `✓ ${preview.length} client${preview.length === 1 ? '' : 's'} ready to import` : 'Paste rows to see a preview'}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-gold" style={{ flex: 1, opacity: busy || !preview.length ? 0.6 : 1 }} onClick={doImport} disabled={busy || !preview.length}>{busy ? 'Importing…' : `Import ${preview.length || ''} Clients`}</button>
              <button className="btn-ghost" onClick={() => setModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
