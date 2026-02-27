import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

async function getGoogleAccessToken(serviceAccountJson: string): Promise<string> {
  const sa = JSON.parse(serviceAccountJson);
  const now = Math.floor(Date.now() / 1000);

  const header = base64url(new TextEncoder().encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const claimSet = base64url(
    new TextEncoder().encode(
      JSON.stringify({
        iss: sa.client_email,
        scope: "https://www.googleapis.com/auth/calendar.readonly",
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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const serviceAccountKey = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_KEY");
    const calendarId = Deno.env.get("GOOGLE_CALENDAR_ID");
    if (!serviceAccountKey || !calendarId) {
      throw new Error("Google Calendar secrets not configured");
    }

    const { date, timezone } = await req.json();
    if (!date || !timezone) {
      return new Response(JSON.stringify({ error: "date and timezone are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = await getGoogleAccessToken(serviceAccountKey);

    const dayStart = `${date}T00:00:00`;
    const dayEnd = `${date}T23:59:59`;

    const freeBusyRes = await fetch(
      "https://www.googleapis.com/calendar/v3/freeBusy",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          timeMin: new Date(`${dayStart}`).toISOString(),
          timeMax: new Date(`${dayEnd}`).toISOString(),
          timeZone: timezone,
          items: [{ id: calendarId }],
        }),
      }
    );

    const freeBusyData = await freeBusyRes.json();
    if (!freeBusyRes.ok) {
      throw new Error(`FreeBusy API error: ${JSON.stringify(freeBusyData)}`);
    }

    const busySlots = freeBusyData.calendars?.[calendarId]?.busy ?? [];

    // Generate all 30-minute slots from 9 AM to 5:30 PM and mark each as available or busy
    const slots: Array<{ time: string; available: boolean }> = [];
    for (let hour = 9; hour < 18; hour++) {
      for (let min = 0; min < 60; min += 30) {
        const slotStart = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
        const slotStartDate = new Date(`${date}T${slotStart}:00`);
        const slotEndDate = new Date(slotStartDate.getTime() + 30 * 60 * 1000);

        const isBusy = busySlots.some((busy: { start: string; end: string }) => {
          const busyStart = new Date(busy.start).getTime();
          const busyEnd = new Date(busy.end).getTime();
          return slotStartDate.getTime() < busyEnd && slotEndDate.getTime() > busyStart;
        });

        slots.push({ time: slotStart, available: !isBusy });
      }
    }

    return new Response(JSON.stringify({ slots, date, timezone }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("get-demo-availability error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
