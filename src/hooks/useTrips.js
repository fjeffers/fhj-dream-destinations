// src/hooks/useTrips.js
import { useEffect, useState, useCallback } from "react";

export default function useTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/trips");
      if (!res.ok) throw new Error("Failed to load trips");
      const json = await res.json();
      setTrips(json.trips || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error loading trips");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const createTrip = async (payload) => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create trip");
      const json = await res.json();
      setTrips((prev) => [json.trip, ...prev]);
      return json.trip;
    } finally {
      setSaving(false);
    }
  };

  const updateTrip = async (id, payload) => {
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/trips/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update trip");
      const json = await res.json();
      setTrips((prev) => prev.map((t) => (t.id === id ? json.trip : t)));
      return json.trip;
    } finally {
      setSaving(false);
    }
  };

  const deleteTrip = async (id) => {
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/trips/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete trip");
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } finally {
      setSaving(false);
    }
  };

  return {
    trips,
    loading,
    saving,
    error,
    fetchTrips,
    createTrip,
    updateTrip,
    deleteTrip,
  };
}
