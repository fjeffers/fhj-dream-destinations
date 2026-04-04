'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function EventsClient({ events, myRsvps, userId }: { events: any[], myRsvps: string[], userId: string }) {
  const [rsvpd, setRsvpd] = useState<string[]>(myRsvps)
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClient()

  const toggleRsvp = async (eventId: string) => {
    setLoading(eventId)
    if (rsvpd.includes(eventId)) {
      await supabase.from('event_rsvps').delete().eq('event_id', eventId).eq('client_id', userId)
      setRsvpd(p => p.filter(id => id !== eventId))
    } else {
      await supabase.from('event_rsvps').insert({ event_id: eventId, client_id: userId })
      setRsvpd(p => [...p, eventId])
    }
    setLoading(null)
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: 32 }}>
        <div className="section-eyebrow" style={{ marginBottom: 8 }}>For You</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 300 }}>
          Exclusive <em style={{ color: 'var(--gold)' }}>Events</em>
        </h2>
        <p style={{ color: 'var(--muted)', marginTop: 8, fontSize: 14 }}>Curated experiences available exclusively to FHJ clients</p>
      </div>
      <div style={{ display: 'grid', gap: 20 }}>
        {events.map(ev => {
          const rsvpCount = ev.event_rsvps?.length || 0
          const isRsvpd = rsvpd.includes(ev.id)
          const isFull = rsvpCount >= ev.capacity
          return (
            <div key={ev.id} className="luxury-card" style={{ padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26 }}>{ev.title}</h3>
                    {ev.exclusive && <span className="badge badge-gold">Exclusive</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 24, fontSize: 12, color: 'var(--muted)', flexWrap: 'wrap' }}>
                    <span>📅 {ev.date}{ev.time ? ` at ${ev.time}` : ''}</span>
                    {ev.location && <span>📍 {ev.location}</span>}
                    <span>👥 {rsvpCount}/{ev.capacity} attending</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleRsvp(ev.id)}
                  disabled={loading === ev.id || (isFull && !isRsvpd)}
                  className={isRsvpd ? 'btn-gold btn-sm' : 'btn-ghost btn-sm'}
                  style={{ opacity: loading === ev.id ? 0.7 : 1, flexShrink: 0 }}>
                  {loading === ev.id ? '...' : isRsvpd ? '✓ RSVP\'d' : isFull ? 'Full' : 'RSVP Now'}
                </button>
              </div>
              <div className="gold-line" style={{ marginBottom: 16 }} />
              <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>{ev.description}</p>
              <div style={{ background: 'var(--panel2)', borderRadius: 2, height: 4, overflow: 'hidden' }}>
                <div style={{ width: `${Math.min((rsvpCount / ev.capacity) * 100, 100)}%`, height: '100%', background: 'linear-gradient(90deg,var(--gold-dark),var(--gold))', transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 6 }}>
                {isFull ? 'Event is full' : `${ev.capacity - rsvpCount} spots remaining`}
              </div>
            </div>
          )
        })}
        {events.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>★</div>
            <p>No upcoming events at this time. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}
