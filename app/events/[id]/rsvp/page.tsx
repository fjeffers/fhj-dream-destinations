import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import RsvpForm from './RsvpForm'

export default async function EventRsvpPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  let { data: event } = await supabase
    .from('events')
    .select('*, event_rsvps(id, party_size)')
    .eq('slug', id)
    .eq('active', true)
    .single()

  if (!event) {
    const { data } = await supabase
      .from('events')
      .select('*, event_rsvps(id, party_size)')
      .eq('id', id)
      .eq('active', true)
      .single()
    event = data
  }

  if (!event) notFound()

  const totalAttending = event.event_rsvps?.reduce((sum: number, r: any) => sum + (r.party_size || 1), 0) || 0
  const spotsLeft = Math.max(0, (event.capacity || 100) - totalAttending)
  const isFull = spotsLeft === 0

  const formattedDate = event.date
    ? new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div style={{ minHeight: '100vh', background: '#FDFAF3', fontFamily: 'system-ui, sans-serif' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        .story-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .story-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(196,154,10,0.15) !important; }
        @media (max-width: 768px) {
          .details-grid { grid-template-columns: 1fr !important; }
          .hero-title { font-size: 48px !important; }
          .hero-pad { padding: 48px 24px 64px !important; }
          .section-pad { padding: 60px 24px !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════════
          HERO — Full screen cinematic opener
      ══════════════════════════════════════════ */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Background */}
        {event.background_image_url ? (
          <>
            <img src={event.background_image_url} alt="Event" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(7,50,50,0.4) 0%, rgba(7,70,70,0.6) 40%, rgba(7,40,40,0.85) 80%, rgba(7,30,30,0.97) 100%)', zIndex: 1 }} />
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #073030 0%, #0E6060 50%, #073030 100%)', zIndex: 0 }} />
        )}

        {/* Gold corner accents */}
        {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
          <div key={v+h} style={{ position: 'absolute', [v]: 24, [h]: 24, width: 40, height: 40, zIndex: 3,
            borderTop: v==='top' ? '2px solid rgba(196,154,10,0.7)' : 'none',
            borderBottom: v==='bottom' ? '2px solid rgba(196,154,10,0.7)' : 'none',
            borderLeft: h==='left' ? '2px solid rgba(196,154,10,0.7)' : 'none',
            borderRight: h==='right' ? '2px solid rgba(196,154,10,0.7)' : 'none',
          }} />
        ))}

        {/* Top nav */}
        <div style={{ position: 'relative', zIndex: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.png" alt="FHJ" style={{ height: 46, width: 46, objectFit: 'contain', borderRadius: '50%', border: '2px solid rgba(196,154,10,0.5)' }} />
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, color: '#C49A45', fontWeight: 700, letterSpacing: 3 }}>FHJ DREAM</div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 4, color: 'rgba(255,255,255,0.5)' }}>DESTINATIONS</div>
            </div>
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: 'rgba(255,255,255,0.65)', fontStyle: 'italic' }}>You're invited ✦</div>
        </div>

        {/* Hero content */}
        <div className="hero-pad" style={{ position: 'relative', zIndex: 3, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 48px 100px', textAlign: 'center', animation: 'fadeIn 1.2s ease' }}>
          {event.occasion && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              <div style={{ width: 40, height: 1, background: 'rgba(196,154,10,0.6)' }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 5, color: '#E8C87A', fontWeight: 600 }}>{event.occasion.toUpperCase()}</span>
              <div style={{ width: 40, height: 1, background: 'rgba(196,154,10,0.6)' }} />
            </div>
          )}

          <h1 className="hero-title" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(48px,8vw,96px)', fontWeight: 300, color: 'white', lineHeight: 1.02, marginBottom: 32, textShadow: '0 4px 32px rgba(0,0,0,0.4)', letterSpacing: '-1px' }}>
            {event.title}
          </h1>

          {event.hosted_by && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 48 }}>
              {event.host_image_url && (
                <img src={event.host_image_url} alt={event.hosted_by} style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(196,154,10,0.8)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} />
              )}
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: 'rgba(196,154,10,0.8)', marginBottom: 4 }}>HOSTED BY</div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: 'white', fontStyle: 'italic' }}>{event.hosted_by}</div>
              </div>
            </div>
          )}

          {/* Key details row */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}>
            {[
              formattedDate && { icon: '📅', text: formattedDate },
              event.time && { icon: '🕖', text: event.time },
              event.location && { icon: '📍', text: event.location },
              event.dress_code && { icon: '👔', text: event.dress_code },
            ].filter(Boolean).map((item: any, i) => (
              <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 30, padding: '10px 22px' }}>
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 1, color: 'rgba(255,255,255,0.92)', fontWeight: 600 }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Spots remaining */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: isFull ? 'rgba(192,57,43,0.2)' : 'rgba(196,154,10,0.15)', border: `1px solid ${isFull ? 'rgba(192,57,43,0.4)' : 'rgba(196,154,10,0.4)'}`, borderRadius: 30, padding: '10px 24px' }}>
            <span style={{ fontSize: 14 }}>👥</span>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, color: isFull ? '#ff8080' : '#E8C87A', fontWeight: 600 }}>
              {isFull ? 'THIS EVENT IS FULL' : `${spotsLeft} SPOT${spotsLeft !== 1 ? 'S' : ''} REMAINING`}
            </span>
          </div>

          {/* Scroll cue */}
          <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, animation: 'fadeIn 2s ease 1s both' }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: 'rgba(255,255,255,0.4)' }}>SCROLL TO DISCOVER</div>
            <div style={{ width: 1, height: 40, background: 'linear-gradient(to bottom, rgba(196,154,10,0.6), transparent)' }} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          ABOUT THIS EVENING
      ══════════════════════════════════════════ */}
      {event.description && (
        <section className="section-pad" style={{ padding: '100px 48px', background: '#FDFAF3', textAlign: 'center' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 32 }}>
              <div style={{ width: 48, height: 1, background: 'rgba(196,154,10,0.4)' }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#076060', fontWeight: 700 }}>ABOUT THIS EVENING</span>
              <div style={{ width: 48, height: 1, background: 'rgba(196,154,10,0.4)' }} />
            </div>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(20px,2.5vw,28px)', color: '#2E2318', lineHeight: 1.8, fontStyle: 'italic', marginBottom: 0 }}>
              "{event.description}"
            </p>
            {event.host_image_url && event.hosted_by && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 32 }}>
                <img src={event.host_image_url} alt={event.hosted_by} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(196,154,10,0.4)' }} />
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: 'rgba(44,35,24,0.6)', fontStyle: 'italic' }}>— {event.hosted_by}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          THE DETAILS
      ══════════════════════════════════════════ */}
      <section className="section-pad" style={{ padding: '80px 48px', background: '#F5ECD7' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 0 }}>
              <div style={{ width: 48, height: 1, background: 'rgba(196,154,10,0.4)' }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#076060', fontWeight: 700 }}>THE DETAILS</span>
              <div style={{ width: 48, height: 1, background: 'rgba(196,154,10,0.4)' }} />
            </div>
          </div>
          <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {[
              formattedDate && { icon: '📅', label: 'Date', value: formattedDate },
              event.time && { icon: '🕖', label: 'Time', value: event.time },
              event.location && { icon: '📍', label: 'Venue', value: event.location },
              event.dress_code && { icon: '👔', label: 'Dress Code', value: event.dress_code },
              event.capacity && { icon: '👥', label: 'Capacity', value: `${event.capacity} guests` },
            ].filter(Boolean).map((item: any, i) => (
              <div key={i} className="story-card" style={{ background: 'white', borderRadius: 12, padding: '28px 24px', textAlign: 'center', border: '1px solid rgba(196,154,10,0.15)', boxShadow: '0 4px 20px rgba(196,154,10,0.07)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 3, color: '#076060', marginBottom: 8, fontWeight: 700 }}>{item.label.toUpperCase()}</div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: '#2E2318', lineHeight: 1.4 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          EVENING JOURNEY (AGENDA)
      ══════════════════════════════════════════ */}
      {event.agenda && (
        <section className="section-pad" style={{ padding: '100px 48px', background: '#FDFAF3' }}>
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 48, height: 1, background: 'rgba(196,154,10,0.4)' }} />
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#076060', fontWeight: 700 }}>THE EVENING'S JOURNEY</span>
                <div style={{ width: 48, height: 1, background: 'rgba(196,154,10,0.4)' }} />
              </div>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'rgba(44,35,24,0.6)', fontStyle: 'italic' }}>A carefully curated experience awaits you</p>
            </div>
            <div style={{ position: 'relative' }}>
              {/* Timeline line */}
              <div style={{ position: 'absolute', left: 28, top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, #C49A45, rgba(196,154,10,0.1))', borderRadius: 2 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {event.agenda.split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 24, alignItems: 'flex-start', paddingBottom: 32 }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'white', border: '2px solid #C49A45', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px rgba(196,154,10,0.2)', zIndex: 1 }}>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: '#C49A45', fontWeight: 700 }}>{i + 1}</span>
                    </div>
                    <div style={{ paddingTop: 12, flex: 1 }}>
                      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: '#2E2318', lineHeight: 1.5 }}>{line}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          A NOTE FROM YOUR HOST (SPECIAL NOTES)
      ══════════════════════════════════════════ */}
      {event.special_notes && (
        <section className="section-pad" style={{ padding: '80px 48px', background: 'linear-gradient(135deg, #076060 0%, #0E8F8F 100%)' }}>
          <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
              <div style={{ width: 48, height: 1, background: 'rgba(232,200,122,0.4)' }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#E8C87A', fontWeight: 700 }}>A NOTE FROM YOUR HOST</span>
              <div style={{ width: 48, height: 1, background: 'rgba(232,200,122,0.4)' }} />
            </div>
            {event.host_image_url && (
              <img src={event.host_image_url} alt={event.hosted_by} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(196,154,10,0.7)', marginBottom: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }} />
            )}
            <div style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 16, padding: '36px 40px' }}>
              <div style={{ fontSize: 48, color: 'rgba(232,200,122,0.4)', fontFamily: 'Georgia', lineHeight: 1, marginBottom: 8 }}>"</div>
              {event.special_notes.split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => (
                <p key={i} style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'rgba(255,255,255,0.9)', lineHeight: 1.8, fontStyle: 'italic', marginBottom: 12 }}>{line}</p>
              ))}
              {event.hosted_by && (
                <div style={{ marginTop: 20, fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3, color: 'rgba(232,200,122,0.8)' }}>— {event.hosted_by.toUpperCase()}</div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          JOIN US — RSVP FORM
      ══════════════════════════════════════════ */}
      <section className="section-pad" style={{ padding: '100px 48px', background: '#FDFAF3' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
              <div style={{ width: 48, height: 1, background: 'rgba(196,154,10,0.4)' }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#076060', fontWeight: 700 }}>✦ JOIN US ✦</span>
              <div style={{ width: 48, height: 1, background: 'rgba(196,154,10,0.4)' }} />
            </div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(36px,5vw,56px)', fontWeight: 300, color: '#2E2318', marginBottom: 12, lineHeight: 1.1 }}>
              Will You Be Joining Us?
            </h2>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'rgba(44,35,24,0.6)', fontStyle: 'italic' }}>
              {isFull ? 'We regret that this event is now full.' : `We have ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} remaining — we'd love for you to be there.`}
            </p>
          </div>

          {isFull ? (
            <div style={{ background: 'white', border: '2px solid rgba(192,57,43,0.2)', borderRadius: 16, padding: '56px 40px', textAlign: 'center', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 56, marginBottom: 20 }}>😔</div>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, marginBottom: 12, color: '#2C2010' }}>This Event is Full</h3>
              <p style={{ color: 'rgba(44,32,16,0.6)', fontSize: 16, lineHeight: 1.7 }}>All spots have been filled. Please reach out to FHJ Dream Destinations for more information.</p>
            </div>
          ) : (
            <RsvpForm event={{ id: event.id, title: event.title, capacity: event.capacity, spotsLeft }} />
          )}
        </div>
      </section>

      {/* Footer */}
      <div style={{ background: '#073030', padding: '40px 48px', textAlign: 'center' }}>
        <img src="/logo.png" alt="FHJ" style={{ height: 48, width: 48, objectFit: 'contain', borderRadius: '50%', marginBottom: 16, border: '2px solid rgba(196,154,10,0.4)', opacity: 0.8 }} />
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', marginBottom: 6 }}>Curated by FHJ Dream Destinations</div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 4, color: 'rgba(196,154,10,0.5)' }}>info@fhjdreamdestinations.com</div>
      </div>
    </div>
  )
}
