import React, { useState, useEffect } from "react";
import {
  FHJCard,
  FHJButton,
  FHJInput,
  fhjTheme,
} from "../components/FHJ/FHJUIKit.jsx";

const DOC_TYPES = ["Contract", "Invoice", "Itinerary", "Insurance", "Passport", "Visa", "Other"];

function getEmptyForm() {
  return { name: "", url: "", type: "Other", clientEmail: "" };
}

export default function AdminDocuments({ admin }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(getEmptyForm());
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isAssistant = (admin?.role || admin?.Role) === "Assistant";

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/.netlify/functions/admin-documents");
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch {
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDocuments(); }, []);

  const handleFieldChange = (key, val) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setError("");
  };

  const handleEdit = (doc) => {
    setEditing(doc);
    setForm({ name: doc.name, url: doc.url, type: doc.type || "Other", clientEmail: doc.clientEmail || "" });
    setFile(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditing(null);
    setForm(getEmptyForm());
    setFile(null);
    setError("");
  };

  const handleSave = async () => {
    if (isAssistant) return;
    if (!form.name.trim()) { setError("Document name is required"); return; }

    setSaving(true);
    setError("");

    try {
      let finalUrl = form.url;

      // If a new file was chosen, upload it first to Supabase Storage
      if (file) {
        setUploadProgress("Uploading file…");
        const ext = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
        const fd = new FormData();
        fd.append("file", file);
        fd.append("fileName", fileName);
        fd.append("bucket", "documents");

        const upRes = await fetch("/.netlify/functions/upload-image", {
          method: "POST",
          body: fd,
        });
        const upData = await upRes.json();
        if (!upRes.ok || !upData.url) throw new Error(upData.error || "File upload failed");
        finalUrl = upData.url;
        setUploadProgress("");
      }

      if (!finalUrl) { setError("Please provide a URL or upload a file"); setSaving(false); return; }

      const method = editing ? "PUT" : "POST";
      const body = editing
        ? { id: editing.id, name: form.name, url: finalUrl, type: form.type, clientEmail: form.clientEmail }
        : { name: form.name, url: finalUrl, type: form.type, clientEmail: form.clientEmail };

      const res = await fetch("/.netlify/functions/admin-documents", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setSuccess(editing ? "Document updated!" : "Document saved!");
      handleCancel();
      loadDocuments();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
      setUploadProgress("");
    }
  };

  const handleDelete = async (id) => {
    if (isAssistant || !window.confirm("Delete this document?")) return;
    try {
      const res = await fetch("/.netlify/functions/admin-documents", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setSuccess("Document deleted.");
      loadDocuments();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <FHJCard style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h2 style={{ margin: 0, color: "white" }}>Documents</h2>
        {!isAssistant && (
          <FHJButton onClick={() => { setShowForm(true); setEditing(null); setForm(getEmptyForm()); }}>
            + Add Document
          </FHJButton>
        )}
      </div>

      {isAssistant && (
        <p style={{ opacity: 0.7, marginBottom: "1rem" }}>
          You have <strong>view-only</strong> access. Adding, editing and deleting are disabled.
        </p>
      )}

      {success && (
        <div style={{ background: "rgba(0,196,140,0.1)", border: "1px solid rgba(0,196,140,0.3)", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem", color: "#00c48c" }}>
          {success}
        </div>
      )}
      {error && (
        <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "1rem", color: "#f87171" }}>
          {error}
        </div>
      )}

      {/* ADD / EDIT FORM */}
      {showForm && (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3 style={{ color: "white", marginTop: 0, marginBottom: "1rem" }}>
            {editing ? "Edit Document" : "New Document"}
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <FHJInput
              label="Document Name *"
              value={form.name}
              onChange={(e) => handleFieldChange("name", e.target.value)}
              placeholder="e.g. Travel Insurance PDF"
            />

            <div>
              <label style={labelStyle}>Document Type</label>
              <select
                value={form.type}
                onChange={(e) => handleFieldChange("type", e.target.value)}
                style={selectStyle}
              >
                {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <FHJInput
              label="Client Email (optional)"
              value={form.clientEmail}
              onChange={(e) => handleFieldChange("clientEmail", e.target.value)}
              placeholder="client@example.com"
              type="email"
            />

            <div>
              <label style={labelStyle}>URL (paste link or upload a file below)</label>
              <FHJInput
                value={form.url}
                onChange={(e) => handleFieldChange("url", e.target.value)}
                placeholder="https://… or leave blank to upload"
              />
            </div>
          </div>

          {/* File upload */}
          <div style={{ marginTop: "1rem" }}>
            <label style={labelStyle}>Upload File (replaces URL above)</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem" }}
            />
            {file && <p style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "0.25rem" }}>{file.name}</p>}
            {uploadProgress && <p style={{ color: "#D4AF37", fontSize: "0.8rem", marginTop: "0.25rem" }}>{uploadProgress}</p>}
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem" }}>
            <FHJButton onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editing ? "Update Document" : "Save Document"}
            </FHJButton>
            <FHJButton variant="ghost" onClick={handleCancel}>
              Cancel
            </FHJButton>
          </div>
        </div>
      )}

      {/* DOCUMENT LIST */}
      {loading ? (
        <p style={{ color: "rgba(255,255,255,0.5)" }}>Loading documents…</p>
      ) : documents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
          <p style={{ fontSize: "2rem" }}>📄</p>
          <p>No documents yet. Click + Add Document to get started.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {documents.map((doc) => (
            <div
              key={doc.id}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.75rem 1rem", borderRadius: 10,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: "white", fontWeight: 500, margin: 0, fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {doc.name || "Untitled"}
                </p>
                <p style={{ color: "#64748b", margin: "0.15rem 0 0", fontSize: "0.75rem" }}>
                  {doc.type || "Other"}{doc.clientEmail ? ` · ${doc.clientEmail}` : ""}
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.5rem", marginLeft: "1rem", flexShrink: 0 }}>
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...btnStyle, textDecoration: "none", color: fhjTheme.colors?.accent || "#D4AF37" }}
                >
                  View
                </a>
                {!isAssistant && (
                  <>
                    <button onClick={() => handleEdit(doc)} style={btnStyle}>Edit</button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      style={{ ...btnStyle, color: "#f87171", borderColor: "rgba(248,113,113,0.3)" }}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </FHJCard>
  );
}

const labelStyle = {
  display: "block",
  color: "rgba(255,255,255,0.6)",
  fontSize: "0.78rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "0.4rem",
};

const selectStyle = {
  width: "100%",
  padding: "0.6rem 0.75rem",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 8,
  color: "white",
  fontSize: "0.88rem",
  outline: "none",
};

const btnStyle = {
  padding: "0.3rem 0.7rem",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 6,
  color: "#94a3b8",
  fontSize: "0.75rem",
  cursor: "pointer",
};
