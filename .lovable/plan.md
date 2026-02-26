

## Convert Contact Us Form to a Sliding Panel

Instead of navigating to a separate `/get-a-quote` page, the Contact Us button will open a right-side sliding panel (Sheet) overlay on any page. The form content, logic, abandoned tracking, and submission all remain identical — only the container changes.

### Changes

#### 1. New component: `src/components/ContactUsPanel.tsx`

- Extract all form logic from `src/pages/GetAQuote.tsx` into this new component.
- Wrap in a `Sheet` (from `@/components/ui/sheet`) with `side="right"`.
- Accept `open` and `onOpenChange` props to control visibility.
- **Responsive sizing**: Use `sm:max-w-md md:max-w-lg` on the SheetContent so it's compact on desktop and full-width on mobile (the existing sheet component already does `w-3/4` on mobile with `sm:max-w-sm` — we'll override to allow slightly wider for the form).
- Remove the banner image, Logo header, and Footer — the panel is an overlay, so it only needs the step indicator, form fields, and confirmation content.
- Use `ScrollArea` inside the panel so the services list + textarea are scrollable without the panel overflowing.
- On the confirmation screen, include a "Close" button that calls `onOpenChange(false)` instead of "Back to Home".
- All abandoned tracking, email validation, and submission logic stays identical.

#### 2. `src/components/Navbar.tsx`

- Import `ContactUsPanel`.
- Add `const [contactOpen, setContactOpen] = useState(false)` state.
- Change `handleCta` to `setContactOpen(true)` instead of `navigate("/get-a-quote")`.
- Render `<ContactUsPanel open={contactOpen} onOpenChange={setContactOpen} />` inside the navbar.
- The mobile menu "Contact Us" button also sets `contactOpen(true)` and closes the mobile menu.

#### 3. `src/pages/GetAQuote.tsx`

- Keep the file as-is (the `/get-a-quote` and `/contact-us` routes still work as a standalone page for direct URL access / bookmarks).
- No changes needed.

#### 4. `src/App.tsx`

- No changes needed — routes remain for direct access.

#### 5. `src/components/ui/sheet.tsx`

- No structural changes. The `SheetContent` already supports custom `className` overrides for width, so the panel component will pass `className="w-full sm:max-w-md md:max-w-lg"` to override the default `sm:max-w-sm`.

### Files

| File | Change |
|------|--------|
| `src/components/ContactUsPanel.tsx` | New — Sheet-based sliding panel with full form logic extracted from GetAQuote |
| `src/components/Navbar.tsx` | Open panel on "Contact Us" click instead of navigating |

