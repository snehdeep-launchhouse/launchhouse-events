import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Mirrors src/lib/email-validation.ts BLOCKED_DOMAINS — kept in sync manually.
const BLOCKED_DOMAINS = new Set<string>([
  "gmail.com", "googlemail.com",
  "outlook.com", "outlook.co.uk", "hotmail.com", "live.com", "msn.com",
  "yahoo.com", "yahoo.co.uk", "ymail.com",
  "icloud.com", "me.com", "mac.com",
  "aol.com",
  "protonmail.com", "proton.me", "pm.me",
  "zoho.com", "zohomail.com",
  "tutanota.com", "tuta.com",
  "fastmail.com",
  "gmx.com", "gmx.net",
  "mail.com",
  "inbox.com",
  "hey.com",
  "yandex.com", "yandex.ru",
  "mail.ru",
  "qq.com",
  "163.com",
  "126.com",
  "sina.com",
]);

const ALLOWED_LEAD_TYPE = "pre_launch_checklist_download";
const ALLOWED_FORM_NAME = "pre_launch_checklist_download";
const ALLOWED_RESOURCE_NAME = "cvent_pre_launch_qa_checklist";
const ALLOWED_PAGE_PATH = "/pre-launch-checks";

const RESOURCE_DISPLAY_NAME = "Cvent Pre-Launch QA Checklist";
const RESOURCE_PDF_URL =
  "https://launchhouse.events/resources/LH_Phase_2_Cvent_Pre_Launch_QA_Checklist_v03.pdf";

function escapeHtml(val: string): string {
  return val.replace(/[<>"'&]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "&": "&amp;" }[c] ?? c)
  );
}

function jsonResponse(status: number, body: object) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function badRequest(message: string) {
  return jsonResponse(400, { success: false, error: message });
}

// ── Approved browser origins (defense-in-depth on top of CORS) ──
const ALLOWED_ORIGINS = new Set<string>([
  "https://launchhouse.events",
  "https://www.launchhouse.events",
]);

const ALLOWED_KEYS = new Set([
  "email",
  "lead_type",
  "form_name",
  "resource_name",
  "page_path",
]);

/**
 * Best-effort, instance-local cooldown.
 * NOT a durable / distributed rate limit — each edge instance has its own map,
 * entries are lost on cold start, and a determined caller can rotate IPs.
 * Goal: dampen accidental rapid resubmits from a single browser.
 */
const COOLDOWN_MS = 60_000;
const cooldown = new Map<string, number>();

function pruneCooldown(now: number) {
  // Opportunistic cleanup to keep the map bounded.
  if (cooldown.size < 256) return;
  for (const [k, expiresAt] of cooldown) {
    if (expiresAt <= now) cooldown.delete(k);
  }
}

async function ipKey(req: Request): Promise<string | null> {
  // Match Supabase Edge runtime convention used by other functions: trust the
  // first IP in x-forwarded-for, fall back to x-real-ip. Never log the value.
  const fwd = req.headers.get("x-forwarded-for");
  const raw = (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip") || "").trim();
  if (!raw) return null;
  // Hash so the raw IP never lives in memory verbatim.
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // ── Origin allow-list (browser requests only) ──
  // No-Origin requests are permitted (server-to-server, health probes, curl);
  // an explicit, unapproved Origin is rejected.
  const origin = req.headers.get("origin");
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return jsonResponse(403, { success: false, error: "Forbidden." });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    let payload: Record<string, unknown>;
    try {
      payload = await req.json();
    } catch {
      return badRequest("Invalid request body.");
    }

    if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
      return badRequest("Invalid request body.");
    }

    // Reject any unexpected top-level key — no silent ignores.
    for (const k of Object.keys(payload)) {
      if (!ALLOWED_KEYS.has(k)) return badRequest("Unexpected field in request body.");
    }

    // ── Strict request contract ──
    const email = typeof payload.email === "string" ? payload.email.trim() : "";
    const lead_type = typeof payload.lead_type === "string" ? payload.lead_type : "";
    const form_name = typeof payload.form_name === "string" ? payload.form_name : "";
    const resource_name = typeof payload.resource_name === "string" ? payload.resource_name : "";
    const page_path = typeof payload.page_path === "string" ? payload.page_path : "";

    if (!email || email.length > 255 || !EMAIL_RE.test(email)) {
      return badRequest("A valid email address is required.");
    }
    const domain = email.split("@")[1]?.toLowerCase() ?? "";
    if (!domain || BLOCKED_DOMAINS.has(domain)) {
      return badRequest(
        "Please use your company email address. Generic email providers are not accepted."
      );
    }
    if (lead_type !== ALLOWED_LEAD_TYPE) return badRequest("Invalid lead_type.");
    if (form_name !== ALLOWED_FORM_NAME) return badRequest("Invalid form_name.");
    if (resource_name !== ALLOWED_RESOURCE_NAME) return badRequest("Invalid resource_name.");
    if (page_path !== ALLOWED_PAGE_PATH) return badRequest("Invalid page_path.");

    // ── Best-effort per-IP cooldown (instance-local, not durable) ──
    const now = Date.now();
    pruneCooldown(now);
    const key = await ipKey(req);
    if (key) {
      const expiresAt = cooldown.get(key);
      if (expiresAt && expiresAt > now) {
        return jsonResponse(429, {
          success: false,
          error: "Please wait a moment before requesting another download.",
        });
      }
      // Reserve the slot before sending so in-flight duplicates also collide.
      cooldown.set(key, now + COOLDOWN_MS);
    }

    const timestamp = new Date().toISOString();
    const safeEmail = escapeHtml(email);

    // ── Internal notification email ──
    const internalSubject = `New Resource Download: ${RESOURCE_DISPLAY_NAME}`;

    const internalRows: [string, string][] = [
      ["Email", safeEmail],
      ["Resource", RESOURCE_DISPLAY_NAME],
      ["Lead Type", ALLOWED_LEAD_TYPE],
      ["Page Path", ALLOWED_PAGE_PATH],
      ["Timestamp", escapeHtml(timestamp)],
    ];

    const tableRowsHtml = internalRows
      .map(
        ([f, v]) => `
        <tr>
          <td style="padding:10px 14px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;white-space:nowrap;vertical-align:top;width:35%;">${f}</td>
          <td style="padding:10px 14px;border:1px solid #d1d5db;vertical-align:top;">${v}</td>
        </tr>`
      )
      .join("");

    const internalHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="font-family:'Inter',Arial,sans-serif;color:#111827;background:#ffffff;margin:0;padding:24px;">
  <div style="max-width:700px;margin:0 auto;">
    <div style="background:#006AE1;padding:24px 32px;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-family:'Space Grotesk',Arial,sans-serif;">
        📥 New Resource Download
      </h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
        ${RESOURCE_DISPLAY_NAME}
      </p>
    </div>
    <table style="width:100%;border-collapse:collapse;border:1px solid #d1d5db;border-top:none;">
      ${tableRowsHtml}
    </table>
    <p style="margin-top:24px;font-size:12px;color:#6b7280;">
      This email was sent automatically when a visitor requested the ${RESOURCE_DISPLAY_NAME}.
    </p>
  </div>
</body>
</html>`;

    const internalText =
      `New Resource Download: ${RESOURCE_DISPLAY_NAME}\n\n` +
      `Email: ${email}\n` +
      `Resource: ${RESOURCE_DISPLAY_NAME}\n` +
      `Lead Type: ${ALLOWED_LEAD_TYPE}\n` +
      `Page Path: ${ALLOWED_PAGE_PATH}\n` +
      `Timestamp: ${timestamp}\n`;

    // ── Requester confirmation email ──
    const confirmationSubject = `Your ${RESOURCE_DISPLAY_NAME} — LaunchHouse Events`;

    const confirmationHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="font-family:'Inter',Arial,sans-serif;color:#111827;background:#ffffff;margin:0;padding:24px;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="background:#006AE1;padding:24px 32px;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-family:'Space Grotesk',Arial,sans-serif;">
        Your ${RESOURCE_DISPLAY_NAME}
      </h1>
    </div>
    <div style="padding:32px;border:1px solid #d1d5db;border-top:none;border-radius:0 0 8px 8px;">
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        Thanks for requesting the <strong>${RESOURCE_DISPLAY_NAME}</strong>.
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        Your download should begin automatically in your browser. If it doesn't, use the link below.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="${RESOURCE_PDF_URL}"
           style="display:inline-block;background:#006AE1;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
          Download the checklist (PDF)
        </a>
      </div>
      <p style="margin:0 0 8px;font-size:13px;color:#6b7280;word-break:break-all;">
        Direct link: <a href="${RESOURCE_PDF_URL}" style="color:#1d4ed8;text-decoration:underline;">${RESOURCE_PDF_URL}</a>
      </p>
      <p style="margin:24px 0 0;font-size:15px;color:#374151;">
        Warm regards,<br/>
        <strong>The LaunchHouse Events Team</strong>
      </p>
    </div>
    <p style="margin-top:24px;font-size:12px;color:#6b7280;text-align:center;">
      LaunchHouse Events · This is an automated confirmation email.
    </p>
  </div>
</body>
</html>`;

    const confirmationText =
      `Your ${RESOURCE_DISPLAY_NAME}\n\n` +
      `Thanks for requesting the ${RESOURCE_DISPLAY_NAME}.\n\n` +
      `Your download should begin automatically in your browser. ` +
      `If it doesn't, use the link below:\n\n` +
      `${RESOURCE_PDF_URL}\n\n` +
      `Warm regards,\nThe LaunchHouse Events Team\n`;

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const sendEmail = async (body: object) => {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        // Avoid leaking provider details / PII
        throw new Error(`Resend API error [${res.status}]`);
      }
      return res.json();
    };

    // Internal recipient 1
    await sendEmail({
      from: "LaunchHouse Events <noreply@launchhouse.events>",
      to: ["snehdeep@launchhouse.events"],
      subject: internalSubject,
      html: internalHtml,
      text: internalText,
    });
    await sleep(600);

    // Internal recipient 2
    await sendEmail({
      from: "LaunchHouse Events <noreply@launchhouse.events>",
      to: ["sam@launchhouse.events"],
      subject: internalSubject,
      html: internalHtml,
      text: internalText,
    });
    await sleep(600);

    // Requester confirmation
    await sendEmail({
      from: "LaunchHouse Events <noreply@launchhouse.events>",
      to: [email],
      subject: confirmationSubject,
      html: confirmationHtml,
      text: confirmationText,
    });

    return new Response(
      JSON.stringify({ success: true, resource_name: ALLOWED_RESOURCE_NAME }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (_err) {
    // Do not log raw error contents (may contain PII / provider details).
    console.error("send-resource-download-notification failed");
    return new Response(
      JSON.stringify({
        success: false,
        error: "An error occurred while sending the resource notification.",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
