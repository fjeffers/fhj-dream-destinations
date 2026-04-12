import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import RsvpForm from './RsvpForm'

export default async function EventRsvpPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Try by slug first, then by UUID
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

      {/* ── HERO SECTION ── */}
      <div style={{ position: 'relative', minHeight: 520, overflow: 'hidden' }}>
        {/* Background */}
        {event.background_image_url ? (
          <>
            <img src={event.background_image_url} alt="Event" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(7,96,96,0.55) 0%, rgba(7,96,96,0.75) 60%, rgba(7,60,60,0.92) 100%)' }} />
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #076060 0%, #0E8F8F 50%, #076060 100%)' }} />
        )}

        {/* Corner decorations */}
        {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
          <div key={v+h} style={{ position: 'absolute', [v]: 20, [h]: 20, width: 32, height: 32,
            borderTop: v==='top' ? '2px solid rgba(196,154,10,0.6)' : 'none',
            borderBottom: v==='bottom' ? '2px solid rgba(196,154,10,0.6)' : 'none',
            borderLeft: h==='left' ? '2px solid rgba(196,154,10,0.6)' : 'none',
            borderRight: h==='right' ? '2px solid rgba(196,154,10,0.6)' : 'none',
            zIndex: 2, pointerEvents: 'none'
          }} />
        ))}

        {/* Header bar */}
        <div style={{ position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.png" alt="FHJ" style={{ height: 44, width: 44, objectFit: 'contain', borderRadius: '50%', border: '2px solid rgba(196,154,10,0.5)' }} />
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, color: '#C49A45', fontWeight: 700, letterSpacing: 3 }}>FHJ DREAM</div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 4, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>DESTINATIONS</div>
            </div>
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>You're invited ✦</div>
        </div>

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 800, margin: '0 auto', padding: '48px 32px 64px', textAlign: 'center' }}>
          {event.occasion && (
            <div style={{ display: 'inline-block', background: 'rgba(196,154,10,0.2)', border: '1px solid rgba(196,154,10,0.5)', borderRadius: 20, padding: '5px 18px', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 4, color: '#E8C87A', marginBottom: 24, fontWeight: 600 }}>
              ✦ {event.occasion.toUpperCase()} ✦
            </div>
          )}

          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(40px,7vw,80px)', fontWeight: 300, color: 'white', lineHeight: 1.05, marginBottom: 24, textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
            {event.title}
          </h1>

          {/* Host info */}
          {event.hosted_by && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 36 }}>
              {event.host_image_url && (
                <img src={event.host_image_url} alt={event.hosted_by} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(196,154,10,0.7)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }} />
              )}
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'rgba(255,255,255,0.88)', fontStyle: 'italic' }}>
                Hosted by <strong style={{ fontStyle: 'normal', color: '#E8C87A' }}>{event.hosted_by}</strong>
              </p>
            </div>
          )}

          {/* Event details pills */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
            {[
              formattedDate && { icon: '📅', text: formattedDate },
              event.time && { icon: '🕖', text: event.time },
              event.location && { icon: '📍', text: event.location },
              event.dress_code && { icon: '👔', text: event.dress_code },
              { icon: '👥', text: isFull ? 'Event is Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} remaining` },
            ].filter(Boolean).map((item: any, i) => (
              <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 24, padding: '8px 18px' }}>
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 1, color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── EVENT INFO SECTION ── */}
      {(event.description || event.agenda || event.dress_code || event.special_notes) && (
        <div style={{ background: '#F5ECD7', borderBottom: '1px solid rgba(196,154,10,0.2)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 40 }}>

            {/* Description */}
            {event.description && (
              <div style={{ gridColumn: event.agenda || event.special_notes ? '1 / -1' : undefined, textAlign: 'center' }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 4, color: '#076060', marginBottom: 16, fontWeight: 700 }}>ABOUT THIS EVENT</div>
                <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: '#2E2318', lineHeight: 1.8, fontStyle: 'italic', maxWidth: 640, margin: '0 auto' }}>
                  "{event.description}"
                </p>
                <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, rgba(196,154,10,0.5), transparent)', margin: '28px auto 0', maxWidth: 200 }} />
              </div>
            )}

            {/* Agenda */}
            {event.agenda && (
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 4, color: '#076060', marginBottom: 16, fontWeight: 700 }}>📋 SCHEDULE</div>
                <div style={{ background: 'white', borderRadius: 10, padding: '20px 24px', border: '1px solid rgba(196,154,10,0.2)', boxShadow: '0 4px 16px rgba(196,154,10,0.08)' }}>
                  {event.agenda.split('\n').filter(Boolean).map((line: string, i: number) => (
                    <div key={i} style={{ padding: '10px 0', borderBottom: i < event.agenda.split('\n').filter(Boolean).length - 1 ? '1px solid rgba(196,154,10,0.1)' : 'none', fontFamily: 'Cormorant Garamond, serif', fontSize: 17, color: '#2E2318', lineHeight: 1.5 }}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Special Notes */}
            {event.special_notes && (
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 4, color: '#076060', marginBottom: 16, fontWeight: 700 }}>📌 IMPORTANT NOTES</div>
                <div style={{ background: 'white', borderRadius: 10, padding: '20px 24px', border: '1px solid rgba(196,154,10,0.2)', boxShadow: '0 4px 16px rgba(196,154,10,0.08)' }}>
                  {event.special_notes.split('\n').filter(Boolean).map((line: string, i: number) => (
                    <div key={i} style={{ padding: '8px 0', borderBottom: i < event.special_notes.split('\n').filter(Boolean).length - 1 ? '1px solid rgba(196,154,10,0.1)' : 'none', fontFamily: 'Cormorant Garamond, serif', fontSize: 17, color: '#2E2318', lineHeight: 1.5 }}>
                      • {line}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dress Code highlighted */}
            {event.dress_code && (
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ background: 'linear-gradient(135deg, #076060, #0E8F8F)', borderRadius: 10, padding: '20px 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span style={{ fontSize: 32 }}>👔</span>
                  <div>
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 4, color: 'rgba(232,200,122,0.8)', marginBottom: 4, fontWeight: 700 }}>DRESS CODE</div>
                    <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, color: 'white', fontWeight: 300 }}>{event.dress_code}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── RSVP FORM SECTION ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#076060', marginBottom: 12, fontWeight: 700 }}>✦ JOIN US ✦</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 44, fontWeight: 300, color: '#2E2318', marginBottom: 12 }}>Reserve Your Spot</h2>
          <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'rgba(44,32,16,0.6)', fontStyle: 'italic' }}>
            {isFull ? 'This event is now full.' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} remaining — secure yours now`}
          </p>
        </div>

        {isFull ? (
          <div style={{ background: 'white', border: '2px solid rgba(192,57,43,0.2)', borderRadius: 12, padding: '48px 40px', textAlign: 'center', boxShadow: '0 4px 32px rgba(196,154,10,0.1)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>😔</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, marginBottom: 12, color: '#2C2010' }}>This Event is Full</h2>
            <p style={{ color: 'rgba(44,32,16,0.6)', fontSize: 15 }}>All spots have been filled. Please contact FHJ Dream Destinations for more information.</p>
          </div>
        ) : (
          <RsvpForm event={{ id: event.id, title: event.title, capacity: event.capacity, spotsLeft }} />
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(196,154,10,0.15)' }}>
          <img src="/logo.png" alt="FHJ" style={{ height: 40, width: 40, objectFit: 'contain', borderRadius: '50%', marginBottom: 12, opacity: 0.6 }} />
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, color: 'rgba(44,32,16,0.5)', fontStyle: 'italic' }}>Curated by FHJ Dream Destinations</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 4, color: 'rgba(14,143,143,0.5)', marginTop: 6 }}>info@fhjdreamdestinations.com</div>
        </div>
      </div>
    </div>
  )
}
