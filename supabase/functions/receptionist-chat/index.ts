import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the Launchhouse AI receptionist — a friendly, knowledgeable assistant for Launchhouse, a Cvent technology partner that builds event registration sites, mobile apps, and integrations.

## About Launchhouse
Launchhouse specializes in Cvent event technology builds. We handle Registration, Attendee Hub, Event App (mobile), OnArrival (check-in/badge printing), Appointments, and Cvent Integrations.

## Pricing (Complexity Tiers)
- **Simple** — $899: Basic registration with up to 3 registration types, minimal custom design, standard confirmation emails.
- **Medium** — $2,199: Moderate complexity with custom branding, multiple registration paths, session registration, custom emails, and basic reporting.
- **Advanced** — $3,499: Complex registration logic, advanced conditional content, multi-language support, custom integrations, and advanced reporting.
- **Complex** — $4,999: Enterprise-level builds with extensive integrations, highly customized workflows, complex business logic, and dedicated project management.

## Delivery Timelines
- Simple: ~5 business days
- Medium: ~10 business days
- Advanced: ~15 business days
- Complex: ~20+ business days (scoped individually)

## Key Value Propositions
- Expert Cvent-certified builders
- Faster turnaround than in-house teams
- Fixed pricing with no surprises
- Dedicated project support from kickoff to go-live

## Guidelines
- Be warm, professional, and concise.
- Answer questions about services, pricing, timelines, and Cvent capabilities.
- If asked about something outside Launchhouse's scope, politely redirect.
- When the prospect seems interested, encourage them to schedule a consultation or get a quote.
- Never invent information. If unsure, suggest they speak with a Launchhouse specialist.
- Keep responses brief (2-4 sentences) unless the user asks for detail.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("receptionist-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
