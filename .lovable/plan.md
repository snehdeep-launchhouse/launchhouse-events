Add the US phone number +1 (571) 444-8523 as a second phone line alongside the existing India number +91 999 906 3734. Label them "US" and "India" respectively. No other changes.

## Files to change

### 1. `src/components/ContactUsPanel.tsx` (thank-you screen, ~lines 612–639)

In the "Need to reach us sooner?" card, keep the existing email, WhatsApp, and India phone rows. Add one new phone row directly below the India phone:

- Label: `+1 (571) 444-8523` with a small `US` tag, and update the existing one to show `India` tag.
- Link: `tel:+15714448523`
- Same `Phone` icon and styling as the existing phone row.

### 2. `supabase/functions/send-quote-request/index.ts` (user confirmation email, ~line 149)

Inside the "Need urgent assistance?" block, keep the existing `+91 9999 063 734` line and add a new line right under it:

- `📞 US: +1 (571) 444-8523` as a `tel:+15714448523` link with the same inline styling.
- Tag the existing India line as `India:` for symmetry.

### 3. `supabase/functions/send-lead-notification/index.ts` (calculator lead user email, ~line 226)

Same change as #2 inside the "Need to speak with us sooner?" block: add `📞 US: +1 (571) 444-8523` as a `tel:+15714448523` link beneath the existing India phone, and prefix the India phone with `India:`.

4. Add this new US number on the post submit page of book demo form
  &nbsp;

## Not changing

- WhatsApp link (stays India only — that's the WhatsApp account).
- Internal/admin notification emails (no phone block there).
- `book-demo` and `send-build-request` emails (no "reach us" phone block to update).
- Any other components, forms, or copy.