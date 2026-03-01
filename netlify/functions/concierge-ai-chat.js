// ==========================================================
// 📄 FILE: concierge-ai-chat.js
// AI-powered travel discovery chat using OpenAI GPT-4o-mini
// Location: netlify/functions/concierge-ai-chat.js
//
// Receives:  { messages: [{role, content}], userName, userEmail }
// Returns:   { reply: string, readyToSubmit: boolean }
//
// The AI gathers 6 trip details one question at a time, then
// signals readyToSubmit by including [READY_TO_SUBMIT] in its reply.
// ==========================================================

const { respond } = require("./utils");

const FALLBACK_OPENING =
  "Let's plan your dream trip! ✈️ What type of travel experience are you looking for — honeymoon, family vacation, luxury getaway, or something else?";

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});
  if (event.httpMethod !== "POST") return respond(405, { error: "Method not allowed" });

  const apiKey = process.env.OPENAI_API_KEY;

  // Graceful no-key fallback: return a canned opening so the chat still works
  if (!apiKey) {
    return respond(200, { reply: FALLBACK_OPENING, readyToSubmit: false });
  }

  try {
    const { messages = [], userName: rawName = "there", userEmail: rawEmail = "" } = JSON.parse(event.body || "{}");

    // Sanitize user-supplied strings before embedding them in the system prompt
    // to prevent prompt-injection attacks (strip newlines and limit length)
    const sanitize = (s) => String(s).replace(/[\r\n\t]/g, " ").slice(0, 100);
    const userName = sanitize(rawName);
    const userEmail = sanitize(rawEmail);
    const systemPrompt = `You are a warm, professional travel concierge at FHJ Dream Destinations — a luxury travel agency. You are chatting with ${userName}.

Their contact info (name, email, phone) has already been collected. Your job is to discover their dream travel plans by asking ONE question at a time.

Collect all of the following (in this order, unless the client volunteers information early):
1. Type of travel experience (e.g., honeymoon, family vacation, luxury getaway, group travel, adventure)
2. Preferred destination or region — or if they are open to suggestions
3. When they want to travel (approximate month or timeframe)
4. Number of travelers
5. Budget per person (approximate)
6. Any special requirements — occasions to celebrate, dietary needs, accessibility, must-see activities

Guidelines:
- Ask EXACTLY ONE question at a time — never stack multiple questions
- Be warm, enthusiastic, and upscale in tone
- Use occasional travel emojis: ✈️ 🌍 🏝️ 🌟 ✨
- Acknowledge what the client shares before moving to the next question
- Keep each reply brief (2–3 sentences maximum)
- Address ${userName} by name occasionally

WHEN TO SUBMIT: Once you have gathered all 6 pieces of information, write a warm 1–2 sentence trip summary for the FHJ team and end your message with exactly this text on its own line:
[READY_TO_SUBMIT]

Do NOT add [READY_TO_SUBMIT] until ALL 6 items are confirmed.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        max_tokens: 300,
        temperature: 0.75,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenAI error:", response.status, errText);
      return respond(200, { reply: FALLBACK_OPENING, readyToSubmit: false });
    }

    const data = await response.json();
    let reply = (data.choices?.[0]?.message?.content || "").trim();

    const readyToSubmit = reply.includes("[READY_TO_SUBMIT]");
    reply = reply.replace(/\[READY_TO_SUBMIT\]/g, "").trim();

    return respond(200, { reply: reply || FALLBACK_OPENING, readyToSubmit });
  } catch (err) {
    console.error("concierge-ai-chat error:", err);
    return respond(200, { reply: FALLBACK_OPENING, readyToSubmit: false });
  }
};
