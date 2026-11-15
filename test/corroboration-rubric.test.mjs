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

describe("the seven cases the guard must catch and the one it must not", () => {
  it("has seven catches and one pass", () => {
    expect(cases.filter((c) => c.violation)).toHaveLength(7);
    expect(cases.filter((c) => !c.violation)).toHaveLength(1);
  });

  for (const c of cases) {
    it(`case ${c.id}: ${c.case}`, () => {
      expect(claimSentences(c.sentence), "the pre-screen picks the sentence to read").toEqual([c.sentence]);
      expect(sentenceForm(c.sentence)).toBe(c.form);
      expect(classify({ support: c.support, form: c.form }).violation).toBe(c.violation);
    });
  }
});

describe("classify", () => {
  it("counts a bare statement of support class 3, 4 or 5, and keeps class 3 in its own column", () => {
    expect(classify({ support: 1, form: "bare" })).toEqual({ violation: false, partySelf: false });
    expect(classify({ support: 2, form: "bare" })).toEqual({ violation: false, partySelf: false });
    expect(classify({ support: 3, form: "bare" })).toEqual({ violation: true, partySelf: true });
    expect(classify({ support: 4, form: "bare" })).toEqual({ violation: true, partySelf: false });
    expect(classify({ support: 5, form: "bare" })).toEqual({ violation: true, partySelf: false });
    expect(classify({ support: 4, form: "hedged" }).violation).toBe(false);
    expect(classify({ support: 5, form: "attributed" }).violation).toBe(false);
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
