import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import TripDetailClient from './TripDetailClient'

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?type=client')

  const { data: booking } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .eq('client_id', user.id)
    .single()

  if (!booking) notFound()

  return <TripDetailClient booking={booking} />
}
