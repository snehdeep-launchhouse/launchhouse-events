import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function sanitize(val: unknown, maxLen = 500): string {
  if (typeof val !== "string") return "";
  return val.slice(0, maxLen).replace(/[<>"'&]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "&": "&amp;" }[c] ?? c)
  );
}

function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Internal-only endpoint: invoked by the DB trigger using the service role
  // key. Reject any caller that doesn't present that exact token.
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authHeader = req.headers.get("authorization") ?? "";
  const presented = authHeader.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : "";
  if (!serviceRoleKey || !presented || !constantTimeEquals(presented, serviceRoleKey)) {
    return new Response(JSON.stringify({ error: "Forbidden." }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const { first_name, last_name, email, form_type, last_step_reached } = await req.json();

    const safeFirstName = sanitize(first_name, 200);
    const safeLastName = sanitize(last_name, 200);
    const safeEmail = sanitize(email, 255);
    const formLabel = form_type === "demo" ? "Request a Demo" : "Contact Us";
    const safeStep = typeof last_step_reached === "number" ? last_step_reached : 0;

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="font-family:'Inter',Arial,sans-serif;color:#111827;background:#ffffff;margin:0;padding:24px;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="background:#dc2626;padding:24px 32px;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-family:'Space Grotesk',Arial,sans-serif;">Abandoned Form Alert</h1>
    </div>
    <div style="padding:32px;border:1px solid #d1d5db;border-top:none;border-radius:0 0 8px 8px;">
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">A visitor abandoned the <strong>${formLabel}</strong> form. Here are the captured details:</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr><td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;width:40%;">Name</td><td style="padding:8px 12px;border:1px solid #d1d5db;">${safeFirstName} ${safeLastName}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;">Email</td><td style="padding:8px 12px;border:1px solid #d1d5db;">${safeEmail}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;">Form Type</td><td style="padding:8px 12px;border:1px solid #d1d5db;">${formLabel}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;">Last Step Reached</td><td style="padding:8px 12px;border:1px solid #d1d5db;">Step ${safeStep}</td></tr>
      </table>
      <p style="margin:0;font-size:14px;color:#6b7280;">Follow up with this lead as soon as possible.</p>
    </div>
    <p style="margin-top:24px;font-size:12px;color:#6b7280;text-align:center;">LaunchHouse Events · Automated Notification</p>
  </div>
</body></html>`;

    const from = "LaunchHouse Events <noreply@launchhouse.events>";
    const subject = `⚠️ Abandoned ${formLabel} — ${safeFirstName} ${safeLastName}`;

    for (const recipient of ["snehdeep@launchhouse.events", "sam@launchhouse.events"]) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [recipient], subject, html }),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error(`Failed to send to ${recipient}:`, err);
      }
      await new Promise((r) => setTimeout(r, 600));
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-abandoned-form error:", err);
    return new Response(JSON.stringify({ error: "An error occurred. Please try again." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
