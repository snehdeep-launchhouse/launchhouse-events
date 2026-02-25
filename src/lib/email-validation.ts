import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const EMAIL_ERROR_MESSAGE = "Please enter a valid email address.";

export const DOMAIN_INVALID_MESSAGE = "This email domain is invalid or cannot receive mail.";

export function validateEmail(value: string): { valid: boolean; message?: string } {
  if (!value) return { valid: false };
  if (EMAIL_REGEX.test(value)) return { valid: true };
  return { valid: false, message: EMAIL_ERROR_MESSAGE };
}

/** Drop-in replacement for `.email()` in zod schemas */
export const zodEmail = () =>
  z
    .string()
    .trim()
    .max(255, "Email must be less than 255 characters")
    .refine((v) => EMAIL_REGEX.test(v), { message: EMAIL_ERROR_MESSAGE });

/* ── Domain verification ─────────────────────────────────────────── */

const TRUSTED_DOMAINS = new Set([
  "gmail.com", "outlook.com", "yahoo.com", "hotmail.com",
  "icloud.com", "aol.com", "protonmail.com", "live.com",
  "msn.com", "me.com", "mac.com", "googlemail.com",
  "yahoo.co.uk", "outlook.co.uk", "ymail.com",
]);

// Session-level cache for domains already checked
const domainCache = new Map<string, boolean>();

export type VerificationStatus = "idle" | "verifying" | "valid" | "invalid";

/**
 * Verify that an email's domain has valid MX records.
 * Returns true if valid, false if invalid.
 * Checks trusted domains first, then session cache, then calls the edge function.
 */
export async function verifyEmailDomain(email: string): Promise<{ valid: boolean; message?: string }> {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) return { valid: false, message: EMAIL_ERROR_MESSAGE };

  // Trusted domains — skip API call
  if (TRUSTED_DOMAINS.has(domain)) return { valid: true };

  // Session cache
  const cached = domainCache.get(domain);
  if (cached !== undefined) {
    return cached
      ? { valid: true }
      : { valid: false, message: DOMAIN_INVALID_MESSAGE };
  }

  // Call edge function
  try {
    const { data, error } = await supabase.functions.invoke("verify-email-domain", {
      body: { domain },
    });

    if (error) {
      console.error("Domain verification error:", error);
      return { valid: false, message: DOMAIN_INVALID_MESSAGE };
    }

    const isValid = data?.valid === true;
    domainCache.set(domain, isValid);

    return isValid
      ? { valid: true }
      : { valid: false, message: data?.message || DOMAIN_INVALID_MESSAGE };
  } catch (err) {
    console.error("Domain verification error:", err);
    return { valid: false, message: DOMAIN_INVALID_MESSAGE };
  }
}
