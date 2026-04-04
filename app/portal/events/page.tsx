import { createClient } from '@/lib/supabase/server'
import EventsClient from './EventsClient'

export default async function EventsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: events } = await supabase.from('events').select('*, event_rsvps(id, client_id)').eq('active', true).order('date')
  const myRsvps = events?.flatMap(e => e.event_rsvps).filter((r: any) => r.client_id === user!.id).map((r: any) => r.event_id) || []

  return <EventsClient events={events || []} myRsvps={myRsvps} userId={user!.id} />
}
