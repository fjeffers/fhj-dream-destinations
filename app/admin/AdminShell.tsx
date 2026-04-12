'use client'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useInactivityLogout } from '@/hooks/useInactivityLogout'

const sections = [
  { href: '/admin', label: 'Overview', icon: '⌂' },
  { href: '/admin/clients', label: 'Clients', icon: '👥' },
  { href: '/admin/deals', label: 'Deals', icon: '★' },
  { href: '/admin/events', label: 'Events & RSVP', icon: '🎟' },
  { href: '/admin/group-trips', label: 'Group Trips', icon: '🌍' },
  { href: '/admin/calendar', label: 'Calendar', icon: '📅' },
  { href: '/admin/appointments', label: 'Appointments', icon: '🔔' },
  { href: '/admin/bookings', label: 'Bookings', icon: '📋' },
  { href: '/admin/intake', label: 'Intake Requests', icon: '📥' },
  { href: '/admin/messages', label: 'Messages', icon: '✉' },
  { href: '/admin/content', label: 'Content Manager', icon: '✏️' },
  { href: '/admin/partners', label: 'Partners', icon: '🤝' },
  { href: '/admin/team', label: 'Team', icon: '🔑' },
]

export default function AdminShell({ children, profile }: { children: React.ReactNode, profile: any }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { showWarning, countdown } = useInactivityLogout(1800)

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login?type=admin')
    router.refresh()
  }

  const resetInactivityTimer = () => {
    window.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {showWarning && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: 'rgba(192,57,43,0.95)', color: 'white', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 2, boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
          <span>⚠ ADMIN SESSION EXPIRING IN {countdown}s DUE TO INACTIVITY</span>
          <button onClick={resetInactivityTimer} style={{ background: 'white', color: 'rgba(192,57,43,0.9)', border: 'none', padding: '6px 16px', fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 1, cursor: 'pointer', borderRadius: 2, fontWeight: 700 }}>STAY LOGGED IN</button>
        </div>
      )}
      <div style={{ width: 230, background: 'white', borderRight: '1px solid var(--border)', flexShrink: 0, display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0 }}>
        <div style={{ padding: '20px 18px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'var(--gold)', fontStyle: 'italic' }}>FHJ Admin</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 3, color: 'var(--muted)', marginTop: 2 }}>CONTROL CENTER</div>
        </div>
        <nav style={{ padding: '10px 0', flex: 1, overflowY: 'auto' }}>
          {sections.map(s => (
            <Link key={s.href} href={s.href}
              className={`sidebar-item ${pathname === s.href ? 'active' : ''}`}>
              <span style={{ fontSize: 14 }}>{s.icon}</span>
              <span>{s.label}</span>
            </Link>
          ))}
        </nav>
        <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 2 }}>Signed in as</div>
          <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 10 }}>{profile.full_name || profile.email}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/" style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 1, color: 'var(--muted)', textDecoration: 'none', border: '1px solid var(--border)', padding: '6px 10px', flex: 1, textAlign: 'center', transition: 'all 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--gold)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
              VIEW SITE
            </Link>
            <button onClick={signOut} style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 1, color: 'var(--muted)', background: 'none', border: '1px solid var(--border)', padding: '6px 10px', cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--danger)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)' }}>
              OUT
            </button>
          </div>
        </div>
      </div>
      <div style={{ flex: 1, marginLeft: 230, padding: 32, overflowY: 'scroll', minHeight: '100vh', background: 'var(--ivory)' }}>
        {children}
      </div>
    </div>
  )
}
