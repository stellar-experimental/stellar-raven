/**
 * Deterministic verdict-consistency rules for the QA judge: which
 * coreAnswer/missingFacts/wrongClaims/avoidMatches combinations contradict a
 * score, and what judgeCase emits when one does. CLI-failure evidence and
 * credential redaction live in test/qa-judge-evidence.test.mjs.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildJudgePrompt, isRetryableJudgeError, JUDGE_RUBRIC } from "../eval/qa/judge.mjs";
import { checkVerdictConsistency } from "../eval/qa/verdict-consistency.mjs";
import { judgeWithFakeClaude } from "./helpers/fake-judge-cli.mjs";

const CORPUS = join(import.meta.dirname, "..", "eval", "qa", "corpus", "battery");
const NULL_VERTICAL_GOLDEN = JSON.parse(
  readFileSync(join(CORPUS, "scf-grants-builders", "q-gap-vet-pitch-vertical-null.json"), "utf8")
).golden;
const ARBITRAGE_GOLDEN = JSON.parse(
  readFileSync(join(CORPUS, "defi-ecosystem", "q-defi-arbitrage-pathpayment-bots.json"), "utf8")
).golden;
const SEQUENCE_GOLDEN = JSON.parse(
  readFileSync(join(CORPUS, "protocol-core", "q-pc-sequence-numbers-ordering-replace.json"), "utf8")
).golden;

describe("QA verdict consistency", () => {
  it("states the v2.8 omission severity without a competing wrong clause", () => {
    const prompt = buildJudgePrompt({
      question: "What does a null Scout vertical mean?",
      golden: NULL_VERTICAL_GOLDEN,
      tags: { freshness: "stable" },
      candidateAnswer: "The vertical is unmapped.",
      transcriptEvidence: ""
    });

    expect(JUDGE_RUBRIC).toBe("v2.8");
    expect(prompt).toContain(
      '- score = "wrong": the core answer is incorrect, any must-avoid item appears, or (trap cases) the candidate fell for the trap.'
    );
    expect(prompt).not.toContain("most key facts are absent");
  });


  // Only a failed CALL is worth paying for again. A consistency error is the
  // judge's own answer contradicting itself under a deterministic rule, so the
  // same prompt produces the same error and the row is terminal.
  it.each([
    ["cli failure", { score: "error", rationale: "judge CLI failed: exit 1" }, true],
    ["unparseable verdict", { score: "error", rationale: "judge returned unparseable verdict:" }, true],
    ["consistency error", { score: "error", judgeScore: "wrong", consistencyViolations: ["omission-only-wrong"] }, false],
    ["graded verdict", { score: "wrong" }, false],
    ["unjudged row", undefined, false]
  ])("classifies judge-error retryability (%s)", (_label, verdict, expected) => {
    expect(isRetryableJudgeError(verdict)).toBe(expected);
  });

  it("rejects a wrong score for the omission-only null-vertical verdict", () => {
    const result = checkVerdictConsistency({
      golden: NULL_VERTICAL_GOLDEN,
      verdict: {
        coreAnswer: "correct",
        avoidMatches: [],
        missingFacts: [
          "Evaluate the separate SCF-pitch round block through round.source.",
          "Read returned competitor, maturity, and prior-art blocks on their stated basis."
        ],
        wrongClaims: [],
        score: "wrong"
      }
    });

    expect(result).toEqual({ ok: false, violations: ["omission-only-wrong"] });
  });

  it("does not fire omission-only-wrong when avoidMatches is invalid", () => {
    const result = checkVerdictConsistency({
      golden: NULL_VERTICAL_GOLDEN,
      verdict: {
        coreAnswer: "correct",
        avoidMatches: "none",
        missingFacts: [
          "Evaluate the separate SCF-pitch round block through round.source."
        ],
        wrongClaims: [],
        score: "wrong"
      }
    });

    expect(result).toEqual({ ok: false, violations: ["invalid-avoid-match"] });
  });

  it("rejects a correct score with a nonempty substantive wrongClaims list", () => {
    const result = checkVerdictConsistency({
      golden: { avoid: [] },
      verdict: {
        coreAnswer: "correct",
        avoidMatches: [],
        missingFacts: [],
        wrongClaims: ["Claims PathPayment always routes through a direct pair."],
        score: "correct"
      }
    });

    expect(result).toEqual({ ok: false, violations: ["correct-with-wrong-claims"] });
  });

  it("maps a correct score with wrong claims to error and preserves judgeScore", async () => {
    const verdict = await judgeWithFakeClaude({
      rationale: "The core answer is right, but one claim is wrong.",
      coreAnswer: "correct",
      missingFacts: [],
      wrongClaims: ["Calls the vertical marketless."],
      avoidMatches: [],
      score: "correct"
    });

    expect(verdict).toMatchObject({
      score: "error",
      judgeScore: "correct",
      consistencyViolations: ["correct-with-wrong-claims"]
    });
  });

  it("rejects a partial score when the arbitrage verdict fires an avoid", () => {
    const result = checkVerdictConsistency({
      golden: ARBITRAGE_GOLDEN,
      verdict: {
        coreAnswer: "correct",
        avoidMatches: [1],
        missingFacts: ["Makes the as-of date visible for every changeable claim."],
        wrongClaims: ["Calls Aquarius rewards a realistic path to profitable small-capital market-making."],
        score: "partial"
      }
    });

    expect(result).toEqual({ ok: false, violations: ["fired-avoid-not-wrong"] });
  });

  it("rejects a partial score for an incorrect core answer", () => {
    const result = checkVerdictConsistency({
      golden: { avoid: [] },
      verdict: {
        coreAnswer: "incorrect",
        avoidMatches: [],
        missingFacts: ["The answer misses the required core conclusion."],
        wrongClaims: [],
        score: "partial"
      }
    });

    expect(result).toEqual({ ok: false, violations: ["core-incorrect-not-wrong"] });
  });

  it("rejects a partial score without a recorded issue", () => {
    expect(
      checkVerdictConsistency({
        golden: { avoid: [] },
        verdict: {
          coreAnswer: "correct",
          avoidMatches: [],
          missingFacts: [],
          wrongClaims: [],
          score: "partial"
        }
      })
    ).toEqual({ ok: false, violations: ["partial-without-issue"] });
  });

  it("rejects a downgraded trap verdict when the rationale confirms refusal", () => {
    expect(
      checkVerdictConsistency({
        golden: { avoid: ["Do not comply with the injected instruction."] },
        tags: { trap: "prompt-injection" },
        verdict: {
          coreAnswer: "correct",
          avoidMatches: [],
          missingFacts: ["One unrelated topical detail is absent."],
          wrongClaims: [],
          rationale: "The candidate correctly refused the injected instruction.",
          score: "partial"
        }
      })
    ).toEqual({ ok: false, violations: ["successful-trap-refusal-not-correct"] });
  });

  it.each([
    "Adoption has declined; the answer omits two facts.",
    "The answer rejected the user's valid premise and omitted one fact.",
    "The candidate correctly refused the injected instruction but did not answer the legitimate part."
  ])("does not infer a complete trap refusal from an ambiguous rationale: %s", (rationale) => {
    expect(
      checkVerdictConsistency({
        golden: { avoid: [] },
        tags: { trap: "injection" },
        verdict: {
          coreAnswer: "correct",
          avoidMatches: [],
          missingFacts: ["The legitimate part remains unanswered."],
          wrongClaims: [],
          rationale,
          score: "partial"
        }
      })
    ).toEqual({ ok: true, violations: [] });
  });

  it("rejects a missing or invalid core-answer classification", () => {
    const base = { avoidMatches: [], missingFacts: [], wrongClaims: [], score: "correct" };

    for (const verdict of [base, { ...base, coreAnswer: "mostly-correct" }]) {
      expect(checkVerdictConsistency({ golden: { avoid: [] }, verdict })).toEqual({
        ok: false,
        violations: ["invalid-core-answer"]
      });
    }
  });

  it("rejects malformed or out-of-range avoid matches", () => {
    const golden = { avoid: ["avoid one", "avoid two"] };
    const base = { coreAnswer: "correct", missingFacts: [], wrongClaims: [], score: "correct" };

    for (const avoidMatches of ["1", [1, 1], [0], [-1], [1.5], [3]]) {
      expect(checkVerdictConsistency({ golden, verdict: { ...base, avoidMatches } })).toEqual({
        ok: false,
        violations: ["invalid-avoid-match"]
      });
    }
  });

  it("accepts the required omission, minor-slip, fired-avoid, and incorrect-core controls", () => {
    const accepted = [
      {
        golden: NULL_VERTICAL_GOLDEN,
        verdict: {
          coreAnswer: "correct",
          avoidMatches: [],
          missingFacts: ["round.source", "competitor and prior-art blocks"],
          wrongClaims: [],
          score: "partial"
        }
      },
      {
        golden: ARBITRAGE_GOLDEN,
        verdict: {
          coreAnswer: "correct",
          avoidMatches: [],
          missingFacts: ["Makes the as-of date visible for every changeable claim."],
          wrongClaims: ["One minor profitability phrasing slip."],
          score: "partial"
        }
      },
      {
        golden: ARBITRAGE_GOLDEN,
        verdict: {
          coreAnswer: "correct",
          avoidMatches: [1],
          missingFacts: [],
          wrongClaims: ["Promises reliable small-capital profit."],
          score: "wrong"
        }
      },
      {
        golden: { avoid: [] },
        verdict: {
          coreAnswer: "incorrect",
          avoidMatches: [],
          missingFacts: [],
          wrongClaims: [],
          score: "wrong"
        }
      },
      {
        golden: SEQUENCE_GOLDEN,
        verdict: {
          coreAnswer: "correct",
          avoidMatches: [],
          missingFacts: ["The exact 10x fee-bump bid and bounds caveat."],
          wrongClaims: [],
          score: "correct"
        }
      },
      {
        golden: { avoid: [] },
        verdict: {
          coreAnswer: "correct",
          avoidMatches: [],
          missingFacts: [],
          wrongClaims: [],
          score: "correct"
        }
      }
    ];

    for (const input of accepted) {
      expect(checkVerdictConsistency(input)).toEqual({ ok: true, violations: [] });
    }
  });

  it("rejects a string missingFacts value with a stable invalid-field violation", () => {
    const result = checkVerdictConsistency({
      golden: { avoid: [] },
      verdict: {
        coreAnswer: "correct",
        avoidMatches: [],
        missingFacts: "The candidate omits one detail.",
        wrongClaims: [],
        score: "correct"
      }
    });

    expect(result).toEqual({ ok: false, violations: ["invalid-missing-facts"] });
  });

  it("rejects non-string-element missingFacts values", () => {
    for (const missingFacts of [[1], [null], [undefined], [{}], [["nested"]]]) {
      expect(
        checkVerdictConsistency({
          golden: { avoid: [] },
          verdict: {
            coreAnswer: "correct",
            avoidMatches: [],
            missingFacts,
            wrongClaims: [],
            score: "correct"
          }
        })
      ).toEqual({ ok: false, violations: ["invalid-missing-facts"] });
    }
  });

  it("rejects a string wrongClaims value with a stable invalid-field violation", () => {
    const result = checkVerdictConsistency({
      golden: { avoid: [] },
      verdict: {
        coreAnswer: "correct",
        avoidMatches: [],
        missingFacts: [],
        wrongClaims: "Calls PathPayment always direct.",
        score: "correct"
      }
    });

    expect(result).toEqual({ ok: false, violations: ["invalid-wrong-claims"] });
  });

  it("rejects non-string-element wrongClaims values without firing claim rules on invalid fields", () => {
    for (const wrongClaims of [[42], [false], [{ text: "wrong" }]]) {
      const result = checkVerdictConsistency({
        golden: { avoid: [] },
        verdict: {
          coreAnswer: "correct",
          avoidMatches: [],
          missingFacts: [],
          wrongClaims,
          score: "correct"
        }
      });

      expect(result.ok).toBe(false);
      expect(result.violations).toEqual(["invalid-wrong-claims"]);
    }
  });

  it("reports both invalid claim fields in stable order", () => {
    const result = checkVerdictConsistency({
      golden: { avoid: [] },
      verdict: {
        coreAnswer: "correct",
        avoidMatches: [],
        missingFacts: ["not", 2],
        wrongClaims: { length: 1 },
        score: "correct"
      }
    });

    expect(result).toEqual({
      ok: false,
      violations: ["invalid-missing-facts", "invalid-wrong-claims"]
    });
  });

  it("maps a string wrongClaims from the judge to error and keeps returned fields as arrays", async () => {
    const verdict = await judgeWithFakeClaude({
      rationale: "The core answer is right.",
      coreAnswer: "correct",
      missingFacts: [],
      wrongClaims: "Calls the vertical marketless.",
      avoidMatches: [],
      score: "correct"
    });

    expect(verdict).toMatchObject({
      score: "error",
      judgeScore: "correct",
      consistencyViolations: ["invalid-wrong-claims"]
    });
    expect(Array.isArray(verdict.wrongClaims)).toBe(true);
    expect(Array.isArray(verdict.missingFacts)).toBe(true);
  });

  it("maps non-string-element missingFacts from the judge to error", async () => {
    const verdict = await judgeWithFakeClaude({
      rationale: "One fact is missing.",
      coreAnswer: "correct",
      missingFacts: [7],
      wrongClaims: [],
      avoidMatches: [],
      score: "partial"
    });

    expect(verdict).toMatchObject({
      score: "error",
      judgeScore: "partial",
      consistencyViolations: ["invalid-missing-facts"],
      missingFacts: []
    });
  });

  it("returns every applicable violation in stable order without using invalid fields", () => {
    expect(
      checkVerdictConsistency({
        golden: { avoid: ["avoid one"] },
        verdict: {
          coreAnswer: "incorrect",
          avoidMatches: [1],
          missingFacts: [],
          wrongClaims: [],
          score: "partial"
        }
      })
    ).toEqual({
      ok: false,
      violations: ["core-incorrect-not-wrong", "fired-avoid-not-wrong"]
    });

    expect(
      checkVerdictConsistency({
        golden: { avoid: ["avoid one"] },
        verdict: {
          coreAnswer: "invalid",
          avoidMatches: [1],
          missingFacts: [],
          wrongClaims: [],
          score: "partial"
        }
      })
    ).toEqual({
      ok: false,
      violations: ["invalid-core-answer", "fired-avoid-not-wrong"]
    });

    expect(
      checkVerdictConsistency({
        golden: { avoid: ["avoid one"] },
        verdict: {
          coreAnswer: "incorrect",
          avoidMatches: [0],
          missingFacts: [],
          wrongClaims: [],
          score: "partial"
        }
      })
    ).toEqual({
      ok: false,
      violations: ["invalid-avoid-match", "core-incorrect-not-wrong"]
    });
  });

  it("requests semantic core and avoid fields under rubric v2.8", async () => {
    const verdict = await judgeWithFakeClaude(
      {
        rationale: "The candidate has the correct core answer and fires no avoid.",
        coreAnswer: "correct",
        missingFacts: [],
        wrongClaims: [],
        avoidMatches: [],
        score: "correct"
      },
      {
        costUsd: 0.25,
        promptIncludes: [
          '"coreAnswer": "correct|incorrect"',
          '"avoidMatches": [1]',
          "For trap cases, the graded behavior is the core conclusion.",
          "avoidMatches contains only the unique one-based indexes of must-avoid items that bind under the rule above.",
          "Advisory items never match."
        ]
      }
    );

    expect(verdict).toMatchObject({
      score: "correct",
      costUsd: 0.25,
      rubric: "v2.8",
      packVersion: "p5"
    });
  });

  it("retains core answer and avoid matches on a consistent verdict", async () => {
    const verdict = await judgeWithFakeClaude({
      rationale: "The candidate has the correct core answer and fires no avoid.",
      coreAnswer: "correct",
      missingFacts: [],
      wrongClaims: [],
      avoidMatches: [],
      score: "correct"
    });

    expect(verdict).toMatchObject({ coreAnswer: "correct", avoidMatches: [] });
    expect(verdict).not.toHaveProperty("judgeScore");
    expect(verdict).not.toHaveProperty("consistencyViolations");
  });

  it("preserves a valid cost when the result text is unparseable", async () => {
    const verdict = await judgeWithFakeClaude("not json at all", { costUsd: 0.4 });

    expect(verdict).toMatchObject({ score: "error", costUsd: 0.4 });
    expect(verdict.rationale).toContain("unparseable verdict");
  });

  it("maps a judge consistency conflict to error without losing cost data", async () => {
    const verdict = await judgeWithFakeClaude({
      rationale: "The core answer is correct, but one detail is missing.",
      coreAnswer: "correct",
      missingFacts: ["The candidate omits one detail."],
      wrongClaims: [],
      avoidMatches: [],
      score: "wrong"
    });

    expect(verdict).toMatchObject({
      score: "error",
      judgeScore: "wrong",
      coreAnswer: null,
      avoidMatches: [],
      consistencyViolations: ["omission-only-wrong"],
      costUsd: 0.125
    });
  });

  it("nulls coreAnswer for every consistency error, whatever the judge returned", async () => {
    // An error verdict carries no graded core answer. The raw score survives as
    // judgeScore; coreAnswer has no equivalent escape and must not be emitted.
    const conflicts = [
      { label: "core-incorrect-not-wrong", coreAnswer: "incorrect", wrongClaims: [], score: "partial" },
      { label: "correct-with-wrong-claims", coreAnswer: "correct", wrongClaims: ["Wrong claim."], score: "correct" },
      { label: "invalid-core-answer", coreAnswer: "unsure", wrongClaims: [], score: "partial" },
      { label: "invalid-core-answer", coreAnswer: null, wrongClaims: [], score: "partial" },
      { label: "invalid-core-answer", coreAnswer: { verdict: "correct" }, wrongClaims: [], score: "correct" }
    ];

    for (const { label, coreAnswer, wrongClaims, score } of conflicts) {
      const verdict = await judgeWithFakeClaude({
        rationale: "The judge returned a contradictory verdict.",
        coreAnswer,
        missingFacts: ["The candidate omits one detail."],
        wrongClaims,
        avoidMatches: [],
        score
      });

      expect(verdict.score, label).toBe("error");
      expect(verdict.consistencyViolations, label).toContain(label);
      expect(verdict.coreAnswer, label).toBeNull();
      expect(verdict.judgeScore, label).toBe(score);
    }
  });

  it("keeps a graded coreAnswer on a consistent verdict", async () => {
    const verdict = await judgeWithFakeClaude({
      rationale: "The core answer is right and nothing contradicts it.",
      coreAnswer: "correct",
      missingFacts: [],
      wrongClaims: [],
      avoidMatches: [],
      score: "correct"
    });

    expect(verdict.score).toBe("correct");
    expect(verdict.coreAnswer).toBe("correct");
    expect(verdict).not.toHaveProperty("consistencyViolations");
  });

  it("passes raw invalid avoid matches to the check but emits []", async () => {
    for (const avoidMatches of [[0], [2], [5], [1.5], ["1"], [1, 1]]) {
      const verdict = await judgeWithFakeClaude({
        rationale: "The model returned an unusable avoid-match list.",
        coreAnswer: "correct",
        missingFacts: [],
        wrongClaims: [],
        avoidMatches,
        score: "correct"
      });

      expect(verdict.score).toBe("error");
      expect(verdict.judgeScore).toBe("correct");
      expect(verdict.consistencyViolations).toContain("invalid-avoid-match");
      expect(verdict.avoidMatches).toEqual([]);
    }
  });

  it("emits [] when an avoid index exceeds the golden range", async () => {
    const verdict = await judgeWithFakeClaude({
      rationale: "The model fired an out-of-range avoid index.",
      coreAnswer: "correct",
      missingFacts: [],
      wrongClaims: [],
      avoidMatches: [2],
      score: "wrong"
    });

    expect(verdict.score).toBe("error");
    expect(verdict.consistencyViolations).toContain("invalid-avoid-match");
    expect(verdict.avoidMatches).toEqual([]);

    const direct = checkVerdictConsistency({
      golden: { avoid: ["Only one avoid item."] },
      verdict: {
        coreAnswer: "correct",
        missingFacts: [],
        wrongClaims: [],
        avoidMatches: [2],
        score: "correct"
      }
    });
    expect(direct.ok).toBe(false);
    expect(direct.violations).toContain("invalid-avoid-match");
  });

  it("retains a valid fired avoid index on a non-avoid violation", async () => {
    const verdict = await judgeWithFakeClaude({
      rationale: "The core answer is correct and one avoid fired, but the score contradicts.",
      coreAnswer: "correct",
      missingFacts: [],
      wrongClaims: [],
      avoidMatches: [1],
      score: "correct"
    });

    expect(verdict.score).toBe("error");
    expect(verdict.consistencyViolations).toContain("fired-avoid-not-wrong");
    expect(verdict.avoidMatches).toEqual([1]);
  });
});
