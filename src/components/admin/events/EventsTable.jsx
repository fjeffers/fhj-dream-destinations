// src/components/admin/events/EventsTable.jsx
import React from "react";

export default function EventsTable({ events, onEdit, onDelete, saving }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={table}>
        <thead>
          <tr style={theadRow}>
            <th style={th}>Event</th>
            <th style={th}>Client</th>
            <th style={th}>Date</th>
            <th style={th}>End</th>
            <th style={th}>Location</th>
            <th style={th}>Type</th>
            <th style={th}>Status</th>
            <th style={th}>Guests</th>
            <th style={th}>Budget</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {events.map((e) => (
            <tr key={e.id} style={tr}>
              <td style={td}>{e.eventName}</td>
              <td style={td}>{e.client}</td>
              <td style={td}>{e.eventDate}</td>
              <td style={td}>{e.endDate}</td>
              <td style={td}>{e.location}</td>
              <td style={td}>{e.eventType}</td>
              <td style={td}>{e.status}</td>
              <td style={td}>{e.guestCount}</td>
              <td style={td}>{e.budget}</td>
              <td style={td}>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button style={btn} onClick={() => onEdit(e)} disabled={saving}>
                    Edit
                  </button>
                  <button
                    style={{ ...btn, borderColor: "#ff8080", color: "#ffb3b3" }}
                    onClick={() => onDelete(e)}
                    disabled={saving}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const table = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.9rem",
};

const theadRow = {
  textAlign: "left",
  opacity: 0.8,
};

const th = {
  padding: "0.5rem 0.25rem",
  fontWeight: 500,
};

const tr = {
  borderTop: "1px solid rgba(255,255,255,0.06)",
};

const td = {
  padding: "0.5rem 0.25rem",
};

const btn = {
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.4)",
  color: "white",
  borderRadius: "999px",
  padding: "0.25rem 0.75rem",
  fontSize: "0.8rem",
  cursor: "pointer",
};
