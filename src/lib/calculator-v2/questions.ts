import type { Question } from "./types";

export const questions: Question[] = [
  {
    id: "event_length",
    text: "How long is your event?",
    options: [
      { label: "1 day", value: 1 },
      { label: "2 days", value: 2 },
      { label: "3 days", value: 3 },
      { label: "4+ days", value: 4 },
    ],
  },
  {
    id: "sessions",
    text: "How many agenda sessions will your event include?",
    options: [
      { label: "1–5", value: 1 },
      { label: "6–10", value: 2 },
      { label: "11–14", value: 3 },
      { label: "15+", value: 4 },
    ],
  },
  {
    id: "contact_types",
    text: "How many attendee or contact types will there be?",
    options: [
      { label: "1–2", value: 1 },
      { label: "3–5", value: 2 },
      { label: "6–10", value: 3 },
      { label: "11+", value: 4 },
    ],
  },
  {
    id: "reg_paths",
    text: "How many registration paths will your event have?",
    options: [
      { label: "1", value: 1 },
      { label: "2–5", value: 2 },
      { label: "6–10", value: 3 },
      { label: "11+", value: 4 },
    ],
  },
  {
    id: "reg_rules",
    text: "Will your event require registration rules? (e.g., attendees must select specific sessions)",
    options: [
      { label: "None", value: 0 },
      { label: "1–2 rules", value: 2 },
      { label: "3–5 rules", value: 3 },
      { label: "6+ rules", value: 4 },
    ],
  },
  {
    id: "payment_complexity",
    text: "Will your event involve discount codes, early-bird rates, partial payments, or multiple fee types?",
    options: [
      { label: "No", value: 0 },
      { label: "Yes", value: 2 },
    ],
  },
  {
    id: "advanced_reg",
    text: "Will your registration need advanced features? (e.g., membership logic, table/group seating, approval workflows, restricted access)",
    options: [
      { label: "No", value: 0 },
      { label: "Yes", value: 3 },
    ],
  },
  {
    id: "hotel",
    text: "Will your event require hotel or travel booking?",
    options: [
      { label: "No hotel", value: 0 },
      { label: "1–3 properties", value: 2 },
      { label: "4–5 properties", value: 3 },
      { label: "6+ properties", value: 4 },
    ],
  },
  {
    id: "languages",
    text: "Will the event require multiple languages?",
    options: [
      { label: "Single language", value: 0 },
      { label: "Bilingual", value: 3 },
      { label: "Multilingual (3+)", value: 4 },
    ],
  },
  {
    id: "integrations",
    text: "How many integrations with CRM or marketing platforms will be needed?",
    options: [
      { label: "None", value: 0 },
      { label: "1–5", value: 2 },
      { label: "6–10", value: 3 },
      { label: "11+", value: 4 },
    ],
  },
  {
    id: "speakers",
    text: "Will speaker management or abstract submission be required?",
    options: [
      { label: "No", value: 0 },
      { label: "Yes", value: 2 },
    ],
  },
  {
    id: "appointments",
    text: "Will appointment scheduling be required?",
    options: [
      { label: "No", value: 0 },
      { label: "Yes", value: 3 },
    ],
  },
  {
    id: "pages",
    text: "Approximately how many pages will the event website have?",
    options: [
      { label: "1–3 pages", value: 1 },
      { label: "4–6 pages", value: 2 },
      { label: "7–12 pages", value: 3 },
      { label: "13+ pages", value: 4 },
    ],
  },
  {
    id: "branding",
    text: "What level of design customization will be needed?",
    options: [
      { label: "Standard (color matching, basic customization)", value: 1 },
      { label: "Custom (themed design, layout changes, navigation overhaul)", value: 3 },
      { label: "Premium (fully custom design with mock-up review and/or accessibility)", value: 4 },
    ],
  },
  {
    id: "custom_functionality",
    text: "Will the event website need custom functionality? (e.g., countdown timers, interactive widgets, custom scripts)",
    options: [
      { label: "None", value: 0 },
      { label: "Basic (widgets, countdown timers, animations)", value: 2 },
      { label: "Advanced (custom scripts, interactive elements)", value: 3 },
    ],
  },
  {
    id: "reporting",
    text: "Will you need custom reporting beyond standard analytics?",
    options: [
      { label: "None", value: 0 },
      { label: "1–3 custom reports", value: 3 },
      { label: "4+ custom reports", value: 4 },
    ],
  },
];

export const PRODUCT_OPTIONS = [
  "Registration & Event Website",
  "Appointment Scheduling",
  "Speaker & Abstract Management",
  "Event App",
  "Not sure / Need guidance",
] as const;

export type ProductOption = (typeof PRODUCT_OPTIONS)[number];

export const EVENT_APP_FEATURES = [
  "Agenda",
  "Attendee networking",
  "Push notifications",
  "Gamification",
  "Exhibitors",
] as const;

export type EventAppFeature = (typeof EVENT_APP_FEATURES)[number];

/**
 * Returns the registration-path options that are valid for a given contact_types value.
 * Each registration path generally needs at least one contact type behind it, so the
 * upper bound of reg_paths is capped by the contact_types band.
 *
 * Scoring values stay grid-aligned (1/2/3/4) — only the visible options narrow.
 * When contact_types = 1 (1–2 contact types), the upper option is shown as
 * "2 only" but still scores as 2 (Medium band) per the grid.
 */
export function getRegPathOptionsForContactTypes(
  contactTypesValue: number | undefined,
): { label: string; value: number }[] {
  const v = contactTypesValue ?? 4;
  if (v <= 1) {
    return [
      { label: "1", value: 1 },
      { label: "2 only", value: 2 },
    ];
  }
  if (v === 2) {
    return [
      { label: "1", value: 1 },
      { label: "2–5", value: 2 },
    ];
  }
  if (v === 3) {
    return [
      { label: "1", value: 1 },
      { label: "2–5", value: 2 },
      { label: "6–10", value: 3 },
    ];
  }
  return [
    { label: "1", value: 1 },
    { label: "2–5", value: 2 },
    { label: "6–10", value: 3 },
    { label: "11+", value: 4 },
  ];
}
