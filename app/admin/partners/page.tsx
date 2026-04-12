import { createClient } from '@/lib/supabase/server'
import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default async function PartnersPage() {
  const supabase = await createClient()
  const { data: partners } = await supabase
    .from('partners')
    .select('*')
    .eq('active', true)
    .order('created_at')

  const categories = [...new Set((partners || []).map((p: any) => p.category).filter(Boolean))]

  return (
    <>
      <Navigation />
      <div style={{ minHeight: '100vh', background: '#FDFAF3' }}>

        {/* Hero */}
        <div style={{ background: 'linear-gradient(135deg, #073030 0%, #0E6060 50%, #073030 100%)', padding: '100px 48px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 24, border: '1px solid rgba(196,154,69,0.15)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <div style={{ width: 48, height: 1, background: 'rgba(196,154,69,0.5)' }} />
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#E8C87A', fontWeight: 700 }}>TRUSTED NETWORK</span>
              <div style={{ width: 48, height: 1, background: 'rgba(196,154,69,0.5)' }} />
            </div>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(40px,6vw,72px)', fontWeight: 300, color: 'white', lineHeight: 1.1, marginBottom: 20 }}>
              Our Preferred <em style={{ color: '#E8C87A' }}>Partners</em>
            </h1>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, fontStyle: 'italic' }}>
              We collaborate with the finest professionals to ensure every detail of your experience is extraordinary.
            </p>
          </div>
        </div>

        {/* Partners grid */}
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 48px' }}>
          {categories.length > 0 ? (
            categories.map(category => (
              <div key={category} style={{ marginBottom: 72 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 36 }}>
                  <div style={{ width: 4, height: 32, background: 'linear-gradient(to bottom, #C49A45, #3A7D7D)', borderRadius: 2 }} />
                  <div>
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 4, color: '#3A7D7D', marginBottom: 4, fontWeight: 700 }}>{category?.toUpperCase()}</div>
                    <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: '#2E2318', fontWeight: 300 }}>
                      {category} <em style={{ color: '#C49A45' }}>Partners</em>
                    </h2>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
                  {(partners || []).filter((p: any) => p.category === category).map((partner: any) => (
                    <PartnerCard key={partner.id} partner={partner} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            /* No category — show all */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {(partners || []).map((partner: any) => (
                <PartnerCard key={partner.id} partner={partner} />
              ))}
            </div>
          )}

          {(!partners || partners.length === 0) && (
            <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(44,35,24,0.5)' }}>
              <div style={{ fontSize: 56, marginBottom: 20 }}>🤝</div>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 24, fontStyle: 'italic' }}>Our partner directory is coming soon.</p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div style={{ background: '#F5ECD7', padding: '80px 48px', textAlign: 'center', borderTop: '1px solid rgba(196,154,69,0.2)' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 5, color: '#3A7D7D', marginBottom: 16, fontWeight: 700 }}>WANT TO WORK WITH US?</div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 44, fontWeight: 300, color: '#2E2318', marginBottom: 16 }}>Become a Partner</h2>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'rgba(44,35,24,0.6)', fontStyle: 'italic', marginBottom: 36, lineHeight: 1.7 }}>
              We're always looking to collaborate with exceptional businesses that share our commitment to luxury and excellence.
            </p>
            <a href="mailto:info@fhjdreamdestinations.com?subject=Partnership Inquiry"
              style={{ display: 'inline-block', background: '#3A7D7D', color: 'white', padding: '16px 44px', borderRadius: 6, fontFamily: 'Cinzel, serif', fontSize: 11, letterSpacing: 3, textDecoration: 'none', fontWeight: 700 }}>
              GET IN TOUCH ✦
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

function PartnerCard({ partner }: { partner: any }) {
  return (
    <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(196,154,69,0.15)', boxShadow: '0 4px 24px rgba(196,154,69,0.07)', transition: 'all 0.3s' }}>
      {partner.image_url && (
        <div style={{ height: 200, overflow: 'hidden' }}>
          <img src={partner.image_url} alt={partner.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }} />
        </div>
      )}
      <div style={{ padding: '24px 28px' }}>
        {partner.category && (
          <div style={{ display: 'inline-block', background: 'rgba(58,125,125,0.08)', border: '1px solid rgba(58,125,125,0.2)', borderRadius: 20, padding: '3px 12px', fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 2, color: '#3A7D7D', marginBottom: 12, fontWeight: 700 }}>
            {partner.category.toUpperCase()}
          </div>
        )}
        <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, color: '#2E2318', marginBottom: 10, fontWeight: 400 }}>{partner.name}</h3>
        {partner.description && (
          <p style={{ fontSize: 14, color: 'rgba(44,35,24,0.65)', lineHeight: 1.7, marginBottom: 20 }}>{partner.description}</p>
        )}
        {partner.website_url && (
          <a href={partner.website_url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#3A7D7D', fontFamily: 'Cinzel, serif', fontSize: 10, letterSpacing: 2, textDecoration: 'none', fontWeight: 700, borderBottom: '1px solid rgba(58,125,125,0.3)', paddingBottom: 2 }}>
            VISIT WEBSITE →
          </a>
        )}
      </div>
    </div>
  )
}
+