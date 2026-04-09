'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

function LoginContent() {

  const router = useRouter()
  const params = useSearchParams()
  const type = params.get('type') || 'client'
  const isAdmin = type === 'admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  // Handle password reset token in URL hash
  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          router.replace(isAdmin ? '/admin' : '/portal')
        }
      })
    }
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, approved')
      .eq('id', data.user.id)
      .single()

    if (profileError || !profile) {
      setError('Could not load your profile. Please try again.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    if (isAdmin && !['admin', 'manager', 'employee'].includes(profile.role)) {
      await supabase.auth.signOut()
      setError('Access denied. Admin credentials required.')
      setLoading(false)
      return
    }

    if (!isAdmin && !profile.approved) {
      await supabase.auth.signOut()
      setError('Your account is pending approval. We will contact you shortly.')
      setLoading(false)
      return
    }

    router.replace(isAdmin ? '/admin' : '/portal')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(160deg, #FDFAF3 0%, #EDF7F7 60%, #FDFAF3 100%)', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid var(--gold)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 4px 24px rgba(196,154,10,0.25)', padding: 4 }}>
            <img src="/logo.png" alt="FHJ" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} />
          </div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 18, color: 'var(--gold-dark)', fontWeight: 700, letterSpacing: 3 }}>FHJ DREAM</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 5, color: 'var(--teal-dark)', marginTop: 3, fontWeight: 600 }}>
            {isAdmin ? 'ADMINISTRATOR ACCESS' : 'CLIENT PORTAL'}
          </div>
        </div>

        <div className="luxury-card" style={{ padding: 44, borderRadius: 4 }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, marginBottom: 8, textAlign: 'center', color: 'var(--text-rich)', fontWeight: 400 }}>
            {isAdmin ? 'Admin Login' : 'Welcome Back'}
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 16, textAlign: 'center', marginBottom: 32 }}>
            {isAdmin ? 'Access the control center' : 'Access your exclusive travel dashboard'}
          </p>

          {error && (
            <div style={{ padding: '14px 18px', background: 'rgba(192,57,43,0.08)', border: '2px solid rgba(192,57,43,0.3)', color: 'var(--danger)', fontSize: 15, marginBottom: 20, borderRadius: 3, lineHeight: 1.5 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <label className="lux-label">Email Address</label>
            <input className="luxury-input" style={{ marginBottom: 20 }} type="email"
              placeholder="your@email.com" value={email}
              onChange={e => setEmail(e.target.value)} required autoComplete="email" />

            <label className="lux-label">Password</label>
            <input className="luxury-input" style={{ marginBottom: 32 }} type="password"
              placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />

            <button type="submit" className="btn-teal"
              style={{ width: '100%', padding: '16px', borderRadius: 2, opacity: loading ? 0.7 : 1, fontSize: 12 }}
              disabled={loading}>
              {loading ? 'Signing In...' : isAdmin ? 'Access Dashboard' : 'Enter Portal'}
            </button>
          </form>

          {!isAdmin && (
            <p style={{ textAlign: 'center', marginTop: 20, fontSize: 16, color: 'var(--muted)' }}>
              Not a client yet?{' '}
              <Link href="/book" style={{ color: 'var(--teal-dark)', textDecoration: 'none', fontWeight: 600 }}>Submit an inquiry →</Link>
            </p>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 28, marginTop: 24, flexWrap: 'wrap' }}>
          <Link href="/" style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: 2, color: 'var(--teal-dark)', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', border: '1.5px solid rgba(14,143,143,0.35)', borderRadius: 4, background: 'white' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )

}

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#F9F7F2' }} />}>
      <LoginContent />
    </Suspense>
  )
}