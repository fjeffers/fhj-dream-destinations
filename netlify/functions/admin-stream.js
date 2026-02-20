// netlify/functions/admin-stream.js
const Airtable = require("airtable");
const { withFHJ } = require("./middleware");

const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  };

  const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
    process.env.AIRTABLE_BASE_ID
  );

  try {
    const [bookings, trips, concierge, logs] = await Promise.all([
      base("Bookings").select().all(),
      base("Trips").select().all(),
      base("Concierge").select().all(),
      base("AuditLog").select().all(),
    ]);

    const snapshot = {
      type: "snapshot",
      ts: new Date().toISOString(),
      bookings: bookings.map((b) => ({
        id: b.id,
        ClientName: b.get("ClientName"),
        Email: b.get("Email"),
        BalanceDue: b.get("BalanceDue"),
        TotalPrice: b.get("TotalPrice"),
        AmountPaid: b.get("AmountPaid"),
      })),
      trips: trips.map((t) => ({
        id: t.id,
        ClientName: t.get("ClientName"),
        Destination: t.get("Destination"),
        StartDate: t.get("StartDate"),
        EndDate: t.get("EndDate"),
      })),
      concierge: concierge.map((c) => ({
        id: c.id,
        Name: c.get("Name"),
        Email: c.get("Email"),
        Message: c.get("Message"),
        Resolved: c.get("Resolved"),
      })),
      activity: logs.map((l) => ({
        id: l.id,
        Admin: l.get("Admin"),
        Action: l.get("Action"),
        Module: l.get("Module"),
        Timestamp: l.get("Timestamp"),
      })),
    };

    const body = `data: ${JSON.stringify(snapshot)}\n\n`;

    return {
      statusCode: 200,
      headers,
      body,
    };
  } catch (err) {
    console.error("admin-stream error", err);
    const body = `data: ${JSON.stringify({
      type: "error",
      message: "stream-failed",
    })}\n\n`;
    return {
      statusCode: 200,
      headers,
      body,
    };
  }
};

exports.handler = withFHJ(handler);
