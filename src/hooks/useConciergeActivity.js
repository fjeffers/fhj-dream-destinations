// src/hooks/useConciergeActivity.js
import { useEffect, useState } from "react";

export default function useConciergeActivity() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          "/.netlify/functions/admin-dashboard-concierge-activity"
        );
        const json = await res.json();
        setData(json.data || []);
      } catch (err) {
        console.error("Concierge activity failed:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { data, loading };
}
