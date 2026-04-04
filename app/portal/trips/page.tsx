import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function TripsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: bookings } = await supabase.from('bookings').select('*').eq('client_id', user!.id).order('created_at', { ascending: false })

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: 32 }}>
        <div className="section-eyebrow" style={{ marginBottom: 8 }}>Your History</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 300 }}>
          My <em style={{ color: 'var(--gold)' }}>Journeys</em>
        </h2>
      </div>
      {bookings && bookings.length > 0 ? (
        <div style={{ display: 'grid', gap: 16 }}>
          {bookings.map(b => (
            <div key={b.id} className="luxury-card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ fontSize: 44, flexShrink: 0 }}>✈️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                    <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22 }}>{b.package_name}</h3>
                    <span className={`badge ${b.status === 'Confirmed' ? 'badge-success' : b.status === 'Completed' ? 'badge-gold' : b.status === 'Deposit Paid' ? 'badge-teal' : 'badge-gold'}`}>{b.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 24, fontSize: 12, color: 'var(--muted)', flexWrap: 'wrap' }}>
                    {b.destination && <span>📍 {b.destination}</span>}
                    {b.travel_date && <span>📅 {b.travel_date}{b.return_date ? ` → ${b.return_date}` : ''}</span>}
                    {b.group_size && <span>👥 {b.group_size} {b.group_size === 1 ? 'guest' : 'guests'}</span>}
                    {b.value && <span style={{ color: 'var(--gold)' }}>💰 ${b.value.toLocaleString()}</span>}
                  </div>
                  {b.notes && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8, lineHeight: 1.6 }}>{b.notes}</p>}
                </div>
              </div>
              {b.status === 'Confirmed' && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ background: 'var(--panel2)', borderRadius: 2, height: 4, overflow: 'hidden' }}>
                    <div style={{ width: '65%', height: '100%', background: 'linear-gradient(90deg,var(--gold-dark),var(--gold))' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--muted)' }}>
                    <span>Booking Confirmed</span><span>65% Prepared</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 40px' }} className="luxury-card">
          <div style={{ fontSize: 64, marginBottom: 24 }}>✈️</div>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, marginBottom: 16, fontWeight: 300 }}>
            Your <em style={{ color: 'var(--gold)' }}>Adventure</em> Awaits
          </h3>
          <p style={{ color: 'var(--muted)', maxWidth: 400, margin: '0 auto 32px', lineHeight: 1.8 }}>
            You haven't booked any trips yet. Let our luxury travel architects craft your perfect journey.
          </p>
          <Link href="/book" className="btn-gold">Plan My First Journey</Link>
        </div>
      )}
    </div>
  )
}
