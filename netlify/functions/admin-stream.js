// netlify/functions/admin-stream.js
const { supabase, respond } = require('./utils');
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
    const [
      { data: bookings },
      { data: trips },
      { data: concierge },
      { data: logs },
    ] = await Promise.all([
      supabase.from("bookings").select("*"),
      supabase.from("trips").select("*"),
      supabase.from("concierge").select("*"),
      supabase.from("audit_log").select("*"),
    ]);

    const snapshot = {
      type: "snapshot",
      ts: new Date().toISOString(),
      bookings: (bookings || []).map((b) => ({
        id: b.id,
        ClientName: b.client_name,
        Email: b.client_email,
        BalanceDue: b.balance_due,
        TotalPrice: b.total_price,
        AmountPaid: b.amount_paid,
      })),
      trips: (trips || []).map((t) => ({
        id: t.id,
        ClientName: t.client,
        Destination: t.destination,
        StartDate: t.start_date,
        EndDate: t.end_date,
      })),
      concierge: (concierge || []).map((c) => ({
        id: c.id,
        Name: c.name,
        Email: c.email,
        Message: c.message,
        Resolved: c.status === "Resolved",
      })),
      activity: (logs || []).map((l) => ({
        id: l.id,
        Admin: l.admin_email,
        Action: l.action,
        Module: l.module,
        Timestamp: l.timestamp || l.created_at,
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
