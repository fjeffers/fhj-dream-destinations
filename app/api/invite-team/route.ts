import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_id: 'service_5eyyayc',
        template_id: 'template_0ai8is3',
        user_id: 'Ea5qbri-eVFF-RKFI',
        template_params: {
          to_email: email,
          to_name: full_name,
          temp_password: tempPassword,
          login_url: 'https://fhjdreamdestinations.com/login?type=admin',
        }
      })
    })

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}