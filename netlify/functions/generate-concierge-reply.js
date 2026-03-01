// ==========================================================
// 📄 FILE: generate-concierge-reply.js
// AI-powered reply suggestion for the admin panel
// Uses OpenAI GPT-4o-mini when OPENAI_API_KEY is set,
// falls back to a canned template otherwise.
// ==========================================================

const { respond } = require("./utils");
const { withFHJ } = require("./middleware");

exports.handler = withFHJ(async (event) => {
  const { name, message } = JSON.parse(event.body || "{}");

  const apiKey = process.env.OPENAI_API_KEY;

  // Fallback when key is not configured
  if (!apiKey) {
    return respond(200, {
      reply: `Hi ${name || "there"}, thank you for reaching out to FHJ Dream Destinations! I'd love to help make your travel dreams a reality. Could you share any additional details so I can put together the perfect options for you?`,
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a professional luxury travel concierge at FHJ Dream Destinations. Write a warm, personalized email reply to a client inquiry. Keep it concise (3–4 sentences), enthusiastic, and professional. Do not use any placeholder text — write the actual reply, ready to send.",
          },
          {
            role: "user",
            content: `Client name: ${name || "Guest"}\nClient message: ${message || ""}`,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const reply = (data.choices?.[0]?.message?.content || "").trim();

    return respond(200, {
      reply: reply || `Hi ${name || "there"}, thank you for reaching out! I'd love to help plan your perfect trip.`,
    });
  } catch (err) {
    console.error("generate-concierge-reply error:", err);
    return respond(200, {
      reply: `Hi ${name || "there"}, thank you for reaching out to FHJ Dream Destinations! I'd love to help craft your perfect journey. Please feel free to share any additional details and we'll get back to you shortly.`,
    });
  }
});
