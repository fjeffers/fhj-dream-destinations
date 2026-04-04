import { createClient } from '@/lib/supabase/server'
import AdminMessagesClient from './AdminMessagesClient'

export default async function AdminMessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: clients } = await supabase.from('profiles').select('id, full_name, email').eq('role', 'client').eq('approved', true)
  const { data: messages } = await supabase
    .from('messages')
    .select('*, sender:profiles!messages_sender_id_fkey(id, full_name, email, role), recipient:profiles!messages_recipient_id_fkey(id, full_name, email, role)')
    .order('created_at', { ascending: true })
  return <AdminMessagesClient messages={messages || []} clients={clients || []} adminId={user!.id} />
}
