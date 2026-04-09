import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM    = 'FHJ Dream Destinations <info@fhjdreamdestinations.com>'
const ADMIN   = 'info@fhjdreamdestinations.com'
const SITE    = 'https://fhj-dream-destinations.vercel.app'

// ── Shared branded email wrapper ─────────────────────────────
function wrap(preheader: string, body: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>FHJ Dream Destinations</title></head>
<body style="margin:0;padding:0;background:#F9F7F2;font-family:Georgia,serif;">
<div style="max-width:580px;margin:32px auto;background:white;border:1px solid rgba(196,154,10,0.2);overflow:hidden;">
  <div style="background:linear-gradient(135deg,#076060,#3A7D7D);padding:32px 40px;text-align:center;">
    <div style="font-family:Georgia,serif;font-size:36px;color:#E8C87A;font-style:italic;line-height:1;margin-bottom:4px;">FHJ</div>
    <div style="font-size:9px;letter-spacing:6px;color:rgba(255,255,255,0.8);font-family:Arial,sans-serif;font-weight:600;">DREAM DESTINATIONS</div>
    <div style="height:1px;background:rgba(232,200,122,0.35);margin:16px auto 0;max-width:120px;"></div>
  </div>
  <div style="padding:40px;">
    <span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>
    ${body}
    <div style="margin-top:40px;padding-top:24px;border-top:1px solid rgba(196,154,10,0.15);text-align:center;">
      <div style="font-family:Arial,sans-serif;font-size:11px;color:rgba(46,35,24,0.45);letter-spacing:3px;margin-bottom:8px;">CURATED JOURNEYS · CRAFTED WITH INTENTION</div>
      <div style="font-family:Arial,sans-serif;font-size:12px;color:rgba(46,35,24,0.5);">
        <a href="mailto:${ADMIN}" style="color:#3A7D7D;text-decoration:none;">${ADMIN}</a>
        &nbsp;·&nbsp; 484-541-3573 &nbsp;·&nbsp; Tri-State Area
      </div>
    </div>
  </div>
</div>
</body></html>`
}

function row(label: string, value: string) {
  return `<tr><td style="padding:6px 0;color:#8A7A6A;font-size:12px;letter-spacing:1px;font-family:Arial,sans-serif;width:130px;vertical-align:top;">${label.toUpperCase()}</td><td style="padding:6px 0 6px 12px;color:#2E2318;font-size:14px;vertical-align:top;">${value}</td></tr>`
}

function templates(type: string, d: any) {
  switch (type) {

    // ── Admin: New appointment request ───────────────────────
    case 'appointment-request-admin':
      return {
        to: ADMIN,
        subject: `📅 New Appointment Request — ${d.name}`,
        html: wrap(`New appointment from ${d.name} for ${d.date} at ${d.time}`, `
          <h2 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#2E2318;margin:0 0 6px;">New Appointment Request</h2>
          <p style="font-family:Arial,sans-serif;font-size:14px;color:#8A7A6A;margin:0 0 28px;">A client has requested a consultation.</p>
          <div style="background:#F9F7F2;border:1px solid rgba(196,154,10,0.2);border-left:4px solid #3A7D7D;padding:20px 24px;margin-bottom:28px;">
            <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
              ${row('Name', d.name)}
              ${row('Email', `<a href="mailto:${d.email}" style="color:#3A7D7D;">${d.email}</a>`)}
              ${row('Phone', d.phone || 'Not provided')}
              ${row('Type', d.type)}
              ${row('Date', d.date)}
              ${row('Time', d.time)}
              ${d.notes ? row('Notes', d.notes) : ''}
            </table>
          </div>
          <a href="${SITE}/admin/appointments" style="display:inline-block;background:linear-gradient(135deg,#076060,#3A7D7D);color:white;padding:14px 36px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;text-decoration:none;border-radius:4px;font-weight:600;">VIEW IN ADMIN →</a>
        `)
      }

    // ── Client: Appointment received ─────────────────────────
    case 'appointment-request-client':
      return {
        to: d.email,
        subject: `Your Appointment Request — FHJ Dream Destinations`,
        html: wrap(`We received your appointment request for ${d.date} at ${d.time}`, `
          <h2 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#2E2318;margin:0 0 6px;">We Received Your Request, ${d.name.split(' ')[0]}!</h2>
          <p style="font-family:Arial,sans-serif;font-size:15px;color:#5a4a3a;line-height:1.7;margin:0 0 24px;">Thank you for reaching out to FHJ Dream Destinations. We're excited to connect with you and will confirm your appointment within <strong>2 hours</strong> during business hours.</p>
          <div style="background:#F9F7F2;border:1px solid rgba(196,154,10,0.2);border-left:4px solid #C49A45;padding:20px 24px;margin-bottom:28px;">
            <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:3px;color:#8B6A00;font-weight:600;margin-bottom:12px;">YOUR REQUEST DETAILS</div>
            <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
              ${row('Type', d.type)}
              ${row('Requested Date', d.date)}
              ${row('Requested Time', d.time)}
              ${d.notes ? row('Notes', d.notes) : ''}
            </table>
          </div>
          <p style="font-family:Arial,sans-serif;font-size:14px;color:#8A7A6A;line-height:1.7;margin:0 0 8px;">Questions? Reply to this email or call us at <a href="tel:4845413573" style="color:#3A7D7D;">484-541-3573</a>.</p>
          <p style="font-family:Georgia,serif;font-size:16px;color:#5a4a3a;font-style:italic;margin:24px 0 0;">Looking forward to crafting your perfect journey,<br><strong style="font-style:normal;font-family:Arial,sans-serif;font-size:12px;letter-spacing:2px;color:#3A7D7D;">FHJ DREAM DESTINATIONS</strong></p>
        `)
      }

    // ── Client: Appointment CONFIRMED ────────────────────────
    case 'appointment-confirmed':
      return {
        to: d.email,
        subject: `✅ Appointment Confirmed — ${d.date} at ${d.time}`,
        html: wrap(`Your appointment is confirmed for ${d.date} at ${d.time}!`, `
          <div style="text-align:center;margin-bottom:32px;">
            <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#1A7A4A,#27AE60);display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:16px;">✓</div>
            <h2 style="font-family:Georgia,serif;font-size:28px;font-weight:400;color:#2E2318;margin:0 0 8px;">You're Confirmed, ${d.name.split(' ')[0]}!</h2>
            <p style="font-family:Arial,sans-serif;font-size:15px;color:#5a4a3a;line-height:1.7;max-width:420px;margin:0 auto;">Your appointment with FHJ Dream Destinations has been <strong style="color:#1A7A4A;">confirmed</strong>. We look forward to speaking with you!</p>
          </div>
          <div style="background:linear-gradient(135deg,#F9F7F2,#F0EAD8);border:1px solid rgba(196,154,10,0.25);border-left:4px solid #C49A45;padding:24px;margin-bottom:28px;">
            <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:3px;color:#8B6A00;font-weight:600;margin-bottom:14px;">APPOINTMENT DETAILS</div>
            <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
              ${row('Date', `<strong>${d.date}</strong>`)}
              ${row('Time', `<strong>${d.time}</strong>`)}
              ${row('Type', d.type)}
              ${d.notes ? row('Notes', d.notes) : ''}
            </table>
          </div>
          <div style="background:rgba(14,143,143,0.06);border:1px solid rgba(14,143,143,0.2);border-radius:4px;padding:16px 20px;margin-bottom:28px;">
            <p style="font-family:Arial,sans-serif;font-size:13px;color:#5a4a3a;margin:0;line-height:1.7;">
              📞 Need to reschedule? Call us at <a href="tel:4845413573" style="color:#3A7D7D;font-weight:600;">484-541-3573</a> or reply to this email and we'll be happy to help.
            </p>
          </div>
          <p style="font-family:Georgia,serif;font-size:16px;color:#5a4a3a;font-style:italic;margin:0;">See you soon,<br><strong style="font-style:normal;font-family:Arial,sans-serif;font-size:12px;letter-spacing:2px;color:#3A7D7D;">FHJ DREAM DESTINATIONS</strong></p>
        `)
      }

    // ── Client: Appointment CANCELLED ────────────────────────
    case 'appointment-cancelled':
      return {
        to: d.email,
        subject: `Your Appointment Has Been Cancelled — FHJ Dream Destinations`,
        html: wrap(`Your appointment scheduled for ${d.date} at ${d.time} has been cancelled`, `
          <h2 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#2E2318;margin:0 0 6px;">Appointment Cancelled</h2>
          <p style="font-family:Arial,sans-serif;font-size:15px;color:#5a4a3a;line-height:1.7;margin:0 0 24px;">Hi ${d.name.split(' ')[0]}, your appointment scheduled for <strong>${d.date} at ${d.time}</strong> has been cancelled.</p>
          <div style="background:#F9F7F2;border:1px solid rgba(196,154,10,0.2);border-left:4px solid var(--danger,#C0392B);padding:20px 24px;margin-bottom:28px;">
            <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
              ${row('Date', d.date)}
              ${row('Time', d.time)}
              ${row('Type', d.type)}
              ${d.notes ? row('Note', d.notes) : ''}
            </table>
          </div>
          <p style="font-family:Arial,sans-serif;font-size:15px;color:#5a4a3a;line-height:1.7;margin:0 0 24px;">We'd love to find a time that works better for you. Please reach out to reschedule at your convenience.</p>
          <a href="${SITE}/book-appointment" style="display:inline-block;background:linear-gradient(135deg,#076060,#3A7D7D);color:white;padding:14px 36px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;text-decoration:none;border-radius:4px;font-weight:600;margin-bottom:28px;">BOOK A NEW APPOINTMENT →</a>
          <p style="font-family:Arial,sans-serif;font-size:14px;color:#8A7A6A;line-height:1.7;">Questions? Call us at <a href="tel:4845413573" style="color:#3A7D7D;">484-541-3573</a> or email <a href="mailto:${ADMIN}" style="color:#3A7D7D;">${ADMIN}</a>.</p>
          <p style="font-family:Georgia,serif;font-size:15px;color:#5a4a3a;font-style:italic;margin:24px 0 0;">Warm regards,<br><strong style="font-style:normal;font-family:Arial,sans-serif;font-size:12px;letter-spacing:2px;color:#3A7D7D;">FHJ DREAM DESTINATIONS</strong></p>
        `)
      }

    // ── Client: Appointment UPDATED (date/time/details changed) ──
    case 'appointment-updated':
      return {
        to: d.email,
        subject: `📅 Appointment Updated — ${d.date} at ${d.time}`,
        html: wrap(`Your appointment details have been updated`, `
          <h2 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#2E2318;margin:0 0 6px;">Your Appointment Has Been Updated</h2>
          <p style="font-family:Arial,sans-serif;font-size:15px;color:#5a4a3a;line-height:1.7;margin:0 0 24px;">Hi ${d.name.split(' ')[0]}, we've updated the details for your upcoming appointment. Here's everything you need to know:</p>
          <div style="background:linear-gradient(135deg,#F9F7F2,#F0EAD8);border:1px solid rgba(196,154,10,0.25);border-left:4px solid #C49A45;padding:24px;margin-bottom:28px;">
            <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:3px;color:#8B6A00;font-weight:600;margin-bottom:14px;">UPDATED DETAILS</div>
            <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
              ${row('Date', `<strong>${d.date}</strong>`)}
              ${row('Time', `<strong>${d.time}</strong>`)}
              ${row('Type', d.type)}
              ${row('Status', `<span style="color:${d.status === 'Confirmed' ? '#1A7A4A' : d.status === 'Cancelled' ? '#C0392B' : '#C49A45'};font-weight:600;">${d.status}</span>`)}
              ${d.notes ? row('Notes', d.notes) : ''}
            </table>
          </div>
          <div style="background:rgba(14,143,143,0.06);border:1px solid rgba(14,143,143,0.2);border-radius:4px;padding:16px 20px;margin-bottom:28px;">
            <p style="font-family:Arial,sans-serif;font-size:13px;color:#5a4a3a;margin:0;line-height:1.7;">
              Need to make changes? Call us at <a href="tel:4845413573" style="color:#3A7D7D;font-weight:600;">484-541-3573</a> or reply to this email.
            </p>
          </div>
          <p style="font-family:Georgia,serif;font-size:15px;color:#5a4a3a;font-style:italic;margin:0;">Talk soon,<br><strong style="font-style:normal;font-family:Arial,sans-serif;font-size:12px;letter-spacing:2px;color:#3A7D7D;">FHJ DREAM DESTINATIONS</strong></p>
        `)
      }

    // ── Admin: New intake form ────────────────────────────────
    case 'intake-submitted-admin':
      return {
        to: ADMIN,
        subject: `✈ New Travel Inquiry — ${d.first_name} ${d.last_name}`,
        html: wrap(`New inquiry from ${d.first_name} ${d.last_name}`, `
          <h2 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#2E2318;margin:0 0 6px;">New Travel Inquiry</h2>
          <p style="font-family:Arial,sans-serif;font-size:14px;color:#8A7A6A;margin:0 0 28px;">A potential client submitted an intake form.</p>
          <div style="background:#F9F7F2;border:1px solid rgba(196,154,10,0.2);border-left:4px solid #3A7D7D;padding:20px 24px;margin-bottom:28px;">
            <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
              ${row('Name', `${d.first_name} ${d.last_name}`)}
              ${row('Email', `<a href="mailto:${d.email}" style="color:#3A7D7D;">${d.email}</a>`)}
              ${row('Phone', d.phone || 'Not provided')}
              ${d.destination ? row('Destination', d.destination) : ''}
              ${d.travel_dates ? row('Travel Dates', d.travel_dates) : ''}
              ${d.group_size ? row('Group Size', d.group_size) : ''}
              ${d.budget ? row('Budget', d.budget) : ''}
              ${d.special_occasion ? row('Occasion', d.special_occasion) : ''}
              ${d.notes ? row('Notes', d.notes) : ''}
            </table>
          </div>
          <a href="${SITE}/admin/intake" style="display:inline-block;background:linear-gradient(135deg,#076060,#3A7D7D);color:white;padding:14px 36px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;text-decoration:none;border-radius:4px;font-weight:600;">REVIEW INQUIRY →</a>
        `)
      }

    // ── Client: Intake confirmation ───────────────────────────
    case 'intake-submitted-client':
      return {
        to: d.email,
        subject: `We Received Your Travel Inquiry — FHJ Dream Destinations`,
        html: wrap(`Thank you for your inquiry, ${d.first_name}!`, `
          <h2 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#2E2318;margin:0 0 6px;">Thank You, ${d.first_name}!</h2>
          <p style="font-family:Arial,sans-serif;font-size:15px;color:#5a4a3a;line-height:1.7;margin:0 0 24px;">Your travel inquiry has been received. Hortense and the FHJ team will personally review your request and reach out within <strong>24–48 hours</strong> to begin planning your dream journey.</p>
          <div style="background:linear-gradient(135deg,#F9F7F2,#F0EAD8);border:1px solid rgba(196,154,10,0.2);padding:24px;margin-bottom:28px;text-align:center;">
            <div style="font-family:Georgia,serif;font-size:18px;font-style:italic;color:#5a4a3a;line-height:1.7;">"Every extraordinary journey begins with a single conversation."</div>
            <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:3px;color:#3A7D7D;margin-top:12px;font-weight:600;">— HORTENSE JEFFERS, FOUNDER</div>
          </div>
          <p style="font-family:Arial,sans-serif;font-size:14px;color:#8A7A6A;line-height:1.7;">In the meantime, feel free to reach us at <a href="mailto:${ADMIN}" style="color:#3A7D7D;">${ADMIN}</a> or <a href="tel:4845413573" style="color:#3A7D7D;">484-541-3573</a>.</p>
          <p style="font-family:Georgia,serif;font-size:16px;color:#5a4a3a;font-style:italic;margin:24px 0 0;">Warm regards,<br><strong style="font-style:normal;font-family:Arial,sans-serif;font-size:12px;letter-spacing:2px;color:#3A7D7D;">FHJ DREAM DESTINATIONS</strong></p>
        `)
      }

    // ── Guest: RSVP confirmation ──────────────────────────────
    case 'rsvp-confirmation-guest':
      return {
        to: d.email,
        subject: `You're on the list! RSVP Confirmed — ${d.event_title}`,
        html: wrap(`Your RSVP for ${d.event_title} is confirmed!`, `
          <h2 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#2E2318;margin:0 0 6px;">You're Confirmed, ${d.name.split(' ')[0]}! 🎉</h2>
          <p style="font-family:Arial,sans-serif;font-size:15px;color:#5a4a3a;line-height:1.7;margin:0 0 24px;">Your RSVP for <strong>${d.event_title}</strong> has been received. We can't wait to celebrate with you!</p>
          <div style="background:#F9F7F2;border:1px solid rgba(196,154,10,0.2);border-left:4px solid #C49A45;padding:20px 24px;margin-bottom:28px;">
            <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:3px;color:#8B6A00;font-weight:600;margin-bottom:12px;">YOUR RSVP DETAILS</div>
            <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
              ${row('Event', d.event_title)}
              ${d.event_date ? row('Date', d.event_date) : ''}
              ${d.event_location ? row('Location', d.event_location) : ''}
              ${row('Party Size', `${d.party_size} ${d.party_size === 1 ? 'person' : 'people'}`)}
              ${d.dietary_needs ? row('Dietary Notes', d.dietary_needs) : ''}
            </table>
          </div>
          <p style="font-family:Arial,sans-serif;font-size:14px;color:#8A7A6A;line-height:1.7;">Questions? Contact us at <a href="mailto:${ADMIN}" style="color:#3A7D7D;">${ADMIN}</a> or <a href="tel:4845413573" style="color:#3A7D7D;">484-541-3573</a>.</p>
          <p style="font-family:Georgia,serif;font-size:16px;color:#5a4a3a;font-style:italic;margin:24px 0 0;">See you there!<br><strong style="font-style:normal;font-family:Arial,sans-serif;font-size:12px;letter-spacing:2px;color:#3A7D7D;">FHJ DREAM DESTINATIONS</strong></p>
        `)
      }

    // ── Admin: New RSVP notification ──────────────────────────
    case 'rsvp-notification-admin':
      return {
        to: ADMIN,
        subject: `🎉 New RSVP — ${d.name} for ${d.event_title}`,
        html: wrap(`${d.name} just RSVPd for ${d.event_title}`, `
          <h2 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#2E2318;margin:0 0 6px;">New RSVP Received</h2>
          <p style="font-family:Arial,sans-serif;font-size:14px;color:#8A7A6A;margin:0 0 28px;">Someone just RSVPd via the public link.</p>
          <div style="background:#F9F7F2;border:1px solid rgba(196,154,10,0.2);border-left:4px solid #3A7D7D;padding:20px 24px;margin-bottom:28px;">
            <table style="width:100%;border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">
              ${row('Event', d.event_title)}
              ${row('Guest', d.name)}
              ${row('Email', `<a href="mailto:${d.email}" style="color:#3A7D7D;">${d.email}</a>`)}
              ${d.phone ? row('Phone', d.phone) : ''}
              ${row('Party Size', `${d.party_size} ${d.party_size === 1 ? 'person' : 'people'}`)}
              ${d.dietary_needs ? row('Dietary Needs', d.dietary_needs) : ''}
              ${d.message ? row('Message', d.message) : ''}
            </table>
          </div>
          <a href="${SITE}/admin/events" style="display:inline-block;background:linear-gradient(135deg,#076060,#3A7D7D);color:white;padding:14px 36px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;text-decoration:none;border-radius:4px;font-weight:600;">VIEW ALL RSVPs →</a>
        `)
      }

    default:
      return null
  }
}

export async function POST(req: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not set — skipping email')
      return NextResponse.json({ success: true, warning: 'RESEND_API_KEY not configured' })
    }

    const { type, data } = await req.json()
    const template = templates(type, data)

    if (!template) {
      return NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 })
    }

    const { error } = await resend.emails.send({
      from: FROM,
      to: template.to,
      subject: template.subject,
      html: template.html,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('send-email route error:', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
