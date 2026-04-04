import { createClient } from '@/lib/supabase/server'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default async function AboutPage() {
  const supabase = await createClient()

  // Fetch all about content sections
  const { data: sections } = await supabase
    .from('about_content')
    .select('*')

  const get = (key: string) => sections?.find(s => s.section === key)?.content || {}

  const hero = get('hero')
  const mission = get('mission')
  const stats: any[] = get('stats') as any || []
  const team: any[] = get('team') as any || []
  const values: any[] = get('values') as any || []

  return (
    <div style={{ background: 'var(--ivory)' }}>
      <Navigation />

      {/* ── HERO ── */}
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #FDFAF3 0%, #EDF7F7 55%, #FDFAF3 100%)', position: 'relative', overflow: 'hidden', paddingTop: 120 }}>
        <div style={{ position: 'absolute', top: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(14,143,143,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '3%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,154,10,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Corner marks */}
        {(['tl','tr','bl','br'] as const).map(c => (
          <div key={c} style={{ position: 'absolute', top: c.startsWith('t') ? 100 : 'auto', bottom: c.startsWith('b') ? 28 : 'auto', left: c.endsWith('l') ? 28 : 'auto', right: c.endsWith('r') ? 28 : 'auto', width: 28, height: 28, borderTop: c.startsWith('t') ? '2px solid rgba(14,143,143,0.3)' : 'none', borderBottom: c.startsWith('b') ? '2px solid rgba(14,143,143,0.3)' : 'none', borderLeft: c.endsWith('l') ? '2px solid rgba(14,143,143,0.3)' : 'none', borderRight: c.endsWith('r') ? '2px solid rgba(14,143,143,0.3)' : 'none' }} />
        ))}

        <div style={{ textAlign: 'center', maxWidth: 800, padding: '0 40px', zIndex: 1 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 6, color: 'var(--teal)', marginBottom: 16, fontWeight: 600 }}>
            {hero.tagline || 'EST. 2018'}
          </div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(44px,7vw,88px)', fontWeight: 300, lineHeight: 1.0, color: 'var(--text-rich)', marginBottom: 12 }}>
            {hero.subtitle || 'Our'} <em style={{ color: 'var(--teal-dark)' }}>Story</em>
          </h1>
          <div style={{ width: 3, height: 48, background: 'linear-gradient(to bottom, var(--teal), var(--gold))', margin: '24px auto', borderRadius: 2 }} />
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(24px,3vw,36px)', fontWeight: 300, color: 'var(--text-rich)', marginBottom: 20 }}>
            {hero.title || 'The Art of Extraordinary Travel'}
          </h2>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'var(--muted)', fontStyle: 'italic', lineHeight: 1.7 }}>
            Curated Journeys, Crafted with Intention
          </p>
        </div>
      </div>

      {/* ── STATS ── */}
      {stats.length > 0 && (
        <div style={{ background: 'var(--teal-dark)', padding: '56px 60px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: `repeat(${stats.length}, 1fr)`, gap: 40 }}>
            {stats.map((stat: any, i: number) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 52, fontWeight: 300, color: 'var(--gold-light)', lineHeight: 1 }}>{stat.number}</div>
                <div style={{ height: 2, width: 40, background: 'rgba(255,255,255,0.3)', margin: '14px auto' }} />
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── MISSION ── */}
      <section style={{ padding: '100px 60px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 4, color: 'var(--teal)', marginBottom: 20, fontWeight: 600 }}>OUR MISSION</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 300, color: 'var(--text-rich)', lineHeight: 1.1, marginBottom: 28 }}>
              More Than a<br /><em style={{ color: 'var(--teal-dark)' }}>Travel Agency</em>
            </h2>
            <div style={{ width: 60, height: 3, background: 'linear-gradient(90deg, var(--teal), var(--gold))', marginBottom: 28, borderRadius: 2 }} />
            <p style={{ fontSize: 17, color: 'var(--muted)', lineHeight: 1.9, marginBottom: 24 }}>
              {mission.statement || 'FHJ Dream Destinations was born from a belief that the world\'s most extraordinary places deserved equally extraordinary stewardship.'}
            </p>
            <Link href="/book" className="btn-teal" style={{ borderRadius: 4, padding: '14px 40px', fontSize: 12, display: 'inline-block' }}>
              Begin Your Journey
            </Link>
          </div>

          {/* Quote block */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: -20, left: -20, fontSize: 120, color: 'rgba(14,143,143,0.08)', fontFamily: 'Georgia, serif', lineHeight: 1, pointerEvents: 'none' }}>"</div>
            <div style={{ background: 'white', border: '1px solid rgba(196,154,10,0.2)', borderRadius: 8, padding: '44px 40px', boxShadow: '0 8px 48px rgba(14,143,143,0.08)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, var(--teal-dark), var(--gold))', borderRadius: '8px 8px 0 0' }} />
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontStyle: 'italic', color: 'var(--text-rich)', lineHeight: 1.75, marginBottom: 24 }}>
                "{mission.quote || 'Travel is the only purchase that makes you richer — and at FHJ, we ensure every journey transforms not just your stamp collection, but your very perspective on life.'}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal-dark), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'Cinzel, serif', fontSize: 14, fontWeight: 700 }}>FHJ</div>
                <div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, color: 'var(--text-rich)', fontWeight: 700, letterSpacing: 1 }}>Frederick H. Johnson</div>
                  <div style={{ fontSize: 13, color: 'var(--teal)', fontStyle: 'italic' }}>Founder, FHJ Dream Destinations</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      {values.length > 0 && (
        <section style={{ padding: '80px 60px', background: 'var(--ivory-dark)', borderTop: '1px solid rgba(196,154,10,0.12)' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: 'var(--teal)', marginBottom: 14, fontWeight: 600 }}>WHAT WE STAND FOR</div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 300, color: 'var(--text-rich)' }}>
                Our Core <em style={{ color: 'var(--teal-dark)' }}>Values</em>
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(values.length, 3)}, 1fr)`, gap: 24 }}>
              {values.map((v: any, i: number) => (
                <div key={i} style={{ background: 'white', borderRadius: 8, padding: '36px 28px', border: '1px solid rgba(196,154,10,0.18)', boxShadow: '0 2px 16px rgba(196,154,10,0.06)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--teal-dark), var(--gold))' }} />
                  <div style={{ fontSize: 36, marginBottom: 18 }}>{v.icon}</div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, color: 'var(--teal-dark)', marginBottom: 12, fontWeight: 700 }}>{v.title}</div>
                  <p style={{ fontSize: 16, color: 'var(--muted)', lineHeight: 1.75 }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TEAM ── */}
      {team.length > 0 && (
        <section style={{ padding: '100px 60px', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: 'var(--teal)', marginBottom: 14, fontWeight: 600 }}>THE PEOPLE BEHIND THE MAGIC</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(32px,4vw,52px)', fontWeight: 300, color: 'var(--text-rich)' }}>
              Meet Our <em style={{ color: 'var(--teal-dark)' }}>Team</em>
            </h2>
            <div style={{ width: 80, height: 2, background: 'linear-gradient(90deg, var(--teal), var(--gold))', margin: '24px auto 0', borderRadius: 2 }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 28 }}>
            {team.map((member: any, i: number) => (
              <div key={i} style={{ background: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(196,154,10,0.18)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', transition: 'all 0.3s' }}>
                {/* Avatar */}
                <div style={{ height: 180, background: `linear-gradient(135deg, var(--teal-dark), var(--teal))`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: '3px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cinzel, serif', fontSize: 28, color: 'white', fontWeight: 700 }}>
                    {member.initials || member.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--gold-dark), var(--gold-light))' }} />
                </div>
                <div style={{ padding: '24px 24px 28px' }}>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, fontWeight: 400, color: 'var(--text-rich)', marginBottom: 4 }}>{member.name}</div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--teal)', marginBottom: 14, fontWeight: 600 }}>{member.title}</div>
                  <div style={{ height: 1, background: 'linear-gradient(90deg, var(--teal), transparent)', marginBottom: 16 }} />
                  <p style={{ fontSize: 15, color: 'var(--muted)', lineHeight: 1.75 }}>{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <div style={{ background: 'linear-gradient(135deg, var(--teal-dark), var(--teal))', padding: '90px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(196,154,10,0.1)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: 'rgba(255,255,255,0.65)', marginBottom: 18, fontWeight: 600 }}>READY TO BEGIN?</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(36px,5vw,64px)', color: 'white', fontWeight: 300, lineHeight: 1.1, marginBottom: 20 }}>
            Let's Craft Your <em style={{ color: 'var(--gold-light)' }}>Dream Journey</em>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: 17, lineHeight: 1.75, marginBottom: 44 }}>
            Every extraordinary journey begins with a conversation. Schedule your complimentary consultation today.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/book-appointment" className="btn-gold" style={{ borderRadius: 4, padding: '15px 48px', fontSize: 12 }}>
              Schedule Consultation
            </Link>
            <Link href="/book" style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1.5px solid rgba(255,255,255,0.4)', padding: '15px 36px', fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, textDecoration: 'none', display: 'inline-block', borderRadius: 4 }}>
              Submit Inquiry
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}