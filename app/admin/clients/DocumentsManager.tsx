'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const CATEGORIES = ['Itinerary', 'Confirmation', 'Invoice', 'Visa / Entry', 'Insurance', 'Voucher', 'Other']

type Doc = {
  id: string
  name: string
  category: string
  storage_path: string
  size_bytes: number | null
  created_at: string
}

type Props = { clientId: string; clientName: string; onClose: () => void }

function fmtSize(b: number | null): string {
  if (!b || b <= 0) return ''
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

export default function DocumentsManager({ clientId, clientName, onClose }: Props) {
  const supabase = createClient()
  const [docs, setDocs] = useState<Doc[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('Itinerary')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('documents')
      .select('id, name, category, storage_path, size_bytes, created_at')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false })
    setDocs(data || [])
    setLoading(false)
  }, [clientId, supabase])

  useEffect(() => { load() }, [load])

  const upload = async () => {
    if (!file) { setError('Choose a file first.'); return }
    if (file.size > 25 * 1024 * 1024) { setError('File is larger than 25 MB.'); return }
    setUploading(true)
    setError('')
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${clientId}/${Date.now()}-${safeName}`

    const { error: upErr } = await supabase.storage.from('client-documents').upload(path, file, { upsert: false })
    if (upErr) { setError('Upload failed: ' + upErr.message); setUploading(false); return }

    const { data: auth } = await supabase.auth.getUser()
    const { error: insErr } = await supabase.from('documents').insert({
      client_id: clientId,
      name: file.name,
      category,
      storage_path: path,
      size_bytes: file.size,
      uploaded_by: auth.user?.id ?? null,
    })
    if (insErr) {
      await supabase.storage.from('client-documents').remove([path])
      setError('Could not save document record: ' + insErr.message)
      setUploading(false)
      return
    }
    setFile(null)
    setUploading(false)
    load()
  }

  const remove = async (doc: Doc) => {
    if (!confirm(`Delete "${doc.name}"? The client will no longer see it.`)) return
    await supabase.storage.from('client-documents').remove([doc.storage_path])
    await supabase.from('documents').delete().eq('id', doc.id)
    setDocs(p => p.filter(d => d.id !== doc.id))
  }

  const view = async (doc: Doc) => {
    const { data } = await supabase.storage.from('client-documents').createSignedUrl(doc.storage_path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank', 'noopener')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={onClose}>
      <div className="luxury-card" style={{ width: '100%', maxWidth: 640, maxHeight: '88vh', overflowY: 'auto', padding: 28 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div className="section-eyebrow" style={{ marginBottom: 4 }}>Client Documents</div>
            <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 400 }}>{clientName}</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: 'var(--muted)' }}>×</button>
        </div>

        {/* Upload */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 6, padding: 18, marginBottom: 22, background: 'rgba(14,143,143,0.03)' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--teal-dark)', fontWeight: 700, marginBottom: 12 }}>UPLOAD A DOCUMENT</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="luxury-input" value={category} onChange={e => setCategory(e.target.value)} style={{ width: 160 }}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)}
              style={{ flex: 1, minWidth: 180, fontSize: 13 }} />
            <button className="btn-teal btn-sm" onClick={upload} disabled={uploading || !file} style={{ opacity: uploading || !file ? 0.6 : 1 }}>
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
          {error && <div style={{ color: 'var(--danger)', fontSize: 12, marginTop: 10 }}>{error}</div>}
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 30, fontSize: 13 }}>Loading…</div>
        ) : docs.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 30, fontSize: 13 }}>No documents shared with this client yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {docs.map(doc => (
              <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid var(--border)', borderRadius: 5 }}>
                <span className="badge badge-teal" style={{ flexShrink: 0 }}>{doc.category}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>{doc.created_at?.split('T')[0]}{fmtSize(doc.size_bytes) ? ` · ${fmtSize(doc.size_bytes)}` : ''}</div>
                </div>
                <button onClick={() => view(doc)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 4, padding: '5px 10px', cursor: 'pointer', fontSize: 11, color: 'var(--teal-dark)' }}>View</button>
                <button onClick={() => remove(doc)} style={{ background: 'none', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 4, padding: '5px 10px', cursor: 'pointer', fontSize: 11, color: 'var(--danger)' }}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
