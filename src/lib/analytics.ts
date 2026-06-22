/**
 * Minimal, consent-safe GA4 utility.
 *
 * IMPORTANT: This file does NOT load or initialize Google Analytics.
 * GA4 is loaded by src/components/CookieBanner.tsx only after the user
 * consents to marketing cookies. This module only sends events when
 * gtag is already available and the current host is an approved
 * production domain.
 */

export const GA_MEASUREMENT_ID = "G-JDM9N7HJD3";

const ALLOWED_HOSTNAMES = new Set(["launchhouse.events", "www.launchhouse.events"]);

const ALLOWED_PARAMS = new Set([
  "page_path",
  "page_location",
  "page_title",
  "cta_name",
  "cta_location",
  "destination_path",
  "form_name",
  "lead_type",
  "recommended_tier",
  "event_app_selected",
  "calculator_path",
]);

// Values that look like email addresses are rejected to prevent accidental PII.
const EMAIL_LIKE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Minimal gtag type definition used by this project.
type Gtag = (...args: (string | Date | boolean | object)[]) => void;

declare global {
  interface Window {
    gtag?: Gtag;
    "ga-disable-G-JDM9N7HJD3"?: boolean;
  }
}

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.location !== "undefined";
}

export function isProductionHost(hostname?: string): boolean {
  const host = hostname ?? (isBrowser() ? window.location.hostname : "");
  return ALLOWED_HOSTNAMES.has(host);
}

function isAllowedValue(value: unknown): value is string | number | boolean {
  if (value === null || value === undefined) return false;

  if (typeof value === "boolean") return true;

  if (typeof value === "number") return Number.isFinite(value);

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) return false;
    if (EMAIL_LIKE.test(trimmed)) return false;
    return true;
  }

  return false;
}

export function track(eventName: string, params?: Record<string, unknown>): void {
  if (!isProductionHost()) return;
  if (!isBrowser()) return;

  if (!window.gtag || typeof window.gtag !== "function") return;

  const disableFlag = window["ga-disable-G-JDM9N7HJD3"];
  if (disableFlag === true) return;

  const safeParams: Record<string, string | number | boolean> = {};

  if (params && typeof params === "object") {
    for (const [key, value] of Object.entries(params)) {
      if (!ALLOWED_PARAMS.has(key)) continue;
      if (!isAllowedValue(value)) continue;
      safeParams[key] = typeof value === "string" ? value.trim() : value;
    }
  }

  window.gtag("event", eventName, safeParams);
}
