import type { Metadata } from 'next'
import './globals.css'
import ScrollToTop from '@/components/ScrollToTop'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.fhjdreamdestinations.com'),
  title: {
    default: 'FHJ Dream Destinations | Luxury Travel',
    template: '%s | FHJ Dream Destinations',
  },
  description:
    'Boutique luxury travel agency crafting personal, intentional journeys since 2011 — cruises, safaris, honeymoons, and family escapes, planned by a real team from first call to final goodbye.',
  openGraph: {
    type: 'website',
    siteName: 'FHJ Dream Destinations',
    title: 'FHJ Dream Destinations | Luxury Travel',
    description:
      'Curated journeys, crafted with intention. A boutique luxury travel team planning cruises, safaris, honeymoons, and family escapes since 2011.',
    url: 'https://www.fhjdreamdestinations.com',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'FHJ Dream Destinations — Luxury Travel' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FHJ Dream Destinations | Luxury Travel',
    description: 'Curated journeys, crafted with intention — since 2011.',
    images: ['/og.jpg'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ScrollToTop />
        {children}
      </body>
    </html>
  )
}
