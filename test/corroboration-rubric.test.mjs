import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  ADDED_CLAIM_PATTERNS,
  PLAN_CLAIM_PATTERNS,
  claimSentences,
  claimWordsIn,
  classify,
  sentenceForm
} from "../eval/qa/corroboration-rubric.mjs";

const { cases } = JSON.parse(readFileSync(new URL("./fixtures/corroboration-cases.json", import.meta.url), "utf8"));

describe("the eight cases the guard and the read must catch and the one they must not", () => {
  it("has eight catches and one pass", () => {
    expect(cases.filter((c) => c.violation)).toHaveLength(8);
    expect(cases.filter((c) => !c.violation)).toHaveLength(1);
  });

  for (const c of cases) {
    it(`case ${c.id}: ${c.case}`, () => {
      expect(claimSentences(c.sentence), "the pre-screen picks the sentence to read").toEqual([c.sentence]);
      expect(sentenceForm(c.sentence)).toBe(c.form);
      const result = classify({ support: c.support, form: c.form });
      expect(result.violation).toBe(c.violation);
      expect(result.unreturnedAttribution).toBe(Boolean(c.unreturnedAttribution));
    });
  }
});

describe("classify", () => {
  it("counts a bare statement of support class 3, 4 or 5, and keeps class 3 in its own column", () => {
    const bare = (support) => classify({ support, form: "bare" });
    expect(bare(1)).toEqual({ violation: false, partySelf: false, unreturnedAttribution: false });
    expect(bare(2)).toEqual({ violation: false, partySelf: false, unreturnedAttribution: false });
    expect(bare(3)).toEqual({ violation: true, partySelf: true, unreturnedAttribution: false });
    expect(bare(4)).toEqual({ violation: true, partySelf: false, unreturnedAttribution: false });
    expect(bare(5)).toEqual({ violation: true, partySelf: false, unreturnedAttribution: false });
    expect(classify({ support: 4, form: "hedged" }).violation).toBe(false);
  });

  it("counts a source no result returned as an unreturned attribution, in its own column", () => {
    expect(classify({ support: 5, form: "attributed" })).toEqual({
      violation: true,
      partySelf: false,
      unreturnedAttribution: true
    });
    expect(classify({ support: 5, form: "hedged", namedSource: true })).toEqual({
      violation: true,
      partySelf: false,
      unreturnedAttribution: true
    });
  });

  it("does not count a hedge that names no source, or an attribution to a returned or candidate source", () => {
    // "The index has no audit evidence": a source-scoped absence statement about a source that was searched.
    expect(classify({ support: 5, form: "hedged" }).violation).toBe(false);
    expect(classify({ support: 5, form: "hedged", namedSource: false }).unreturnedAttribution).toBe(false);
    for (const support of [1, 2, 3, 4]) {
      expect(classify({ support, form: "attributed" }).violation, `class ${support}`).toBe(false);
      expect(classify({ support, form: "hedged", namedSource: true }).violation, `class ${support}`).toBe(false);
    }
  });

  it("rejects an unknown class or form", () => {
    expect(() => classify({ support: 6, form: "bare" })).toThrow(/support class/);
    expect(() => classify({ support: 3, form: "loud" })).toThrow(/form/);
  });
});

describe("claim words", () => {
  it("matches hack as a whole word, so a hackathon is not a claim", () => {
    expect(claimWordsIn("They won the hackathon.", PLAN_CLAIM_PATTERNS)).toEqual([]);
    expect(claimWordsIn("The bridge was a hack.", PLAN_CLAIM_PATTERNS)).toHaveLength(1);
  });

  it("matches author words but not authorization or authority", () => {
    expect(claimWordsIn("Call require_auth for authorization from the authority.", ADDED_CLAIM_PATTERNS)).toEqual([]);
    expect(claimWordsIn("SEP-1 lists the authors.", ADDED_CLAIM_PATTERNS)).toHaveLength(1);
  });

  it("adds governance status, vulnerability and final-near-an-identifier words", () => {
    for (const text of [
      "The change was approved.",
      "It was accepted.",
      "Protocol 23 was activated.",
      "It was adopted.",
      "SEP-30 is final.",
      "The final status of CAP-46 is clear.",
      "A vulnerability was found.",
      "CVE-2025-0001 applies.",
      "A security review was done.",
      "There is a bug bounty."
    ]) {
      expect(claimWordsIn(text, ADDED_CLAIM_PATTERNS), text).not.toEqual([]);
    }
    expect(claimWordsIn("The final answer is five.", ADDED_CLAIM_PATTERNS)).toEqual([]);
  });
});
