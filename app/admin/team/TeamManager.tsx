'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const ROLES = [
  { value: 'admin', label: 'Owner', color: 'badge-teal', desc: 'Full access to everything' },
  { value: 'manager', label: 'Manager', color: 'badge-gold', desc: 'Manage clients, bookings, content' },
  { value: 'employee', label: 'Employee', color: 'badge-coral', desc: 'View clients and bookings only' },
]

export default function TeamManager({ initialTeam }: { initialTeam: any[] }) {
  const [team, setTeam] = useState(initialTeam)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', role: 'employee' })
  const [saving, setSaving] = useState(false)
  const [forcing, setForcing] = useState<string | null>(null)
  const [saved, setSaved] = useState('')
  const [warning, setWarning] = useState('')
  const [error, setError] = useState('')
  const supabase = createClient()

  const invite = async () => {
    if (!form.email || !form.full_name) { setError('Name and email are required'); return }
    setSaving(true); setError(''); setSaved(''); setWarning('')
    try {
      const res = await fetch('/api/invite-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to invite')
      setModal(false)
      setForm({ full_name: '', email: '', role: 'employee' })
      const { data } = await supabase.from('profiles').select('*').in('role', ['admin', 'manager', 'employee'])
      setTeam(data || [])
      if (result.emailWarning) setWarning(result.emailWarning)
      else setSaved(`✓ Invite sent to ${form.email}! They'll be prompted to set their own password on first login.`)
    } catch (e: any) { setError(e.message) }
    setSaving(false)
  }

  const forcePasswordChange = async (userId: string, name: string) => {
    if (!confirm(`Force ${name} to change their password on next login?`)) return
    setForcing(userId)
    try {
      const res = await fetch('/api/force-password-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed')
      setSaved(`✓ ${name} will be prompted to change their password on next login.`)
    } catch (e: any) { setWarning(e.message) }
    setForcing(null)
  }

  const forceAllPasswordChange = async () => {
    const nonAdmins = team.filter(m => m.role !== 'admin')
    if (nonAdmins.length === 0) { setSaved('No managers or employees to update.'); return }
    if (!confirm(`Force all ${nonAdmins.length} manager(s) and employee(s) to change their password on next login?`)) return
    setForcing('all')
    try {
      const res = await fetch('/api/force-password-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'all' })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed')
      setSaved(`✓ ${result.message}`)
    } catch (e: any) { setWarning(e.message) }
    setForcing(null)
  }

  const updateRole = async (id: string, role: string) => {
    await supabase.from('profiles').update({ role }).eq('id', id)
    setTeam(p => p.map(m => m.id === id ? { ...m, role } : m))
  }

  const getRoleInfo = (role: string) => ROLES.find(r => r.value === role) || ROLES[2]

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: 'var(--teal)', marginBottom: 8, fontWeight: 600 }}>ADMIN</div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 300, color: 'var(--text-rich)' }}>
            Team <em style={{ color: 'var(--teal-dark)' }}>Management</em>
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 15, marginTop: 6 }}>Manage admin team members and their access levels.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignSelf: 'flex-end', flexWrap: 'wrap' }}>
          {team.some(m => m.role !== 'admin') && (
            <button
              className="btn-ghost"
              style={{ borderRadius: 4, padding: '11px 20px', fontSize: 11, opacity: forcing === 'all' ? 0.6 : 1 }}
              onClick={forceAllPasswordChange}
              disabled={forcing === 'all'}
              title="Forces all managers and employees to set a new password on their next login">
              {forcing === 'all' ? 'Updating...' : '🔒 Force All to Reset Password'}
            </button>
          )}
          <button className="btn-teal" onClick={() => { setModal(true); setError(''); setWarning('') }} style={{ borderRadius: 4, padding: '12px 28px' }}>
            + Invite Team Member
          </button>
        </div>
      </div>

      {/* Feedback banners */}
      {saved && (
        <div style={{ padding: '14px 18px', background: 'rgba(26,122,74,0.1)', border: '1px solid rgba(26,122,74,0.3)', color: 'var(--success)', borderRadius: 4, marginBottom: 20, fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{saved}</span>
          <button onClick={() => setSaved('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--success)', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
      )}
      {warning && (
        <div style={{ padding: '14px 18px', background: 'rgba(196,154,10,0.08)', border: '2px solid rgba(196,154,10,0.35)', color: 'var(--gold-dark)', borderRadius: 4, marginBottom: 20, fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠ {warning}</span>
          <button onClick={() => setWarning('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold-dark)', fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* Role Legend */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {ROLES.map(r => (
          <div key={r.value} style={{ background: 'white', borderRadius: 8, padding: '20px 24px', border: '1px solid rgba(196,154,10,0.2)' }}>
            <span className={`badge ${r.color}`} style={{ marginBottom: 10, display: 'inline-block' }}>{r.label}</span>
            <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>{r.desc}</p>
            <div style={{ fontSize: 12, color: 'var(--teal-dark)', marginTop: 8, fontFamily: 'Cinzel, serif', letterSpacing: 1 }}>
              {team.filter(m => m.role === r.value).length} member{team.filter(m => m.role === r.value).length !== 1 ? 's' : ''}
            </div>
          </div>
        ))}
      </div>

      {/* Team Table */}
      <div style={{ background: 'white', borderRadius: 8, border: '1px solid rgba(196,154,10,0.2)', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
        {team.length === 0 ? (
          <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--muted)', fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontStyle: 'italic' }}>
            No team members yet
          </div>
        ) : (
          <table className="lux-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Change Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {team.map(m => {
                const roleInfo = getRoleInfo(m.role)
                const isForcing = forcing === m.id
                return (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal-dark), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Cinzel, serif', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                          {m.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '?'}
                        </div>
                        <div style={{ fontWeight: 600 }}>{m.full_name || '—'}</div>
                      </div>
                    </td>
                    <td style={{ fontSize: 14 }}>{m.email}</td>
                    <td><span className={`badge ${roleInfo.color}`}>{roleInfo.label}</span></td>
                    <td style={{ fontSize: 13, color: 'var(--muted)' }}>
                      {m.created_at ? new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td>
                      <select value={m.role} onChange={e => updateRole(m.id, e.target.value)}
                        style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, border: '1.5px solid var(--border)', borderRadius: 4, padding: '6px 10px', background: 'white', color: 'var(--teal-dark)', cursor: 'pointer', outline: 'none' }}>
                        {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </td>
                    <td>
                      {m.role !== 'admin' && (
                        <button
                          onClick={() => forcePasswordChange(m.id, m.full_name || m.email)}
                          disabled={isForcing}
                          style={{ background: isForcing ? 'rgba(196,154,10,0.06)' : 'rgba(196,154,10,0.08)', border: '1.5px solid rgba(196,154,10,0.3)', color: 'var(--gold-dark)', borderRadius: 4, padding: '6px 12px', cursor: isForcing ? 'not-allowed' : 'pointer', fontSize: 11, fontFamily: 'Cinzel, serif', letterSpacing: 1, fontWeight: 600, whiteSpace: 'nowrap', opacity: isForcing ? 0.6 : 1 }}
                          title="Forces this person to set a new password on their next login">
                          {isForcing ? '...' : '🔒 Force Reset'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Invite Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setModal(false) }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 500, boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(196,154,10,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: 'var(--teal)', marginBottom: 4, fontWeight: 700 }}>TEAM ACCESS</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, color: 'var(--text-rich)', fontWeight: 300 }}>Invite Team Member</h3>
              </div>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
            </div>
            <div style={{ padding: 28 }}>
              {error && <div style={{ padding: '12px 16px', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.3)', color: 'var(--danger)', borderRadius: 4, marginBottom: 20, fontSize: 14 }}>{error}</div>}
              <div style={{ marginBottom: 20 }}>
                <label className="lux-label">Full Name *</label>
                <input className="luxury-input" style={{ borderRadius: 4 }} placeholder="e.g. Sarah Johnson"
                  value={form.full_name} onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="lux-label">Email Address *</label>
                <input className="luxury-input" style={{ borderRadius: 4 }} type="email" placeholder="team@fhjdream.com"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div style={{ marginBottom: 28 }}>
                <label className="lux-label">Access Level</label>
                <select className="luxury-input" style={{ borderRadius: 4 }} value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
                  ))}
                </select>
              </div>
              <div style={{ background: 'rgba(14,143,143,0.06)', border: '1px solid rgba(14,143,143,0.2)', borderRadius: 6, padding: '12px 16px', marginBottom: 24 }}>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
                  📧 They'll receive their login details by email and will be <strong>required to set their own password</strong> on first sign-in.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button className="btn-ghost" style={{ borderRadius: 4, padding: '11px 28px' }} onClick={() => setModal(false)}>Cancel</button>
                <button className="btn-teal" style={{ borderRadius: 4, padding: '11px 36px', opacity: saving ? 0.7 : 1 }} onClick={invite} disabled={saving}>
                  {saving ? 'Sending...' : 'Send Invite ✦'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
