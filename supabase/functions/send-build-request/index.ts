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
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const payload = await req.json();

    // Build plain-text table of all fields
    const rows: [string, string][] = [
      // Page 1
      ["First Name", payload.firstName ?? ""],
      ["Last Name", payload.lastName ?? ""],
      ["Email Address", payload.email ?? ""],
      ["Company Name", payload.companyName ?? ""],
      // Page 2 - contacts
      ...(Array.isArray(payload.contacts)
        ? payload.contacts.map((c: { fullName: string; email: string }, i: number) => [
            `Point of Contact ${i + 1}${i === 0 ? " (Primary)" : ""}`,
            `${c.fullName} <${c.email}>`,
          ] as [string, string])
        : [["Points of Contact", "N/A"] as [string, string]]),
      ["Contact Number of Primary POC", payload.primaryPocPhone ?? ""],
      ["Preferred Time Zone (Kick Off)", payload.kickoffTimezone ?? ""],
      ["Kick Off Preference 1 – Date", payload.kickoffDate1 ?? ""],
      ["Kick Off Preference 1 – Time", payload.kickoffTime1 ?? ""],
      ["Kick Off Preference 2 – Date", payload.kickoffDate2 ?? "N/A"],
      ["Kick Off Preference 2 – Time", payload.kickoffTime2 ?? "N/A"],
      ["Solutions to Include", Array.isArray(payload.chosenSolutions) ? payload.chosenSolutions.join(", ") : (payload.chosenSolutions ?? "")],
      // Page 3
      ["Account Number", payload.accountNumber ?? ""],
      ["Planner First Name", payload.plannerFirstName ?? ""],
      ["Planner Last Name", payload.plannerLastName ?? ""],
      ["Planner Email Address", payload.plannerEmail ?? ""],
      ["Event Title", payload.eventTitle ?? ""],
      ["Event Start Date", payload.eventStartDate ?? ""],
      ["Event Start Time", payload.eventStartTime ?? ""],
      ["Event End Date", payload.eventEndDate ?? ""],
      ["Event End Time", payload.eventEndTime ?? ""],
      ["Event Time Zone", payload.eventTimezone ?? ""],
      ["Expected Go Live Date", payload.goLiveDate ?? ""],
      ["Additional Information", payload.additionalInfo ?? "N/A"],
    ];

    // Build an HTML email body with a styled table
    const tableRows = rows
      .map(
        ([field, value]) => `
        <tr>
          <td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;white-space:nowrap;vertical-align:top;width:35%;">${field}</td>
          <td style="padding:8px 12px;border:1px solid #d1d5db;vertical-align:top;">${value.replace(/\n/g, "<br/>")}</td>
        </tr>`
      )
      .join("");

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="font-family:'Inter',Arial,sans-serif;color:#111827;background:#ffffff;margin:0;padding:24px;">
  <div style="max-width:700px;margin:0 auto;">
    <div style="background:#006AE1;padding:24px 32px;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-family:'Space Grotesk',Arial,sans-serif;">
        New Event Build Request
      </h1>
      <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
        Submitted by ${payload.firstName ?? ""} ${payload.lastName ?? ""} · ${payload.email ?? ""}
      </p>
    </div>
    <table style="width:100%;border-collapse:collapse;border:1px solid #d1d5db;border-top:none;">
      ${tableRows}
    </table>
    <p style="margin-top:24px;font-size:12px;color:#6b7280;">
      This email was sent automatically from the LaunchHouse Events Build Request form.
    </p>
  </div>
</body>
</html>`;

    const subject = `New Build Request – ${payload.eventTitle ?? "Untitled Event"} (${payload.companyName ?? ""})`;

    const internalRecipients = [
      { email: "sam@launchhouse.events", name: "Sam" },
      { email: "snehdeep@launchhouse.events", name: "Snehdeep" },
    ];

    // Confirmation email HTML for the submitter
    const confirmationHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="font-family:'Inter',Arial,sans-serif;color:#111827;background:#ffffff;margin:0;padding:24px;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="background:#006AE1;padding:24px 32px;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-family:'Space Grotesk',Arial,sans-serif;">
        Thank You for Your Build Request!
      </h1>
    </div>
    <div style="padding:32px;border:1px solid #d1d5db;border-top:none;border-radius:0 0 8px 8px;">
      <p style="margin:0 0 16px;font-size:16px;">Hi ${payload.firstName ?? ""},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        Thank you for submitting your event build request for <strong>${payload.eventTitle ?? "your event"}</strong>. We've received everything and our team will be in touch shortly to confirm your kick-off call.
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        Here's a quick summary of what you submitted:
      </p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr>
          <td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;width:40%;vertical-align:top;">Event</td>
          <td style="padding:8px 12px;border:1px solid #d1d5db;vertical-align:top;">${payload.eventTitle ?? ""}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;vertical-align:top;">Company</td>
          <td style="padding:8px 12px;border:1px solid #d1d5db;vertical-align:top;">${payload.companyName ?? ""}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;vertical-align:top;">Kick-off Preference 1</td>
          <td style="padding:8px 12px;border:1px solid #d1d5db;vertical-align:top;">${payload.kickoffDate1 ?? ""} at ${payload.kickoffTime1 ?? ""} (${payload.kickoffTimezone ?? ""})</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;vertical-align:top;">Solutions Requested</td>
          <td style="padding:8px 12px;border:1px solid #d1d5db;vertical-align:top;">${Array.isArray(payload.chosenSolutions) ? payload.chosenSolutions.join(", ") : (payload.chosenSolutions ?? "")}</td>
        </tr>
      </table>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">
        If you have any questions in the meantime, feel free to reply to this email.
      </p>
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

    
    // Send sequentially to respect Resend's 2 req/sec rate limit
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

    const results = [];
    results.push(await sendEmail({ from: "LaunchHouse Events <noreply@launchhouse.events>", to: ["sam@launchhouse.events"], subject, html: htmlBody }));
    await sleep(600);
    results.push(await sendEmail({ from: "LaunchHouse Events <noreply@launchhouse.events>", to: ["snehdeep@launchhouse.events"], subject, html: htmlBody }));
    await sleep(600);
    results.push(await sendEmail({ from: "LaunchHouse Events <noreply@launchhouse.events>", to: [payload.email], subject: `We've received your build request – ${payload.eventTitle ?? "Your Event"}`, html: confirmationHtml }));

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: unknown) {
    console.error("send-build-request error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
