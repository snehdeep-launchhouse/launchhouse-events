import { describe, expect, it } from "vitest";
import {
  AT_A_GLANCE,
  RED_FLAGS,
  SECTIONS,
  SECTIONS_BY_LETTER,
  TIMING_ROWS,
  type SectionLetter,
} from "./content";

const EXPECTED_LETTERS: SectionLetter[] = [
  "A", "B", "C", "D", "E", "F", "G",
  "H", "I", "J", "K", "L", "M", "N",
];
const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

describe("Pre-Launch Checks content integrity", () => {
  it("contains exactly 14 sections in A–N order", () => {
    expect(SECTIONS).toHaveLength(14);
    expect(SECTIONS.map((s) => s.letter)).toEqual(EXPECTED_LETTERS);
  });

  it("exposes every section through SECTIONS_BY_LETTER", () => {
    for (const letter of EXPECTED_LETTERS) {
      expect(SECTIONS_BY_LETTER[letter]).toBeDefined();
      expect(SECTIONS_BY_LETTER[letter].letter).toBe(letter);
    }
  });

  it("has exactly 8 checks per section and 112 checks total", () => {
    let total = 0;
    for (const section of SECTIONS) {
      expect(section.checks).toHaveLength(8);
      total += section.checks.length;
    }
    expect(total).toBe(112);
  });

  it("gives every section a non-empty title, slug, and section-level why", () => {
    const slugs = new Set<string>();
    for (const section of SECTIONS) {
      expect(section.title.trim().length).toBeGreaterThan(0);
      expect(section.why.trim().length).toBeGreaterThan(0);
      expect(section.slug).toMatch(KEBAB_CASE);
      expect(slugs.has(section.slug)).toBe(false);
      slugs.add(section.slug);
    }
    expect(slugs.size).toBe(14);
  });

  it("gives every check a 1..8 sequence, non-empty title, and non-empty commonIssue", () => {
    for (const section of SECTIONS) {
      section.checks.forEach((check, index) => {
        expect(check.number).toBe(index + 1);
        expect(check.title.trim().length).toBeGreaterThan(0);
        expect(check.commonIssue.trim().length).toBeGreaterThan(0);
        // `why` is optional in the source PDF; when present it must be non-empty.
        if (check.why !== undefined) {
          expect(check.why.trim().length).toBeGreaterThan(0);
        }
      });
    }
  });

  it("preserves the per-check WHYs that the source PDF actually supplies (Section A, checks 1–7)", () => {
    const sectionA = SECTIONS_BY_LETTER.A;
    for (const n of [1, 2, 3, 4, 5, 6, 7]) {
      const check = sectionA.checks.find((c) => c.number === n);
      expect(check?.why?.trim().length ?? 0).toBeGreaterThan(0);
    }
  });

  it("has exactly 6 timing rows", () => {
    expect(TIMING_ROWS).toHaveLength(6);
  });

  it("has exactly 14 at-a-glance rows matching the section letters", () => {
    expect(AT_A_GLANCE).toHaveLength(14);
    expect(AT_A_GLANCE.map((r) => r.letter)).toEqual(EXPECTED_LETTERS);
  });

  it("has exactly 12 red flags numbered 1..12 in order", () => {
    expect(RED_FLAGS).toHaveLength(12);
    expect(RED_FLAGS.map((r) => r.number)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ]);
    for (const flag of RED_FLAGS) {
      expect(flag.text.trim().length).toBeGreaterThan(0);
    }
  });
});
