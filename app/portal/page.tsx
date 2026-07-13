import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Countdown from '@/components/Countdown'
import TravelMap from '@/components/TravelMap'
import { destImage } from '@/lib/destinations'
import { daysUntil } from '@/lib/trip'

const TIERS = ['Silver', 'Gold', 'Platinum'] as const
const TIER_THRESHOLD: Record<string, number> = { Silver: 0, Gold: 3, Platinum: 6 }

export default async function PortalDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?type=client')

  const today = new Date().toISOString().split('T')[0]
  const [profileRes, bookingsRes, appointmentsRes, eventsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('bookings').select('*').eq('client_id', user.id).order('travel_date', { ascending: true, nullsFirst: false }),
    supabase.from('appointments').select('*').eq('client_id', user.id).gte('date', today).order('date').limit(3),
    supabase.from('events').select('*').eq('active', true).order('date').limit(2),
  ])

  const profile = profileRes.data
  const bookings = bookingsRes.data || []
  const appointments = appointmentsRes.data || []
  const events = eventsRes.data || []
  const firstName = profile?.full_name?.split(' ')[0] || 'Valued Client'

  // Next upcoming trip = soonest travel_date in the future that isn't cancelled
  const nextTrip = bookings.find((b: any) => b.travel_date && b.travel_date >= today && (b.status || '').toLowerCase() !== 'cancelled')
  const upcomingTrips = bookings.filter((b: any) => (b.status || '').toLowerCase() !== 'completed' && (b.status || '').toLowerCase() !== 'cancelled').slice(0, 3)

  const tier = profile?.tier || 'Silver'
  const tripsCount = profile?.trips_count || 0
  const tierIdx = Math.max(0, TIERS.indexOf(tier as any))
  const nextTier = TIERS[tierIdx + 1]
  const toNext = nextTier ? Math.max(0, TIER_THRESHOLD[nextTier] - tripsCount) : 0

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: 28 }}>
        <div className="section-eyebrow" style={{ marginBottom: 8 }}>Welcome Back</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 44, fontWeight: 300 }}>
          Hello, <em style={{ color: 'var(--gold)' }}>{firstName}</em>
        </h2>
      </div>

      {/* Countdown hero for next trip */}
      {nextTrip && (
        <Link href={`/portal/trips/${nextTrip.id}`} style={{ textDecoration: 'none' }}>
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 24, minHeight: 220, display: 'flex', alignItems: 'center' }}>
            <img src={destImage(nextTrip.destination, nextTrip.package_name)} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, rgba(20,25,25,0.9) 0%, rgba(20,25,25,0.55) 60%, rgba(20,25,25,0.25) 100%)' }} />
            <div style={{ position: 'relative', padding: 32, color: 'white' }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 4, color: 'var(--gold)', marginBottom: 8 }}>✦ YOUR NEXT ADVENTURE</div>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 34, fontWeight: 300, marginBottom: 4 }}>{nextTrip.package_name}</h3>
              {nextTrip.destination && <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 18 }}>📍 {nextTrip.destination}</div>}
              <Countdown date={nextTrip.travel_date} compact />
            </div>
          </div>
        </Link>
      )}

      {/* Stats + tier progress */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.4fr', gap: 16, marginBottom: 24 }}>
        <div className="luxury-card" style={{ padding: 22 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 2, color: 'var(--muted)', marginBottom: 8 }}>TOTAL TRIPS</div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 30, color: 'var(--gold)', lineHeight: 1 }}>{tripsCount}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>Journeys Taken</div>
        </div>
        <div className="luxury-card" style={{ padding: 22 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 2, color: 'var(--muted)', marginBottom: 8 }}>LIFETIME VALUE</div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 30, color: 'var(--gold)', lineHeight: 1 }}>${(profile?.total_spent || 0).toLocaleString()}</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>With FHJ</div>
        </div>
        <div className="luxury-card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 2, color: 'var(--muted)' }}>MEMBERSHIP</div>
            <span className={`badge ${tier === 'Platinum' ? 'badge-teal' : tier === 'Gold' ? 'badge-gold' : 'badge-success'}`}>{tier}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {TIERS.map((tName, i) => (
              <div key={tName} style={{ flex: 1, height: 6, borderRadius: 3, background: i <= tierIdx ? 'linear-gradient(90deg, var(--teal), var(--gold))' : 'var(--border)' }} />
            ))}
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)' }}>
            {nextTier ? `${toNext} more ${toNext === 1 ? 'trip' : 'trips'} to ${nextTier}` : '✦ Top tier — thank you for your loyalty'}
          </div>
        </div>
      </div>

      {/* Travel map */}
      <div className="luxury-card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--gold)', fontWeight: 700 }}>YOUR WORLD</div>
          <Link href="/portal/trips" style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 2, color: 'var(--muted)', textDecoration: 'none' }}>All Journeys →</Link>
        </div>
        <TravelMap trips={bookings.map((b: any) => ({ id: b.id, label: b.package_name, destination: b.destination, packageName: b.package_name, status: b.status }))} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Upcoming Trips */}
        <div className="luxury-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--gold)' }}>UPCOMING TRIPS</div>
            <Link href="/portal/trips" style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 2, color: 'var(--muted)', textDecoration: 'none' }}>View All →</Link>
          </div>
          {upcomingTrips.length > 0 ? upcomingTrips.map((b: any) => {
            const d = daysUntil(b.travel_date)
            return (
              <Link key={b.id} href={`/portal/trips/${b.id}`} style={{ display: 'block', padding: '14px 0', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'inherit' }}>
                <div style={{ fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{b.package_name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>{b.travel_date || 'Date TBD'}{d !== null && d > 0 ? ` · ${d} days` : ''}</span>
                  <span className={`badge ${b.status === 'Confirmed' ? 'badge-success' : b.status === 'Deposit Paid' ? 'badge-teal' : 'badge-gold'}`}>{b.status}</span>
                </div>
              </Link>
            )
          }) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✈️</div>
              <p style={{ fontSize: 13, marginBottom: 16 }}>No trips booked yet</p>
              <Link href="/book" className="btn-gold btn-sm">Plan a Trip</Link>
            </div>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="luxury-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--gold)' }}>UPCOMING APPOINTMENTS</div>
            <Link href="/book-appointment" style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 2, color: 'var(--muted)', textDecoration: 'none' }}>Book One →</Link>
          </div>
          {appointments.length > 0 ? appointments.map((a: any) => (
            <div key={a.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{a.type}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{a.date} at {a.time}</span>
                <span className={`badge ${a.status === 'Confirmed' ? 'badge-success' : 'badge-gold'}`}>{a.status}</span>
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
              <p style={{ fontSize: 13, marginBottom: 16 }}>No upcoming appointments</p>
              <Link href="/book-appointment" className="btn-ghost btn-sm">Schedule Now</Link>
            </div>
          )}
        </div>
      </div>

      {/* Events */}
      {events.length > 0 && (
        <div className="luxury-card" style={{ padding: 24, marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--gold)' }}>EXCLUSIVE EVENTS FOR YOU</div>
            <Link href="/portal/events" style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 2, color: 'var(--muted)', textDecoration: 'none' }}>View All →</Link>
          </div>
          {events.map((ev: any) => (
            <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 44, height: 44, background: 'rgba(201,168,76,0.1)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', flexShrink: 0, fontSize: 18 }}>★</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: 'var(--text)', marginBottom: 2 }}>{ev.title}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{ev.date}{ev.location ? ` · ${ev.location}` : ''}</div>
              </div>
              <Link href="/portal/events" className="btn-ghost btn-sm">View</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
