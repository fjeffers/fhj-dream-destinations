import { createClient } from '@/lib/supabase/server'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import HomeClient from './HomeClient'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: heroData } = await supabase
    .from('site_content')
    .select('content')
    .eq('section', 'hero')
    .single()

  const { data: deals } = await supabase
    .from('deals')
    .select('*')
    .eq('active', true)
    .order('featured', { ascending: false })
    .limit(6)

  return (
    <>
      <Navigation />
      <HomeClient heroContent={heroData?.content || {}} deals={deals || []} />
      <Footer />
    </>
  )
}
