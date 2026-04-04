import { createClient } from '@/lib/supabase/server'
import GroupTripsManager from './GroupTripsManager'

export default async function GroupTripsPage() {
  const supabase = await createClient()
  const { data: trips } = await supabase.from('group_trips').select('*').order('date')
  return <GroupTripsManager initialTrips={trips || []} />
}
