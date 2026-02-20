
## Terms of Service — Comprehensive Updates

This plan covers every change requested across the Terms of Service page and the T&C Tooltip, touching two files: `src/pages/TermsOfService.tsx` and `src/components/TnCTooltip.tsx`.

---

### File 1: `src/components/TnCTooltip.tsx`

**What changes:** The popover content is expanded to reflect the full Same Day Delivery terms.

New bullet points will be:
- Applies to all Simple and eligible Medium Builds
- Advanced and Complex Builds do not qualify for Same Day Deliveries
- Same Day Delivery means the project will be delivered within 12 hours of receiving all required documents and full advance payment
- Projects must commence on or before 8:00 AM Eastern Time, Monday to Friday, for same-day delivery by 8:00 PM Eastern Time on the same day
- Full payment in advance is mandatory for all Same Day Delivery engagements
- All creative assets (event banner, headers, fonts, branding guidelines, text copies) and event logistics (registration types, sessions, ticket types) must be provided in full at project commencement
- Delays in handing over any required information will push the delivery deadline accordingly
- If LaunchHouse Events misses the agreed same-day delivery deadline, the client has the right to claim a full refund, which will be processed within 48 hours

---

### File 2: `src/pages/TermsOfService.tsx`

All changes below are applied in order.

---

#### Section 1 — Project Management Activities list (`projectMgmtActivities` array)

- Change `"Email response within 1 business day"` → `"Email response within 6 business hours (90 minutes for Same Day Delivery builds)"`

#### New section — Same Day Delivery Terms (added as a new pointer in Section 1, after the SoW table)

A new highlighted info block will be added after the scope-of-services table, inside Section 1, defining Same Day Delivery:

> **Same Day Delivery** is available exclusively for Simple and eligible Medium Builds. To qualify, the project must commence on or before 8:00 AM Eastern Time (Monday–Friday). Upon receipt of all required creative assets, logistics, and 100% advance payment, LaunchHouse Events guarantees delivery by 8:00 PM Eastern Time on the same day — a 12-hour turnaround. Should LaunchHouse Events fail to meet this deadline, the client is entitled to a full refund, which will be processed within 48 hours.

---

#### Section 2 — Project Plan & Delivery Timelines

**2a. Replace the delivery timeline table** with the identical SLA table from the Services page (matching the `slaRows` data), keeping the Terms page visual style (simple bordered table, no shadcn Table component — matches current design). The new table will have three columns: **Complexity**, **First Draft**, **Revision Turnaround**, with rows for Simple, Medium, Advanced, and Complex.

The introductory paragraph above the table is kept as-is.

**2b. Deliverables bullet — update one item:**
- `"Notify authorised users about any updates or maintenance performed on the Cvent system"` → `"Notify authorised users about any updates or maintenance performed on the Cvent system until project sign off"`

**2c. Replace the written acknowledgement paragraph:**
- Old: "before the end of the following working day"
- New: "All requests made in writing by the client will receive an acknowledgement of receipt within 6 hours of that very same day. If the dedicated resource is out of the office, an acknowledgement will be sent within one (1) business day after returning to the office."

---

#### Section 3 — Process & Hours

Replace the opening paragraph and bullet list with the new hours table + updated bullet points:

**New hours allocation table** (styled as a simple bordered table matching Terms page design):

| Build Type | Hours Allocated |
|---|---|
| Simple | 20 hours |
| Medium | 45 hours |
| Advanced | 65 hours |
| Complex | 100 hours |
| Premium | >100 hours |

**Updated bullet points** (same as provided, replacing the current list):
- A LaunchHouse Events consultant will sign off from the project/event when the allotted number of hours is consumed, or the event is launched — whichever comes earlier
- Post event launch support is not included as part of a regular package
- A premium hours-based project will cover post launch support if the event is launched with hours remaining
- Additional project hours can be purchased at an additional cost — the number of hours required will be scoped by your LaunchHouse Events consultant
- Any delays in receiving information will push deadlines and event launch dates; a revised project plan will be submitted accordingly

---

#### Section 6 — Revision Rounds

Replace the current content with:

> All build tiers include **unlimited rounds of revisions**, provided they are completed within the hours allocated for that build type as defined at the onset of the engagement.

Remove the line about additional revisions at the hourly rate.

---

#### Section 7 — Rename and rewrite: Payment & Refund Terms

**Rename:** "7. Payment Terms" → **"7. Payment & Refund Terms"**

**Payment options:**

> **Option 1 — Staged Payment:** A minimum booking deposit of 50% is required to commence the project. The remaining balance must be settled upon submission of the First Draft.

> **Option 2 — Full Advance Payment:** Pay 100% upfront and receive a flat 10% discount applied to the final invoice.

Keep: *"LaunchHouse Events reserves the right to pause or withhold delivery of work in the event of outstanding payments."*

**New sub-section — Refunds:**

> All eligible refunds, as agreed per contract, will be issued by LaunchHouse Events within **48 hours** of the confirmed eligibility. We will always aim to refund to the original source of payment. If a client requests a refund to a different account or payment method, additional supporting documentation may be requested before the refund is processed.

---

#### Section 9 — Limitation of Liability

Update the company identifier line:
- Old: `"LaunchHouse Events / Rina Event Tech"`
- New: `"LaunchHouse Events / Rina Event Tech (GSTIN: 29AIKPC3628E1ZE · IEC: AIKPC3628E)"`

---

### Summary of Files Changed

| File | Changes |
|---|---|
| `src/components/TnCTooltip.tsx` | Expanded popover with full Same Day Delivery T&C |
| `src/pages/TermsOfService.tsx` | 8 distinct content updates across Sections 1, 2, 3, 6, 7, and 9 |

No database changes, no new dependencies, no routing changes required.
