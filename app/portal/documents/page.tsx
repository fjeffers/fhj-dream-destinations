import { createClient } from '@/lib/supabase/server'

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: bookings } = await supabase.from('bookings').select('package_name, travel_date, created_at').eq('client_id', user!.id)

  // Generate document list from bookings
  const docs = bookings?.flatMap(b => [
    { name: `${b.package_name} — Itinerary`, date: b.created_at?.split('T')[0], type: 'Itinerary', size: '2.4 MB' },
    { name: `${b.package_name} — Confirmation`, date: b.created_at?.split('T')[0], type: 'Confirmation', size: '890 KB' },
  ]) || []

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: 32 }}>
        <div className="section-eyebrow" style={{ marginBottom: 8 }}>Secure Files</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 300 }}>
          My <em style={{ color: 'var(--gold)' }}>Documents</em>
        </h2>
      </div>
      {docs.length > 0 ? (
        <div style={{ display: 'grid', gap: 10 }}>
          {docs.map((doc, i) => (
            <div key={i} className="luxury-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ width: 44, height: 44, background: 'rgba(201,168,76,0.1)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', flexShrink: 0, fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 1 }}>PDF</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: 'var(--text)', marginBottom: 2 }}>{doc.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>{doc.date} · {doc.size}</div>
              </div>
              <span className="badge badge-teal">{doc.type}</span>
              <button className="btn-ghost btn-sm" style={{ marginLeft: 8 }}>Download</button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 40px' }} className="luxury-card">
          <div style={{ fontSize: 48, marginBottom: 20 }}>📄</div>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 28, marginBottom: 12, fontWeight: 300 }}>No Documents Yet</h3>
          <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.8 }}>Your travel documents and confirmations will appear here once your bookings are confirmed.</p>
        </div>
      )}
    </div>
  )
}
