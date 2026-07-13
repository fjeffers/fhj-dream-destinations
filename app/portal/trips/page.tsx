import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { destImage } from '@/lib/destinations'
import { daysUntil, nights } from '@/lib/trip'

export default async function TripsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?type=client')

  const { data: bookings } = await supabase
    .from('bookings')
    .select('*')
    .eq('client_id', user.id)
    .order('travel_date', { ascending: true, nullsFirst: false })

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: 32 }}>
        <div className="section-eyebrow" style={{ marginBottom: 8 }}>Your History</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 300 }}>
          My <em style={{ color: 'var(--gold)' }}>Journeys</em>
        </h2>
      </div>
      {bookings && bookings.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {bookings.map((b: any) => {
            const d = daysUntil(b.travel_date)
            const n = nights(b.travel_date, b.return_date)
            const cancelled = (b.status || '').toLowerCase() === 'cancelled'
            return (
              <Link key={b.id} href={`/portal/trips/${b.id}`} className="luxury-card" style={{ overflow: 'hidden', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: 170 }}>
                  <img src={destImage(b.destination, b.package_name)} alt={b.package_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(20,25,25,0.65), transparent 60%)' }} />
                  <div style={{ position: 'absolute', top: 12, right: 12 }}>
                    <span className={`badge ${b.status === 'Confirmed' ? 'badge-success' : b.status === 'Completed' ? 'badge-gold' : b.status === 'Deposit Paid' ? 'badge-teal' : cancelled ? 'badge-danger' : 'badge-gold'}`}>{b.status}</span>
                  </div>
                  {d !== null && d > 0 && !cancelled && (
                    <div style={{ position: 'absolute', bottom: 12, left: 14, color: 'white', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 1 }}>
                      ✦ {d} {d === 1 ? 'DAY' : 'DAYS'} TO GO
                    </div>
                  )}
                </div>
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, marginBottom: 6 }}>{b.package_name}</h3>
                  <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    {b.destination && <span>📍 {b.destination}</span>}
                    {b.travel_date && <span>📅 {new Date(b.travel_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                    {n && <span>🌙 {n} {n === 1 ? 'night' : 'nights'}</span>}
                  </div>
                  <div style={{ marginTop: 'auto', paddingTop: 14, fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--teal-dark)' }}>VIEW JOURNEY →</div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
          <div style={{ fontSize: 56, marginBottom: 20 }}>✈️</div>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, marginBottom: 12 }}>No trips yet</h3>
          <p style={{ fontSize: 15, marginBottom: 28 }}>Your booked journeys will appear here.</p>
          <Link href="/book" className="btn-gold">Plan Your First Trip</Link>
        </div>
      )}
    </div>
  )
}
