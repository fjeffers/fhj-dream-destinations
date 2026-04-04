import { createClient } from '@/lib/supabase/server'
import ClientsManager from './ClientsManager'

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: clients } = await supabase.from('profiles').select('*').eq('role', 'client').order('created_at', { ascending: false })
  return <ClientsManager initialClients={clients || []} />
}
