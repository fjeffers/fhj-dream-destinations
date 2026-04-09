'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const DEFAULTS: Record<string, any> = {
  footer: {
    email: 'info@fhjdreamdestinations.com',
    phone: '484-541-3573',
    location: 'Tri-State Area',
    hours: 'Mon – Fri: 9AM – 7PM · Sat: 10AM – 4PM',
    tagline: 'Crafting extraordinary journeys, curated with intention — since 2011.',
    facebook: '',
    instagram: '',
    tiktok: '',
  },
  hero: {
    headline1: "Let's plan your",
    headline2: 'perfect vacation together',
    subtext: "A free 30-minute consultation is all it takes. We'll listen, dream together, and craft something extraordinary just for you.",
    cta_primary: 'BOOK FREE CONSULTATION',
    cta_secondary: 'OUR STORY',
  },
  nav: {
    brand_name: 'FHJ DREAM',
    brand_sub: 'DESTINATIONS',
    brand_tagline: 'Curated Journeys, Crafted with Intention',
  },
  about_story: {
    p1: "FHJ Dream Destinations was born in 2011 from something beautifully simple — Hortense Jeffers' love of travel. Long before it was a business, it was a feeling. The thrill of landing somewhere new. The magic of a perfectly planned trip unfolding exactly as it should. The joy of coming home changed.",
    p2: "Hortense spent years helping friends and family plan their trips — not as a job, but because she genuinely couldn't imagine anything better than helping someone experience the world the right way. Trip by trip, word spread. People weren't just happy with their vacations. They were transformed by them.",
    p3: "What started as a passion became a calling. And FHJ Dream Destinations became the home for everything she believed travel could be — personal, intentional, and truly unforgettable.",
    founder_quote: "I didn't start FHJ to be a travel agent. I started it because I believe with everything in me that travel is one of the most powerful things a person can do — and everyone deserves to experience it beautifully.",
    founder_name: 'Hortense Jeffers',
    founder_title: 'Founder & CEO, FHJ Dream Destinations',
  },
  about_mission: {
    heading: 'To Make Every Journey Feel Like It Was Made Just for You',
    p1: "At FHJ Dream Destinations, we believe the world is meant to be experienced — not just seen. Our mission is to remove every barrier between you and the trip of a lifetime.",
    p2: "Whether it's a honeymoon in the Maldives, a family reunion cruise through the Caribbean, or a solo adventure across Europe — we bring the same care, creativity, and commitment to every single journey we craft.",
  },
  about_values: [
    { icon: '🤝', title: 'Deeply Personal', desc: "We take time to truly know you — your travel style, your pace, your preferences. Every itinerary is built around a real conversation, not a template." },
    { icon: '✦', title: 'Curated, Not Generic', desc: "We handpick every hotel, excursion, and experience based on what we know about you. The result is a journey that feels effortless — because we did the work." },
    { icon: '📞', title: 'Here Every Step of the Way', desc: "From your first call to your last goodbye, we're with you. Have a question at 10pm? Call us. Flight changed? We handle it." },
    { icon: '💛', title: 'Passion Over Profit', desc: "Hortense didn't start FHJ to build a booking machine. She started it because she believes travel changes people — and she wanted to be part of that change." },
  ],
  about_milestones: [
    { number: '2011', label: 'Founded with a passion and a promise' },
    { number: '14+', label: 'Years crafting dream journeys' },
    { number: '500+', label: 'Happy travelers and counting' },
    { number: '48+', label: 'Countries we have explored for you' },
  ],
}

const TABS = [
  { key: 'footer', label: 'Contact & Footer', icon: '📞' },
  { key: 'hero', label: 'Home Hero', icon: '🏠' },
  { key: 'nav', label: 'Navigation', icon: '🧭' },
  { key: 'about_story', label: 'Our Story', icon: '📖' },
  { key: 'about_mission', label: 'Mission', icon: '🎯' },
  { key: 'about_values', label: 'Our Values', icon: '💛' },
  { key: 'about_milestones', label: 'Milestones', icon: '📊' },
]

export default function AdminContentPage() {
  const [active, setActive] = useState('footer')
  const [data, setData] = useState<Record<string, any>>(DEFAULTS)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: rows } = await supabase.from('site_content').select('section, content')
      if (rows) {
        const merged: Record<string, any> = { ...DEFAULTS }
        rows.forEach((r: any) => {
          merged[r.section] = Array.isArray(DEFAULTS[r.section])
            ? (Array.isArray(r.content) ? r.content : DEFAULTS[r.section])
            : { ...DEFAULTS[r.section], ...r.content }
        })
        setData(merged)
      }
      setLoaded(true)
    }
    load()
  }, [])

  const save = useCallback(async (section: string, content: any) => {
    setSaving(true)
    await supabase.from('site_content').upsert(
      { section, content, updated_at: new Date().toISOString() },
      { onConflict: 'section' }
    )
    setData(p => ({ ...p, [section]: content }))
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }, [supabase])

  // TS fix: typed handler avoids implicit any on inline arrow functions
  const handleSave = (section: string) => (c: any) => save(section, c)

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: 'var(--teal)', marginBottom: 8, fontWeight: 600 }}>ADMIN</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 300, color: 'var(--text-rich)' }}>
          Content <em style={{ color: 'var(--teal-dark)' }}>Manager</em>
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 15, marginTop: 6 }}>
          Edit your website content, contact info, and page copy. Changes go live instantly after saving.
        </p>
      </div>

      {saved && (
        <div style={{ padding: '14px 18px', background: 'rgba(26,122,74,0.1)', border: '1.5px solid rgba(26,122,74,0.3)', color: 'var(--success)', borderRadius: 6, marginBottom: 24, fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, fontWeight: 700 }}>
          ✓ SAVED — CHANGES ARE LIVE ON THE SITE
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Sidebar */}
        <div style={{ background: 'white', borderRadius: 8, border: '1px solid rgba(196,154,10,0.2)', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)', position: 'sticky', top: 20 }}>
          <div style={{ padding: '16px 18px', borderBottom: '1px solid rgba(196,154,10,0.1)', fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: 'var(--teal)', fontWeight: 700 }}>EDIT SECTION</div>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActive(tab.key)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '13px 18px', background: active === tab.key ? 'rgba(14,143,143,0.09)' : 'transparent', border: 'none', borderLeft: `3px solid ${active === tab.key ? 'var(--teal)' : 'transparent'}`, fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1.5, color: active === tab.key ? 'var(--teal-dark)' : 'var(--muted)', cursor: 'pointer', textAlign: 'left', fontWeight: active === tab.key ? 700 : 500, transition: 'all 0.2s' }}>
              <span style={{ fontSize: 15 }}>{tab.icon}</span>
              <span>{tab.label.toUpperCase()}</span>
            </button>
          ))}
          <div style={{ padding: '16px 18px', background: 'rgba(196,154,10,0.04)', borderTop: '1px solid rgba(196,154,10,0.1)', marginTop: 8 }}>
            <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
              💡 Changes save to the database and appear on the site immediately — no rebuild needed.
            </p>
          </div>
        </div>

        {/* Editor panel */}
        <div style={{ background: 'white', borderRadius: 8, border: '1px solid rgba(196,154,10,0.2)', padding: 36, boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
          {!loaded ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontStyle: 'italic' }}>Loading content...</p>
            </div>
          ) : (
            <>
              {active === 'footer'          && <FooterEditor     data={data.footer}           onSave={handleSave('footer')}          saving={saving} />}
              {active === 'hero'            && <HeroEditor        data={data.hero}             onSave={handleSave('hero')}            saving={saving} />}
              {active === 'nav'             && <NavEditor         data={data.nav}              onSave={handleSave('nav')}             saving={saving} />}
              {active === 'about_story'     && <StoryEditor       data={data.about_story}      onSave={handleSave('about_story')}     saving={saving} />}
              {active === 'about_mission'   && <MissionEditor     data={data.about_mission}    onSave={handleSave('about_mission')}   saving={saving} />}
              {active === 'about_values'    && <ValuesEditor      data={data.about_values}     onSave={handleSave('about_values')}    saving={saving} />}
              {active === 'about_milestones'&& <MilestonesEditor  data={data.about_milestones} onSave={handleSave('about_milestones')}saving={saving} />}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Shared components ───────────────────────────────────────────
function F({ label, value, onChange, multiline = false, hint = '', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void
  multiline?: boolean; hint?: string; placeholder?: string
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label className="lux-label">{label}</label>
      {hint && <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6, lineHeight: 1.5 }}>{hint}</p>}
      {multiline
        ? <textarea className="luxury-input" rows={3} value={value || ''} placeholder={placeholder}
            onChange={e => onChange(e.target.value)} style={{ resize: 'vertical', borderRadius: 4 }} />
        : <input className="luxury-input" value={value || ''} placeholder={placeholder}
            onChange={e => onChange(e.target.value)} style={{ borderRadius: 4 }} />}
    </div>
  )
}

function SaveBtn({ saving }: { saving: boolean }) {
  return (
    <button className="btn-teal" type="submit" disabled={saving}
      style={{ borderRadius: 4, padding: '14px 48px', opacity: saving ? 0.7 : 1, fontSize: 12, marginTop: 8 }}>
      {saving ? 'Saving...' : 'Save & Publish ✦'}
    </button>
  )
}

function SectionHeader({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid rgba(196,154,10,0.15)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 24 }}>{icon}</span>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, fontWeight: 300, color: 'var(--text-rich)' }}>{title}</h2>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
    </div>
  )
}

// ── Section editors ─────────────────────────────────────────────
function FooterEditor({ data, onSave, saving }: { data: any; onSave: (c: any) => void; saving: boolean }) {
  const [d, setD] = useState(data)
  const u = (k: string, v: string) => setD((p: any) => ({ ...p, [k]: v }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(d) }}>
      <SectionHeader icon="📞" title="Contact & Footer" desc="Contact info and social links shown in the footer across every page." />

      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: 'var(--teal-dark)', marginBottom: 16, fontWeight: 700 }}>CONTACT DETAILS</div>
      <F label="Email Address" value={d.email} onChange={(v) => u('email', v)} placeholder="info@fhjdreamdestinations.com" />
      <F label="Phone Number" value={d.phone} onChange={(v) => u('phone', v)} placeholder="484-541-3573" />
      <F label="Location / Service Area" value={d.location} onChange={(v) => u('location', v)} placeholder="Tri-State Area" />
      <F label="Business Hours" value={d.hours} onChange={(v) => u('hours', v)} placeholder="Mon – Fri: 9AM – 7PM · Sat: 10AM – 4PM" />
      <F label="Brand Tagline" value={d.tagline} onChange={(v) => u('tagline', v)} multiline placeholder="Crafting extraordinary journeys..." hint="Short description shown under the FHJ logo." />

      <div style={{ height: 1, background: 'rgba(196,154,10,0.15)', margin: '28px 0' }} />
      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: 'var(--teal-dark)', marginBottom: 16, fontWeight: 700 }}>SOCIAL MEDIA LINKS</div>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.6 }}>Paste the full URL for each platform. Leave blank to hide it from the footer.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: '0 14px', alignItems: 'flex-end' }}>
        <div style={{ fontSize: 24, paddingBottom: 20, textAlign: 'center' }}>📘</div>
        <F label="Facebook URL" value={d.facebook} onChange={(v) => u('facebook', v)} placeholder="https://facebook.com/fhjdreamdestinations" />
        <div style={{ fontSize: 24, paddingBottom: 20, textAlign: 'center' }}>📸</div>
        <F label="Instagram URL" value={d.instagram} onChange={(v) => u('instagram', v)} placeholder="https://instagram.com/fhjdreamdestinations" />
        <div style={{ fontSize: 24, paddingBottom: 20, textAlign: 'center' }}>🎵</div>
        <F label="TikTok URL" value={d.tiktok} onChange={(v) => u('tiktok', v)} placeholder="https://tiktok.com/@fhjdreamdestinations" />
      </div>

      <SaveBtn saving={saving} />
    </form>
  )
}

function HeroEditor({ data, onSave, saving }: { data: any; onSave: (c: any) => void; saving: boolean }) {
  const [d, setD] = useState(data)
  const u = (k: string, v: string) => setD((p: any) => ({ ...p, [k]: v }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(d) }}>
      <SectionHeader icon="🏠" title="Home Page Hero" desc="The headline and buttons visitors see first when they land on your home page." />
      <F label="Headline — Line 1" value={d.headline1} onChange={(v) => u('headline1', v)} placeholder="Let's plan your" />
      <F label="Headline — Line 2 (italic, accent color)" value={d.headline2} onChange={(v) => u('headline2', v)} placeholder="perfect vacation together" />
      <F label="Subtext Paragraph" value={d.subtext} onChange={(v) => u('subtext', v)} multiline placeholder="A free 30-minute consultation..." />
      <F label="Primary Button Text" value={d.cta_primary} onChange={(v) => u('cta_primary', v)} placeholder="BOOK FREE CONSULTATION" />
      <F label="Secondary Button Text" value={d.cta_secondary} onChange={(v) => u('cta_secondary', v)} placeholder="OUR STORY" />
      <SaveBtn saving={saving} />
    </form>
  )
}

function NavEditor({ data, onSave, saving }: { data: any; onSave: (c: any) => void; saving: boolean }) {
  const [d, setD] = useState(data)
  const u = (k: string, v: string) => setD((p: any) => ({ ...p, [k]: v }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(d) }}>
      <SectionHeader icon="🧭" title="Navigation Bar" desc="Brand name and tagline shown in the top navigation bar." />
      <F label="Brand Name — Line 1 (large, gold)" value={d.brand_name} onChange={(v) => u('brand_name', v)} placeholder="FHJ DREAM" />
      <F label="Brand Name — Line 2 (small, teal)" value={d.brand_sub} onChange={(v) => u('brand_sub', v)} placeholder="DESTINATIONS" />
      <F label="Tagline (shown below brand name)" value={d.brand_tagline} onChange={(v) => u('brand_tagline', v)} placeholder="Curated Journeys, Crafted with Intention" />
      <SaveBtn saving={saving} />
    </form>
  )
}

function StoryEditor({ data, onSave, saving }: { data: any; onSave: (c: any) => void; saving: boolean }) {
  const [d, setD] = useState(data)
  const u = (k: string, v: string) => setD((p: any) => ({ ...p, [k]: v }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(d) }}>
      <SectionHeader icon="📖" title="Our Story — Origin" desc="The story paragraphs and founder quote on the Our Story page." />
      <F label="Story — Paragraph 1" value={d.p1} onChange={(v) => u('p1', v)} multiline hint="The opening paragraph — how FHJ started." />
      <F label="Story — Paragraph 2" value={d.p2} onChange={(v) => u('p2', v)} multiline hint="The growth and word-of-mouth paragraph." />
      <F label="Story — Paragraph 3" value={d.p3} onChange={(v) => u('p3', v)} multiline hint="The closing paragraph — passion to purpose." />
      <div style={{ height: 1, background: 'rgba(196,154,10,0.15)', margin: '28px 0' }} />
      <F label="Founder Quote" value={d.founder_quote} onChange={(v) => u('founder_quote', v)} multiline hint="The pull quote shown in the card on the right side." />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <F label="Founder Name" value={d.founder_name} onChange={(v) => u('founder_name', v)} placeholder="Hortense Jeffers" />
        <F label="Founder Title" value={d.founder_title} onChange={(v) => u('founder_title', v)} placeholder="Founder & CEO" />
      </div>
      <SaveBtn saving={saving} />
    </form>
  )
}

function MissionEditor({ data, onSave, saving }: { data: any; onSave: (c: any) => void; saving: boolean }) {
  const [d, setD] = useState(data)
  const u = (k: string, v: string) => setD((p: any) => ({ ...p, [k]: v }))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(d) }}>
      <SectionHeader icon="🎯" title="Mission Statement" desc="The mission section on the Our Story page." />
      <F label="Mission Heading" value={d.heading} onChange={(v) => u('heading', v)} multiline hint="The large italic headline." />
      <F label="Mission — Paragraph 1" value={d.p1} onChange={(v) => u('p1', v)} multiline />
      <F label="Mission — Paragraph 2" value={d.p2} onChange={(v) => u('p2', v)} multiline />
      <SaveBtn saving={saving} />
    </form>
  )
}

function ValuesEditor({ data, onSave, saving }: { data: any; onSave: (c: any) => void; saving: boolean }) {
  const [vals, setVals] = useState<any[]>(Array.isArray(data) ? data : [])
  const update = (i: number, k: string, v: string) => setVals(p => p.map((x, idx) => idx === i ? { ...x, [k]: v } : x))
  const remove = (i: number) => setVals(p => p.filter((_, idx) => idx !== i))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(vals) }}>
      <SectionHeader icon="💛" title="What Sets Us Apart" desc="The value cards on the Our Story page. Add, edit, or remove them." />
      {vals.map((v, i) => (
        <div key={i} style={{ background: '#F9F7F2', borderRadius: 8, padding: '22px 20px', marginBottom: 16, border: '1px solid rgba(196,154,10,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--teal-dark)', fontWeight: 700 }}>VALUE {i + 1}</span>
            <button type="button" onClick={() => remove(i)} style={{ background: 'none', border: '1px solid rgba(192,57,43,0.3)', color: 'var(--danger)', padding: '4px 12px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>Remove</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: 14, marginBottom: 14 }}>
            <F label="Icon" value={v.icon} onChange={(val) => update(i, 'icon', val)} placeholder="🤝" />
            <F label="Title" value={v.title} onChange={(val) => update(i, 'title', val)} placeholder="Deeply Personal" />
          </div>
          <F label="Description" value={v.desc} onChange={(val) => update(i, 'desc', val)} multiline placeholder="Describe this value..." />
        </div>
      ))}
      <button type="button" onClick={() => setVals(p => [...p, { icon: '⭐', title: '', desc: '' }])} className="btn-ghost btn-sm" style={{ borderRadius: 4, marginBottom: 24 }}>+ Add Value</button>
      <div><SaveBtn saving={saving} /></div>
    </form>
  )
}

function MilestonesEditor({ data, onSave, saving }: { data: any; onSave: (c: any) => void; saving: boolean }) {
  const [items, setItems] = useState<any[]>(Array.isArray(data) ? data : [])
  const update = (i: number, k: string, v: string) => setItems(p => p.map((x, idx) => idx === i ? { ...x, [k]: v } : x))
  const remove = (i: number) => setItems(p => p.filter((_, idx) => idx !== i))
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(items) }}>
      <SectionHeader icon="📊" title="Milestones / Stats Bar" desc="Stats shown on the teal bar on the Our Story page (e.g. 2011, 14+ Years)." />
      {items.map((item, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 60px', gap: 14, alignItems: 'flex-end', marginBottom: 14, background: '#F9F7F2', padding: '16px 18px', borderRadius: 8, border: '1px solid rgba(196,154,10,0.12)' }}>
          <F label="Number / Year" value={item.number} onChange={(v) => update(i, 'number', v)} placeholder="250+" />
          <F label="Label" value={item.label} onChange={(v) => update(i, 'label', v)} placeholder="Happy travelers" />
          <div style={{ marginBottom: 20 }}>
            <button type="button" onClick={() => remove(i)} style={{ width: '100%', background: 'none', border: '1px solid rgba(192,57,43,0.3)', color: 'var(--danger)', padding: '13px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}>✕</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={() => setItems(p => [...p, { number: '', label: '' }])} className="btn-ghost btn-sm" style={{ borderRadius: 4, marginBottom: 24 }}>+ Add Milestone</button>
      <div><SaveBtn saving={saving} /></div>
    </form>
  )
}
