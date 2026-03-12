

# Include Scope Summary in PDF and Lead Notification Emails

## Changes Required

### 1. PDF Generator (`src/lib/generate-results-pdf.ts`)

- Add `scopeBullets: string[]` to the `PdfData` interface
- Insert a new "Event Build Scope" card between the complexity card (section 1) and the Attendee Hub card (section 2)
- Render each bullet as a line item with a checkmark character
- Dynamically calculate card height based on bullet count

### 2. Calculator — pass scope bullets to PDF (`src/components/EventComplexityCalculator.tsx`)

- Line ~423: Add `scopeBullets` to the `downloadResultsPdf()` call (currently only passes result, allProducts, attendeeHubSelected, attendeeHubFeatures)

### 3. LeadForm — pass scope summary to email function (`src/components/LeadForm.tsx`)

- Line ~140: Add `scopeSummary` to the `send-lead-notification` invocation body

### 4. Edge Function (`supabase/functions/send-lead-notification/index.ts`)

- Parse `scopeSummary` from the payload
- Add a "Event Build Scope" section to the **admin internal email** (after the table rows, before or alongside the investment summary) — render as an HTML bulleted list
- Add a "Your Event Build Scope" section to the **lead confirmation email** (after the results summary card) — render as a styled bulleted list

## No Database Changes

The `scope_summary` column already exists and is already being written by LeadForm. Only the PDF and email templates need updating.

