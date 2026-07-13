'use client'
import Link from 'next/link'
import Countdown from '@/components/Countdown'
import { destImage } from '@/lib/destinations'
import { TRIP_STAGES, stageIndex, daysUntil, nights } from '@/lib/trip'

export default function TripDetailClient({ booking: b }: { booking: any }) {
  const img = destImage(b.destination, b.package_name)
  const stage = stageIndex(b.status, b.travel_date, b.return_date)
  const dUntil = daysUntil(b.travel_date)
  const n = nights(b.travel_date, b.return_date)
  const cancelled = (b.status || '').toLowerCase() === 'cancelled'
  const upcoming = dUntil !== null && dUntil > 0 && !cancelled
  const itinerary: { day?: string | number; title?: string; detail?: string }[] = Array.isArray(b.itinerary) ? b.itinerary : []

  const facts: [string, string][] = []
  if (b.destination) facts.push(['Destination', b.destination])
  if (b.travel_date) facts.push(['Departs', new Date(b.travel_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })])
  if (b.return_date) facts.push(['Returns', new Date(b.return_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })])
  if (n) facts.push(['Duration', `${n} ${n === 1 ? 'night' : 'nights'}`])
  if (b.group_size) facts.push(['Travelers', `${b.group_size} ${b.group_size === 1 ? 'guest' : 'guests'}`])
  if (b.accommodation) facts.push(['Accommodation', b.accommodation])
  if (b.special_occasion) facts.push(['Occasion', b.special_occasion])
  if (b.budget) facts.push(['Budget', b.budget])
  if (b.value) facts.push(['Trip Value', `$${Number(b.value).toLocaleString()}`])

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <Link href="/portal/trips" style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textDecoration: 'none' }}>← All Journeys</Link>

      {/* Hero */}
      <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', marginTop: 16, marginBottom: 28, minHeight: 300, display: 'flex', alignItems: 'flex-end' }}>
        <img src={img} alt={b.package_name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,25,25,0.85) 0%, rgba(20,25,25,0.15) 55%, transparent 100%)' }} />
        <div style={{ position: 'relative', padding: 32, color: 'white', width: '100%' }}>
          <span className={`badge ${b.status === 'Confirmed' ? 'badge-success' : b.status === 'Completed' ? 'badge-gold' : b.status === 'Deposit Paid' ? 'badge-teal' : cancelled ? 'badge-danger' : 'badge-gold'}`}>{b.status}</span>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(30px, 5vw, 52px)', fontWeight: 300, marginTop: 10, lineHeight: 1.05 }}>{b.package_name}</h1>
          {b.destination && <div style={{ fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 4, marginTop: 6, opacity: 0.9 }}>📍 {b.destination.toUpperCase()}</div>}
        </div>
      </div>

      {/* Countdown */}
      {upcoming && (
        <div className="luxury-card" style={{ padding: 28, marginBottom: 24, textAlign: 'center' }}>
          <div className="section-eyebrow" style={{ marginBottom: 16 }}>Your Adventure Begins In</div>
          <div style={{ display: 'flex', justifyContent: 'center' }}><Countdown date={b.travel_date} /></div>
        </div>
      )}

      {/* Journey timeline */}
      {!cancelled && (
        <div className="luxury-card" style={{ padding: 28, marginBottom: 24 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--gold)', marginBottom: 24, fontWeight: 700 }}>YOUR JOURNEY</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 11, left: 12, right: 12, height: 2, background: 'var(--border)' }} />
            <div style={{ position: 'absolute', top: 11, left: 12, height: 2, background: 'linear-gradient(90deg, var(--teal), var(--gold))', width: `calc(${(Math.max(0, stage) / (TRIP_STAGES.length - 1)) * 100}% - 24px)`, transition: 'width 0.6s ease' }} />
            {TRIP_STAGES.map((s, i) => {
              const done = i <= stage
              return (
                <div key={s} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 1 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: done ? (i === stage ? 'var(--gold)' : 'var(--teal)') : 'white', border: `2px solid ${done ? 'var(--teal)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'white' }}>{done ? '✓' : ''}</div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 7.5, letterSpacing: 1, color: done ? 'var(--text)' : 'var(--muted)', marginTop: 8, textAlign: 'center', maxWidth: 70 }}>{s.toUpperCase()}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: itinerary.length ? '1fr 1fr' : '1fr', gap: 20 }}>
        {/* Trip facts */}
        <div className="luxury-card" style={{ padding: 28 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--gold)', marginBottom: 20, fontWeight: 700 }}>TRIP DETAILS</div>
          <div style={{ display: 'grid', gap: 14 }}>
            {facts.map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, color: 'var(--muted)' }}>{k.toUpperCase()}</span>
                <span style={{ fontSize: 14, color: 'var(--text)', textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>
          {Array.isArray(b.experience_types) && b.experience_types.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 1, color: 'var(--muted)', marginBottom: 10 }}>EXPERIENCES</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {b.experience_types.map((e: string) => <span key={e} className="badge badge-teal">{e}</span>)}
              </div>
            </div>
          )}
          {b.notes && <p style={{ marginTop: 20, fontSize: 14, color: 'var(--muted)', lineHeight: 1.7, fontStyle: 'italic' }}>{b.notes}</p>}
          <Link href="/portal/documents" className="btn-ghost btn-sm" style={{ marginTop: 22, display: 'inline-block' }}>📄 View Trip Documents</Link>
        </div>

        {/* Itinerary */}
        {itinerary.length > 0 && (
          <div className="luxury-card" style={{ padding: 28 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--gold)', marginBottom: 20, fontWeight: 700 }}>DAY BY DAY</div>
            <div style={{ display: 'grid', gap: 18 }}>
              {itinerary.map((day, i) => (
                <div key={i} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: '50%', background: 'rgba(196,154,10,0.1)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cormorant Garamond, serif', fontSize: 16, color: 'var(--gold-dark)' }}>{day.day ?? i + 1}</div>
                  <div>
                    {day.title && <div style={{ fontSize: 15, color: 'var(--text)', marginBottom: 3, fontWeight: 500 }}>{day.title}</div>}
                    {day.detail && <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>{day.detail}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
