// netlify/functions/ai-suggest.js
// Uses OPENAI_API_KEY or FHJAI environment variable (fallback).
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

export const handler = async (event) => {
  try {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };
    const payload = JSON.parse(event.body || "{}");
    const { message, context = "" } = payload;
    if (!message) return { statusCode: 400, body: JSON.stringify({ error: "message required" }) };

    const apiKey = process.env.OPENAI_API_KEY || process.env.FHJAI || process.env.FHJ_AI || "";
    if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: "OpenAI API key not configured (OPENAI_API_KEY or FHJAI)" }) };

    const prompt = `You are an assistant that suggests short clarifying follow-up questions a travel agent might ask a client.
Client message: ${message}
Context: ${context}

Return 3 concise follow-up questions as a JSON array (e.g. ["Question 1","Question 2","Question 3"]).`;

    const body = {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You suggest concise clarifying questions for a travel booking request." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 300
    };

    const res = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("OpenAI error:", res.status, txt);
      return { statusCode: 500, body: JSON.stringify({ error: "OpenAI error", details: txt }) };
    }

    const data = await res.json();
    const assistant = data.choices?.[0]?.message?.content || "";
    let suggestions = [];
    try {
      suggestions = JSON.parse(assistant);
      if (!Array.isArray(suggestions)) suggestions = [];
    } catch (e) {
      suggestions = assistant.split(/\r?\n/).map(s => s.trim()).filter(Boolean).slice(0, 3);
    }

    return { statusCode: 200, body: JSON.stringify({ suggestions }) };
  } catch (err) {
    console.error("ai-suggest handler error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message || String(err) }) };
  }
};
