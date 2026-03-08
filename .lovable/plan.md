

## Migrate Event Complexity Calculator to This Project

### Overview
Copy 6 files byte-for-byte from the source project, create a new `/pricing` calculator page, add the `event_complexity_leads` database table, and add missing CSS tokens + Tailwind config for the calculator components.

### Files to Create (exact copies)
1. `src/components/ChatBubble.tsx`
2. `src/components/OptionButtons.tsx`
3. `src/components/ResultCard.tsx`
4. `src/components/LeadForm.tsx`
5. `src/components/DescribeEvent.tsx`
6. `src/lib/calculator-data.ts`
7. `supabase/functions/analyze-event/index.ts`

### Files to Modify

**`supabase/config.toml`** — Add `[functions.analyze-event]` with `verify_jwt = false`

**`src/index.css`** — Add missing CSS custom properties to `:root` and `.dark`:
- `--chat-assistant`, `--chat-user`, `--chat-user-foreground`
- `--success`, `--success-foreground`
- Add `animate-fade-in` and `animate-slide-up` utility classes + keyframes

**`tailwind.config.ts`** — Add `chat` and `success` color mappings to the `extend.colors` section

**`src/pages/Pricing.tsx`** — Replace the current static pricing page with the calculator flow from the source project's `Index.tsx`, wrapped in this project's Navbar + Footer and design system. The calculator logic (ChatBubble, OptionButtons, DescribeEvent, ResultCard, LeadForm, Progress bar, restart button) will be rendered in the main content area between Navbar and Footer, preserving the exact same state machine and message flow.

### Files Already Done (no changes needed)
- `src/components/ReceptionistWidget.tsx` — already identical
- `supabase/functions/receptionist-chat/index.ts` — already identical
- `src/App.tsx` — ReceptionistWidget already rendered after Routes
- `react-markdown` and `date-fns` — already installed

### Database Migration
Create `event_complexity_leads` table:
- `id` uuid PK default `gen_random_uuid()`
- `name` text, `email` text, `company` text
- `event_date` date nullable
- `complexity_level` text nullable, `starting_price` text nullable
- `cvent_products` text nullable
- `event_length`, `sessions`, `registration_paths`, `contact_types`, `registration_rules`, `hotel_required`, `languages`, `integrations`, `speaker_management`, `appointment_scheduling`, `website_pages`, `branding_level` — all text nullable
- `created_at` timestamptz default `now()`
- Enable RLS with anonymous insert policy

### Key Design Decision
The `/pricing` page currently has static pricing tiers. It will be replaced with the interactive calculator flow. The calculator uses the source project's exact state machine: intro message → describe event (AI analysis) or skip to manual → question-by-question chat flow → result card → lead form. The page will use Navbar and Footer from this project for consistent navigation.

