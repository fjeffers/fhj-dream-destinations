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
  selectRecords,
  submitToAirtable,
  respond,
} = require("./utils");
const { withFHJAdmin } = require("./middleware");

exports.handler = withFHJAdmin(async (event) => {
  const method = event.httpMethod;

  // ============================
  // GET — Fetch Audit Logs
  // Supports filters: entityType, action, startDate, endDate, limit
  // ============================
  if (method === "GET") {
    const params = event.queryStringParameters || {};
    const { entityType, action, startDate, endDate, limit } = params;

    // Build Airtable filter formula
    const filters = [];

    if (entityType) filters.push(`{entityType} = '${entityType}'`);
    if (action) filters.push(`SEARCH('${action}', {Action})`);
    if (startDate) filters.push(`IS_AFTER({Timestamp}, '${startDate}')`);
    if (endDate) filters.push(`IS_BEFORE({Timestamp}, '${endDate}')`);

    const formula = filters.length > 0 ? `AND(${filters.join(",")})` : "";

    const records = await selectRecords("AuditLog", formula, {
      normalizer: true,
      maxRecords: limit ? Number(limit) : 200,
    });

    // Normalize for frontend — handle both column naming conventions
    const logs = records.map((r) => ({
      id: r.id,
      timestamp: r.Timestamp || r.timestamp || r.createdTime,
      actor: r.Admin || r["Admin Email"] || r.actor || "system",
      action: r.Action || r.action || "",
      entityType: r.Module || r.entityType || "",
      entityId: r["Record ID"] || r.entityId || "",
      details: r.Details || r.Target || safeParseJSON(r.metadata),
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
// Helper
// -------------------------------------------------------
function safeParseJSON(value) {
  if (!value) return {};
  try {
    return JSON.parse(value);
  } catch {
    return { raw: value };
  }
}
