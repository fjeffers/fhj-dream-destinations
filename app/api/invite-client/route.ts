import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { full_name, email, tier = 'Silver', phone = '', notes = '' } = await req.json()

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY is not set.' }, { status: 500 })
    }

    const tempPassword = 'Welcome@FHJ1!'

    // Create auth user — must_change_password forces them to set their own password
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name,
        role: 'client',
        tier,
        phone,
        notes,
        must_change_password: true,    // ← forces password change on first login
      }
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    await supabaseAdmin.from('profiles').upsert({
      id: data.user.id,
      email,
      full_name,
      role: 'client',
      tier,
      phone,
      notes,
      approved: true,
    }, { onConflict: 'id' })

    // Send branded welcome email
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: 'FHJ Dream Destinations <info@fhjdreamdestinations.com>',
          to: email,
          subject: `Welcome to FHJ Dream Destinations, ${full_name}!`,
          html: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Welcome to FHJ Dream Destinations</title></head>
<body style="margin:0;padding:0;background:#F9F7F2;font-family:Georgia,serif;">
<div style="max-width:580px;margin:32px auto;background:white;border:1px solid rgba(196,154,10,0.2);overflow:hidden;">
  <div style="background:linear-gradient(135deg,#076060,#3A7D7D);padding:32px 40px;text-align:center;">
    <div style="font-family:Georgia,serif;font-size:36px;color:#E8C87A;font-style:italic;line-height:1;margin-bottom:4px;">FHJ</div>
    <div style="font-size:9px;letter-spacing:6px;color:rgba(255,255,255,0.8);font-family:Arial,sans-serif;font-weight:600;">DREAM DESTINATIONS</div>
  </div>
  <div style="padding:40px;">
    <h2 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#2E2318;margin:0 0 6px;">Welcome, ${full_name}!</h2>
    <p style="font-family:Arial,sans-serif;font-size:15px;color:#5a4a3a;line-height:1.7;margin:0 0 24px;">
      You've been added to the FHJ Dream Destinations Client Portal. Your personal travel dashboard is ready — use the details below to sign in for the first time.
    </p>
    <div style="background:#F9F7F2;border:1px solid rgba(196,154,10,0.25);border-left:4px solid #C49A45;padding:20px 24px;margin-bottom:24px;">
      <div style="font-family:Arial,sans-serif;font-size:10px;letter-spacing:3px;color:#8B6A00;font-weight:600;margin-bottom:12px;">YOUR LOGIN DETAILS</div>
      <p style="margin:0 0 6px;font-size:14px;color:#2E2318;font-family:Arial,sans-serif;"><strong>Portal:</strong> <a href="https://fhj-dream-destinations.vercel.app/login" style="color:#3A7D7D;">fhj-dream-destinations.vercel.app/login</a></p>
      <p style="margin:0 0 6px;font-size:14px;color:#2E2318;font-family:Arial,sans-serif;"><strong>Email:</strong> ${email}</p>
      <p style="margin:0;font-size:14px;color:#2E2318;font-family:Arial,sans-serif;"><strong>Temp Password:</strong> <code style="background:#e8f4f4;padding:2px 8px;border-radius:3px;font-size:13px;">${tempPassword}</code></p>
    </div>
    <div style="background:rgba(14,143,143,0.06);border:1px solid rgba(14,143,143,0.2);border-radius:4px;padding:14px 18px;margin-bottom:28px;">
      <p style="font-family:Arial,sans-serif;font-size:13px;color:#5a4a3a;margin:0;line-height:1.6;">
        ✅ You will be asked to <strong>create your own password</strong> on your first sign-in. Keep it safe!
      </p>
    </div>
    <p style="font-family:Georgia,serif;font-size:15px;color:#5a4a3a;font-style:italic;line-height:1.7;margin:0 0 28px;">
      Your portal gives you access to your trip bookings, upcoming appointments, exclusive events, and a direct line to your travel advisor.
    </p>
    <a href="https://fhj-dream-destinations.vercel.app/login" style="display:inline-block;background:linear-gradient(135deg,#076060,#3A7D7D);color:white;padding:14px 40px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;text-decoration:none;border-radius:4px;font-weight:600;">ACCESS MY PORTAL →</a>
    <p style="font-family:Georgia,serif;font-size:15px;color:#5a4a3a;font-style:italic;margin:32px 0 0;">Welcome to the FHJ family,<br>
    <strong style="font-style:normal;font-family:Arial,sans-serif;font-size:12px;letter-spacing:2px;color:#3A7D7D;">FHJ DREAM DESTINATIONS</strong></p>
    <div style="margin-top:32px;padding-top:24px;border-top:1px solid rgba(196,154,10,0.15);text-align:center;">
      <div style="font-family:Arial,sans-serif;font-size:11px;color:rgba(46,35,24,0.45);letter-spacing:3px;margin-bottom:8px;">CURATED JOURNEYS · CRAFTED WITH INTENTION</div>
      <div style="font-family:Arial,sans-serif;font-size:12px;color:rgba(46,35,24,0.5);">
        <a href="mailto:info@fhjdreamdestinations.com" style="color:#3A7D7D;text-decoration:none;">info@fhjdreamdestinations.com</a>
        &nbsp;·&nbsp; 484-541-3573
      </div>
    </div>
  </div>
</div>
</body></html>`
        })
      } catch (emailErr) {
        console.error('Email send failed (non-fatal):', emailErr)
        return NextResponse.json({ success: true, emailWarning: 'Client created but welcome email could not be sent. Share login details manually.' })
      }
    } else {
      return NextResponse.json({ success: true, emailWarning: `RESEND_API_KEY not configured. Share credentials manually: ${email} / ${tempPassword}` })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
