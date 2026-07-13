'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Field = { key: string; label: string; type?: string; full?: boolean; options?: string[] }

const SECTIONS: { title: string; fields: Field[] }[] = [
  {
    title: 'Contact Details',
    fields: [
      { key: 'full_name', label: 'Full Name' },
      { key: 'phone', label: 'Phone Number', type: 'tel' },
      { key: 'preferred_contact', label: 'Preferred Contact Method', options: ['Email', 'Phone', 'Text'] },
      { key: 'nationality', label: 'Nationality' },
    ],
  },
  {
    title: 'Mailing Address',
    fields: [
      { key: 'address', label: 'Street Address', full: true },
      { key: 'city', label: 'City' },
      { key: 'state', label: 'State / Province' },
      { key: 'zip', label: 'ZIP / Postal Code' },
      { key: 'country', label: 'Country' },
    ],
  },
  {
    title: 'Travel Preferences',
    fields: [
      { key: 'dietary_reqs', label: 'Dietary Requirements', full: true },
      { key: 'medical_needs', label: 'Medical Needs / Accessibility', full: true },
    ],
  },
  {
    title: 'Emergency Contact',
    fields: [
      { key: 'emergency_name', label: 'Contact Name' },
      { key: 'emergency_phone', label: 'Contact Phone', type: 'tel' },
      { key: 'emergency_relation', label: 'Relationship' },
    ],
  },
]

const EDITABLE = SECTIONS.flatMap(s => s.fields.map(f => f.key))

export default function ProfileClient({ profile }: { profile: any }) {
  const supabase = createClient()
  const [form, setForm] = useState<any>(() => {
    const init: any = {}
    EDITABLE.forEach(k => { init[k] = profile?.[k] ?? '' })
    return init
  })
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const set = (k: string, v: string) => { setForm((f: any) => ({ ...f, [k]: v })); setStatus('idle') }

  const save = async () => {
    setSaving(true)
    setStatus('idle')
    const payload: any = {}
    EDITABLE.forEach(k => { payload[k] = form[k]?.trim ? form[k].trim() : form[k] })
    const { error } = await supabase.from('profiles').update(payload).eq('id', profile.id)
    setSaving(false)
    if (error) { setStatus('error'); setMessage(error.message); return }
    setStatus('saved'); setMessage('Your profile has been updated.')
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease', maxWidth: 760 }}>
      <div style={{ marginBottom: 32 }}>
        <div className="section-eyebrow" style={{ marginBottom: 8 }}>Your Account</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 300 }}>
          My <em style={{ color: 'var(--gold)' }}>Profile</em>
        </h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', marginTop: 8 }}>
          Keeping this current helps us book smoothly and reach you if plans change.
        </p>
      </div>

      {profile?.email && (
        <div className="luxury-card" style={{ padding: 20, marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 2, color: 'var(--muted)', marginBottom: 4 }}>SIGN-IN EMAIL</div>
            <div style={{ fontSize: 15, color: 'var(--text)' }}>{profile.email}</div>
          </div>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>To change your email, message your advisor.</span>
        </div>
      )}

      {SECTIONS.map(section => (
        <div key={section.title} className="luxury-card" style={{ padding: 24, marginBottom: 18 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--gold)', marginBottom: 18, fontWeight: 700 }}>{section.title.toUpperCase()}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {section.fields.map(f => (
              <div key={f.key} style={{ gridColumn: f.full ? '1 / -1' : 'auto' }}>
                <label className="lux-label">{f.label}</label>
                {f.options ? (
                  <select className="luxury-input" value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)}>
                    <option value="">Select…</option>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input className="luxury-input" type={f.type || 'text'} value={form[f.key] || ''} onChange={e => set(f.key, e.target.value)} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
        <button className="btn-teal" onClick={save} disabled={saving} style={{ padding: '14px 40px', borderRadius: 2, opacity: saving ? 0.7 : 1 }}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {status === 'saved' && <span style={{ color: 'var(--success)', fontSize: 14 }}>✓ {message}</span>}
        {status === 'error' && <span style={{ color: 'var(--danger)', fontSize: 14 }}>{message}</span>}
      </div>
    </div>
  )
}
