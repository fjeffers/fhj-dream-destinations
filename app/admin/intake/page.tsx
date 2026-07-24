import { createClient } from '@/lib/supabase/server'
import IntakeManager from './IntakeManager'

export default async function IntakePage() {
  const supabase = await createClient()
  const [{ data: requests }, { data: profiles }] = await Promise.all([
    supabase.from('intake_requests').select('*').order('created_at', { ascending: false }),
    // Emails that already have a portal account — used to flag requests marked
    // Approved whose client account never actually got created.
    supabase.from('profiles').select('email'),
  ])
  return (
    <IntakeManager
      initialRequests={requests || []}
      clientEmails={(profiles || []).map((p: { email: string | null }) => (p.email || '').toLowerCase())}
    />
  )
}
