'use client'
import { useState, useEffect } from 'react'

function parts(targetMs: number) {
  const now = Date.now()
  let diff = Math.max(0, targetMs - now)
  const days = Math.floor(diff / 86400000); diff -= days * 86400000
  const hours = Math.floor(diff / 3600000); diff -= hours * 3600000
  const mins = Math.floor(diff / 60000); diff -= mins * 60000
  const secs = Math.floor(diff / 1000)
  return { days, hours, mins, secs }
}

export default function Countdown({ date, compact = false }: { date: string; compact?: boolean }) {
  const targetMs = new Date(date + 'T00:00:00').getTime()
  const [t, setT] = useState(() => parts(targetMs))

  useEffect(() => {
    const id = setInterval(() => setT(parts(targetMs)), 1000)
    return () => clearInterval(id)
  }, [targetMs])

  const cell = (val: number, label: string) => (
    <div style={{ textAlign: 'center', minWidth: compact ? 44 : 64 }}>
      <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: compact ? 26 : 44, fontWeight: 300, color: 'var(--gold)', lineHeight: 1 }}>
        {String(val).padStart(2, '0')}
      </div>
      <div style={{ fontFamily: 'Cinzel, serif', fontSize: compact ? 7 : 9, letterSpacing: 2, color: 'var(--muted)', marginTop: 6 }}>{label}</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', gap: compact ? 10 : 20, alignItems: 'flex-start' }}>
      {cell(t.days, 'DAYS')}
      {cell(t.hours, 'HOURS')}
      {cell(t.mins, 'MINS')}
      {!compact && cell(t.secs, 'SECS')}
    </div>
  )
}
