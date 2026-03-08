

## AI Receptionist Chat Widget

### Overview
Add a floating AI chat widget in the bottom-right corner that uses Lovable AI via a new `receptionist-chat` edge function with streaming responses. The widget will answer questions about Launchhouse services, pricing, and Cvent event builds.

### Files to Create

**1. `supabase/functions/receptionist-chat/index.ts`** — Edge function
- CORS headers, OPTIONS handler
- System prompt covering Launchhouse services, complexity tiers (Simple $899, Medium $2,199, Advanced $3,499, Complex $4,999), delivery timelines, Cvent products
- Streams response from Lovable AI gateway (`google/gemini-3-flash-preview`)
- Handles 429/402 errors

**2. `src/components/AiReceptionistWidget.tsx`** — Chat widget component
- Floating button (bottom-right, `z-50`) with a chat icon; positioned above the mobile sticky CTA bar (`bottom-20 md:bottom-6`)
- Expandable chat panel with message list, input, and send button
- Token-by-token SSE streaming with `onDelta` pattern
- `react-markdown` for rendering assistant messages
- "Schedule a Consultation" button linking to `/get-a-quote`
- Styled with the site's blue `--primary` theme
- Lazy-loaded in App.tsx to avoid impacting initial bundle

### Files to Modify

**3. `src/App.tsx`** — Add lazy-loaded `AiReceptionistWidget` after Routes inside ContactPanelProvider

**4. `supabase/config.toml`** — Add `[functions.receptionist-chat]` with `verify_jwt = false`

### Dependencies
- `react-markdown` — needs to be installed

### Key Details
- LOVABLE_API_KEY is already available as a secret
- Widget won't modify any existing components
- Chat history is kept in local state (not persisted)
- Mobile: widget button sits above the sticky "Request a Demo" bar

