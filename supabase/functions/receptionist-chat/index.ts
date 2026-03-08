import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are the Launchhouse AI assistant — a friendly, professional receptionist for Launchhouse, a Cvent event build services company.

Your job is to answer questions about:
- Cvent event builds and what they involve
- Event complexity levels (Simple, Medium, Advanced, Complex)
- Launchhouse delivery timelines
- Starting pricing tiers
- Cvent products: Registration & Event Website, Attendee Hub / Event App, Appointments, Abstract / Call for Speakers

Key facts about Launchhouse services:

COMPLEXITY TIERS:
- Simple: Starting at $899, first draft in 2 business days, revision turnaround 1 business day
- Medium: Starting at $2,199, first draft in 2 business days, revision turnaround 2 business days
- Advanced: Starting at $3,499, first draft in 3 business days, revision turnaround 3 business days
- Complex: Starting at $4,999, first draft in 4 business days, revision turnaround 3 business days

WHAT'S TYPICALLY INCLUDED:
- Event website configuration
- Registration setup and workflows
- Agenda and session management
- Branding and design customization
- Testing and launch support

COMPLEXITY DRIVERS:
- Event length (multi-day events add complexity)
- Number of sessions (30+ is complex)
- Registration paths (4+ paths = at least Advanced)
- Multiple languages, hotel booking, CRM integrations
- Speaker management, appointment scheduling
- Advanced branding customization

If users ask about building their event or want to estimate complexity, recommend using the Event Complexity Calculator on this page. Say something like: "You can use our Event Complexity Calculator right here on this page to estimate the build complexity of your event in less than a minute."

If users ask about working with Launchhouse, hiring, or getting started, encourage them to schedule a consultation.

Keep responses concise, helpful, and professional. Use markdown formatting for lists and emphasis. Don't make up information not provided above.`;

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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("receptionist error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});