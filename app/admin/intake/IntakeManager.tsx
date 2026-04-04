'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { IntakeRequest } from '@/lib/types'

export default function IntakeManager({ initialRequests }: { initialRequests: IntakeRequest[] }) {
  const [requests, setRequests] = useState(initialRequests)
  const [viewing, setViewing] = useState<IntakeRequest | null>(null)
  const [filter, setFilter] = useState('Pending')
  const [processing, setProcessing] = useState<string | null>(null)
  const supabase = createClient()

  const updateStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    setProcessing(id)
    const { data } = await supabase.from('intake_requests').update({ status }).eq('id', id).select().single()
    if (data) setRequests(p => p.map(r => r.id === id ? data : r))
    if (viewing?.id === id) setViewing(data)
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

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['Pending', requests.filter(r => r.status === 'Pending').length], ['Approved', requests.filter(r => r.status === 'Approved').length], ['Rejected', requests.filter(r => r.status === 'Rejected').length], ['all', requests.length]].map(([val, count]) => (
          <button key={val} onClick={() => setFilter(String(val))} style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, padding: '7px 16px', border: `1px solid ${filter === val ? 'var(--gold)' : 'var(--border)'}`, background: filter === val ? 'rgba(201,168,76,0.1)' : 'transparent', color: filter === val ? 'var(--gold)' : 'var(--muted)', cursor: 'pointer', transition: 'all 0.2s' }}>
            {val === 'all' ? 'ALL' : String(val).toUpperCase()} ({count})
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: viewing ? '1fr 420px' : '1fr', gap: 20 }}>
        <div className="luxury-card" style={{ overflow: 'hidden' }}>
          <table className="lux-table">
            <thead><tr><th>Name</th><th>Email</th><th>Destination</th><th>Budget</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} style={{ cursor: 'pointer' }} onClick={() => setViewing(r)}>
                  <td style={{ fontWeight: 500 }}>{r.first_name} {r.last_name}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{r.email}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{r.destination || '—'}</td>
                  <td style={{ fontSize: 12 }}>{r.budget || '—'}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 12 }}>{r.created_at?.split('T')[0]}</td>
                  <td><span className={`badge ${statusBadge(r.status)}`}>{r.status}</span></td>
                  <td onClick={e => e.stopPropagation()}>
                    {r.status === 'Pending' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-gold btn-sm" disabled={processing === r.id} onClick={() => updateStatus(r.id, 'Approved')} style={{ opacity: processing === r.id ? 0.7 : 1 }}>Approve</button>
                        <button className="btn-danger" disabled={processing === r.id} onClick={() => updateStatus(r.id, 'Rejected')}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 32 }}>No {filter === 'all' ? '' : filter.toLowerCase()} requests</td></tr>}
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
            <div className="gold-line" style={{ marginBottom: 20 }} />

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
                <button className="btn-gold" style={{ flex: 1 }} disabled={processing === viewing.id} onClick={() => updateStatus(viewing.id, 'Approved')}>
                  {processing === viewing.id ? '...' : 'Approve Client'}
                </button>
                <button className="btn-ghost" disabled={processing === viewing.id} onClick={() => updateStatus(viewing.id, 'Rejected')}>Reject</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

