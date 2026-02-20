// ==========================================================
// 📄 FILE: AnalyticsProvider.jsx
// Location: src/lib/providers/AnalyticsProvider.jsx
// ==========================================================

import React, { createContext, useContext, useCallback } from "react";

const AnalyticsContext = createContext({ trackEvent: () => {} });

export function AnalyticsProvider({ children }) {
  const trackEvent = useCallback((name, data = {}) => {
    // Log events in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[Analytics] ${name}`, data);
    }

    // In production, send to your analytics endpoint
    // Example: fetch("/.netlify/functions/analytics", { ... })
  }, []);

  return (
    <AnalyticsContext.Provider value={{ trackEvent }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  return useContext(AnalyticsContext);
}
