import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'

const values = [
  {
    icon: '🤝',
    title: 'Deeply Personal',
    desc: "We take time to truly know you — your travel style, your pace, your preferences, the things that make a trip feel like you. Every itinerary we build is designed around a real conversation, not a template.",
  },
  {
    icon: '✦',
    title: 'Curated, Not Generic',
    desc: "We don't hand you a brochure. We handpick every hotel, excursion, and experience based on what we know about you. The result is a journey that feels effortless — because we did the work.",
  },
  {
    icon: '📞',
    title: 'Here Every Step of the Way',
    desc: "From your first call to your last goodbye, we're with you. Have a question at 10pm? Call us. Flight changed last minute? We handle it. You should never feel alone when you travel with FHJ.",
  },
  {
    icon: '💛',
    title: 'Passion Over Profit',
    desc: "Hortense didn't start FHJ to build a booking machine. She started it because she believes travel changes people — and she wanted to be part of that change. That spirit lives in everything we do.",
  },
]

const milestones = [
  { number: '2011', label: 'Founded with a passion and a promise' },
  { number: '14+', label: 'Years crafting dream journeys' },
  { number: '500+', label: 'Happy travelers and counting' },
  { number: '48+', label: 'Countries we have explored for you' },
]

export default function AboutPage() {
  return (
    <div style={{ background: '#FDFAF3', overflowX: 'hidden' }}>
      <Navigation />

      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        .about-fade { animation: fadeUp 0.9s ease both; }
        @media (max-width: 768px) {
          .about-hero { padding: 60px 24px 80px !important; min-height: auto !important; }
          .about-hero h1 { font-size: clamp(44px, 11vw, 80px) !important; }
          .origin-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .values-grid { grid-template-columns: 1fr !important; }
          .milestones-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
          .section-inner { padding: 70px 24px !important; }
          .cta-inner { padding: 70px 24px !important; }
          .cta-btns { flex-direction: column !important; align-items: stretch !important; }
          .cta-btns a { text-align: center !important; }
        }
        @media (max-width: 480px) {
          .milestones-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <div className="about-hero" style={{
        minHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '140px 40px 100px',
        background: 'linear-gradient(160deg, #FDFAF3 0%, #EDF7F7 55%, #FDFAF3 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '8%', right: '6%', width: 380, height: 380, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,143,143,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '6%', left: '4%', width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,154,10,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        {/* Corner marks */}
        {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v, h]) => (
          <div key={v+h} style={{ position: 'absolute', top: v==='top' ? 100 : 'auto', bottom: v==='bottom' ? 28 : 'auto', left: h==='left' ? 28 : 'auto', right: h==='right' ? 28 : 'auto', width: 30, height: 30, borderTop: v==='top' ? '2px solid rgba(14,143,143,0.25)' : 'none', borderBottom: v==='bottom' ? '2px solid rgba(14,143,143,0.25)' : 'none', borderLeft: h==='left' ? '2px solid rgba(14,143,143,0.25)' : 'none', borderRight: h==='right' ? '2px solid rgba(14,143,143,0.25)' : 'none' }} />
        ))}

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 820 }}>
          <div className="about-fade" style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 7, color: '#3A7D7D', marginBottom: 20, fontWeight: 600, animationDelay: '0.1s' }}>
            ✦ OUR STORY ✦
          </div>

          <h1 className="about-fade" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(54px, 10vw, 100px)', fontWeight: 300, lineHeight: 0.95, color: '#2E2318', marginBottom: 16, animationDelay: '0.2s' }}>
            Born from a<br /><em style={{ color: '#3A7D7D' }}>Love of Travel</em>
          </h1>

          <div className="about-fade" style={{ width: 3, height: 56, background: 'linear-gradient(to bottom, #3A7D7D, #C49A45)', margin: '28px auto', borderRadius: 2, animationDelay: '0.35s' }} />

          <p className="about-fade" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(19px, 2.5vw, 24px)', color: 'rgba(44,32,16,0.7)', lineHeight: 1.75, fontStyle: 'italic', maxWidth: 640, margin: '0 auto', animationDelay: '0.45s' }}>
            "Curated Journeys, Crafted with Intention"
          </p>
        </div>
      </div>

      {/* ── ORIGIN STORY ── */}
      <section style={{ background: '#F5ECD7', borderTop: '1px solid rgba(196,154,10,0.15)', borderBottom: '1px solid rgba(196,154,10,0.15)' }}>
        <div className="section-inner origin-grid" style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>

          {/* Story text */}
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#3A7D7D', marginBottom: 20, fontWeight: 600 }}>HOW IT ALL BEGAN</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 300, color: '#2E2318', lineHeight: 1.1, marginBottom: 28 }}>
              A Passion That<br /><em style={{ color: '#3A7D7D' }}>Became a Purpose</em>
            </h2>
            <div style={{ width: 56, height: 3, background: 'linear-gradient(90deg, #3A7D7D, #C49A45)', marginBottom: 28, borderRadius: 2 }} />
            <p style={{ fontSize: 17, color: '#8A7A6A', lineHeight: 1.95, marginBottom: 22 }}>
              FHJ Dream Destinations was born in 2011 from something beautifully simple — <strong style={{ color: '#2E2318' }}>Hortense Jeffers' love of travel.</strong> Long before it was a business, it was a feeling. The thrill of landing somewhere new. The magic of a perfectly planned trip unfolding exactly as it should. The joy of coming home changed.
            </p>
            <p style={{ fontSize: 17, color: '#8A7A6A', lineHeight: 1.95, marginBottom: 22 }}>
              Hortense spent years helping friends and family plan their trips — not as a job, but because she genuinely couldn't imagine anything better than helping someone experience the world the right way. Trip by trip, word spread. People weren't just happy with their vacations. They were <em>transformed</em> by them.
            </p>
            <p style={{ fontSize: 17, color: '#8A7A6A', lineHeight: 1.95 }}>
              What started as a passion became a calling. And FHJ Dream Destinations became the home for everything she believed travel could be — personal, intentional, and truly unforgettable.
            </p>
          </div>

          {/* Founder quote card */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: -24, left: -24, fontSize: 140, color: 'rgba(14,143,143,0.07)', fontFamily: 'Georgia, serif', lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>"</div>
            <div style={{ background: 'white', border: '1px solid rgba(196,154,10,0.2)', borderRadius: 12, padding: '48px 40px', boxShadow: '0 12px 48px rgba(14,143,143,0.09)', position: 'relative', overflow: 'hidden' }}>
              {/* Top gradient bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #3A7D7D, #C49A45)' }} />

              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 21, fontStyle: 'italic', color: '#2E2318', lineHeight: 1.8, marginBottom: 32 }}>
                "I didn't start FHJ to be a travel agent. I started it because I believe with everything in me that travel is one of the most powerful things a person can do — and everyone deserves to experience it beautifully."
              </p>

              <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(58,125,125,0.3), transparent)', marginBottom: 24 }} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #076060, #3A7D7D)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Cinzel, serif', fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                  HJ
                </div>
                <div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, color: '#2E2318', fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>Hortense Jeffers</div>
                  <div style={{ fontSize: 14, color: '#3A7D7D', fontStyle: 'italic', fontFamily: 'Cormorant Garamond, serif' }}>Founder & CEO, FHJ Dream Destinations</div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: '#8A7A6A', marginTop: 3 }}>EST. 2011</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MILESTONES ── */}
      <div style={{ background: '#3A7D7D', padding: '60px 40px' }}>
        <div className="milestones-grid" style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40, textAlign: 'center' }}>
          {milestones.map((m, i) => (
            <div key={i}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 54, fontWeight: 300, color: '#E8C87A', lineHeight: 1 }}>{m.number}</div>
              <div style={{ width: 36, height: 2, background: 'rgba(255,255,255,0.3)', margin: '14px auto' }} />
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.78)', fontWeight: 600, lineHeight: 1.5 }}>{m.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MISSION ── */}
      <section className="section-inner" style={{ maxWidth: 820, margin: '0 auto', padding: '100px 60px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#3A7D7D', marginBottom: 20, fontWeight: 600 }}>OUR MISSION</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(32px, 4.5vw, 56px)', fontWeight: 300, color: '#2E2318', lineHeight: 1.1, marginBottom: 28 }}>
          To Make Every Journey Feel Like It Was Made <em style={{ color: '#3A7D7D' }}>Just for You</em>
        </h2>
        <div style={{ width: 56, height: 3, background: 'linear-gradient(90deg, transparent, #3A7D7D, #C49A45, transparent)', margin: '0 auto 32px', borderRadius: 2 }} />
        <p style={{ fontSize: 18, color: '#8A7A6A', lineHeight: 1.95, marginBottom: 20 }}>
          At FHJ Dream Destinations, we believe the world is meant to be experienced — not just seen. Our mission is to remove every barrier between you and the trip of a lifetime. We listen deeply, plan meticulously, and deliver experiences that go far beyond what any algorithm could design.
        </p>
        <p style={{ fontSize: 18, color: '#8A7A6A', lineHeight: 1.95 }}>
          Whether it's a honeymoon in the Maldives, a family reunion cruise through the Caribbean, or a solo adventure across Europe — we bring the same care, creativity, and commitment to every single journey we craft.
        </p>
      </section>

      {/* ── WHAT MAKES US DIFFERENT ── */}
      <section style={{ background: '#F5ECD7', borderTop: '1px solid rgba(196,154,10,0.15)', borderBottom: '1px solid rgba(196,154,10,0.15)', padding: '90px 40px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#3A7D7D', marginBottom: 16, fontWeight: 600 }}>THE FHJ DIFFERENCE</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 300, color: '#2E2318' }}>
              What Sets Us <em style={{ color: '#3A7D7D' }}>Apart</em>
            </h2>
          </div>
          <div className="values-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 24 }}>
            {values.map((v, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 10, padding: '36px 32px', border: '1px solid rgba(196,154,10,0.18)', boxShadow: '0 4px 24px rgba(196,154,10,0.07)', display: 'flex', gap: 24, alignItems: 'flex-start', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #3A7D7D, #C49A45)' }} />
                <div style={{ width: 56, height: 56, borderRadius: 12, background: 'rgba(58,125,125,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>{v.icon}</div>
                <div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, color: '#2E2318', fontWeight: 700, marginBottom: 12 }}>{v.title.toUpperCase()}</div>
                  <p style={{ fontSize: 16, color: '#8A7A6A', lineHeight: 1.85, margin: 0 }}>{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="cta-inner" style={{ background: 'linear-gradient(135deg, #076060 0%, #3A7D7D 60%, #076060 100%)', padding: '100px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Decorative circles */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 220, height: 220, borderRadius: '50%', background: 'rgba(196,154,10,0.1)', pointerEvents: 'none' }} />
        {/* Corner marks */}
        {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v, h]) => (
          <div key={v+h} style={{ position: 'absolute', top: v==='top' ? 28 : 'auto', bottom: v==='bottom' ? 28 : 'auto', left: h==='left' ? 28 : 'auto', right: h==='right' ? 28 : 'auto', width: 28, height: 28, borderTop: v==='top' ? '2px solid rgba(232,200,122,0.35)' : 'none', borderBottom: v==='bottom' ? '2px solid rgba(232,200,122,0.35)' : 'none', borderLeft: h==='left' ? '2px solid rgba(232,200,122,0.35)' : 'none', borderRight: h==='right' ? '2px solid rgba(232,200,122,0.35)' : 'none' }} />
        ))}

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 640, margin: '0 auto' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 7, color: 'rgba(232,200,122,0.85)', marginBottom: 22, fontWeight: 600 }}>LET'S PLAN TOGETHER</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(38px, 5.5vw, 68px)', color: 'white', fontWeight: 300, lineHeight: 1.05, marginBottom: 22 }}>
            Your Dream Trip<br /><em style={{ color: '#E8C87A' }}>Starts with a Call</em>
          </h2>
          <div style={{ width: 56, height: 2, background: 'rgba(232,200,122,0.5)', margin: '0 auto 28px', borderRadius: 2 }} />
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 18, lineHeight: 1.8, marginBottom: 48, maxWidth: 520, marginInline: 'auto' }}>
            Hortense and the FHJ team are ready to listen, dream with you, and craft something truly extraordinary. Your first consultation is completely free.
          </p>
          <div className="cta-btns" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/book-appointment" style={{ background: '#C49A45', color: '#2E2318', padding: '16px 52px', fontFamily: 'Cinzel, serif', fontSize: 12, letterSpacing: 3, textDecoration: 'none', display: 'inline-block', borderRadius: 4, fontWeight: 800, boxShadow: '0 8px 32px rgba(196,154,10,0.4)', transition: 'all 0.3s' }}>
              BOOK FREE CONSULTATION
            </Link>
            <Link href="/book" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)', padding: '16px 40px', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, textDecoration: 'none', display: 'inline-block', borderRadius: 4, transition: 'all 0.3s' }}>
              SUBMIT AN INQUIRY
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
