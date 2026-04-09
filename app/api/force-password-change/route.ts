import { NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    // Verify the caller is an admin
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: callerProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (callerProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Only owners can force password resets.' }, { status: 403 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY not configured.' }, { status: 500 })
    }

    const { userId } = await req.json()

    if (userId === 'all') {
      // Get all manager + employee profiles
      const { data: teamProfiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, role')
        .in('role', ['manager', 'employee'])

      if (profilesError) {
        return NextResponse.json({ error: profilesError.message }, { status: 500 })
      }

      if (!teamProfiles || teamProfiles.length === 0) {
        return NextResponse.json({ success: true, updated: 0, message: 'No managers or employees found.' })
      }

      // Update each user's metadata
      const results = await Promise.allSettled(
        teamProfiles.map(p =>
          supabaseAdmin.auth.admin.updateUserById(p.id, {
            user_metadata: { must_change_password: true }
          })
        )
      )

      const succeeded = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      return NextResponse.json({
        success: true,
        updated: succeeded,
        failed,
        message: `${succeeded} team member${succeeded !== 1 ? 's' : ''} will be prompted to change password on next login.${failed > 0 ? ` (${failed} failed)` : ''}`
      })

    } else {
      // Single user
      if (!userId) return NextResponse.json({ error: 'userId is required.' }, { status: 400 })

      const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: { must_change_password: true }
      })

      if (error) return NextResponse.json({ error: error.message }, { status: 400 })

      return NextResponse.json({ success: true, message: 'User will be prompted to change password on next login.' })
    }

  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
