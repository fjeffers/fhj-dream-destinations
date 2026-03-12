// ==========================================================
// 📄 FILE: admin-intelligence.js  (PHASE 2 — CONSOLIDATION)
// Replaces: admin-command.js, admin-nlp.js
// Location: netlify/functions/admin-intelligence.js
//
// Accepts both slash commands and natural language queries.
// POST body: { query: "/clients unpaid" } or { query: "show me unpaid clients" }
//
// After deploying this file, you can safely DELETE:
//   - netlify/functions/admin-command.js
//   - netlify/functions/admin-nlp.js
//
// Frontend: Update AdminCommandPanel.jsx to call this endpoint.
// ==========================================================

const { supabase, respond } = require("./utils");
const { withFHJ } = require("./middleware");

// -------------------------------------------------------
// Intent Parser — handles both /commands and natural language
// -------------------------------------------------------
function parseIntent(input) {
  const raw = (input || "").trim();
  const q = raw.toLowerCase();

  // Slash commands (explicit)
  if (q.startsWith("/")) {
    const parts = q.split(" ");

    if (parts[0] === "/clients" && parts[1] === "unpaid")
      return { intent: "unpaid_clients" };

    if (parts[0] === "/trips")
      return { intent: "trips_by_month", month: parts[1] || "" };

    if (parts[0] === "/concierge" && parts[1] === "unresolved")
      return { intent: "unresolved_concierge" };

    if (parts[0] === "/summary" && parts[1] === "booking")
      return { intent: "booking_summary", id: parts[2] };

    if (parts[0] === "/activity" && parts[1] === "24h")
      return { intent: "recent_activity" };

    if (parts[0] === "/find")
      return { intent: "find_client", name: parts.slice(1).join(" ") };

    if (parts[0] === "/help")
      return { intent: "help" };
  }

  // Natural language fallback
  if (q.includes("unpaid") || q.includes("balance") || q.includes("owe"))
    return { intent: "unpaid_clients" };

  if (q.includes("unresolved") && q.includes("concierge"))
    return { intent: "unresolved_concierge" };

  if ((q.includes("last 24") || q.includes("past day") || q.includes("recent activity")))
    return { intent: "recent_activity" };

  if (q.includes("find") || q.includes("search") || q.includes("look up"))
    return { intent: "find_client", name: q.replace(/find|search|look up|client/gi, "").trim() };

  // Month detection for trips
  const months = ["january","february","march","april","may","june","july","august","september","october","november","december"];
  const foundMonth = months.find((m) => q.includes(m));
  if (foundMonth && (q.includes("trip") || q.includes("travel")))
    return { intent: "trips_by_month", month: foundMonth };

  if (q.includes("help") || q.includes("what can you"))
    return { intent: "help" };

  return { intent: "unknown" };
}

// -------------------------------------------------------
// Handler
// -------------------------------------------------------
exports.handler = withFHJ(async (event) => {
  const body = JSON.parse(event.body || "{}");
  const query = body.query || body.command || "";

  const parsed = parseIntent(query);

  // ----- Help -----
  if (parsed.intent === "help") {
    return respond(200, {
      label: "Available Commands",
      type: "text",
      result: `
Commands:
  /clients unpaid — Show clients with outstanding balances
  /trips [month]  — Show trips for a specific month
  /concierge unresolved — Show unresolved messages
  /summary booking [id] — Summarize a specific booking
  /activity 24h — Show admin activity in the last 24 hours
  /find [name] — Search for a client by name
  /help — Show this help message

You can also type naturally:
  "show unpaid clients"
  "unresolved concierge messages"
  "trips in march"
  "find John Doe"
      `.trim(),
    });
  }

  // ----- Unpaid Clients -----
  if (parsed.intent === "unpaid_clients") {
    const { data: bookings = [] } = await supabase
      .from("bookings")
      .select("*")
      .gt("balance_due", 0);

    return respond(200, {
      label: "Clients With Outstanding Balances",
      type: "list",
      result: (bookings || []).map((b) => ({
        Client: b.client_name,
        Email: b.email,
        Balance: `$${b.balance_due}`,
      })),
    });
  }

  // ----- Trips by Month -----
  if (parsed.intent === "trips_by_month") {
    const month = parsed.month || "";
    const { data: trips = [] } = await supabase.from("trips").select("*");

    const filtered = (trips || []).filter((t) =>
      (t.start_date || "").toLowerCase().includes(month)
    );

    return respond(200, {
      label: month ? `Trips in ${month.charAt(0).toUpperCase() + month.slice(1)}` : "All Trips",
      type: "list",
      result: filtered.map((t) => ({
        Client: t.client_name,
        Destination: t.destination,
        Start: t.start_date,
        End: t.end_date,
      })),
    });
  }

  // ----- Unresolved Concierge -----
  if (parsed.intent === "unresolved_concierge") {
    const { data: records = [] } = await supabase
      .from("concierge")
      .select("*")
      .neq("status", "Resolved");

    return respond(200, {
      label: "Unresolved Concierge Messages",
      type: "list",
      result: (records || []).map((r) => ({
        Name: r.name,
        Email: r.email,
        Message: r.message,
      })),
    });
  }

  // ----- Booking Summary -----
  if (parsed.intent === "booking_summary") {
    const id = parsed.id;
    if (!id) {
      return respond(200, {
        label: "Missing Booking ID",
        type: "text",
        result: 'Usage: /summary booking [record_id]',
      });
    }

    const { data: record, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !record) {
      return respond(200, {
        label: "Booking Not Found",
        type: "text",
        result: `Could not find booking with ID: ${id}`,
      });
    }

    const summary = `${record.client_name} is booked for a trip to ${
      record.destination || "their destination"
    } from ${record.start_date} to ${record.end_date}.
Total: $${record.total_price} | Paid: $${record.amount_paid} | Balance: $${record.balance_due}`;

    return respond(200, {
      label: "Booking Summary",
      type: "text",
      result: summary,
    });
  }

  // ----- Recent Activity -----
  if (parsed.intent === "recent_activity") {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: logs = [] } = await supabase
      .from("audit_log")
      .select("*")
      .gte("created_at", since);

    return respond(200, {
      label: "Activity in the Last 24 Hours",
      type: "timeline",
      result: (logs || []).map((l) => ({
        Admin: l.admin,
        Action: l.action,
        Module: l.module,
        Timestamp: l.created_at || l.timestamp,
      })),
    });
  }

  // ----- Find Client -----
  if (parsed.intent === "find_client") {
    const name = (parsed.name || "").toLowerCase();
    if (!name) {
      return respond(200, {
        label: "Search",
        type: "text",
        result: 'Please specify a name: /find John Doe',
      });
    }

    const { data: clients = [] } = await supabase
      .from("clients")
      .select("*")
      .ilike("full_name", `%${name}%`);

    return respond(200, {
      label: `Search Results for "${parsed.name}"`,
      type: "list",
      result: (clients || []).map((c) => ({
        Name: c.full_name || c.name,
        Email: c.email,
        Phone: c.phone,
      })),
    });
  }

  // ----- Unknown -----
  return respond(200, {
    label: "Unknown Command",
    type: "text",
    result: "I don't recognize that command. Type /help to see available commands.",
  });
});


