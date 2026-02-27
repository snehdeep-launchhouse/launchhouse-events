import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const { first_name, last_name, email, form_type, last_step_reached } = await req.json();

    const formLabel = form_type === "demo" ? "Request a Demo" : "Contact Us";

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="font-family:'Inter',Arial,sans-serif;color:#111827;background:#ffffff;margin:0;padding:24px;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="background:#dc2626;padding:24px 32px;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-family:'Space Grotesk',Arial,sans-serif;">Abandoned Form Alert</h1>
    </div>
    <div style="padding:32px;border:1px solid #d1d5db;border-top:none;border-radius:0 0 8px 8px;">
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">A visitor abandoned the <strong>${formLabel}</strong> form. Here are the captured details:</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr><td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;width:40%;">Name</td><td style="padding:8px 12px;border:1px solid #d1d5db;">${first_name} ${last_name}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;">Email</td><td style="padding:8px 12px;border:1px solid #d1d5db;">${email}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;">Form Type</td><td style="padding:8px 12px;border:1px solid #d1d5db;">${formLabel}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;">Last Step Reached</td><td style="padding:8px 12px;border:1px solid #d1d5db;">Step ${last_step_reached}</td></tr>
      </table>
      <p style="margin:0;font-size:14px;color:#6b7280;">Follow up with this lead as soon as possible.</p>
    </div>
    <p style="margin-top:24px;font-size:12px;color:#6b7280;text-align:center;">LaunchHouse Events · Automated Notification</p>
  </div>
</body></html>`;

    const from = "LaunchHouse Events <noreply@launchhouse.events>";
    const subject = `⚠️ Abandoned ${formLabel} — ${first_name} ${last_name}`;

    // Send to both admins
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
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
