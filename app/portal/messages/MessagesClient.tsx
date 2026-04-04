'use client'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function MessagesClient({ messages: initial, profile, userId }: { messages: any[], profile: any, userId: string }) {
  const [messages, setMessages] = useState(initial)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!text.trim() || sending) return
    setSending(true)
    // For portal, send message — admin will reply. We use a placeholder admin recipient.
    // In production, fetch admin user id from profiles where role='admin'
    const { data: admin } = await supabase.from('profiles').select('id').eq('role', 'admin').single()
    if (admin) {
      const { data: msg } = await supabase.from('messages').insert({ sender_id: userId, recipient_id: admin.id, content: text.trim() }).select('*, sender:profiles!messages_sender_id_fkey(full_name, role)').single()
      if (msg) setMessages(p => [...p, msg])
    }
    setText('')
    setSending(false)
  }

  const grouped = messages.reduce((acc: any, msg: any) => {
    const date = msg.created_at?.split('T')[0] || 'Today'
    if (!acc[date]) acc[date] = []
    acc[date].push(msg)
    return acc
  }, {})

  return (
    <div style={{ animation: 'fadeIn 0.4s ease', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 72px)' }}>
      <div style={{ marginBottom: 24, flexShrink: 0 }}>
        <div className="section-eyebrow" style={{ marginBottom: 8 }}>Concierge</div>
        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 36, fontWeight: 300 }}>
          Your <em style={{ color: 'var(--gold)' }}>Advisor</em>
        </h2>
      </div>
      <div className="luxury-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,var(--gold-dark),var(--gold))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cinzel, serif', fontSize: 12, color: 'var(--obsidian)', fontWeight: 700 }}>SL</div>
          <div>
            <div style={{ fontSize: 14, color: 'var(--text)' }}>Sophia Laurent</div>
            <div style={{ fontSize: 11, color: 'var(--teal)' }}>● Senior Travel Architect</div>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✉️</div>
              <p style={{ fontSize: 14, marginBottom: 8 }}>Start a conversation with your advisor</p>
              <p style={{ fontSize: 12 }}>We typically respond within 2 hours during business hours.</p>
            </div>
          )}
          {Object.entries(grouped).map(([date, msgs]: [string, any]) => (
            <div key={date}>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 8, letterSpacing: 2, color: 'var(--muted)', padding: '4px 12px', border: '1px solid var(--border)' }}>{date}</span>
              </div>
              {msgs.map((msg: any) => {
                const isMe = msg.sender_id === userId
                return (
                  <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                    <div style={{ maxWidth: '75%', padding: '12px 16px', background: isMe ? 'linear-gradient(135deg,var(--gold-dark),var(--gold))' : 'var(--panel2)', color: isMe ? 'var(--obsidian)' : 'var(--text)', fontSize: 13, lineHeight: 1.6, borderRadius: 2 }}>
                      {msg.content}
                      <div style={{ fontSize: 10, marginTop: 6, opacity: 0.7, textAlign: 'right' }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <div style={{ padding: 16, borderTop: '1px solid var(--border)', display: 'flex', gap: 12, flexShrink: 0 }}>
          <input className="luxury-input" placeholder="Message your concierge..." value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            style={{ flex: 1 }} />
          <button className="btn-gold btn-sm" onClick={send} disabled={sending || !text.trim()} style={{ opacity: !text.trim() || sending ? 0.6 : 1 }}>
            {sending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
