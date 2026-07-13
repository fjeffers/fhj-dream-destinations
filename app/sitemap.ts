import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.fhjdreamdestinations.com'
  return [
    { url: `${base}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/book`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/book-appointment`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/partners`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
