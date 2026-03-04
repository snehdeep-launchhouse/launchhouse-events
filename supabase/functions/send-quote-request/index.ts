import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function sanitize(val: unknown, maxLen = 500): string {
  if (typeof val !== "string") return "";
  return val.slice(0, maxLen).replace(/[<>"'&]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;", "&": "&amp;" }[c] ?? c)
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const payload = await req.json();

    // ── Input validation ──
    const email = typeof payload.email === "string" ? payload.email.trim() : "";
    const fullName = typeof payload.fullName === "string" ? payload.fullName.trim() : "";
    if (!email || !EMAIL_RE.test(email)) {
      return new Response(JSON.stringify({ success: false, error: "A valid email address is required." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!fullName || fullName.length > 200) {
      return new Response(JSON.stringify({ success: false, error: "A valid full name is required (max 200 chars)." }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Insert row into quote_requests and get back the quote_number ──
    const { data: insertedRow, error: dbError } = await supabase
      .from("quote_requests")
      .insert({
        full_name: payload.fullName ?? "",
        email: payload.email ?? "",
        event_type_new_or_clone: payload.eventTypeNewOrClone ?? "",
        event_type: payload.eventType ?? "",
        cvent_technologies: Array.isArray(payload.cventTechnologies) ? payload.cventTechnologies : [],
        cvent_technologies_other: payload.cventTechnologiesOther ?? null,
        registration_types_count: payload.registrationTypesCount ?? "",
        sessions_count: payload.sessionsCount ?? "",
        registration_options: Array.isArray(payload.registrationOptions) ? payload.registrationOptions : [],
        event_launch_date: payload.eventLaunchDate ?? "",
        email_status: "sending",
      })
      .select("quote_number")
      .single();

    if (dbError) {
      console.error("DB insert error:", dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    const quoteNumber = insertedRow?.quote_number ?? 0;
    const quotePadded = String(quoteNumber).padStart(4, "0");

    // ── Build internal notification email ──
    const techList = Array.isArray(payload.cventTechnologies)
      ? payload.cventTechnologies.join(", ")
      : (payload.cventTechnologies ?? "");
    const otherTech = payload.cventTechnologiesOther
      ? ` (Additional Info: ${payload.cventTechnologiesOther})`
      : "";

    const rows: [string, string][] = [
      ["Reference", `#${quotePadded}`],
      ["Full Name", sanitize(payload.fullName)],
      ["Email", sanitize(payload.email)],
      ["Services Interested In", `${sanitize(techList)}${sanitize(otherTech)}`],
    ];

    const tableRows = rows
      .map(
        ([field, value]) => `
        <tr>
          <td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;white-space:nowrap;vertical-align:top;width:35%;">${field}</td>
          <td style="padding:8px 12px;border:1px solid #d1d5db;vertical-align:top;">${value}</td>
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
        New Contact Request — #${quotePadded}
      </h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
        Submitted by ${payload.fullName ?? ""} · ${payload.email ?? ""}
      </p>
    </div>
    <table style="width:100%;border-collapse:collapse;border:1px solid #d1d5db;border-top:none;">
      ${tableRows}
    </table>
    <p style="margin-top:24px;font-size:12px;color:#6b7280;">
      This email was sent automatically from the LaunchHouse Events Contact Us form.
    </p>
  </div>
</body>
</html>`;

    // ── Build submitter confirmation email ──
    const confirmationHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="font-family:'Inter',Arial,sans-serif;color:#111827;background:#ffffff;margin:0;padding:24px;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="background:#006AE1;padding:24px 32px;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-family:'Space Grotesk',Arial,sans-serif;">
        Thank You for Reaching Out!
      </h1>
    </div>
    <div style="padding:32px;border:1px solid #d1d5db;border-top:none;border-radius:0 0 8px 8px;">
      <p style="margin:0 0 16px;font-size:16px;">Hi ${sanitize(payload.fullName)},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        Thank you for contacting LaunchHouse Events. We've received your request and our team will review it shortly.
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        We'll get back to you within <strong>3–4 business hours</strong>.
      </p>
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#374151;">Need urgent assistance?</p>
        <p style="margin:0 0 4px;font-size:14px;color:#374151;">
          📧 <a href="mailto:sam@launchhouse.events" style="color:#1d4ed8;text-decoration:underline;">sam@launchhouse.events</a>
        </p>
        <p style="margin:0 0 4px;font-size:14px;color:#374151;">
          📞 <a href="tel:+919999063734" style="color:#1d4ed8;text-decoration:underline;">+91 9999 063 734</a>
        </p>
        <p style="margin:0;font-size:14px;color:#374151;">
          💬 <a href="https://wa.me/919999063734" style="color:#1d4ed8;text-decoration:underline;">WhatsApp</a>
        </p>
      </div>
      <p style="margin:0;font-size:15px;color:#374151;">
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
      const json = await res.json();
      if (!res.ok) throw new Error(`Resend API error [${res.status}]: ${JSON.stringify(json)}`);
      return json;
    };

    const internalSubject = `New Contact Request #${quotePadded} – ${payload.fullName ?? ""}`;

    const results = [];
    results.push(await sendEmail({ from: "LaunchHouse Events <noreply@launchhouse.events>", to: ["sam@launchhouse.events"], subject: internalSubject, html: internalHtml }));
    await sleep(600);
    results.push(await sendEmail({ from: "LaunchHouse Events <noreply@launchhouse.events>", to: ["snehdeep@launchhouse.events"], subject: internalSubject, html: internalHtml }));
    await sleep(600);
    results.push(await sendEmail({
      from: "LaunchHouse Events <noreply@launchhouse.events>",
      to: [payload.email],
      subject: `We've received your contact request — LaunchHouse Events`,
      html: confirmationHtml,
    }));

    // ── Update email status ──
    await supabase
      .from("quote_requests")
      .update({ email_status: "sent", email_sent_at: new Date().toISOString() })
      .eq("quote_number", quoteNumber);

    return new Response(
      JSON.stringify({ success: true, quoteNumber: quotePadded, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("send-quote-request error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
