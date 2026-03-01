// ==========================================================
// 📄 FILE: admin-nlp.js — OpenAI-powered admin assistant
// Accepts natural-language queries and returns structured
// data results from Supabase, or a text answer via GPT.
// Called by: AdminAssistantPanel.jsx
// Location: netlify/functions/admin-nlp.js
//
// Response shape: { label, type: "text" | "list" | "timeline", result }
// ==========================================================

const { supabase, respond } = require("./utils");
const { withFHJ } = require("./middleware");

// ── Route query to a Supabase data fetch ─────────────────
async function fetchData(intent) {
  switch (intent) {
    case "bookings": {
      const { data } = await supabase
        .from("bookings")
        .select("id, destination, status, client_email, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      return {
        label: "Recent Bookings",
        type: "list",
        result: (data || []).map((r) => ({
          Destination: r.destination || "—",
          Status: r.status || "—",
          Client: r.client_email || "—",
          Date: r.created_at ? new Date(r.created_at).toLocaleDateString() : "—",
        })),
      };
    }
    case "trips": {
      const { data } = await supabase
        .from("trips")
        .select("destination, client, status, start_date")
        .order("created_at", { ascending: false })
        .limit(10);
      return {
        label: "Recent Trips",
        type: "list",
        result: (data || []).map((r) => ({
          Destination: r.destination || "—",
          Client: r.client || "—",
          Status: r.status || "—",
          "Start Date": r.start_date || "—",
        })),
      };
    }
    case "clients": {
      const { data } = await supabase
        .from("clients")
        .select("full_name, email, phone, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      return {
        label: "Recent Clients",
        type: "list",
        result: (data || []).map((r) => ({
          Name: r.full_name || "—",
          Email: r.email || "—",
          Phone: r.phone || "—",
          Joined: r.created_at ? new Date(r.created_at).toLocaleDateString() : "—",
        })),
      };
    }
    case "concierge": {
      const { data } = await supabase
        .from("concierge")
        .select("name, email, message, status, created_at")
        .order("created_at", { ascending: false })
        .limit(10);
      return {
        label: "Recent Concierge Messages",
        type: "list",
        result: (data || []).map((r) => ({
          Name: r.name || "—",
          Email: r.email || "—",
          Status: r.status || "—",
          Message: (r.message || "").slice(0, 80) + ((r.message || "").length > 80 ? "…" : ""),
          Date: r.created_at ? new Date(r.created_at).toLocaleDateString() : "—",
        })),
      };
    }
    case "events": {
      const { data } = await supabase
        .from("events")
        .select("title, date, location, host_name")
        .order("date", { ascending: false })
        .limit(10);
      return {
        label: "Upcoming Events",
        type: "list",
        result: (data || []).map((r) => ({
          Title: r.title || "—",
          Date: r.date || "—",
          Location: r.location || "—",
          Host: r.host_name || "—",
        })),
      };
    }
    default:
      return null;
  }
}

// ── Classify intent via keyword matching (fast, free) ────
function classifyIntent(q) {
  const lower = (q || "").toLowerCase();
  if (lower.includes("booking")) return "bookings";
  if (lower.includes("trip")) return "trips";
  if (lower.includes("client")) return "clients";
  if (lower.includes("concierge") || lower.includes("message") || lower.includes("inquiry")) return "concierge";
  if (lower.includes("event") || lower.includes("rsvp")) return "events";
  return null;
}

exports.handler = withFHJ(async (event) => {
  if (event.httpMethod !== "POST") return respond(405, { error: "Method not allowed" });

  const { query = "" } = JSON.parse(event.body || "{}");
  if (!query.trim()) return respond(400, { error: "Query is required" });

  // 1. Try keyword routing first (instant, no API cost)
  const intent = classifyIntent(query);
  if (intent) {
    const dataResult = await fetchData(intent);
    if (dataResult) return respond(200, dataResult);
  }

  // 2. Fall back to OpenAI for free-form questions
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return respond(200, {
      label: "FHJ Assistant",
      type: "text",
      result: [],
      answer: "I can answer questions about bookings, trips, clients, concierge messages, and events. Try asking about one of those topics!",
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
              "You are a helpful assistant for FHJ Dream Destinations, a luxury travel agency. Answer questions about the business concisely (2–3 sentences). You have access to data about bookings, trips, clients, concierge requests, and events.",
          },
          { role: "user", content: query },
        ],
        max_tokens: 200,
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    const answer = (data.choices?.[0]?.message?.content || "").trim();

    return respond(200, {
      label: "FHJ Assistant",
      type: "text",
      result: [],
      answer: answer || "I'm not sure how to answer that. Try asking about bookings, trips, clients, or events.",
    });
  } catch (err) {
    console.error("admin-nlp OpenAI error:", err.message);
    return respond(200, {
      label: "FHJ Assistant",
      type: "text",
      result: [],
      answer: "I couldn't process that request. Please try again.",
    });
  }
});
