import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const referer = request.headers.get('referer') || ''
  await supabase.auth.signOut()
  const origin = new URL(request.url).origin
  if (referer.includes('/admin')) {
    return NextResponse.redirect(`${origin}/login?type=admin`)
  }
  return NextResponse.redirect(`${origin}/login?type=client`)
}