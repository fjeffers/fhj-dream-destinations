'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const DEFAULTS = {
  email: 'info@fhjdreamdestinations.com',
  phone: '+1 (800) FHJ-TRIP',
  locations: 'New York · Miami · LA',
  tagline: "Crafting extraordinary journeys for the world's most discerning travelers since 2018.",
}

export default function Footer() {
  const [c, setC] = useState(DEFAULTS)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('site_content').select('content').eq('section', 'footer').single()
      .then(({ data }) => { if (data?.content) setC({ ...DEFAULTS, ...data.content }) })
  }, [])

  const lnk = (href: string, label: string) => (
    <Link key={href + label} href={href} style={{ color: 'rgba(46,35,24,0.7)', fontSize: 14, textDecoration: 'none', display: 'block', marginBottom: 14 }}
      onMouseEnter={e => (e.currentTarget.style.color = '#B08D57')}
      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(46,35,24,0.7)')}>
      {label}
    </Link>
  )

  return (
    <footer style={{ background: '#F9F7F2', borderTop: '1px solid rgba(196,154,69,0.2)' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, #3A7D7D, #C49A45, #3A7D7D)' }} />

      <div style={{ padding: '72px 60px 40px', maxWidth: 1400, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 60, marginBottom: 56 }}>

          {/* Brand */}
          <div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 34, color: '#B08D57', fontStyle: 'italic', lineHeight: 1, marginBottom: 4 }}>FHJ</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 4, color: '#3A7D7D', fontWeight: 600, marginBottom: 20 }}>DREAM DESTINATIONS</div>
            <p style={{ color: 'rgba(46,35,24,0.65)', fontSize: 14, lineHeight: 1.8, maxWidth: 280, marginBottom: 16 }}>{c.tagline}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 24, height: 1, background: '#B08D57' }} />
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#B08D57', fontSize: 14 }}>Curated Journeys, Crafted with Intention</span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: '#2D2926', marginBottom: 24, fontWeight: 700 }}>EXPLORE</div>
            {lnk('/', 'Home')}
            {lnk('/about', 'Our Story')}
            {lnk('/book', 'Book Now')}
            {lnk('/book-appointment', 'Schedule Consultation')}
          </div>

          {/* Connect */}
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: '#2D2926', marginBottom: 24, fontWeight: 700 }}>CONNECT</div>
            <a href={`mailto:${c.email}`} style={{ color: 'rgba(46,35,24,0.7)', fontSize: 14, textDecoration: 'none', display: 'block', marginBottom: 14 }}
              onMouseEnter={e => (e.currentTarget.style.color = '#B08D57')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(46,35,24,0.7)')}>
              {c.email}
            </a>
            <a href={`tel:${c.phone.replace(/\D/g, '')}`} style={{ color: 'rgba(46,35,24,0.7)', fontSize: 14, textDecoration: 'none', display: 'block', marginBottom: 14 }}
              onMouseEnter={e => (e.currentTarget.style.color = '#B08D57')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(46,35,24,0.7)')}>
              {c.phone}
            </a>
            <span style={{ color: 'rgba(46,35,24,0.65)', fontSize: 14 }}>{c.locations}</span>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ height: 1, background: 'rgba(196,154,69,0.2)', marginBottom: 28 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontSize: 12, color: 'rgba(46,35,24,0.5)' }}>© 2026 FHJ Dream Destinations. All rights reserved.</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 4, color: '#B08D57' }}>LUXURY · CRAFTED · PERSONAL</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
