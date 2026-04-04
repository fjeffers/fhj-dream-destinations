import { createClient } from '@/lib/supabase/server'
import EventsManager from './EventsManager'

export default async function AdminEventsPage() {
  const supabase = await createClient()
  const { data: events } = await supabase.from('events').select('*, event_rsvps(id, client_id, profiles(full_name, email))').order('date')
  return <EventsManager initialEvents={events || []} />
}
