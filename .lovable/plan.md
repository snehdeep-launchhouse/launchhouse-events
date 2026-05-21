## Remove "New to Cvent" callout from Build Request form (page 2)

**File:** `src/pages/BuildRequest.tsx`

**Changes:**
1. Remove the entire "New to Cvent" info callout block on page 2 (approx. lines 557–569) — the intro text and the `CVENT_LINKS` chips rendered above the DualListPicker.
2. Remove the now-unused `CVENT_LINKS` constant (approx. line 61).

**Not touched:**
- DualListPicker (solutions selector) stays exactly as is
- All other form markup, validation, submit logic, styling, and page 1/3 content remain unchanged
- No Supabase, routing, or other files modified
