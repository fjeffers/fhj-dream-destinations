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

const SOCIAL_ICONS: Record<string, string> = {
  facebook:  'M 12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z',
  instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
  tiktok:    'M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z',
  youtube:   'M21.582 7.186a2.506 2.506 0 00-1.768-1.768C18.254 5 12 5 12 5s-6.254 0-7.814.418a2.506 2.506 0 00-1.768 1.768C2 8.746 2 12 2 12s0 3.254.418 4.814a2.506 2.506 0 001.768 1.768C5.746 19 12 19 12 19s6.254 0 7.814-.418a2.506 2.506 0 001.768-1.768C22 15.254 22 12 22 12s0-3.254-.418-4.814zM9.955 15.17V8.83L15.59 12l-5.635 3.17z',
}

export default function Footer() {
  const [c, setC] = useState(DEFAULTS)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('site_content').select('content').eq('section', 'footer').single()
      .then(({ data }) => {
        if (data?.content) setC({ ...DEFAULTS, ...data.content })
      })
  }, [])

  const socials = [
    { key: 'facebook', label: 'Facebook' },
    { key: 'instagram', label: 'Instagram' },
    { key: 'tiktok', label: 'TikTok' },
    { key: 'youtube', label: 'YouTube' },
  ].filter(s => !!(c as any)[s.key])

  return (
    <footer style={{ background: '#F9F7F2', borderTop: '1px solid rgba(196,154,69,0.2)' }}>
      <div style={{ height: 3, background: 'linear-gradient(90deg, #3A7D7D, #C49A45, #3A7D7D)' }} />

      <div className="footer-inner" style={{ padding: '72px 60px 40px', maxWidth: 1400, margin: '0 auto' }}>
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: socials.length > 0 ? '2fr 1fr 1fr 1fr' : '2fr 1fr 1fr', gap: 60, marginBottom: 56 }}>

          {/* Brand */}
          <div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 34, color: '#B08D57', fontStyle: 'italic', lineHeight: 1, marginBottom: 4 }}>FHJ</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 4, color: '#3A7D7D', fontWeight: 600, marginBottom: 20 }}>DREAM DESTINATIONS</div>
            <p style={{ color: 'rgba(46,35,24,0.65)', fontSize: 14, lineHeight: 1.8, maxWidth: 280, marginBottom: 20 }}>{c.tagline}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 24, height: 1, background: '#B08D57' }} />
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', color: '#B08D57', fontSize: 14 }}>
                Curated Journeys, Crafted with Intention
              </span>
            </div>
          </div>

          {/* Explore */}
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: '#2D2926', marginBottom: 24, fontWeight: 700 }}>EXPLORE</div>
            {[['/', 'Home'],['/about', 'Our Story'],['/book', 'Book Now'],['/book-appointment', 'Schedule Consultation'],['/portal', 'Client Portal']].map(([href, label]) => (
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

          {/* Social — only shown if any links are set */}
          {socials.length > 0 && (
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: '#2D2926', marginBottom: 24, fontWeight: 700 }}>FOLLOW US</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {socials.map(s => (
                  <a key={s.key} href={(c as any)[s.key]} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(46,35,24,0.7)', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#B08D57')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(46,35,24,0.7)')}>
                    <span style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(58,125,125,0.1)', border: '1px solid rgba(58,125,125,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s' }}>
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        <path d={SOCIAL_ICONS[s.key]} />
                      </svg>
                    </span>
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ height: 1, background: 'rgba(196,154,69,0.2)', marginBottom: 28 }} />
        <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontSize: 12, color: 'rgba(46,35,24,0.5)' }}>© {new Date().getFullYear()} FHJ Dream Destinations. All rights reserved.</span>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 4, color: '#B08D57' }}>LUXURY · CRAFTED · PERSONAL</span>
        </div>
      </div>
    </footer>
  )
}
