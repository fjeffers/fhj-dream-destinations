// src/components/AdminCalendar.jsx
// Admin calendar UI using react-big-calendar + moment-timezone
// Upgraded to luxury glassmorphism theme

import React, { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment-timezone";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { FHJButton, fhjTheme } from "./FHJ/FHJUIKit.jsx";

// Admins will see times in America/New_York (EST / EDT).
const localizer = momentLocalizer(moment);

// ── Custom Toolbar ────────────────────────────────────────
function CustomToolbar({ label, onNavigate, onView, view }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexWrap: "wrap", gap: "0.75rem",
      padding: "0.75rem 1rem",
      background: "rgba(255,255,255,0.05)",
      borderBottom: "1px solid rgba(255,255,255,0.08)",
    }}>
      {/* Navigation */}
      <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
        <FHJButton variant="ghost" size="sm" onClick={() => onNavigate("PREV")} style={{ padding: "6px 12px" }}>‹</FHJButton>
        <FHJButton variant="ghost" size="sm" onClick={() => onNavigate("TODAY")} style={{ padding: "6px 12px" }}>Today</FHJButton>
        <FHJButton variant="ghost" size="sm" onClick={() => onNavigate("NEXT")} style={{ padding: "6px 12px" }}>›</FHJButton>
      </div>

      {/* Month/Label */}
      <span style={{ color: fhjTheme.gold, fontWeight: 700, fontSize: "1.1rem" }}>{label}</span>

      {/* View switcher */}
      <div style={{ display: "flex", gap: "0.4rem" }}>
        {["month", "week", "day"].map((v) => (
          <FHJButton
            key={v}
            variant={view === v ? "solid" : "ghost"}
            size="sm"
            onClick={() => onView(v)}
            style={{ padding: "6px 12px", textTransform: "capitalize" }}
          >
            {v}
          </FHJButton>
        ))}
      </div>
    </div>
  );
}

// ── Glassmorphism CSS overrides ───────────────────────────
const calendarStyles = `
  .rbc-calendar { background: transparent; color: #e5e7eb; }
  .rbc-header { background: rgba(255,255,255,0.05); color: #9ca3af; border-color: rgba(255,255,255,0.1); padding: 8px 0; font-weight: 600; font-size: 0.75rem; letter-spacing: 0.05em; text-transform: uppercase; }
  .rbc-month-view, .rbc-time-view, .rbc-agenda-view { border-color: rgba(255,255,255,0.08); }
  .rbc-day-bg { border-color: rgba(255,255,255,0.06); }
  .rbc-today { background: rgba(0,196,140,0.12) !important; }
  .rbc-off-range-bg { background: rgba(0,0,0,0.2); }
  .rbc-date-cell { color: #9ca3af; padding: 4px 6px; }
  .rbc-date-cell.rbc-now a { color: #00c48c; font-weight: 700; }
  .rbc-month-row { border-color: rgba(255,255,255,0.06); }
  .rbc-day-slot .rbc-time-slot { border-color: rgba(255,255,255,0.04); }
  .rbc-timeslot-group { border-color: rgba(255,255,255,0.06); }
  .rbc-time-header-content { border-color: rgba(255,255,255,0.08); }
  .rbc-time-content { border-color: rgba(255,255,255,0.08); }
  .rbc-time-gutter .rbc-timeslot-group { color: #64748b; font-size: 0.75rem; }
  .rbc-show-more { color: #00c48c; background: transparent; font-size: 0.75rem; }
  .rbc-event:focus { outline: 2px solid #D4AF37; }
  .rbc-slot-selection { background: rgba(0,196,140,0.2); }
  .rbc-selected-cell { background: rgba(0,196,140,0.1); }
  .rbc-toolbar { display: none; }
`;

export default function AdminCalendar({ onEventClick, onSlotSelect }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const start = moment().startOf("month").subtract(7, "days").toISOString();
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
          end: new Date(b.end || b.end_time || b.start),
          type: "appointment",
          raw: b,
        })),
        ...(json.blocked_slots || []).map((bl) => ({
          id: bl.id,
          title: bl.reason || "Blocked",
          start: bl.start ? new Date(bl.start) : (bl.date ? new Date(bl.date) : new Date()),
          end: bl.end_time ? new Date(bl.end_time) : (bl.date ? new Date(bl.date) : new Date()),
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

  const handleRangeChange = (range) => {
    let start, end;
    if (Array.isArray(range)) {
      start = range[0];
      end = range[range.length - 1];
    } else {
      start = range.start;
      end = range.end;
    }
    if (start && end) {
      loadEvents(
        moment(start).subtract(1, "day").toISOString(),
        moment(end).add(1, "day").toISOString()
      );
    }
  };

  return (
    <div style={{ height: "680px", position: "relative" }}>
      <style>{calendarStyles}</style>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="month"
        views={["month", "week", "day"]}
        selectable={true}
        onSelectEvent={onEventClick}
        onSelectSlot={onSlotSelect}
        onRangeChange={handleRangeChange}
        components={{ toolbar: CustomToolbar }}
        eventPropGetter={(event) => {
          const bg =
            event.type === "block" ? "#f87171" :
            event.type === "special" ? "#D4AF37" :
            "#00c48c";
          return {
            style: {
              backgroundColor: bg,
              color: event.type === "special" ? "#0f172a" : "#0f172a",
              borderRadius: "6px",
              border: "none",
              padding: "2px 6px",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
            },
          };
        }}
        dayPropGetter={(date) => {
          const isToday = moment(date).isSame(moment(), "day");
          return {
            style: {
              background: isToday ? "rgba(0,196,140,0.08)" : undefined,
            },
          };
        }}
      />
    </div>
  );
}
