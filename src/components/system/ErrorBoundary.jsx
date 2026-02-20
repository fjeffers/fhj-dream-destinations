// ==========================================================
// 📄 FILE: ErrorBoundary.jsx
// Location: src/components/system/ErrorBoundary.jsx
// ==========================================================

import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={containerStyle}>
          <div style={cardStyle}>
            <h2 style={{ color: "#f87171", marginTop: 0 }}>Something went wrong</h2>
            <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
              An unexpected error occurred. Please refresh the page.
            </p>
            {this.state.error && (
              <pre style={errorStyle}>
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              style={btnStyle}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#0a0a0a",
  padding: "2rem",
};

const cardStyle = {
  maxWidth: "500px",
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  borderRadius: "16px",
  border: "1px solid rgba(248,113,113,0.2)",
  padding: "2rem",
  textAlign: "center",
};

const errorStyle = {
  background: "rgba(0,0,0,0.4)",
  padding: "1rem",
  borderRadius: "8px",
  color: "#fca5a5",
  fontSize: "0.8rem",
  overflow: "auto",
  textAlign: "left",
  marginBottom: "1.5rem",
};

const btnStyle = {
  padding: "0.75rem 1.5rem",
  borderRadius: "999px",
  background: "rgba(248,113,113,0.15)",
  border: "1px solid rgba(248,113,113,0.3)",
  color: "#fca5a5",
  cursor: "pointer",
  fontSize: "0.9rem",
  fontWeight: 600,
};
