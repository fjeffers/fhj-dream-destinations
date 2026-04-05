'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Deal } from '@/lib/types'

const slides = [
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80',
    eyebrow: 'Island Escapes',
    title: 'Your Dream',
    sub: 'Begins Here',
  },
  {
    url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1800&q=80',
    eyebrow: 'Safari Adventures',
    title: 'Wild &',
    sub: 'Unforgettable',
  },
  {
    url: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1800&q=80',
    eyebrow: 'Luxury Cruises',
    title: 'Sail Into',
    sub: 'Paradise',
  },
  {
    url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1800&q=80',
    eyebrow: 'European Romance',
    title: 'Moments That',
    sub: 'Last Forever',
  },
]

const destinations = [
  { name: 'Maldives', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=700&q=80', tag: 'Beach & Villas' },
  { name: 'Serengeti', img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=700&q=80', tag: 'Safari' },
  { name: 'Amalfi Coast', img: 'https://images.unsplash.com/photo-1599640842225-85d111c60e6b?auto=format&fit=crop&w=700&q=80', tag: 'Europe' },
  { name: 'Bora Bora', img: 'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?auto=format&fit=crop&w=700&q=80', tag: 'Overwater Bungalows' },
  { name: 'Santorini', img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=700&q=80', tag: 'Europe' },
  { name: 'Venice', img: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=700&q=80', tag: 'Romance' },
]

const testimonials = [
  { quote: 'Frederick turned our anniversary into the most magical week of our lives. Every detail was absolutely perfect — the private villa, the surprise sunset dinner. We cried leaving!', name: 'Sarah & James M.', trip: 'Maldives', initials: 'SJ' },
  { quote: "I've traveled with many agencies but none compare to FHJ. They knew exactly what I wanted before I even finished explaining. Truly world-class.", name: 'Patricia L.', trip: 'Amalfi Coast', initials: 'PL' },
  { quote: "Traveling with 3 kids seemed daunting but FHJ made it seamless and magical. Our children still talk about Kyoto every single day!", name: 'The Chen Family', trip: 'Kyoto & Bali', initials: 'CF' },
]

const team = [
  { initials: 'FJ', name: 'Frederick Jeffers', role: 'Founder & Lead Travel Architect', specialty: 'Caribbean · Africa · Europe' },
  { initials: 'LT', name: 'Luxury Specialists', role: 'Senior Travel Consultants', specialty: 'Asia · Pacific · Americas' },
  { initials: 'CD', name: 'Concierge Team', role: 'On-Ground Support', specialty: 'Available 24/7 Worldwide' },
]

const C = {
  cream:    '#FDF6EC',
  sand:     '#F5ECD7',
  gold:     '#C49A45',
  goldDark: '#A07830',
  goldLight:'#E8C87A',
  teal:     '#3A7D7D',
  tealLight:'#EAF4F4',
  terra:    '#C4714A',
  brown:    '#4A3728',
  muted:    '#8A7A6A',
  text:     '#2E2318',
}

export default function HomeClient({ deals, heroContent = {}, footerContent = {} }: { deals: Deal[], heroContent?: any, footerContent?: any }) {
  const hero = {
    headline1: heroContent.headline1 || "Let's plan your",
    headline2: heroContent.headline2 || 'perfect vacation together',
    subtext: heroContent.subtext || "A free 30-minute consultation is all it takes. We'll listen, dream together, and craft something extraordinary just for you.",
    cta_primary: heroContent.cta_primary || 'BOOK FREE CONSULTATION',
    cta_secondary: heroContent.cta_secondary || 'MEET THE TEAM',
  }
  const [slide, setSlide] = useState(0)
  const [activeT, setActiveT] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setTimeout(() => setLoaded(true), 80)
    const s = setInterval(() => setSlide(p => (p + 1) % slides.length), 6000)
    const t = setInterval(() => setActiveT(p => (p + 1) % testimonials.length), 5500)
    return () => { clearInterval(s); clearInterval(t) }
  }, [])

  const featured = deals.filter(d => d.featured)

  return (
    <div style={{ background: C.cream, overflowX: 'hidden' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes ticker { from { transform:translateX(0); } to { transform:translateX(-50%); } }
        .dest-card img { transition: transform 0.6s ease; }
        .dest-card:hover img { transform: scale(1.06); }
        .dest-card:hover .dest-btn { opacity:1 !important; transform:translateY(0) !important; }
        .deal-card { transition: all 0.4s cubic-bezier(0.16,1,0.3,1); }
        .deal-card:hover { transform: translateY(-10px) !important; box-shadow: 0 32px 64px rgba(196,154,69,0.18) !important; }
        .team-card:hover { transform: translateY(-6px) !important; box-shadow: 0 20px 48px rgba(196,154,69,0.15) !important; }
        .why-card:hover { background: linear-gradient(135deg,${C.teal},#2d6666) !important; }
        .why-card:hover .why-icon { background: rgba(255,255,255,0.15) !important; }
        .why-card:hover .why-title { color:white !important; }
        .why-card:hover .why-body { color:rgba(255,255,255,0.82) !important; }
        .ticker-inner { display:flex; width:max-content; animation:ticker 30s linear infinite; }
        .slide-btn-primary:hover { background: ${C.goldDark} !important; transform:translateY(-2px); box-shadow: 0 16px 40px rgba(160,120,48,0.45) !important; }
        .slide-btn-ghost:hover { background: rgba(255,255,255,0.22) !important; }

        @media (max-width: 900px) {
          .hero-logo-wrap { margin-top: 80px !important; margin-bottom: 16px !important; }
        }

        @media (max-width: 768px) {
          .hero-logo { width: 100px !important; height: 100px !important; }
          .hero-logo-wrap { display: none !important; }
          .hero-stats { gap: 24px !important; margin-top: 24px !important; padding-top: 20px !important; }
          .trust-bar-inner { flex-wrap: wrap !important; gap: 20px !important; padding: 24px 20px !important; }
          .trust-bar-item { width: 40% !important; }
          .welcome-split { grid-template-columns: 1fr !important; }
          .welcome-left { padding: 60px 24px !important; }
          .welcome-right { padding: 40px 24px !important; }
          .dest-grid { grid-template-columns: 1fr 1fr !important; }
          .dest-card-wrap { height: 200px !important; }
          .section-pad { padding: 60px 20px !important; }
          .team-grid { grid-template-columns: 1fr !important; }
          .why-grid { grid-template-columns: 1fr !important; }
          .deals-grid { grid-template-columns: 1fr !important; }
          .cta-section { height: auto !important; min-height: 480px !important; }
          .cta-content { padding: 60px 24px !important; align-items: center !important; text-align: center !important; }
          .cta-btns { justify-content: center !important; }
          .section-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .testimonial-card { padding: 32px 24px !important; }
          .stat-number { font-size: 38px !important; }
          .stat-row { padding: 20px 0 !important; }
        }

        @media (max-width: 480px) {
          .dest-grid { grid-template-columns: 1fr !important; }
          .hero-stats { flex-direction: column !important; gap: 16px !important; }
          .trust-bar-item { width: 45% !important; }
        }
      `}</style>

      {/* HERO */}
      <section style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        {slides.map((s, i) => (
          <div key={i} style={{
            position: 'absolute', inset: 0,
            opacity: slide === i ? 1 : 0,
            transition: 'opacity 2s ease',
            zIndex: slide === i ? 1 : 0,
          }}>
            <img src={s.url} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(46,35,24,0.72) 0%, rgba(46,35,24,0.38) 55%, rgba(46,35,24,0.1) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(196,154,69,0.18) 0%, transparent 50%)' }} />
          </div>
        ))}

        <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: 780, width: '100%', paddingBottom: 60 }}>
            <div className="hero-logo-wrap" style={{ opacity: loaded ? 1 : 0, animation: loaded ? 'fadeUp 0.9s ease forwards' : 'none', marginBottom: 24, marginTop: 80 }}>
              <img className="hero-logo" src="/logo.png" alt="FHJ Dream Destinations"
                style={{ width: 140, height: 140, objectFit: 'contain', filter: 'drop-shadow(0 4px 24px rgba(196,154,69,0.5))' }} />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 18, opacity: loaded ? 1 : 0, animation: loaded ? 'fadeUp 0.9s ease 0.15s both' : 'none' }}>
              <div style={{ width: 36, height: 1.5, background: C.goldLight, borderRadius: 2 }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 5, color: C.goldLight, fontWeight: 600 }}>{slides[slide].eyebrow.toUpperCase()}</span>
              <div style={{ width: 36, height: 1.5, background: C.goldLight, borderRadius: 2 }} />
            </div>

            <div style={{ opacity: loaded ? 1 : 0, animation: loaded ? 'fadeUp 0.9s ease 0.25s both' : 'none' }}>
              <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontWeight: 300, fontSize: 'clamp(42px, 8vw, 96px)', lineHeight: 0.97, color: '#FDF6EC', margin: 0, textShadow: '0 2px 24px rgba(46,35,24,0.3)' }}>
                {slides[slide].title}<br />
                <em style={{ color: C.goldLight }}>{slides[slide].sub}</em>
              </h1>
            </div>

            <p style={{ fontSize: 16, color: 'rgba(253,246,236,0.78)', lineHeight: 1.8, maxWidth: 520, margin: '24px auto 36px', fontWeight: 300, opacity: loaded ? 1 : 0, animation: loaded ? 'fadeUp 0.9s ease 0.38s both' : 'none' }}>
              A real team personally dedicated to crafting the vacation you've always imagined — from first call to final goodbye.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', opacity: loaded ? 1 : 0, animation: loaded ? 'fadeUp 0.9s ease 0.48s both' : 'none' }}>
              <Link href="/book-appointment" className="slide-btn-primary" style={{ background: C.gold, color: C.text, padding: '15px 36px', borderRadius: 6, fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 3, fontWeight: 800, textDecoration: 'none', display: 'inline-block', boxShadow: `0 10px 36px rgba(196,154,69,0.38)`, transition: 'all 0.3s' }}>PLAN MY VACATION</Link>
              <Link href="/about" className="slide-btn-ghost" style={{ background: 'rgba(253,246,236,0.12)', color: '#FDF6EC', border: '1.5px solid rgba(232,200,122,0.45)', padding: '15px 32px', borderRadius: 6, fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 3, textDecoration: 'none', display: 'inline-block', transition: 'all 0.3s' }}>{hero.cta_secondary}</Link>
            </div>

            <div className="hero-stats" style={{ display: 'flex', gap: 48, marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(232,200,122,0.25)', justifyContent: 'center', opacity: loaded ? 1 : 0, animation: loaded ? 'fadeUp 0.9s ease 0.58s both' : 'none' }}>
              {[['250+','Trips Crafted'],['48','Countries'],['98%','Return Rate']].map(([n, l]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 36, color: C.goldLight, lineHeight: 1 }}>{n}</div>
                  <div style={{ fontSize: 11, color: 'rgba(253,246,236,0.55)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 6, fontFamily: 'Cinzel, serif' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setSlide(i)} style={{ width: slide === i ? 30 : 8, height: 8, borderRadius: 4, background: slide === i ? C.gold : 'rgba(232,200,122,0.4)', border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
          ))}
        </div>
      </section>

      {/* TRUST BAR */}
      <section style={{ background: C.sand, borderBottom: `1px solid rgba(196,154,69,0.2)`, position: 'relative', zIndex: 20 }}>
        <div className="trust-bar-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 60px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          {[
            { icon: '⭐', label: '99% Satisfaction' },
            { icon: '🌍', label: '48+ Countries' },
            { icon: '🦁', label: 'Expert Safari Guides' },
            { icon: '🚢', label: 'Luxury Cruise Lines' },
            { icon: '📞', label: '24/7 Personal Support' },
          ].map((item, i) => (
            <div className="trust-bar-item" key={i} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 26 }}>{item.icon}</span>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, color: C.brown, fontWeight: 700 }}>{item.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TICKER */}
      <div style={{ background: C.teal, padding: '13px 0', overflow: 'hidden' }}>
        <div className="ticker-inner">
          {[...Array(2)].map((_, j) => (
            <span key={j} style={{ display: 'inline-flex', gap: 52, paddingRight: 52 }}>
              {['MALDIVES','SANTORINI','BORA BORA','SERENGETI','KYOTO','AMALFI COAST','DUBAI','BALI','ICELAND','VENICE','PARIS','SEYCHELLES'].map(d => (
                <span key={d} style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 5, color: 'rgba(253,246,236,0.75)', fontWeight: 600, whiteSpace: 'nowrap' }}>✦ {d}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* WELCOME SPLIT */}
      <section className="welcome-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <div className="welcome-left" style={{ background: C.sand, padding: '96px 72px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 5, color: C.teal, marginBottom: 20, fontWeight: 700 }}>WELCOME TO FHJ</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(30px,3.5vw,54px)', fontWeight: 300, color: C.text, lineHeight: 1.15, marginBottom: 24 }}>
            We don't just book trips.<br />
            <em style={{ color: C.teal }}>We craft experiences</em><br />
            you'll carry forever.
          </h2>
          <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.9, marginBottom: 16 }}>
            FHJ Dream Destinations is a boutique luxury travel team — not a call center, not a booking engine. You'll work directly with our experts who know your name, your style, and exactly what makes a vacation perfect for <em>you</em>.
          </p>
          <p style={{ fontSize: 17, color: C.muted, lineHeight: 1.9, marginBottom: 36 }}>
            Whether it's a private safari in the Serengeti, a family cruise through the Caribbean, or a romantic escape to Santorini — we handle every detail with the care you deserve.
          </p>
          <Link href="/about" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: C.teal, fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 3, textDecoration: 'none', fontWeight: 700, borderBottom: `2px solid rgba(58,125,125,0.3)`, paddingBottom: 4, width: 'fit-content' }}>OUR STORY →</Link>
        </div>

        <div className="welcome-right" style={{ background: C.cream, padding: '96px 72px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0 }}>
          {[
            { n: '250+', l: 'Vacations crafted', s: 'and every one of them personal' },
            { n: '48', l: 'Countries covered', s: 'on every continent on earth' },
            { n: '98%', l: 'Clients return', s: "because once isn't enough" },
            { n: '5★', l: 'Rated across the board', s: 'by the travelers who matter most' },
          ].map(({ n, l, s }, i) => (
            <div className="stat-row" key={l} style={{ display: 'flex', alignItems: 'center', gap: 28, padding: '28px 0', borderBottom: i < 3 ? `1px solid rgba(196,154,69,0.15)` : 'none' }}>
              <div className="stat-number" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 52, color: C.gold, lineHeight: 1, fontWeight: 300, minWidth: 80 }}>{n}</div>
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 2, color: C.text, fontWeight: 700, marginBottom: 4 }}>{l.toUpperCase()}</div>
                <div style={{ fontSize: 16, color: C.muted, fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>{s}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DESTINATIONS + DEALS */}
      <section className="section-pad" style={{ padding: '100px 60px', background: C.cream }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 52 }}>
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 5, color: C.teal, marginBottom: 14, fontWeight: 700 }}>WHERE WILL YOU GO?</div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(30px,4vw,60px)', fontWeight: 300, color: C.text, lineHeight: 1 }}>
                Destinations & <em style={{ color: C.teal }}>Featured Deals</em>
              </h2>
            </div>
            <Link href="/book" style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 3, color: C.teal, textDecoration: 'none', fontWeight: 700, borderBottom: `1px solid rgba(58,125,125,0.3)`, paddingBottom: 2, whiteSpace: 'nowrap' }}>VIEW ALL →</Link>
          </div>

          <div className="dest-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 16 }}>
            {destinations.map((dest, i) => (
              <div key={dest.name} className="dest-card dest-card-wrap" style={{ borderRadius: 12, overflow: 'hidden', cursor: 'pointer', position: 'relative', height: i === 0 || i === 3 ? 300 : 240, boxShadow: `0 6px 28px rgba(196,154,69,0.12)`, border: `1px solid rgba(196,154,69,0.15)` }}>
                <img src={dest.img} alt={dest.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(46,35,24,0.72) 0%, rgba(46,35,24,0.05) 55%, transparent 100%)' }} />
                <div className="dest-btn" style={{ position: 'absolute', inset: 0, background: 'rgba(196,154,69,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'all 0.35s ease', transform: 'translateY(8px)' }}>
                  <Link href="/book-appointment" onClick={e => e.stopPropagation()} style={{ background: C.gold, color: C.text, padding: '11px 30px', borderRadius: 6, fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 2, fontWeight: 800, textDecoration: 'none', boxShadow: '0 6px 20px rgba(196,154,69,0.4)' }}>PLAN THIS TRIP</Link>
                </div>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '14px 16px' }}>
                  <div style={{ display: 'inline-block', background: C.gold, borderRadius: 3, padding: '3px 8px', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, color: C.text, fontWeight: 700, marginBottom: 4 }}>{dest.tag.toUpperCase()}</div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 2, color: '#FDF6EC', fontWeight: 700 }}>{dest.name.toUpperCase()}</div>
                </div>
              </div>
            ))}
          </div>

          {featured.length > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '56px 0 48px' }}>
                <div style={{ flex: 1, height: 1, background: `rgba(196,154,69,0.2)` }} />
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 4, color: C.teal, fontWeight: 700, whiteSpace: 'nowrap' }}>✦ FEATURED EXPERIENCES ✦</div>
                <div style={{ flex: 1, height: 1, background: `rgba(196,154,69,0.2)` }} />
              </div>

              <div className="deals-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
                {featured.map(deal => (
                  <div key={deal.id} className="deal-card" style={{ background: C.sand, borderRadius: 12, overflow: 'hidden', border: `1px solid rgba(196,154,69,0.2)`, boxShadow: `0 6px 28px rgba(196,154,69,0.1)` }}>
                    <div style={{ height: 180, background: `linear-gradient(135deg, ${C.teal} 0%, #2d6666 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 68, position: 'relative' }}>
                      {deal.image}
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)` }} />
                      <div style={{ position: 'absolute', top: 16, left: 16, background: C.gold, borderRadius: 3, padding: '4px 12px', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, color: C.text, fontWeight: 800 }}>{deal.category?.toUpperCase()}</div>
                    </div>
                    <div style={{ padding: '24px 24px 28px' }}>
                      <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, color: C.text, marginBottom: 10, fontWeight: 400, lineHeight: 1.2 }}>{deal.title}</h3>
                      <p style={{ color: C.muted, fontSize: 16, lineHeight: 1.75, marginBottom: 20 }}>{deal.description}</p>
                      <div style={{ height: 1, background: `rgba(196,154,69,0.2)`, marginBottom: 20 }} />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div>
                          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, color: C.muted, marginBottom: 4 }}>FROM</div>
                          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: C.teal, lineHeight: 1, fontWeight: 300 }}>{deal.price}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, color: C.muted, marginBottom: 4 }}>DURATION</div>
                          <div style={{ fontSize: 16, color: C.text, fontWeight: 700 }}>{deal.duration}</div>
                        </div>
                      </div>
                      <Link href="/book" style={{ display: 'block', textAlign: 'center', padding: '13px', background: C.teal, color: '#FDF6EC', fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 3, textDecoration: 'none', borderRadius: 6, fontWeight: 700 }}>BOOK THIS EXPERIENCE</Link>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ textAlign: 'center', marginTop: 48 }}>
                <Link href="/book" style={{ display: 'inline-block', padding: '14px 44px', border: `2px solid ${C.teal}`, color: C.teal, fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 3, textDecoration: 'none', borderRadius: 6, fontWeight: 700 }}>REQUEST CUSTOM ITINERARY</Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* MEET THE TEAM */}
      <section className="section-pad" style={{ padding: '100px 60px', background: C.tealLight }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 5, color: C.teal, marginBottom: 14, fontWeight: 700 }}>YOUR PERSONAL TRAVEL TEAM</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(32px,4vw,58px)', fontWeight: 300, color: C.text, lineHeight: 1.1, marginBottom: 14 }}>
              Real people. Real <em style={{ color: C.teal }}>passion.</em>
            </h2>
            <p style={{ color: C.muted, fontSize: 17, maxWidth: 520, margin: '0 auto', lineHeight: 1.75 }}>
              When you work with FHJ, you're not getting a ticket number. You're getting a dedicated human being who genuinely cares about your vacation.
            </p>
          </div>
          <div className="team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {team.map((m, i) => (
              <div key={i} className="team-card" style={{ background: C.cream, borderRadius: 12, padding: '44px 32px', textAlign: 'center', border: `1px solid rgba(196,154,69,0.2)`, boxShadow: `0 4px 20px rgba(196,154,69,0.08)`, transition: 'all 0.35s', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${C.teal}, ${C.gold})` }} />
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: `linear-gradient(135deg, ${C.teal}, #2d6666)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px', fontFamily: 'Cinzel, serif', fontSize: 22, color: '#FDF6EC', fontWeight: 700, boxShadow: `0 8px 24px rgba(58,125,125,0.3)` }}>{m.initials}</div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: C.text, marginBottom: 6, fontWeight: 400 }}>{m.name}</div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, color: C.teal, marginBottom: 8, fontWeight: 700 }}>{m.role.toUpperCase()}</div>
                <div style={{ height: 1, background: `rgba(196,154,69,0.2)`, margin: '14px 0' }} />
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 17, color: C.muted, fontStyle: 'italic' }}>{m.specialty}</div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link href="/about" style={{ display: 'inline-block', padding: '14px 44px', background: C.teal, color: '#FDF6EC', fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 3, textDecoration: 'none', borderRadius: 6, fontWeight: 700 }}>READ OUR FULL STORY</Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section-pad" style={{ padding: '100px 60px', background: C.sand }}>
        <div style={{ maxWidth: 880, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 5, color: C.teal, marginBottom: 14, fontWeight: 700 }}>TRAVELER STORIES</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(28px,4vw,54px)', fontWeight: 300, color: C.text, marginBottom: 56 }}>
            Real trips. Real <em style={{ color: C.teal }}>memories.</em>
          </h2>
          <div style={{ position: 'relative', minHeight: 320 }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ position: 'absolute', inset: 0, opacity: activeT === i ? 1 : 0, transition: 'opacity 0.9s ease', pointerEvents: activeT === i ? 'auto' : 'none' }}>
                <div className="testimonial-card" style={{ background: C.cream, borderRadius: 16, padding: '48px 56px', border: `1px solid rgba(196,154,69,0.2)`, boxShadow: `0 8px 40px rgba(196,154,69,0.1)` }}>
                  <div style={{ fontSize: 56, color: `rgba(196,154,69,0.35)`, fontFamily: 'Georgia', lineHeight: 1, marginBottom: 4 }}>"</div>
                  <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 19, color: C.text, lineHeight: 1.8, fontStyle: 'italic', marginBottom: 32 }}>{t.quote}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                    <div style={{ width: 46, height: 46, borderRadius: '50%', background: `linear-gradient(135deg, ${C.teal}, ${C.gold})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cinzel, serif', fontSize: 13, color: '#FDF6EC', fontWeight: 700 }}>{t.initials}</div>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 2, color: C.text, fontWeight: 700 }}>{t.name}</div>
                      <div style={{ fontSize: 16, color: C.muted, marginTop: 3 }}>{t.trip}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {[...Array(5)].map((_, s) => <span key={s} style={{ fontSize: 16, color: C.gold }}>★</span>)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 340 }}>
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setActiveT(i)} style={{ width: activeT === i ? 28 : 8, height: 8, borderRadius: 4, background: activeT === i ? C.teal : `rgba(58,125,125,0.25)`, border: 'none', cursor: 'pointer', transition: 'all 0.3s', padding: 0 }} />
            ))}
          </div>
        </div>
      </section>

      {/* WHY FHJ */}
      <section className="section-pad" style={{ padding: '100px 60px', background: C.cream }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 5, color: C.teal, marginBottom: 14, fontWeight: 700 }}>THE FHJ DIFFERENCE</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(32px,4vw,58px)', fontWeight: 300, color: C.text }}>
              Why travelers <em style={{ color: C.teal }}>choose us</em>
            </h2>
          </div>
          <div className="why-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {[
              { icon: '🤝', title: 'Personal, Not Transactional', body: 'You get a real human who remembers your name, your preferences, and your last vacation. No chatbots, no ticket numbers — just genuine care.' },
              { icon: '✈️', title: "We've Been There", body: "Our team has personally visited the destinations we recommend. We know which overwater villa catches the best sunrise and which safari camp feels like home." },
              { icon: '📞', title: '24/7 Real Support', body: "Flight delayed at midnight? We're awake. Something needs adjusting abroad? We're on it immediately. Your peace of mind is our job." },
              { icon: '💫', title: 'Magic in the Details', body: "Champagne on arrival, a table at that impossible restaurant, a private sunset cruise — the touches that transform a trip into a masterpiece." },
            ].map((item, i) => (
              <div key={i} className="why-card" style={{ background: C.sand, borderRadius: 12, padding: '32px 28px', display: 'flex', gap: 20, alignItems: 'flex-start', border: `1px solid rgba(196,154,69,0.18)`, boxShadow: `0 4px 20px rgba(196,154,69,0.07)`, transition: 'all 0.4s', cursor: 'default' }}>
                <div className="why-icon" style={{ fontSize: 32, flexShrink: 0, width: 60, height: 60, borderRadius: 12, background: `rgba(58,125,125,0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.4s' }}>{item.icon}</div>
                <div>
                  <div className="why-title" style={{ fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 2, color: C.text, fontWeight: 700, marginBottom: 10, transition: 'color 0.4s' }}>{item.title.toUpperCase()}</div>
                  <p className="why-body" style={{ fontSize: 16, color: C.muted, lineHeight: 1.85, margin: 0, transition: 'color 0.4s' }}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" style={{ position: 'relative', height: 540, overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1800&q=80" alt="Luxury Travel" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(74,55,40,0.78) 0%, rgba(74,55,40,0.5) 60%, rgba(74,55,40,0.2) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(196,154,69,0.2) 0%, transparent 60%)' }} />
        <div className="cta-content" style={{ position: 'absolute', inset: 0, zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '0 8%' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 8, color: C.goldLight, marginBottom: 24, fontWeight: 600 }}>✦ YOUR TEAM IS READY ✦</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(36px,5.5vw,76px)', color: '#FDF6EC', fontWeight: 300, lineHeight: 1.05, marginBottom: 20, maxWidth: 640 }}>
            {hero.headline1}<br />
            <em style={{ color: C.goldLight }}>{hero.headline2}</em>
          </h2>
          <p style={{ color: 'rgba(253,246,236,0.75)', fontSize: 17, lineHeight: 1.8, marginBottom: 40, maxWidth: 480 }}>{hero.subtext}</p>
          <div className="cta-btns" style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <Link href="/book-appointment" className="slide-btn-primary" style={{ background: C.gold, color: C.text, padding: '16px 44px', borderRadius: 6, fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 3, fontWeight: 800, textDecoration: 'none', display: 'inline-block', boxShadow: `0 10px 36px rgba(196,154,69,0.4)`, transition: 'all 0.3s' }}>{hero.cta_primary}</Link>
            <Link href="/about" className="slide-btn-ghost" style={{ background: 'rgba(253,246,236,0.12)', color: '#FDF6EC', border: '1.5px solid rgba(232,200,122,0.4)', padding: '16px 36px', borderRadius: 6, fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 2, textDecoration: 'none', display: 'inline-block', transition: 'all 0.3s' }}>{hero.cta_secondary}</Link>
          </div>
        </div>
      </section>
    </div>
  )
}