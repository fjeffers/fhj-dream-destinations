import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DocumentsClient from './DocumentsClient'

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?type=client')

  const { data: documents } = await supabase
    .from('documents')
    .select('id, name, category, storage_path, size_bytes, created_at')
    .eq('client_id', user.id)
    .order('created_at', { ascending: false })

  return <DocumentsClient documents={documents || []} />
}
