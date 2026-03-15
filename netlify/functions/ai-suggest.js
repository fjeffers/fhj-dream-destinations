// netlify/functions/ai-suggest.js
// FHJ-tailored clarifying question generator.
// - Uses OpenAI to generate 1-3 concise clarifying questions.
// - Injects a short FHJ partner summary (if present in DB) into the system prompt.
// - Sanitizes assistant output to remove external links / vendor names.
// - If persist=true and concierge_id provided, stores assistant messages in concierge_messages.

const { supabase, respond } = require("./utils");

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

const FHJ_SYSTEM_PROMPT = `
You are an FHJ Dream Destinations travel agent. You work exclusively for FHJ Dream Destinations and handle ALL bookings, flights, transfers, and excursions on behalf of every client. You are not a search engine, an information service, or a referral service — you are a full-service travel agent who takes care of everything.

ABSOLUTE RULES — never break these under any circumstances:
1. NEVER mention, name, or recommend any external booking website, app, or platform. This includes but is not limited to: Expedia, Viator, GetYourGuide, Booking.com, Airbnb, Kayak, Skyscanner, TripAdvisor, Hotels.com, Travelocity, Orbitz, Priceline, Trivago, Hopper, Google Flights, Momondo, Cheapflights, or any similar service.
2. NEVER tell a client to book something themselves, look something up themselves, or visit any external website.
3. NEVER provide URLs, links, or web addresses of any kind.
4. You handle EVERYTHING for the client — flights, hotels, resorts, transfers, excursions, tours, insurance, visas. Say "I'll arrange this for you" or "Our FHJ team will handle this for you."
5. When a client asks about prices or availability, always say FHJ will check with our partners and provide a personalised quote — never quote third-party sites.
6. When recommending resorts, destinations, or activities, present them as options FHJ will book — not things the client should research or look up.
7. Always end every response with: "Our FHJ team will review your inquiry and get back to you shortly."
8. Ask up to 3 concise clarifying questions to gather what you need: travel dates, departure city, number of travellers, budget, and any special preferences.
9. Use a warm, professional, and reassuring tone — the client should always feel that FHJ has everything covered.
`;

// Remove URLs and vendor names, replace with FHJ phrasing
function sanitizeAssistantText(text) {
  if (!text) return text;
  // Remove URLs
  text = text.replace(/https?:\/\/\S+/gi, '[link removed — FHJ will arrange this for you]');
  // Replace common vendor names (extended list)
  const banned = [
    'expedia', 'viator', 'getyourguide', 'get your guide', 'booking\\.com',
    'airbnb', 'kayak', 'skyscanner', 'tripadvisor', 'trip advisor',
    'hotels\\.com', 'travelocity', 'orbitz', 'priceline', 'trivago',
    'hopper', 'google flights', 'momondo', 'cheapflights'
  ];
  banned.forEach(site => {
    const re = new RegExp(site, 'gi');
    text = text.replace(re, 'FHJ (we will arrange this for you)');
  });
  // Replace phrases that tell the user to visit, book on, or check an external site
  text = text.replace(/\b(visit|book on|book at|book through|check|go to|look up|search on|find on|use|try)\s+[^.!?\n]+/gi, 'contact FHJ');
  // Ensure the closing line exists
  if (!/Our FHJ team will review your inquiry and get back to you shortly\.?/i.test(text)) {
    text = text.trim() + '\n\nOur FHJ team will review your inquiry and get back to you shortly.';
  }
  return text;
}

async function fetchPartnersSummary(limit = 3) {
  if (!supabase) return '';
  try {
    const { data, error } = await supabase
      .from('fhj_partners')
      .select('name, region, description, price_range, tags')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error || !data) return '';
    const lines = data.map(p => {
      const tags = p.tags && p.tags.length ? ` (${p.tags.join(', ')})` : '';
      return `${p.name} — ${p.region} — ${p.price_range || 'price varies'}${tags}: ${p.description || ''}`;
    });
    return 'FHJ partner options:\n' + lines.join('\n');
  } catch (e) {
    console.error('fetchPartnersSummary error', e);
    return '';
  }
}

async function callOpenAI(system, userMessage) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const body = {
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.6,
    max_tokens: 300
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
  return data?.choices?.[0]?.message?.content ?? '';
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
    // Build prompt with FHJ system prompt + partners summary (if any)
    const partnerSummary = await fetchPartnersSummary(3);
    const systemPrompt = FHJ_SYSTEM_PROMPT + (partnerSummary ? '\n\n' + partnerSummary : '\n\nNo partner data available.');

    let assistantRaw = '';
    try {
      assistantRaw = await callOpenAI(systemPrompt, `Client message: ${message}\nContext: ${context}\n\nReturn 1-3 concise clarifying questions or a short follow-up response.`);
    } catch (openaiErr) {
      console.error('OpenAI call failed', openaiErr);
      // fallback questions
      assistantRaw = [
        'May I confirm your travel dates so FHJ can search and secure flights and hotels for you?',
        'How many travelers will be in your party, and do you have any special requirements?',
        'Do you have a target budget and any destination preferences?'
      ].join('\n');
    }

    // Sanitize assistant output to remove any external links or vendor mentions
    const assistant = sanitizeAssistantText(assistantRaw);

    const suggestions = assistant.split(/\r?\n/).map(s => s.trim()).filter(Boolean).slice(0, 3);

    const result = { suggestions, raw: assistant };

    if (persist && concierge_id && supabase) {
      const now = new Date().toISOString();
      const inserts = suggestions.map((s) => ({
        concierge_id,
        sender: 'assistant',
        body: s,
        metadata: { generated_by: process.env.OPENAI_API_KEY ? 'openai' : 'fallback', suggestion: true },
        created_at: now
      }));
      const { data: created, error } = await supabase.from('concierge_messages').insert(inserts).select();
      if (error) {
        console.error('Error persisting suggestions:', error);
        result.persist_error = error.message || String(error);
      } else {
        result.persisted = { messages: created };
        await supabase.from('concierge').update({ last_activity: now }).eq('id', concierge_id);
      }
    }

    return respond(200, result);
  } catch (err) {
    console.error('ai-suggest handler error', err);
    return respond(500, { error: err.message || String(err) });
  }
};
