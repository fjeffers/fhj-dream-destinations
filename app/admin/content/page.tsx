'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const SECTIONS = [
  { key: 'site-hero', label: 'Home Hero', icon: '🏠', table: 'site_content', section: 'hero' },
  { key: 'site-nav', label: 'Navigation', icon: '🧭', table: 'site_content', section: 'nav' },
  { key: 'site-footer', label: 'Footer', icon: '📋', table: 'site_content', section: 'footer' },
  { key: 'about-hero', label: 'About Hero', icon: '✨', table: 'about_content', section: 'hero' },
  { key: 'about-mission', label: 'Mission', icon: '🎯', table: 'about_content', section: 'mission' },
  { key: 'about-stats', label: 'Stats', icon: '📊', table: 'about_content', section: 'stats' },
  { key: 'about-team', label: 'Team', icon: '👥', table: 'about_content', section: 'team' },
  { key: 'about-values', label: 'Values', icon: '💎', table: 'about_content', section: 'values' },
]

export default function AdminContentPage() {
  const [active, setActive] = useState('site-hero')
  const [data, setData] = useState<Record<string, any>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => { loadAll() }, [])

  const loadAll = async () => {
    const [site, about] = await Promise.all([
      supabase.from('site_content').select('*'),
      supabase.from('about_content').select('*'),
    ])
    const map: Record<string, any> = {}
    site.data?.forEach(r => { map[`site-${r.section}`] = r.content })
    about.data?.forEach(r => { map[`about-${r.section}`] = r.content })
    setData(map)
  }

  const save = async (content: any) => {
    const sec = SECTIONS.find(s => s.key === active)!
    setSaving(true)
    await supabase.from(sec.table).upsert(
      { section: sec.section, content, updated_at: new Date().toISOString() },
      { onConflict: 'section' }
    )
    setData(p => ({ ...p, [active]: content }))
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const cur = data[active]

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: 'var(--teal)', marginBottom: 8, fontWeight: 600 }}>ADMIN</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 300, color: 'var(--text-rich)' }}>
          Content <em style={{ color: 'var(--teal-dark)' }}>Manager</em>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 16, marginTop: 6 }}>Edit all website and about page content in one place. Changes go live instantly.</p>
      </div>

      <div style={{ display: 'flex', gap: 28 }}>
        <div style={{ width: 200, flexShrink: 0 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 3, color: 'var(--teal)', marginBottom: 8, marginLeft: 4, fontWeight: 700 }}>SITE CONTENT</div>
          {SECTIONS.filter(s => s.key.startsWith('site')).map(s => (
            <button key={s.key} onClick={() => setActive(s.key)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '11px 14px', background: active === s.key ? 'rgba(14,143,143,0.1)' : 'white', border: 'none', borderLeft: `3px solid ${active === s.key ? 'var(--teal)' : 'transparent'}`, fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: active === s.key ? 'var(--teal-dark)' : 'var(--muted)', cursor: 'pointer', marginBottom: 2, fontWeight: active === s.key ? 700 : 400 }}>
              <span>{s.icon}</span> {s.label.toUpperCase()}
            </button>
          ))}
          <div style={{ height: 1, background: 'var(--border)', margin: '16px 4px' }} />
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 3, color: 'var(--teal)', marginBottom: 8, marginLeft: 4, fontWeight: 700 }}>ABOUT PAGE</div>
          {SECTIONS.filter(s => s.key.startsWith('about')).map(s => (
            <button key={s.key} onClick={() => setActive(s.key)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', padding: '11px 14px', background: active === s.key ? 'rgba(14,143,143,0.1)' : 'white', border: 'none', borderLeft: `3px solid ${active === s.key ? 'var(--teal)' : 'transparent'}`, fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: active === s.key ? 'var(--teal-dark)' : 'var(--muted)', cursor: 'pointer', marginBottom: 2, fontWeight: active === s.key ? 700 : 400 }}>
              <span>{s.icon}</span> {s.label.toUpperCase()}
            </button>
          ))}
          <div style={{ marginTop: 24, padding: '14px', background: 'rgba(196,154,10,0.06)', borderRadius: 6, border: '1px solid rgba(196,154,10,0.2)' }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 2, color: 'var(--gold-dark)', marginBottom: 6, fontWeight: 700 }}>💡 TIP</div>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>Changes save instantly to the database and go live on the site.</p>
          </div>
        </div>

        <div style={{ flex: 1, background: 'white', borderRadius: 8, border: '1px solid rgba(196,154,10,0.2)', padding: 32, boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
          {saved && <div style={{ padding: '12px 16px', background: 'rgba(26,122,74,0.1)', border: '1px solid rgba(26,122,74,0.3)', color: 'var(--success)', borderRadius: 4, marginBottom: 20, fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, fontWeight: 700 }}>✓ SAVED — LIVE ON SITE</div>}
          {!cur && <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontStyle: 'italic' }}>Loading...</div>}
          {cur && active === 'site-hero' && <SiteHeroEditor data={cur} onSave={save} saving={saving} />}
          {cur && active === 'site-nav' && <SiteNavEditor data={cur} onSave={save} saving={saving} />}
          {cur && active === 'site-footer' && <SiteFooterEditor data={cur} onSave={save} saving={saving} />}
          {cur && active === 'about-hero' && <AboutHeroEditor data={cur} onSave={save} saving={saving} />}
          {cur && active === 'about-mission' && <AboutMissionEditor data={cur} onSave={save} saving={saving} />}
          {cur && active === 'about-stats' && <AboutStatsEditor data={cur} onSave={save} saving={saving} />}
          {cur && active === 'about-team' && <AboutTeamEditor data={cur} onSave={save} saving={saving} />}
          {cur && active === 'about-values' && <AboutValuesEditor data={cur} onSave={save} saving={saving} />}
        </div>
      </div>
    </div>
  )
}

function F({ label, value, onChange, multiline = false, hint = '' }: any) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label className="lux-label">{label}</label>
      {hint && <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{hint}</p>}
      {multiline
        ? <textarea className="luxury-input" rows={3} value={value || ''} onChange={e => onChange(e.target.value)} style={{ resize: 'vertical', borderRadius: 4 }} />
        : <input className="luxury-input" value={value || ''} onChange={e => onChange(e.target.value)} style={{ borderRadius: 4 }} />}
    </div>
  )
}

function SaveBtn({ saving }: any) {
  return <button className="btn-teal" type="submit" disabled={saving} style={{ borderRadius: 4, padding: '13px 40px', opacity: saving ? 0.7 : 1, marginTop: 8 }}>{saving ? 'Saving...' : 'Save & Publish ✦'}</button>
}

function SiteHeroEditor({ data, onSave, saving }: any) {
  const [d, setD] = useState(data)
  const u = (k: string, v: string) => setD((p: any) => ({ ...p, [k]: v }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(d) }}>
      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, marginBottom: 6, color: 'var(--text-rich)' }}>🏠 Home Page Hero</h3>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>The main headline visitors see first on the home page.</p>
      <F label="Headline Line 1" value={d.headline1} onChange={(v: string) => u('headline1', v)} />
      <F label="Headline Line 2 (italic teal)" value={d.headline2} onChange={(v: string) => u('headline2', v)} />
      <F label="Tagline" value={d.tagline} onChange={(v: string) => u('tagline', v)} />
      <F label="Subtext" value={d.subtext} onChange={(v: string) => u('subtext', v)} multiline />
      <F label="Primary Button Text" value={d.cta_primary} onChange={(v: string) => u('cta_primary', v)} />
      <F label="Secondary Button Text" value={d.cta_secondary} onChange={(v: string) => u('cta_secondary', v)} />
      <SaveBtn saving={saving} />
    </form>
  )
}

function SiteNavEditor({ data, onSave, saving }: any) {
  const [d, setD] = useState(data)
  const u = (k: string, v: string) => setD((p: any) => ({ ...p, [k]: v }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(d) }}>
      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, marginBottom: 6, color: 'var(--text-rich)' }}>🧭 Navigation Bar</h3>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>Brand name shown in the top navigation.</p>
      <F label="Brand Name Line 1" value={d.brand_name} onChange={(v: string) => u('brand_name', v)} />
      <F label="Brand Name Line 2" value={d.brand_sub} onChange={(v: string) => u('brand_sub', v)} />
      <F label="Tagline (shown when not scrolled)" value={d.brand_tagline} onChange={(v: string) => u('brand_tagline', v)} />
      <SaveBtn saving={saving} />
    </form>
  )
}

function SiteFooterEditor({ data, onSave, saving }: any) {
  const [d, setD] = useState(data)
  const u = (k: string, v: string) => setD((p: any) => ({ ...p, [k]: v }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(d) }}>
      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, marginBottom: 6, color: 'var(--text-rich)' }}>📋 Footer</h3>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>Contact info and tagline in the footer.</p>
      <F label="Email Address" value={d.email} onChange={(v: string) => u('email', v)} />
      <F label="Phone Number" value={d.phone} onChange={(v: string) => u('phone', v)} />
      <F label="Locations" value={d.locations} onChange={(v: string) => u('locations', v)} hint="e.g. New York · Miami · LA" />
      <F label="Brand Tagline" value={d.tagline} onChange={(v: string) => u('tagline', v)} multiline />
      <SaveBtn saving={saving} />
    </form>
  )
}

function AboutHeroEditor({ data, onSave, saving }: any) {
  const [d, setD] = useState(data)
  const u = (k: string, v: string) => setD((p: any) => ({ ...p, [k]: v }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(d) }}>
      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, marginBottom: 6, color: 'var(--text-rich)' }}>✨ About Page Hero</h3>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>Top section of the Our Story page.</p>
      <F label="Main Title" value={d.title} onChange={(v: string) => u('title', v)} hint="e.g. The Art of Extraordinary Travel" />
      <F label="Subtitle" value={d.subtitle} onChange={(v: string) => u('subtitle', v)} hint="e.g. Our Heritage" />
      <F label="Tagline Badge" value={d.tagline} onChange={(v: string) => u('tagline', v)} hint="e.g. Est. 2018" />
      <SaveBtn saving={saving} />
    </form>
  )
}

function AboutMissionEditor({ data, onSave, saving }: any) {
  const [d, setD] = useState(data)
  const u = (k: string, v: string) => setD((p: any) => ({ ...p, [k]: v }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(d) }}>
      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, marginBottom: 6, color: 'var(--text-rich)' }}>🎯 Mission Statement</h3>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>Your brand mission and founder quote.</p>
      <F label="Mission Statement" value={d.statement} onChange={(v: string) => u('statement', v)} multiline />
      <F label="Pull Quote" value={d.quote} onChange={(v: string) => u('quote', v)} multiline />
      <SaveBtn saving={saving} />
    </form>
  )
}

function AboutStatsEditor({ data, onSave, saving }: any) {
  const [stats, setStats] = useState<any[]>(Array.isArray(data) ? data : [])
  const update = (i: number, k: string, v: string) => setStats(p => p.map((s, idx) => idx === i ? { ...s, [k]: v } : s))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(stats) }}>
      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, marginBottom: 6, color: 'var(--text-rich)' }}>📊 Stats Bar</h3>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>Numbers shown on the teal stats bar.</p>
      {stats.map((stat, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12, marginBottom: 12, padding: 16, background: 'var(--ivory)', borderRadius: 6 }}>
          <F label={`Number`} value={stat.number} onChange={(v: string) => update(i, 'number', v)} />
          <F label="Label" value={stat.label} onChange={(v: string) => update(i, 'label', v)} />
        </div>
      ))}
      <button type="button" className="btn-ghost btn-sm" style={{ borderRadius: 4, marginBottom: 20 }} onClick={() => setStats(p => [...p, { number: '', label: '' }])}>+ Add Stat</button>
      <div><SaveBtn saving={saving} /></div>
    </form>
  )
}

function AboutTeamEditor({ data, onSave, saving }: any) {
  const [team, setTeam] = useState<any[]>(Array.isArray(data) ? data : [])
  const update = (i: number, k: string, v: string) => setTeam(p => p.map((m, idx) => idx === i ? { ...m, [k]: v } : m))
  const remove = (i: number) => setTeam(p => p.filter((_, idx) => idx !== i))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(team) }}>
      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, marginBottom: 6, color: 'var(--text-rich)' }}>👥 Team Members</h3>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>People shown on the About page.</p>
      {team.map((m, i) => (
        <div key={i} style={{ padding: 20, background: 'var(--ivory)', borderRadius: 8, marginBottom: 16, border: '1px solid rgba(196,154,10,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--teal-dark)', fontWeight: 700 }}>MEMBER {i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="btn-danger" style={{ padding: '4px 10px', fontSize: 11 }}>Remove</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            <F label="Full Name" value={m.name} onChange={(v: string) => update(i, 'name', v)} />
            <F label="Initials" value={m.initials} onChange={(v: string) => update(i, 'initials', v)} />
          </div>
          <F label="Title / Role" value={m.title} onChange={(v: string) => update(i, 'title', v)} />
          <F label="Bio" value={m.bio} onChange={(v: string) => update(i, 'bio', v)} multiline />
        </div>
      ))}
      <button type="button" className="btn-ghost btn-sm" style={{ borderRadius: 4, marginBottom: 20 }} onClick={() => setTeam(p => [...p, { name: '', title: '', initials: '', bio: '' }])}>+ Add Member</button>
      <div><SaveBtn saving={saving} /></div>
    </form>
  )
}

function AboutValuesEditor({ data, onSave, saving }: any) {
  const [vals, setVals] = useState<any[]>(Array.isArray(data) ? data : [])
  const update = (i: number, k: string, v: string) => setVals(p => p.map((x, idx) => idx === i ? { ...x, [k]: v } : x))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(vals) }}>
      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, marginBottom: 6, color: 'var(--text-rich)' }}>💎 Core Values</h3>
      <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>Values shown on the About page.</p>
      {vals.map((v, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 3fr', gap: 12, padding: 16, background: 'var(--ivory)', borderRadius: 8, marginBottom: 12 }}>
          <F label="Icon" value={v.icon} onChange={(val: string) => update(i, 'icon', val)} />
          <F label="Title" value={v.title} onChange={(val: string) => update(i, 'title', val)} />
          <F label="Description" value={v.desc} onChange={(val: string) => update(i, 'desc', val)} />
        </div>
      ))}
      <button type="button" className="btn-ghost btn-sm" style={{ borderRadius: 4, marginBottom: 20 }} onClick={() => setVals(p => [...p, { icon: '⭐', title: '', desc: '' }])}>+ Add Value</button>
      <div><SaveBtn saving={saving} /></div>
    </form>
  )
}