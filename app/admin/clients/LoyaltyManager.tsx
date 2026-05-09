'use client'
import { useState, useEffect, useCallback } from 'react'

const PROGRAM_TYPES = ['Airline', 'Hotel', 'Car Rental', 'Cruise', 'Rail', 'Credit Card', 'Other']

const PROVIDER_SUGGESTIONS: Record<string, string[]> = {
  Airline:     ['American Airlines', 'Delta Air Lines', 'United Airlines', 'Southwest Airlines', 'British Airways', 'Air France', 'Emirates', 'Lufthansa', 'Qatar Airways', 'Singapore Airlines', 'JetBlue', 'Alaska Airlines'],
  Hotel:       ['Marriott Bonvoy', 'Hilton Honors', 'World of Hyatt', 'IHG One Rewards', 'Wyndham Rewards', 'Best Western Rewards', 'Choice Privileges', 'Radisson Rewards'],
  'Car Rental':['Hertz Gold Plus', 'National Emerald Club', 'Enterprise Plus', 'Avis Preferred', 'Budget Fastbreak', 'Alamo Insiders'],
  Cruise:      ['Royal Caribbean Crown & Anchor', 'Carnival VIFP', 'Norwegian Latitudes', 'Celebrity Captains Club', 'MSC Voyagers Club'],
  Rail:        ['Amtrak Guest Rewards', 'Eurostar', 'Eurostar Club', 'VIA Rail'],
  'Credit Card':['Chase Sapphire', 'Amex Membership Rewards', 'Citi ThankYou', 'Capital One Miles', 'Discover Miles'],
  Other:       [],
}

type LoyaltyProgram = {
  id: string
  client_id: string
  program_type: string
  provider: string
  program_name: string | null
  membership_number: string | null
  username: string | null
  password: string | null
  pin: string | null
  tier: string | null
  notes: string | null
  created_at: string
}

type Props = {
  clientId: string
  clientName: string
  onClose: () => void
}

const ICON_MAP: Record<string, string> = {
  Airline:      '✈',
  Hotel:        '🏨',
  'Car Rental': '🚗',
  Cruise:       '🚢',
  Rail:         '🚂',
  'Credit Card':'💳',
  Other:        '⭐',
}

function MaskedField({ label, value, allowCopy = true }: { label: string; value: string | null; allowCopy?: boolean }) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied]     = useState(false)

  if (!value) return null

  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--muted)', marginBottom: 3 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontFamily: 'monospace', fontSize: 14, color: 'var(--text-rich)', letterSpacing: 1, flex: 1, background: 'rgba(14,143,143,0.05)', padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(14,143,143,0.15)' }}>
          {revealed ? value : '•'.repeat(Math.min(value.length, 16))}
        </span>
        <button
          onClick={() => setRevealed(r => !r)}
          title={revealed ? 'Hide' : 'Reveal'}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--teal)', padding: '4px', lineHeight: 1 }}>
          {revealed ? '🙈' : '👁'}
        </button>
        {allowCopy && (
          <button
            onClick={copy}
            title="Copy to clipboard"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: copied ? 'var(--success)' : 'var(--muted)', padding: '4px', lineHeight: 1 }}>
            {copied ? '✓' : '📋'}
          </button>
        )}
      </div>
    </div>
  )
}

function ProgramCard({
  prog,
  onEdit,
  onDelete,
}: {
  prog: LoyaltyProgram
  onEdit: (p: LoyaltyProgram) => void
  onDelete: (id: string) => void
}) {
  const [deleting, setDeleting] = useState(false)
  const icon = ICON_MAP[prog.program_type] || '⭐'

  const handleDelete = async () => {
    if (!confirm(`Delete ${prog.provider} loyalty record? This cannot be undone.`)) return
    setDeleting(true)
    onDelete(prog.id)
  }

  return (
    <div style={{
      background: 'white',
      border: '1px solid rgba(196,154,10,0.2)',
      borderRadius: 10,
      overflow: 'hidden',
      boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
      transition: 'box-shadow 0.2s',
    }}>
      {/* Card header */}
      <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(14,143,143,0.08) 0%, rgba(196,154,10,0.06) 100%)', borderBottom: '1px solid rgba(196,154,10,0.15)', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ fontSize: 28, width: 44, height: 44, background: 'white', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'var(--text-rich)', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {prog.provider}
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 2, color: 'var(--teal)', background: 'rgba(14,143,143,0.1)', padding: '2px 8px', borderRadius: 10 }}>
              {prog.program_type.toUpperCase()}
            </span>
            {prog.tier && (
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 2, color: 'var(--gold-dark, #b8860b)', background: 'rgba(196,154,10,0.12)', padding: '2px 8px', borderRadius: 10 }}>
                {prog.tier.toUpperCase()}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            onClick={() => onEdit(prog)}
            style={{ background: 'rgba(14,143,143,0.1)', border: '1px solid rgba(14,143,143,0.3)', color: 'var(--teal-dark)', borderRadius: 4, padding: '5px 12px', cursor: 'pointer', fontSize: 11, fontFamily: 'Cinzel, serif', letterSpacing: 1 }}>
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{ background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.2)', color: 'var(--danger)', borderRadius: 4, padding: '5px 10px', cursor: 'pointer', fontSize: 11 }}>
            {deleting ? '...' : '✕'}
          </button>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '16px 20px' }}>
        {prog.program_name && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--muted)', marginBottom: 3 }}>PROGRAM NAME</div>
            <div style={{ fontSize: 14, color: 'var(--text-rich)' }}>{prog.program_name}</div>
          </div>
        )}

        {prog.membership_number && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--muted)', marginBottom: 3 }}>MEMBERSHIP / REWARDS NUMBER</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 600, color: 'var(--teal-dark)', letterSpacing: 2 }}>
                {prog.membership_number}
              </span>
              <button
                onClick={() => { navigator.clipboard.writeText(prog.membership_number!); }}
                title="Copy"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--muted)', padding: 0 }}>
                📋
              </button>
            </div>
          </div>
        )}

        {prog.username && (
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--muted)', marginBottom: 3 }}>USERNAME / EMAIL</div>
            <div style={{ fontSize: 14, color: 'var(--text)' }}>{prog.username}</div>
          </div>
        )}

        <MaskedField label="PASSWORD" value={prog.password} />
        <MaskedField label="PIN" value={prog.pin} />

        {prog.notes && (
          <div style={{ marginTop: 10, padding: '10px 12px', background: 'rgba(196,154,10,0.05)', borderRadius: 6, border: '1px solid rgba(196,154,10,0.12)' }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--muted)', marginBottom: 4 }}>NOTES</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{prog.notes}</div>
          </div>
        )}
      </div>
    </div>
  )
}

const EMPTY_FORM = {
  program_type: 'Airline',
  provider: '',
  program_name: '',
  membership_number: '',
  username: '',
  password: '',
  pin: '',
  tier: '',
  notes: '',
}

export default function LoyaltyManager({ clientId, clientName, onClose }: Props) {
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState<LoyaltyProgram | null>(null)
  const [form, setForm]         = useState({ ...EMPTY_FORM })
  const [saving, setSaving]     = useState(false)
  const [saveError, setSaveError] = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [showPin, setShowPin]     = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res  = await fetch(`/api/loyalty?clientId=${clientId}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load')
      setPrograms(json.programs)
    } catch (e: any) {
      setError(e.message)
    }
    setLoading(false)
  }, [clientId])

  useEffect(() => { load() }, [load])

  // Prevent body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const openAdd = () => {
    setEditing(null)
    setForm({ ...EMPTY_FORM })
    setSaveError('')
    setShowPass(false)
    setShowPin(false)
    setShowForm(true)
  }

  const openEdit = (p: LoyaltyProgram) => {
    setEditing(p)
    setForm({
      program_type:      p.program_type,
      provider:          p.provider,
      program_name:      p.program_name || '',
      membership_number: p.membership_number || '',
      username:          p.username || '',
      password:          '__UNCHANGED__',
      pin:               '__UNCHANGED__',
      tier:              p.tier || '',
      notes:             p.notes || '',
    })
    setSaveError('')
    setShowPass(false)
    setShowPin(false)
    setShowForm(true)
  }

  const save = async () => {
    if (!form.provider.trim()) { setSaveError('Provider name is required.'); return }
    setSaving(true)
    setSaveError('')

    try {
      let res: Response
      if (editing) {
        res = await fetch(`/api/loyalty/${editing.id}`, {
          method:  'PUT',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify(form),
        })
      } else {
        res = await fetch('/api/loyalty', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ ...form, client_id: clientId }),
        })
      }

      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Save failed')

      if (editing) {
        setPrograms(p => p.map(x => x.id === editing.id ? json.program : x))
      } else {
        setPrograms(p => [...p, json.program])
      }

      setShowForm(false)
    } catch (e: any) {
      setSaveError(e.message)
    }
    setSaving(false)
  }

  const deleteProgram = async (id: string) => {
    const res  = await fetch(`/api/loyalty/${id}`, { method: 'DELETE' })
    if (res.ok) setPrograms(p => p.filter(x => x.id !== id))
  }

  const suggestions = PROVIDER_SUGGESTIONS[form.program_type] || []

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget && !showForm) onClose() }}>

      <div style={{ background: '#FAFAF7', borderRadius: 14, width: '100%', maxWidth: 720, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 32px 100px rgba(0,0,0,0.3)', border: '1px solid rgba(196,154,10,0.2)' }}>

        {/* Header */}
        <div style={{ padding: '22px 28px', borderBottom: '1px solid rgba(196,154,10,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: 'var(--teal)', marginBottom: 4, fontWeight: 600 }}>
              TRAVEL LOYALTY PROGRAMS
            </div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 300, color: 'var(--text-rich)', margin: 0 }}>
              ✈ {clientName}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              className="btn-teal"
              onClick={openAdd}
              style={{ borderRadius: 4, padding: '10px 20px', fontSize: 13 }}>
              + Add Program
            </button>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)', lineHeight: 1, padding: 4 }}>
              ✕
            </button>
          </div>
        </div>

        {/* Security notice */}
        <div style={{ padding: '10px 28px', background: 'rgba(14,143,143,0.06)', borderBottom: '1px solid rgba(14,143,143,0.12)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 16 }}>🔐</span>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1.5, color: 'var(--teal-dark)' }}>
            ALL PASSWORDS ENCRYPTED WITH AES-256-GCM — NEVER STORED IN PLAIN TEXT
          </span>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✈</div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3 }}>LOADING PROGRAMS...</div>
            </div>
          ) : error ? (
            <div style={{ padding: '16px 20px', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.25)', borderRadius: 6, color: 'var(--danger)', fontSize: 14 }}>
              ⚠ {error}
            </div>
          ) : programs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>✈</div>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, color: 'var(--text-rich)', marginBottom: 10 }}>No Programs Yet</h3>
              <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>Add airline, hotel, or other loyalty accounts for {clientName}.</p>
              <button className="btn-teal" onClick={openAdd} style={{ borderRadius: 4, padding: '12px 28px' }}>+ Add First Program</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {programs.map(p => (
                <ProgramCard key={p.id} prog={p} onEdit={openEdit} onDelete={deleteProgram} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 540, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.25)' }}>
            {/* Form header */}
            <div style={{ padding: '22px 28px', borderBottom: '1px solid rgba(196,154,10,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: 'var(--teal)', marginBottom: 4 }}>
                  {editing ? 'EDIT PROGRAM' : 'NEW PROGRAM'}
                </div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, color: 'var(--text-rich)', fontWeight: 300, margin: 0 }}>
                  {editing ? editing.provider : 'Add Loyalty Program'}
                </h3>
              </div>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
            </div>

            <div style={{ padding: 28 }}>
              {saveError && (
                <div style={{ padding: '12px 16px', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.3)', color: 'var(--danger)', borderRadius: 4, marginBottom: 20, fontSize: 14 }}>
                  ⚠ {saveError}
                </div>
              )}

              {/* Program Type */}
              <div style={{ marginBottom: 16 }}>
                <label className="lux-label">Program Type</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {PROGRAM_TYPES.map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm(p => ({ ...p, program_type: t, provider: '' }))}
                      style={{
                        padding: '6px 12px', borderRadius: 20, border: '1.5px solid',
                        borderColor:    form.program_type === t ? 'var(--teal)'  : 'rgba(196,154,10,0.3)',
                        background:     form.program_type === t ? 'rgba(14,143,143,0.1)' : 'white',
                        color:          form.program_type === t ? 'var(--teal-dark)' : 'var(--muted)',
                        cursor: 'pointer', fontSize: 12, fontFamily: 'Cinzel, serif', letterSpacing: 1,
                        transition: 'all 0.15s',
                      }}>
                      {ICON_MAP[t]} {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Provider */}
              <div style={{ marginBottom: 16 }}>
                <label className="lux-label">Provider / Airline Name *</label>
                <input
                  className="luxury-input"
                  style={{ borderRadius: 4 }}
                  placeholder={`e.g. ${suggestions[0] || 'Provider name'}`}
                  value={form.provider === '__UNCHANGED__' ? '' : form.provider}
                  onChange={e => setForm(p => ({ ...p, provider: e.target.value }))}
                />
                {suggestions.length > 0 && !form.provider && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                    {suggestions.slice(0, 6).map(s => (
                      <button key={s} type="button" onClick={() => setForm(p => ({ ...p, provider: s }))}
                        style={{ fontSize: 11, padding: '3px 10px', background: 'rgba(14,143,143,0.06)', border: '1px solid rgba(14,143,143,0.2)', borderRadius: 10, color: 'var(--teal-dark)', cursor: 'pointer' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Program Name + Tier */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <div style={{ marginBottom: 16 }}>
                  <label className="lux-label">Program / Rewards Name</label>
                  <input className="luxury-input" style={{ borderRadius: 4 }} placeholder="e.g. AAdvantage"
                    value={form.program_name} onChange={e => setForm(p => ({ ...p, program_name: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="lux-label">Status / Tier</label>
                  <input className="luxury-input" style={{ borderRadius: 4 }} placeholder="e.g. Platinum, Gold"
                    value={form.tier} onChange={e => setForm(p => ({ ...p, tier: e.target.value }))} />
                </div>
              </div>

              {/* Membership Number */}
              <div style={{ marginBottom: 16 }}>
                <label className="lux-label">Membership / Rewards Number</label>
                <input className="luxury-input" style={{ borderRadius: 4, fontFamily: 'monospace', letterSpacing: 1 }}
                  placeholder="e.g. AA123456789"
                  value={form.membership_number} onChange={e => setForm(p => ({ ...p, membership_number: e.target.value }))} />
              </div>

              {/* Username */}
              <div style={{ marginBottom: 16 }}>
                <label className="lux-label">Username / Login Email</label>
                <input className="luxury-input" style={{ borderRadius: 4 }}
                  placeholder="e.g. client@email.com or username"
                  value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label className="lux-label" style={{ marginBottom: 0 }}>
                    Password {editing && <span style={{ color: 'var(--muted)', fontSize: 10, fontFamily: 'Lato, sans-serif', letterSpacing: 0 }}>(leave blank to keep existing)</span>}
                  </label>
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--teal)', padding: 0 }}>
                    {showPass ? '🙈 Hide' : '👁 Show'}
                  </button>
                </div>
                <input
                  className="luxury-input"
                  style={{ borderRadius: 4, fontFamily: 'monospace' }}
                  type={showPass ? 'text' : 'password'}
                  placeholder={editing ? '••••••• (unchanged)' : 'Enter password'}
                  value={form.password === '__UNCHANGED__' ? '' : form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value || (editing ? '__UNCHANGED__' : '') }))}
                  autoComplete="new-password"
                />
                <div style={{ fontSize: 11, color: 'var(--teal)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  🔐 Encrypted with AES-256-GCM before saving
                </div>
              </div>

              {/* PIN */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label className="lux-label" style={{ marginBottom: 0 }}>
                    PIN <span style={{ color: 'var(--muted)', fontSize: 10, fontFamily: 'Lato, sans-serif', letterSpacing: 0 }}>(optional)</span>
                  </label>
                  <button type="button" onClick={() => setShowPin(s => !s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--teal)', padding: 0 }}>
                    {showPin ? '🙈 Hide' : '👁 Show'}
                  </button>
                </div>
                <input
                  className="luxury-input"
                  style={{ borderRadius: 4, fontFamily: 'monospace' }}
                  type={showPin ? 'text' : 'password'}
                  placeholder={editing ? '••••• (unchanged)' : 'Enter PIN if applicable'}
                  value={form.pin === '__UNCHANGED__' ? '' : form.pin}
                  onChange={e => setForm(p => ({ ...p, pin: e.target.value || (editing ? '__UNCHANGED__' : '') }))}
                  autoComplete="new-password"
                />
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 24 }}>
                <label className="lux-label">Notes</label>
                <textarea className="luxury-input" style={{ borderRadius: 4, resize: 'vertical' }} rows={2}
                  placeholder="Any special notes, expiry dates, etc."
                  value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-teal" style={{ flex: 1, borderRadius: 4, opacity: saving ? 0.7 : 1 }}
                  onClick={save} disabled={saving}>
                  {saving ? 'Saving...' : editing ? '✓ Update Program' : '+ Add Program'}
                </button>
                <button className="btn-ghost" style={{ borderRadius: 4 }} onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
