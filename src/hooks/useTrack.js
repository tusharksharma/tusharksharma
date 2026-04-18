// Lightweight event tracking. Logs to console in dev, sends to
// Google Analytics (gtag) if available. Wire up any other provider
// by adding a call here.

const isDev = typeof window !== "undefined" && window.location.hostname === "localhost";

export default function track(event, data = {}) {
  if (isDev) {
    console.log(`[track] ${event}`, data);
    return;
  }

  // Google Analytics 4
  if (window.gtag) {
    window.gtag("event", event, data);
  }
}
