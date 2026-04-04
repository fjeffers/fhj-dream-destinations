import { createClient } from '@/lib/supabase/server'
import IntakeManager from './IntakeManager'

export default async function IntakePage() {
  const supabase = await createClient()
  const { data: requests } = await supabase.from('intake_requests').select('*').order('created_at', { ascending: false })
  return <IntakeManager initialRequests={requests || []} />
}
