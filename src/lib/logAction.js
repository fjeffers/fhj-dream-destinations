// src/lib/logAction.js
// Frontend helper — sends an audit log entry to the backend
export async function logAction({ email, role, action, target, recordId } = {}) {
  try {
    await fetch("/.netlify/functions/admin-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role, action, target, recordId }),
    });
  } catch (err) {
    console.error("logAction failed:", err);
  }
}