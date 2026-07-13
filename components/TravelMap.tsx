'use client'
import { useState } from 'react'
import { LAND_DOTS } from '@/lib/worldmap-dots'
import { destInfo, project } from '@/lib/destinations'

export type MapTrip = { id: string; label: string; destination?: string | null; packageName?: string | null; status?: string | null }

type Pin = { id: string; label: string; x: number; y: number; visited: boolean }

export default function TravelMap({ trips }: { trips: MapTrip[] }) {
  const [hover, setHover] = useState<string | null>(null)

  const pins: Pin[] = []
  const seen = new Set<string>()
  for (const t of trips) {
    const info = destInfo(t.destination, t.packageName)
    if (!info) continue
    const key = `${info.lat},${info.lng}`
    if (seen.has(key)) continue
    seen.add(key)
    const { x, y } = project(info.lat, info.lng)
    pins.push({ id: t.id, label: t.label, x, y, visited: (t.status || '').toLowerCase() === 'completed' })
  }

  return (
    <div>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '2 / 1', background: 'linear-gradient(160deg, #FDFAF3, #EDF7F7)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
        <svg viewBox="0 0 200 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {LAND_DOTS.map(([x, y], i) => (
            <circle key={i} cx={x * 2} cy={y} r={0.42} fill="rgba(14,143,143,0.28)" />
          ))}
        </svg>

        {pins.map(p => (
          <div key={p.id}
            onMouseEnter={() => setHover(p.id)} onMouseLeave={() => setHover(null)}
            style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, transform: 'translate(-50%, -100%)', cursor: 'default', zIndex: hover === p.id ? 5 : 2 }}>
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {hover === p.id && (
                <div style={{ position: 'absolute', bottom: '100%', marginBottom: 4, whiteSpace: 'nowrap', background: 'var(--obsidian, #1a1a1a)', color: 'white', fontSize: 10, padding: '4px 8px', borderRadius: 4, fontFamily: 'Cormorant Garamond, serif' }}>
                  {p.label}
                </div>
              )}
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: p.visited ? 'var(--gold)' : 'var(--teal)', border: '2px solid white', boxShadow: '0 1px 6px rgba(0,0,0,0.3)' }} />
              <div style={{ width: 2, height: 6, background: p.visited ? 'var(--gold)' : 'var(--teal)' }} />
            </div>
          </div>
        ))}

        {pins.length === 0 && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
            <div>
              <div style={{ fontSize: 30, marginBottom: 8 }}>🌍</div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'var(--muted)' }}>Your journeys will appear here</div>
            </div>
          </div>
        )}
      </div>

      {pins.length > 0 && (
        <div style={{ display: 'flex', gap: 20, marginTop: 12, justifyContent: 'center', fontSize: 11, color: 'var(--muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--gold)', display: 'inline-block' }} /> Traveled</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--teal)', display: 'inline-block' }} /> Upcoming</span>
        </div>
      )}
    </div>
  )
}
