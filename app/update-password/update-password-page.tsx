'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const params = useSearchParams()
  const loginType = params.get('type') === 'client' ? 'client' : 'admin'
  const supabase = createClient()

  useEffect(() => {
    // Handle the hash token from Supabase email link
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      supabase.auth.getSession()
    }
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    setSuccess(true)
    setTimeout(() => router.replace(`/login?type=${loginType}`), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ivory)', padding: 20 }}>
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
              <p style={{ color: 'var(--muted)', fontSize: 15 }}>Redirecting you to login...</p>
            </div>
          ) : (
            <>
              <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 30, marginBottom: 8, textAlign: 'center', color: 'var(--text-rich)' }}>Set New Password</h2>
              <p style={{ color: 'var(--muted)', fontSize: 15, textAlign: 'center', marginBottom: 32 }}>Choose a strong password for your account</p>
              {error && <div style={{ padding: '12px 16px', background: 'rgba(192,57,43,0.08)', border: '2px solid rgba(192,57,43,0.3)', color: 'var(--danger)', fontSize: 14, marginBottom: 20, borderRadius: 3 }}>{error}</div>}
              <form onSubmit={handleUpdate}>
                <label className="lux-label">New Password</label>
                <input className="luxury-input" style={{ marginBottom: 20 }} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" />
                <label className="lux-label">Confirm Password</label>
                <input className="luxury-input" style={{ marginBottom: 32 }} type="password" placeholder="••••••••" value={confirm} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" />
                <button type="submit" className="btn-teal" style={{ width: '100%', padding: '16px', borderRadius: 2, opacity: loading ? 0.7 : 1, fontSize: 12 }} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link href="/login?type=admin" style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, color: 'var(--muted)', textDecoration: 'none' }}>← Back to Login</Link>
        </div>
      </div>
    </div>
  )
}
