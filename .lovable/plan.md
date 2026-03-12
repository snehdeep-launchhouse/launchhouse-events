

# Fix Plan: Date Picker Auto-Close & PDF Scope Formatting

## 1. Date Picker — Auto-close on selection (`src/components/LeadForm.tsx`)

**Problem**: The `<Popover>` wrapping the Calendar is uncontrolled, so selecting a date does not close the popup.

**Fix**: Add controlled `open` state to the Popover, and close it when a date is selected.

- Add `const [calendarOpen, setCalendarOpen] = useState(false)` state
- Change `<Popover>` to `<Popover open={calendarOpen} onOpenChange={setCalendarOpen}>`
- Wrap `onSelect` to call `setEventDate(day)` then `setCalendarOpen(false)`

This follows the same pattern already used in `TnCTooltip.tsx`.

## 2. PDF Scope Section Formatting (`src/lib/generate-results-pdf.ts`)

**Problem**: The `✓` character may not render correctly in jsPDF's built-in helvetica font (it lacks many Unicode glyphs), causing missing or garbled bullets. Spacing between the heading and items also needs refinement.

**Fix**:
- Replace `✓` with a simple bullet character like `•` or a dash `–` which are supported by the standard PDF fonts
- Increase `lineH` from 6 to 6.5 for better readability
- Add more padding between the "Event Build Scope" heading and the first bullet (change y offset from `y + 20` to `y + 22`)
- Adjust card height calculation to account for the extra padding: `24 + scopeBullets.length * lineH + 4`

These changes match the clean formatting shown in the reference screenshot.

