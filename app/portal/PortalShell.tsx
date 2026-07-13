'use client'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import { useInactivityLogout } from '@/hooks/useInactivityLogout'

const tabs = [
  { href: '/portal', label: 'Dashboard', icon: '⌂' },
  { href: '/portal/trips', label: 'My Trips', icon: '✈' },
  { href: '/portal/events', label: 'Events', icon: '★' },
  { href: '/portal/messages', label: 'Concierge', icon: '✉' },
  { href: '/portal/documents', label: 'Documents', icon: '📄' },
  { href: '/portal/profile', label: 'My Profile', icon: '⚙' },
]

export default function PortalShell({ children, profile }: { children: React.ReactNode, profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { showWarning, countdown } = useInactivityLogout(1200)

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  // FIX: dispatch on window with bubbles:true so event reaches window listeners in useInactivityLogout
  const resetInactivityTimer = () => {
    window.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {showWarning && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, background: 'rgba(192,57,43,0.95)', color: 'white', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 2, boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
          <span>⚠ SESSION EXPIRING IN {countdown}s DUE TO INACTIVITY</span>
          <button onClick={resetInactivityTimer} style={{ background: 'white', color: 'rgba(192,57,43,0.9)', border: 'none', padding: '6px 16px', fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 1, cursor: 'pointer', borderRadius: 2, fontWeight: 700 }}>STAY LOGGED IN</button>
        </div>
      )}
      <div style={{ width: 220, background: 'white', borderRight: '1px solid var(--border)', flexShrink: 0, display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, bottom: 0, left: 0 }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 22, color: 'var(--gold)', fontStyle: 'italic' }}>FHJ</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 3, color: 'var(--muted)', marginTop: 2 }}>CLIENT PORTAL</div>
        </div>
        <nav style={{ padding: '12px 0', flex: 1 }}>
          {tabs.map(tab => (
            <Link key={tab.href} href={tab.href}
              className={`sidebar-item ${pathname === tab.href ? 'active' : ''}`}>
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </Link>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Logged in as</div>
          <div style={{ fontSize: 14, color: 'var(--text)', marginBottom: 6 }}>{profile.full_name || profile.email}</div>
          <span className={`badge ${profile.tier === 'Platinum' ? 'badge-teal' : profile.tier === 'Gold' ? 'badge-gold' : 'badge-success'}`}>{profile.tier}</span>
          <button onClick={signOut} style={{ display: 'block', marginTop: 12, width: '100%', background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', padding: '8px', fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 2, cursor: 'pointer', transition: 'all 0.2s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--danger)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)' }}>
            SIGN OUT
          </button>
        </div>
      </div>
      <div style={{ flex: 1, marginLeft: 220, padding: 36, overflowY: 'scroll', minHeight: '100vh', background: 'var(--ivory)' }}>
        {children}
      </div>
    </div>
  )
}
