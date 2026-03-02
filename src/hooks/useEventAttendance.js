// src/hooks/useEventAttendance.js
import { useEffect, useState } from "react";
import { adminFetch } from "../utils/adminFetch.js";

export default function useEventAttendance() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          "/.netlify/functions/admin-dashboard-event-attendance"
        );
        const json = await res.json();
        setData(json.data || []);
      } catch (err) {
        console.error("Event attendance failed:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return { data, loading };
}
