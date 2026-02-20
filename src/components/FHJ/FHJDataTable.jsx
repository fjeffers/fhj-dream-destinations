// ==========================================================
// 📄 FILE: FHJDataTable.jsx  (PHASE 2 — CONSOLIDATION)
// Replaces: TripsTable.jsx, EventsTable.jsx
// Location: src/components/FHJ/FHJDataTable.jsx
//
// Usage:
//   <FHJDataTable
//     columns={[
//       { key: "destination", label: "Destination" },
//       { key: "client", label: "Client" },
//       { key: "startDate", label: "Start" },
//       { key: "status", label: "Status", render: (val) => <StatusBadge status={val} /> },
//     ]}
//     data={trips}
//     onEdit={(row) => openEditModal(row)}
//     onDelete={(row) => handleDelete(row)}
//     loading={loading}
//     saving={saving}
//     emptyMessage="No trips found."
//     editDisabled={isAssistant}
//   />
// ==========================================================

import React from "react";

export default function FHJDataTable({
  columns = [],
  data = [],
  onEdit = null,
  onDelete = null,
  loading = false,
  saving = false,
  emptyMessage = "No records found.",
  editDisabled = false,
}) {
  // Show actions column if handlers are provided
  const showActions = onEdit || onDelete;

  if (loading) {
    return (
      <div style={loadingStyle}>
        <div style={shimmerRow} />
        <div style={shimmerRow} />
        <div style={shimmerRow} />
        <div style={shimmerRow} />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={emptyStyle}>
        <p style={{ opacity: 0.6, margin: 0 }}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={tableStyle}>
        <thead>
          <tr style={theadRowStyle}>
            {columns.map((col) => (
              <th key={col.key} style={{ ...thStyle, ...(col.headerStyle || {}) }}>
                {col.label}
              </th>
            ))}
            {showActions && <th style={thStyle}>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex} style={trStyle}>
              {columns.map((col) => (
                <td key={col.key} style={{ ...tdStyle, ...(col.cellStyle || {}) }}>
                  {col.render
                    ? col.render(row[col.key], row)
                    : row[col.key] ?? "—"}
                </td>
              ))}

              {showActions && (
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {onEdit && (
                      <button
                        style={actionBtn}
                        onClick={() => onEdit(row)}
                        disabled={saving || editDisabled}
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        style={{ ...actionBtn, borderColor: "#ff8080", color: "#ffb3b3" }}
                        onClick={() => onDelete(row)}
                        disabled={saving || editDisabled}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// -------------------------------------------------------
// Styles
// -------------------------------------------------------
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.9rem",
};

const theadRowStyle = {
  textAlign: "left",
  opacity: 0.8,
};

const thStyle = {
  padding: "0.75rem 0.5rem",
  fontWeight: 600,
  fontSize: "0.8rem",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: "#94a3b8",
  borderBottom: "1px solid rgba(255,255,255,0.1)",
};

const trStyle = {
  borderTop: "1px solid rgba(255,255,255,0.06)",
  transition: "background 0.15s ease",
};

const tdStyle = {
  padding: "0.75rem 0.5rem",
  color: "#e5e7eb",
};

const actionBtn = {
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.3)",
  color: "white",
  borderRadius: "999px",
  padding: "0.3rem 0.85rem",
  fontSize: "0.8rem",
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const loadingStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  padding: "1rem 0",
};

const shimmerRow = {
  height: "48px",
  borderRadius: "8px",
  background: "linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
};

const emptyStyle = {
  padding: "2rem",
  textAlign: "center",
  color: "#94a3b8",
  background: "rgba(255,255,255,0.03)",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.05)",
};

// Inject shimmer keyframes
if (typeof document !== "undefined") {
  const styleId = "fhj-table-shimmer";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `;
    document.head.appendChild(style);
  }
}
