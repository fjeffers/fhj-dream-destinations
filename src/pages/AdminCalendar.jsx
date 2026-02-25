// Replace the loadData function with this:
const loadData = async () => {
  setLoading(true);
  try {
    const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const endDay = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${endDay}`;

    const res = await fetch(
      `/.netlify/functions/admin-appointments?start=${startDate}&end=${endDate}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const bookings = data.bookings || [];
    const blocked = data.blocked_slots || [];

    // Normalize field names for calendar display
    const normalizedTrips = bookings.map(b => ({
      ...b,
      consultationDate: b.date || b.consultationDate || "",
      consultationTime: b.time || b.consultationTime || "",
      client: b.client || b.client_name || "Unknown",
    }));

    setTrips(normalizedTrips);
    setBlockedData({
      blockedDates: blocked.map(bs => ({
        date: bs.date || (bs.start ? bs.start.split("T")[0] : ""),
        reason: bs.reason || bs.notes || "",
      })),
      blockedTimes: {},
      holidays: [],
    });
  } catch (err) {
    console.error("Failed to load calendar data:", err);
  } finally {
    setLoading(false);
  }
};ointer", padding: "4px 12px" };
