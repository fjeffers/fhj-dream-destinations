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
}

const SOCIAL = [
  { key: 'facebook',  icon: '📘', label: 'Facebook'  },
  { key: 'instagram', icon: '📸', label: 'Instagram' },
  { key: 'tiktok',    icon: '🎵', label: 'TikTok'    },
]

export default function Footer() {
  const [c, setC] = useState(DEFAULTS)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('site_content').select('content').eq('section', 'footer').single()
      .then(({ data }) => {
        if (data?.content) setC({ ...DEFAULTS, ...data.content })
      })
  }, [])

  const socials = SOCIAL.filter(s => c[s.key as keyof typeof c])

  return (
    <footer style={{ background: '#F9F7F2', borderTop: '1px solid rgba(196,154,69,0.2)' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, #3A7D7D, #C49A45, #3A7D7D)' }} />

      <div className="footer-inner" style={{ padding: '72px 60px 40px', maxWidth: 1400, margin: '0 auto' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 60, marginBottom: 56 }}>

          {/* Brand */}
          <div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 34, color: '#B08D57', fontStyle: 'italic', lineHeight: 1, marginBottom: 4 }}>FHJ</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 4, color: '#3A7D7D', fontWeight: 600, marginBottom: 20 }}>DREAM DESTINATIONS</div>
            <p style={{ color: 'rgba(46,35,24,0.65)', fontSize: 14, lineHeight: 1.8, maxWidth: 280, marginBottom: 20 }}>{c.tagline}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: socials.length > 0 ? 24 : 0 }}>
              <div style={{ width: 24, height: 1, background: '#B08D57' }} />
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#B08D57', fontSize: 14 }}>
                Curated Journeys, Crafted with Intention
              </span>
            </div>

            {/* Social media icons */}
            {socials.length > 0 && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {socials.map(s => (
                  <a key={s.key} href={c[s.key as keyof typeof c]} target="_blank" rel="noopener noreferrer"
                    title={s.label}
                    style={{ width: 40, height: 40, borderRadius: 8, background: 'white', border: '1px solid rgba(196,154,69,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, textDecoration: 'none', transition: 'all 0.2s', boxShadow: '0 2px 8px rgba(196,154,69,0.1)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = '#B08D57'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(196,154,69,0.25)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'none'; }}>
                    {s.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Explore */}
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: '#2D2926', marginBottom: 24, fontWeight: 700 }}>EXPLORE</div>
            {([['/', 'Home'], ['/about', 'Our Story'], ['/book', 'Book Now'], ['/book-appointment', 'Schedule Consultation'], ['/portal', 'Client Portal']] as [string, string][]).map(([href, label]) => (
              <Link key={href} href={href}
                style={{ color: 'rgba(46,35,24,0.7)', fontSize: 14, textDecoration: 'none', display: 'block', marginBottom: 14, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#B08D57')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(46,35,24,0.7)')}>
                {label}
              </Link>
            ))}
          </div>

          {/* Connect */}
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: '#2D2926', marginBottom: 24, fontWeight: 700 }}>CONNECT</div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 15, marginTop: 1, flexShrink: 0 }}>✉</span>
              <a href={`mailto:${c.email}`}
                style={{ color: 'rgba(46,35,24,0.7)', fontSize: 14, textDecoration: 'none', lineHeight: 1.5, wordBreak: 'break-all', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#B08D57')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(46,35,24,0.7)')}>
                {c.email}
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>📞</span>
              <a href={`tel:${c.phone.replace(/\D/g, '')}`}
                style={{ color: 'rgba(46,35,24,0.7)', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#B08D57')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(46,35,24,0.7)')}>
                {c.phone}
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>📍</span>
              <span style={{ color: 'rgba(46,35,24,0.65)', fontSize: 14 }}>{c.location}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>🕐</span>
              <span style={{ color: 'rgba(46,35,24,0.55)', fontSize: 13, lineHeight: 1.6 }}>{c.hours}</span>
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(196,154,69,0.2)', marginBottom: 28 }} />
        <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontSize: 12, color: 'rgba(46,35,24,0.5)' }}>© 2026 FHJ Dream Destinations. All rights reserved.</span>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 4, color: '#B08D57' }}>LUXURY · CRAFTED · PERSONAL</span>
        </div>
      </div>
    </footer>
  )
}
