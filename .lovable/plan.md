

## Build Request Form - Multi-Step Hidden Page with Email Notifications

### Overview
Create a 3-page multi-step form at a hidden route (`/build-request`) that collects event build request details. On submission, an edge function generates a Word document with the responses and emails it to `sam@launchhouse.events` and `snehdeep@launchhouse.events`. All "Get Started" buttons across the site will link to this form (opening in a new tab).

---

### Page Structure

**Page 1 - Basic Information**
| Field | Type | Required |
|---|---|---|
| First Name | Text | Yes |
| Last Name | Text | Yes |
| Email Address | Email | Yes |
| Company Name | Textarea | Yes |

**Page 2 - Contact Information**
| Field | Type | Required |
|---|---|---|
| Names of all point of contacts | Textarea | No |
| Contact number of primary POC | Text | Yes |
| Preferred time zone for kick off call | Dropdown (US/Canada only) | Yes |
| Kick Off Call Date and Time - Preference 1 | Date + Time picker | Yes |
| Kick Off Call Date and Time - Preference 2 | Date + Time picker | No |
| Email addresses for build process | Textarea | No |
| Cvent platform info links | Static text with 5 hyperlinks |
| Solutions to include | Dual-list picker (Available / Chosen) | Yes |

Time zones (US/Canada): Eastern, Central, Mountain, Pacific, Alaska, Hawaii, Atlantic, Newfoundland

Time slots for kick off: 9 AM - 4 PM EST (hourly slots)

Solutions available list:
- Event Registration and Website Design
- Attendee Hub (Website and/or event app)
- Appointments
- Abstract Management
- Survey
- On Arrival (Onsite/Badge Creation)

**Page 3 - Event Details**
| Field | Type | Required |
|---|---|---|
| Account Number (write N/A if you don't have one) | Text | Yes |
| Planner First Name | Text | Yes |
| Planner Last Name | Text | Yes |
| Planner Email Address | Email | Yes |
| Event Title | Text | Yes |
| Event Start Date and Time | Date + Time picker | Yes |
| Event End Date and Time | Date + Time picker | Yes |
| Event Time Zone | Dropdown (global time zones) | Yes |
| Expected Go Live Date | Date picker | Yes |
| Additional Information | Textarea | No |

---

### UI/UX Details
- Progress bar at top showing "33% Complete (1 of 3)", "67% Complete (2 of 3)", "100% Complete (3 of 3)"
- Navigation buttons: Cancel + Next (page 1), Previous + Cancel + Next (page 2), Previous + Cancel + Submit (page 3)
- Form matches LaunchHouse brand: primary blue (#006AE1), Space Grotesk headings, Inter body text
- AI-generated banner image at the top showing someone building an event registration site (positive/confident/happy mood)
- Hidden from main navigation (no nav link added)
- Opens in a new tab from all "Get Started" buttons

### "Get Started" Button Updates
All "Get Started" buttons across these files will be updated to open `/build-request` in a new tab instead of the Google Form URL:
- `src/pages/Pricing.tsx` (GOOGLE_FORM constant)
- `src/pages/About.tsx` (GOOGLE_FORM constant)
- `src/pages/Services.tsx` (GOOGLE_FORM constant)
- `src/components/PricingSection.tsx` (inline URL)
- `src/components/Navbar.tsx` (currently scrolls to #contact - will open the form in a new tab)

---

### Technical Details

**New files to create:**
1. `src/pages/BuildRequest.tsx` - The multi-step form page with all 3 steps, progress bar, validation, and dual-list picker component
2. `src/components/DualListPicker.tsx` - Reusable Available/Chosen list component with move buttons
3. `supabase/functions/send-build-request/index.ts` - Edge function that receives form data, generates a .docx Word document with a table of responses, and sends it via Resend to both email addresses

**Files to modify:**
- `src/App.tsx` - Add route for `/build-request`
- `src/pages/Pricing.tsx` - Change GOOGLE_FORM to point to `/build-request`, open in new tab
- `src/pages/About.tsx` - Same change
- `src/pages/Services.tsx` - Same change
- `src/components/PricingSection.tsx` - Update inline URL
- `src/components/Navbar.tsx` - Update "Get Started" to open form in new tab

**Dependencies needed:**
- `docx` - For generating Word documents in the edge function
- Resend connector for sending emails with attachments

**Edge function flow:**
1. Receive form JSON payload
2. Build a Word document with a formatted table (Field | Response)
3. Send email to both addresses with the .docx attached
4. Return success/error response

**Validation:** Zod schema validates required fields on each step before allowing navigation to the next page. Fields marked with asterisk are mandatory.

