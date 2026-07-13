'use client'
import { useState, useEffect, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function UpdatePasswordContent() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const params = useSearchParams()
  const loginType = params.get('type') === 'admin' ? 'admin' : 'client'

  useEffect(() => {
    const hash = window.location.hash
    const hashParams = new URLSearchParams(hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    // token_hash flow (recommended): the email link points here directly, and we
    // verify in client-side JS. Email link scanners (Gmail, etc.) fetch the HTML
    // but don't run JS, so they can't consume the one-time token by prefetching.
    const tokenHash = params.get('token_hash')
    const otpType = params.get('otp_type') || params.get('type')

    if (tokenHash && otpType && otpType !== 'admin' && otpType !== 'client') {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: otpType as any })
        .then(({ error }) => { if (error) setError('This link is invalid or has expired.'); else setReady(true) })
    } else if (accessToken) {
      supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken || '' })
        .then(({ error }) => { if (error) setError('This link is invalid or has expired.'); else setReady(true) })
    } else {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) setReady(true)
        else setError('This link is invalid or has expired.')
      })
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) return setError('Passwords do not match.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true)
    setTimeout(() => router.replace(loginType === 'admin' ? '/admin' : '/portal'), 1800)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #FDFAF3 0%, #EDF7F7 60%, #FDFAF3 100%)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid var(--gold)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 24px rgba(196,154,10,0.25)', padding: 4 }}>
            <img src="/logo.png" alt="FHJ" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
          </div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 18, color: 'var(--gold-dark)', fontWeight: 700, letterSpacing: 3 }}>FHJ DREAM</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 5, color: 'var(--teal-dark)', marginTop: 3, fontWeight: 600 }}>SET NEW PASSWORD</div>
        </div>

        <div className="luxury-card" style={{ padding: 44, borderRadius: 4 }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, color: 'var(--teal-dark)', marginBottom: 8 }}>Password Updated!</h3>
              <p style={{ color: 'var(--muted)', fontSize: 15 }}>Taking you to your dashboard…</p>
            </div>
          ) : !ready ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: error ? 'var(--danger)' : 'var(--muted)', fontSize: 15, lineHeight: 1.6 }}>{error || 'Verifying your link…'}</p>
              {error && (
                <Link href={`/login?type=${loginType}`} style={{ display: 'inline-block', marginTop: 16, fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 2, color: 'var(--teal-dark)', textDecoration: 'none' }}>
                  ← Back to Login
                </Link>
              )}
            </div>
          ) : (
            <>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 30, marginBottom: 8, textAlign: 'center', color: 'var(--text-rich)' }}>Set New Password</h2>
              <p style={{ color: 'var(--muted)', fontSize: 15, textAlign: 'center', marginBottom: 32 }}>Choose a strong password for your account</p>
              {error && <div style={{ padding: '12px 16px', background: 'rgba(192,57,43,0.08)', border: '2px solid rgba(192,57,43,0.3)', color: 'var(--danger)', fontSize: 14, marginBottom: 20, borderRadius: 3 }}>{error}</div>}
              <form onSubmit={handleSubmit}>
                <label className="lux-label">New Password</label>
                <input className="luxury-input" style={{ marginBottom: 20 }} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
                <label className="lux-label">Confirm Password</label>
                <input className="luxury-input" style={{ marginBottom: 32 }} type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" />
                <button type="submit" className="btn-teal" style={{ width: '100%', padding: '16px', borderRadius: 2, opacity: loading ? 0.7 : 1, fontSize: 12 }} disabled={loading}>
                  {loading ? 'Saving…' : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function UpdatePasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F9F7F2' }} />}>
      <UpdatePasswordContent />
    </Suspense>
  )
}
