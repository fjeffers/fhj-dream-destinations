// Shared destination metadata: coordinates for the travel map + a hero image
// for trip pages. Matching is fuzzy (destination or package name contains the key).

export type DestInfo = { lat: number; lng: number; image: string }

// Curated for the destinations FHJ features + common luxury spots.
export const DESTINATIONS: Record<string, DestInfo> = {
  maldives:      { lat: 3.2,   lng: 73.2,   image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1400&q=80' },
  santorini:     { lat: 36.39, lng: 25.46,  image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1400&q=80' },
  'bora bora':   { lat: -16.5, lng: -151.7, image: 'https://images.unsplash.com/photo-1589197331516-4d84b72ebde3?auto=format&fit=crop&w=1400&q=80' },
  serengeti:     { lat: -2.33, lng: 34.83,  image: 'https://images.unsplash.com/photo-1547970810-dc1eac37d174?auto=format&fit=crop&w=1400&q=80' },
  kyoto:         { lat: 35.01, lng: 135.77, image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1400&q=80' },
  'amalfi':      { lat: 40.63, lng: 14.60,  image: 'https://images.unsplash.com/photo-1533165850316-2f0c9b3f6b5a?auto=format&fit=crop&w=1400&q=80' },
  dubai:         { lat: 25.20, lng: 55.27,  image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80' },
  bali:          { lat: -8.34, lng: 115.09, image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1400&q=80' },
  iceland:       { lat: 64.96, lng: -19.02, image: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=1400&q=80' },
  venice:        { lat: 45.44, lng: 12.32,  image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=1400&q=80' },
  paris:         { lat: 48.85, lng: 2.35,   image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1400&q=80' },
  seychelles:    { lat: -4.68, lng: 55.49,  image: 'https://images.unsplash.com/photo-1589979481223-deb893043163?auto=format&fit=crop&w=1400&q=80' },
  'south africa':{ lat: -30.56,lng: 22.94,  image: 'https://images.unsplash.com/photo-1484318571209-661cf29a69c3?auto=format&fit=crop&w=1400&q=80' },
  'cape town':   { lat: -33.92,lng: 18.42,  image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1400&q=80' },
  caribbean:     { lat: 18.2,  lng: -66.5,  image: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1400&q=80' },
  greece:        { lat: 37.98, lng: 23.72,  image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=1400&q=80' },
  italy:         { lat: 41.87, lng: 12.56,  image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1400&q=80' },
  japan:         { lat: 36.20, lng: 138.25, image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1400&q=80' },
  hawaii:        { lat: 20.80, lng: -156.33,image: 'https://images.unsplash.com/photo-1542259009477-d625272157b7?auto=format&fit=crop&w=1400&q=80' },
  'costa rica':  { lat: 9.75,  lng: -83.75, image: 'https://images.unsplash.com/photo-1518259102261-b40117eabbc9?auto=format&fit=crop&w=1400&q=80' },
  thailand:      { lat: 15.87, lng: 100.99, image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1400&q=80' },
  'new york':    { lat: 40.71, lng: -74.01, image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1400&q=80' },
  london:        { lat: 51.51, lng: -0.13,  image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1400&q=80' },
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80'

function keyFor(...texts: (string | null | undefined)[]): string | null {
  const hay = texts.filter(Boolean).join(' ').toLowerCase()
  for (const key of Object.keys(DESTINATIONS)) {
    if (hay.includes(key)) return key
  }
  return null
}

export function destInfo(destination?: string | null, packageName?: string | null): DestInfo | null {
  const k = keyFor(destination, packageName)
  return k ? DESTINATIONS[k] : null
}

export function destImage(destination?: string | null, packageName?: string | null): string {
  return destInfo(destination, packageName)?.image ?? DEFAULT_IMAGE
}

// Equirectangular projection → percentages for absolute positioning.
export function project(lat: number, lng: number): { x: number; y: number } {
  return { x: (lng + 180) / 360 * 100, y: (90 - lat) / 180 * 100 }
}
