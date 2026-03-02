// src/hooks/useTripsMonthly.js
import { useEffect, useState } from "react";
import { adminFetch } from "../utils/adminFetch.js";

export default function useTripsMonthly() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await adminFetch("/.netlify/functions/admin-dashboard-trips-monthly");
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
