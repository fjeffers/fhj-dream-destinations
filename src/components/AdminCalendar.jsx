// src/components/AdminCalendar.jsx
// Admin calendar UI using react-big-calendar + moment-timezone

import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment-timezone";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Admins will see times in America/New_York (EST / EDT).
const localizer = momentLocalizer(moment);

export default function AdminCalendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Load events for the next 60 days initially
    const start = moment().startOf("day").toISOString();
    const end = moment().add(60, "days").endOf("day").toISOString();
    loadEvents(start, end);
  }, []);

  const loadEvents = async (start, end) => {
    try {
      const res = await fetch(`/.netlify/functions/admin-appointments?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`);
      const json = await res.json();
      const items = [
        ...(json.bookings || []).map((b) => ({
          id: b.id,
          title: b.client_name ? `${b.client_name}` : "Appointment",
          start: new Date(b.start),
          end: new Date(b.end),
          type: "appointment",
          raw: b,
        })),
        ...(json.blocked_slots || []).map((bl) => ({
          id: bl.id,
          title: bl.reason || "Blocked",
          start: bl.date ? new Date(bl.date) : new Date(),
          end: bl.date ? new Date(bl.date) : new Date(),
          allDay: !!bl.all_day,
          type: "block",
          raw: bl,
        })),
      ];
      setEvents(items);
    } catch (err) {
      console.error("Failed loading events:", err);
    }
  };

  return (
    <div style={{ height: "700px" }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="month"
        views={["month", "week", "day"]}
        // Admin hours default 16:30 - 22:30 local display (this is a UI convenience)
        min={new Date(1970, 1, 1, 16, 30)}
        max={new Date(1970, 1, 1, 22, 30)}
        eventPropGetter={(event) => {
          const style = {
            backgroundColor: event.type === "block" ? "#ff6b6b" : "#16a34a",
            color: "white",
            borderRadius: "6px",
            border: "none",
            padding: "2px 6px",
            fontSize: "0.9rem",
          };
          return { style };
        }}
      />
    </div>
  );
}
