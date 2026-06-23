import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { isAllowedOrigin, hashedIp, makeCooldown } from "../_shared/abuse-guard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_DESCRIPTION_LEN = 2000;
// Best-effort, instance-local: ~10 calls per minute per IP.
const rateLimiter = makeCooldown(60_000, 10);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Strict Origin allow-list — only the public site / preview may invoke this.
  if (!isAllowedOrigin(req.headers.get("origin"))) {
    return new Response(JSON.stringify({ error: "Forbidden." }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Best-effort per-IP cooldown (instance-local, not durable).
  const ipKey = await hashedIp(req);
  if (ipKey && rateLimiter.isLimited(ipKey)) {
    return new Response(JSON.stringify({ error: "Too many requests. Please try again shortly." }), {
      status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { description } = await req.json();
    if (!description || typeof description !== "string" || description.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Description is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (description.length > MAX_DESCRIPTION_LEN) {
      return new Response(JSON.stringify({ error: `Description must be ${MAX_DESCRIPTION_LEN} characters or fewer.` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an event complexity analyzer. Given an event description, infer answers and respond with ONLY a valid JSON object (no markdown, no code fences).

Return this exact JSON structure with these allowed values:

{
  "event_length": <1|2|3|4>,
  "sessions": <1|2|3>,
  "reg_paths": <1|2|3>,
  "contact_types": <1|2|3>,
  "reg_rules": <0|1|3>,
  "hotel": <0|2>,
  "languages": <0|2>,
  "integrations": <0|3>,
  "speakers": <0|2>,
  "appointments": <0|2>,
  "pages": <1|2|3>,
  "branding": <1|3>,
  "cvent_products": [<array of strings from: "Registration & Event Website", "Appointments", "Abstract / Call for Speakers", "Attendee Hub / Event App">]
}

Field meanings:
- event_length: 1=1day, 2=2days, 3=3days, 4=4+days
- sessions: 1=under10, 2=10-30, 3=30+
- reg_paths: 1=one, 2=two-three, 3=four+
- contact_types: 1=one, 2=two-three, 3=four+
- reg_rules: 0=none, 1=1-2rules, 3=3+rules
- hotel: 0=no, 2=yes
- languages: 0=no(single), 2=yes(multiple)
- integrations: 0=no, 3=yes(CRM/marketing)
- speakers: 0=no, 2=yes
- appointments: 0=no, 2=yes
- pages: 1=1-3pages, 2=4-7pages, 3=8+pages
- branding: 1=standard, 3=advanced custom

If uncertain, choose the most reasonable estimate. Always return ALL fields. Return ONLY the JSON object.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: description.trim() },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      console.error("Empty AI response:", JSON.stringify(data).slice(0, 500));
      throw new Error("Empty AI response");
    }

    // Clean potential markdown fences
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const analysis = JSON.parse(cleaned);

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-event error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});