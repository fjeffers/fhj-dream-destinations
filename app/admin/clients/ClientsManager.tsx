'use client'
import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

export default function ClientsManager({ initialClients }: { initialClients: Profile[] }) {
  const [clients, setClients] = useState(initialClients)
  const [modal, setModal] = useState(false)
  const [inviteModal, setInviteModal] = useState(false)
  const [editing, setEditing] = useState<Profile | null>(null)
  const [form, setForm] = useState<any>({})
  const [inviteForm, setInviteForm] = useState({ full_name: '', email: '', tier: 'Silver', phone: '', notes: '' })
  const [inviting, setInviting] = useState(false)
  const [inviteSent, setInviteSent] = useState('')
  const [inviteError, setInviteError] = useState('')
  const [search, setSearch] = useState('')
  const [tierFilter, setTierFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const supabase = createClient()

  const sendInvite = async () => {
    if (!inviteForm.email || !inviteForm.full_name) { setInviteError('Name and email required'); return }
    setInviting(true); setInviteError('')
    try {
      const res = await fetch('/api/invite-client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm)
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Failed to invite')
      setInviteSent(`Invite sent to ${inviteForm.email}!`)
      setInviteModal(false)
      setInviteForm({ full_name: '', email: '', tier: 'Silver', phone: '', notes: '' })
      const { data } = await supabase.from('profiles').select('*').eq('role', 'client').order('created_at', { ascending: false })
      setClients(data || [])
    } catch (e: any) { setInviteError(e.message) }
    setInviting(false)
  }

  const filtered = useMemo(() => {
    let list = [...clients]

    // Search by name, email, phone, city
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.full_name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q) ||
        (c as any).city?.toLowerCase().includes(q) ||
        (c as any).nationality?.toLowerCase().includes(q)
      )
    }

    // Tier filter
    if (tierFilter !== 'All') list = list.filter(c => c.tier === tierFilter)

    // Status filter
    if (statusFilter === 'Approved') list = list.filter(c => c.approved)
    if (statusFilter === 'Pending') list = list.filter(c => !c.approved)

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'name') return (a.full_name || '').localeCompare(b.full_name || '')
      if (sortBy === 'email') return (a.email || '').localeCompare(b.email || '')
      if (sortBy === 'spent') return ((b as any).total_spent || 0) - ((a as any).total_spent || 0)
      if (sortBy === 'trips') return ((b as any).trips_count || 0) - ((a as any).trips_count || 0)
      if (sortBy === 'recent') return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      return 0
    })

    return list
  }, [clients, search, tierFilter, statusFilter, sortBy])

  const openAdd = () => { setEditing(null); setForm({ tier: 'Silver', approved: true }); setModal(true) }
  const openEdit = (c: Profile) => { setEditing(c); setForm({ ...c }); setModal(true) }

  const save = async () => {
    if (editing) {
      const { data } = await supabase.from('profiles').update(form).eq('id', editing.id).select().single()
      if (data) setClients(p => p.map(c => c.id === editing.id ? data : c))
    }
    setModal(false)
  }

  const toggleApproval = async (c: Profile) => {
    const { data } = await supabase.from('profiles').update({ approved: !c.approved }).eq('id', c.id).select().single()
    if (data) setClients(p => p.map(x => x.id === c.id ? data : x))
  }

  const F = (label: string, field: string, type = 'text') => (
    <div style={{ marginBottom: 16 }}>
      <label className="lux-label">{label}</label>
      <input className="luxury-input" style={{ borderRadius: 4 }} type={type}
        value={form[field] || ''} onChange={e => setForm((p: any) => ({ ...p, [field]: e.target.value }))} />
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: 'var(--teal)', marginBottom: 8, fontWeight: 600 }}>ADMIN</div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 300, color: 'var(--text-rich)' }}>
            Client <em style={{ color: 'var(--teal-dark)' }}>Directory</em>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 10, alignSelf: 'flex-end' }}>
          <button className="btn-ghost" style={{ borderRadius: 4, padding: '12px 24px' }} onClick={openAdd}>
            + Manual Add
          </button>
          <button className="btn-teal" style={{ borderRadius: 4, padding: '12px 28px' }} onClick={() => { setInviteModal(true); setInviteError('') }}>
            ✉ Invite Client
          </button>
        </div>
      </div>

      {inviteSent && <div style={{ padding: '12px 16px', background: 'rgba(26,122,74,0.1)', border: '1px solid rgba(26,122,74,0.3)', color: 'var(--success)', borderRadius: 4, marginBottom: 20, fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2 }}>✓ {inviteSent}</div>}

      {/* Invite Modal */}
      {inviteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setInviteModal(false) }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 520, boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(196,154,10,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: 'var(--teal)', marginBottom: 4, fontWeight: 700 }}>CLIENT PORTAL</div>
                <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, color: 'var(--text-rich)', fontWeight: 300 }}>Invite New Client</h3>
              </div>
              <button onClick={() => setInviteModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
            </div>
            <div style={{ padding: 28 }}>
              {inviteError && <div style={{ padding: '12px 16px', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.3)', color: 'var(--danger)', borderRadius: 4, marginBottom: 20, fontSize: 14 }}>{inviteError}</div>}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                <div style={{ marginBottom: 16 }}>
                  <label className="lux-label">Full Name *</label>
                  <input className="luxury-input" style={{ borderRadius: 4 }} placeholder="e.g. Sarah Johnson"
                    value={inviteForm.full_name} onChange={e => setInviteForm(p => ({ ...p, full_name: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="lux-label">Email Address *</label>
                  <input className="luxury-input" style={{ borderRadius: 4 }} type="email" placeholder="client@email.com"
                    value={inviteForm.email} onChange={e => setInviteForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="lux-label">Phone</label>
                  <input className="luxury-input" style={{ borderRadius: 4 }} placeholder="+1 (555) 000-0000"
                    value={inviteForm.phone} onChange={e => setInviteForm(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="lux-label">Tier</label>
                  <select className="luxury-input" style={{ borderRadius: 4 }} value={inviteForm.tier}
                    onChange={e => setInviteForm(p => ({ ...p, tier: e.target.value }))}>
                    <option>Silver</option><option>Gold</option><option>Platinum</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label className="lux-label">Notes</label>
                <textarea className="luxury-input" rows={2} style={{ borderRadius: 4, resize: 'vertical' }} placeholder="How did they find us? Any special notes..."
                  value={inviteForm.notes} onChange={e => setInviteForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <div style={{ background: 'rgba(14,143,143,0.06)', border: '1px solid rgba(14,143,143,0.2)', borderRadius: 6, padding: '12px 16px', marginBottom: 24 }}>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>📧 Client will receive an email invite to set their password and access their personal portal.</p>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button className="btn-ghost" style={{ borderRadius: 4, padding: '11px 28px' }} onClick={() => setInviteModal(false)}>Cancel</button>
                <button className="btn-teal" style={{ borderRadius: 4, padding: '11px 36px', opacity: inviting ? 0.7 : 1 }} onClick={sendInvite} disabled={inviting}>
                  {inviting ? 'Sending...' : '✉ Send Invite'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <div style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, color: 'var(--teal)', pointerEvents: 'none' }}>🔍</div>
        <input
          className="luxury-input"
          style={{ borderRadius: 8, paddingLeft: 48, fontSize: 16, border: '2px solid rgba(14,143,143,0.3)', boxShadow: search ? '0 0 0 4px rgba(14,143,143,0.1)' : 'none', transition: 'all 0.3s' }}
          placeholder="Search by name, email, phone, city..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          autoComplete="off"
        />
        {search && (
          <button onClick={() => setSearch('')}
            style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
        )}
      </div>

      {/* Filters Row */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Tier Filter */}
        <div style={{ display: 'flex', gap: 6 }}>
          {['All', 'Platinum', 'Gold', 'Silver'].map(t => (
            <button key={t} onClick={() => setTierFilter(t)}
              className={tierFilter === t ? 'btn-teal btn-sm' : 'btn-ghost btn-sm'}
              style={{ borderRadius: 4 }}>{t}</button>
          ))}
        </div>

        <div style={{ width: 1, height: 28, background: 'var(--border)' }} />

        {/* Status Filter */}
        <div style={{ display: 'flex', gap: 6 }}>
          {['All', 'Approved', 'Pending'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={statusFilter === s ? 'btn-teal btn-sm' : 'btn-ghost btn-sm'}
              style={{ borderRadius: 4 }}>{s}</button>
          ))}
        </div>

        <div style={{ width: 1, height: 28, background: 'var(--border)' }} />

        {/* Sort */}
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 1, border: '1.5px solid var(--border)', borderRadius: 4, padding: '7px 12px', background: 'white', color: 'var(--teal-dark)', cursor: 'pointer', outline: 'none' }}>
          <option value="name">Sort: Name A–Z</option>
          <option value="email">Sort: Email</option>
          <option value="spent">Sort: Most Spent</option>
          <option value="trips">Sort: Most Trips</option>
          <option value="recent">Sort: Most Recent</option>
        </select>

        {/* Result count */}
        <span style={{ marginLeft: 'auto', fontSize: 14, color: 'var(--muted)' }}>
          {search || tierFilter !== 'All' || statusFilter !== 'All'
            ? <><strong style={{ color: 'var(--teal-dark)' }}>{filtered.length}</strong> of {clients.length} clients</>
            : <><strong style={{ color: 'var(--teal-dark)' }}>{clients.length}</strong> clients</>
          }
        </span>
      </div>

      {/* Search hint */}
      {search && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0', background: 'white', borderRadius: 8, border: '1px solid rgba(196,154,10,0.2)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontStyle: 'italic', color: 'var(--muted)' }}>
            No clients found for "<strong>{search}</strong>"
          </p>
          <button className="btn-ghost btn-sm" style={{ borderRadius: 4, marginTop: 16 }} onClick={() => setSearch('')}>Clear Search</button>
        </div>
      )}

      {/* Client Table */}
      {(!search || filtered.length > 0) && (
        <div style={{ background: 'white', borderRadius: 8, border: '1px solid rgba(196,154,10,0.2)', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
          <table className="lux-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Contact</th>
                <th>Tier</th>
                <th>Activity</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal-dark), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Cinzel, serif', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                        {c.full_name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>{c.full_name || '—'}</div>
                        {(c as any).nationality && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{(c as any).nationality}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: 14 }}>{c.email}</div>
                    {c.phone && <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>{c.phone}</div>}
                    {(c as any).city && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{(c as any).city}{(c as any).state ? `, ${(c as any).state}` : ''}</div>}
                  </td>
                  <td>
                    <span className={`badge ${c.tier === 'Platinum' ? 'badge-teal' : c.tier === 'Gold' ? 'badge-gold' : 'badge-coral'}`}>
                      {c.tier || 'Silver'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontSize: 14 }}><strong>{(c as any).trips_count || 0}</strong> trips</div>
                    <div style={{ fontSize: 13, color: 'var(--gold-dark)' }}>${Number((c as any).total_spent || 0).toLocaleString()}</div>
                  </td>
                  <td>
                    <span className={`badge ${c.approved ? 'badge-success' : 'badge-danger'}`}>
                      {c.approved ? 'Active' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(c)}
                        style={{ background: 'rgba(14,143,143,0.08)', border: '1px solid rgba(14,143,143,0.25)', color: 'var(--teal-dark)', borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontSize: 11, fontFamily: 'Cinzel, serif', letterSpacing: 1, fontWeight: 600 }}>
                        Edit
                      </button>
                      <button onClick={() => toggleApproval(c)}
                        style={{ background: c.approved ? 'rgba(192,57,43,0.08)' : 'rgba(26,122,74,0.1)', border: `1px solid ${c.approved ? 'rgba(192,57,43,0.25)' : 'rgba(26,122,74,0.3)'}`, color: c.approved ? 'var(--danger)' : 'var(--success)', borderRadius: 4, padding: '6px 12px', cursor: 'pointer', fontSize: 11, fontFamily: 'Cinzel, serif', letterSpacing: 1, fontWeight: 600 }}>
                        {c.approved ? 'Suspend' : 'Approve'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) setModal(false) }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,0.2)' }}>
            <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(196,154,10,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, color: 'var(--text-rich)', fontWeight: 300 }}>
                {editing ? 'Edit Client' : 'Add Client'}
              </h3>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
            </div>
            <div style={{ padding: 28 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                {F('Full Name', 'full_name')}
                {F('Email', 'email', 'email')}
                {F('Phone', 'phone', 'tel')}
                {F('Date of Birth', 'dob', 'date')}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="lux-label">Tier</label>
                <select className="luxury-input" style={{ borderRadius: 4 }} value={form.tier || 'Silver'}
                  onChange={e => setForm((p: any) => ({ ...p, tier: e.target.value }))}>
                  <option>Silver</option><option>Gold</option><option>Platinum</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                {F('City', 'city')}
                {F('State', 'state')}
                {F('Country', 'country')}
                {F('Nationality', 'nationality')}
              </div>
              {F('Notes', 'notes')}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 }}>
                <button className="btn-ghost" style={{ borderRadius: 4, padding: '11px 28px' }} onClick={() => setModal(false)}>Cancel</button>
                <button className="btn-teal" style={{ borderRadius: 4, padding: '11px 36px' }} onClick={save}>Save Client</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}