export interface QuestionOption {
  label: string;
  value: number;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  multiSelect?: boolean;
}

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
    text: "Approximately how many agenda sessions will the event include?",
    options: [
      { label: "Under 10", value: 1 },
      { label: "10–30", value: 2 },
      { label: "30+", value: 3 },
    ],
  },
  {
    id: "reg_paths",
    text: "How many registration paths will the event have?",
    options: [
      { label: "One", value: 1 },
      { label: "Two to three", value: 2 },
      { label: "Four or more", value: 3 },
    ],
  },
  {
    id: "contact_types",
    text: "How many attendee/contact types will there be?",
    options: [
      { label: "One", value: 1 },
      { label: "Two to three", value: 2 },
      { label: "Four or more", value: 3 },
    ],
  },
  {
    id: "reg_rules",
    text: "Will your event require registration rules? (for example requiring attendees to select specific sessions)",
    options: [
      { label: "No", value: 0 },
      { label: "1–2 rules", value: 1 },
      { label: "3+ rules", value: 3 },
    ],
  },
  {
    id: "hotel",
    text: "Will your event require hotel booking?",
    options: [
      { label: "No", value: 0 },
      { label: "Yes", value: 2 },
    ],
  },
  {
    id: "languages",
    text: "Will the event require multiple languages?",
    options: [
      { label: "No", value: 0 },
      { label: "Yes", value: 2 },
    ],
  },
  {
    id: "integrations",
    text: "Will integrations with CRM or marketing platforms be needed?",
    options: [
      { label: "No", value: 0 },
      { label: "Yes", value: 3 },
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
      { label: "Yes", value: 2 },
    ],
  },
  {
    id: "pages",
    text: "Approximately how many pages will the event website have?",
    options: [
      { label: "1–3 pages", value: 1 },
      { label: "4–7 pages", value: 2 },
      { label: "8+ pages", value: 3 },
    ],
  },
  {
    id: "branding",
    text: "Will the event require advanced branding customization?",
    options: [
      { label: "Standard branding", value: 1 },
      { label: "Advanced custom design", value: 3 },
    ],
  },
  {
    id: "cvent_products",
    text: "Which Cvent Products will your event require? (Select all that apply)",
    multiSelect: true,
    options: [
      { label: "Registration & Event Website", value: 1 },
      { label: "Appointments", value: 1 },
      { label: "Abstract / Call for Speakers", value: 1 },
      { label: "Attendee Hub / Event App", value: 1 },
      { label: "Not sure / Need help deciding", value: 0 },
    ],
  },
];

export type Complexity = "Simple" | "Medium" | "Advanced" | "Complex";

export interface Result {
  complexity: Complexity;
  price: string;
  firstDraft: string;
  revisionTurnaround: string;
}

const resultMap: Record<Complexity, Result> = {
  Simple: {
    complexity: "Simple",
    price: "$899",
    firstDraft: "2 Business Days",
    revisionTurnaround: "1 Business Day",
  },
  Medium: {
    complexity: "Medium",
    price: "$2,199",
    firstDraft: "2 Business Days",
    revisionTurnaround: "2 Business Days",
  },
  Advanced: {
    complexity: "Advanced",
    price: "$3,499",
    firstDraft: "3 Business Days",
    revisionTurnaround: "3 Business Days",
  },
  Complex: {
    complexity: "Complex",
    price: "$4,999",
    firstDraft: "4 Business Days",
    revisionTurnaround: "3 Business Days",
  },
};

/** Products auto-inferred from earlier answers */
export function getInferredProducts(answers: Record<string, number>): string[] {
  const inferred: string[] = [];
  if (answers["speakers"] && answers["speakers"] > 0) {
    inferred.push("Abstract / Call for Speakers");
  }
  if (answers["appointments"] && answers["appointments"] > 0) {
    inferred.push("Appointments");
  }
  return inferred;
}

/** Filter the Cvent product options to hide already-inferred ones */
export function getFilteredCventOptions(answers: Record<string, number>): QuestionOption[] {
  const allOptions = questions.find(q => q.id === "cvent_products")!.options;
  const inferred = getInferredProducts(answers);
  return allOptions.filter(opt => {
    // Hide products that are already auto-inferred
    if (inferred.includes(opt.label)) return false;
    return true;
  });
}

export interface CalculationTrace {
  baseScore: number;
  baseTier: Complexity;
  inferredProducts: string[];
  allProducts: string[];
  overridesTriggered: string[];
  finalComplexity: Complexity;
}

const order: Complexity[] = ["Simple", "Medium", "Advanced", "Complex"];
const rank = (c: Complexity) => order.indexOf(c);
const maxComplexity = (a: Complexity, b: Complexity): Complexity =>
  rank(a) >= rank(b) ? a : b;

function tierFromScore(score: number): Complexity {
  if (score <= 12) return "Simple";
  if (score <= 18) return "Medium";
  if (score <= 25) return "Advanced";
  return "Complex";
}

export function calculateResultWithTrace(
  answers: Record<string, number>,
  selectedProducts: string[]
): { result: Result; trace: CalculationTrace } {
  const overridesTriggered: string[] = [];

  // Stage 1: Base score
  const baseScore = Object.entries(answers)
    .filter(([key]) => key !== "cvent_products")
    .reduce((sum, [, val]) => sum + val, 0);

  // Stage 2: Infer products
  const inferredProducts = getInferredProducts(answers);

  // Stage 3: Base tier
  const baseTier = tierFromScore(baseScore);
  let complexity = baseTier;

  // Stage 4: Minimum complexity overrides
  if (answers["branding"] === 3) {
    const next = maxComplexity(complexity, "Medium");
    if (next !== complexity) overridesTriggered.push("Advanced branding → min Medium");
    complexity = next;
  }
  if (answers["reg_paths"] === 3) {
    const next = maxComplexity(complexity, "Advanced");
    if (next !== complexity) overridesTriggered.push("4+ reg paths → min Advanced");
    complexity = next;
  }

  // Stage 5: Product overrides
  const allProducts = [
    ...new Set([
      ...inferredProducts,
      ...selectedProducts.filter((p) => p !== "Not sure / Need help deciding"),
    ]),
  ];
  const productCount = allProducts.length;

  if (allProducts.includes("Attendee Hub / Event App")) {
    const next = maxComplexity(complexity, "Medium");
    if (next !== complexity) overridesTriggered.push("Attendee Hub → min Medium");
    complexity = next;
  }
  if (productCount >= 3) {
    const next = maxComplexity(complexity, "Complex");
    if (next !== complexity) overridesTriggered.push(`${productCount} products → Complex`);
    complexity = next;
  } else if (productCount === 2) {
    const next = maxComplexity(complexity, "Advanced");
    if (next !== complexity) overridesTriggered.push("2 products → min Advanced");
    complexity = next;
  }

  // Stage 6: Build trace & return
  const trace: CalculationTrace = {
    baseScore,
    baseTier,
    inferredProducts,
    allProducts,
    overridesTriggered,
    finalComplexity: complexity,
  };

  if (import.meta.env.DEV) {
    console.group("🧮 Complexity Calculator Trace");
    console.log("Base score:", trace.baseScore);
    console.log("Base tier:", trace.baseTier);
    console.log("Inferred products:", trace.inferredProducts);
    console.log("All products:", trace.allProducts);
    console.log("Overrides triggered:", trace.overridesTriggered);
    console.log("Final complexity:", trace.finalComplexity);
    console.groupEnd();
  }

  return { result: resultMap[complexity], trace };
}

/** Backward-compatible wrapper */
export function calculateResult(
  answers: Record<string, number>,
  selectedProducts: string[]
): Result {
  return calculateResultWithTrace(answers, selectedProducts).result;
}