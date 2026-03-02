import { useState, useEffect, useCallback } from "react";
import { adminFetch } from "../utils/adminFetch.js";

export default function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminFetch("/.netlify/functions/admin-events");
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      setEvents(data.events || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Could not load events.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (eventData) => {
    setSaving(true);
    try {
      await adminFetch("/.netlify/functions/admin-events", {
        method: "POST",
        body: JSON.stringify(eventData),
      });
      await fetchEvents();
    } catch (err) {
      setError("Failed to create event.");
    } finally {
      setSaving(false);
    }
  };

  const updateEvent = async (id, updates) => {
    setSaving(true);
    try {
      await adminFetch("/.netlify/functions/admin-events", {
        method: "PUT",
        body: JSON.stringify({ id, ...updates }),
      });
      await fetchEvents();
    } catch (err) {
      setError("Failed to update event.");
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = async (id) => {
    setSaving(true);
    try {
      await adminFetch("/.netlify/functions/admin-events", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      await fetchEvents();
    } catch (err) {
      setError("Failed to delete event.");
    } finally {
      setSaving(false);
    }
  };

  return {
    events,
    loading,
    saving,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refresh: fetchEvents
  };
}