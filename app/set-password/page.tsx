'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const ADMIN_ROLES = ['admin', 'manager', 'employee']

export default function SetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // With @supabase/ssr + PKCE flow the session is set via the auth callback route.
    // This page is also reached after first login when must_change_password is set.
    // Just verify we have an active session.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true)
      } else {
        // Fallback: try reading token from URL hash (legacy implicit flow)
        const hash = window.location.hash
        const params = new URLSearchParams(hash.substring(1))
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        if (accessToken) {
          supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken || '' })
            .then(({ error: e }) => {
              if (e) setError('Invalid or expired link. Please request a new invite.')
              else setReady(true)
            })
        } else {
          setError('No active session found. Please log in again.')
        }
      }
    })
  }, [])

  const handleSubmit = async () => {
    if (!password) return setError('Please enter a password.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (password === 'Welcome@FHJ1!') return setError('Please choose a different password from the temporary one.')
    if (password !== confirm) return setError('Passwords do not match.')

    setSaving(true)

    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError(updateError.message)
      setSaving(false)
      return
    }

    // Clear the must_change_password flag in user metadata
    await supabase.auth.updateUser({
      data: { must_change_password: false }
    })

    // Redirect based on role
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role && ADMIN_ROLES.includes(profile.role)) {
        window.location.replace('/admin')
      } else {
        window.location.replace('/portal')
      }
    } else {
      router.push('/login')
    }
  }

  if (!ready && !error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FDFAF3' }}>
        <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontStyle: 'italic', color: 'var(--gold)', marginBottom: 12 }}>FHJ</div>
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3 }}>VERIFYING SESSION...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #FDFAF3 0%, #EDF7F7 60%, #FDFAF3 100%)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid var(--gold)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', padding: 4 }}>
            <img src="/logo.png" alt="FHJ" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
          </div>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 14, fontStyle: 'italic', color: 'var(--gold)', marginBottom: 4 }}>FHJ Dream Destinations</div>
        </div>

        {error && !ready ? (
          // Session error state
          <div style={{ background: 'white', border: '2px solid rgba(192,57,43,0.3)', borderRadius: 4, padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, marginBottom: 12, color: 'var(--text-rich)' }}>Session Error</h2>
            <p style={{ color: 'var(--danger)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>{error}</p>
            <a href="/login?type=admin" style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, color: 'var(--teal-dark)', textDecoration: 'none', border: '1.5px solid var(--teal)', padding: '10px 24px', display: 'inline-block' }}>
              Back to Login
            </a>
          </div>
        ) : (
          <div className="luxury-card" style={{ padding: 44, borderRadius: 4 }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal-dark), var(--teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>🔐</div>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 30, color: 'var(--text-rich)', fontWeight: 400, marginBottom: 8 }}>
                Set Your Password
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
                Welcome to the team! Please create a secure password to protect your account.
              </p>
            </div>

            {/* Requirements hint */}
            <div style={{ background: 'rgba(14,143,143,0.06)', border: '1px solid rgba(14,143,143,0.2)', borderRadius: 4, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
              Password must be at least <strong>8 characters</strong> and different from the temporary password.
            </div>

            {error && (
              <div style={{ padding: '12px 16px', background: 'rgba(192,57,43,0.08)', border: '2px solid rgba(192,57,43,0.3)', color: 'var(--danger)', fontSize: 14, marginBottom: 20, borderRadius: 3, lineHeight: 1.5 }}>
                {error}
              </div>
            )}

            <label className="lux-label">New Password</label>
            <input
              className="luxury-input"
              style={{ marginBottom: 16 }}
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              autoComplete="new-password"
            />

            <label className="lux-label">Confirm Password</label>
            <input
              className="luxury-input"
              style={{ marginBottom: 32 }}
              type="password"
              placeholder="Re-enter your password"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError('') }}
              autoComplete="new-password"
            />

            <button
              onClick={handleSubmit}
              className="btn-teal"
              style={{ width: '100%', padding: '16px', borderRadius: 2, opacity: saving ? 0.7 : 1, fontSize: 12 }}
              disabled={saving}>
              {saving ? 'Saving...' : 'Set Password & Enter Dashboard →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
