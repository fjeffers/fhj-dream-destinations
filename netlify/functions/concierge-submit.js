// netlify/functions/concierge-submit.js
// Public concierge submission from Chat Widget
// Saves to concierge table, persists initial message, generates AI suggestions, sends email
const { supabase, respond } = require("./utils");

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

async function generateAISuggestions(message, context = '') {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const system = 'You are a friendly travel concierge assistant for FHJ Dream Destinations. Produce 1-3 short clarifying questions that help fulfill a travel booking request. Keep them concise and natural.';
    const user = `Client message: ${message}\nContext: ${context}\n\nReturn exactly a JSON array of 1-3 short clarifying questions.`;

    const res = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        temperature: 0.6,
        max_tokens: 200
      })
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`OpenAI request failed: status=${res.status}, body=${errorBody}`);
      return null;
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content ?? '';

    try {
      let cleaned = content.trim();
      cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) return parsed.map(s => String(s).trim()).filter(Boolean).slice(0, 3);
    } catch (e) {
      console.error('Failed to parse AI response as JSON, falling back to line split. Content:', content);
      const lines = content.split(/\r?\n/).map(l => l.replace(/^[\d\.\-\)\s]+/, '').trim()).filter(Boolean);
      if (lines.length) return lines.slice(0, 3);
    }

    return [content.trim()].filter(Boolean).slice(0, 3);
  } catch (err) {
    console.error('AI suggestion generation failed:', err);
    return null;
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});
  if (event.httpMethod !== "POST") return respond(405, { error: "Method not allowed" });

  try {
    const { name, email, phone, message, source, context } = JSON.parse(event.body || "{}");

    if (!message) return respond(400, { error: "Message is required" });

    // 1. Save to Supabase concierge table (only guaranteed columns first)
    const insertData = {
      name: name || "",
      email: email || "",
      message,
      source: source || "Chat Widget",
    };

    // Try adding optional columns — these may not exist yet
    // If the migration has been run, these will work. If not, we catch and retry without them.
    const optionalFields = {
      phone: phone || "",
      context: context || "",
      status: "New",
      conversation_open: true,
      last_activity: new Date().toISOString(),
    };

    let data, error;

    // First try with all fields
    ({ data, error } = await supabase
      .from("concierge")
      .insert([{ ...insertData, ...optionalFields }])
      .select()
      .single());

    // If it fails (likely missing columns), retry with only basic fields
    if (error) {
      console.warn("Insert with optional fields failed, retrying with basic fields:", error.message);
      ({ data, error } = await supabase
        .from("concierge")
        .insert([insertData])
        .select()
        .single());
    }

    if (error) {
      console.error("Supabase insert error:", error);
      return respond(500, { error: error.message });
    }

    const conciergeId = data.id;

    // 2. Save initial client message to concierge_messages (without created_at — let DB default)
    try {
      const msgInsert = {
        concierge_id: conciergeId,
        sender: 'client',
        body: message,
        metadata: { source: source || "Chat Widget" },
      };
      const { error: msgError } = await supabase.from("concierge_messages").insert([msgInsert]);
      if (msgError) console.error("concierge_messages insert error:", msgError.message);
    } catch (msgErr) {
      console.error("Failed to insert initial message:", msgErr);
    }

    // 3. Generate AI suggestions and persist them
    let suggestions = [];
    try {
      const aiSuggestions = await generateAISuggestions(message, context || source || '');
      if (aiSuggestions && aiSuggestions.length > 0) {
        suggestions = aiSuggestions;
        const inserts = suggestions.map(s => ({
          concierge_id: conciergeId,
          sender: 'assistant',
          body: s,
          metadata: { generated_by: 'openai', suggestion: true },
        }));
        const { error: aiMsgErr } = await supabase.from('concierge_messages').insert(inserts);
        if (aiMsgErr) console.error('Error persisting AI suggestions:', aiMsgErr.message);

        // Try to update last_activity (may not exist)
        try {
          await supabase.from('concierge').update({ last_activity: new Date().toISOString() }).eq('id', conciergeId);
        } catch (e) { /* column may not exist */ }
      }
    } catch (aiErr) {
      console.error("AI suggestion step failed (non-fatal):", aiErr);
    }

    // 4. Send email notification via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "FHJ Dream Destinations <notifications@fhjdreamdestinations.com>",
            to: ["info@fhjdreamdestinations.com"],
            subject: `New Concierge Message from ${name || "a visitor"}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #00c48c; margin-bottom: 1.5rem;">✈️ New Concierge Message</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 0.5rem 0; font-weight: bold; width: 100px; color: #555;">Name:</td>
                    <td style="padding: 0.5rem 0;">${name || "Not provided"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 0.5rem 0; font-weight: bold; color: #555;">Email:</td>
                    <td style="padding: 0.5rem 0;"><a href="mailto:${email}" style="color: #00c48c;">${email || "Not provided"}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 0.5rem 0; font-weight: bold; color: #555;">Phone:</td>
                    <td style="padding: 0.5rem 0;"><a href="tel:${phone}" style="color: #00c48c;">${phone || "Not provided"}</a></td>
                  </tr>
                </table>
                <div style="margin-top: 1.5rem;">
                  <p style="font-weight: bold; color: #555; margin-bottom: 0.5rem;">Message:</p>
                  <blockquote style="border-left: 4px solid #00c48c; padding: 0.75rem 1rem; margin: 0; background: #f9f9f9; border-radius: 0 8px 8px 0; color: #333;">
                    ${message}
                  </blockquote>
                </div>
                ${suggestions.length > 0 ? `
                <div style="margin-top: 1.5rem;">
                  <p style="font-weight: bold; color: #555; margin-bottom: 0.5rem;">AI Follow-up Questions:</p>
                  <ul style="margin: 0; padding-left: 1.5rem;">
                    ${suggestions.map(s => `<li style="margin-bottom: 0.25rem; color: #333;">${s}</li>`).join('')}
                  </ul>
                </div>` : ''}
                <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #eee;" />
                <p style="color: #999; font-size: 0.8rem;">Sent from FHJ Dream Destinations concierge chat · <a href="https://fhjdreamdestinations.com/admin/concierge" style="color: #00c48c;">View in Admin</a></p>
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        console.error("Resend email error (non-fatal):", emailErr);
      }
    }

    return respond(200, { success: true, conciergeId, suggestions });
  } catch (err) {
    console.error("concierge-submit error:", err);
    return respond(500, { error: err.message });
  }
};
