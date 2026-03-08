// ==========================================================
// 📄 FILE: admin-audit.js  (PHASE 2 — CONSOLIDATION)
// Replaces: admin-audit.js, admin-audit-get.js, admin-audit-log.js
// Location: netlify/functions/admin-audit.js
//
// Endpoints:
//   GET  — Fetch audit logs (with optional filters)
//   POST — Create a new audit entry
//
// After deploying this file, you can safely DELETE:
//   - netlify/functions/admin-audit-get.js
//   - netlify/functions/admin-audit-log.js
// ==========================================================

const {
  supabase,
  submitToAirtable,
  respond,
} = require("./utils");
const { withFHJ } = require("./middleware");

exports.handler = withFHJ(async (event) => {
  const method = event.httpMethod;

  // ============================
  // GET — Fetch Audit Logs
  // Supports filters: entityType, action, startDate, endDate, limit
  // ============================
  if (method === "GET") {
    const params = event.queryStringParameters || {};
    const { entityType, action, startDate, endDate, limit } = params;

    // Build Supabase query with chained filters
    let query = supabase.from("audit_log").select("*");

    if (entityType) query = query.eq("entity_type", entityType);
    if (action) query = query.ilike("action", `%${escapeLikePattern(action)}%`);
    if (startDate) query = query.gte("timestamp", startDate);
    if (endDate) query = query.lte("timestamp", endDate);

    query = query.order("timestamp", { ascending: false });

    if (limit) query = query.limit(Number(limit));

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    const records = data || [];

    // Normalize for frontend — handle both column naming conventions
    const logs = records.map((r) => ({
      id: r.id,
      timestamp: r.timestamp || r.created_at,
      actor: r.admin_email || r.admin || r.actor || "system",
      action: r.action || "",
      entityType: r.entity_type || r.module || "",
      entityId: r.record_id || r.entity_id || "",
      details: r.details || r.target || safeParseJSON(r.metadata),
    }));

    // Sort newest first
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return respond(200, { logs });
  }

  // ============================
  // POST — Create Audit Entry
  // Accepts both naming conventions for maximum compatibility
  // ============================
  if (method === "POST") {
    const body = JSON.parse(event.body || "{}");

    const record = await submitToAirtable("AuditLog", {
      // Support both conventions
      "Admin Email": body.email || body.actor || "system",
      "Admin Role": body.role || "",
      Action: body.action || "",
      Module: body.entityType || body.target || body.module || "",
      "Record ID": body.recordId || body.entityId || "",
      Target: body.target || "",
      Details: body.details || (body.metadata ? JSON.stringify(body.metadata) : ""),
      Timestamp: body.timestamp || new Date().toISOString(),
    });

    return respond(200, { success: true, id: record.id });
  }

  return respond(405, { error: "Method not allowed" });
});

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------
function safeParseJSON(value) {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return { raw: value };
  }
}

// Escape SQL LIKE pattern wildcards to prevent unexpected matches
function escapeLikePattern(value) {
  return String(value).replace(/[%_\\]/g, "\\$&");
}
