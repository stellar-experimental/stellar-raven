import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const caseFile = new URL(
  "../eval/qa/corpus/battery/protocol-core/q-pc-quantum-preparedness-dormant.json",
  import.meta.url
);

describe("QPP dormant-account golden", () => {
  it("guards the QPP corpus against dormant-account eligibility-rule regressions", () => {
    const kase = JSON.parse(readFileSync(caseFile, "utf8"));
    const keyFacts = kase.golden.keyFacts;
    const eligibilityFact = keyFacts.find(
      (fact) => /\bdormant[- ]account\b/i.test(fact) && /\beligibility rule\b/i.test(fact)
    );

    expect(eligibilityFact).toBeDefined();

    // The negation must govern the rule clause itself. Reading the whole fact
    // lets an unrelated trailing clause ("...and does not invent thresholds")
    // satisfy the negation while the rule clause asserts the opposite, so only
    // the text ahead of "eligibility rule" counts.
    const ruleClause = eligibilityFact.slice(0, eligibilityFact.search(/\beligibility rule\b/i));

    expect(ruleClause).toMatch(/\bQPP\b/i);
    expect(ruleClause).toMatch(/\b(?:does not|do not|doesn't|no)\b/i);
    expect(ruleClause).toMatch(/\b(?:specif(?:y|ies)|defin(?:e|es)|establish(?:es)?|publish(?:es)?)\b/i);
    expect(ruleClause).toMatch(/\bfinal\b/i);
    expect(ruleClause).toMatch(/\bmechanical\b/i);
    expect(keyFacts.join("\n")).not.toMatch(/criteria specified by the plan/i);
  });
});
