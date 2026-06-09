import type {
  QuestionId,
  Complexity,
  ConfidenceLevel,
  ScoringTrace,
  FloorRuleOutcome,
  ProductSelection,
} from "./types";
import {
  scoreToTier,
  maxTier,
  tierIsHigherThan,
  RESULT_MAP,
  INTERNAL_HOURS,
  CREATIVE_HOUR_REFERENCE,
  NONCREATIVE_HOUR_REFERENCE,
} from "./pricing";

type Answers = Partial<Record<QuestionId, number>>;

const ALL_QUESTION_IDS: QuestionId[] = [
  "event_length", "sessions", "reg_paths", "contact_types", "reg_rules",
  "payment_complexity", "advanced_reg", "hotel", "languages", "integrations",
  "speakers", "appointments", "pages", "branding", "custom_functionality",
  "reporting",
];

const TIER_BOUNDARIES = [14, 25, 37];
const BOUNDARY_PROXIMITY = 2;

interface FloorRule {
  questionId: QuestionId;
  triggerValue: number;
  floor: Complexity;
  label: string;
}

const FLOOR_RULES: FloorRule[] = [
  { questionId: "reg_paths", triggerValue: 4, floor: "Complex", label: "11+ registration paths → Complex" },
  { questionId: "contact_types", triggerValue: 4, floor: "Complex", label: "11+ contact types → Complex" },
  { questionId: "reg_rules", triggerValue: 4, floor: "Complex", label: "6+ registration rules → Complex" },
  { questionId: "hotel", triggerValue: 4, floor: "Complex", label: "6+ hotel properties → Complex" },
  { questionId: "languages", triggerValue: 4, floor: "Complex", label: "Multilingual (3+) → Complex" },
  { questionId: "integrations", triggerValue: 4, floor: "Complex", label: "11+ integrations → Complex" },
  { questionId: "branding", triggerValue: 4, floor: "Advanced", label: "Premium branding → Advanced" },
  { questionId: "branding", triggerValue: 3, floor: "Medium", label: "Custom branding → Medium" },
  { questionId: "custom_functionality", triggerValue: 3, floor: "Advanced", label: "Advanced custom functionality → Advanced" },
  { questionId: "advanced_reg", triggerValue: 3, floor: "Advanced", label: "Advanced registration features → Advanced" },
];

const CREATIVE_QUESTIONS: QuestionId[] = ["pages", "branding", "custom_functionality"];
const REGISTRATION_QUESTIONS: QuestionId[] = [
  "reg_paths", "contact_types", "reg_rules", "payment_complexity",
  "advanced_reg", "speakers", "appointments", "reporting",
];
const LOGISTICS_QUESTIONS: QuestionId[] = [
  "event_length", "sessions", "hotel", "languages", "integrations",
];

function getScore(answers: Answers, id: QuestionId): number {
  return answers[id] ?? 0;
}

function computeCategorySignals(answers: Answers, questionIds: QuestionId[]): { avg: number; max: number } {
  const scores = questionIds.map((id) => getScore(answers, id));
  const sum = scores.reduce((a, b) => a + b, 0);
  return {
    avg: scores.length > 0 ? sum / scores.length : 0,
    max: Math.max(0, ...scores),
  };
}

function evaluateFloorRules(answers: Answers, currentTier: Complexity): FloorRuleOutcome[] {
  return FLOOR_RULES.map((rule) => {
    const score = getScore(answers, rule.questionId);
    const conditionMet = score >= rule.triggerValue;
    const effective = conditionMet && tierIsHigherThan(rule.floor, currentTier);
    return {
      rule: rule.label,
      condition: `${rule.questionId} = ${score} (trigger: ${rule.triggerValue})`,
      floor: rule.floor,
      effective,
    };
  });
}

interface ManualScopingInput {
  answers: Answers;
  creativeMax: number;
  creativeAvg: number;
  registrationMax: number;
  registrationAvg: number;
  logisticsMax: number;
  productSelection?: ProductSelection;
}

/**
 * Returns the 12 approved manual scoping triggers only.
 * Tier-boundary proximity is NOT a scoping trigger — it lives in confidence.
 */
function computeManualScopingTriggers(input: ManualScopingInput): string[] {
  const { answers, creativeMax, creativeAvg, registrationMax, registrationAvg, logisticsMax, productSelection } = input;
  const triggers: string[] = [];

  // 1. 11+ registration paths
  if (getScore(answers, "reg_paths") >= 4) {
    triggers.push("11+ registration paths");
  }
  // 2. 11+ contact types
  if (getScore(answers, "contact_types") >= 4) {
    triggers.push("11+ contact types");
  }
  // 3. 6+ registration rules
  if (getScore(answers, "reg_rules") >= 4) {
    triggers.push("6+ registration rules");
  }
  // 4. 6+ hotel properties
  if (getScore(answers, "hotel") >= 4) {
    triggers.push("6+ hotel properties");
  }
  // 5. 11+ integrations
  if (getScore(answers, "integrations") >= 4) {
    triggers.push("11+ integrations");
  }
  // 6. Multilingual 3+
  if (getScore(answers, "languages") >= 4) {
    triggers.push("Multilingual (3+) event");
  }
  // 7. 13+ pages combined with custom/premium design
  if (getScore(answers, "pages") >= 4 && getScore(answers, "branding") >= 3) {
    triggers.push("13+ pages combined with custom/premium design");
  }
  // 8. Advanced custom functionality
  if (getScore(answers, "custom_functionality") >= 3) {
    triggers.push("Advanced custom functionality");
  }
  // 9. 3+ answers scored at 4
  const maxedAnswers = ALL_QUESTION_IDS.filter((id) => getScore(answers, id) === 4).length;
  if (maxedAnswers >= 3) {
    triggers.push(`${maxedAnswers} answers scored at maximum complexity (4)`);
  }
  // 10. "Not sure / Need guidance" selected
  if (productSelection?.selectedProducts?.includes("Not sure / Need guidance")) {
    triggers.push("Client selected 'Not sure / Need guidance'");
  }
  // 11. Concentrated single driver: one category has max=4 while its average is ≤ 1.5
  const logAvg = computeCategorySignals(answers, LOGISTICS_QUESTIONS).avg;
  if (creativeMax === 4 && creativeAvg <= 1.5) {
    triggers.push("Concentrated single driver: creative category has a max-4 answer but low overall complexity");
  }
  if (registrationMax === 4 && registrationAvg <= 1.5) {
    triggers.push("Concentrated single driver: registration category has a max-4 answer but low overall complexity");
  }
  if (logisticsMax === 4 && logAvg <= 1.5) {
    triggers.push("Concentrated single driver: logistics category has a max-4 answer but low overall complexity");
  }
  // 12. Cross-category lopsidedness — Creative vs Registration ONLY (logistics excluded by spec)
  if (creativeMax === 4 && registrationAvg <= 1.0) {
    triggers.push(`Cross-category lopsidedness: creative max ${creativeMax} but registration average ${registrationAvg.toFixed(2)} ≤ 1.0`);
  }
  if (registrationMax === 4 && creativeAvg <= 1.0) {
    triggers.push(`Cross-category lopsidedness: registration max ${registrationMax} but creative average ${creativeAvg.toFixed(2)} ≤ 1.0`);
  }

  return triggers;
}

interface ConfidenceInput {
  effectiveOverrideCount: number;
  manualTriggerCount: number;
  aggregateScore: number;
  creativeMax: number;
  noncreativeMax: number;
}

function computeConfidence(input: ConfidenceInput): { level: ConfidenceLevel; reasons: string[] } {
  const { effectiveOverrideCount, manualTriggerCount, aggregateScore, creativeMax, noncreativeMax } = input;
  const reasons: string[] = [];
  let level: ConfidenceLevel = "high";

  // Effective floor rule overrides
  if (effectiveOverrideCount >= 2) {
    level = "low";
    reasons.push(`${effectiveOverrideCount} effective floor rule overrides (≥2 → low)`);
  } else if (effectiveOverrideCount === 1) {
    level = "medium";
    reasons.push("1 effective floor rule override → medium");
  }

  // Manual scoping triggers
  if (manualTriggerCount >= 3) {
    level = "low";
    reasons.push(`${manualTriggerCount} manual scoping triggers (≥3 → low)`);
  } else if (manualTriggerCount >= 1 && level !== "low") {
    level = "medium";
    reasons.push(`${manualTriggerCount} manual scoping trigger(s) → medium`);
  }

  // Score within 2 points of a tier boundary → at least Medium
  for (const b of TIER_BOUNDARIES) {
    if (Math.abs(aggregateScore - b) <= BOUNDARY_PROXIMITY) {
      if (level === "high") {
        level = "medium";
      }
      reasons.push(`Aggregate score ${aggregateScore} within ${BOUNDARY_PROXIMITY} of tier boundary ${b} → at least medium`);
      break;
    }
  }

  // Cross-category gap ≥ 3 → low
  if (Math.abs(creativeMax - noncreativeMax) >= 3) {
    level = "low";
    reasons.push(`Creative/non-creative max gap is ${Math.abs(creativeMax - noncreativeMax)} (≥3 → low)`);
  }

  if (reasons.length === 0) {
    reasons.push("No effective floor rule overrides, no manual scoping triggers, score not near a boundary");
  }

  return { level, reasons };
}

function inferProducts(answers: Answers): string[] {
  const products: string[] = ["Registration & Event Website"];
  if (getScore(answers, "speakers") >= 2) {
    products.push("Speaker & Abstract Management");
  }
  if (getScore(answers, "appointments") >= 3) {
    products.push("Appointment Scheduling");
  }
  return products;
}

export function calculateV2(
  answers: Answers,
  productSelection?: ProductSelection,
): ScoringTrace {
  // Stage 1: Aggregate score
  const aggregateScore = ALL_QUESTION_IDS.reduce((s, id) => s + getScore(answers, id), 0);

  // Stage 2: Base tier from score
  const baseTier = scoreToTier(aggregateScore);

  // Stage 3: Floor rules
  const floorOutcomes = evaluateFloorRules(answers, baseTier);
  let finalTier = baseTier;
  const effectiveTierOverrides: string[] = [];
  const evaluatedNoEffectTierRules: string[] = [];

  for (const outcome of floorOutcomes) {
    const rule = FLOOR_RULES.find((r) => r.label === outcome.rule)!;
    const conditionMet = getScore(answers, rule.questionId) >= rule.triggerValue;
    if (outcome.effective) {
      finalTier = maxTier(finalTier, outcome.floor);
      effectiveTierOverrides.push(outcome.rule);
    } else if (conditionMet) {
      evaluatedNoEffectTierRules.push(outcome.rule);
    }
  }

  // Stage 4: Category signals
  const creative = computeCategorySignals(answers, CREATIVE_QUESTIONS);
  const registration = computeCategorySignals(answers, REGISTRATION_QUESTIONS);
  const logistics = computeCategorySignals(answers, LOGISTICS_QUESTIONS);

  const noncreativeMax = Math.max(registration.max, logistics.max);
  const noncreativeAvg = (registration.avg + logistics.avg) / 2;

  const creativeHourRef = CREATIVE_HOUR_REFERENCE[Math.min(creative.max, 4)] ?? CREATIVE_HOUR_REFERENCE[1];
  const noncreativeHourRef = NONCREATIVE_HOUR_REFERENCE[Math.min(noncreativeMax, 4)] ?? NONCREATIVE_HOUR_REFERENCE[0];

  // Stage 5: Manual scoping triggers (12 approved only)
  const manualReviewReasons = computeManualScopingTriggers({
    answers,
    creativeMax: creative.max,
    creativeAvg: creative.avg,
    registrationMax: registration.max,
    registrationAvg: registration.avg,
    logisticsMax: logistics.max,
    productSelection,
  });

  // Confidence — includes boundary proximity as a confidence-only signal
  const { level: confidenceLevel, reasons: confidenceReasons } = computeConfidence({
    effectiveOverrideCount: effectiveTierOverrides.length,
    manualTriggerCount: manualReviewReasons.length,
    aggregateScore,
    creativeMax: creative.max,
    noncreativeMax,
  });

  // Hour calibration notes
  const hourNotes: string[] = [];
  const tierHours = INTERNAL_HOURS[finalTier];
  const creativeMaxSignal = Math.min(creative.max, 4);
  const creativeMidpoint = creativeMaxSignal === 1 ? 3 : creativeMaxSignal === 2 ? 8 : creativeMaxSignal === 3 ? 13 : creativeMaxSignal === 4 ? 18 : 0;
  const noncreativeMaxSignal = Math.min(noncreativeMax, 4);
  const noncreativeMidpoint = noncreativeMaxSignal <= 1 ? 12 : noncreativeMaxSignal === 2 ? 17 : noncreativeMaxSignal === 3 ? 22 : 32;

  if (creativeMidpoint + noncreativeMidpoint > tierHours * 1.2) {
    hourNotes.push(`Category hour references (creative ~${creativeMidpoint}h + non-creative ~${noncreativeMidpoint}h = ~${creativeMidpoint + noncreativeMidpoint}h) exceed tier total (${tierHours}h) by >20%`);
  }
  if (creativeMidpoint + noncreativeMidpoint < tierHours * 0.6) {
    hourNotes.push(`Category hour references (creative ~${creativeMidpoint}h + non-creative ~${noncreativeMidpoint}h = ~${creativeMidpoint + noncreativeMidpoint}h) are well below tier total (${tierHours}h)`);
  }

  // Stage 6: Product inference
  const inferredProducts = inferProducts(answers);
  const selectedProductsForScope = productSelection?.selectedProducts ?? inferredProducts;
  const eventAppSelected = productSelection?.eventAppSelected ?? false;

  return {
    aggregateScore,
    baseTier,
    finalTier,
    result: RESULT_MAP[finalTier],
    effectiveTierOverrides,
    evaluatedNoEffectTierRules,
    confidenceLevel,
    confidenceReasons,
    manualReviewRequired: manualReviewReasons.length > 0,
    manualReviewReasons,
    internalReferenceHours: INTERNAL_HOURS[finalTier],
    creative_average_signal: parseFloat(creative.avg.toFixed(2)),
    creative_max_signal: creative.max,
    registration_average_signal: parseFloat(registration.avg.toFixed(2)),
    registration_max_signal: registration.max,
    logistics_average_signal: parseFloat(logistics.avg.toFixed(2)),
    logistics_max_signal: logistics.max,
    noncreative_average_signal: parseFloat(noncreativeAvg.toFixed(2)),
    noncreative_max_signal: noncreativeMax,
    creative_hour_reference: creativeHourRef,
    noncreative_hour_reference: noncreativeHourRef,
    hour_calibration_notes: hourNotes,
    inferredProducts,
    selectedProductsForScope,
    eventAppSelected,
  };
}
