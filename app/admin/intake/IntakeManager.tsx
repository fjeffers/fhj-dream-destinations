'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { IntakeRequest } from '@/lib/types'

const isValidEmail = (e: string | null | undefined) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((e || '').trim())

export default function IntakeManager({
  initialRequests,
  clientEmails = [],
}: {
  initialRequests: IntakeRequest[]
  clientEmails?: string[]
}) {
  const [requests, setRequests] = useState(initialRequests)
  const [viewing, setViewing] = useState<IntakeRequest | null>(null)
  // Show everything by default — an approved request must never vanish from view.
  const [filter, setFilter] = useState('all')
  const [processing, setProcessing] = useState<string | null>(null)
  const [banner, setBanner] = useState<{ kind: 'error' | 'success'; text: string } | null>(null)
  const [emailDraft, setEmailDraft] = useState('')
  const [savingEmail, setSavingEmail] = useState(false)
  const supabase = createClient()

  // An approved request with no matching portal account means the invite failed.
  const hasAccount = (r: IntakeRequest) => clientEmails.includes((r.email || '').toLowerCase())
  const isOrphan = (r: IntakeRequest) => r.status === 'Approved' && !hasAccount(r)

  const saveEmail = async (r: IntakeRequest) => {
    const email = emailDraft.trim()
    if (!isValidEmail(email)) { setBanner({ kind: 'error', text: 'Enter a complete email address, e.g. name@gmail.com' }); return }
    setSavingEmail(true)
    const { data, error } = await supabase.from('intake_requests').update({ email }).eq('id', r.id).select().single()
    setSavingEmail(false)
    if (error) { setBanner({ kind: 'error', text: `Could not save email: ${error.message}` }); return }
    setRequests(p => p.map(x => x.id === r.id ? data : x))
    setViewing(data)
    setEmailDraft('')
    setBanner({ kind: 'success', text: `Email updated to ${email}. You can approve this request now.` })
  }

  const updateStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    const req = requests.find(r => r.id === id)
    if (!req) return
    setBanner(null)

    // Guard the common failure: approving with a malformed email silently fails to
    // create the account. Refuse up front instead of marking it Approved for nothing.
    if (status === 'Approved' && !isValidEmail(req.email)) {
      setBanner({ kind: 'error', text: `"${req.first_name} ${req.last_name}" has an invalid email (${req.email || 'blank'}). Open the request, fix the email, then approve.` })
      setViewing(req)
      setEmailDraft(req.email || '')
      return
    }

    setProcessing(id)
    const { data } = await supabase.from('intake_requests').update({ status }).eq('id', id).select().single()
    if (data) setRequests(p => p.map(r => r.id === id ? data : r))
    if (viewing?.id === id) setViewing(data)

    // When approved, invite client via API to create their portal account.
    if (status === 'Approved' && data) {
      let failure: string | null = null
      try {
        const res = await fetch('/api/invite-client', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: `${data.first_name} ${data.last_name}`,
            email: data.email,
            phone: data.phone || '',
            tier: 'Silver',
            notes: `Intake approved. Destination: ${data.destination || '—'}`
          })
        })
        const body = await res.json().catch(() => ({}))
        if (!res.ok) failure = body.error || `Invite failed (${res.status})`
        else if (body.emailWarning) setBanner({ kind: 'success', text: `Account created. ${body.emailWarning}` })
        else setBanner({ kind: 'success', text: `${data.first_name} ${data.last_name} approved — portal account created and welcome email sent.` })
      } catch (err) {
        failure = err instanceof Error ? err.message : 'Network error'
      }

      // Don't leave a request marked Approved when no account exists — put it back
      // to Pending so it stays actionable and say exactly what went wrong.
      if (failure) {
        const { data: reverted } = await supabase.from('intake_requests').update({ status: 'Pending' }).eq('id', id).select().single()
        if (reverted) {
          setRequests(p => p.map(r => r.id === id ? reverted : r))
          if (viewing?.id === id) setViewing(reverted)
        }
        setBanner({ kind: 'error', text: `Could not create the account for ${data.first_name} ${data.last_name}: ${failure}. The request was left Pending — fix the details and try again.` })
      }
    }

    setProcessing(null)
  }

  const filtered = requests.filter(r => filter === 'all' || r.status === filter)

  const statusBadge = (s: string) => s === 'Approved' ? 'badge-success' : s === 'Rejected' ? 'badge-danger' : 'badge-gold'

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <div className="section-eyebrow" style={{ marginBottom: 6 }}>New Inquiries</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 38, fontWeight: 300 }}>
          Intake <em style={{ color: 'var(--gold)' }}>Requests</em>
        </h2>
      </div>

      {banner && (
        <div style={{
          marginBottom: 16, padding: '12px 16px', fontSize: 13, lineHeight: 1.6,
          border: `1px solid ${banner.kind === 'error' ? 'rgba(220,80,80,0.4)' : 'rgba(14,143,143,0.35)'}`,
          background: banner.kind === 'error' ? 'rgba(220,80,80,0.08)' : 'rgba(14,143,143,0.08)',
          color: banner.kind === 'error' ? '#e08a8a' : 'var(--text)',
          display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start',
        }}>
          <span>{banner.text}</span>
          <button onClick={() => setBanner(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
        </div>
      )}

      {requests.some(isOrphan) && (
        <div style={{ marginBottom: 16, padding: '12px 16px', fontSize: 13, lineHeight: 1.6, border: '1px solid rgba(201,168,76,0.45)', background: 'rgba(201,168,76,0.08)', color: 'var(--text)' }}>
          <strong style={{ color: 'var(--gold)' }}>Needs attention:</strong>{' '}
          {requests.filter(isOrphan).length} approved request{requests.filter(isOrphan).length !== 1 ? 's have' : ' has'} no portal account —
          usually a bad email address. Open{' '}
          {requests.filter(isOrphan).map(r => `${r.first_name} ${r.last_name}`).join(', ')}, fix the email, then press Create Account.
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['all', requests.length], ['Pending', requests.filter(r => r.status === 'Pending').length], ['Approved', requests.filter(r => r.status === 'Approved').length], ['Rejected', requests.filter(r => r.status === 'Rejected').length]].map(([val, count]) => (
          <button key={val} onClick={() => setFilter(String(val))} style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, padding: '7px 16px', border: `1px solid ${filter === val ? 'var(--gold)' : 'var(--border)'}`, background: filter === val ? 'rgba(201,168,76,0.1)' : 'transparent', color: filter === val ? 'var(--gold)' : 'var(--muted)', cursor: 'pointer', transition: 'all 0.2s' }}>
            {val === 'all' ? 'ALL' : String(val).toUpperCase()} ({count})
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: viewing ? '1fr 420px' : '1fr', gap: 20 }}>
        <div className="luxury-card" style={{ overflow: 'hidden' }}>
          <table className="lux-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Destination</th>
                <th>Budget</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => { setViewing(r); setEmailDraft(r.email || '') }}>
                  <td style={{ fontWeight: 500 }}>{r.first_name} {r.last_name}</td>
                  <td style={{ fontSize: 12, color: isValidEmail(r.email) ? 'var(--muted)' : '#e08a8a' }}>
                    {r.email || '—'}{!isValidEmail(r.email) && ' ⚠'}
                  </td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{r.destination || '—'}</td>
                  <td style={{ fontSize: 12 }}>{r.budget || '—'}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{r.created_at?.split('T')[0]}</td>
                  <td>
                    <span className={`badge ${statusBadge(r.status)}`}>{r.status}</span>
                    {isOrphan(r) && <span className="badge badge-danger" style={{ marginLeft: 6 }}>NO ACCOUNT</span>}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    {r.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-gold btn-sm" disabled={processing === r.id}
                          onClick={() => updateStatus(r.id, 'Approved')}
                          style={{ opacity: processing === r.id ? 0.7 : 1 }}>
                          Approve
                        </button>
                        <button className="btn-danger" disabled={processing === r.id}
                          onClick={() => updateStatus(r.id, 'Rejected')}>
                          Reject
                        </button>
                      </div>
                    )}
                    {isOrphan(r) && (
                      <button className="btn-gold btn-sm" disabled={processing === r.id}
                        onClick={() => updateStatus(r.id, 'Approved')}
                        style={{ opacity: processing === r.id ? 0.7 : 1 }}>
                        Create Account
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>
                    No {filter === 'all' ? '' : filter.toLowerCase()} requests
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Detail panel */}
        {viewing && (
          <div className="luxury-card" style={{ padding: 24, overflowY: 'auto', maxHeight: '80vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, color: 'var(--gold)' }}>REQUEST DETAILS</div>
              <button onClick={() => setViewing(null)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 18 }}>×</button>
            </div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, marginBottom: 4 }}>{viewing.first_name} {viewing.last_name}</h3>
            <span className={`badge ${statusBadge(viewing.status)}`} style={{ marginBottom: 20, display: 'inline-block' }}>{viewing.status}</span>
            {isOrphan(viewing) && <span className="badge badge-danger" style={{ marginLeft: 6 }}>NO ACCOUNT</span>}
            <div className="gold-line" style={{ marginBottom: 20 }} />

            {/* Email is the one field that must be right before an account can be
                created, so it's editable here instead of read-only below. */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--gold)', marginBottom: 8 }}>
                LOGIN EMAIL {!isValidEmail(viewing.email) && <span style={{ color: '#e08a8a' }}>— INVALID, FIX TO CONTINUE</span>}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  value={emailDraft}
                  onChange={e => setEmailDraft(e.target.value)}
                  placeholder="name@example.com"
                  style={{ flex: 1, minWidth: 0, background: 'rgba(255,255,255,0.04)', border: `1px solid ${isValidEmail(emailDraft) ? 'var(--border)' : 'rgba(220,80,80,0.5)'}`, color: 'var(--text)', padding: '8px 10px', fontSize: 13 }}
                />
                <button className="btn-ghost" disabled={savingEmail || emailDraft.trim() === (viewing.email || '')}
                  onClick={() => saveEmail(viewing)}>
                  {savingEmail ? '…' : 'Save'}
                </button>
              </div>
            </div>

            {[
              ['Contact', [['Email', viewing.email], ['Phone', viewing.phone], ['Preferred Contact', viewing.preferred_contact]]],
              ['Travel', [['Destination', viewing.destination], ['Dates', `${viewing.travel_dates || '—'} → ${viewing.return_date || '—'}`], ['Group Size', viewing.group_size], ['Budget', viewing.budget], ['Accommodation', viewing.accommodation]]],
              ['Personal', [['DOB', viewing.dob], ['Passport', viewing.passport_num], ['Nationality', viewing.nationality]]],
              ['Emergency', [['Contact', viewing.emergency_name], ['Phone', viewing.emergency_phone], ['Relation', viewing.emergency_relation]]],
            ].map(([section, fields]: any) => (
              <div key={section} style={{ marginBottom: 18 }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--gold)', marginBottom: 10 }}>{section.toUpperCase()}</div>
                {fields.map(([label, val]: any) => val && (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12 }}>
                    <span style={{ color: 'var(--muted)' }}>{label}</span>
                    <span style={{ color: 'var(--text)', textAlign: 'right', maxWidth: '60%' }}>{String(val)}</span>
                  </div>
                ))}
              </div>
            ))}

            {(viewing.experience_types?.length ?? 0) > 0 && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--gold)', marginBottom: 10 }}>INTERESTS</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(viewing.experience_types ?? []).map(e => <span key={e} className="badge badge-teal">{e}</span>)}
                </div>
              </div>
            )}

            {viewing.notes && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--gold)', marginBottom: 8 }}>NOTES</div>
                <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.7 }}>{viewing.notes}</p>
              </div>
            )}

            {viewing.status === 'Pending' && (
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button className="btn-gold" style={{ flex: 1 }} disabled={processing === viewing.id}
                  onClick={() => updateStatus(viewing.id, 'Approved')}>
                  {processing === viewing.id ? '...' : 'Approve Client'}
                </button>
                <button className="btn-ghost" disabled={processing === viewing.id}
                  onClick={() => updateStatus(viewing.id, 'Rejected')}>
                  Reject
                </button>
              </div>
            )}

            {isOrphan(viewing) && (
              <div style={{ marginTop: 20 }}>
                <p style={{ fontSize: 12, color: '#e08a8a', lineHeight: 1.6, marginBottom: 10 }}>
                  This request is approved but no portal account exists. Fix the email above if needed, then create the account.
                </p>
                <button className="btn-gold" style={{ width: '100%' }} disabled={processing === viewing.id}
                  onClick={() => updateStatus(viewing.id, 'Approved')}>
                  {processing === viewing.id ? '...' : 'Create Account & Send Welcome Email'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}