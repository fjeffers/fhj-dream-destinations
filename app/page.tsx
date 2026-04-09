import { createClient } from '@/lib/supabase/server'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import HomeClient from './HomeClient'

export default async function HomePage() {
  const supabase = await createClient()

  // Only fetch content needed by the home page (no deals — dealt with on /book)
  const [heroRes, footerRes] = await Promise.all([
    supabase.from('site_content').select('content').eq('section', 'hero').single(),
    supabase.from('site_content').select('content').eq('section', 'footer').single(),
  ])

  return (
    <>
      <Navigation />
      <HomeClient
        heroContent={heroRes.data?.content || {}}
        footerContent={footerRes.data?.content || {}}
      />
      <Footer />
    </>
  )
}
