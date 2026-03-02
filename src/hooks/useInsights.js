// src/hooks/useInsights.js
import { useEffect, useState } from "react";
import { adminFetch } from "../utils/adminFetch.js";

export default function useInsights() {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminFetch("/.netlify/functions/admin-dashboard-insights");
        const json = await res.json();
        setInsights(json.insights || null);
      } catch (err) {
        console.error("Insights failed:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { insights, loading };
}
