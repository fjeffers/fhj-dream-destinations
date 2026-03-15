// netlify/functions/generate-concierge-reply.js
// Generate an FHJ-styled reply for admin or assistant replies.
// - Ensures the assistant response uses FHJ persona and sanitizes external mentions.
// POST JSON: { prompt: string, context?: string }

const { respond } = require("./utils");

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

const FHJ_REPLY_SYSTEM = `
You are the FHJ Dream Destinations concierge assistant responding on behalf of FHJ.
Follow these rules:
- Use FHJ voice: professional, friendly, and action-oriented.
- Do NOT recommend external booking websites or provide direct URLs. Offer to arrange bookings through FHJ partners.
- Keep responses concise and include a next action (e.g., "May I confirm X so FHJ can proceed?").
- Close with: "We'll review your inquiry and get back to you shortly."
`;

function sanitizeAssistantText(text) {
  if (!text) return text;
  text = text.replace(/https?:\/\/\S+/gi, '[link removed — FHJ will arrange this for you]');
  const banned = ['expedia', 'viator', 'booking', 'airbnb', 'kayak', 'skyscanner', 'tripadvisor'];
  banned.forEach(site => { text = text.replace(new RegExp(site, 'gi'), 'FHJ (we will arrange this for you)'); });
  if (!/We'll review your inquiry and get back to you shortly\./i.test(text)) {
    text = text.trim() + '\n\nWe\u2019ll review your inquiry and get back to you shortly.';
  }
  return text;
}

async function callOpenAI(userMessage) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

  const body = {
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: FHJ_REPLY_SYSTEM },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.6,
    max_tokens: 400
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

  const prompt = (body.prompt || '').toString().trim();
  if (!prompt) return respond(400, { error: 'prompt required' });

  try {
    let assistantRaw = '';
    try {
      assistantRaw = await callOpenAI(prompt);
    } catch (e) {
      console.error('OpenAI call failed for generate-concierge-reply', e);
      assistantRaw = 'Thank you \u2014 may I confirm the key details so FHJ can proceed with booking?';
    }
    const assistant = sanitizeAssistantText(assistantRaw);
    return respond(200, { reply: assistant });
  } catch (err) {
    console.error('generate-concierge-reply handler error', err);
    return respond(500, { error: err.message || String(err) });
  }
};