// src/hooks/useAuditLog.js
import { useState, useEffect, useCallback } from "react";

export default function useAuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Initialize filters
  const [filters, setFilters] = useState({
    entityType: "",
    action: "",
    startDate: "",
    endDate: ""
  });

  // The Fetch Logic
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      // Convert filters object to URL query string
      // e.g. ?entityType=client&action=created
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const res = await fetch(`/.netlify/functions/admin-audit?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err) {
      console.error("Audit Log Error:", err);
      setLogs([]); // Clear logs on error or keep previous?
    } finally {
      setLoading(false);
    }
  }, [filters]); // Re-create function if filters change

  // Initial Load
  useEffect(() => {
    fetchLogs();
    // We only want to load once on mount. 
    // Subsequent updates happen when user clicks "Apply Filters" (which calls refresh)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    logs,
    loading,
    filters,
    setFilters,
    refresh: fetchLogs
  };
}