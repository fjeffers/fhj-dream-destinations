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
    <div style={{ minHeight: '100vh', background: '#FDFAF3' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes pulse { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        .detail-card:hover { transform: translateY(-6px); box-shadow: 0 16px 48px rgba(196,154,10,0.18) !important; }
        .detail-card { transition: all 0.3s ease; }
        @media (max-width: 768px) {
          .details-grid { grid-template-columns: 1fr 1fr !important; }
          .hero-title { font-size: 52px !important; }
          .section-inner { padding: 60px 24px !important; }
        }
        @media (max-width: 480px) {
          .details-grid { grid-template-columns: 1fr !important; }
          .hero-title { font-size: 40px !important; }
        }
      `}</style>

      {/* ════════════════════════════════════
          HERO — Full viewport cinematic
      ════════════════════════════════════ */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 600, display: 'flex', flexDirection: 'column' }}>
        {/* Background */}
        {event.background_image_url ? (
          <>
            <img src={event.background_image_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(5,30,30,0.35) 0%, rgba(5,50,50,0.55) 35%, rgba(5,40,40,0.75) 65%, rgba(5,25,25,0.93) 100%)', zIndex: 1 }} />
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #061e1e 0%, #0d5050 50%, #061e1e 100%)', zIndex: 0 }} />
        )}

        {/* Corner accents */}
        {([['top','left'],['top','right'],['bottom','left'],['bottom','right']] as const).map(([v,h]) => (
          <div key={v+h} style={{ position: 'absolute', [v]: 20, [h]: 20, width: 36, height: 36, zIndex: 3,
            borderTop: v==='top' ? '2px solid rgba(196,154,10,0.65)' : 'none',
            borderBottom: v==='bottom' ? '2px solid rgba(196,154,10,0.65)' : 'none',
            borderLeft: h==='left' ? '2px solid rgba(196,154,10,0.65)' : 'none',
            borderRight: h==='right' ? '2px solid rgba(196,154,10,0.65)' : 'none',
          }} />
        ))}

        {/* Nav bar */}
        <div style={{ position: 'relative', zIndex: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.png" alt="FHJ" style={{ height: 42, width: 42, objectFit: 'contain', borderRadius: '50%', border: '2px solid rgba(196,154,10,0.5)' }} />
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, color: '#C49A45', fontWeight: 700, letterSpacing: 3 }}>FHJ DREAM</div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 7, letterSpacing: 4, color: 'rgba(255,255,255,0.45)' }}>DESTINATIONS</div>
            </div>
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>You're invited ✦</div>
        </div>

        {/* Centered hero content */}
        <div style={{ position: 'relative', zIndex: 3, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 48px', textAlign: 'center' }}>
          <div style={{ maxWidth: 860, width: '100%', animation: 'fadeIn 1.2s ease' }}>
            {event.occasion && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 28, animation: 'fadeUp 0.8s ease 0.2s both' }}>
                <div style={{ width: 44, height: 1, background: 'rgba(196,154,10,0.6)' }} />
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 6, color: '#E8C87A', fontWeight: 600 }}>{event.occasion.toUpperCase()}</span>
                <div style={{ width: 44, height: 1, background: 'rgba(196,154,10,0.6)' }} />
              </div>
            )}

            <h1 className="hero-title" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(52px,9vw,108px)', fontWeight: 300, color: 'white', lineHeight: 1.0, marginBottom: 36, textShadow: '0 4px 40px rgba(0,0,0,0.5)', letterSpacing: '-1px', animation: 'fadeUp 0.9s ease 0.3s both' }}>
              {event.title}
            </h1>

            {event.hosted_by && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 40, animation: 'fadeUp 0.9s ease 0.4s both' }}>
                {event.host_image_url && (
                  <img src={event.host_image_url} alt={event.hosted_by} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(196,154,10,0.8)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }} />
                )}
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 4, color: 'rgba(196,154,10,0.75)', marginBottom: 4 }}>HOSTED BY</div>
                  <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: 'rgba(255,255,255,0.9)', fontStyle: 'italic' }}>{event.hosted_by}</div>
                </div>
              </div>
            )}

            {/* Pills */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40, animation: 'fadeUp 0.9s ease 0.5s both' }}>
              {[
                formattedDate && { icon: '📅', text: formattedDate },
                event.time && { icon: '🕖', text: event.time },
                event.location && { icon: '📍', text: event.location },
                event.dress_code && { icon: '👔', text: event.dress_code },
              ].filter(Boolean).map((item: any, i) => (
                <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 30, padding: '9px 20px' }}>
                  <span style={{ fontSize: 13 }}>{item.icon}</span>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Spots pill */}
            <div style={{ animation: 'fadeUp 0.9s ease 0.6s both' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: isFull ? 'rgba(192,57,43,0.2)' : 'rgba(196,154,10,0.15)', border: `1px solid ${isFull ? 'rgba(192,57,43,0.45)' : 'rgba(196,154,10,0.45)'}`, borderRadius: 30, padding: '10px 24px' }}>
                <span style={{ fontSize: 14 }}>👥</span>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: isFull ? '#ff8080' : '#E8C87A', fontWeight: 700 }}>
                  {isFull ? 'THIS EVENT IS FULL' : `${spotsLeft} SPOT${spotsLeft !== 1 ? 'S' : ''} REMAINING`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll cue at bottom */}
        <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingBottom: 28, flexShrink: 0, animation: 'fadeIn 2s ease 1.5s both' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 4, color: 'rgba(255,255,255,0.35)', animation: 'pulse 2s ease infinite' }}>SCROLL TO DISCOVER</div>
          <div style={{ width: 1, height: 44, background: 'linear-gradient(to bottom, rgba(196,154,10,0.6), transparent)' }} />
        </div>
      </section>

      {/* ════════════════════════════════════
          ABOUT THIS EVENING
      ════════════════════════════════════ */}
      {event.description && (
        <section style={{ background: '#FDFAF3' }}>
          <div className="section-inner" style={{ maxWidth: 860, margin: '0 auto', padding: '100px 60px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
              <div style={{ width: 56, height: 1, background: 'rgba(196,154,10,0.4)' }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#076060', fontWeight: 700 }}>ABOUT THIS EVENING</span>
              <div style={{ width: 56, height: 1, background: 'rgba(196,154,10,0.4)' }} />
            </div>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(22px,2.8vw,32px)', color: '#2E2318', lineHeight: 1.75, fontStyle: 'italic', marginBottom: 36 }}>
              "{event.description}"
            </p>
            {event.host_image_url && event.hosted_by && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
                <img src={event.host_image_url} alt={event.hosted_by} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(196,154,10,0.4)' }} />
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'rgba(44,35,24,0.55)', fontStyle: 'italic' }}>— {event.hosted_by}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ════════════════════════════════════
          THE DETAILS
      ════════════════════════════════════ */}
      <section style={{ background: '#F5ECD7' }}>
        <div className="section-inner" style={{ maxWidth: 1100, margin: '0 auto', padding: '90px 60px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 1, background: 'rgba(196,154,10,0.4)' }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#076060', fontWeight: 700 }}>THE DETAILS</span>
              <div style={{ width: 56, height: 1, background: 'rgba(196,154,10,0.4)' }} />
            </div>
          </div>
          <div className="details-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
            {[
              formattedDate && { icon: '📅', label: 'Date', value: formattedDate },
              event.time && { icon: '🕖', label: 'Time', value: event.time },
              event.location && { icon: '📍', label: 'Venue', value: event.location },
              event.dress_code && { icon: '👔', label: 'Dress Code', value: event.dress_code },
              { icon: '👥', label: 'Capacity', value: `${event.capacity} guests` },
            ].filter(Boolean).map((item: any, i) => (
              <div key={i} className="detail-card" style={{ background: 'white', borderRadius: 14, padding: '32px 24px', textAlign: 'center', border: '1px solid rgba(196,154,10,0.15)', boxShadow: '0 4px 24px rgba(196,154,10,0.07)' }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{item.icon}</div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 3, color: '#076060', marginBottom: 10, fontWeight: 700 }}>{item.label.toUpperCase()}</div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: '#2E2318', lineHeight: 1.4 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════
          THE EVENING'S JOURNEY
      ════════════════════════════════════ */}
      {event.agenda && (
        <section style={{ background: '#FDFAF3' }}>
          <div className="section-inner" style={{ maxWidth: 780, margin: '0 auto', padding: '100px 60px' }}>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                <div style={{ width: 56, height: 1, background: 'rgba(196,154,10,0.4)' }} />
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#076060', fontWeight: 700 }}>THE EVENING'S JOURNEY</span>
                <div style={{ width: 56, height: 1, background: 'rgba(196,154,10,0.4)' }} />
              </div>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'rgba(44,35,24,0.55)', fontStyle: 'italic' }}>A carefully curated experience awaits you</p>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 30, top: 28, bottom: 28, width: 2, background: 'linear-gradient(to bottom, #C49A45, rgba(196,154,10,0.1))', borderRadius: 2 }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {event.agenda.split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: 28, alignItems: 'flex-start', paddingBottom: 32 }}>
                    <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'white', border: '2px solid #C49A45', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 20px rgba(196,154,10,0.2)', zIndex: 1 }}>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: '#C49A45', fontWeight: 700 }}>{i + 1}</span>
                    </div>
                    <div style={{ paddingTop: 14, flex: 1 }}>
                      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: '#2E2318', lineHeight: 1.5 }}>{line}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════
          A NOTE FROM YOUR HOST
      ════════════════════════════════════ */}
      {event.special_notes && (
        <section style={{ background: 'linear-gradient(135deg, #063838 0%, #0a5c5c 50%, #063838 100%)' }}>
          <div className="section-inner" style={{ maxWidth: 860, margin: '0 auto', padding: '100px 60px', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 40 }}>
              <div style={{ width: 56, height: 1, background: 'rgba(232,200,122,0.35)' }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#E8C87A', fontWeight: 700 }}>A NOTE FROM YOUR HOST</span>
              <div style={{ width: 56, height: 1, background: 'rgba(232,200,122,0.35)' }} />
            </div>
            {event.host_image_url && (
              <img src={event.host_image_url} alt={event.hosted_by} style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(196,154,10,0.7)', marginBottom: 32, boxShadow: '0 8px 40px rgba(0,0,0,0.4)' }} />
            )}
            <div style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 20, padding: '44px 52px' }}>
              <div style={{ fontSize: 56, color: 'rgba(232,200,122,0.35)', fontFamily: 'Georgia', lineHeight: 1, marginBottom: 8 }}>"</div>
              {event.special_notes.split('\n').filter((l: string) => l.trim()).map((line: string, i: number) => (
                <p key={i} style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: 'rgba(255,255,255,0.88)', lineHeight: 1.8, fontStyle: 'italic', marginBottom: 16 }}>{line}</p>
              ))}
              {event.hosted_by && (
                <div style={{ marginTop: 24, fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 4, color: 'rgba(232,200,122,0.75)' }}>— {event.hosted_by.toUpperCase()}</div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════
          WILL YOU BE JOINING US — RSVP
      ════════════════════════════════════ */}
      <section style={{ background: '#FDFAF3' }}>
        <div className="section-inner" style={{ maxWidth: 760, margin: '0 auto', padding: '100px 60px' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div style={{ width: 56, height: 1, background: 'rgba(196,154,10,0.4)' }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#076060', fontWeight: 700 }}>✦ JOIN US ✦</span>
              <div style={{ width: 56, height: 1, background: 'rgba(196,154,10,0.4)' }} />
            </div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(36px,5vw,60px)', fontWeight: 300, color: '#2E2318', marginBottom: 16, lineHeight: 1.1 }}>
              Will You Be Joining Us?
            </h2>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'rgba(44,35,24,0.55)', fontStyle: 'italic' }}>
              {isFull ? 'We regret that this event is now full.' : `We have ${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} remaining — we'd love for you to be there.`}
            </p>
          </div>

          {isFull ? (
            <div style={{ background: 'white', border: '2px solid rgba(192,57,43,0.2)', borderRadius: 20, padding: '60px 48px', textAlign: 'center', boxShadow: '0 8px 48px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 60, marginBottom: 24 }}>😔</div>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 36, marginBottom: 16, color: '#2C2010' }}>This Event is Full</h3>
              <p style={{ color: 'rgba(44,32,16,0.6)', fontSize: 17, lineHeight: 1.7, fontFamily: 'Cormorant Garamond, serif' }}>All spots have been filled. Please reach out to FHJ Dream Destinations for more information.</p>
            </div>
          ) : (
            <RsvpForm event={{ id: event.id, title: event.title, capacity: event.capacity, spotsLeft }} />
          )}
        </div>
      </section>

      {/* Footer */}
      <div style={{ background: '#061e1e', padding: '48px', textAlign: 'center' }}>
        <img src="/logo.png" alt="FHJ" style={{ height: 52, width: 52, objectFit: 'contain', borderRadius: '50%', marginBottom: 18, border: '2px solid rgba(196,154,10,0.35)', opacity: 0.75 }} />
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 17, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', marginBottom: 8 }}>Curated by FHJ Dream Destinations</div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 4, color: 'rgba(196,154,10,0.45)' }}>info@fhjdreamdestinations.com</div>
      </div>
    </div>
  )
}
