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
