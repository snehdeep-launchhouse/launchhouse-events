import { useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { ANALYTICS_READY_EVENT, isProductionHost, track } from "@/lib/analytics";

const PRESERVED_QUERY_KEYS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
]);

const EMAIL_LIKE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildPageLocation(pathname: string, search: string): string | null {
  if (typeof window === "undefined") return null;
  if (!isProductionHost()) return null;

  const origin = `${window.location.protocol}//${window.location.hostname}`;
  const url = new URL(pathname, origin);

  if (search) {
    const incoming = new URLSearchParams(search);
    for (const [key, value] of incoming.entries()) {
      if (!PRESERVED_QUERY_KEYS.has(key)) continue;
      const trimmed = (value ?? "").trim();
      if (trimmed.length === 0) continue;
      if (EMAIL_LIKE.test(trimmed)) continue;
      url.searchParams.set(key, trimmed);
    }
  }

  return url.toString();
}

/**
 * Single-mount manual GA4 page_view tracker for the SPA.
 * Renders nothing. Must be mounted exactly once inside <BrowserRouter>.
 */
const RouteChangeTracker = () => {
  const location = useLocation();
  const lastSentKeyRef = useRef<string | null>(null);

  const pageKey = `${location.pathname}${location.search}`;

  const sendCurrentPageView = useCallback(() => {
    if (typeof window === "undefined" || typeof document === "undefined") return;
    if (!isProductionHost()) return;

    const currentKey = `${window.location.pathname}${window.location.search}`;
    if (lastSentKeyRef.current === currentKey) return;

    const pageLocation = buildPageLocation(window.location.pathname, window.location.search);
    if (!pageLocation) return;

    const sent = track("page_view", {
      page_title: document.title,
      page_location: pageLocation,
    });

    if (sent) {
      lastSentKeyRef.current = currentKey;
    }
  }, []);

  // Route change attempts (pathname + search only; hash changes ignored by key).
  useEffect(() => {
    sendCurrentPageView();
  }, [pageKey, sendCurrentPageView]);

  // Consent-after-arrival readiness signal.
  useEffect(() => {
    const handler = () => sendCurrentPageView();
    window.addEventListener(ANALYTICS_READY_EVENT, handler);
    return () => window.removeEventListener(ANALYTICS_READY_EVENT, handler);
  }, [sendCurrentPageView]);

  return null;
};

export default RouteChangeTracker;
