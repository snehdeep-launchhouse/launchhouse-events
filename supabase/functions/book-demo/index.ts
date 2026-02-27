import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function base64url(data: Uint8Array): string {
  let binary = "";
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getGoogleAccessToken(serviceAccountJson: string, scopes: string): Promise<string> {
  const sa = JSON.parse(serviceAccountJson);
  const now = Math.floor(Date.now() / 1000);

  const header = base64url(new TextEncoder().encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const claimSet = base64url(
    new TextEncoder().encode(
      JSON.stringify({
        iss: sa.client_email,
        scope: scopes,
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
      })
    )
  );

  const signingInput = `${header}.${claimSet}`;
  const pemBody = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const keyData = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8", keyData,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]
  );

  const signature = base64url(
    new Uint8Array(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(signingInput)))
  );

  const jwt = `${signingInput}.${signature}`;
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  const tokenJson = await tokenRes.json();
  if (!tokenRes.ok) throw new Error(`Google token error: ${JSON.stringify(tokenJson)}`);
  return tokenJson.access_token;
}

async function sendEmail(apiKey: string, body: object) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Resend API error [${res.status}]: ${JSON.stringify(json)}`);
  return json;
}

function formatTime12h(time24: string): string {
  const [h, m] = time24.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function buildConfirmationEmail(payload: {
  firstName: string;
  products: string[];
  date: string;
  time: string;
  timezone: string;
  meetLink: string;
  eventLink: string;
  attendees: string[];
}): string {
  const attendeeList = payload.attendees.length > 0
    ? `<tr><td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;vertical-align:top;">Additional Attendees</td><td style="padding:8px 12px;border:1px solid #d1d5db;vertical-align:top;">${payload.attendees.join(", ")}</td></tr>`
    : "";

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="font-family:'Inter',Arial,sans-serif;color:#111827;background:#ffffff;margin:0;padding:24px;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="background:#006AE1;padding:24px 32px;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-family:'Space Grotesk',Arial,sans-serif;">Your Demo is Confirmed!</h1>
    </div>
    <div style="padding:32px;border:1px solid #d1d5db;border-top:none;border-radius:0 0 8px 8px;">
      <p style="margin:0 0 16px;font-size:16px;">Hi ${payload.firstName},</p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">Your demo has been scheduled. Here are the details:</p>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
        <tr><td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;vertical-align:top;width:40%;">Product(s)</td><td style="padding:8px 12px;border:1px solid #d1d5db;vertical-align:top;">${payload.products.join(", ")}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;vertical-align:top;">Date</td><td style="padding:8px 12px;border:1px solid #d1d5db;vertical-align:top;">${payload.date}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;vertical-align:top;">Time</td><td style="padding:8px 12px;border:1px solid #d1d5db;vertical-align:top;">${formatTime12h(payload.time)} ET</td></tr>
        ${attendeeList}
      </table>
      <p style="margin:0 0 16px;">
        <a href="${payload.meetLink}" style="display:inline-block;background:#006AE1;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">Join Google Meet</a>
      </p>
      <p style="margin:0 0 16px;font-size:14px;color:#374151;">
        Need to reschedule? <a href="${payload.eventLink}" style="color:#006AE1;text-decoration:underline;">Open in Google Calendar</a>
      </p>
      <p style="margin:0 0 16px;font-size:15px;color:#374151;">If you have any questions, feel free to reply to this email.</p>
      <p style="margin:0;font-size:15px;color:#374151;">Warm regards,<br/><strong>The LaunchHouse Events Team</strong></p>
    </div>
    <p style="margin-top:24px;font-size:12px;color:#6b7280;text-align:center;">LaunchHouse Events · This is an automated confirmation email.</p>
  </div>
</body></html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceAccountKey = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY");
    const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID");
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

    if (!serviceAccountKey || !calendarId) throw new Error("Google Calendar secrets not configured");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const payload = await req.json();
    const { firstName, lastName, email, products, date, time, timezone, additionalAttendees } = payload;

    if (!firstName || !lastName || !email || !products?.length || !date || !time || !timezone) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = await getGoogleAccessToken(
      serviceAccountKey,
      "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events"
    );

    // Build event start/end times
    const startDateTime = `${date}T${time}:00`;
    const endHour = parseInt(time.split(":")[0]) ;
    const endMin = parseInt(time.split(":")[1]) + 30;
    const endH = endHour + Math.floor(endMin / 60);
    const endM = endMin % 60;
    const endDateTime = `${date}T${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}:00`;

    const extraAttendees: string[] = Array.isArray(additionalAttendees) ? additionalAttendees : [];
    const productsSummary = products.join(", ");

    // Build description with contact info (attendees array removed to avoid 403 with service accounts)
    let description = `Demo requested by ${firstName} ${lastName} (${email}).\nProducts: ${productsSummary}`;
    if (extraAttendees.length > 0) {
      description += `\n\nAdditional Attendees:\n${extraAttendees.filter(a => a && a !== email).join("\n")}`;
    }

    // Create Google Calendar event (NO attendees, NO conferenceData to avoid service account errors)
    const eventRes = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary: `LaunchHouse Events Demo — ${productsSummary}`,
          description,
          start: { dateTime: startDateTime, timeZone: timezone },
          end: { dateTime: endDateTime, timeZone: timezone },
          reminders: { useDefault: true },
        }),
      }
    );

    const eventData = await eventRes.json();
    if (!eventRes.ok) {
      throw new Error(`Calendar event creation failed: ${JSON.stringify(eventData)}`);
    }

    const meetLink = eventData.hangoutLink || ""; // Will be empty without conferenceData
    const eventLink = eventData.htmlLink || "";
    const eventId = eventData.id || "";

    // Insert into demo_requests
    const { error: dbError } = await supabase.from("demo_requests").insert({
      first_name: firstName,
      last_name: lastName,
      business_email: email,
      selected_products: products,
      scheduled_date: date,
      scheduled_time: time,
      additional_attendees: extraAttendees,
      google_event_id: eventId,
      google_meet_link: meetLink,
      google_event_link: eventLink,
      status: "confirmed",
    });

    if (dbError) console.error("DB insert error:", dbError);

    // Send confirmation emails
    const from = "LaunchHouse Events <noreply@launchhouse.events>";
    const allRecipients = [email, ...extraAttendees.filter((a) => a !== email)];
    const confirmHtml = buildConfirmationEmail({
      firstName,
      products,
      date,
      time,
      timezone,
      meetLink,
      eventLink,
      attendees: extraAttendees,
    });

    // Send to all recipients
    for (const recipient of allRecipients) {
      try {
        await sendEmail(RESEND_API_KEY, {
          from,
          to: [recipient],
          subject: `Demo Confirmed — ${productsSummary} | LaunchHouse Events`,
          html: confirmHtml,
        });
      } catch (emailErr) {
        console.error(`Failed to send email to ${recipient}:`, emailErr);
      }
      // Rate limit
      await new Promise((r) => setTimeout(r, 600));
    }

    // Also send internal notification
    const internalSubject = `New Demo Booking — ${firstName} ${lastName} (${productsSummary})`;
    const internalHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="font-family:'Inter',Arial,sans-serif;color:#111827;background:#ffffff;margin:0;padding:24px;">
  <div style="max-width:600px;margin:0 auto;">
    <div style="background:#006AE1;padding:24px 32px;border-radius:8px 8px 0 0;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-family:'Space Grotesk',Arial,sans-serif;">New Demo Booking</h1>
    </div>
    <div style="padding:32px;border:1px solid #d1d5db;border-top:none;border-radius:0 0 8px 8px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;">Name</td><td style="padding:8px 12px;border:1px solid #d1d5db;">${firstName} ${lastName}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;">Email</td><td style="padding:8px 12px;border:1px solid #d1d5db;">${email}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;">Products</td><td style="padding:8px 12px;border:1px solid #d1d5db;">${productsSummary}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;">Date</td><td style="padding:8px 12px;border:1px solid #d1d5db;">${date}</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;">Time</td><td style="padding:8px 12px;border:1px solid #d1d5db;">${formatTime12h(time)} ET</td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;">Meet Link</td><td style="padding:8px 12px;border:1px solid #d1d5db;"><a href="${meetLink}">${meetLink}</a></td></tr>
        <tr><td style="padding:8px 12px;border:1px solid #d1d5db;background:#f9fafb;font-weight:600;">Additional Attendees</td><td style="padding:8px 12px;border:1px solid #d1d5db;">${extraAttendees.length ? extraAttendees.join(", ") : "None"}</td></tr>
      </table>
    </div>
  </div>
</body></html>`;

    try {
      await sendEmail(RESEND_API_KEY, {
        from,
        to: ["sam@launchhouse.events"],
        subject: internalSubject,
        html: internalHtml,
      });
      await new Promise((r) => setTimeout(r, 600));
      await sendEmail(RESEND_API_KEY, {
        from,
        to: ["snehdeep@launchhouse.events"],
        subject: internalSubject,
        html: internalHtml,
      });
    } catch (intErr) {
      console.error("Internal email error:", intErr);
    }

    return new Response(
      JSON.stringify({
        success: true,
        meetLink,
        eventLink,
        eventId,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("book-demo error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
