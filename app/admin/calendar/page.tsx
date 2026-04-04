import { createClient } from '@/lib/supabase/server'
import CalendarManager from './CalendarManager'

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: appointments } = await supabase.from('appointments').select('*').order('date')
  const { data: blocked } = await supabase.from('blocked_dates').select('*')
  return <CalendarManager initialAppointments={appointments || []} initialBlocked={blocked || []} />
}
