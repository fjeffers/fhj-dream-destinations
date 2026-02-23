// ==========================================================
// FILE: AdminCalendar.jsx
// Full calendar view of all appointments + blocked slots
// Location: src/pages/AdminCalendar.jsx
// ==========================================================

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment-timezone";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { fhjTheme } from "../components/FHJ/FHJUIKit.jsx";

const localizer = momentLocalizer(moment);

export default function AdminCalendar() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [fetchRange, setFetchRange] = useState(() => {
    const start = moment().startOf("month").toISOString();
    const end = moment().endOf("month").toISOString();
    return { start, end };
  });

  const loadEvents = useCallback(async (start, end) => {
    try {
      const res = await fetch(
        `/.netlify/functions/admin-appointments?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
      );
      const json = await res.json();
      const items = [
        ...(json.bookings || []).map((b) => ({
          title: b.client_name || "Appointment",
          start: new Date(b.start),
          end: new Date(b.end),
          type: "appointment",
          raw: b,
        })),
        ...(json.blocked_slots || []).map((bl) => {
          const startDate = new Date(bl.date || bl.start);
          let endDate = new Date(bl.date || bl.end || bl.start);
          if (bl.all_day && endDate <= startDate) {
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
          }
          return {
            title: bl.reason || "Blocked",
            start: startDate,
            end: endDate,
            allDay: !!bl.all_day,
            type: "block",
            raw: bl,
          };
        }),
      ];
      setEvents(items);
    } catch (err) {
      console.error("Failed loading events:", err);
    }
  }, []);

  useEffect(() => {
    loadEvents(fetchRange.start, fetchRange.end);
  }, [fetchRange, loadEvents]);

  const handleNavigate = useCallback((date, view) => {
    const unit = view === "day" ? "day" : view === "week" ? "week" : "month";
    const start = moment(date).startOf(unit).toISOString();
    const end = moment(date).endOf(unit).toISOString();
    setFetchRange({ start, end });
  }, []);

  const handleRangeChange = useCallback((range) => {
    let start, end;
    if (Array.isArray(range)) {
      start = moment(range[0]).startOf("day").toISOString();
      end = moment(range[range.length - 1]).endOf("day").toISOString();
    } else {
      start = moment(range.start).toISOString();
      end = moment(range.end).toISOString();
    }
    setFetchRange({ start, end });
  }, []);

  const eventPropGetter = useCallback((event) => ({
    style: {
      backgroundColor: event.type === "block" ? "#ef4444" : "#16a34a",
      color: "white",
      borderRadius: "6px",
      border: "none",
      padding: "2px 6px",
      fontSize: "0.85rem",
    },
  }), []);

  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h2 style={{ color: fhjTheme.gold, marginBottom: "0.25rem" }}>Appointments Calendar</h2>
      <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginBottom: "1.5rem", marginTop: 0 }}>
        Times displayed in your local timezone.
      </p>

      <div style={{ height: "700px" }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="month"
          views={["month", "week", "day"]}
          onNavigate={handleNavigate}
          onRangeChange={handleRangeChange}
          eventPropGetter={eventPropGetter}
          onSelectEvent={handleSelectEvent}
        />
      </div>

      {selectedEvent && (
        <div style={{
          marginTop: "1.5rem",
          padding: "1rem 1.5rem",
          borderRadius: "12px",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "#e5e7eb",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <strong style={{ fontSize: "1rem", color: "white" }}>{selectedEvent.title}</strong>
            <button
              onClick={() => setSelectedEvent(null)}
              style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "1.1rem" }}
            >
              ✕
            </button>
          </div>
          <p style={{ margin: "0.25rem 0", fontSize: "0.85rem" }}>
            <span style={{ color: "#94a3b8" }}>Start:</span>{" "}
            {selectedEvent.start.toLocaleString()}
          </p>
          <p style={{ margin: "0.25rem 0", fontSize: "0.85rem" }}>
            <span style={{ color: "#94a3b8" }}>End:</span>{" "}
            {selectedEvent.end.toLocaleString()}
          </p>
          <p style={{ margin: "0.25rem 0", fontSize: "0.85rem" }}>
            <span style={{ color: "#94a3b8" }}>Type:</span>{" "}
            <span style={{ color: selectedEvent.type === "block" ? "#ef4444" : "#16a34a", fontWeight: 600 }}>
              {selectedEvent.type === "block" ? "Blocked" : "Appointment"}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}