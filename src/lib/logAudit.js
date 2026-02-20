// src/lib/logAudit.js
export async function logAudit(action, payload = {}) {
  try {
    await fetch("/api/admin/audit-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        ...payload,
      }),
    });
  } catch (err) {
    console.error("Audit log failed:", err);
  }
}
