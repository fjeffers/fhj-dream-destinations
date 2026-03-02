// src/hooks/useConciergeMessages.js
import { useEffect, useState, useCallback } from "react";

export default function useConciergeMessages() {
  const [threads, setThreads] = useState([]); // each thread = { id, name, email, phone, message, status, source, context, created }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/.netlify/functions/admin-concierge-get");
      if (!res.ok) throw new Error("Failed to load concierge messages");
      const json = await res.json();
      setThreads(json.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error loading concierge messages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const sendReply = async (threadId, messageBody) => {
    try {
      setSaving(true);
      const res = await fetch("/.netlify/functions/admin-concierge", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: threadId, reply: messageBody }),
      });
      if (!res.ok) throw new Error("Failed to send reply");
      await fetchThreads();
    } finally {
      setSaving(false);
    }
  };

  const markResolved = async (threadId, currentStatus = "") => {
    try {
      setSaving(true);
      const newStatus = currentStatus === "Resolved" ? "New" : "Resolved";
      const res = await fetch("/.netlify/functions/admin-concierge", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: threadId, status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? { ...t, status: newStatus } : t))
      );
      return newStatus;
    } finally {
      setSaving(false);
    }
  };

  return {
    threads,
    messages: threads, // alias for backwards compatibility
    loading,
    saving,
    error,
    fetchThreads,
    sendReply,
    markResolved,
  };
}
