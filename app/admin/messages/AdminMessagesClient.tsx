'use client'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminMessagesClient({ messages: initial, clients, adminId }: { messages: any[], clients: any[], adminId: string }) {
  const [messages, setMessages] = useState(initial)
  const [selectedClient, setSelectedClient] = useState<any>(clients[0] || null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, selectedClient])

  // Live updates: append client messages the moment they arrive.
  useEffect(() => {
    const channel = supabase
      .channel(`admin-messages-${adminId}`)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `recipient_id=eq.${adminId}` },
        payload => setMessages(prev => prev.some(m => m.id === (payload.new as any).id) ? prev : [...prev, payload.new]))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [adminId])

  const convo = selectedClient ? messages.filter(m =>
    (m.sender_id === adminId && m.recipient_id === selectedClient.id) ||
    (m.sender_id === selectedClient.id && m.recipient_id === adminId)
  ) : []

  const send = async () => {
    if (!text.trim() || !selectedClient || sending) return
    setSending(true)
    const { data } = await supabase.from('messages').insert({ sender_id: adminId, recipient_id: selectedClient.id, content: text.trim() }).select('*, sender:profiles!messages_sender_id_fkey(id, full_name, email, role), recipient:profiles!messages_recipient_id_fkey(id, full_name, email, role)').single()
    if (data) setMessages(p => [...p, data])
    setText('')
    setSending(false)
  }

  const clientsWithMessages = clients.map(c => ({
    ...c,
    msgCount: messages.filter(m => m.sender_id === c.id || m.recipient_id === c.id).length,
    lastMsg: messages.filter(m => m.sender_id === c.id || m.recipient_id === c.id).slice(-1)[0]
  })).sort((a, b) => (b.lastMsg?.created_at || '').localeCompare(a.lastMsg?.created_at || ''))

  return (
    <div style={{ animation: 'fadeIn 0.4s ease', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 24 }}>
        <div className="section-eyebrow" style={{ marginBottom: 6 }}>Concierge Inbox</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 38, fontWeight: 300 }}>
          Client <em style={{ color: 'var(--gold)' }}>Messages</em>
        </h2>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16, height: 'calc(100vh - 180px)' }}>
        {/* Client list */}
        <div className="luxury-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 9, letterSpacing: 2, color: 'var(--gold)' }}>CONVERSATIONS ({clients.length})</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {clientsWithMessages.map(c => (
              <div key={c.id} onClick={() => setSelectedClient(c)} style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: selectedClient?.id === c.id ? 'rgba(201,168,76,0.1)' : 'transparent', borderLeft: `3px solid ${selectedClient?.id === c.id ? 'var(--gold)' : 'transparent'}`, transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <div style={{ fontSize: 13, color: selectedClient?.id === c.id ? 'var(--text)' : 'var(--muted)', fontWeight: selectedClient?.id === c.id ? 500 : 400 }}>{c.full_name || c.email}</div>
                  {c.msgCount > 0 && <span style={{ fontSize: 10, color: 'var(--teal)' }}>{c.msgCount}</span>}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.lastMsg ? c.lastMsg.content.slice(0, 36) + (c.lastMsg.content.length > 36 ? '...' : '') : 'No messages yet'}
                </div>
              </div>
            ))}
            {clients.length === 0 && <div style={{ padding: 24, textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No approved clients yet</div>}
          </div>
        </div>

        {/* Chat area */}
        <div className="luxury-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedClient ? (
            <>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold-dark),var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cinzel, serif', fontSize: 12, color: 'var(--obsidian)', fontWeight: 700, flexShrink: 0 }}>
                  {(selectedClient.full_name || selectedClient.email || '?')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 14, color: 'var(--text)' }}>{selectedClient.full_name || 'Client'}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{selectedClient.email}</div>
                </div>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {convo.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>✉️</div>
                    <p style={{ fontSize: 13 }}>No messages yet. Start the conversation.</p>
                  </div>
                )}
                {convo.map(msg => {
                  const isAdmin = msg.sender_id === adminId
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                      <div style={{ maxWidth: '70%', padding: '12px 16px', background: isAdmin ? 'linear-gradient(135deg,var(--gold-dark),var(--gold))' : 'var(--panel2)', color: isAdmin ? 'var(--obsidian)' : 'var(--text)', fontSize: 13, lineHeight: 1.6, borderRadius: 2 }}>
                        {msg.content}
                        <div style={{ fontSize: 10, marginTop: 5, opacity: 0.65, textAlign: 'right' }}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>
              <div style={{ padding: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 12, flexShrink: 0 }}>
                <input className="luxury-input" placeholder={`Message ${selectedClient.full_name || 'client'}...`} value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  style={{ flex: 1 }} />
                <button className="btn-gold btn-sm" onClick={send} disabled={sending || !text.trim()} style={{ opacity: !text.trim() || sending ? 0.6 : 1 }}>
                  {sending ? '...' : 'Send'}
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
                <p style={{ fontSize: 14 }}>Select a client to view messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
