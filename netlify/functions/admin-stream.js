// netlify/functions/admin-stream.js
const { selectRecords } = require("./utils");
const { withFHJ } = require("./middleware");

const handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    const [bookings, trips, concierge, logs] = await Promise.all([
      selectRecords("Bookings"),
      selectRecords("Trips"),
      selectRecords("Concierge"),
      selectRecords("AuditLog"),
    ]);

    const snapshot = {
      type: "snapshot",
      ts: new Date().toISOString(),
      bookings: bookings.map((b) => ({
        id: b.id,
        ClientName: b.client_name,
        Email: b.email,
        BalanceDue: b.balance_due,
        TotalPrice: b.total_price,
        AmountPaid: b.amount_paid,
      })),
      trips: trips.map((t) => ({
        id: t.id,
        ClientName: t.client_name,
        Destination: t.destination,
        StartDate: t.start_date,
        EndDate: t.end_date,
      })),
      concierge: concierge.map((c) => ({
        id: c.id,
        Name: c.name,
        Email: c.email,
        Message: c.message,
        Resolved: c.resolved,
      })),
      activity: logs.map((l) => ({
        id: l.id,
        Admin: l.admin,
        Action: l.action,
        Module: l.module,
        Timestamp: l.timestamp,
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
