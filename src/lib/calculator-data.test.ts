import { describe, it, expect } from "vitest";
import {
  calculateResultWithTrace,
  getInferredProducts,
  getFilteredCventOptions,
} from "./calculator-data";

// Helper: build minimal answers object with all keys at lowest values
const minimal = (): Record<string, number> => ({
  event_length: 1,
  sessions: 1,
  reg_paths: 1,
  contact_types: 1,
  reg_rules: 0,
  hotel: 0,
  languages: 0,
  integrations: 0,
  speakers: 0,
  appointments: 0,
  pages: 1,
  branding: 1,
});

// Sum of minimal() = 1+1+1+1+0+0+0+0+0+0+1+1 = 6 → Simple

describe("getInferredProducts", () => {
  it("case 8: speakers=YES infers Abstract", () => {
    expect(getInferredProducts({ speakers: 2 })).toContain("Abstract / Call for Speakers");
  });

  it("case 9: appointments=YES infers Appointments", () => {
    expect(getInferredProducts({ appointments: 2 })).toContain("Appointments");
  });

  it("does not infer when speakers=0 and appointments=0", () => {
    expect(getInferredProducts({ speakers: 0, appointments: 0 })).toEqual([]);
  });
});

describe("getFilteredCventOptions", () => {
  it("hides Abstract when speakers inferred", () => {
    const options = getFilteredCventOptions({ speakers: 2 });
    expect(options.find((o) => o.label === "Abstract / Call for Speakers")).toBeUndefined();
  });

  it("hides Appointments when appointments inferred", () => {
    const options = getFilteredCventOptions({ appointments: 2 });
    expect(options.find((o) => o.label === "Appointments")).toBeUndefined();
  });
});

describe("calculateResultWithTrace — 24 scenarios", () => {
  // Case 1: Minimal event → Simple
  it("case 1: minimal event → Simple $899", () => {
    const { result, trace } = calculateResultWithTrace(minimal(), []);
    expect(result.complexity).toBe("Simple");
    expect(result.price).toBe("$899");
    expect(trace.baseScore).toBe(6);
  });

  // Case 2: Simple with Reg only (1 product, low score)
  it("case 2: simple with Reg only → Simple", () => {
    const { result } = calculateResultWithTrace(minimal(), ["Registration & Event Website"]);
    expect(result.complexity).toBe("Simple");
  });

  // Case 3: Attendee Hub alone → min Medium
  it("case 3: Attendee Hub alone → Medium", () => {
    const { result, trace } = calculateResultWithTrace(minimal(), ["Attendee Hub / Event App"]);
    expect(result.complexity).toBe("Medium");
    expect(trace.overridesTriggered).toContainEqual(expect.stringContaining("Attendee Hub"));
  });

  // Case 4: Advanced branding only → min Medium
  it("case 4: advanced branding → Medium", () => {
    const answers = { ...minimal(), branding: 3 };
    const { result, trace } = calculateResultWithTrace(answers, []);
    expect(result.complexity).toBe("Medium");
    expect(trace.overridesTriggered).toContainEqual(expect.stringContaining("branding"));
  });

  // Case 5: 4+ reg paths → min Advanced
  it("case 5: 4+ reg paths → Advanced", () => {
    const answers = { ...minimal(), reg_paths: 3 };
    const { result, trace } = calculateResultWithTrace(answers, []);
    expect(result.complexity).toBe("Advanced");
    expect(trace.overridesTriggered).toContainEqual(expect.stringContaining("reg paths"));
  });

  // Case 6: 2 products selected → min Advanced
  it("case 6: 2 products → Advanced", () => {
    const { result } = calculateResultWithTrace(minimal(), [
      "Registration & Event Website",
      "Attendee Hub / Event App",
    ]);
    expect(result.complexity).toBe("Advanced");
  });

  // Case 7: 3+ products → Complex
  it("case 7: 3 products → Complex", () => {
    const { result } = calculateResultWithTrace(minimal(), [
      "Registration & Event Website",
      "Attendee Hub / Event App",
      "Appointments",
    ]);
    expect(result.complexity).toBe("Complex");
    expect(result.price).toBe("$4,999");
  });

  // Case 10: Inferred (speaker) + selected (Reg) = 2 products → Advanced
  it("case 10: inferred speaker + Reg = 2 products → Advanced", () => {
    const answers = { ...minimal(), speakers: 2 };
    const { result, trace } = calculateResultWithTrace(answers, ["Registration & Event Website"]);
    expect(trace.allProducts).toHaveLength(2);
    expect(result.complexity).toBe("Advanced");
  });

  // Case 11: Inferred (speaker + appointments) + Reg = 3 → Complex
  it("case 11: inferred speaker + appointments + Reg = 3 → Complex", () => {
    const answers = { ...minimal(), speakers: 2, appointments: 2 };
    const { result, trace } = calculateResultWithTrace(answers, ["Registration & Event Website"]);
    expect(trace.allProducts).toHaveLength(3);
    expect(result.complexity).toBe("Complex");
  });

  // Case 12: Hub + inferred speaker = 2 products → Advanced
  it("case 12: Hub + inferred speaker = 2 → Advanced", () => {
    const answers = { ...minimal(), speakers: 2 };
    const { result, trace } = calculateResultWithTrace(answers, ["Attendee Hub / Event App"]);
    expect(trace.allProducts).toHaveLength(2);
    expect(result.complexity).toBe("Advanced");
  });

  // Case 13: High base score alone → Complex
  it("case 13: high base score → Complex", () => {
    const answers: Record<string, number> = {
      event_length: 4,
      sessions: 3,
      reg_paths: 3,
      contact_types: 3,
      reg_rules: 3,
      hotel: 2,
      languages: 2,
      integrations: 3,
      speakers: 2,
      appointments: 2,
      pages: 3,
      branding: 3,
    };
    // sum = 4+3+3+3+3+2+2+3+2+2+3+3 = 33
    const { result, trace } = calculateResultWithTrace(answers, []);
    expect(trace.baseScore).toBe(33);
    expect(result.complexity).toBe("Complex");
  });

  // Case 14: Medium base score (~15)
  it("case 14: medium base score ~15 → Medium", () => {
    // Need sum=15: 2+2+2+2+1+0+0+0+2+2+1+1=15
    const answers: Record<string, number> = {
      event_length: 2, sessions: 2, reg_paths: 2, contact_types: 2,
      reg_rules: 1, hotel: 0, languages: 0, integrations: 0,
      speakers: 2, appointments: 2, pages: 1, branding: 1,
    };
    const { result, trace } = calculateResultWithTrace(answers, []);
    expect(trace.baseScore).toBe(15);
    expect(trace.baseTier).toBe("Medium");
    // But speakers=2 and appointments=2 infer 2 products → Advanced override
    expect(trace.inferredProducts).toHaveLength(2);
    expect(result.complexity).toBe("Advanced");
  });

  // Case 15: Advanced base score ~22, no products
  it("case 15: advanced base score ~22 → Advanced", () => {
    // sum=22: 3+3+2+2+3+2+2+3+0+0+1+1=22
    const answers: Record<string, number> = {
      event_length: 3, sessions: 3, reg_paths: 2, contact_types: 2,
      reg_rules: 3, hotel: 2, languages: 2, integrations: 3,
      speakers: 0, appointments: 0, pages: 1, branding: 1,
    };
    const { result, trace } = calculateResultWithTrace(answers, []);
    expect(trace.baseScore).toBe(22);
    expect(result.complexity).toBe("Advanced");
  });

  // Case 16: Branding override doesn't downgrade high tier
  it("case 16: branding override doesn't downgrade Complex", () => {
    const answers: Record<string, number> = {
      event_length: 4, sessions: 3, reg_paths: 3, contact_types: 3,
      reg_rules: 3, hotel: 2, languages: 2, integrations: 3,
      speakers: 0, appointments: 0, pages: 3, branding: 3,
    };
    // sum=29 → Complex from base
    const { result } = calculateResultWithTrace(answers, []);
    expect(result.complexity).toBe("Complex");
  });

  // Case 17: Reg paths override doesn't downgrade Complex
  it("case 17: reg paths override doesn't downgrade Complex", () => {
    const answers: Record<string, number> = {
      event_length: 4, sessions: 3, reg_paths: 3, contact_types: 3,
      reg_rules: 3, hotel: 2, languages: 2, integrations: 3,
      speakers: 0, appointments: 0, pages: 3, branding: 1,
    };
    // sum=27 → Complex
    const { result } = calculateResultWithTrace(answers, []);
    expect(result.complexity).toBe("Complex");
  });

  // Case 18: "Not sure" product not counted
  it('case 18: "Not sure" product not counted', () => {
    const { result, trace } = calculateResultWithTrace(minimal(), [
      "Not sure / Need help deciding",
    ]);
    expect(trace.allProducts).toHaveLength(0);
    expect(result.complexity).toBe("Simple");
  });

  // Case 19: All overrides stacked
  it("case 19: all overrides stacked → Complex", () => {
    const answers = { ...minimal(), reg_paths: 3, branding: 3 };
    const { result } = calculateResultWithTrace(answers, [
      "Registration & Event Website",
      "Attendee Hub / Event App",
      "Appointments",
    ]);
    expect(result.complexity).toBe("Complex");
  });

  // Edge cases: exact boundary scores
  it("case 20: score exactly 12 → Simple", () => {
    // sum=12: 2+2+1+1+0+2+2+0+0+0+1+1=12
    const answers: Record<string, number> = {
      event_length: 2, sessions: 2, reg_paths: 1, contact_types: 1,
      reg_rules: 0, hotel: 2, languages: 2, integrations: 0,
      speakers: 0, appointments: 0, pages: 1, branding: 1,
    };
    const { trace } = calculateResultWithTrace(answers, []);
    expect(trace.baseScore).toBe(12);
    expect(trace.baseTier).toBe("Simple");
  });

  it("case 21: score exactly 13 → Medium", () => {
    // sum=13: 3+2+1+1+0+2+2+0+0+0+1+1=13
    const answers: Record<string, number> = {
      event_length: 3, sessions: 2, reg_paths: 1, contact_types: 1,
      reg_rules: 0, hotel: 2, languages: 2, integrations: 0,
      speakers: 0, appointments: 0, pages: 1, branding: 1,
    };
    const { trace } = calculateResultWithTrace(answers, []);
    expect(trace.baseScore).toBe(13);
    expect(trace.baseTier).toBe("Medium");
  });

  it("case 22: score exactly 18 → Medium", () => {
    // sum=18: 3+2+2+2+1+2+2+0+0+0+2+2 wait... let me recalc
    // 3+3+1+1+0+2+2+3+0+0+2+1=18
    const answers: Record<string, number> = {
      event_length: 3, sessions: 3, reg_paths: 1, contact_types: 1,
      reg_rules: 0, hotel: 2, languages: 2, integrations: 3,
      speakers: 0, appointments: 0, pages: 2, branding: 1,
    };
    const { trace } = calculateResultWithTrace(answers, []);
    expect(trace.baseScore).toBe(18);
    expect(trace.baseTier).toBe("Medium");
  });

  it("case 23: score exactly 25 → Advanced", () => {
    // sum=25: 4+3+2+2+3+2+2+3+0+0+3+1=25
    const answers: Record<string, number> = {
      event_length: 4, sessions: 3, reg_paths: 2, contact_types: 2,
      reg_rules: 3, hotel: 2, languages: 2, integrations: 3,
      speakers: 0, appointments: 0, pages: 3, branding: 1,
    };
    const { trace } = calculateResultWithTrace(answers, []);
    expect(trace.baseScore).toBe(25);
    expect(trace.baseTier).toBe("Advanced");
  });

  it("case 24: score 26 → Complex", () => {
    // sum=26: 4+3+2+2+3+2+2+3+0+0+3+2 wait = 26? 4+3=7+2=9+2=11+3=14+2=16+2=18+3=21+0+0+3=24+2=26 ✓
    // branding=2 is not a valid option (1 or 3). Use branding=3 → sum=27
    // Instead: 4+3+2+3+3+2+2+3+0+0+1+3=26
    const answers: Record<string, number> = {
      event_length: 4, sessions: 3, reg_paths: 2, contact_types: 3,
      reg_rules: 3, hotel: 2, languages: 2, integrations: 3,
      speakers: 0, appointments: 0, pages: 1, branding: 3,
    };
    const { trace } = calculateResultWithTrace(answers, []);
    expect(trace.baseScore).toBe(26);
    expect(trace.baseTier).toBe("Complex");
  });

  // Additional: result properties are correct for each tier
  it("returns correct SLA for each tier", () => {
    const simple = calculateResultWithTrace(minimal(), []).result;
    expect(simple.firstDraft).toBe("2 Business Days");
    expect(simple.revisionTurnaround).toBe("1 Business Day");

    const medium = calculateResultWithTrace(minimal(), ["Attendee Hub / Event App"]).result;
    expect(medium.firstDraft).toBe("2 Business Days");
    expect(medium.revisionTurnaround).toBe("2 Business Days");
  });

  // Dedup: inferred + same selected should not double count
  it("deduplicates inferred and selected products", () => {
    const answers = { ...minimal(), speakers: 2 };
    const { trace } = calculateResultWithTrace(answers, ["Abstract / Call for Speakers"]);
    // Should only appear once
    const count = trace.allProducts.filter((p) => p === "Abstract / Call for Speakers").length;
    expect(count).toBe(1);
    expect(trace.allProducts).toHaveLength(1);
  });
});
