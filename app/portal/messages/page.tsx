import { createClient } from '@/lib/supabase/server'
import MessagesClient from './MessagesClient'

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single()
  const { data: messages } = await supabase
    .from('messages')
    .select('*, sender:profiles!messages_sender_id_fkey(full_name, role), recipient:profiles!messages_recipient_id_fkey(full_name, role)')
    .or(`sender_id.eq.${user!.id},recipient_id.eq.${user!.id}`)
    .order('created_at', { ascending: true })

  return <MessagesClient messages={messages || []} profile={profile} userId={user!.id} />
}
