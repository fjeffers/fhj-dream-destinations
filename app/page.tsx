import { createClient } from '@/lib/supabase/server'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import HomeClient from './HomeClient'
import type { Deal } from '@/lib/types'

export default async function HomePage() {
  const supabase = await createClient()

  const [dealsRes, heroRes, footerRes] = await Promise.all([
    supabase.from('deals').select('*').eq('active', true).order('created_at', { ascending: false }),
    supabase.from('site_content').select('content').eq('section', 'hero').single(),
    supabase.from('site_content').select('content').eq('section', 'footer').single(),
  ])

  const heroContent = heroRes.data?.content || {}
  const footerContent = footerRes.data?.content || {}

  return (
    <>
      <Navigation />
      <HomeClient
        deals={(dealsRes.data as Deal[]) || []}
        heroContent={heroContent}
        footerContent={footerContent}
      />
      <Footer />
    </>
  )
}
