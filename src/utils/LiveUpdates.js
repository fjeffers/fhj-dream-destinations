import { adminFetch } from "./adminFetch.js";
// src/utils/LiveUpdates.js
const subscribers = new Set();

let started = false;
let lastSnapshot = null;
let pollInterval = null;
let eventSource = null;
let retryDelay = 2000;

const notify = (event) => {
  lastSnapshot = event;
  subscribers.forEach((fn) => {
    try {
      fn(event);
    } catch (e) {
      console.error("LiveUpdates subscriber error", e);
    }
  });
};

const startSSE = () => {
  try {
    eventSource = new EventSource("/.netlify/functions/admin-stream");

    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        retryDelay = 2000;
        notify({ source: "sse", ...data });
      } catch (err) {
        console.error("SSE parse error", err);
      }
    };

    eventSource.onerror = () => {
      console.warn("SSE error → switching to polling fallback");
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
      startPolling();
      setTimeout(() => {
        if (subscribers.size > 0) startSSE();
      }, retryDelay);
      retryDelay = Math.min(retryDelay * 2, 30000);
    };
  } catch (err) {
    console.warn("SSE init failed → polling fallback", err);
    startPolling();
  }
};

const startPolling = () => {
  if (pollInterval) return;
  const poll = async () => {
    try {
      const res = await adminFetch("/.netlify/functions/admin-alerts");
      const alertsData = await res.json();
      notify({
        source: "poll",
        type: "alerts",
        ts: new Date().toISOString(),
        alerts: alertsData.alerts || [],
      });
    } catch (err) {
      console.error("Polling failed", err);
    }
  };
  poll();
  pollInterval = setInterval(poll, 30000);
};

export const LiveUpdates = {
  subscribe(fn) {
    subscribers.add(fn);
    if (lastSnapshot) fn(lastSnapshot);
    if (!started) {
      started = true;
      if (typeof window !== "undefined" && "EventSource" in window) {
        startSSE();
      } else {
        startPolling();
      }
    }
    return () => {
      subscribers.delete(fn);
      if (subscribers.size === 0) {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        if (pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
        started = false;
        lastSnapshot = null;
        retryDelay = 2000;
      }
    };
  },
};
