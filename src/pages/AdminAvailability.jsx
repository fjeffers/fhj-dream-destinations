// ✅ LOAD — reads from Supabase
const loadSlots = async () => {
  setLoading(true);
  try {
    const res = await fetch("/.netlify/functions/get-blocked-slots");
    const data = await res.json();

    // Flatten blockedDates + blockedTimes into a single slots array for the UI
    const allSlots = [];
    (data.blockedDates || []).forEach((b) => {
      allSlots.push({ id: b.id, date: b.date, block_type: "all_day", reason: b.reason });
    });
    Object.entries(data.blockedTimes || {}).forEach(([date, times]) => {
      times.forEach((t) => {
        allSlots.push({ id: t.id, date, block_type: "time", time: t.time, reason: t.reason });
      });
    });
    setSlots(allSlots);
    setHolidays(data.holidays || []);
  } catch (err) {
    console.error("Failed to load blocked slots:", err);
  } finally {
    setLoading(false);
  }
};

// ✅ ADD — posts to Supabase; one row per time slot
const handleAdd = async () => {
  if (!blockDate) return;
  setSaving(true);
  setError("");
  try {
    if (blockAllDay || blockTimes.length === 0) {
      // Single all-day block
      const res = await fetch("/.netlify/functions/get-blocked-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: blockDate, reason: blockReason || "Blocked by admin", block_type: "all_day" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Save failed");
    } else {
      // One insert per selected time slot
      for (const time of blockTimes) {
        const res = await fetch("/.netlify/functions/get-blocked-slots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: blockDate, time, reason: blockReason || "Blocked by admin", block_type: "time" }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "Save failed");
      }
    }
    setBlockDate(""); setBlockTimes([]); setBlockReason(""); setShowForm(false); setError("");
    await loadSlots();
  } catch (err) {
    setError(err.message);
  } finally {
    setSaving(false);
  }
};

// ✅ DELETE — deletes from Supabase by id query param
const handleDelete = async (id) => {
  if (!confirm("Remove this blocked slot?")) return;
  try {
    await fetch(`/.netlify/functions/get-blocked-slots?id=${id}`, { method: "DELETE" });
    await loadSlots();
  } catch (err) {
    console.error("Failed to delete:", err);
  }
};
