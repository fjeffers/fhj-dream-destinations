import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const ADMIN_ROLES = ['admin', 'manager', 'employee']

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const nextParam = searchParams.get('next')
  // Only allow same-site relative paths as a redirect target.
  const next = nextParam && nextParam.startsWith('/') ? nextParam : null

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  } else if (token_hash && type) {
    await supabase.auth.verifyOtp({ token_hash, type: type as any })
  }

  // Check role and redirect accordingly
  // FIX: manager and employee roles also belong in /admin, not /portal
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    // Explicit destination (e.g. password reset → /update-password) wins.
    if (next) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role && ADMIN_ROLES.includes(profile.role)) {
      return NextResponse.redirect(`${origin}/admin`)
    }
    return NextResponse.redirect(`${origin}/portal`)
  }

  return NextResponse.redirect(`${origin}${next ?? '/login?type=admin'}`)
}
