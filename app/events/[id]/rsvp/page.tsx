import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import RsvpForm from './RsvpForm'

export default async function EventRsvpPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event } = await supabase
    .from('events')
    .select('*, event_rsvps(id, party_size)')
    .eq('id', id)
    .eq('active', true)
    .single()

  if (!event) notFound()

  const totalAttending = event.event_rsvps?.reduce((sum: number, r: any) => sum + (r.party_size || 1), 0) || 0
  const spotsLeft = Math.max(0, (event.capacity || 100) - totalAttending)
  const isFull = spotsLeft === 0

  const heroBg = event.background_image_url
    ? `url('${event.background_image_url}')`
    : 'linear-gradient(135deg, #076060 0%, #0E8F8F 50%, #076060 100%)'

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #FDFAF3 0%, #EDF7F7 60%, #FDFAF3 100%)' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(196,154,10,0.15)', background: 'rgba(253,250,243,0.97)', backdropFilter: 'blur(20px)', padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <img src="/logo.png" alt="FHJ" style={{ height: 48, width: 48, objectFit: 'contain', borderRadius: '50%' }} />
          <div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: '#8B6A00', fontWeight: 700, letterSpacing: 3 }}>FHJ DREAM</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 4, color: '#076060', fontWeight: 600 }}>DESTINATIONS</div>
          </div>
        </div>
        <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 14, color: 'rgba(44,32,16,0.5)', fontStyle: 'italic' }}>
          You're invited ✦
        </div>
      </div>

      {/* Event Hero */}
      <div style={{
        background: heroBg,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '64px 32px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Dark overlay for readability when using image */}
        {event.background_image_url && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(7,96,96,0.65)' }} />
        )}
        <div style={{ position: 'absolute', inset: 24, border: '1px solid rgba(255,255,255,0.12)', pointerEvents: 'none' }} />
        {[['top','left'],['top','right'],['bottom','left'],['bottom','right']].map(([v,h]) => (
          <div key={v+h} style={{ position: 'absolute', [v]: 24, [h]: 24, width: 28, height: 28,
            borderTop: v==='top' ? '2px solid rgba(196,154,10,0.7)' : 'none',
            borderBottom: v==='bottom' ? '2px solid rgba(196,154,10,0.7)' : 'none',
            borderLeft: h==='left' ? '2px solid rgba(196,154,10,0.7)' : 'none',
            borderRight: h==='right' ? '2px solid rgba(196,154,10,0.7)' : 'none',
          }} />
        ))}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
          {event.occasion && (
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: 'rgba(196,154,10,0.9)', marginBottom: 16, fontWeight: 600 }}>
              ✦ {event.occasion.toUpperCase()} ✦
            </div>
          )}
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(36px,7vw,72px)', fontWeight: 300, color: 'white', lineHeight: 1.05, marginBottom: 20 }}>
            {event.title}
          </h1>
          {/* Host info with photo */}
          {event.hosted_by && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 28 }}>
              {event.host_image_url && (
                <img src={event.host_image_url} alt={event.hosted_by} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(196,154,10,0.7)' }} />
              )}
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'rgba(255,255,255,0.85)', fontStyle: 'italic' }}>
                Hosted by {event.hosted_by}
              </p>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
            {[
              event.date && { icon: '📅', text: new Date(event.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) },
              event.time && { icon: '🕖', text: event.time },
              event.location && { icon: '📍', text: event.location },
              { icon: '👥', text: isFull ? 'Event is Full' : `${spotsLeft} spot${spotsLeft !== 1 ? 's' : ''} remaining` },
            ].filter(Boolean).map((item: any, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.88)', fontSize: 15 }}>
                <span>{item.icon}</span>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 1 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Description + Form */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px 80px' }}>
        {event.description && (
          <div style={{ marginBottom: 48, textAlign: 'center' }}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'rgba(44,32,16,0.75)', lineHeight: 1.8, fontStyle: 'italic', maxWidth: 580, margin: '0 auto' }}>
              "{event.description}"
            </p>
            <div style={{ height: 2, background: 'linear-gradient(90deg, transparent, rgba(196,154,10,0.4), transparent)', margin: '32px auto', maxWidth: 240 }} />
          </div>
        )}

        {isFull ? (
          <div style={{ background: 'white', border: '2px solid rgba(192,57,43,0.2)', borderRadius: 4, padding: '48px 40px', textAlign: 'center', boxShadow: '0 4px 32px rgba(196,154,10,0.1)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>😔</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, marginBottom: 12, color: '#2C2010' }}>This Event is Full</h2>
            <p style={{ color: 'rgba(44,32,16,0.6)', fontSize: 15 }}>All spots have been filled. Please contact FHJ Dream Destinations for more information.</p>
          </div>
        ) : (
          <RsvpForm event={{ id: event.id, title: event.title, capacity: event.capacity, spotsLeft }} />
        )}

        <div style={{ textAlign: 'center', marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(196,154,10,0.15)' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: 'rgba(44,32,16,0.5)', fontStyle: 'italic' }}>Curated by FHJ Dream Destinations</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 4, color: 'rgba(14,143,143,0.5)', marginTop: 6 }}>info@fhjdreamdestinations.com</div>
        </div>
      </div>
    </div>
  )
}
