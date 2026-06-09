import type { Complexity, Result } from "./types";

export const TIER_THRESHOLDS = {
  simple: { min: 0, max: 14 },
  medium: { min: 15, max: 25 },
  advanced: { min: 26, max: 37 },
  complex: { min: 38, max: Infinity },
} as const;

export const RESULT_MAP: Record<Complexity, Result> = {
  Simple: {
    complexity: "Simple",
    price: "$899",
    firstDraft: "2 business days",
    revisionTurnaround: "1 business day",
  },
  Medium: {
    complexity: "Medium",
    price: "$2,199",
    firstDraft: "2 business days",
    revisionTurnaround: "2 business days",
  },
  Advanced: {
    complexity: "Advanced",
    price: "$3,499",
    firstDraft: "3 business days",
    revisionTurnaround: "3 business days",
  },
  Complex: {
    complexity: "Complex",
    price: "$4,999",
    firstDraft: "4 business days",
    revisionTurnaround: "3 business days",
  },
};

export const EVENT_APP_PRICE = "$1,999";

export const INTERNAL_HOURS: Record<Complexity, number> = {
  Simple: 15,
  Medium: 25,
  Advanced: 35,
  Complex: 50,
};

export const CREATIVE_HOUR_REFERENCE: Record<number, string> = {
  1: "1–5 hours",
  2: "6–10 hours",
  3: "11–15 hours",
  4: "16–20 hours",
};

export const NONCREATIVE_HOUR_REFERENCE: Record<number, string> = {
  0: "10–14 hours",
  1: "10–14 hours",
  2: "15–19 hours",
  3: "20–24 hours",
  4: "30–34 hours",
};

export function scoreToTier(score: number): Complexity {
  if (score <= TIER_THRESHOLDS.simple.max) return "Simple";
  if (score <= TIER_THRESHOLDS.medium.max) return "Medium";
  if (score <= TIER_THRESHOLDS.advanced.max) return "Advanced";
  return "Complex";
}

const TIER_ORDER: Record<Complexity, number> = {
  Simple: 1,
  Medium: 2,
  Advanced: 3,
  Complex: 4,
};

export function maxTier(a: Complexity, b: Complexity): Complexity {
  return TIER_ORDER[a] >= TIER_ORDER[b] ? a : b;
}

export function tierIsHigherThan(a: Complexity, b: Complexity): boolean {
  return TIER_ORDER[a] > TIER_ORDER[b];
}
