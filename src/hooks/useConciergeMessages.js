// src/hooks/useConciergeMessages.js
import { useEffect, useState, useCallback } from "react";

export default function useConciergeMessages() {
  const [threads, setThreads] = useState([]); // each thread = { id, clientName, subject, status, lastMessageAt, messages: [...] }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/concierge");
      if (!res.ok) throw new Error("Failed to load concierge messages");
      const json = await res.json();
      setThreads(json.threads || []);
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
      const res = await fetch(`/api/admin/concierge/${threadId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: messageBody }),
      });
      if (!res.ok) throw new Error("Failed to send reply");
      const json = await res.json();
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? json.thread : t))
      );
      return json.thread;
    } finally {
      setSaving(false);
    }
  };

  const markResolved = async (threadId) => {
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/concierge/${threadId}/resolve`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to mark resolved");
      const json = await res.json();
      setThreads((prev) =>
        prev.map((t) => (t.id === threadId ? json.thread : t))
      );
      return json.thread;
    } finally {
      setSaving(false);
    }
  };

  return {
    threads,
    loading,
    saving,
    error,
    fetchThreads,
    sendReply,
    markResolved,
  };
}
