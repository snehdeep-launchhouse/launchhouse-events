import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const payload = await req.json();

    // ── Input validation ──
    const email = typeof payload.email === "string" ? payload.email.trim() : "";
    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const company = typeof payload.company === "string" ? payload.company.trim() : "";

    if (!email || !EMAIL_RE.test(email)) {
      return new Response(
        JSON.stringify({ success: false, error: "A valid email address is required." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!name || name.length > 200) {
      return new Response(
        JSON.stringify({ success: false, error: "A valid name is required (max 200 chars)." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Build data for emails ──
    const complexityLevel = sanitize(payload.complexityLevel) || "Not specified";
    const startingPrice = sanitize(payload.startingPrice) || "Contact for pricing";
    const eventDate = payload.eventDate ? sanitize(payload.eventDate) : "Not specified";
    const cventProducts = payload.cventProducts ? sanitize(payload.cventProducts) : "None selected";
    const attendeeHubSelected = payload.attendeeHubSelected === true;
    const attendeeHubFeatures: string[] = Array.isArray(payload.attendeeHubFeatures)
      ? payload.attendeeHubFeatures.map((f: unknown) => sanitize(f as string))
      : [];
    const scopeSummary = typeof payload.scopeSummary === "string" ? sanitize(payload.scopeSummary, 2000) : "";

    // ── Build internal notification email for admins ──
    const internalRows: [string, string][] = [
      ["Name", sanitize(name)],
      ["Email", sanitize(email)],
      ["Company", sanitize(company)],
      ["Event Date", eventDate],
      ["Complexity Level", complexityLevel],
      ["Starting Price", startingPrice],
      ["Cvent Products", cventProducts],
    ];

    if (attendeeHubSelected) {
      internalRows.push(["Attendee Hub", "✅ Selected"]);
      if (attendeeHubFeatures.length > 0) {
        internalRows.push(["App Features", attendeeHubFeatures.join(", ")]);
      }
    }

    const tableRowsHtml = internalRows
      .map(
        ([field, value]) => `
        <tr>
          <td style="padding:10px 14px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;white-space:nowrap;vertical-align:top;width:35%;">${field}</td>
          <td style="padding:10px 14px;border:1px solid #d1d5db;vertical-align:top;">${value}</td>
        </tr>`
      )
      .join("");

    // Calculate estimated total for emails
    const buildPriceNum = parseInt(startingPrice.replace(/[$,]/g, ''), 10) || 0;
    const hubPriceNum = attendeeHubSelected ? 1999 : 0;
    const estimatedTotal = buildPriceNum + hubPriceNum;
    const fmtPrice = (n: number) => `$${n.toLocaleString()}`;

    const investmentSummaryHtml = attendeeHubSelected
      ? `<div style="background:#f0f9ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px 20px;margin-top:16px;">
           <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#374151;">💰 Estimated Starting Investment</p>
           <table style="width:100%;border-collapse:collapse;">
             <tr><td style="padding:4px 0;font-size:14px;color:#6b7280;">Event Build</td><td style="padding:4px 0;font-size:14px;text-align:right;">${startingPrice}</td></tr>
             <tr><td style="padding:4px 0;font-size:14px;color:#6b7280;">Event App Module</td><td style="padding:4px 0;font-size:14px;text-align:right;">$1,999</td></tr>
             <tr><td colspan="2" style="border-top:1px solid #d1d5db;padding-top:8px;"></td></tr>
             <tr><td style="padding:4px 0;font-size:14px;font-weight:700;color:#111827;">Estimated Total</td><td style="padding:4px 0;font-size:14px;font-weight:700;color:#006AE1;text-align:right;">${fmtPrice(estimatedTotal)}</td></tr>
           </table>
         </div>`
      : "";

    const internalHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="font-family:'Inter',Arial,sans-serif;color:#111827;background:#ffffff;margin:0;padding:24px;">
  <div style="max-width:700px;margin:0 auto;">
    <div style="background:#006AE1;padding:24px 32px;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-family:'Space Grotesk',Arial,sans-serif;">
        🎯 New Calculator Lead Capture
      </h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
        ${sanitize(name)} from ${sanitize(company)} · ${complexityLevel} Event${attendeeHubSelected ? " + Event App" : ""}
      </p>
    </div>
    <table style="width:100%;border-collapse:collapse;border:1px solid #d1d5db;border-top:none;">
      ${tableRowsHtml}
    </table>
    ${investmentSummaryHtml}
    ${scopeSummary ? `
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;margin-top:16px;">
      <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#374151;">📋 Event Build Scope</p>
      <ul style="margin:0;padding-left:20px;">
        ${scopeSummary.split("\n").filter(Boolean).map(b => `<li style="font-size:13px;color:#374151;padding:2px 0;">${b.replace(/^[•·]\s*/, "")}</li>`).join("")}
      </ul>
    </div>` : ""}
    <div style="padding:20px;background:#f0f9ff;border:1px solid #d1d5db;border-top:none;border-radius:0 0 8px 8px;">
      <p style="margin:0;font-size:14px;color:#374151;">
        <strong>Action Required:</strong> Follow up with this lead within 24 hours.
      </p>
    </div>
    <p style="margin-top:24px;font-size:12px;color:#6b7280;">
      This email was sent automatically from the LaunchHouse Events Complexity Calculator.
    </p>
  </div>
</body>
</html>`;

    // ── Build confirmation email for the lead ──
    const confirmationHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="font-family:'Inter',Arial,sans-serif;color:#111827;background:#ffffff;margin:0;padding:24px;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="background:#006AE1;padding:24px 32px;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-family:'Space Grotesk',Arial,sans-serif;">
        Your Event Complexity Results
      </h1>
    </div>
    <div style="padding:32px;border:1px solid #d1d5db;border-top:none;border-radius:0 0 8px 8px;">
      <p style="margin:0 0 16px;font-size:16px;">Hi ${sanitize(name)},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        Thank you for using the LaunchHouse Events Complexity Calculator! Based on your answers, here's a summary of your event:
      </p>
      
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#6b7280;width:50%;">Event Complexity:</td>
            <td style="padding:8px 0;font-size:14px;font-weight:600;color:#111827;">${complexityLevel}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#6b7280;">Starting Price:</td>
            <td style="padding:8px 0;font-size:14px;font-weight:600;color:#006AE1;">${startingPrice}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#6b7280;">Event Date:</td>
            <td style="padding:8px 0;font-size:14px;color:#111827;">${eventDate}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#6b7280;">Recommended Products:</td>
            <td style="padding:8px 0;font-size:14px;color:#111827;">${cventProducts}</td>
          </tr>
        </table>
      </div>
      ${attendeeHubSelected ? `
      <div style="background:#f0f9ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#111827;">📱 Attendee Hub / Event App</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:4px 0;font-size:14px;color:#6b7280;">Module Price:</td>
            <td style="padding:4px 0;font-size:14px;font-weight:600;color:#006AE1;">$1,999</td>
          </tr>
          ${attendeeHubFeatures.length > 0 ? `<tr>
            <td style="padding:4px 0;font-size:14px;color:#6b7280;">Selected Features:</td>
            <td style="padding:4px 0;font-size:14px;color:#111827;">${attendeeHubFeatures.join(", ")}</td>
          </tr>` : ""}
          <tr><td colspan="2" style="border-top:1px solid #d1d5db;padding-top:8px;"></td></tr>
          <tr>
            <td style="padding:4px 0;font-size:14px;font-weight:700;color:#111827;">Estimated Total:</td>
            <td style="padding:4px 0;font-size:14px;font-weight:700;color:#006AE1;">${fmtPrice(estimatedTotal)}</td>
          </tr>
        </table>
      </div>
      ` : ""}
      ${scopeSummary ? `
      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:24px;">
        <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#111827;">📋 Your Event Build Scope</p>
        <ul style="margin:0;padding-left:20px;">
          ${scopeSummary.split("\\n").filter(Boolean).map(b => `<li style="font-size:14px;color:#374151;padding:3px 0;">${b.replace(/^[•·]\s*/, "")}</li>`).join("")}
        </ul>
      </div>
      ` : ""}
      
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        A member of our team will reach out to you within <strong>24 hours</strong> to discuss your event needs and provide a customized proposal.
      </p>
      
      <div style="text-align:center;margin:24px 0;">
        <a href="https://launchhouse.events" style="display:inline-block;background:#006AE1;color:#ffffff;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;">
          Visit Our Website
        </a>
      </div>
      
      <div style="background:#f0f9ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#374151;">Need to speak with us sooner?</p>
        <p style="margin:0 0 4px;font-size:14px;color:#374151;">
          📧 <a href="mailto:sam@launchhouse.events" style="color:#1d4ed8;text-decoration:underline;">sam@launchhouse.events</a>
        </p>
        <p style="margin:0 0 4px;font-size:14px;color:#374151;">
          📞 <strong>India:</strong> <a href="tel:+919999063734" style="color:#1d4ed8;text-decoration:underline;">+91 9999 063 734</a>
        </p>
        <p style="margin:0 0 4px;font-size:14px;color:#374151;">
          📞 <strong>US:</strong> <a href="tel:+15714448523" style="color:#1d4ed8;text-decoration:underline;">+1 (571) 444-8523</a>
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

    const internalSubject = `🎯 New Calculator Lead: ${sanitize(name)} (${complexityLevel} Event)`;

    const results = [];

    // Send to first admin
    results.push(
      await sendEmail({
        from: "LaunchHouse Events <noreply@launchhouse.events>",
        to: ["snehdeep@launchhouse.events"],
        subject: internalSubject,
        html: internalHtml,
      })
    );
    await sleep(600);

    // Send to second admin
    results.push(
      await sendEmail({
        from: "LaunchHouse Events <noreply@launchhouse.events>",
        to: ["sam@launchhouse.events"],
        subject: internalSubject,
        html: internalHtml,
      })
    );
    await sleep(600);

    // Send confirmation to the lead
    results.push(
      await sendEmail({
        from: "LaunchHouse Events <noreply@launchhouse.events>",
        to: [email],
        subject: `Your Event Complexity Results — LaunchHouse Events`,
        html: confirmationHtml,
      })
    );

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("send-lead-notification error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "An error occurred while sending notifications." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
