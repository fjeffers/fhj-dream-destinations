import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminOverview() {
  const supabase = await createClient()
  const [{ count: clientCount }, { count: dealCount }, { count: eventCount }, { count: apptCount }, { count: groupCount }, { count: intakeCount }, { data: recentAppts }, { data: recentIntake }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'client').eq('approved', true),
    supabase.from('deals').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).gte('date', new Date().toISOString().split('T')[0]),
    supabase.from('group_trips').select('*', { count: 'exact', head: true }),
    supabase.from('intake_requests').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
    supabase.from('appointments').select('*').gte('date', new Date().toISOString().split('T')[0]).order('date').limit(5),
    supabase.from('intake_requests').select('*').eq('status', 'Pending').order('created_at', { ascending: false }).limit(4),
  ])

  const stats = [
    { label: 'Active Clients', value: clientCount || 0, color: 'var(--gold)', href: '/admin/clients' },
    { label: 'Live Deals', value: dealCount || 0, color: 'var(--teal)', href: '/admin/deals' },
    { label: 'Events', value: eventCount || 0, color: 'var(--gold)', href: '/admin/events' },
    { label: 'Upcoming Appts', value: apptCount || 0, color: 'var(--teal)', href: '/admin/appointments' },
    { label: 'Group Trips', value: groupCount || 0, color: 'var(--gold)', href: '/admin/group-trips' },
    { label: 'Pending Intake', value: intakeCount || 0, color: 'var(--danger)', href: '/admin/intake' },
  ]

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: 32 }}>
        <div className="section-eyebrow" style={{ marginBottom: 8 }}>Control Center</div>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 42, fontWeight: 300 }}>
          Dashboard <em style={{ color: 'var(--gold)' }}>Overview</em>
        </h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
        {stats.map(s => (
          <Link key={s.label} href={s.href} style={{ textDecoration: 'none' }}>
            <div className="luxury-card" style={{ padding: 24, cursor: 'pointer' }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 44, color: s.color, lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--muted)' }}>{s.label}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Upcoming Appointments */}
        <div className="luxury-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--gold)' }}>UPCOMING APPOINTMENTS</span>
            <Link href="/admin/appointments" style={{ fontFamily: 'Cinzel, serif', fontSize: 8, color: 'var(--muted)', textDecoration: 'none' }}>View All →</Link>
          </div>
          <table className="lux-table">
            <thead><tr><th>Client</th><th>Date</th><th>Type</th><th>Status</th></tr></thead>
            <tbody>
              {recentAppts?.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 500 }}>{a.client_name}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 11 }}>{a.date}</td>
                  <td><span className="badge badge-teal">{a.type}</span></td>
                  <td><span className={`badge ${a.status === 'Confirmed' ? 'badge-success' : 'badge-gold'}`}>{a.status}</span></td>
                </tr>
              ))}
              {!recentAppts?.length && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px' }}>No upcoming appointments</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Pending Intake */}
        <div className="luxury-card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--gold)' }}>PENDING INTAKE REQUESTS</span>
            <Link href="/admin/intake" style={{ fontFamily: 'Cinzel, serif', fontSize: 8, color: 'var(--muted)', textDecoration: 'none' }}>View All →</Link>
          </div>
          <table className="lux-table">
            <thead><tr><th>Name</th><th>Destination</th><th>Date</th><th>Action</th></tr></thead>
            <tbody>
              {recentIntake?.map(r => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 500 }}>{r.first_name} {r.last_name}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 11 }}>{r.destination || '—'}</td>
                  <td style={{ color: 'var(--muted)', fontSize: 11 }}>{r.created_at?.split('T')[0]}</td>
                  <td><Link href="/admin/intake" className="btn-ghost btn-sm">Review</Link></td>
                </tr>
              ))}
              {!recentIntake?.length && <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)', padding: '24px' }}>No pending requests</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 20 }}>
        {[['Add Client', '/admin/clients'], ['Add Deal', '/admin/deals'], ['Add Event', '/admin/events'], ['View Calendar', '/admin/calendar']].map(([label, href]) => (
          <Link key={label} href={href} className="luxury-card" style={{ padding: 20, textAlign: 'center', cursor: 'pointer', textDecoration: 'none', display: 'block', transition: 'border-color 0.3s' }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--gold)' }}>{label}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
