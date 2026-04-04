import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FHJ Dream Destinations | Luxury Travel',
  description: 'Curated luxury travel experiences for the world\'s most discerning travelers.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
