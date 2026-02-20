// src/hooks/useClients.js
import { useEffect, useState, useCallback } from "react";

export default function useClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/clients");
      if (!res.ok) throw new Error("Failed to load clients");
      const data = await res.json();
      setClients(data.clients || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error loading clients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const createClient = async (payload) => {
    try {
      setSaving(true);
      setError(null);
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create client");
      const data = await res.json();
      setClients((prev) => [data.client, ...prev]);
      return data.client;
    } catch (err) {
      console.error(err);
      setError(err.message || "Error creating client");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const updateClient = async (id, payload) => {
    try {
      setSaving(true);
      setError(null);
      const res = await fetch(`/api/admin/clients/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update client");
      const data = await res.json();
      setClients((prev) =>
        prev.map((c) => (c.id === id ? data.client : c))
      );
      return data.client;
    } catch (err) {
      console.error(err);
      setError(err.message || "Error updating client");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const deleteClient = async (id) => {
    try {
      setSaving(true);
      setError(null);
      const res = await fetch(`/api/admin/clients/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete client");
      setClients((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      setError(err.message || "Error deleting client");
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return {
    clients,
    loading,
    saving,
    error,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
  };
}
