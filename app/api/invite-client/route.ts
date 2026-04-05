import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { full_name, email, tier = 'Silver', phone = '', notes = '' } = await req.json()
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: { full_name, role: 'client', tier, phone, notes }
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    await supabaseAdmin.from('profiles').upsert({
      id: data.user.id, email, full_name, role: 'client',
      tier, phone, notes, approved: true,
    }, { onConflict: 'id' })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}