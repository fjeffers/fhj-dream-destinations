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

const { selectRecords, supabase, respond } = require("./utils");
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
    const bookings = await selectRecords("Bookings", "");
    const unpaid = bookings.filter((b) => (b.BalanceDue || b.balance_due || 0) > 0);

    return respond(200, {
      label: "Clients With Outstanding Balances",
      type: "list",
      result: unpaid.map((b) => ({
        Client: b.ClientName || b.client_name || b["Client Name"],
        Email: b.Email || b.email,
        Balance: `$${b.BalanceDue || b.balance_due}`,
      })),
    });
  }

  // ----- Trips by Month -----
  if (parsed.intent === "trips_by_month") {
    const month = parsed.month || "";
    const trips = await selectRecords("Trips", "");

    const filtered = trips.filter((t) =>
      ((t["Start Date"] || t.start_date) || "").toLowerCase().includes(month)
    );

    return respond(200, {
      label: month ? `Trips in ${month.charAt(0).toUpperCase() + month.slice(1)}` : "All Trips",
      type: "list",
      result: filtered.map((t) => ({
        Client: t.ClientName || t.client_name || t["Client Name"],
        Destination: t.Destination || t.destination,
        Start: t["Start Date"] || t.start_date,
        End: t["End Date"] || t.end_date,
      })),
    });
  }

  // ----- Unresolved Concierge -----
  if (parsed.intent === "unresolved_concierge") {
    const records = await selectRecords("Concierge", "");
    const unresolved = records.filter((r) => !(r.Resolved || r.resolved));

    return respond(200, {
      label: "Unresolved Concierge Messages",
      type: "list",
      result: unresolved.map((r) => ({
        Name: r.Name || r.name,
        Email: r.Email || r.email,
        Message: r.Message || r.message,
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
      const { data: record, error } = await supabase.from("bookings").select("*").eq("id", id).single();
      if (error || !record) throw new Error("Not found");

      const summary = `${record.ClientName || record.client_name || record["Client Name"]} is booked for a trip to ${
        record.Destination || record.destination || "their destination"
      } from ${record["Start Date"] || record.start_date} to ${record["End Date"] || record.end_date}.
Total: $${record.TotalPrice || record.total_price} | Paid: $${record.AmountPaid || record.amount_paid} | Balance: $${record.BalanceDue || record.balance_due}`;

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
    const logs = await selectRecords("AuditLog", "");
    const recent = logs.filter((l) => {
      const ts = l.Timestamp || l.timestamp || l.created_at;
      return ts && ts >= since;
    });

    return respond(200, {
      label: "Activity in the Last 24 Hours",
      type: "timeline",
      result: recent.map((l) => ({
        Admin: l.Admin || l.admin,
        Action: l.Action || l.action,
        Module: l.Module || l.module,
        Timestamp: l.Timestamp || l.timestamp || l.created_at,
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

    const clients = await selectRecords("Client Name", "");
    const matches = clients.filter((c) =>
      (c["Full Name"] || c.full_name || c.Name || c.name || "").toLowerCase().includes(name)
    );

    return respond(200, {
      label: `Search Results for "${parsed.name}"`,
      type: "list",
      result: matches.map((c) => ({
        Name: c["Full Name"] || c.full_name || c.Name || c.name,
        Email: c.Email || c.email,
        Phone: c.Phone || c.phone,
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
