import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { full_name, email, tier = 'Silver', phone = '', notes = '' } = await req.json()
    const supabase = await createClient()
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      data: { full_name, role: 'client', tier, phone, notes }
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    await supabase.from('profiles').upsert({
      id: data.user.id, email, full_name, role: 'client',
      tier, phone, notes, approved: true,
    }, { onConflict: 'id' })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}