// src/components/admin/trips/TripsTable.jsx
import React from "react";

export default function TripsTable({ trips, onEdit, onDelete, saving }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={table}>
        <thead>
          <tr style={theadRow}>
            <th style={th}>Destination</th>
            <th style={th}>Client</th>
            <th style={th}>Start</th>
            <th style={th}>End</th>
            <th style={th}>Type</th>
            <th style={th}>Status</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {trips.map((t) => (
            <tr key={t.id} style={tr}>
              <td style={td}>{t.destination}</td>
              <td style={td}>{t.client}</td>
              <td style={td}>{t.startDate}</td>
              <td style={td}>{t.endDate}</td>
              <td style={td}>{t.tripType}</td>
              <td style={td}>{t.status}</td>
              <td style={td}>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button style={btn} onClick={() => onEdit(t)} disabled={saving}>
                    Edit
                  </button>
                  <button
                    style={{ ...btn, borderColor: "#ff8080", color: "#ffb3b3" }}
                    onClick={() => onDelete(t)}
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
