// netlify/functions/concierge-chat.js
// Handles follow-up messages in an ongoing concierge chat conversation
// Saves user message to concierge_messages, calls OpenAI with conversation context, returns AI reply
const { supabase, respond } = require("./utils");

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});
  if (event.httpMethod !== "POST") return respond(405, { error: "Method not allowed" });

  try {
    const { concierge_id, message } = JSON.parse(event.body || "{}");
    if (!concierge_id || !message) return respond(400, { error: "concierge_id and message required" });

    // 1. Save user's follow-up message
    const { error: insertUserErr } = await supabase.from("concierge_messages").insert([{
      concierge_id,
      sender: 'client',
      body: message,
      metadata: { source: 'Chat Widget' }
    }]);
    if (insertUserErr) {
      console.error("Failed to save user message:", insertUserErr);
      return respond(500, { error: "Failed to save message" });
    }

    // 2. Fetch full conversation history for context
    const { data: history } = await supabase
      .from("concierge_messages")
      .select("sender, body")
      .eq("concierge_id", concierge_id)
      .order("created_at", { ascending: true });

    // 3. Fetch parent concierge record for client info
    const { data: parent } = await supabase
      .from("concierge")
      .select("name, email, message, source")
      .eq("id", concierge_id)
      .single();

    // 4. Build conversation for OpenAI
    const conversationMessages = [
      {
        role: 'system',
        content: `You are a friendly, professional travel concierge for FHJ Dream Destinations, a luxury travel agency. You are chatting with ${parent?.name || 'a client'} who reached out via the website chat widget. Your job is to gather information about their travel needs — destinations, dates, budget, special occasions, preferences — so the human travel team can follow up with a perfect proposal. Be warm, enthusiastic, and helpful. Keep responses concise (2-4 sentences). Ask one follow-up question at a time. If you have enough info, let them know the team will be in touch soon.`
      }
    ];

    // Add conversation history
    if (history && history.length) {
      for (const msg of history) {
        conversationMessages.push({
          role: msg.sender === 'client' ? 'user' : 'assistant',
          content: msg.body
        });
      }
    }

    // 5. Call OpenAI
    const apiKey = process.env.OPENAI_API_KEY;
    let reply = '';

    if (apiKey) {
      try {
        const res = await fetch(OPENAI_URL, {
          method: 'POST',
          headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
            messages: conversationMessages,
            temperature: 0.7,
            max_tokens: 300
          })
        });

        if (res.ok) {
          const data = await res.json();
          reply = data?.choices?.[0]?.message?.content?.trim() || '';
        }
      } catch (err) {
        console.error('OpenAI error:', err);
      }
    }

    // Fallback if no API key or API failed
    if (!reply) {
      reply = "Thanks for sharing that! Our travel team has all of this noted and will reach out to you shortly with some amazing options. Is there anything else you'd like to add?";
    }

    // 6. Save AI reply to concierge_messages
    const { error: insertReplyErr } = await supabase.from("concierge_messages").insert([{
      concierge_id,
      sender: 'assistant',
      body: reply,
      metadata: { generated_by: 'openai' }
    }]);
    if (insertReplyErr) {
      console.error("Failed to save AI reply:", insertReplyErr);
    }

    // 7. Update last_activity on parent
    try {
      await supabase.from("concierge").update({ last_activity: new Date().toISOString() }).eq("id", concierge_id);
    } catch (e) {
      console.error("Failed to update last_activity (non-fatal):", e);
    }

    return respond(200, { reply });
  } catch (err) {
    console.error("concierge-chat error:", err);
    return respond(500, { error: err.message });
  }
};
