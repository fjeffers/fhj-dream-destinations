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

const { respond } = require("./utils");
const { withFHJ } = require("./middleware");
const Airtable = require("airtable");

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

  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID
  );

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
    const bookings = await base("Bookings")
      .select({ filterByFormula: `{BalanceDue} > 0` })
      .all();

    return respond(200, {
      label: "Clients With Outstanding Balances",
      type: "list",
      result: bookings.map((b) => ({
        Client: b.get("ClientName"),
        Email: b.get("Email"),
        Balance: `$${b.get("BalanceDue")}`,
      })),
    });
  }

  // ----- Trips by Month -----
  if (parsed.intent === "trips_by_month") {
    const month = parsed.month || "";
    const trips = await base("Trips").select().all();

    const filtered = trips.filter((t) =>
      (t.get("StartDate") || "").toLowerCase().includes(month)
    );

    return respond(200, {
      label: month ? `Trips in ${month.charAt(0).toUpperCase() + month.slice(1)}` : "All Trips",
      type: "list",
      result: filtered.map((t) => ({
        Client: t.get("ClientName"),
        Destination: t.get("Destination"),
        Start: t.get("StartDate"),
        End: t.get("EndDate"),
      })),
    });
  }

  // ----- Unresolved Concierge -----
  if (parsed.intent === "unresolved_concierge") {
    const records = await base("Concierge")
      .select({ filterByFormula: `{Resolved} = FALSE()` })
      .all();

    return respond(200, {
      label: "Unresolved Concierge Messages",
      type: "list",
      result: records.map((r) => ({
        Name: r.get("Name"),
        Email: r.get("Email"),
        Message: r.get("Message"),
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

    try {
      const record = await base("Bookings").find(id);
      const summary = `${record.get("ClientName")} is booked for a trip to ${
        record.get("Destination") || "their destination"
      } from ${record.get("StartDate")} to ${record.get("EndDate")}.
Total: $${record.get("TotalPrice")} | Paid: $${record.get("AmountPaid")} | Balance: $${record.get("BalanceDue")}`;

      return respond(200, {
        label: "Booking Summary",
        type: "text",
        result: summary,
      });
    } catch (err) {
      return respond(200, {
        label: "Booking Not Found",
        type: "text",
        result: `Could not find booking with ID: ${id}`,
      });
    }
  }

  // ----- Recent Activity -----
  if (parsed.intent === "recent_activity") {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const logs = await base("AuditLog")
      .select({ filterByFormula: `{Timestamp} >= '${since}'` })
      .all();

    return respond(200, {
      label: "Activity in the Last 24 Hours",
      type: "timeline",
      result: logs.map((l) => ({
        Admin: l.get("Admin"),
        Action: l.get("Action"),
        Module: l.get("Module"),
        Timestamp: l.get("Timestamp"),
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

    const clients = await base("Clients").select().all();
    const matches = clients.filter((c) =>
      (c.get("Name") || c.get("Full Name") || "").toLowerCase().includes(name)
    );

    return respond(200, {
      label: `Search Results for "${parsed.name}"`,
      type: "list",
      result: matches.map((c) => ({
        Name: c.get("Name") || c.get("Full Name"),
        Email: c.get("Email"),
        Phone: c.get("Phone"),
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
