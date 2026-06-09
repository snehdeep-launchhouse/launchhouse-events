export interface QuestionOption {
  label: string;
  value: number;
}

export interface Question {
  id: QuestionId;
  text: string;
  options: QuestionOption[];
  multiSelect?: boolean;
}

export type QuestionId =
  | "event_length"
  | "sessions"
  | "reg_paths"
  | "contact_types"
  | "reg_rules"
  | "payment_complexity"
  | "advanced_reg"
  | "hotel"
  | "languages"
  | "integrations"
  | "speakers"
  | "appointments"
  | "pages"
  | "branding"
  | "custom_functionality"
  | "reporting";

export type Complexity = "Simple" | "Medium" | "Advanced" | "Complex";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface Result {
  complexity: Complexity;
  price: string;
  firstDraft: string;
  revisionTurnaround: string;
}

export interface FloorRuleOutcome {
  rule: string;
  condition: string;
  floor: Complexity;
  effective: boolean;
}

export interface CategorySignals {
  creative_average_signal: number;
  creative_max_signal: number;
  registration_average_signal: number;
  registration_max_signal: number;
  logistics_average_signal: number;
  logistics_max_signal: number;
  noncreative_average_signal: number;
  noncreative_max_signal: number;
}

export interface ScoringTrace {
  aggregateScore: number;
  baseTier: Complexity;
  finalTier: Complexity;
  result: Result;
  effectiveTierOverrides: string[];
  evaluatedNoEffectTierRules: string[];
  confidenceLevel: ConfidenceLevel;
  confidenceReasons: string[];
  manualReviewRequired: boolean;
  manualReviewReasons: string[];
  internalReferenceHours: number;
  creative_average_signal: number;
  creative_max_signal: number;
  registration_average_signal: number;
  registration_max_signal: number;
  logistics_average_signal: number;
  logistics_max_signal: number;
  noncreative_average_signal: number;
  noncreative_max_signal: number;
  creative_hour_reference: string;
  noncreative_hour_reference: string;
  hour_calibration_notes: string[];
  inferredProducts: string[];
  selectedProductsForScope: string[];
  eventAppSelected: boolean;
  eventAppFeatures: string[];
}

export interface ProductSelection {
  selectedProducts: string[];
  eventAppSelected: boolean;
  eventAppFeatures: string[];
}
