import { describe, it, expect } from "vitest";
import { calculateV2 } from "./scoring-engine";
import type { QuestionId } from "./types";

type Answers = Partial<Record<QuestionId, number>>;

function makeAnswers(overrides: Answers): Answers {
  const defaults: Record<QuestionId, number> = {
    event_length: 1,
    sessions: 1,
    reg_paths: 1,
    contact_types: 1,
    reg_rules: 0,
    payment_complexity: 0,
    advanced_reg: 0,
    hotel: 0,
    languages: 0,
    integrations: 0,
    speakers: 0,
    appointments: 0,
    pages: 1,
    branding: 1,
    custom_functionality: 0,
    reporting: 0,
  };
  return { ...defaults, ...overrides };
}

describe("Calculator V2 Scoring Engine", () => {
  // Scenario A: Minimal Simple event
  describe("Scenario A — Minimal Simple", () => {
    it("should score as Simple with high confidence", () => {
      const answers = makeAnswers({});
      // All defaults: 1+1+1+1+0+0+0+0+0+0+0+0+1+1+0+0 = 6
      const trace = calculateV2(answers);
      expect(trace.aggregateScore).toBe(6);
      expect(trace.baseTier).toBe("Simple");
      expect(trace.finalTier).toBe("Simple");
      expect(trace.result.price).toBe("$899");
      expect(trace.effectiveTierOverrides).toHaveLength(0);
      expect(trace.confidenceLevel).toBe("high");
      expect(trace.manualReviewRequired).toBe(false);
      expect(trace.internalReferenceHours).toBe(15);
    });
  });

  // Scenario B: Borderline Simple/Medium (score ~14-15)
  describe("Scenario B — Borderline Simple/Medium", () => {
    it("boundary proximity should affect confidence only, not manual review", () => {
      const answers = makeAnswers({
        event_length: 2,       // 2
        sessions: 2,           // 2
        reg_paths: 2,          // 2
        contact_types: 2,      // 2
        pages: 2,              // 2
        branding: 1,           // 1
        payment_complexity: 2, // 2
        hotel: 2,              // 2 → score = 15
      });
      const trace = calculateV2(answers);
      expect(trace.aggregateScore).toBe(15);
      expect(trace.baseTier).toBe("Medium");
      expect(trace.finalTier).toBe("Medium");
      // Boundary proximity should NOT trigger manual review
      expect(trace.manualReviewRequired).toBe(false);
      expect(trace.manualReviewReasons).toHaveLength(0);
      // Boundary proximity SHOULD reduce confidence and appear in confidenceReasons
      expect(trace.confidenceLevel).toBe("medium");
      expect(trace.confidenceReasons.some((r) => r.includes("within 2 of tier boundary"))).toBe(true);
    });
  });

  // Scenario C: Solid Medium
  describe("Scenario C — Solid Medium", () => {
    it("should score as Medium with no boundary triggers", () => {
      const answers = makeAnswers({
        event_length: 2,       // 2
        sessions: 2,           // 2
        reg_paths: 2,          // 2
        contact_types: 2,      // 2
        reg_rules: 2,          // 2
        payment_complexity: 2, // 2
        hotel: 2,              // 2
        pages: 2,              // 2
        branding: 3,           // 3 → floor rule: Custom branding → Medium (but already Medium)
        // Total: 2+2+2+2+2+2+0+2+0+0+0+0+2+3+0+0 = 19
      });
      const trace = calculateV2(answers);
      expect(trace.aggregateScore).toBe(19);
      expect(trace.baseTier).toBe("Medium");
      expect(trace.finalTier).toBe("Medium");
      expect(trace.result.price).toBe("$2,199");
      expect(trace.confidenceLevel).toBe("high");
    });
  });

  // Scenario D: Floor rule upgrade Simple → Advanced
  describe("Scenario D — Floor rule upgrade", () => {
    it("should upgrade to Advanced via custom_functionality floor rule", () => {
      const answers = makeAnswers({
        event_length: 1,       // 1
        sessions: 1,           // 1
        reg_paths: 1,          // 1
        contact_types: 1,      // 1
        custom_functionality: 3, // 3 → floor: Advanced
        pages: 2,              // 2
        // Total: 1+1+1+1+0+0+0+0+0+0+0+0+2+1+3+0 = 10
      });
      const trace = calculateV2(answers);
      expect(trace.aggregateScore).toBe(10);
      expect(trace.baseTier).toBe("Simple");
      expect(trace.finalTier).toBe("Advanced");
      expect(trace.result.price).toBe("$3,499");
      expect(trace.effectiveTierOverrides).toContain("Advanced custom functionality → Advanced");
      expect(trace.confidenceLevel).toBe("medium");
    });
  });

  // Scenario E: Multiple floor rules → Complex
  describe("Scenario E — Multiple floor rules", () => {
    it("should upgrade to Complex with low confidence", () => {
      const answers = makeAnswers({
        event_length: 2,  // 2
        sessions: 2,      // 2
        reg_paths: 4,     // 4 → Complex floor
        contact_types: 4, // 4 → Complex floor
        reg_rules: 2,     // 2
        pages: 2,         // 2
        branding: 1,      // 1
        // Total: 2+2+4+4+2+0+0+0+0+0+0+0+2+1+0+0 = 17
      });
      const trace = calculateV2(answers);
      expect(trace.aggregateScore).toBe(17);
      expect(trace.baseTier).toBe("Medium");
      expect(trace.finalTier).toBe("Complex");
      expect(trace.effectiveTierOverrides.length).toBeGreaterThanOrEqual(2);
      expect(trace.confidenceLevel).toBe("low");
      expect(trace.result.price).toBe("$4,999");
    });
  });

  // Scenario F: Lopsided creative-heavy event
  describe("Scenario F — Lopsided creative-heavy", () => {
    it("should flag lopsided creative trigger", () => {
      const answers = makeAnswers({
        pages: 4,              // 4
        branding: 4,           // 4 → Advanced floor
        custom_functionality: 3, // 3 → Advanced floor
        // Non-creative all minimal
        event_length: 1, sessions: 1, reg_paths: 1, contact_types: 1,
        // Total: 1+1+1+1+0+0+0+0+0+0+0+0+4+4+3+0 = 15
      });
      const trace = calculateV2(answers);
      expect(trace.creative_max_signal).toBe(4);
      expect(trace.noncreative_max_signal).toBeLessThanOrEqual(1);
      expect(trace.manualReviewReasons.some((r) => r.includes("Cross-category lopsidedness"))).toBe(true);
    });
  });

  // Scenario G: Lopsided registration-heavy event
  describe("Scenario G — Lopsided registration-heavy", () => {
    it("should flag lopsided non-creative trigger", () => {
      const answers = makeAnswers({
        reg_paths: 4,     // 4 → Complex floor
        contact_types: 3, // 3
        reg_rules: 3,     // 3
        advanced_reg: 3,  // 3
        reporting: 4,     // 4
        // Creative minimal
        pages: 1, branding: 1, custom_functionality: 0,
        // Total: 1+1+4+3+3+0+3+0+0+0+0+0+1+1+0+4 = 21
      });
      const trace = calculateV2(answers);
      expect(trace.registration_max_signal).toBe(4);
      expect(trace.creative_max_signal).toBeLessThanOrEqual(1);
      expect(trace.manualReviewReasons.some((r) => r.includes("Cross-category lopsidedness"))).toBe(true);
    });
  });

  // Scenario H: High aggregate, no floor rules, high confidence
  describe("Scenario H — High aggregate, high confidence", () => {
    it("should score Advanced with high confidence and no floor rules", () => {
      const answers = makeAnswers({
        event_length: 3,       // 3
        sessions: 3,           // 3
        reg_paths: 2,          // 2
        contact_types: 2,      // 2
        reg_rules: 2,          // 2
        payment_complexity: 2, // 2
        hotel: 2,              // 2
        integrations: 2,       // 2
        speakers: 2,           // 2
        pages: 2,              // 2
        branding: 1,           // 1
        custom_functionality: 2, // 2
        // Total: 3+3+2+2+2+2+0+2+0+2+2+0+2+1+2+0 = 25+2 = 27 wait let me recount
        // event_length:3 + sessions:3 + reg_paths:2 + contact_types:2 + reg_rules:2 + payment:2 + advanced_reg:0 + hotel:2 + languages:0 + integrations:2 + speakers:2 + appointments:0 + pages:2 + branding:1 + custom:2 + reporting:0
        // = 3+3+2+2+2+2+0+2+0+2+2+0+2+1+2+0 = 23
        // Need 27. Add more:
        reporting: 3,          // +3 = 26
        appointments: 3,      // hmm that triggers appointment product but not a floor rule
      });
      // Recount: 3+3+2+2+2+2+0+2+0+2+2+3+2+1+2+3 = 31
      // That's Advanced (26-37). But appointments=3 triggers manual scoping.
      // Let me adjust to avoid manual scoping triggers and get 27.
      const adjustedAnswers = makeAnswers({
        event_length: 3,       // 3
        sessions: 3,           // 3
        reg_paths: 2,          // 2
        contact_types: 2,      // 2
        reg_rules: 2,          // 2
        payment_complexity: 2, // 2
        hotel: 2,              // 2
        integrations: 2,       // 2
        speakers: 2,           // 2
        pages: 2,              // 2
        branding: 1,           // 1
        custom_functionality: 2, // 2
        // = 3+3+2+2+2+2+0+2+0+2+2+0+2+1+2+0 = 23. Need 27, add 4 more.
        reporting: 3,          // +3 = 26
      });
      // 26 → Advanced. Score 26 is at boundary (26 = advanced min). Within 2 of 25 → trigger.
      // Use score 28 instead.
      const finalAnswers = makeAnswers({
        event_length: 3,       // 3
        sessions: 3,           // 3
        reg_paths: 2,          // 2
        contact_types: 2,      // 2
        reg_rules: 3,          // 3
        payment_complexity: 2, // 2
        hotel: 2,              // 2
        integrations: 2,       // 2
        speakers: 2,           // 2
        pages: 2,              // 2
        branding: 1,           // 1
        custom_functionality: 2, // 2
        // = 3+3+2+2+3+2+0+2+0+2+2+0+2+1+2+0 = 26. Still 26.
        // Add reporting: 3 → 29
        reporting: 3,
      });
      // 3+3+2+2+3+2+0+2+0+2+2+0+2+1+2+3 = 29. Advanced. Not within 2 of 25 or 37.
      // No floor rules triggered (max answer is 3 but reg_rules=3 trigger is 4, not 3).
      // Check: reg_rules floor is triggerValue 4, we have 3. No floor fires.
      // Manual triggers: score 29, boundaries 14/25/37. |29-25|=4, |29-37|=8. No boundary trigger.
      // No lopsided: creative max = max(2,1,2)=2, reg max = max(2,2,3,2,0,2,0,3)=3, logistics max = max(3,3,2,0,2)=3
      // noncreative max = max(3,3)=3. creative max=2, noncreative max=3. gap=1 < 3. No low.
      // Lopsided trigger: noncreative max(3) >= 3 AND creative max(2) ≤ 1? No, creative=2 > 1. Not triggered.
      // No language/hotel/advanced_reg/reporting triggers (hotel=2<4, reporting=3<4).
      // No lopsided triggers. But reg_rules=3 doesn't trigger advanced_reg (that's a different question).
      // Wait: we need to check ALL scoping triggers carefully:
      // #9 languages: 0 < 3, no. #10 hotel: 2 < 4, no. #11 advanced_reg: 0 < 3, no. #12 reporting: 3 < 4, no.
      // #7 creative avg: (2+1+2)/3 = 1.67 < 3. #8 noncreative avg: reg_avg=(2+2+3+2+0+2+0+3)/8=14/8=1.75, log_avg=(3+3+2+0+2)/5=10/5=2. noncreative_avg = (1.75+2)/2 = 1.875 < 3.
      // No triggers → high confidence!
      const trace = calculateV2(finalAnswers);
      expect(trace.aggregateScore).toBe(29);
      expect(trace.baseTier).toBe("Advanced");
      expect(trace.finalTier).toBe("Advanced");
      expect(trace.effectiveTierOverrides).toHaveLength(0);
      expect(trace.confidenceLevel).toBe("high");
      expect(trace.internalReferenceHours).toBe(35);
    });
  });

  // Scenario I: Complex via aggregate score
  describe("Scenario I — Complex via aggregate score", () => {
    it("should reach Complex tier through high aggregate", () => {
      const answers = makeAnswers({
        event_length: 4,       // 4
        sessions: 4,           // 4
        reg_paths: 3,          // 3
        contact_types: 3,      // 3
        reg_rules: 3,          // 3
        payment_complexity: 2, // 2
        advanced_reg: 3,       // 3
        hotel: 3,              // 3
        languages: 3,          // 3
        integrations: 3,       // 3
        speakers: 2,           // 2
        pages: 3,              // 3
        branding: 3,           // 3
        custom_functionality: 2, // 2
        // = 4+4+3+3+3+2+3+3+3+3+2+0+3+3+2+0 = 41
        // Complex (≥38). Let me verify no appointments or reporting needed.
      });
      const trace = calculateV2(answers);
      expect(trace.aggregateScore).toBe(41);
      expect(trace.baseTier).toBe("Complex");
      expect(trace.finalTier).toBe("Complex");
      expect(trace.result.price).toBe("$4,999");
      expect(trace.internalReferenceHours).toBe(50);
    });
  });

  // Scenario J: Event App selection
  describe("Scenario J — Event App selection", () => {
    it("should not change tier when Event App is selected", () => {
      const answers = makeAnswers({
        event_length: 2, sessions: 2, reg_paths: 2, contact_types: 2,
        pages: 2, branding: 1,
      });
      const traceWithout = calculateV2(answers);
      const traceWith = calculateV2(answers, {
        selectedProducts: ["Registration & Event Website", "Event App"],
        eventAppSelected: true,
        eventAppFeatures: ["Agenda", "Push notifications"],
      });
      expect(traceWith.finalTier).toBe(traceWithout.finalTier);
      expect(traceWith.eventAppSelected).toBe(true);
    });
  });

  // Scenario K: Product inference from answers
  describe("Scenario K — Product inference", () => {
    it("should infer Speaker & Abstract Management when speakers=Yes", () => {
      const answers = makeAnswers({ speakers: 2 });
      const trace = calculateV2(answers);
      expect(trace.inferredProducts).toContain("Speaker & Abstract Management");
    });

    it("should infer Appointment Scheduling when appointments=Yes", () => {
      const answers = makeAnswers({ appointments: 3 });
      const trace = calculateV2(answers);
      expect(trace.inferredProducts).toContain("Appointment Scheduling");
    });

    it("should always include Registration & Event Website", () => {
      const answers = makeAnswers({});
      const trace = calculateV2(answers);
      expect(trace.inferredProducts).toContain("Registration & Event Website");
    });
  });

  // Scenario L: Floor rule condition met but no effective upgrade
  describe("Scenario L — Floor rule met but not effective", () => {
    it("should log evaluated-no-effect when floor ≤ current tier", () => {
      // branding=3 → floor Medium, but aggregate puts us at Advanced already
      const answers = makeAnswers({
        event_length: 3,       // 3
        sessions: 3,           // 3
        reg_paths: 3,          // 3
        contact_types: 2,      // 2
        reg_rules: 2,          // 2
        payment_complexity: 2, // 2
        hotel: 2,              // 2
        pages: 3,              // 3
        branding: 3,           // 3 → floor: Medium (but tier already ≥ Medium)
        integrations: 2,       // 2
        custom_functionality: 2, // 2
        // = 3+3+3+2+2+2+0+2+0+2+0+0+3+3+2+0 = 27 → Advanced
      });
      const trace = calculateV2(answers);
      expect(trace.baseTier).toBe("Advanced");
      expect(trace.evaluatedNoEffectTierRules).toContain("Custom branding → Medium");
      expect(trace.effectiveTierOverrides).not.toContain("Custom branding → Medium");
    });
  });

  // Scenario M: All signals maxed
  describe("Scenario M — Maximum complexity", () => {
    it("should score as Complex with maximum signals", () => {
      const answers = makeAnswers({
        event_length: 4,
        sessions: 4,
        reg_paths: 4,
        contact_types: 4,
        reg_rules: 4,
        payment_complexity: 2,
        advanced_reg: 3,
        hotel: 4,
        languages: 4,
        integrations: 4,
        speakers: 2,
        appointments: 3,
        pages: 4,
        branding: 4,
        custom_functionality: 3,
        reporting: 4,
      });
      // = 4+4+4+4+4+2+3+4+4+4+2+3+4+4+3+4 = 57
      const trace = calculateV2(answers);
      expect(trace.aggregateScore).toBe(57);
      expect(trace.finalTier).toBe("Complex");
      expect(trace.result.price).toBe("$4,999");
      expect(trace.creative_max_signal).toBe(4);
      expect(trace.registration_max_signal).toBe(4);
      expect(trace.logistics_max_signal).toBe(4);
      expect(trace.noncreative_max_signal).toBe(4);
      expect(trace.internalReferenceHours).toBe(50);
      expect(trace.creative_hour_reference).toBe("16–20 hours");
      expect(trace.noncreative_hour_reference).toBe("30–34 hours");
    });
  });

  // Additional edge cases
  describe("Edge cases", () => {
    it("should handle empty answers (all zeros/defaults)", () => {
      const trace = calculateV2({});
      expect(trace.aggregateScore).toBe(0);
      expect(trace.finalTier).toBe("Simple");
    });

    it("should not change tier based on product selection", () => {
      const answers = makeAnswers({ event_length: 2, sessions: 2 });
      const trace1 = calculateV2(answers);
      const trace2 = calculateV2(answers, {
        selectedProducts: ["Registration & Event Website", "Appointment Scheduling", "Speaker & Abstract Management", "Event App"],
        eventAppSelected: true,
        eventAppFeatures: ["Agenda", "Attendee networking", "Push notifications", "Gamification", "Exhibitors"],
      });
      expect(trace1.finalTier).toBe(trace2.finalTier);
      expect(trace1.aggregateScore).toBe(trace2.aggregateScore);
    });
  });
});
