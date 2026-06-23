/**
 * Structured source of truth for the Cvent Pre-Launch QA Checklist
 * resource page (/pre-launch-checks).
 *
 * Extracted verbatim from the finalized PDF:
 *   public/resources/LH_Phase_2_Cvent_Pre_Launch_QA_Checklist_v03.pdf
 *
 * Owner and Status are presentation-only reference fields rendered by the
 * UI; they are intentionally NOT modeled here as data. There are no
 * inputs, no persisted state, and no editable owner/status values.
 *
 * Note on per-check "Why it matters":
 *   The PDF only includes a per-check WHY line for Section A, checks 1–7.
 *   All other checks rely on the section-level "Why this section matters"
 *   block. To stay faithful to the source we model `why` as optional on
 *   Check; the integrity test in content.test.ts enforces title and
 *   commonIssue on every check and verifies the per-check WHYs that the
 *   PDF actually supplies.
 */

export type SectionLetter =
  | "A" | "B" | "C" | "D" | "E" | "F" | "G"
  | "H" | "I" | "J" | "K" | "L" | "M" | "N";

export type Check = {
  /** 1-indexed position of the check inside its section (1..8). */
  number: number;
  /** Bold headline of the check, including any continuation text from the PDF. */
  title: string;
  /** Optional per-check "WHY" line. Only Section A checks 1–7 supply this. */
  why?: string;
  /** "COMMON ISSUE" line. Required for every check. */
  commonIssue: string;
};

export type Section = {
  letter: SectionLetter;
  /** Stable kebab-case slug used in anchor IDs. */
  slug: string;
  /** Section title as printed in the PDF. */
  title: string;
  /** Section-level "WHY THIS SECTION MATTERS" body. */
  why: string;
  checks: Check[];
};

export type TimingRow = { moment: string; when: string; sections: string };

export type AtAGlanceRow = { letter: SectionLetter; title: string };

export type RedFlag = { number: number; text: string };

export type UsagePass = { number: string; body: string };

/* ─────────────────────────  Cover / meta  ───────────────────────── */

export const PRE_LAUNCH_META = {
  eyebrow: "PHASE 2 · PRACTITIONER RESOURCE · V03",
  title: "Cvent Pre-Launch QA Checklist",
  lede: "A practitioner’s operational pass before you open registration.",
  audience:
    "Event Managers, Meetings & Events leads, Cvent Owners and Admins",
  format: "14 sections · 112 checks · ownership and status fields per check",
  use: "Run before launch, before invite sends, before reminders, before event week",
  tagline:
    "SOLVING REGISTRATION COMPLEXITY WITH STRATEGIC REGISTRATION TECHNOLOGY SUPPORT",
  pdfPath: "/resources/LH_Phase_2_Cvent_Pre_Launch_QA_Checklist_v03.pdf",
  pdfDownloadName: "LaunchHouse-Cvent-Pre-Launch-QA-Checklist.pdf",
} as const;

/* ──────────────────  Orientation / How to Use  ──────────────────── */

export const ORIENTATION = {
  eyebrow: "PAGE 2 · ORIENTATION",
  heading: "How to use this checklist.",
  intro:
    "Most registration issues that reach attendees were preventable at the QA pass before launch — and most teams know that, but run out of time to do the QA cleanly under timeline pressure. This checklist is the operational pass. It is intended to be used, not read.",
  affects: {
    heading: "What a clean pre-launch QA pass affects",
    items: [
      {
        label: "Attendee experience.",
        body:
          "Registration is the first digital touch of your event. A broken confirmation email, a wrong time zone, or a form field that fails on mobile is a friction point at exactly the moment you’ve earned the attendee’s attention.",
      },
      {
        label: "Stakeholder confidence.",
        body:
          "Issues caught before launch are operational. Issues caught after launch are visible — often to executives, sponsors, or speakers — and they erode confidence in the program.",
      },
      {
        label: "Reporting readiness.",
        body:
          "Almost every reporting headache traces back to upstream setup decisions: field structure, segmentation, attribution data capture. The pre-launch pass is the last and best moment to catch these before they harden into months of manual cleanup.",
      },
    ],
  },
  audience: {
    heading: "Who this checklist is for",
    items: [
      {
        label: "Event Managers and Event Planners",
        body: "building registration in Cvent.",
      },
      {
        label: "Meetings & Events Managers",
        body: "signing off across a team’s portfolio.",
      },
      {
        label: "Cvent Owners and Admins",
        body: "carrying the technical configuration.",
      },
      {
        label: "Lean commercial event team leaders",
        body:
          "running registration alongside broader marketing or sales responsibilities.",
      },
    ],
    footnote:
      "The checks are calibrated to mid-market enterprise event teams running Cvent. They translate directly to most program shapes — customer events, partner events, roadshows, conferences, internal events.",
  },
  structure: {
    heading: "How each check is structured",
    intro: "For every check, the same four fields apply:",
    items: [
      {
        label: "Why it matters.",
        body: "The operational reason this check exists.",
      },
      {
        label: "Common issue to catch.",
        body:
          "The specific thing that tends to go wrong in real Cvent builds.",
      },
      {
        label: "Owner.",
        body:
          "Who is responsible for verifying this check (assign by name).",
      },
      {
        label: "Status.",
        body:
          "Whether the check is complete, has an open issue, or is not applicable. Use whatever convention your team prefers (✓ / Issue / N/A; or initials + date; or a ticket number).",
      },
    ],
  },
} as const;

/* ─────────────────────────  Timing Guide  ───────────────────────── */

export const TIMING_GUIDE = {
  eyebrow: "PAGE 3 · TIMING GUIDE",
  heading: "When to use this checklist.",
  intro:
    "The pass is most valuable at five moments in the event cycle. Sections matter more or less at each moment; running the full pass at every gate is the safest discipline.",
  ruleOfThumbLabel: "Rule of thumb.",
  ruleOfThumb:
    "When in doubt, re-run the full pass. The cost of a re-run is hours; the cost of a missed issue is reputation.",
  atAGlanceHeading: "The 14 sections at a glance",
} as const;

export const TIMING_ROWS: TimingRow[] = [
  {
    moment: "Before registration launch",
    when: "7 days before opening registration",
    sections: "All sections — this is the full pass",
  },
  {
    moment: "Before invite sends",
    when: "24–48 hours before invite blast",
    sections: "A, B, C, F, I, K, L",
  },
  {
    moment: "Before reminder emails fire",
    when: "24 hours before each reminder send",
    sections: "F, G, I",
  },
  {
    moment: "Before event week",
    when: "7 days before the event",
    sections: "D, F, G, H, J, M",
  },
  {
    moment: "Before publishing the Attendee Hub",
    when: "7 days before Hub go-live (if applicable)",
    sections: "N, plus revisit A, D, K",
  },
  {
    moment: "After major registration changes",
    when: "Within 24 hours of any change",
    sections: "The sections affected by the change, plus M",
  },
];

export const AT_A_GLANCE: AtAGlanceRow[] = [
  { letter: "A", title: "Event Website / Registration Page" },
  { letter: "B", title: "Registration Paths" },
  { letter: "C", title: "Registration Questions and Logic" },
  { letter: "D", title: "Session Selection" },
  { letter: "E", title: "Pricing / Payment (if applicable)" },
  { letter: "F", title: "Confirmation Emails" },
  {
    letter: "G",
    title: "Attendee Communications (Reminders, Updates, Day-Of)",
  },
  { letter: "H", title: "Modification / Cancellation Flow" },
  { letter: "I", title: "Invitee and Attendee Data" },
  { letter: "J", title: "Stakeholder Review" },
  { letter: "K", title: "Mobile / Device Testing" },
  { letter: "L", title: "Accessibility / Readability" },
  { letter: "M", title: "Final Go-Live Readiness" },
  { letter: "N", title: "Attendee Hub & Event App (if applicable)" },
];

/* ─────────────────────────  Sections A–N  ───────────────────────── */

const SECTION_A: Section = {
  letter: "A",
  slug: "event-website-registration-page",
  title: "Event Website / Registration Page",
  why:
    "The website is the first impression of your event. A broken hero image, a wrong date, or placeholder copy from a previous event erodes confidence before registration even begins.",
  checks: [
    {
      number: 1,
      title:
        "URL structure is clean and matches your event naming convention. (Only applicable for events hosted with a custom domain.)",
      why:
        "URLs are shared in invites, signatures, and follow-ups. A messy or default Cvent URL signals an unfinished build.",
      commonIssue:
        "Default cvent.me link being used in the invite when a custom URL was configured but never swapped in.",
    },
    {
      number: 2,
      title:
        "Brand colors, logos, and fonts render correctly across major browsers.",
      why:
        "Brand integrity is part of attendee experience. Inconsistent rendering reads as unfinished.",
      commonIssue:
        "Custom font that fails to load in Outlook-rendered preview links or older browser versions.",
    },
    {
      number: 3,
      title:
        "Event information accurate. Title, date and time with explicit time zone, location, registration window, Event Planner (which doubles as the default From Name in your emails), and Event Features all match the master event record.",
      why:
        "Wrong dates or times propagate to confirmations and calendar invites. The Event Planner field flows into outbound email From Names if not overridden.",
      commonIssue:
        "Time displayed in the wrong zone for a multi-region audience; “9:00 AM” without specifying EST vs PST.",
    },
    {
      number: 4,
      title:
        "All CTAs on the website point to the correct registration path or page.",
      why:
        "CTA misroutes drop attendees into the wrong path or surface the wrong pricing.",
      commonIssue:
        "“Register” button still pointing to a previous event’s registration page.",
    },
    {
      number: 5,
      title:
        "Mobile rendering tested on at least one iOS and one Android device. Header, navigation, image scaling, and CTA size all work.",
      why:
        "A meaningful share of registrations happen on mobile. Issues here are invisible if you only test on desktop.",
      commonIssue: "Hero image that gets cropped on mobile and hides the CTA.",
    },
    {
      number: 6,
      title: "Page load speed acceptable on a standard connection.",
      why:
        "Slow load is a silent drop-off. Most teams don’t measure it until after launch.",
      commonIssue:
        "Heavy hero video or carousel image set producing a noticeably slow load on a typical mobile connection.",
    },
    {
      number: 7,
      title:
        "No placeholder copy remains anywhere on the public site. No “lorem ipsum,” no “TBD,” no “[insert speaker bio],” no “Confirm date with venue.”",
      why:
        "Placeholder copy that ships is a credibility loss the team rarely recovers from in front of attendees.",
      commonIssue:
        "Speaker bio left as “TBD” because the bio came in late and never got swapped.",
    },
    {
      number: 8,
      title:
        "Validate and publish discipline. Run Cvent’s validation against the website and registration process for errors, then publish via Site Designer so changes propagate to invitees. Public/private event setting and search engine settings reviewed. Standard weblinks and Reference IDs documented for marketing assets.",
      commonIssue:
        "Edits made in the builder but never published, so invitees see the prior version of the page.",
    },
  ],
};

const SECTION_B: Section = {
  letter: "B",
  slug: "registration-paths",
  title: "Registration Paths",
  why:
    "Path configuration determines who sees what pricing, what questions, and what experience. Path errors are the most common source of attendee confusion and stakeholder embarrassment.",
  checks: [
    {
      number: 1,
      title:
        "All registration types are defined and verified. General Admission, VIP, Speaker, Sponsor, Comp, Internal Staff, Press — whatever your program needs. For each type, the correct admission items, agenda items, optional items, fees, hotel rooms, custom webpages, and badges are associated. If the event was copied from a prior event, registration types and their associations are re-verified and renamed where needed.",
      commonIssue:
        "Registration types copied from a previous event still carrying the prior event’s items or naming, surfacing in the path-selection UI as “VIP-2024.”",
    },
    {
      number: 2,
      title:
        "Each path has the correct fee structure or comp logic. Tested with a pre-launch test registration.",
      commonIssue:
        "Sponsor path showing GA pricing because the discount logic was attached to the wrong code.",
    },
    {
      number: 3,
      title:
        "Path-specific questions render only for the right path — no leakage of internal-only or path-specific questions to public attendees.",
      commonIssue:
        "Unwanted question appearing in the GA path because the visibility rule wasn’t set.",
    },
    {
      number: 4,
      title:
        "Path-specific confirmation emails are wired to the right template.",
      commonIssue:
        "Speakers receive the GA confirmation instead of the speaker logistics confirmation.",
    },
    {
      number: 5,
      title:
        "Path capacity limits are set if applicable. Waitlist behavior is defined and tested.",
      commonIssue:
        "VIP path with no capacity limit, allowing more registrations than seats.",
    },
    {
      number: 6,
      title:
        "Path access controls are configured correctly. Direct registration link, password-protected, invitation-only is set per path requirement.",
      commonIssue: "Comp-code path accessible via the public registration link.",
    },
    {
      number: 7,
      title:
        "Internal-only paths are hidden from public view. Staff and rehearsal paths are not surfaced in the path-selection UI to public attendees.",
      commonIssue:
        "Internal staff path visible to external attendees who self-select it.",
    },
    {
      number: 8,
      title:
        "Path naming is consistent across the registration UI, reports, and downstream integrations.",
      commonIssue:
        "“VIP” in the registration UI, “VIP_Premium” in the report, “VIP-PREM” in Salesforce. Reporting becomes a translation exercise.",
    },
  ],
};

const SECTION_C: Section = {
  letter: "C",
  slug: "registration-questions-and-logic",
  title: "Registration Questions and Logic",
  why:
    "Questions and logic are where the most subtle bugs live. They survive casual testing because the bug only triggers in specific combinations.",
  checks: [
    {
      number: 1,
      title:
        "All required questions are marked required; optional questions are clearly optional.",
      commonIssue:
        "Required field that’s actually nullable in the database, allowing incomplete records through.",
    },
    {
      number: 2,
      title:
        "Question types match the data needed. Text vs. dropdown vs. multi-select vs. address block — each matches the downstream use.",
      commonIssue:
        "Free-text “Country” field that creates 47 spellings of “United States” in reporting.",
    },
    {
      number: 3,
      title:
        "Field-level validation is tested. Email format, phone format, character limits all work as expected.",
      commonIssue: "International phone numbers rejected by US-only validation.",
    },
    {
      number: 4,
      title:
        "Pre-fill from invite link or CRM is tested where applicable. Tokens render correctly; missing tokens fall back gracefully.",
      commonIssue:
        "“Hi {{first_name}}” rendering literally because the CRM field is empty.",
    },
    {
      number: 5,
      title:
        "Question ordering follows the attendee mental model. No jarring jumps from logistics to deeply personal questions and back.",
      commonIssue:
        "Dietary requirements asked before name and email; attendee abandons.",
    },
    {
      number: 6,
      title:
        "Field labels match the column names you’ll need in reporting. Where a question is going to be a report column, the label and the column align.",
      commonIssue:
        "“Job Title” in the form, “Title” in the report, “Position” in Salesforce. Cleanup tax forever.",
    },
    {
      number: 7,
      title:
        "Question codes added for any question whose response will pull into emails or other downstream surfaces via data tags. Without a question code, the data tag won’t resolve in the email body.",
      commonIssue:
        "Personalized email body referencing a registration question whose code was never added; the data tag renders as raw text or nothing.",
    },
    {
      number: 8,
      title:
        "Sensitive personal data and travel data routed to the right inputs. Passport number, date of birth, and similar sensitive fields use Cvent’s dedicated encrypted contact fields — not custom registration questions. Flight, air, and hotel data flow through Cvent’s air request, air actual, or hotel request forms — not through custom registration questions.",
      commonIssue:
        "Sensitive identifiers collected via free-text registration questions, leaving them outside the platform’s encrypted-field handling.",
    },
  ],
};

const SECTION_D: Section = {
  letter: "D",
  slug: "session-selection",
  title: "Session Selection",
  why:
    "Session selection has the highest density of edge cases per square inch of registration. Capacity, conflicts, time zones, and modification flows all interact.",
  checks: [
    {
      number: 1,
      title:
        "All sessions configured with correct date, time, and time zone. Verify against the master agenda.",
      commonIssue:
        "Time zone mismatch between Cvent display and the calendar invite (event runs in EST; ICS shows PST).",
    },
    {
      number: 2,
      title:
        "Concurrent sessions are properly grouped. An attendee can only choose one per time slot.",
      commonIssue:
        "Two concurrent sessions both selectable, attendee registered for both, no error surfaced.",
    },
    {
      number: 3,
      title:
        "Session capacity limits are set; waitlist behavior is defined.",
      commonIssue:
        "Capacity set, but waitlist not configured — registrations bounce instead of joining a waitlist.",
    },
    {
      number: 4,
      title:
        "Session-specific questions are wired correctly (e.g., dietary requirements for a dinner session).",
      commonIssue:
        "Dietary question shown to all attendees instead of only those attending the dinner.",
    },
    {
      number: 5,
      title:
        "Modification flow respects current session capacity. Attendees changing sessions can’t bypass the cap.",
      commonIssue:
        "Modification flow lets an attendee join a session that closed during the registration window.",
    },
    {
      number: 6,
      title:
        "Session conflicts surface to the attendee at selection time. No silent overlap.",
      commonIssue:
        "Attendee selects two overlapping sessions and only finds out at the door.",
    },
    {
      number: 7,
      title:
        "Session naming is consistent across the registration page, the calendar invite, and reports.",
      commonIssue:
        "“Keynote” on the website, “Opening Keynote” in the calendar invite, “K1” in the report.",
    },
    {
      number: 8,
      title:
        "Walk-in / on-site session adjustments are planned. The team knows how to handle a session change at the venue.",
      commonIssue:
        "Walk-in flow not documented, leading to ad-hoc admin during the event.",
    },
  ],
};

const SECTION_E: Section = {
  letter: "E",
  slug: "pricing-payment",
  title: "Pricing / Payment (if applicable)",
  why:
    "Money is the most visible and least forgiving area of the registration build. Pricing errors propagate fast and stay in everyone’s memory.",
  checks: [
    {
      number: 1,
      title:
        "All pricing tiers tested. Early bird, regular, late, group discount, comp.",
      commonIssue:
        "Early bird pricing not charged correctly because the cutoff dates in the back end are not set correctly.",
    },
    {
      number: 2,
      title:
        "Comp codes generate the correct discount. Tested in Perform Test Mode.",
      commonIssue:
        "Comp code stacks with another discount, producing a negative balance the system processes.",
    },
    {
      number: 3,
      title:
        "Tax calculations (where applicable, especially events based out of Canada) are tested. Tax fires after discount, not before; tax rates match jurisdiction.",
      commonIssue: "Tax not created in the platform or not active.",
    },
    {
      number: 4,
      title:
        "Payment processor sandbox or test transaction completed. Real card or test card, depending on processor.",
      commonIssue:
        "Production payment processor not yet activated for the new event, causing all live payments to fail at launch.",
    },
    {
      number: 5,
      title:
        "Refund policy logic is tested. Full, partial, none — match the published policy.",
      commonIssue:
        "System policy doesn’t match the FAQ, leading to disputes.",
    },
    {
      number: 6,
      title:
        "Receipt and invoice templates populated with correct fields. Legal entity, address, tax ID where required.",
      commonIssue:
        "Receipt that shows the previous event’s name in the line item.",
    },
    {
      number: 7,
      title:
        "Currency display matches stakeholder expectations across multi-region events.",
      commonIssue:
        "USD displayed to EU attendees who expected EUR; sponsorship invoices in the wrong currency.",
    },
    {
      number: 8,
      title:
        "Pricing components and payment configuration verified. Fees, refund policies, discount codes, and volume discounts associated to the correct agenda items. Service fees activated and associated to the correct registration types. Summary and Payment Widget configured. Event prefix, merchant account, currency, and allowed payment methods finalized.",
      commonIssue:
        "A discount code or service fee left associated to a prior event’s agenda item, surfacing an unintended price line at registration.",
    },
  ],
};

const SECTION_F: Section = {
  letter: "F",
  slug: "confirmation-emails",
  title: "Confirmation Emails",
  why:
    "The confirmation email is the artifact attendees actually keep. If it has the wrong date, time zone, or a broken calendar invite, every attendee experiences the issue.",
  checks: [
    {
      number: 1,
      title:
        "Confirmation email content matches each registration path. GA gets GA, speaker gets speaker, sponsor gets sponsor.",
      commonIssue:
        "All paths use the same confirmation template; speakers don’t receive their logistics info.",
    },
    {
      number: 2,
      title:
        "ICS / calendar invite is attached and renders correctly in major calendar apps. Outlook, Google Calendar, Apple Calendar.",
      commonIssue:
        "The ICS link and any other calendar links should be checked to ensure they create the correct, intended calendar entry for registrants who opt to mark their calendars.",
    },
    {
      number: 3,
      title:
        "Confirmation includes correct event date, time, time zone, location. Verified against the source of truth.",
      commonIssue:
        "Time zone label missing — attendees in different zones interpret “5 PM” differently.",
    },
    {
      number: 4,
      title:
        "Reply-to address is monitored (or set to a documented no-reply with clear escalation path in the email body).",
      commonIssue:
        "Reply-to set to an unmonitored address; attendees with last-minute issues bounce.",
    },
    {
      number: 5,
      title:
        "Spam-trigger phrasing avoided in subject line and body. No all-caps, no suspicious-link patterns.",
      commonIssue:
        "“URGENT: Confirm Your Registration” subject line landing in spam at major corporate domains.",
    },
    {
      number: 6,
      title: "Confirmation links (modify, cancel) tested end-to-end.",
      commonIssue: "Modification not activated from registration path settings.",
    },
    {
      number: 7,
      title:
        "Sender domain authentication (SPF, DKIM, DMARC) verified.",
      commonIssue:
        "DKIM not signed for the new sender domain, increasing spam-folder placement.",
    },
    {
      number: 8,
      title:
        "Email setup discipline. Each event email (invitation, confirmation, reminders) is active and built in the Email Designer. The plain text version mirrors the HTML version. Click tracking is finalized. Each email is scheduled at the correct date and time.",
      commonIssue:
        "Email content updated in HTML but the plain text version still reflects an earlier draft.",
    },
  ],
};

const SECTION_G: Section = {
  letter: "G",
  slug: "attendee-communications",
  title: "Attendee Communications (Reminders, Updates, Day-Of)",
  why:
    "Reminders and day-of communications are sent to people who already trust you enough to register. The bar for these is higher than for invites.",
  checks: [
    {
      number: 1,
      title:
        "Pre-event reminder schedule defined. Typical cadence: 30 days, 14 days, 7 days, 1 day, day-of.",
      commonIssue:
        "Reminders all firing on the same day because the schedule wasn’t time-zoned.",
    },
    {
      number: 2,
      title:
        "Each reminder has unique content. Don’t send the same email four times.",
      commonIssue:
        "Four “Looking forward to seeing you” emails landing back-to-back, training attendees to ignore them.",
    },
    {
      number: 3,
      title:
        "Day-of communications are planned. Parking, check-in, schedule, contact info.",
      commonIssue: "Day-of email with no contact info for issues at the venue.",
    },
    {
      number: 4,
      title:
        "Communications include explicit time zone when audience spans multiple zones.",
      commonIssue:
        "“Doors open at 8 AM” without zone — global attendees show up at the wrong hour.",
    },
    {
      number: 5,
      title:
        "Reminders link to event resources — agenda, speaker bios, mobile app, venue map.",
      commonIssue:
        "Reminders without links, requiring attendees to find the original confirmation.",
    },
    {
      number: 6,
      title:
        "Brand voice consistent across all communications. Marketing’s tone matches event ops’ tone.",
      commonIssue:
        "Marketing reminders read as a campaign; event-ops reminders read as a vendor; attendees get whiplash.",
    },
    {
      number: 7,
      title:
        "Final pre-event checks scheduled for the morning of the event. Last-minute change protocol agreed.",
      commonIssue:
        "Final check missed; an outdated venue map ships in the day-of email.",
    },
    {
      number: 8,
      title:
        "Virtual / hybrid readiness, where applicable. Each guest’s unique access link is delivered in the confirmation and the day-of reminder. The calendar invite description references the access link. The end-to-end guest flow has been tested as an actual registrant. A day-of support plan is ready — who escalates if a guest can’t access, what email goes out if the streaming or chat provider is down.",
      commonIssue:
        "Day-of email refers to the platform but doesn’t include the unique access link, sending guests back to find their original confirmation.",
    },
  ],
};

const SECTION_H: Section = {
  letter: "H",
  slug: "modification-cancellation-flow",
  title: "Modification / Cancellation Flow",
  why:
    "The modification and cancellation flows are tested less than the registration flow but are equally important. They determine how attendees experience changing their minds.",
  checks: [
    {
      number: 1,
      title:
        "Modify-registration link in confirmation tested end-to-end.",
      commonIssue:
        "Modify link that opens a generic registration page instead of the attendee’s existing record.",
    },
    {
      number: 2,
      title:
        "Modification flow respects session capacity. Attendees changing sessions cannot bypass the cap.",
      commonIssue:
        "Attendee modifies into a closed session because the modification flow doesn’t check capacity.",
    },
    {
      number: 3,
      title: "Modification triggers an updated confirmation email.",
      commonIssue:
        "Modification saved silently; attendee unsure if the change took effect.",
    },
    {
      number: 4,
      title: "Cancel-registration link tested end-to-end.",
      commonIssue:
        "Cancel link that requires login credentials the attendee doesn’t have.",
    },
    {
      number: 5,
      title:
        "Cancellation policy displayed clearly before final cancellation.",
      commonIssue:
        "Refund policy buried; attendee cancels then disputes the partial-refund decision.",
    },
    {
      number: 6,
      title:
        "Cancellation triggers confirmation email and any internal notifications.",
      commonIssue:
        "Internal team unaware a sponsor canceled until they show up at the venue with no booth.",
    },
    {
      number: 7,
      title:
        "Refund logic on cancellation matches the policy. No, partial, or full refund — applied correctly.",
      commonIssue:
        "Refund logic that triggers a full refund when policy specifies partial.",
    },
    {
      number: 8,
      title:
        "Modification configuration and supporting pages reviewed. Modification Dates are set per registration path so registrants can modify within the intended window. Regret survey, cancellation survey, guest information page, and waitlist page are all reviewed and in order.",
      commonIssue:
        "Modification window not configured on a path that allows modifications, so the modify link surfaces but no edits save.",
    },
  ],
};

const SECTION_I: Section = {
  letter: "I",
  slug: "invitee-and-attendee-data",
  title: "Invitee and Attendee Data",
  why:
    "Data hygiene at the registration step determines reporting cleanliness for the next six months. This is where upstream → downstream lives.",
  checks: [
    {
      number: 1,
      title:
        "Invitee list is de-duplicated before upload. Especially across CRM segments.",
      commonIssue:
        "The same person on three lists receives three invites with different personalization tokens.",
    },
    {
      number: 2,
      title:
        "Personalization tokens tested with both populated and empty fallback values.",
      commonIssue:
        "“Dear {{first_name}},” rendered literally for invitees whose first name field is empty.",
    },
    {
      number: 3,
      title:
        "Email field validation prevents bad emails from triggering bounces.",
      commonIssue:
        "Trailing space or capitalization issue causing high-volume bounces from a single bad list segment.",
    },
    {
      number: 4,
      title:
        "Source / UTM tracking captured at registration. UTM parameters from invite links flow into Cvent reporting fields.",
      commonIssue:
        "UTM lost at the registration step because the field isn’t configured to capture it.",
    },
    {
      number: 5,
      title:
        "Custom fields populated where needed. Account, segment, region, partner code — whatever the program requires.",
      commonIssue:
        "Custom field added but not surfaced in the registration form or pre-fill, leaving the field empty for everyone.",
    },
    {
      number: 6,
      title:
        "Data sync to CRM / marketing automation tested with a real registration.",
      commonIssue:
        "Sync works for most fields but silently drops one — discovered weeks later.",
    },
    {
      number: 7,
      title:
        "Privacy / consent fields configured per jurisdiction. GDPR, CCPA, and any region-specific requirements where applicable.",
      commonIssue:
        "Consent checkbox missing for EU attendees; legal exposure increases as registrations come in.",
    },
    {
      number: 8,
      title:
        "Privacy and compliance setup verified. Privacy policy is visible on the event website. Cookie notification is configured for jurisdictions that require it. CCPA “Do Not Sell or Share” options are set if applicable. Contact snapshot configuration matches the event’s data retention practice. Invitation list reviewed end-to-end — everyone who should receive an email is on it.",
      commonIssue:
        "Cookie notification or privacy policy link configured for a prior event but not refreshed for the new build.",
    },
  ],
};

const SECTION_J: Section = {
  letter: "J",
  slug: "stakeholder-review",
  title: "Stakeholder Review",
  why:
    "Stakeholder issues caught after launch are public; stakeholder issues caught before launch are operational. The pre-launch sign-off is what separates the two.",
  checks: [
    {
      number: 1,
      title:
        "Key stakeholders have reviewed the registration page. Marketing, sales, exec sponsor, brand owner.",
      commonIssue:
        "Exec sponsor sees the page for the first time after launch and finds an issue everyone else missed.",
    },
    {
      number: 2,
      title:
        "Brand approval signed off. Logos, colors, taglines, photography all match brand guidelines.",
      commonIssue:
        "Brand asks for the previous brand mark; the new one was applied but not approved.",
    },
    {
      number: 3,
      title:
        "Legal / compliance review completed. T&Cs, privacy policy, refund policy, code of conduct.",
      commonIssue:
        "Legal review scheduled after launch, leading to last-minute T&C changes.",
    },
    {
      number: 4,
      title:
        "Speakers, sponsors, and VIPs notified of their custom paths and have tested their flow.",
      commonIssue:
        "Speaker registers via the GA path because the custom link wasn’t shared with them.",
    },
    {
      number: 5,
      title: "Internal demo / walkthrough conducted with the event team.",
      commonIssue:
        "On-site staff sees the registration page for the first time during the event.",
    },
    {
      number: 6,
      title: "Sign-off captured and dated for audit trail.",
      commonIssue:
        "Verbal sign-off; later disputes about what was approved when.",
    },
    {
      number: 7,
      title:
        "Edge cases discussed. Over-capacity, technical failure, payment issues — escalation paths agreed.",
      commonIssue:
        "Over-capacity handling decided ad-hoc during the event because no policy was set.",
    },
    {
      number: 8,
      title:
        "Communication plan for issues during event week is agreed. Who owns what, who gets paged, who decides.",
      commonIssue:
        "Critical issue at 6 AM on event day with no clear decision-maker available.",
    },
  ],
};

const SECTION_K: Section = {
  letter: "K",
  slug: "mobile-device-testing",
  title: "Mobile / Device Testing",
  why:
    "A meaningful share of registrations happen on mobile. Mobile-specific issues are invisible if the QA pass only happens on desktop.",
  checks: [
    {
      number: 1,
      title:
        "Registration page tested on iPhone (Safari) and Android (Chrome). Current and prior major version.",
      commonIssue:
        "Android Chrome rendering the date picker differently from iOS Safari, breaking date selection.",
    },
    {
      number: 2,
      title:
        "Form fields render correctly on mobile. No overlap, no cut-off, no horizontal scroll.",
      commonIssue:
        "Long dropdown options cut off mid-text on narrow screens.",
    },
    {
      number: 3,
      title:
        "Mobile keyboard appears appropriately per field type. Numeric for phone, email keyboard for email, etc.",
      commonIssue:
        "Email field showing the standard alphanumeric keyboard, slowing entry.",
    },
    {
      number: 4,
      title: "CTA button is tappable. 44×44 minimum touch target.",
      commonIssue:
        "Submit button squeezed below the fold and partially overlapping with another CTA.",
    },
    {
      number: 5,
      title: "Confirmation page renders cleanly on mobile.",
      commonIssue:
        "Confirmation page that scrolls forever because the desktop layout doesn’t collapse.",
    },
    {
      number: 6,
      title: "Mobile load time tested on a non-WiFi connection.",
      commonIssue:
        "Low load speed on a typical mobile connection that desktop tests never surface.",
    },
    {
      number: 7,
      title: "Tested in both portrait and landscape orientation.",
      commonIssue: "Landscape view that breaks the form layout on tablets.",
    },
    {
      number: 8,
      title:
        "Browser compatibility checked. Chrome, Safari, Firefox, Edge — current and prior major version.",
      commonIssue:
        "Firefox rendering issue that nobody catches because the team uses Chrome.",
    },
  ],
};

const SECTION_L: Section = {
  letter: "L",
  slug: "accessibility-readability",
  title: "Accessibility / Readability",
  why:
    "Accessibility is both compliance and attendee experience. A registration page that excludes some users excludes the brand from those users.",
  checks: [
    {
      number: 1,
      title:
        "Color contrast meets WCAG AA standards for body text and CTAs.",
      commonIssue:
        "“Secondary” CTA in light gray on white that fails AA contrast.",
    },
    {
      number: 2,
      title:
        "Form labels properly associated with inputs. Screen reader compatibility verified.",
      commonIssue:
        "Labels positioned above inputs visually but not programmatically associated; screen readers don’t announce the field name.",
    },
    {
      number: 3,
      title: "Tab order through the form is logical.",
      commonIssue:
        "Tab order that skips the dropdown and lands on the submit button two fields early.",
    },
    {
      number: 4,
      title:
        "Error states are perceivable visually and to assistive tech. Color alone is not the only error indicator.",
      commonIssue:
        "Red border on invalid field with no text or ARIA error message; colorblind or screen-reader users miss the error entirely.",
    },
    {
      number: 5,
      title:
        "Keyboard navigation works without a mouse. Form completable via keyboard alone.",
      commonIssue: "Custom dropdown that doesn’t open via keyboard.",
    },
    {
      number: 6,
      title:
        "Reading level appropriate for the audience. Avoid jargon and complex sentence structures where they don’t add value.",
      commonIssue:
        "Legal language in the body of the registration page that scares attendees away.",
    },
    {
      number: 7,
      title: "Alt text present on key event imagery.",
      commonIssue:
        "Hero image without alt text; screen reader announces “image” with no context.",
    },
    {
      number: 8,
      title: "Time zone labels explicit. No “5 PM” without zone.",
      commonIssue:
        "“Doors at 5 PM” — attendees in a different zone show up at the wrong hour.",
    },
  ],
};

const SECTION_M: Section = {
  letter: "M",
  slug: "final-go-live-readiness",
  title: "Final Go-Live Readiness",
  why:
    "This is the last gate. Sections A–M can each be clean individually; this section verifies they hold together as a coordinated launch.",
  checks: [
    {
      number: 1,
      title:
        "All sections above are checked off. Open issues are either resolved or explicitly accepted by an owner.",
      commonIssue:
        "“We’ll fix it after launch” issues that turn into post-launch fires.",
    },
    {
      number: 2,
      title:
        "Test registration completed end-to-end. A real attendee path, from invite open through confirmation receipt.",
      commonIssue:
        "Path tested in pieces but never as a single flow; an integration breaks at the seam between two sections.",
    },
    {
      number: 3,
      title: "Production data and test data clearly separated.",
      commonIssue:
        "Test data accidentally shipped in the production registration count.",
    },
    {
      number: 4,
      title: "Test registrations deleted or flagged before invites send.",
      commonIssue:
        "“Test User” with the team’s email visible in the public attendee list.",
    },
    {
      number: 5,
      title:
        "Internal team notified of go-live time. Marketing, sales, exec sponsor, support all know when registration opens.",
      commonIssue:
        "Sales reaches out to invitees before the registration page is actually live.",
    },
    {
      number: 6,
      title:
        "Monitoring window planned for the first 24 hours after launch. Planner Alerts configured so the right people are notified of key registration events. Someone is watching for issues, not assuming everything’s fine.",
      commonIssue:
        "Bug at 9 PM on launch day; nobody notices until 9 AM the next morning.",
    },
    {
      number: 7,
      title:
        "Issue triage process documented. Who fixes what, by when, with what authority.",
      commonIssue:
        "Critical issue surfaces; team spends 30 minutes deciding who owns it before fixing.",
    },
    {
      number: 8,
      title:
        "Stakeholder sign-off captured at the final go/no-go check-in. Feedback Survey configured and ready for post-event distribution.",
      commonIssue:
        "Implicit go-ahead; later dispute about whether launch was approved.",
    },
  ],
};

const SECTION_N: Section = {
  letter: "N",
  slug: "attendee-hub-event-app",
  title: "Attendee Hub & Event App (if applicable)",
  why:
    "For events that publish a Cvent Attendee Hub (Event App + Attendee Website), publishing is a separate launch gate from registration. The Event App and Attendee Website are published separately and cannot be removed from the event after publishing — so the pre-publish pass deserves its own discipline.",
  checks: [
    {
      number: 1,
      title:
        "Featured content selected. Featured speakers, featured sessions, and featured exhibitors are set per the event’s feature priorities. Session videos are uploaded for any pre-recorded virtual or hybrid sessions; the file delivery deadline agreed with your Solutions Specialist is met.",
      commonIssue:
        "Featured speakers carried over from a copied event; session videos referenced but the files not yet delivered to the file-share location.",
    },
    {
      number: 2,
      title:
        "Authentication and privacy configured. Post-registration authentication method set to the secure verification code option. “Do Not Sell or Share” setting reviewed and the relevant URL entered if applicable. Terms of Use displayed if your organization uses one. Note: Terms of Use text cannot be changed after an attendee has accepted from the Event App or Attendee Website.",
      commonIssue:
        "Terms of Use text published with placeholder language, then locked once the first attendee accepts.",
    },
    {
      number: 3,
      title:
        "Attendee opt-in for exhibitors reviewed. The wording of the opt-in question and choices reflects the event’s privacy stance and exhibitor agreements.",
      commonIssue:
        "Default opt-in wording used unchanged; doesn’t match the contracted exhibitor data-sharing terms.",
    },
    {
      number: 4,
      title:
        "Exhibitor setup verified. Featured exhibitors selected. Exhibitor meetings, appointments, content, sponsorship levels, sponsored sessions, and inbound leads configured per the event’s exhibitor program.",
      commonIssue:
        "Exhibitor appointments enabled but the underlying setup (availability, time slots) incomplete, surfacing an empty booking interface to attendees.",
    },
    {
      number: 5,
      title:
        "Design assets uploaded in the Website and App Builder. Event icon, splash screen (with the safety margins respected), website banner, logo, and any header images are uploaded. Theme colors and mood selected.",
      commonIssue:
        "Splash screen uploaded without respecting the recommended safety margins; key elements get cropped on certain device sizes.",
    },
    {
      number: 6,
      title:
        "Profile editing and visibility set. Profile editing is allowed or disabled per the program. Attendee profile visibility (hidden vs. visible by default) confirmed against the privacy stance.",
      commonIssue:
        "Default profile visibility left as “visible” for an event whose attendee list is meant to stay private.",
    },
    {
      number: 7,
      title:
        "Event access, visibility, and login configured. Event assigned to the right space if used. Event visibility within the Cvent Events app set (visible or hidden, and whether an Event ID is required to access). Login requirements set per page so the right pages are gated.",
      commonIssue:
        "Event marked visible in the Cvent Events app when the program intends invite-only access via Event ID.",
    },
    {
      number: 8,
      title:
        "Publish, share, and dry-run. Event App and Attendee Website published separately when ready. Website link shared with attendees per the launch plan; Event App download link distributed if used. A dry run completed for any virtual sessions before go-live.",
      commonIssue:
        "Attendee Website published but the link not yet distributed in any reminder email; attendees discover it day-of with no time to acclimate.",
    },
  ],
};

/**
 * All 14 sections in PDF order (A through N). Use `SECTIONS_BY_LETTER`
 * for keyed lookups.
 */
export const SECTIONS: readonly Section[] = [
  SECTION_A, SECTION_B, SECTION_C, SECTION_D, SECTION_E, SECTION_F, SECTION_G,
  SECTION_H, SECTION_I, SECTION_J, SECTION_K, SECTION_L, SECTION_M, SECTION_N,
];

export const SECTIONS_BY_LETTER: Record<SectionLetter, Section> = {
  A: SECTION_A, B: SECTION_B, C: SECTION_C, D: SECTION_D, E: SECTION_E,
  F: SECTION_F, G: SECTION_G, H: SECTION_H, I: SECTION_I, J: SECTION_J,
  K: SECTION_K, L: SECTION_L, M: SECTION_M, N: SECTION_N,
};

/* ─────────────────────────────  Red Flags  ──────────────────────── */

export const RED_FLAGS_META = {
  eyebrow: "RED FLAGS · PAUSE LAUNCH CRITERIA",
  heading: "Red flags — pause launch until resolved.",
  intro:
    "If any of the following are open at the go/no-go check, pause the launch. None of these is worth shipping past.",
} as const;

export const RED_FLAGS: RedFlag[] = [
  {
    number: 1,
    text:
      "Confirmation email firing with wrong content (path mismatch, prior event template still active, or attached ICS / calendar link generates an unintended entry).",
  },
  {
    number: 2,
    text:
      "Calendar invite (ICS) showing wrong date, wrong time zone, or producing the wrong intended calendar entry for registrants.",
  },
  {
    number: 3,
    text:
      "Pricing setup broken — e.g., early-bird cutoff dates not set correctly in the back end, or pricing components not associated to the right agenda items.",
  },
  {
    number: 4,
    text: "Comp code logic broken — overcharging or under-charging attendees.",
  },
  {
    number: 5,
    text:
      "Required field that’s not actually required in the database (data integrity issue).",
  },
  {
    number: 6,
    text: "Stakeholder rejection or disagreement that hasn’t been resolved.",
  },
  { number: 7, text: "Legal or compliance items unresolved." },
  {
    number: 8,
    text:
      "Test data not separated from production data, or test registrations still present at invite send.",
  },
  { number: 9, text: "Mobile registration broken on a major device." },
  {
    number: 10,
    text: "Payment processor not active for the new event in production.",
  },
  {
    number: 11,
    text:
      "Privacy / consent missing for any jurisdiction with active attendees.",
  },
  {
    number: 12,
    text:
      "Sensitive personal data (passport, date of birth, similar) being collected via custom registration questions instead of Cvent’s dedicated encrypted contact fields.",
  },
];

export const RED_FLAGS_CLOSING =
  "A delayed launch is recoverable. A broken launch ships forward and gets harder to fix the longer it runs.";

/* ────────────────────────  LaunchHouse Lens  ────────────────────── */

export const LAUNCHHOUSE_LENS = {
  eyebrow: "THE LAUNCHHOUSE LENS",
  heading: "A practitioner’s resource — carried alongside your team.",
  body: [
    "This checklist is a practitioner’s resource. It is intended to be used by your team, on your build, in your workflow.",
    "Where a specialist Cvent registration operations partner can reduce load: pre-launch QA is one of the highest-leverage moments in the event cycle, and one of the easiest to compress under timeline pressure. LaunchHouse provides the registration operations layer that carries the QA discipline alongside your team — the work in this checklist, run by a specialist, without disrupting the build you already have in flight.",
    "LaunchHouse does not replace your team. We do not run your event. We carry the build, QA, and reporting setup so your team stays focused on the event itself. If your team is short on capacity for any of the sections above in the weeks before launch, that’s the layer we sit inside.",
  ],
  callout:
    "Premium Cvent registration operations support — built around your existing event team’s workflow.",
  calloutUrl: "www.launchhouse.events",
} as const;

/* ─────────────────────────  Suggested Usage  ────────────────────── */

export const SUGGESTED_USAGE = {
  eyebrow: "SUGGESTED USAGE",
  heading: "Use this checklist in five passes.",
  intro:
    "A team can use this checklist most effectively across five distinct passes — a routine that turns the artifact into a discipline rather than a one-time read.",
  passes: [
    {
      number: "01",
      body:
        "Adopt as the default pre-launch QA artifact for every registration build. Save a fresh copy per event in your event-records folder; archive completed copies for audit and pattern-recognition over time.",
    },
    {
      number: "02",
      body:
        "Assign each section to a specific team member. The Owner column is the discipline that prevents diffuse ownership.",
    },
    {
      number: "03",
      body:
        "Run the first pass 7 days before registration launch. This catches structural issues early enough to fix without compressing other work.",
    },
    {
      number: "04",
      body:
        "Re-run 3 days before launch with stakeholders looped in. Final sign-off lives here.",
    },
    {
      number: "05",
      body:
        "Re-run 24 hours before launch as the final go/no-go check. Use the Red Flags section as the gating criterion.",
    },
  ] as UsagePass[],
  closing:
    "After each launch, review the checklist with the team and capture any issues that surfaced after launch but should have been caught in the pass. Add or refine checks accordingly. The checklist gets sharper with every event run.",
} as const;

/* ───────────────────────  Proof-Safe Guardrails  ────────────────── */

export const GUARDRAILS = {
  eyebrow: "PROOF-SAFE GUARDRAILS",
  heading: "How this checklist stays honest.",
  intro:
    "The checklist is structured so the value lives in the checks themselves — not in inflated claims about who has used it or what outcomes it guarantees.",
  items: [
    "The checklist does not claim that running it guarantees a smooth event. Outcomes depend on many factors beyond registration QA.",
    "The checklist does not claim LaunchHouse has run hundreds of pre-launch QA passes. It is a practitioner’s resource, drawn from genuine Cvent operational judgment, calibrated to the work LaunchHouse is built to carry.",
    "The checklist does not position itself as a replacement for the team’s own judgment. Every check has an owner; ownership stays with the team.",
    "The checklist does not claim aggregated client experience or named patterns (“In our experience delivering events for Fortune 500…”). It is structured around operational reality, not framed as scaled experience.",
    "The LaunchHouse Lens section is intentionally brief. The checklist is the value; the brand is the credit, not the pitch.",
  ],
  footer: [
    "End of Cvent Pre-Launch QA Checklist v03.",
    "Phase 2 production asset for the LaunchHouse Events campaign · Solving Registration Complexity with Strategic Registration Technology Support.",
  ],
} as const;
