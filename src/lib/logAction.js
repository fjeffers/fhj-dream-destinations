// netlify/functions/admin-log.js
const { submitToAirtable, respond } = require('./utils');
const { withFHJ } = require('./middleware');

exports.handler = withFHJ(async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return respond(405, { error: "Method Not Allowed" });
  }

  try {
    // Parse the data sent from your logAction frontend function
    const data = JSON.parse(event.body || "{}");
    const { email, role, action, target, recordId } = data;

    // Validate we have at least an email and an action
    if (!email || !action) {
      return respond(400, { error: "Missing required logging fields" });
    }

    // Submit to AuditLog table via Supabase
    await submitToAirtable("AuditLog", {
      "Admin Email": email,
      "Role": role || "Admin",
      "Action": action,
      "Target": target || "",
      "Record ID": recordId || "",
    });

    return respond(200, { success: true });

  } catch (error) {
    console.error("Failed to write to Audit Log:", error);
    // Even if logging fails, we return a 200 so it doesn't crash the frontend user experience
    return respond(200, { success: false, note: "Logging failed quietly" });
  }
});