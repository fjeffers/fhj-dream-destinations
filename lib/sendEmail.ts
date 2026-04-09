// ── FHJ Email Notification Utility ─────────────────────────────
// All emails go through /api/send-email which uses Resend server-side.
// These helpers are called from client components (book, book-appointment pages).

async function callEmailAPI(type: string, data: Record<string, any>) {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data }),
    })
    if (!res.ok) {
      const err = await res.json()
      console.warn('Email API error (non-critical):', err)
    }
  } catch (e) {
    // Non-critical — log but never block the user flow
    console.warn('Email send failed (non-critical):', e)
  }
}

// ── Appointment booked — notify admin + confirm to client ─────
export async function notifyAppointmentBooked(data: {
  name: string
  email: string
  phone?: string
  date: string
  time: string
  type: string
  notes?: string
}) {
  // Notify admin
  await callEmailAPI('appointment-request-admin', data)
  // Confirm to client
  await callEmailAPI('appointment-request-client', data)
}

// ── Intake form submitted — notify admin + confirm to client ──
export async function notifyIntakeSubmitted(data: {
  first_name: string
  last_name: string
  email: string
  phone?: string
  destination?: string
  travel_dates?: string
  group_size?: string
  budget?: string
  special_occasion?: string
  notes?: string
}) {
  await callEmailAPI('intake-submitted-admin', data)
  await callEmailAPI('intake-submitted-client', data)
}

// ── Generic client confirmation (kept for backwards compatibility) ──
export async function sendClientConfirmation(data: {
  to_email: string
  to_name: string
  subject: string
  message: string
}) {
  // No-op: both admin + client emails are now sent automatically
  // from notifyAppointmentBooked / notifyIntakeSubmitted above.
  // This stub is kept so existing call sites don't break.
}
