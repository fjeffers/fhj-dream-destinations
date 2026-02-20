// ==========================================================
// 📄 FILE: AdminEventRSVPs.jsx (INTEGRATED)
// View and manage RSVPs - works with your existing RSVP component
// Location: src/components/admin/events/AdminEventRSVPs.jsx
// ==========================================================

import React, { useState, useEffect } from "react";
import { FHJCard, FHJButton, fhjTheme } from "../../FHJ/FHJUIKit.jsx";
import FHJDataTable from "../../FHJ/FHJDataTable.jsx";
import FHJSkeleton from "../../FHJ/FHJSkeleton.jsx";
import { useToast } from "../../FHJ/FHJToast.jsx";

export default function AdminEventRSVPs({ eventId, eventName, onClose }) {
  const toast = useToast();
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const loadRSVPs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/.netlify/functions/rsvp?eventId=${eventId}`);
      const data = await res.json();
      setRsvps(data.rsvps || []);
    } catch (err) {
      toast.error("Failed to load RSVPs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRSVPs();
  }, [eventId]);

  const handleDelete = async (rsvp) => {
    if (!window.confirm(`Remove RSVP from ${rsvp.name}?`)) return;
    
    setDeleting(true);
    try {
      await fetch("/.netlify/functions/rsvp", {
        method: "DELETE",
        body: JSON.stringify({ id: rsvp.id }),
      });
      toast.success("RSVP deleted");
      loadRSVPs();
    } catch (err) {
      toast.error("Failed to delete RSVP");
    } finally {
      setDeleting(false);
    }
  };

  const copyRSVPLink = () => {
    const link = `${window.location.origin}/rsvp/${eventId}`;
    navigator.clipboard.writeText(link);
    toast.success("RSVP link copied to clipboard!");
  };

  const exportCSV = () => {
    const headers = [
      "Name", 
      "Email", 
      "Phone", 
      "Status", 
      "Guest Count", 
      "Dietary Restrictions", 
      "Notes", 
      "QR Code",
      "RSVP Date"
    ];
    
    const rows = rsvps.map((r) => [
      r.name || "",
      r.email || "",
      r.phone || "",
      r.status || (r.attending ? "Attending" : "Not Attending"),
      r.guestCount || r.guests || "",
      r.dietaryRestrictions || "",
      r.notes || "",
      r.qrPayload || "",
      r.rsvpDate || r.createdTime || "",
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rsvps-${eventName.replace(/\s+/g, "-")}.csv`;
    a.click();
  };

  const downloadQRCodes = () => {
    // Create a simple HTML page with all QR codes for printing
    const qrHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Codes - ${eventName}</title>
        <style>
          body { font-family: Arial; padding: 20px; }
          .qr-item { 
            display: inline-block; 
            margin: 20px; 
            text-align: center;
            page-break-inside: avoid;
          }
          .qr-item img { width: 200px; height: 200px; }
          .qr-item p { margin: 5px 0; font-weight: bold; }
          @media print { 
            .qr-item { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <h1>${eventName} - Guest QR Codes</h1>
        ${rsvps
          .filter(r => r.qrPayload && (r.status === "Attending" || r.attending))
          .map(r => `
            <div class="qr-item">
              <p>${r.name}</p>
              <p>Guests: ${r.guestCount || r.guests || 1}</p>
              <div id="qr-${r.id}"></div>
            </div>
          `)
          .join("")}
        <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
        <script>
          ${rsvps
            .filter(r => r.qrPayload && (r.status === "Attending" || r.attending))
            .map(r => `
              QRCode.toCanvas(document.getElementById('qr-${r.id}'), '${r.qrPayload}', { width: 200 });
            `)
            .join("\n")}
        </script>
      </body>
      </html>
    `;
    
    const blob = new Blob([qrHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const columns = [
    { key: "name", label: "Name", cellStyle: { fontWeight: 600 } },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <span
          style={{
            padding: "0.25rem 0.65rem",
            borderRadius: "20px",
            fontSize: "0.8rem",
            fontWeight: 600,
            background:
              val === "Attending"
                ? "rgba(74,222,128,0.15)"
                : val === "Not Attending"
                ? "rgba(248,113,113,0.15)"
                : "rgba(251,191,36,0.15)",
            color:
              val === "Attending"
                ? "#4ade80"
                : val === "Not Attending"
                ? "#f87171"
                : "#fbbf24",
          }}
        >
          {val || "—"}
        </span>
      ),
    },
    { key: "guestCount", label: "Guests" },
    { key: "dietaryRestrictions", label: "Dietary Needs" },
    {
      key: "qrPayload",
      label: "QR",
      render: (val) => val ? "✓" : "—",
    },
  ];

  const tableData = rsvps.map((r) => ({
    id: r.id,
    name: r.name || r.Name || "—",
    email: r.email || r.Email || "—",
    phone: r.phone || r.Phone || "—",
    status: r.status || r.Status || (r.attending || r.Attending ? "Attending" : "Not Attending"),
    guestCount: r.guestCount || r.GuestCount || r["Guest Count"] || r.guests || "—",
    dietaryRestrictions: r.dietaryRestrictions || r.DietaryRestrictions || r["Dietary Restrictions"] || "—",
    notes: r.notes || r.Notes || "",
    qrPayload: r.qrPayload || r.QRPayload || r["QR Payload"] || "",
    rsvpDate: r.rsvpDate || r.RSVPDate || r.createdTime || "",
  }));

  const stats = {
    total: rsvps.length,
    attending: rsvps.filter((r) => {
      const status = r.status || r.Status;
      const attending = r.attending || r.Attending;
      return status === "Attending" || attending === true;
    }).length,
    notAttending: rsvps.filter((r) => {
      const status = r.status || r.Status;
      return status === "Not Attending";
    }).length,
    maybe: rsvps.filter((r) => {
      const status = r.status || r.Status;
      return status === "Maybe";
    }).length,
    totalGuests: rsvps
      .filter((r) => {
        const status = r.status || r.Status;
        const attending = r.attending || r.Attending;
        return status === "Attending" || attending === true;
      })
      .reduce((sum, r) => {
        const count = r.guestCount || r.GuestCount || r["Guest Count"] || r.guests || 0;
        return sum + Number(count);
      }, 0),
    withQR: rsvps.filter(r => r.qrPayload || r.QRPayload || r["QR Payload"]).length,
  };

  return (
    <div style={backdrop}>
      <div style={modal}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ color: fhjTheme.colors.accent, margin: 0 }}>RSVPs</h2>
            <div style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "0.25rem" }}>{eventName}</div>
          </div>
          <button onClick={onClose} style={closeButton}>
            ✕
          </button>
        </div>

        {/* Stats Row */}
        <div style={statsContainer}>
          <div style={statCard}>
            <div style={statLabel}>Total RSVPs</div>
            <div style={statValue}>{stats.total}</div>
          </div>
          <div style={{ ...statCard, borderColor: "#4ade80" }}>
            <div style={statLabel}>Attending</div>
            <div style={{ ...statValue, color: "#4ade80" }}>{stats.attending}</div>
          </div>
          <div style={{ ...statCard, borderColor: "#f87171" }}>
            <div style={statLabel}>Not Attending</div>
            <div style={{ ...statValue, color: "#f87171" }}>{stats.notAttending}</div>
          </div>
          <div style={{ ...statCard, borderColor: "#fbbf24" }}>
            <div style={statLabel}>Maybe</div>
            <div style={{ ...statValue, color: "#fbbf24" }}>{stats.maybe}</div>
          </div>
          <div style={{ ...statCard, borderColor: fhjTheme.colors.accent }}>
            <div style={statLabel}>Total Guests</div>
            <div style={{ ...statValue, color: fhjTheme.colors.accent }}>{stats.totalGuests}</div>
          </div>
          <div style={{ ...statCard, borderColor: "#a78bfa" }}>
            <div style={statLabel}>With QR Code</div>
            <div style={{ ...statValue, color: "#a78bfa" }}>{stats.withQR}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <FHJButton onClick={copyRSVPLink} style={{ flex: "1 1 200px" }}>
            📋 Copy RSVP Link
          </FHJButton>
          <FHJButton onClick={exportCSV} disabled={rsvps.length === 0} style={{ flex: "1 1 200px" }}>
            📥 Export CSV
          </FHJButton>
          <FHJButton 
            onClick={downloadQRCodes} 
            disabled={stats.withQR === 0}
            style={{ flex: "1 1 200px" }}
          >
            🎫 Print QR Codes ({stats.withQR})
          </FHJButton>
        </div>

        {/* RSVP Table */}
        {loading ? (
          <FHJSkeleton variant="table" rows={5} cols={7} />
        ) : (
          <div style={{ maxHeight: "500px", overflowY: "auto" }}>
            <FHJDataTable
              columns={columns}
              data={tableData}
              onDelete={handleDelete}
              loading={false}
              saving={deleting}
              emptyMessage="No RSVPs yet. Share the RSVP link with your guests!"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Styles
const backdrop = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 50,
  padding: "2rem",
  overflowY: "auto",
};

const modal = {
  width: "100%",
  maxWidth: "1200px",
  background: "rgba(10,10,20,0.98)",
  borderRadius: "16px",
  padding: "2rem",
  border: "1px solid rgba(255,255,255,0.12)",
  boxShadow: "0 25px 50px rgba(0,0,0,0.8)",
  maxHeight: "90vh",
  overflowY: "auto",
};

const closeButton = {
  background: "transparent",
  border: "none",
  color: "#94a3b8",
  fontSize: "1.5rem",
  cursor: "pointer",
  padding: "0.25rem 0.5rem",
  borderRadius: "4px",
  transition: "color 0.2s",
};

const statsContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
  gap: "1rem",
  marginBottom: "1.5rem",
};

const statCard = {
  background: "rgba(20,30,48,0.5)",
  border: "2px solid rgba(255,255,255,0.1)",
  borderRadius: "12px",
  padding: "1rem",
  textAlign: "center",
};

const statLabel = {
  fontSize: "0.7rem",
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "0.5rem",
};

const statValue = {
  fontSize: "2rem",
  fontWeight: 700,
  color: "#e2e8f0",
};