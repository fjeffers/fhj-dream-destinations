// netlify/functions/ai-suggest.js
// Generate 1-3 clarifying follow-up questions using OpenAI (server-side).
// If called with { persist: true, concierge_id } will insert assistant messages into concierge_messages
// and update parent concierge.last_activity via Supabase service client.
//
// POST JSON:
// { message: string, context?: string, persist?: boolean, concierge_id?: uuid }
//
// Response: { suggestions: [..], persisted?: { messages: [...] } }

const fetch = require('node-fetch');
const supabase = require('./utils/supabaseServer');
const { respond } = require('./utils/respond');

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

async function callOpenAI(message, context = '') {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const system = 'You are a friendly travel concierge assistant. Produce 1-3 short clarifying questions that help fulfill a travel booking request. Keep them concise and natural.';
  const user = `Client message: ${message}\nContext: ${context}\n\nReturn exactly an array of 1-3 short clarifying questions.`;

  const body = {
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ],
    temperature: 0.6,
    max_tokens: 200
  };

  const res = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`OpenAI error: ${res.status} ${txt}`);
  }

  const data = await res.json();
  const assistant = data?.choices?.[0]?.message?.content ?? '';

  // Try parse JSON array first
  try {
    const parsed = JSON.parse(assistant);
    if (Array.isArray(parsed)) return parsed.map(s => String(s).trim()).filter(Boolean).slice(0, 3);
  } catch (e) {
    // fallback: split lines
    const lines = assistant.split(/\r?\n/).map(l => l.replace(/^[\d\.\-\)\s]+/, '').trim()).filter(Boolean);
    if (lines.length) return lines.slice(0, 3);
  }

  // Last resort: return whole assistant as single suggestion
  return [assistant.trim()].filter(Boolean).slice(0, 3);
}

module.exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return respond(204, {});
  if (event.httpMethod !== 'POST') return respond(405, { error: 'Method Not Allowed' });

  let body = {};
  try { body = event.body ? JSON.parse(event.body) : {}; } catch (e) { return respond(400, { error: 'Invalid JSON' }); }

  const message = (body.message || '').toString().trim();
  const context = (body.context || '').toString().trim();
  const persist = !!body.persist;
  const concierge_id = body.concierge_id || null;

  if (!message) return respond(400, { error: 'message required' });

  try {
    let suggestions = [];
    try {
      suggestions = await callOpenAI(message, context);
    } catch (e) {
      console.error('OpenAI call failed, falling back to rule-based', e);
      suggestions = [
        'Can you share your travel dates (or a date range)?',
        'How many people will be traveling?',
        'Do you have a preferred budget or class of service?'
      ];
    }

    const result = { suggestions };

    if (persist && concierge_id && supabase) {
      // Insert assistant messages (one per suggestion)
      const now = new Date().toISOString();
      const inserts = suggestions.map((s) => ({
        concierge_id,
        sender: 'assistant',
        body: s,
        metadata: { generated_by: process.env.OPENAI_API_KEY ? 'openai' : 'rule-based', suggestion: true },
        created_at: now
      }));
      const { data: created, error } = await supabase.from('concierge_messages').insert(inserts).select();
      if (error) {
        console.error('Error persisting suggestions:', error);
        result.persist_error = error.message || String(error);
      } else {
        result.persisted = { messages: created };
        // update parent last_activity
        await supabase.from('concierge').update({ last_activity: now }).eq('id', concierge_id);
      }
    }

    return respond(200, result);
  } catch (err) {
    console.error('ai-suggest error', err);
    return respond(500, { error: err.message || String(err) });
  }
};
