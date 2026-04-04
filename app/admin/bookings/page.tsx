import { createClient } from '@/lib/supabase/server'
import BookingsManager from './BookingsManager'

export default async function BookingsPage() {
  const supabase = await createClient()
  const { data: bookings } = await supabase.from('bookings').select('*, profiles(full_name, email, tier)').order('created_at', { ascending: false })
  return <BookingsManager initialBookings={bookings || []} />
}
