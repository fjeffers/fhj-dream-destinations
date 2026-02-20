// src/hooks/useTripsMonthly.js
import { useEffect, useState } from "react";

export default function useTripsMonthly() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/.netlify/functions/admin-dashboard-trips-monthly");
        const json = await res.json();
        setData(json.data || []);
      } catch (err) {
        console.error("Trips monthly failed:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { data, loading };
}
