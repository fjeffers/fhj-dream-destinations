import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminShell from './AdminShell'

const ADMIN_ROLES = ['admin', 'manager', 'employee']

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?type=admin')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  if (!profile || !ADMIN_ROLES.includes(profile.role)) {
    redirect('/login?type=admin')
  }

  return <AdminShell profile={profile}>{children}</AdminShell>
}
