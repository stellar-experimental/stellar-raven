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
    const sourceDerivedFact = keyFacts.find(
      (fact) =>
        /\bQPP\b/i.test(fact) &&
        /\b(?:does not|has no|there is no)\b/i.test(fact) &&
        /\b(?:specif(?:y|ies)|defin(?:e|es)|establish(?:es)?)\b/i.test(fact) &&
        /\bfinal\b/i.test(fact) &&
        /\bmechanical\b/i.test(fact) &&
        /\bdormant[- ]account\b/i.test(fact) &&
        /\beligibility rule\b/i.test(fact)
    );

    expect(sourceDerivedFact).toBeDefined();
    expect(keyFacts.join("\n")).not.toMatch(/criteria specified by the plan/i);
  });
});
