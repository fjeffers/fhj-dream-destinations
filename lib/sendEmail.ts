// ── FHJ Email Notification Utility ──────────────────────────
// Uses EmailJS to send notifications to info@fhjdreamdestinations.com
// Service: service_5eyyayc | Public Key: Ea5qbri-eVFF-RKFI

const EMAILJS_SERVICE  = 'service_5eyyayc'
const EMAILJS_TEMPLATE = 'template_0ai8is3'
const EMAILJS_KEY      = 'Ea5qbri-eVFF-RKFI'
const NOTIFY_EMAIL     = 'info@fhjdreamdestinations.com'

function loadEmailJS(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('Server side'))
    if ((window as any).emailjs) {
      ;(window as any).emailjs.init(EMAILJS_KEY)
      return resolve((window as any).emailjs)
    }
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js'
    script.onload = () => {
      ;(window as any).emailjs.init(EMAILJS_KEY)
      resolve((window as any).emailjs)
    }
    script.onerror = () => reject(new Error('Failed to load EmailJS'))
    document.head.appendChild(script)
  })
}

// ── Send appointment booking notification ────────────────────
export async function notifyAppointmentBooked(data: {
  name: string
  email: string
  phone?: string
  date: string
  time: string
  type: string
  notes?: string
}) {
  try {
    const ejs = await loadEmailJS()
    await ejs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
      to_email: NOTIFY_EMAIL,
      to_name: 'FHJ Dream Destinations Team',
      from_name: data.name,
      reply_to: data.email,
      booking_link: `${window.location.origin}/admin/appointments`,
      subject: `New Appointment Request — ${data.name}`,
      message: `
NEW APPOINTMENT REQUEST

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Type: ${data.type}
Date: ${data.date}
Time: ${data.time}
Notes: ${data.notes || 'None'}

View in admin: ${window.location.origin}/admin/appointments
      `.trim()
    })
    console.log('Appointment notification sent')
  } catch (err) {
    console.warn('Email notification failed (non-critical):', err)
  }
}

// ── Send intake form notification ────────────────────────────
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
  try {
    const ejs = await loadEmailJS()
    await ejs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
      to_email: NOTIFY_EMAIL,
      to_name: 'FHJ Dream Destinations Team',
      from_name: `${data.first_name} ${data.last_name}`,
      reply_to: data.email,
      booking_link: `${window.location.origin}/admin/intake`,
      subject: `New Intake Request — ${data.first_name} ${data.last_name}`,
      message: `
NEW INTAKE FORM SUBMISSION

Name: ${data.first_name} ${data.last_name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Occasion: ${data.special_occasion || 'Not specified'}
Destination: ${data.destination || 'Not specified'}
Travel Dates: ${data.travel_dates || 'Not specified'}
Group Size: ${data.group_size || 'Not specified'}
Budget: ${data.budget || 'Not specified'}

Notes / Questionnaire:
${data.notes || 'None'}

View in admin: ${window.location.origin}/admin/intake
      `.trim()
    })
    console.log('Intake notification sent')
  } catch (err) {
    console.warn('Email notification failed (non-critical):', err)
  }
}

// ── Send client confirmation email ───────────────────────────
export async function sendClientConfirmation(data: {
  to_email: string
  to_name: string
  subject: string
  message: string
}) {
  try {
    const ejs = await loadEmailJS()
    await ejs.send(EMAILJS_SERVICE, EMAILJS_TEMPLATE, {
      to_email: data.to_email,
      to_name: data.to_name,
      from_name: 'FHJ Dream Destinations',
      reply_to: NOTIFY_EMAIL,
      booking_link: `${window.location.origin}/book-appointment`,
      subject: data.subject,
      message: data.message
    })
    console.log('Client confirmation sent')
  } catch (err) {
    console.warn('Client email failed (non-critical):', err)
  }
}
