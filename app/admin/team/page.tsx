import { createClient } from '@/lib/supabase/server'
import TeamManager from './TeamManager'

export default async function AdminTeamPage() {
  const supabase = await createClient()
  const { data: team } = await supabase
    .from('profiles')
    .select('*')
    .in('role', ['admin', 'manager', 'employee'])
    .order('created_at', { ascending: false })

  return <TeamManager initialTeam={team || []} />
}