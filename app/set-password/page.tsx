'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) setReady(true)
      else setError('Invalid or expired invite link.')
    })
  }, [])

  const handleSubmit = async () => {
    if (password !== confirm) return setError('Passwords do not match')
    if (password.length < 6) return setError('Password must be at least 6 characters')
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return setError(error.message)
    router.push('/admin')
  }

  if (!ready) return <p>{error || 'Verifying invite...'}</p>

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 24 }}>
      <h1>Set Your Password</h1>
      <input type="password" placeholder="New password" value={password}
        onChange={e => setPassword(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 12 }} />
      <input type="password" placeholder="Confirm password" value={confirm}
        onChange={e => setConfirm(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 12 }} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={handleSubmit}>Set Password & Go to Admin</button>
    </div>
  )
}