// ==========================================================
// FILE: admin-appointments.js — Admin Booking CRUD
// Location: netlify/functions/admin-appointments.js
//
// GET    ?start=ISO&end=ISO  → returns bookings + blocked_slots
// POST   { start, end, client_name, client_email, ... } → create
// PUT    { id, ...updates } → update
// DELETE ?id=X              → delete
// ==========================================================

const { supabase, respond } = require("./utils");
const {
  sendEmail,
  ADMIN_EMAIL,
  appointmentClientEmail,
  appointmentAdminEmail,
} = require("./email-utils");

/**
 * Returns 'end_time' if that column exists in bookings, otherwise 'end'.
 */
async function getEndColumn() {
  try {
    const { data, error } = await supabase
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_schema", "public")
      .eq("table_name", "bookings");

    if (error) {
      console.warn("information_schema query error:", error);
      return "end_time"; // fallback
    }

    const cols = (data || []).map((c) => c.column_name);
    if (cols.includes("end_time")) return "end_time";
    if (cols.includes("end")) return "end";
    return "end_time";
  } catch (err) {
    console.warn("getEndColumn failed:", err);
    return "end_time";
  }
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return respond(200, {});

  try {
    const method = event.httpMethod;
    const endCol = await getEndColumn();

    // ── GET ─────────────────────────────────────────────────────
    if (method === "GET") {
      const { start, end } = event.queryStringParameters || {};
      if (!start || !end) return respond(400, { error: "start and end required" });

      const { data: bookings, error: bErr } = await supabase
        .from("bookings")
        .select("*")
        .lt("start", end)
        .gt(endCol, start);

      if (bErr) throw bErr;

      const { data: blocks, error: blErr } = await supabase
        .from("blocked_slots")
        .select("*")
        .lt("start", end)
        .gt("end_time", start);

      if (blErr) {
        console.warn("blocked_slots fetch error (ignored):", blErr);
      }

      const bookingsMapped = (bookings || []).map((b) => ({
        ...b,
        end: b[endCol] || b.end_time || b.end,
      }));

      return respond(200, { bookings: bookingsMapped, blocked_slots: blocks || [] });
    }

    // ── POST ─────────────────────────────────────────────────────
    if (method === "POST") {
      const payload = JSON.parse(event.body || "{}");
      const {
        start, end,
        client_id, client_name, client_email, client_phone,
        deal_id, notes, type = "appointment",
      } = payload;

      if (!start || !end) return respond(400, { error: "start and end required" });

      // Conflict check
      const { data: conflicts, error: cErr } = await supabase
        .from("bookings")
        .select("*")
        .lt("start", end)
        .gt(endCol, start);

      if (cErr) throw cErr;
      if (conflicts && conflicts.length > 0) {
        return respond(409, { error: "Conflict with existing booking.", conflicts });
      }

      const insertObj = {
        client_id: client_id || null,
        client_name: client_name || null,
        client_email: client_email || null,
        client_phone: client_phone || null,
        start,
        type,
        deal_id: deal_id || null,
        notes: notes || null,
        status: "confirmed",
        created_at: new Date().toISOString(),
      };
      insertObj[endCol] = end;

      const { data: created, error: iErr } = await supabase
        .from("bookings")
        .insert([insertObj])
        .select()
        .single();
      if (iErr) throw iErr;

      const createdMapped = { ...created, end: created[endCol] || created.end_time || created.end };

      // Send confirmation emails if client email is provided and it's an appointment
      if (client_email && type !== "block") {
        const dateStr = start.split("T")[0];
        const timeStr = (() => {
          const t = start.split("T")[1] || "";
          const [hh, mm] = t.split(":");
          const h = parseInt(hh);
          const ampm = h < 12 ? "AM" : "PM";
          const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
          return `${h12}:${mm} ${ampm}`;
        })();

        try {
          await sendEmail({
            to: client_email,
            subject: "Appointment Confirmed — FHJ Dream Destinations",
            html: appointmentClientEmail({
              clientName: client_name || "Valued Client",
              date: dateStr,
              time: timeStr,
              reason: "consultation",
              destination: "",
            }),
          });
        } catch (e) {
          console.warn("Client confirmation email failed (non-fatal):", e.message);
        }

        try {
          await sendEmail({
            to: [ADMIN_EMAIL, "chjeffers20@gmail.com"],
            subject: `New Appointment: ${client_name || "Client"} — ${dateStr} at ${timeStr}`,
            html: appointmentAdminEmail({
              clientName: client_name || "Unknown",
              clientEmail: client_email,
              clientPhone: client_phone || "",
              date: dateStr,
              time: timeStr,
              reason: "consultation",
              destination: "",
              notes: notes || "",
            }),
          });
        } catch (e) {
          console.warn("Admin notification email failed (non-fatal):", e.message);
        }
      }

      return respond(201, { booking: createdMapped });
    }

    // ── PUT ──────────────────────────────────────────────────────
    if (method === "PUT") {
      const payload = JSON.parse(event.body || "{}");
      const { id, ...updates } = payload;
      if (!id) return respond(400, { error: "id required" });

      if (updates.end) {
        updates[endCol] = updates.end;
        delete updates.end;
      }

      const { data, error } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;

      const mapped = { ...data, end: data[endCol] || data.end_time || data.end };
      return respond(200, { booking: mapped });
    }

    // ── DELETE ───────────────────────────────────────────────────
    if (method === "DELETE") {
      const { id } = event.queryStringParameters || {};
      if (!id) return respond(400, { error: "id required" });

      const { data, error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;

      return respond(200, { deleted: data });
    }

    return respond(405, { error: "Method not allowed" });
  } catch (err) {
    console.error("admin-appointments error:", err);
    return respond(500, { error: err.message || String(err) });
  }
};
