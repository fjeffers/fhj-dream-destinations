'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function useInactivityLogout(timeoutSeconds = 90) {
  const router = useRouter()
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const warnTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(15)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const reset = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (warnTimerRef.current) clearTimeout(warnTimerRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
      setShowWarning(false)
      setCountdown(15)

      // Show warning 15s before logout
      warnTimerRef.current = setTimeout(() => {
        setShowWarning(true)
        setCountdown(15)
        let c = 15
        countdownRef.current = setInterval(() => {
          c--
          setCountdown(c)
          if (c <= 0) clearInterval(countdownRef.current!)
        }, 1000)
      }, (timeoutSeconds - 15) * 1000)

      // Auto logout
      timerRef.current = setTimeout(async () => {
        await supabase.auth.signOut()
        router.replace('/login?reason=timeout')
      }, timeoutSeconds * 1000)
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']
    events.forEach(e => window.addEventListener(e, reset, { passive: true }))
    reset()

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (warnTimerRef.current) clearTimeout(warnTimerRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
      events.forEach(e => window.removeEventListener(e, reset))
    }
  }, [timeoutSeconds])

  return { showWarning, countdown }
}