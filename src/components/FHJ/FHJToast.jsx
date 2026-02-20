// ==========================================================
// 📄 FILE: FHJToast.jsx  (PHASE 2 — CONSOLIDATION)
// Replaces: All alert() calls throughout the app
// Location: src/components/FHJ/FHJToast.jsx
//
// Usage:
//   // 1. Wrap your app (in App.jsx or AppShell.jsx):
//   import { ToastProvider } from "./components/FHJ/FHJToast.jsx";
//   <ToastProvider> <App /> </ToastProvider>
//
//   // 2. Use in any component:
//   import { useToast } from "./components/FHJ/FHJToast.jsx";
//   const toast = useToast();
//   toast.success("Trip booked successfully!");
//   toast.error("Failed to save. Please try again.");
//   toast.info("Your dates have been updated.");
//   toast.warning("Unpaid balance detected.");
// ==========================================================

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

// -------------------------------------------------------
// Context
// -------------------------------------------------------
const ToastContext = createContext(null);

// -------------------------------------------------------
// Toast Provider
// -------------------------------------------------------
export function ToastProvider({ children, position = "bottom-right", maxToasts = 5 }) {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = ++toastIdRef.current;

    setToasts((prev) => {
      const next = [...prev, { id, message, type, duration }];
      // Limit visible toasts
      return next.slice(-maxToasts);
    });

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }

    return id;
  }, [maxToasts, removeToast]);

  const toast = {
    success: (msg, duration) => addToast(msg, "success", duration),
    error: (msg, duration) => addToast(msg, "error", duration || 6000),
    warning: (msg, duration) => addToast(msg, "warning", duration || 5000),
    info: (msg, duration) => addToast(msg, "info", duration),
    dismiss: removeToast,
    dismissAll: () => setToasts([]),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} position={position} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

// -------------------------------------------------------
// Hook
// -------------------------------------------------------
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}

// -------------------------------------------------------
// Toast Container (renders all active toasts)
// -------------------------------------------------------
function ToastContainer({ toasts, position, onDismiss }) {
  const positionStyles = {
    "top-right": { top: "1.5rem", right: "1.5rem" },
    "top-left": { top: "1.5rem", left: "1.5rem" },
    "bottom-right": { bottom: "1.5rem", right: "1.5rem" },
    "bottom-left": { bottom: "1.5rem", left: "1.5rem" },
    "top-center": { top: "1.5rem", left: "50%", transform: "translateX(-50%)" },
    "bottom-center": { bottom: "1.5rem", left: "50%", transform: "translateX(-50%)" },
  };

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes fhj-toast-in {
          from { opacity: 0; transform: translateY(12px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fhj-toast-out {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to { opacity: 0; transform: translateY(-8px) scale(0.95); }
        }
        @keyframes fhj-toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      <div
        style={{
          position: "fixed",
          ...(positionStyles[position] || positionStyles["bottom-right"]),
          display: "flex",
          flexDirection: position.startsWith("top") ? "column" : "column-reverse",
          gap: "0.75rem",
          zIndex: 99999,
          pointerEvents: "none",
          maxWidth: "420px",
          width: "100%",
        }}
      >
        {toasts.map((t) => (
          <Toast key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </div>
    </>
  );
}

// -------------------------------------------------------
// Individual Toast
// -------------------------------------------------------
function Toast({ toast, onDismiss }) {
  const [exiting, setExiting] = useState(false);

  const typeConfig = {
    success: { icon: "✓", color: "#4ade80", bg: "rgba(74,222,128,0.12)", border: "rgba(74,222,128,0.3)" },
    error: { icon: "✕", color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)" },
    warning: { icon: "⚠", color: "#fbbf24", bg: "rgba(251,191,36,0.12)", border: "rgba(251,191,36,0.3)" },
    info: { icon: "ℹ", color: "#60a5fa", bg: "rgba(96,165,250,0.12)", border: "rgba(96,165,250,0.3)" },
  };

  const config = typeConfig[toast.type] || typeConfig.info;

  const handleDismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 250);
  };

  return (
    <div
      style={{
        pointerEvents: "auto",
        animation: exiting ? "fhj-toast-out 0.25s ease forwards" : "fhj-toast-in 0.3s ease",
        background: "rgba(10,10,20,0.95)",
        backdropFilter: "blur(16px)",
        border: `1px solid ${config.border}`,
        borderRadius: "12px",
        padding: "0.85rem 1rem",
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: config.bg,
          color: config.color,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.85rem",
          fontWeight: "bold",
          flexShrink: 0,
        }}
      >
        {config.icon}
      </div>

      {/* Message */}
      <p
        style={{
          margin: 0,
          color: "#e5e7eb",
          fontSize: "0.9rem",
          lineHeight: 1.4,
          flex: 1,
        }}
      >
        {toast.message}
      </p>

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        style={{
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.4)",
          cursor: "pointer",
          fontSize: "0.9rem",
          padding: "2px",
          flexShrink: 0,
          lineHeight: 1,
        }}
        aria-label="Dismiss"
      >
        ✕
      </button>

      {/* Progress bar */}
      {toast.duration > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "2px",
            background: config.color,
            opacity: 0.5,
            animation: `fhj-toast-progress ${toast.duration}ms linear`,
          }}
        />
      )}
    </div>
  );
}
