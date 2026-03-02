// src/hooks/useClientGrowth.js
import { useEffect, useState } from "react";
import { adminFetch } from "../utils/adminFetch.js";

export default function useClientGrowth() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          "/.netlify/functions/admin-dashboard-client-growth"
        );
        const json = await res.json();
        setData(json.data || []);
      } catch (err) {
        console.error("Client growth failed:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { data, loading };
}
