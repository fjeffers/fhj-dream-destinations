// src/hooks/useDashboardStats.js
import { useEffect, useState } from "react";
import { adminFetch } from "../utils/adminFetch.js";

export default function useDashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminFetch("/.netlify/functions/admin-dashboard-stats");
        const data = await res.json();
        setStats(data.stats);
      } catch (err) {
        console.error("Dashboard stats failed:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { stats, loading };
}
