'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const DEFAULTS = {
  email: 'info@fhjdreamdestinations.com',
  phone: '484-541-3573',
  location: 'Tri-State Area',
  hours: 'Mon – Fri: 9AM – 7PM · Sat: 10AM – 4PM',
  tagline: 'Crafting extraordinary journeys, curated with intention — since 2011.',
  facebook: '',
  instagram: '',
  tiktok: '',
  youtube: '',
}

const SOCIAL = [
  { key: 'facebook',  label: 'Facebook',  icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
  )},
  { key: 'instagram', label: 'Instagram', icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
  )},
  { key: 'tiktok',    label: 'TikTok',    icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.84 1.56V6.78a4.85 4.85 0 01-1.07-.09z"/></svg>
  )},
  { key: 'youtube',   label: 'YouTube',   icon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 00-1.95 1.96A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/></svg>
  )},
]

export default function Footer() {
  const [c, setC] = useState(DEFAULTS)
  const [partners, setPartners] = useState<any[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('site_content').select('content').eq('section', 'footer').single()
      .then(({ data }) => {
        if (data?.content) setC({ ...DEFAULTS, ...data.content })
      })
    supabase.from('partners').select('*').eq('active', true).order('created_at')
      .then(({ data }) => {
        if (data) setPartners(data)
      })
  }, [])

  const socials = SOCIAL.filter(s => c[s.key as keyof typeof c])

  return (
    <footer style={{ background: '#0D1F1F', color: 'white' }}>
      {/* Gold top bar */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, #3A7D7D, #C49A45, #3A7D7D)' }} />

      {/* Partners strip */}
      {partners.length > 0 && (
        <div style={{ borderBottom: '1px solid rgba(196,154,69,0.15)', padding: '32px 60px' }}>
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 4, color: 'rgba(196,154,69,0.7)', fontWeight: 700, whiteSpace: 'nowrap' }}>PREFERRED PARTNERS</div>
              <div style={{ width: 1, height: 24, background: 'rgba(196,154,69,0.2)' }} />
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                {partners.map(p => (
                  <a key={p.id} href={p.website_url || '#'} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', padding: '8px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(196,154,69,0.15)', borderRadius: 6, transition: 'all 0.2s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(196,154,69,0.4)'; (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.07)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(196,154,69,0.15)'; (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.04)'; }}>
                    {p.image_url && <img src={p.image_url} alt={p.name} style={{ height: 28, width: 28, objectFit: 'contain', borderRadius: 4 }} />}
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{p.name}</span>
                    {p.category && <span style={{ fontSize: 10, color: 'rgba(196,154,69,0.6)', fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic' }}>{p.category}</span>}
                  </a>
                ))}
                <Link href="/partners" style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'rgba(196,154,69,0.6)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#C49A45')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(196,154,69,0.6)')}>
                  VIEW ALL →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main footer */}
      <div style={{ padding: '72px 60px 40px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 60, marginBottom: 56 }}>

          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <img src="/logo.png" alt="FHJ" style={{ width: 52, height: 52, objectFit: 'contain', borderRadius: '50%', border: '2px solid rgba(196,154,69,0.3)' }} />
              <div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: '#C49A45', fontStyle: 'italic', lineHeight: 1 }}>FHJ</div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 7, letterSpacing: 4, color: '#3A7D7D', fontWeight: 600 }}>DREAM DESTINATIONS</div>
              </div>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 1.8, maxWidth: 280, marginBottom: 24 }}>{c.tagline}</p>

            {/* Social icons */}
            {socials.length > 0 && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {socials.map(s => (
                  <a key={s.key} href={c[s.key as keyof typeof c]} target="_blank" rel="noopener noreferrer"
                    title={s.label}
                    style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(196,154,69,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'all 0.2s' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = '#C49A45'; el.style.color = '#C49A45'; el.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = 'rgba(196,154,69,0.2)'; el.style.color = 'rgba(255,255,255,0.6)'; el.style.transform = 'none'; }}>
                    {s.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Explore */}
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: '#C49A45', marginBottom: 24, fontWeight: 700 }}>EXPLORE</div>
            {([['/', 'Home'], ['/about', 'Our Story'], ['/book', 'Book Now'], ['/book-appointment', 'Consultation'], ['/partners', 'Our Partners']] as [string, string][]).map(([href, label]) => (
              <Link key={href} href={href}
                style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, textDecoration: 'none', display: 'block', marginBottom: 14, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#C49A45')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>
                {label}
              </Link>
            ))}
          </div>

          {/* Client */}
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: '#C49A45', marginBottom: 24, fontWeight: 700 }}>CLIENT</div>
            {([['/portal', 'Client Portal'], ['/book-appointment', 'Book Appointment'], ['/book', 'View Packages']] as [string, string][]).map(([href, label]) => (
              <Link key={href} href={href}
                style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, textDecoration: 'none', display: 'block', marginBottom: 14, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#C49A45')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>
                {label}
              </Link>
            ))}
          </div>

          {/* Connect */}
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: '#C49A45', marginBottom: 24, fontWeight: 700 }}>CONNECT</div>
            {[
              { icon: '✉', val: c.email, href: `mailto:${c.email}` },
              { icon: '📞', val: c.phone, href: `tel:${c.phone.replace(/\D/g,'')}` },
              { icon: '📍', val: c.location, href: undefined },
              { icon: '🕐', val: c.hours, href: undefined },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 14, marginTop: 1, flexShrink: 0, opacity: 0.6 }}>{item.icon}</span>
                {item.href ? (
                  <a href={item.href} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none', lineHeight: 1.6, wordBreak: 'break-all', transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#C49A45')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}>
                    {item.val}
                  </a>
                ) : (
                  <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.6 }}>{item.val}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ height: 1, background: 'rgba(196,154,69,0.15)', marginBottom: 28 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>© 2026 FHJ Dream Destinations. All rights reserved.</span>
          <Link href="/privacy" style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#C49A45')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}>
            Privacy Policy
          </Link>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 4, color: 'rgba(196,154,69,0.5)' }}>LUXURY · CRAFTED · PERSONAL</span>
        </div>
      </div>
    </footer>
  )
}
