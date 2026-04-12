import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import JoinForm from './JoinForm'

export default async function GroupTripJoinPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  let { data: trip } = await supabase
    .from('group_trips')
    .select('*, group_trip_registrations(id, travelers)')
    .eq('slug', slug)
    .single()

  if (!trip) {
    const { data } = await supabase
      .from('group_trips')
      .select('*, group_trip_registrations(id, travelers)')
      .eq('id', slug)
      .single()
    trip = data
  }

  if (!trip) notFound()

  const totalBooked = trip.group_trip_registrations?.reduce((s: number, r: any) => s + (r.travelers || 1), 0) || trip.booked || 0
  const spotsLeft = Math.max(0, (trip.spots || 12) - totalBooked)
  const isFull = trip.status === 'Sold Out' || spotsLeft === 0

  const formattedDate = trip.date
    ? new Date(trip.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : null

  const includesList = trip.includes ? trip.includes.split('\n').filter(Boolean) : []
  const itineraryList = trip.itinerary ? trip.itinerary.split('\n').filter(Boolean) : []

  return (
    <div style={{ minHeight: '100vh', background: '#FDFAF3' }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes pulse { 0%,100% { opacity:0.6; } 50% { opacity:1; } }
        .detail-card { transition: all 0.3s ease; }
        .detail-card:hover { transform: translateY(-4px); box-shadow: 0 12px 40px rgba(196,154,10,0.15) !important; }
      `}</style>

      {/* HERO */}
      <section style={{ position: 'relative', height: '100vh', minHeight: 600, display: 'flex', flexDirection: 'column' }}>
        {trip.background_image_url ? (
          <>
            <img src={trip.background_image_url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(5,30,30,0.35) 0%, rgba(5,50,50,0.6) 40%, rgba(5,30,30,0.9) 100%)', zIndex: 1 }} />
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #061e1e 0%, #0d5050 50%, #061e1e 100%)', zIndex: 0 }} />
        )}
        {([['top','left'],['top','right'],['bottom','left'],['bottom','right']] as const).map(([v,h]) => (
          <div key={v+h} style={{ position: 'absolute', [v]: 20, [h]: 20, width: 36, height: 36, zIndex: 3,
            borderTop: v==='top' ? '2px solid rgba(196,154,10,0.65)' : 'none',
            borderBottom: v==='bottom' ? '2px solid rgba(196,154,10,0.65)' : 'none',
            borderLeft: h==='left' ? '2px solid rgba(196,154,10,0.65)' : 'none',
            borderRight: h==='right' ? '2px solid rgba(196,154,10,0.65)' : 'none',
          }} />
        ))}
        <div style={{ position: 'relative', zIndex: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.png" alt="FHJ" style={{ height: 42, width: 42, objectFit: 'contain', borderRadius: '50%', border: '2px solid rgba(196,154,10,0.5)' }} />
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, color: '#C49A45', fontWeight: 700, letterSpacing: 3 }}>FHJ DREAM</div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 7, letterSpacing: 4, color: 'rgba(255,255,255,0.45)' }}>DESTINATIONS</div>
            </div>
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>Group Experience ✦</div>
        </div>
        <div style={{ position: 'relative', zIndex: 3, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 48px', textAlign: 'center' }}>
          <div style={{ maxWidth: 860, width: '100%', animation: 'fadeIn 1.2s ease' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <div style={{ width: 44, height: 1, background: 'rgba(196,154,10,0.6)' }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 6, color: '#E8C87A', fontWeight: 600 }}>GROUP EXPERIENCE</span>
              <div style={{ width: 44, height: 1, background: 'rgba(196,154,10,0.6)' }} />
            </div>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(48px,8vw,96px)', fontWeight: 300, color: 'white', lineHeight: 1.05, marginBottom: 28, textShadow: '0 4px 40px rgba(0,0,0,0.5)' }}>
              {trip.name}
            </h1>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
              {[
                trip.destination && { icon: '📍', text: trip.destination },
                formattedDate && { icon: '📅', text: formattedDate },
                trip.price && { icon: '💰', text: trip.price },
                { icon: '👥', text: `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} remaining` },
              ].filter(Boolean).map((item: any, i) => (
                <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: 30, padding: '9px 20px' }}>
                  <span style={{ fontSize: 13 }}>{item.icon}</span>
                  <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ position: 'relative', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, paddingBottom: 28, flexShrink: 0 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 4, color: 'rgba(255,255,255,0.35)', animation: 'pulse 2s ease infinite' }}>SCROLL TO DISCOVER</div>
          <div style={{ width: 1, height: 44, background: 'linear-gradient(to bottom, rgba(196,154,10,0.6), transparent)' }} />
        </div>
      </section>

      {/* ABOUT */}
      {trip.description && (
        <section style={{ background: '#FDFAF3', padding: '100px 60px', textAlign: 'center' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
              <div style={{ width: 56, height: 1, background: 'rgba(196,154,10,0.4)' }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#076060', fontWeight: 700 }}>ABOUT THIS EXPERIENCE</span>
              <div style={{ width: 56, height: 1, background: 'rgba(196,154,10,0.4)' }} />
            </div>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(20px,2.5vw,28px)', color: '#2E2318', lineHeight: 1.8, fontStyle: 'italic' }}>"{trip.description}"</p>
          </div>
        </section>
      )}

      {/* DETAILS */}
      <section style={{ background: '#F5ECD7', padding: '80px 60px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 56, height: 1, background: 'rgba(196,154,10,0.4)' }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#076060', fontWeight: 700 }}>TRIP DETAILS</span>
              <div style={{ width: 56, height: 1, background: 'rgba(196,154,10,0.4)' }} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 20 }}>
            {[
              trip.destination && { icon: '📍', label: 'Destination', value: trip.destination },
              formattedDate && { icon: '📅', label: 'Departure', value: formattedDate },
              trip.price && { icon: '💰', label: 'Price', value: trip.price },
              { icon: '👥', label: 'Group Size', value: `${trip.spots} travelers` },
              { icon: '🎫', label: 'Availability', value: isFull ? 'Sold Out' : `${spotsLeft} spots left` },
            ].filter(Boolean).map((item: any, i) => (
              <div key={i} className="detail-card" style={{ background: 'white', borderRadius: 14, padding: '28px 20px', textAlign: 'center', border: '1px solid rgba(196,154,10,0.15)', boxShadow: '0 4px 20px rgba(196,154,10,0.07)' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 3, color: '#076060', marginBottom: 8, fontWeight: 700 }}>{item.label.toUpperCase()}</div>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 17, color: '#2E2318', lineHeight: 1.4 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      {includesList.length > 0 && (
        <section style={{ background: '#FDFAF3', padding: '100px 60px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 56, height: 1, background: 'rgba(196,154,10,0.4)' }} />
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#076060', fontWeight: 700 }}>WHAT'S INCLUDED</span>
                <div style={{ width: 56, height: 1, background: 'rgba(196,154,10,0.4)' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {includesList.map((item: string, i: number) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'white', border: '1px solid rgba(196,154,10,0.15)', borderRadius: 10, padding: '16px 20px' }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #076060, #0E8F8F)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: 'white', fontSize: 12 }}>✓</span>
                  </div>
                  <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 17, color: '#2E2318' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ITINERARY */}
      {itineraryList.length > 0 && (
        <section style={{ background: '#F5ECD7', padding: '100px 60px' }}>
          <div style={{ maxWidth: 760, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 52 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                <div style={{ width: 56, height: 1, background: 'rgba(196,154,10,0.4)' }} />
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#076060', fontWeight: 700 }}>YOUR JOURNEY</span>
                <div style={{ width: 56, height: 1, background: 'rgba(196,154,10,0.4)' }} />
              </div>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'rgba(44,35,24,0.55)', fontStyle: 'italic' }}>Day by day, an unforgettable adventure</p>
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 30, top: 28, bottom: 28, width: 2, background: 'linear-gradient(to bottom, #C49A45, rgba(196,154,10,0.1))', borderRadius: 2 }} />
              {itineraryList.map((line: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: 28, alignItems: 'flex-start', paddingBottom: 32 }}>
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'white', border: '2px solid #C49A45', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 20px rgba(196,154,10,0.2)', zIndex: 1 }}>
                    <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: '#C49A45', fontWeight: 700 }}>{i + 1}</span>
                  </div>
                  <div style={{ paddingTop: 14, flex: 1 }}>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: '#2E2318', lineHeight: 1.5 }}>{line}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* JOIN FORM */}
      <section style={{ background: '#FDFAF3', padding: '100px 60px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ width: 56, height: 1, background: 'rgba(196,154,10,0.4)' }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#076060', fontWeight: 700 }}>✦ RESERVE YOUR SPOT ✦</span>
              <div style={{ width: 56, height: 1, background: 'rgba(196,154,10,0.4)' }} />
            </div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(36px,5vw,56px)', fontWeight: 300, color: '#2E2318', marginBottom: 12, lineHeight: 1.1 }}>Join This Adventure</h2>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'rgba(44,35,24,0.55)', fontStyle: 'italic' }}>
              {isFull ? 'This trip is currently full.' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} remaining — secure yours today`}
            </p>
          </div>
          {isFull ? (
            <div style={{ background: 'white', border: '2px solid rgba(192,57,43,0.2)', borderRadius: 16, padding: '56px 40px', textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: 20 }}>😔</div>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, marginBottom: 12, color: '#2C2010' }}>This Trip is Full</h3>
              <p style={{ color: 'rgba(44,32,16,0.6)', fontSize: 16, lineHeight: 1.7, fontFamily: 'Cormorant Garamond, serif' }}>Contact FHJ Dream Destinations to be added to the waitlist.</p>
            </div>
          ) : (
            <JoinForm trip={{ id: trip.id, name: trip.name, price: trip.price, spotsLeft, isWaitlist: trip.status === 'Waitlist' }} />
          )}
        </div>
      </section>

      <div style={{ background: '#061e1e', padding: '48px', textAlign: 'center' }}>
        <img src="/logo.png" alt="FHJ" style={{ height: 52, width: 52, objectFit: 'contain', borderRadius: '50%', marginBottom: 18, border: '2px solid rgba(196,154,10,0.35)', opacity: 0.75 }} />
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 17, color: 'rgba(255,255,255,0.45)', fontStyle: 'italic', marginBottom: 8 }}>Curated by FHJ Dream Destinations</div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 4, color: 'rgba(196,154,10,0.45)' }}>info@fhjdreamdestinations.com</div>
      </div>
    </div>
  )
}
