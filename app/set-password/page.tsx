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
    // This page is reached after /auth/callback exchanges the code. Just verify we have a session.
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
          setError('Invalid or expired link. Please request a new invite.')
        }
      }
    })
  }, [])

  const handleSubmit = async () => {
    if (!password) return setError('Please enter a password.')
    if (password !== confirm) return setError('Passwords do not match.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    setSaving(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) { setError(updateError.message); setSaving(false); return }

    // Redirect based on role
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role && ADMIN_ROLES.includes(profile.role)) {
        router.push('/admin')
      } else {
        router.push('/portal')
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
          <p style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 3 }}>VERIFYING YOUR INVITE...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #FDFAF3 0%, #EDF7F7 60%, #FDFAF3 100%)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, color: 'var(--gold)', fontStyle: 'italic', marginBottom: 4 }}>FHJ</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 6, color: 'var(--teal-dark)', fontWeight: 600 }}>DREAM DESTINATIONS</div>
        </div>

        {error ? (
          <div style={{ background: 'white', border: '2px solid rgba(192,57,43,0.3)', borderRadius: 4, padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, marginBottom: 12, color: 'var(--text-rich)' }}>Link Expired</h2>
            <p style={{ color: 'var(--danger)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>{error}</p>
            <a href="/login?type=admin" style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, color: 'var(--teal-dark)', textDecoration: 'none', border: '1.5px solid var(--teal)', padding: '10px 24px', display: 'inline-block' }}>
              Back to Login
            </a>
          </div>
        ) : (
          <div className="luxury-card" style={{ padding: 44, borderRadius: 4 }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 30, marginBottom: 8, textAlign: 'center', color: 'var(--text-rich)', fontWeight: 400 }}>
              Set Your Password
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center', marginBottom: 32, lineHeight: 1.6 }}>
              Welcome to the FHJ team! Create a strong password to secure your account.
            </p>

            {error && (
              <div style={{ padding: '12px 16px', background: 'rgba(192,57,43,0.08)', border: '2px solid rgba(192,57,43,0.3)', color: 'var(--danger)', fontSize: 14, marginBottom: 20, borderRadius: 3 }}>
                {error}
              </div>
            )}

            <label className="lux-label">New Password</label>
            <input className="luxury-input" style={{ marginBottom: 16 }} type="password"
              placeholder="Min. 8 characters" value={password}
              onChange={e => setPassword(e.target.value)} autoComplete="new-password" />

            <label className="lux-label">Confirm Password</label>
            <input className="luxury-input" style={{ marginBottom: 32 }} type="password"
              placeholder="Re-enter password" value={confirm}
              onChange={e => setConfirm(e.target.value)} autoComplete="new-password" />

            <button onClick={handleSubmit} className="btn-teal"
              style={{ width: '100%', padding: '16px', borderRadius: 2, opacity: saving ? 0.7 : 1, fontSize: 12 }}
              disabled={saving}>
              {saving ? 'Setting Password...' : 'Set Password & Continue →'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
