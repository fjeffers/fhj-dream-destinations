import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { full_name, email, role = 'employee' } = await req.json()

    const tempPassword = 'Welcome@FHJ1!'

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name, role }
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    await supabaseAdmin.from('profiles').upsert({
      id: data.user.id,
      email,
      full_name,
      role,
      approved: true,
    }, { onConflict: 'id' })

    await resend.emails.send({
      from: 'FHJ Dream Destinations <onboarding@resend.dev>',
      to: email,
      subject: `Welcome to FHJ Dream Destinations, ${full_name}!`,
      html: `
        <div style="font-family: system-ui, sans-serif; font-size: 16px; background-color: #fff8f1">
          <div style="max-width: 600px; margin: auto; padding: 16px">
            <h2 style="color: #2c3e50;">Welcome to FHJ Dream Destinations</h2>
            <p>Hi <strong>${full_name}</strong>,</p>
            <p>Your account has been successfully created. Use the details below to log in:</p>
            <div style="background-color: #f0f4ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <p><strong>Login URL:</strong> <a href="https://fhjdreamdestinations.com/login?type=admin">Click here to log in</a></p>
              <p><strong>Temporary Password:</strong> ${tempPassword}</p>
            </div>
            <p>Please change your password after your first login.</p>
            <p>If you have any questions, reach us at <a href="mailto:info@fhjdreamdestinations.com">info@fhjdreamdestinations.com</a>.</p>
            <p>Best regards,<br />The FHJ Dream Destinations Team</p>
          </div>
        </div>
      `
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}