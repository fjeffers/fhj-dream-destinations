'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    // Exchange the token from the URL hash
    const hash = window.location.hash
    const params = new URLSearchParams(hash.substring(1))
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    if (accessToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      }).then(({ error }) => {
        if (error) setError('Invalid or expired invite link.')
        else setReady(true)
      })
    } else {
      // fallback — check if already signed in
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) setReady(true)
        else setError('Invalid or expired invite link.')
      })
    }
  }, [])

  const handleSubmit = async () => {
    if (password !== confirm) return setError('Passwords do not match')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return setError(error.message)
    router.push('/admin')
  }

  if (!ready) return <p style={{ padding: 40 }}>{error || 'Verifying invite...'}</p>

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 24 }}>
      <h1>Set Your Password</h1>
      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8 }}
      />
      <input
        type="password"
        placeholder="Confirm password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8 }}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleSubmit} style={{ padding: '10px 20px', cursor: 'pointer' }}>
        Set Password & Go to Admin
      </button>
    </div>
  )
}