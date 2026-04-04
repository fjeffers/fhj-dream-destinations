'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const DEFAULTS = {
  brand_name: 'FHJ DREAM',
  brand_sub: 'DESTINATIONS',
  brand_tagline: 'Curated Journeys, Crafted with Intention',
}

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [nav, setNav] = useState(DEFAULTS)
  const pathname = usePathname()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('site_content').select('content').eq('section', 'nav').single()
      .then(({ data }) => { if (data?.content) setNav({ ...DEFAULTS, ...data.content }) })
  }, [])

  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'Our Story' },
    { href: '/book', label: 'Book Now' },
    { href: '/portal', label: 'Client Portal' },
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: scrolled ? '12px 60px' : '20px 60px',
      background: 'rgba(253,250,243,0.97)',
      borderBottom: scrolled ? '1px solid var(--border-gold)' : '1px solid rgba(196,154,10,0.12)',
      backdropFilter: 'blur(20px)',
      boxShadow: scrolled ? '0 2px 40px rgba(196,154,10,0.1)' : 'none',
      transition: 'all 0.4s ease',
    }}>

      {/* LOGO */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="/logo.png" alt="FHJ Dream Destinations"
          style={{ width: scrolled ? 52 : 72, height: scrolled ? 52 : 72, objectFit: 'contain', transition: 'all 0.4s', flexShrink: 0 }} />
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: scrolled ? 13 : 16, color: 'var(--gold-dark)', fontWeight: 700, letterSpacing: 3, lineHeight: 1.1, transition: 'font-size 0.4s' }}>{nav.brand_name}</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: scrolled ? 7 : 9, letterSpacing: 5, color: 'var(--teal-dark)', marginTop: 3, fontWeight: 600, transition: 'font-size 0.4s' }}>{nav.brand_sub}</div>
          {!scrolled && <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', marginTop: 3 }}>{nav.brand_tagline}</div>}
        </div>
      </Link>

      {/* LINKS */}
      <div style={{ display: 'flex', gap: 44, alignItems: 'center' }}>
        {links.map(link => (
          <Link key={link.href} href={link.href}
            style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: pathname === link.href ? 'var(--teal-dark)' : '#B08D57', textDecoration: 'none', fontWeight: 600, transition: 'color 0.3s', textTransform: 'uppercase', borderBottom: pathname === link.href ? '2px solid var(--teal)' : '2px solid transparent', paddingBottom: 2 }}>
            {link.label}
          </Link>
        ))}
      </div>

      {/* CTA */}
      <Link href="/book" style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, fontWeight: 600, color: 'white', background: 'linear-gradient(135deg, var(--teal-dark), var(--teal))', padding: '11px 28px', textDecoration: 'none', textTransform: 'uppercase', transition: 'all 0.3s', boxShadow: '0 4px 16px rgba(14,143,143,0.3)' }}
        onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 24px rgba(14,143,143,0.45)'}
        onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 16px rgba(14,143,143,0.3)'}>
        BEGIN JOURNEY
      </Link>
    </nav>
  )
}
