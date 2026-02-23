import React, { useState, useEffect } from "react";
import {
  FHJCard,
  FHJButton,
  FHJInput,
  fhjTheme,
} from "../components/FHJ/FHJUIKit.jsx";
export default function AdminDocuments({ admin }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const isAssistant = (admin?.role ?? admin?.Role) === "Assistant";
  const loadDocuments = async () => {
    setLoading(true);
    const res = await fetch("/.netlify/functions/admin-documents");
    const data = await res.json();
    setDocuments(data.documents || []);
    setLoading(false);
  };
  const handleUpload = async () => {
    if (isAssistant || !file) return;
    const formData = new FormData();
    formData.append("file", file);
    await fetch("/.netlify/functions/admin-documents", {
      method: "POST",
      body: formData,
    });
    setFile(null);
    loadDocuments();
  };
  const handleDelete = async (id) => {
    if (isAssistant) return;
    await fetch("/.netlify/functions/admin-documents", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    loadDocuments();
  };
  useEffect(() => {
    loadDocuments();
  }, []);
  return (
    <FHJCard style={{ padding: "2rem" }}>
      <h2>Documents Manager</h2>
      {isAssistant && (
        <p style={{ opacity: 0.7, marginBottom: "1rem" }}>
          You have <strong>view‑only</strong> access. Uploading and deleting are disabled.
        </p>
      )}
      {/* UPLOAD SECTION */}
      <div style={{ marginBottom: "2rem", opacity: isAssistant ? 0.5 : 1 }}>
        <input
          type="file"
          disabled={isAssistant}
          onChange={(e) => setFile(e.target.files[0])}
          style={{
            marginBottom: "1rem",
            cursor: isAssistant ? "not-allowed" : "pointer",
          }}
        />
        {!isAssistant && (
          <FHJButton onClick={handleUpload}>
            Upload Document
          </FHJButton>
        )}
      </div>
      {/* DOCUMENT LIST */}
      {loading ? (
        <p>Loading documents...</p>
      ) : (
        <ul style={{ paddingLeft: "1rem" }}>
          {documents.map((doc) => (
            <li key={doc.id} style={{ marginBottom: "1rem" }}>
              <strong>{doc.Name}</strong>
              <p style={{ opacity: 0.7 }}>{doc.Type}</p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <a
                  href={doc.Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: fhjTheme.primary,
                    textDecoration: "underline",
                  }}
                >
                  View
                </a>
                <FHJButton
                  disabled={isAssistant}
                  onClick={() => handleDelete(doc.id)}
                  style={{
                    opacity: isAssistant ? 0.5 : 1,
                    cursor: isAssistant ? "not-allowed" : "pointer",
                  }}
                >
                  Delete
                </FHJButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </FHJCard>
  );
}
