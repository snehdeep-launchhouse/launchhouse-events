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

function sanitizeList(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val
    .map((v) => (typeof v === "string" ? sanitize(v) : ""))
    .filter((s) => s.length > 0);
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

    // Public-safe data only: no internal hours, scores, signals, or platform-specific wording.
    const complexityLevel = sanitize(payload.complexityLevel) || "Not specified";
    const startingPrice = sanitize(payload.startingPrice) || "Contact for pricing";
    const firstDraft = sanitize(payload.firstDraft) || "—";
    const revisionTurnaround = sanitize(payload.revisionTurnaround) || "—";
    const eventDate = payload.eventDate ? sanitize(payload.eventDate) : "Not specified";
    const selectedServices = sanitizeList(payload.selectedServices);
    const eventAppSelected = payload.eventAppSelected === true;
    const eventAppFeatures = sanitizeList(payload.eventAppFeatures);
    const confidenceLevel = sanitize(payload.confidenceLevel);
    const confidenceReasons = sanitizeList(payload.confidenceReasons);
    const manualReviewRequired = payload.manualReviewRequired === true;
    const manualReviewReasons = sanitizeList(payload.manualReviewReasons);
    const keyDrivers = sanitizeList(payload.keyDrivers);
    const scopeBullets = sanitizeList(payload.scopeBullets);

    // ── Investment math (build + Event App add-on) ──
    const buildPriceNum = parseInt(startingPrice.replace(/[$,]/g, ""), 10) || 0;
    const appPriceNum = eventAppSelected ? 1999 : 0;
    const estimatedTotal = buildPriceNum + appPriceNum;
    const fmtPrice = (n: number) => `$${n.toLocaleString()}`;

    const servicesText = selectedServices.length > 0
      ? selectedServices.join(", ")
      : "None selected";

    // ── Admin email ──
    const adminRows: [string, string][] = [
      ["Name", sanitize(name)],
      ["Email", sanitize(email)],
      ["Company", sanitize(company)],
      ["Event Date", eventDate],
      ["Complexity Tier", complexityLevel],
      ["Starting Price", startingPrice],
      ["First Draft", firstDraft],
      ["Revision Turnaround", revisionTurnaround],
      ["Selected Services", servicesText],
    ];

    if (eventAppSelected) {
      adminRows.push(["Event App", "✅ Selected"]);
      if (eventAppFeatures.length > 0) {
        adminRows.push(["App Features", eventAppFeatures.join(", ")]);
      }
    }

    if (confidenceLevel) {
      adminRows.push([
        "Confidence",
        confidenceLevel.charAt(0).toUpperCase() + confidenceLevel.slice(1),
      ]);
    }

    const adminTableRowsHtml = adminRows
      .map(
        ([field, value]) => `
        <tr>
          <td style="padding:10px 14px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;white-space:nowrap;vertical-align:top;width:35%;">${field}</td>
          <td style="padding:10px 14px;border:1px solid #d1d5db;vertical-align:top;">${value}</td>
        </tr>`
      )
      .join("");

    const investmentHtml = eventAppSelected
      ? `<div style="background:#f0f9ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px 20px;margin-top:16px;">
           <p style="margin:0 0 8px;font-size:14px;font-weight:600;color:#374151;">💰 Estimated Starting Investment</p>
           <table style="width:100%;border-collapse:collapse;">
             <tr><td style="padding:4px 0;font-size:14px;color:#6b7280;">Event Build</td><td style="padding:4px 0;font-size:14px;text-align:right;">${startingPrice}</td></tr>
             <tr><td style="padding:4px 0;font-size:14px;color:#6b7280;">Event App add-on</td><td style="padding:4px 0;font-size:14px;text-align:right;">$1,999</td></tr>
             <tr><td colspan="2" style="border-top:1px solid #d1d5db;padding-top:8px;"></td></tr>
             <tr><td style="padding:4px 0;font-size:14px;font-weight:700;color:#111827;">Estimated Total</td><td style="padding:4px 0;font-size:14px;font-weight:700;color:#006AE1;text-align:right;">${fmtPrice(estimatedTotal)}</td></tr>
           </table>
         </div>`
      : "";

    const renderBulletList = (items: string[]) =>
      items.length > 0
        ? `<ul style="margin:0;padding-left:20px;">${items
            .map(
              (b) =>
                `<li style="font-size:13px;color:#374151;padding:2px 0;">${b}</li>`,
            )
            .join("")}</ul>`
        : "";

    const confidenceSectionHtml = confidenceReasons.length > 0
      ? `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;margin-top:16px;">
          <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#374151;">📊 Confidence notes</p>
          ${renderBulletList(confidenceReasons)}
        </div>`
      : "";

    const manualReviewSectionHtml = manualReviewRequired && manualReviewReasons.length > 0
      ? `<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px 20px;margin-top:16px;">
          <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#9a3412;">⚠️ Scoping call recommended</p>
          ${renderBulletList(manualReviewReasons)}
        </div>`
      : "";

    const keyDriversSectionHtml = keyDrivers.length > 0
      ? `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;margin-top:16px;">
          <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#374151;">🔑 Key complexity drivers</p>
          ${renderBulletList(keyDrivers)}
        </div>`
      : "";

    const scopeSectionHtml = scopeBullets.length > 0
      ? `<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px 20px;margin-top:16px;">
          <p style="margin:0 0 10px;font-size:14px;font-weight:600;color:#374151;">📋 Event Build Scope</p>
          ${renderBulletList(scopeBullets)}
        </div>`
      : "";

    const adminHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="font-family:'Inter',Arial,sans-serif;color:#111827;background:#ffffff;margin:0;padding:24px;">
  <div style="max-width:700px;margin:0 auto;">
    <div style="background:#006AE1;padding:24px 32px;border-radius:8px 8px 0 0;">
      <span style="display:inline-block;background:#fbbf24;color:#111827;font-size:11px;font-weight:700;padding:3px 8px;border-radius:4px;margin-bottom:8px;letter-spacing:0.5px;">V2 BETA</span>
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-family:'Space Grotesk',Arial,sans-serif;">
        🎯 New Calculator Lead Capture
      </h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
        ${sanitize(name)} from ${sanitize(company)} · ${complexityLevel} Event${eventAppSelected ? " + Event App" : ""}
      </p>
      <p style="margin:4px 0 0;color:rgba(255,255,255,0.7);font-size:12px;">Submitted via Calculator V2 (BETA)</p>
    </div>
    <table style="width:100%;border-collapse:collapse;border:1px solid #d1d5db;border-top:none;">
      ${adminTableRowsHtml}
    </table>
    ${investmentHtml}
    ${confidenceSectionHtml}
    ${manualReviewSectionHtml}
    ${keyDriversSectionHtml}
    ${scopeSectionHtml}
    <div style="padding:20px;background:#f0f9ff;border:1px solid #d1d5db;border-top:none;border-radius:0 0 8px 8px;margin-top:16px;">
      <p style="margin:0;font-size:14px;color:#374151;">
        <strong>Action Required:</strong> Follow up with this lead within 24 hours.
      </p>
    </div>
    <p style="margin-top:24px;font-size:12px;color:#6b7280;">
      Sent automatically from Calculator V2 (BETA). This V2 funnel is being validated alongside V1.
    </p>
  </div>
</body>
</html>`;

    // ── Lead confirmation email (public-safe only) ──
    const leadAppSectionHtml = eventAppSelected
      ? `<div style="background:#f0f9ff;border:1px solid #bfdbfe;border-radius:8px;padding:20px;margin-bottom:24px;">
          <p style="margin:0 0 12px;font-size:15px;font-weight:600;color:#111827;">📱 Event App add-on</p>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:4px 0;font-size:14px;color:#6b7280;">Add-on price:</td>
              <td style="padding:4px 0;font-size:14px;font-weight:600;color:#006AE1;">$1,999</td>
            </tr>
            ${eventAppFeatures.length > 0 ? `<tr>
              <td style="padding:4px 0;font-size:14px;color:#6b7280;">Selected features:</td>
              <td style="padding:4px 0;font-size:14px;color:#111827;">${eventAppFeatures.join(", ")}</td>
            </tr>` : ""}
            <tr><td colspan="2" style="border-top:1px solid #d1d5db;padding-top:8px;"></td></tr>
            <tr>
              <td style="padding:4px 0;font-size:14px;font-weight:700;color:#111827;">Estimated Total:</td>
              <td style="padding:4px 0;font-size:14px;font-weight:700;color:#006AE1;">${fmtPrice(estimatedTotal)}</td>
            </tr>
          </table>
        </div>`
      : "";

    const leadHtml = `
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
        Thank you for using the LaunchHouse Events Complexity Calculator. Based on your answers, here is a summary of your event:
      </p>

      <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#6b7280;width:50%;">Complexity Tier:</td>
            <td style="padding:8px 0;font-size:14px;font-weight:600;color:#111827;">${complexityLevel}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#6b7280;">Starting Price:</td>
            <td style="padding:8px 0;font-size:14px;font-weight:600;color:#006AE1;">${startingPrice}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#6b7280;">First Draft:</td>
            <td style="padding:8px 0;font-size:14px;color:#111827;">${firstDraft}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#6b7280;">Revision Turnaround:</td>
            <td style="padding:8px 0;font-size:14px;color:#111827;">${revisionTurnaround}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#6b7280;">Event Date:</td>
            <td style="padding:8px 0;font-size:14px;color:#111827;">${eventDate}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:14px;color:#6b7280;">Selected Services:</td>
            <td style="padding:8px 0;font-size:14px;color:#111827;">${servicesText}</td>
          </tr>
        </table>
      </div>

      ${leadAppSectionHtml}

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

    const adminSubject = `[V2 BETA] 🎯 New Calculator Lead: ${sanitize(name)} (${complexityLevel} Event)`;

    const results = [];

    results.push(
      await sendEmail({
        from: "LaunchHouse Events <noreply@launchhouse.events>",
        to: ["snehdeep@launchhouse.events"],
        subject: adminSubject,
        html: adminHtml,
      })
    );
    await sleep(600);

    results.push(
      await sendEmail({
        from: "LaunchHouse Events <noreply@launchhouse.events>",
        to: ["sam@launchhouse.events"],
        subject: adminSubject,
        html: adminHtml,
      })
    );
    await sleep(600);

    results.push(
      await sendEmail({
        from: "LaunchHouse Events <noreply@launchhouse.events>",
        to: [email],
        subject: `Your Event Complexity Results — LaunchHouse Events`,
        html: leadHtml,
      })
    );

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("send-lead-notification-v2 error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "An error occurred while sending notifications." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
