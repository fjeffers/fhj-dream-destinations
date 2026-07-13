'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Doc = {
  id: string
  name: string
  category: string
  storage_path: string
  size_bytes: number | null
  created_at: string
}

function formatSize(bytes: number | null): string {
  if (!bytes || bytes <= 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentsClient({ documents }: { documents: Doc[] }) {
  const supabase = createClient()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const download = async (doc: Doc) => {
    setBusyId(doc.id)
    setError('')
    const { data, error: err } = await supabase.storage
      .from('client-documents')
      .createSignedUrl(doc.storage_path, 60, { download: true })
    if (err || !data?.signedUrl) {
      setError('Could not open that file. Please contact your advisor.')
      setBusyId(null)
      return
    }
    window.location.href = data.signedUrl
    setTimeout(() => setBusyId(null), 1500)
  }

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ marginBottom: 32 }}>
        <div className="section-eyebrow" style={{ marginBottom: 8 }}>Secure Files</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 300 }}>
          My <em style={{ color: 'var(--gold)' }}>Documents</em>
        </h2>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.3)', color: 'var(--danger)', fontSize: 13, marginBottom: 20, borderRadius: 4 }}>
          {error}
        </div>
      )}

      {documents.length > 0 ? (
        <div style={{ display: 'grid', gap: 10 }}>
          {documents.map(doc => (
            <div key={doc.id} className="luxury-card" style={{ padding: 20, display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ width: 44, height: 44, background: 'rgba(201,168,76,0.1)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold)', flexShrink: 0, fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 1 }}>
                {(doc.name.split('.').pop() || 'DOC').slice(0, 4).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: 'var(--text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {doc.created_at?.split('T')[0]}{formatSize(doc.size_bytes) ? ` · ${formatSize(doc.size_bytes)}` : ''}
                </div>
              </div>
              <span className="badge badge-teal">{doc.category}</span>
              <button className="btn-gold btn-sm" onClick={() => download(doc)} disabled={busyId === doc.id}
                style={{ opacity: busyId === doc.id ? 0.6 : 1 }}>
                {busyId === doc.id ? '...' : '↓ Download'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, marginBottom: 12 }}>No documents yet</h3>
          <p style={{ fontSize: 15 }}>Your itineraries, confirmations, and travel documents will appear here once your advisor shares them.</p>
        </div>
      )}
    </div>
  )
}
