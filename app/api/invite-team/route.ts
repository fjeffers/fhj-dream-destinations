import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { full_name, email, role = 'employee' } = await req.json()

    if (!full_name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error: SUPABASE_SERVICE_ROLE_KEY is not set. Please add it to your Vercel environment variables.' },
        { status: 500 }
      )
    }

    const tempPassword = 'Welcome@FHJ1!'

    // Create the auth user — flag must_change_password so login redirects them to set their own password
    const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name,
        role,
        must_change_password: true,   // ← forces password change on first login
      }
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 })
    }

    // Upsert profile row
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: data.user.id,
      email,
      full_name,
      role,
      approved: true,
    }, { onConflict: 'id' })

    if (profileError) {
      console.error('Profile upsert error (non-fatal):', profileError)
    }

    // Send email — non-fatal if Resend key is missing
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: 'FHJ Dream Destinations <info@fhjdreamdestinations.com>',
          to: email,
          subject: `You've been invited to FHJ Dream Destinations Admin`,
          html: `
            <div style="font-family: system-ui, sans-serif; background: #FDFAF3; padding: 0;">
              <div style="max-width: 560px; margin: auto; background: white; border: 1px solid rgba(196,154,10,0.2); overflow: hidden;">
                <div style="background: linear-gradient(135deg, #076060, #0E8F8F); padding: 32px 40px; text-align: center;">
                  <div style="font-family: Georgia, serif; font-size: 32px; color: #C49A0A; font-style: italic; margin-bottom: 4px;">FHJ</div>
                  <div style="font-size: 10px; letter-spacing: 5px; color: white; font-weight: 600;">DREAM DESTINATIONS</div>
                </div>
                <div style="padding: 40px;">
                  <p style="font-size: 16px; color: #2C2010;">Hi <strong>${full_name}</strong>,</p>
                  <p style="font-size: 15px; color: #5a4a3a; line-height: 1.7;">
                    You've been added to the FHJ Dream Destinations admin team as a <strong>${role}</strong>.
                    Use the credentials below to log in — you'll be asked to set your own password on first sign-in.
                  </p>
                  <div style="background: #F9F7F2; border: 1px solid rgba(196,154,10,0.25); border-left: 4px solid #C49A0A; padding: 20px 24px; margin: 24px 0; border-radius: 0 4px 4px 0;">
                    <p style="margin: 0 0 8px; font-size: 13px; font-weight: 700; letter-spacing: 1px; color: #8B6A00;">LOGIN DETAILS</p>
                    <p style="margin: 0 0 6px; font-size: 15px; color: #2C2010;"><strong>URL:</strong> <a href="https://fhj-dream-destinations.vercel.app/login?type=admin" style="color: #076060;">fhj-dream-destinations.vercel.app/login?type=admin</a></p>
                    <p style="margin: 0 0 6px; font-size: 15px; color: #2C2010;"><strong>Email:</strong> ${email}</p>
                    <p style="margin: 0; font-size: 15px; color: #2C2010;"><strong>Temp Password:</strong> <code style="background: #e8f4f4; padding: 2px 8px; border-radius: 3px; font-size: 14px;">${tempPassword}</code></p>
                  </div>
                  <p style="font-size: 14px; color: #8a7a6a; line-height: 1.6;">
                    ✅ You will be prompted to create your own password immediately after logging in.
                  </p>
                  <p style="font-size: 14px; color: #5a4a3a; margin-top: 24px;">
                    Questions? Reply to this email or reach us at
                    <a href="mailto:info@fhjdreamdestinations.com" style="color: #076060;">info@fhjdreamdestinations.com</a>.
                  </p>
                  <p style="font-size: 14px; color: #5a4a3a; margin-top: 16px;">Welcome to the team,<br /><strong>FHJ Dream Destinations</strong></p>
                </div>
              </div>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Email send failed (non-fatal):', emailError)
        return NextResponse.json({
          success: true,
          emailWarning: 'User created but invite email could not be sent. Please share login details manually.'
        })
      }
    } else {
      console.warn('RESEND_API_KEY not set — skipping invite email.')
      return NextResponse.json({
        success: true,
        emailWarning: `RESEND_API_KEY not configured. User created. Share credentials manually: ${email} / ${tempPassword}`
      })
    }

    return NextResponse.json({ success: true })
  } catch (e: any) {
    console.error('invite-team error:', e)
    return NextResponse.json({ error: e.message || 'An unexpected error occurred.' }, { status: 500 })
  }
}
