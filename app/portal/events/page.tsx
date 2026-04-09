import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EventsClient from './EventsClient'

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?type=client')

  const { data: events } = await supabase
    .from('events')
    .select('*, event_rsvps(id, client_id)')
    .eq('active', true)
    .order('date')

  // FIX: attach event_id from parent when flattening so we can match RSVPs to events
  const myRsvps = (events || [])
    .flatMap(e => (e.event_rsvps || []).map((r: any) => ({ ...r, event_id: e.id })))
    .filter((r: any) => r.client_id === user.id)
    .map((r: any) => r.event_id as string)

  return (
    <EventsClient
      events={events || []}
      myRsvps={myRsvps}
      userId={user.id}
    />
  )
}
