// netlify/functions/generate-concierge-reply.js
// Generate an AI-powered reply for admin to use when responding to concierge messages
const { supabase, respond } = require("./utils");
const { withFHJ } = require("./middleware");

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

async function generateAIReply({ name, message, occasion, trip, conversationHistory }) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    // Fallback to rule-based if no API key
    const intro = `Hi ${name || 'there'}, thanks so much for reaching out.`;
    let body = "";
    if (occasion) body += ` I see you're planning something for ${occasion}. `;
    if (trip) body += ` Regarding your trip to ${trip}, I'd be happy to help with anything you need. `;
    if (message) body += ` About your message: "${message}", here's what I recommend. `;
    const closing = "Let me know if you'd like me to arrange anything or provide more details.";
    return `${intro} ${body} ${closing}`;
  }

  try {
    const system = `You are a professional travel concierge for FHJ Dream Destinations, a luxury travel agency. Write a warm, helpful, and professional reply to a client inquiry. Keep the tone friendly but professional. Include specific next steps or questions if appropriate. Sign off warmly.`;

    let userPrompt = `Client name: ${name || 'Unknown'}\n`;
    if (occasion) userPrompt += `Occasion: ${occasion}\n`;
    if (trip) userPrompt += `Trip/Destination: ${trip}\n`;
    userPrompt += `Client message: ${message}\n`;
    if (conversationHistory) userPrompt += `\nPrevious conversation:\n${conversationHistory}\n`;
    userPrompt += `\nWrite a professional reply from the FHJ Dream Destinations concierge team.`;

    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);

    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
  } catch (err) {
    console.error('OpenAI reply generation failed:', err);
    return null;
  }
}

exports.handler = withFHJ(async (event) => {
  const body = JSON.parse(event.body || "{}");

  // If concierge_id provided, fetch conversation history
  let conversationHistory = '';
  if (body.concierge_id && supabase) {
    try {
      const { data: msgs } = await supabase
        .from('concierge_messages')
        .select('sender, body, created_at')
        .eq('concierge_id', body.concierge_id)
        .order('created_at', { ascending: true });

      if (msgs && msgs.length) {
        conversationHistory = msgs.map(m => `${m.sender}: ${m.body}`).join('\n');
      }
    } catch (e) {
      console.error('Error fetching conversation history:', e);
    }
  }

  const reply = await generateAIReply({
    name: body.name || "there",
    message: body.message || "",
    occasion: body.occasion || "",
    trip: body.trip || "",
    conversationHistory,
  });

  if (!reply) {
    // Fallback
    const fallback = `Hi ${body.name || 'there'}, thanks for reaching out! I'd love to help you with your travel plans. Could you share a few more details so I can provide the best recommendations? Looking forward to helping you plan your dream trip!`;
    return respond(200, { reply: fallback });
  }

  return respond(200, { reply });
});
