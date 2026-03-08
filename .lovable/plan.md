

## Migrate Receptionist Widget from Other Project

### What changes are needed

**1. Replace `supabase/functions/receptionist-chat/index.ts`**
Overwrite with the version from the other project. Key differences: updated system prompt with complexity drivers, delivery timelines per tier, and a recommendation to use the Event Complexity Calculator.

**2. Create `src/components/ReceptionistWidget.tsx`**
New file, byte-for-byte copy from the other project. This is the tested widget with SSE streaming, markdown rendering, and the "Schedule a Consultation" CTA linking to `/request-demo`.

**3. Update `src/App.tsx`**
- Change the lazy import from `AiReceptionistWidget` to `ReceptionistWidget` (importing from `./components/ReceptionistWidget`)
- Update the rendered component name in the existing `<Suspense>` block after `</Routes>`
- No other changes to routes or components

**4. No other changes needed**
- `supabase/config.toml` already has `[functions.receptionist-chat]` with `verify_jwt = false`
- `react-markdown` is already installed
- The existing `AiReceptionistWidget.tsx` file can remain (unused) or be deleted

### Files to create
- `src/components/ReceptionistWidget.tsx` (exact copy from other project)

### Files to modify
- `supabase/functions/receptionist-chat/index.ts` (replace with other project's version)
- `src/App.tsx` (swap lazy import to `ReceptionistWidget`)

