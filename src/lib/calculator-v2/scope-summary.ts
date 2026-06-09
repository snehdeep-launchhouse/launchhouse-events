import type { QuestionId, ScoringTrace } from "./types";
import { questions } from "./questions";

type Answers = Partial<Record<QuestionId, number>>;

/**
 * Returns client-friendly bullet points describing the answered scope.
 * Uses the label of the picked option for each non-default answer.
 * No internal hours, signals, scores, or Cvent wording.
 */
export function generateV2ScopeSummary(
  answers: Answers,
  selectedProducts: string[],
  eventAppSelected: boolean,
  eventAppFeatures: string[],
): string[] {
  const bullets: string[] = [];

  for (const q of questions) {
    const value = answers[q.id];
    if (value === undefined) continue;
    const picked = q.options.find((o) => o.value === value);
    if (!picked) continue;
    // Skip "None"/"No"/zero-value choices to keep the summary scope-focused
    if (picked.value === 0) continue;
    bullets.push(`${q.text} — ${picked.label}`);
  }

  if (selectedProducts.length > 0) {
    bullets.push(`Services selected: ${selectedProducts.join(", ")}`);
  }

  if (eventAppSelected) {
    if (eventAppFeatures.length > 0) {
      bullets.push(`Event App features: ${eventAppFeatures.join(", ")}`);
    } else {
      bullets.push("Event App add-on selected");
    }
  }

  return bullets;
}

/**
 * Maps a confidence level to plain-English copy.
 */
export function describeConfidence(level: ScoringTrace["confidenceLevel"]): {
  title: string;
  body: string;
} {
  switch (level) {
    case "high":
      return {
        title: "High confidence",
        body: "Your event fits cleanly into this tier. The estimate above should be accurate as-is.",
      };
    case "medium":
      return {
        title: "Medium confidence",
        body: "Your event sits near a complexity boundary or includes a feature that benefits from a quick scoping conversation to confirm final pricing.",
      };
    case "low":
      return {
        title: "Lower confidence — scoping call recommended",
        body: "Your event has several factors that affect complexity. Final pricing will be confirmed after a short scoping call so we can match the right team to your build.",
      };
  }
}

/**
 * Maps internal manual-scoping-trigger strings (produced by the scoring engine)
 * onto public-safe wording suitable for the lead/admin payload and emails.
 * Strips internal numeric details like "average 0.67" and "max-4".
 */
const MANUAL_REASON_MAP: { match: (r: string) => boolean; sanitized: string }[] = [
  { match: (r) => r === "11+ registration paths", sanitized: "Large number of registration paths" },
  { match: (r) => r === "11+ contact types", sanitized: "Large number of attendee types" },
  { match: (r) => r === "6+ registration rules", sanitized: "Several registration rules required" },
  { match: (r) => r === "6+ hotel properties", sanitized: "Multiple hotel properties" },
  { match: (r) => r === "11+ integrations", sanitized: "Many third-party integrations" },
  { match: (r) => r === "Multilingual (3+) event", sanitized: "Multi-language event" },
  { match: (r) => r === "13+ pages combined with custom/premium design", sanitized: "Large website combined with custom design" },
  { match: (r) => r === "Advanced custom functionality", sanitized: "Advanced custom functionality required" },
  { match: (r) => /\d+ answers scored at maximum complexity/.test(r), sanitized: "Multiple high-complexity selections across the event" },
  { match: (r) => r === "Client selected 'Not sure / Need guidance'", sanitized: "Client requested guidance on services" },
  { match: (r) => r.startsWith("Concentrated single driver: creative"), sanitized: "Concentrated complexity in the design/creative scope" },
  { match: (r) => r.startsWith("Concentrated single driver: registration"), sanitized: "Concentrated complexity in the registration scope" },
  { match: (r) => r.startsWith("Concentrated single driver: logistics"), sanitized: "Concentrated complexity in the logistics scope" },
  { match: (r) => r.startsWith("Cross-category lopsidedness: creative max"), sanitized: "Design complexity is high relative to registration scope" },
  { match: (r) => r.startsWith("Cross-category lopsidedness: registration max"), sanitized: "Registration complexity is high relative to design scope" },
];

export function getPublicManualReviewReasons(reasons: string[]): string[] {
  const out: string[] = [];
  for (const reason of reasons) {
    const hit = MANUAL_REASON_MAP.find((m) => m.match(reason));
    if (hit && !out.includes(hit.sanitized)) {
      out.push(hit.sanitized);
    }
  }
  return out;
}

/**
 * Generates sanitized public-safe confidence reason strings for the V2 payload
 * and notification emails. Internal trace fields (aggregateScore, signals,
 * boundary numbers) are inspected here but NEVER emitted in the output.
 */
export function getPublicConfidenceReasons(trace: ScoringTrace): string[] {
  const reasons: string[] = [];

  if (trace.confidenceLevel === "high") {
    reasons.push("The estimate is consistent across your answers.");
    return reasons;
  }

  const score = trace.aggregateScore;
  const nearBoundary = [14, 25, 37].some((b) => Math.abs(score - b) <= 2);
  if (nearBoundary) {
    reasons.push(
      "Your estimate is close to a tier boundary, so a few details may refine the final scope.",
    );
  }

  const overrideCount = trace.effectiveTierOverrides.length;
  if (overrideCount === 1) {
    reasons.push("One advanced requirement is driving the estimate.");
  } else if (overrideCount >= 2) {
    reasons.push("Several advanced requirements make a scoping call recommended.");
  }

  const triggerCount = trace.manualReviewReasons.length;
  if (triggerCount >= 3) {
    reasons.push("Multiple parts of your event would benefit from a scoping conversation.");
  } else if (triggerCount >= 1) {
    reasons.push("A few aspects of your event would benefit from a quick scoping conversation.");
  }

  const gap = Math.abs(trace.creative_max_signal - trace.noncreative_max_signal);
  if (gap >= 3) {
    reasons.push(
      "Your event mixes high-complexity and low-complexity areas — a scoping call will help align scope.",
    );
  }

  if (reasons.length === 0) {
    reasons.push("A short scoping conversation will confirm pricing.");
  }
  return reasons;
}

/**
 * Pulls the answers whose option label is most "driver-like" (value ≥ 2),
 * mapping each to a friendly key driver phrase using the picked option's label.
 */
export function getKeyComplexityDrivers(answers: Answers): string[] {
  const drivers: { id: QuestionId; value: number; label: string; questionText: string }[] = [];
  for (const q of questions) {
    const value = answers[q.id];
    if (value === undefined || value < 2) continue;
    const picked = q.options.find((o) => o.value === value);
    if (!picked) continue;
    drivers.push({ id: q.id, value, label: picked.label, questionText: q.text });
  }
  // Sort by impact descending
  drivers.sort((a, b) => b.value - a.value);
  return drivers.slice(0, 6).map((d) => `${d.questionText} — ${d.label}`);
}
