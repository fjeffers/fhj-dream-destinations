// Trip journey stages, derived from a booking's status.
export const TRIP_STAGES = ['Inquiry', 'Deposit Paid', 'Confirmed', 'Ready to Travel', 'Traveling', 'Memories'] as const

// Map the raw booking.status to a stage index on the journey timeline.
export function stageIndex(status: string | null | undefined, travelDate?: string | null, returnDate?: string | null): number {
  const s = (status || '').toLowerCase()
  if (s === 'cancelled') return -1
  const now = new Date()
  const start = travelDate ? new Date(travelDate) : null
  const end = returnDate ? new Date(returnDate) : start

  if (s === 'completed') return 5
  if (start && end) {
    if (now > end) return 5                    // trip is over → Memories
    if (now >= start && now <= end) return 4   // currently traveling
  }
  if (s === 'confirmed') {
    // Confirmed and within 30 days → Ready to Travel
    if (start) {
      const days = (start.getTime() - now.getTime()) / 86400000
      if (days <= 30) return 3
    }
    return 2
  }
  if (s === 'deposit paid') return 1
  return 0 // Pending / Inquiry
}

export function daysUntil(dateStr?: string | null): number | null {
  if (!dateStr) return null
  const target = new Date(dateStr + 'T00:00:00')
  const now = new Date()
  const diff = Math.ceil((target.getTime() - now.getTime()) / 86400000)
  return diff
}

export function nights(travelDate?: string | null, returnDate?: string | null): number | null {
  if (!travelDate || !returnDate) return null
  const a = new Date(travelDate), b = new Date(returnDate)
  const n = Math.round((b.getTime() - a.getTime()) / 86400000)
  return n > 0 ? n : null
}
