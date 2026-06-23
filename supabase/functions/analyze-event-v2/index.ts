import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { isAllowedOrigin, hashedIp, makeCooldown } from "../_shared/abuse-guard.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const MAX_DESCRIPTION_LEN = 2000;
const rateLimiter = makeCooldown(60_000, 10);

// V2 allowed values per question — must match src/lib/calculator-v2/questions.ts.
const ALLOWED: Record<string, number[]> = {
  event_length: [1, 2, 3, 4],
  sessions: [1, 2, 3, 4],
  contact_types: [1, 2, 3, 4],
  reg_paths: [1, 2, 3, 4],
  reg_rules: [0, 2, 3, 4],
  payment_complexity: [0, 2],
  advanced_reg: [0, 3],
  hotel: [0, 2, 3, 4],
  languages: [0, 3, 4],
  integrations: [0, 2, 3, 4],
  speakers: [0, 2],
  appointments: [0, 3],
  pages: [1, 2, 3, 4],
  branding: [1, 3, 4],
  custom_functionality: [0, 2, 3],
  reporting: [0, 3, 4],
};

const QUESTION_IDS = Object.keys(ALLOWED);

// Products the user can select in V2. "Not sure / Need guidance" must never be AI-selected.
const PRODUCT_LABELS = [
  "Registration & Event Website",
  "Appointment Scheduling",
  "Speaker & Abstract Management",
  "Event App",
];

const EVENT_APP_KEYWORDS = [
  "event app",
  "mobile app",
  "attendee app",
  "app agenda",
  "push notification",
  "exhibitor app",
  "mobile engagement",
  "in-app",
  "attendee hub app",
];

function lowest(id: string): number {
  return ALLOWED[id][0];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (!isAllowedOrigin(req.headers.get("origin"))) {
    return new Response(JSON.stringify({ error: "Forbidden." }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

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

    const systemPrompt = `You are an event scoping assistant. Given an event description, infer conservative answers for an event-complexity questionnaire.

Return ONLY a valid JSON object (no markdown, no code fences) with this exact shape:

{
  "answers": {
    "event_length": <one of 1,2,3,4>,
    "sessions": <one of 1,2,3,4>,
    "contact_types": <one of 1,2,3,4>,
    "reg_paths": <one of 1,2,3,4>,
    "reg_rules": <one of 0,2,3,4>,
    "payment_complexity": <one of 0,2>,
    "advanced_reg": <one of 0,3>,
    "hotel": <one of 0,2,3,4>,
    "languages": <one of 0,3,4>,
    "integrations": <one of 0,2,3,4>,
    "speakers": <one of 0,2>,
    "appointments": <one of 0,3>,
    "pages": <one of 1,2,3,4>,
    "branding": <one of 1,3,4>,
    "custom_functionality": <one of 0,2,3>,
    "reporting": <one of 0,3,4>
  },
  "selectedProducts": [<subset of: "Registration & Event Website", "Appointment Scheduling", "Speaker & Abstract Management", "Event App">],
  "eventAppSelected": <true|false>,
  "confidence": <"high"|"medium"|"low">,
  "assumptions": [<short, public-safe strings>],
  "fieldsNeedingReview": [<question ids the user should double-check>]
}

Rules:
- Every value MUST be one of the listed allowed numbers for that field. Never invent values.
- Be CONSERVATIVE. If a field is not clearly described, pick the LOWEST allowed value and add the field id to fieldsNeedingReview.
- Do NOT infer integrations, advanced_reg, payment_complexity, hotel, languages, custom_functionality, or reporting unless the description clearly mentions them.
- Set eventAppSelected = true ONLY when the description explicitly mentions an event app, mobile app, attendee app, app agenda, push notifications, exhibitor app listing, or mobile engagement. Otherwise false.
- If eventAppSelected is true, include "Event App" in selectedProducts. Otherwise do NOT include it.
- Include "Registration & Event Website" by default if any registration or event website is implied.
- Include "Speaker & Abstract Management" only if speakers/abstracts are explicitly mentioned.
- Include "Appointment Scheduling" only if 1:1 meetings/appointments are explicitly mentioned.
- Never include "Not sure / Need guidance".
- Assumptions must be short, public-safe, and free of internal jargon. Do not mention pricing, tier, hours, scores, or vendor product names.
- Return ONLY the JSON object.`;

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

    const cleaned = String(content).replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let raw: any;
    try {
      raw = JSON.parse(cleaned);
    } catch {
      throw new Error("AI returned malformed JSON");
    }

    // --- Strict validation ---
    const fieldsNeedingReview = new Set<string>(
      Array.isArray(raw?.fieldsNeedingReview)
        ? raw.fieldsNeedingReview.filter((s: unknown) => typeof s === "string")
        : [],
    );

    const rawAnswers = (raw && typeof raw.answers === "object" && raw.answers) || {};
    const answers: Record<string, number> = {};
    for (const id of QUESTION_IDS) {
      const v = rawAnswers[id];
      const allowed = ALLOWED[id];
      if (typeof v === "number" && allowed.includes(v)) {
        answers[id] = v;
      } else {
        // Conservative default to lowest allowed; flag for review.
        answers[id] = lowest(id);
        fieldsNeedingReview.add(id);
      }
    }

    // Description text used for keyword guard on Event App.
    const descLower = description.toLowerCase();
    const mentionsEventApp = EVENT_APP_KEYWORDS.some((k) => descLower.includes(k));

    let eventAppSelected = Boolean(raw?.eventAppSelected) && mentionsEventApp;

    const rawProducts = Array.isArray(raw?.selectedProducts) ? raw.selectedProducts : [];
    let selectedProducts = rawProducts
      .filter((p: unknown): p is string => typeof p === "string")
      .filter((p: string) => PRODUCT_LABELS.includes(p));

    // Enforce Event App keyword gate on the product list as well.
    if (!mentionsEventApp) {
      selectedProducts = selectedProducts.filter((p: string) => p !== "Event App");
    }
    if (eventAppSelected && !selectedProducts.includes("Event App")) {
      selectedProducts.push("Event App");
    }
    if (!eventAppSelected) {
      eventAppSelected = false;
    }
    // Deduplicate.
    selectedProducts = Array.from(new Set(selectedProducts));

    const confidence: "high" | "medium" | "low" =
      raw?.confidence === "high" || raw?.confidence === "medium" || raw?.confidence === "low"
        ? raw.confidence
        : "low";

    const assumptions = Array.isArray(raw?.assumptions)
      ? raw.assumptions.filter((s: unknown) => typeof s === "string").slice(0, 8)
      : [];

    const result = {
      answers,
      selectedProducts,
      eventAppSelected,
      confidence,
      assumptions,
      fieldsNeedingReview: Array.from(fieldsNeedingReview),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-event-v2 error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
