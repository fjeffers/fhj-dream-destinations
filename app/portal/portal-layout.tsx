import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PortalShell from './PortalShell'
import type { Profile } from '@/lib/types'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?type=client')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.approved) {
    redirect('/login?type=client')
  }

  // If admin tries to access portal, send to admin
  if (profile.role === 'admin') {
    redirect('/admin')
  }

  return <PortalShell profile={profile as Profile}>{children}</PortalShell>
}
