import { createClient } from '@/lib/supabase/server'
import DirectoryManager from './DirectoryManager'

export default async function DirectoryPage() {
  const supabase = await createClient()
  const { data: records } = await supabase
    .from('client_records')
    .select('*')
    .order('created_at', { ascending: false })
  return <DirectoryManager initialRecords={records || []} />
}
