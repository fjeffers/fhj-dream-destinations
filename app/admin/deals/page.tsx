import { createClient } from '@/lib/supabase/server'
import DealsManager from './DealsManager'

export default async function DealsPage() {
  const supabase = await createClient()
  const { data: deals } = await supabase.from('deals').select('*').order('created_at', { ascending: false })
  return <DealsManager initialDeals={deals || []} />
}
