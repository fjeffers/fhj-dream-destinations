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
  const [menuOpen, setMenuOpen] = useState(false)
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

  useEffect(() => { setMenuOpen(false) }, [pathname])

  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'Our Story' },
    { href: '/book', label: 'Book Now' },
    { href: '/portal', label: 'Client Portal' },
  ]

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .nav-cta { display: none !important; }
          .nav-hamburger { display: flex !important; }
          .nav-logo-tagline { display: none !important; }
          nav { padding: 12px 16px !important; }
        }
        @media (min-width: 769px) {
          .nav-hamburger { display: none !important; }
          .mobile-menu { display: none !important; }
        }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: scrolled ? '12px 24px' : '16px 60px',
        background: 'rgba(253,250,243,0.97)',
        borderBottom: scrolled ? '1px solid var(--border-gold)' : '1px solid rgba(196,154,10,0.12)',
        backdropFilter: 'blur(20px)',
        boxShadow: scrolled ? '0 2px 40px rgba(196,154,10,0.1)' : 'none',
        transition: 'all 0.4s ease',
      }}>

        {/* LOGO */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo.png" alt="FHJ Dream Destinations"
            style={{ width: scrolled ? 48 : 60, height: scrolled ? 48 : 60, objectFit: 'contain', transition: 'all 0.4s', flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: scrolled ? 12 : 15, color: 'var(--gold-dark)', fontWeight: 700, letterSpacing: 3, lineHeight: 1.1, transition: 'font-size 0.4s' }}>{nav.brand_name}</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: scrolled ? 7 : 8, letterSpacing: 5, color: 'var(--teal-dark)', marginTop: 3, fontWeight: 600, transition: 'font-size 0.4s' }}>{nav.brand_sub}</div>
            <div className="nav-logo-tagline" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', marginTop: 3 }}>{nav.brand_tagline}</div>
          </div>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="nav-links" style={{ display: 'flex', gap: 44, alignItems: 'center' }}>
          {links.map(link => (
            <Link key={link.href} href={link.href}
              style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: pathname === link.href ? 'var(--teal-dark)' : '#B08D57', textDecoration: 'none', fontWeight: 600, transition: 'color 0.3s', textTransform: 'uppercase', borderBottom: pathname === link.href ? '2px solid var(--teal)' : '2px solid transparent', paddingBottom: 2 }}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* DESKTOP CTA */}
        <Link className="nav-cta" href="/book-appointment" style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, fontWeight: 600, color: 'white', background: 'linear-gradient(135deg, var(--teal-dark), var(--teal))', padding: '11px 28px', textDecoration: 'none', textTransform: 'uppercase', transition: 'all 0.3s', boxShadow: '0 4px 16px rgba(14,143,143,0.3)', borderRadius: 4 }}>
          BEGIN JOURNEY
        </Link>

        {/* HAMBURGER */}
        <button className="nav-hamburger" onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: 'none', flexDirection: 'column', gap: 5, background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
          <span style={{ width: 24, height: 2, background: menuOpen ? 'var(--teal)' : 'var(--gold-dark)', display: 'block', transition: 'all 0.3s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
          <span style={{ width: 24, height: 2, background: menuOpen ? 'var(--teal)' : 'var(--gold-dark)', display: 'block', transition: 'all 0.3s', opacity: menuOpen ? 0 : 1 }} />
          <span style={{ width: 24, height: 2, background: menuOpen ? 'var(--teal)' : 'var(--gold-dark)', display: 'block', transition: 'all 0.3s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className="mobile-menu" style={{
        position: 'fixed', top: menuOpen ? 80 : '-100%', left: 0, right: 0, zIndex: 99,
        background: 'rgba(253,250,243,0.98)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(196,154,10,0.2)',
        padding: '24px 24px 32px',
        transition: 'top 0.4s ease',
        boxShadow: '0 8px 32px rgba(196,154,10,0.15)'
      }}>
        {links.map(link => (
          <Link key={link.href} href={link.href} style={{
            display: 'block', fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 3,
            color: pathname === link.href ? 'var(--teal-dark)' : '#B08D57',
            textDecoration: 'none', fontWeight: 600, textTransform: 'uppercase',
            padding: '16px 0', borderBottom: '1px solid rgba(196,154,10,0.15)'
          }}>
            {link.label}
          </Link>
        ))}
        <Link href="/book-appointment" style={{
          display: 'block', textAlign: 'center', marginTop: 20,
          fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 3, fontWeight: 600,
          color: 'white', background: 'linear-gradient(135deg, var(--teal-dark), var(--teal))',
          padding: '14px 28px', textDecoration: 'none', textTransform: 'uppercase',
          borderRadius: 4, boxShadow: '0 4px 16px rgba(14,143,143,0.3)'
        }}>
          BEGIN JOURNEY
        </Link>
      </div>
    </>
  )
}