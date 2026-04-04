import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function PortalDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
  const { data: bookings } = await supabase.from('bookings').select('*').eq('client_id', user!.id).order('created_at', { ascending: false }).limit(3)
  const { data: appointments } = await supabase.from('appointments').select('*').eq('client_id', user!.id).gte('date', new Date().toISOString().split('T')[0]).order('date').limit(3)
  const { data: events } = await supabase.from('events').select('*').eq('active', true).order('date').limit(2)

  const firstName = profile?.full_name?.split(' ')[0] || 'Valued Client'

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: 36 }}>
        <div className="section-eyebrow" style={{ marginBottom: 8 }}>Welcome Back</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 44, fontWeight: 300 }}>
          Hello, <em style={{ color: 'var(--gold)' }}>{firstName}</em>
        </h2>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Membership', value: profile?.tier || 'Silver', sub: 'Current Tier' },
          { label: 'Total Trips', value: profile?.trips_count || 0, sub: 'Journeys Taken' },
          { label: 'Total Spent', value: `$${(profile?.total_spent || 0).toLocaleString()}`, sub: 'Lifetime Value' },
          { label: 'Your Advisor', value: 'Sophia Laurent', sub: 'Senior Architect' },
        ].map(stat => (
          <div key={stat.label} className="luxury-card" style={{ padding: 22 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 2, color: 'var(--muted)', marginBottom: 8 }}>{stat.label}</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: 'var(--gold)', lineHeight: 1.2, marginBottom: 4 }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Upcoming Bookings */}
        <div className="luxury-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--gold)' }}>UPCOMING TRIPS</div>
            <Link href="/portal/trips" style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 2, color: 'var(--muted)', textDecoration: 'none' }}>View All →</Link>
          </div>
          {bookings && bookings.length > 0 ? bookings.map(b => (
            <div key={b.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{b.package_name}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{b.travel_date || 'TBD'}</span>
                <span className={`badge ${b.status === 'Confirmed' ? 'badge-success' : b.status === 'Deposit Paid' ? 'badge-teal' : 'badge-gold'}`}>{b.status}</span>
              </div>
            </div>
          )) : (
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
          </div>
          {appointments && appointments.length > 0 ? appointments.map(a => (
            <div key={a.id} style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{a.type}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{a.date} at {a.time}</span>
                <span className={`badge ${a.status === 'Confirmed' ? 'badge-success' : 'badge-gold'}`}>{a.status}</span>
              </div>
              {a.notes && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{a.notes}</div>}
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
              <p style={{ fontSize: 13, marginBottom: 16 }}>No upcoming appointments</p>
              <Link href="/book" className="btn-ghost btn-sm">Schedule Now</Link>
            </div>
          )}
        </div>
      </div>

      {/* Exclusive Events Preview */}
      {events && events.length > 0 && (
        <div className="luxury-card" style={{ padding: 24, marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--gold)' }}>EXCLUSIVE EVENTS FOR YOU</div>
            <Link href="/portal/events" style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 2, color: 'var(--muted)', textDecoration: 'none' }}>View All →</Link>
          </div>
          {events.map(ev => (
            <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 44, height: 44, background: 'rgba(201,168,76,0.1)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', flexShrink: 0, fontSize: 18 }}>★</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: 'var(--text)', marginBottom: 2 }}>{ev.title}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{ev.date} · {ev.location}</div>
              </div>
              <Link href="/portal/events" className="btn-ghost btn-sm">RSVP</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
