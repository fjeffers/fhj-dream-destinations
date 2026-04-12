import { createClient } from '@/lib/supabase/server'
import PartnersManager from './PartnersManager'

export default async function AdminPartnersPage() {
  const supabase = await createClient()
  const { data: partners } = await supabase
    .from('partners')
    .select('*')
    .order('created_at', { ascending: false })

  return <PartnersManager initialPartners={partners || []} />
}
