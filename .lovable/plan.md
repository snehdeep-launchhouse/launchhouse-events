

## EB Form Changes + Abandoned Form Tracking

### Summary
Six UI changes across the 3 form pages, plus a new "Abandoned EB Form Report" feature that saves partial form data to the database whenever a user completes page 1 and navigates forward.

---

### UI Changes

**Page 1 — Basic Information**
- **Company Name field**: Change from `<Textarea>` to `<Input>` (single-line, same size as other fields). Place it on the same 2-column grid row as Email, or in its own full-width row matching the height of other inputs — keeping the layout symmetrical.

**Page 2 — Contact Information**
- **Section label**: Change "Points of Contact" to "Planner Contact"
- **Add Contact button**: Move it from the header (next to the label) to below the last contact card. Rename to "Add Additional Planner". It appears after the last rendered contact container and shifts down as new contacts are added.
- **Cvent links section**: Remove the clickable `<a>` hyperlinks but keep all the text content visible. The product names (Event Management, Attendee Hub, etc.) will display as plain text instead of links.
- **Previous button**: Add a visible border style (use `variant="outline"` styling with a stronger border, e.g. `border-2 border-primary`) so it stands out more.

**Page 3 — Event Details**
- **Remove fields**: Planner First Name, Planner Last Name, and Planner Email Address — remove from the form UI, the Zod schema (make them optional/removed), and the default values.

---

### Abandoned EB Form Report (Backend)

**New database table: `abandoned_eb_forms`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, auto-generated |
| first_name | text | From page 1 |
| last_name | text | From page 1 |
| email | text | From page 1 |
| company_name | text | From page 1 |
| last_page_visited | integer | 1, 2, or 3 |
| completed | boolean | Default false, set true on final submit |
| created_at | timestamptz | Default now() |
| updated_at | timestamptz | Default now() |

- RLS: Allow public INSERT and UPDATE (no authentication required, matching the existing form pattern). No public SELECT/DELETE.

**Frontend logic:**
- When the user clicks "Next" on page 1 (after validation passes), insert a row into `abandoned_eb_forms` with page 1 data and `last_page_visited = 1`. Store the returned row ID in component state.
- When the user navigates to page 3, update that same row with `last_page_visited = 2`.
- On final successful submission, update the row with `last_page_visited = 3` and `completed = true`.
- This gives you a report showing who started the form, how far they got, and whether they completed it.

---

### Technical Details

**Files modified:**
- `src/pages/BuildRequest.tsx` — All UI changes + abandoned form tracking logic

**Database migration:**
- Create `abandoned_eb_forms` table with RLS policies for public insert/update

**Edge function (`send-build-request`):**
- The planner fields removal means the edge function payload will no longer include `plannerFirstName`, `plannerLastName`, `plannerEmail`. The edge function already handles these as optional fields, so no edge function changes are needed — they'll simply be absent from the payload.

