import { describe, expect, it } from "vitest";
import { judgeCasePanel } from "../eval/qa/judge.mjs";
import {
  formatMeasurementMetrics,
  parseMaxPanelCases,
  parseJudgePanel,
  qaMeasurementMetrics
} from "../eval/qa/run-qa.mjs";

function verdict(score, missingFacts = [], costUsd = 0.1) {
  return {
    score,
    coreAnswer: score === "wrong" ? "incorrect" : "correct",
    missingFacts,
    wrongClaims: [],
    avoidMatches: [],
    rationale: score,
    costUsd
  };
}

function queuedJudge(verdicts) {
  let index = 0;
  return async () => verdicts[index++];
}

describe("QA judge panel", () => {
  it("uses the majority score and unions missing facts", async () => {
    const result = await judgeCasePanel(
      {},
      {
        panelSize: 3,
        judge: queuedJudge([
          verdict("partial", ["fact one"]),
          verdict("correct", []),
          verdict("partial", ["fact two"])
        ])
      }
    );

    expect(result.score).toBe("partial");
    expect(result.missingFacts).toEqual(["fact one", "fact two"]);
    expect(result.costUsd).toBeCloseTo(0.3);
    expect(result.meta).toMatchObject({
      panelSize: 3,
      panelDisagreement: true,
      panelTie: false,
      panelScores: ["partial", "correct", "partial"]
    });
  });

  it("resolves a two-call tie to the worse score and records disagreement", async () => {
    const result = await judgeCasePanel(
      {},
      { panelSize: 2, judge: queuedJudge([verdict("correct"), verdict("partial", ["fact"])]) }
    );

    expect(result.score).toBe("partial");
    expect(result.meta).toMatchObject({
      panelDisagreement: true,
      panelTie: true,
      panelScores: ["correct", "partial"]
    });
  });

  it("treats error votes as abstentions when a graded vote remains", async () => {
    const oneGrade = await judgeCasePanel(
      {},
      { panelSize: 2, judge: queuedJudge([verdict("correct"), verdict("error")]) }
    );
    const gradedTie = await judgeCasePanel(
      {},
      {
        panelSize: 3,
        judge: queuedJudge([verdict("error"), verdict("correct"), verdict("partial", ["fact"])])
      }
    );

    expect(oneGrade.score).toBe("correct");
    expect(oneGrade.meta).toMatchObject({
      panelDisagreement: true,
      panelTie: false,
      panelScores: ["correct", "error"]
    });
    expect(gradedTie.score).toBe("partial");
    expect(gradedTie.meta).toMatchObject({
      panelDisagreement: true,
      panelTie: true,
      panelScores: ["error", "correct", "partial"]
    });
  });

  it("keeps the single-call verdict byte-compatible", async () => {
    const single = verdict("correct");
    expect(await judgeCasePanel({}, { judge: queuedJudge([single]) })).toBe(single);
  });
});

describe("QA measurement metrics", () => {
  it("computes ordinal, core-answer, null, and continuous coverage metrics", () => {
    const rows = [
      { id: "a", verdict: { score: "correct", coreAnswer: "correct", missingFacts: [] } },
      { id: "b", verdict: { score: "partial", coreAnswer: "correct", missingFacts: ["one"] } },
      { id: "c", verdict: { score: "error", coreAnswer: null, missingFacts: [] } }
    ];
    const cases = [
      { id: "a", golden: { keyFacts: ["one", "two"] } },
      { id: "b", golden: { keyFacts: ["one", "two"] } },
      { id: "c", golden: { keyFacts: [] } }
    ];

    const metrics = qaMeasurementMetrics(rows, cases);
    expect(metrics).toEqual({
      halfCreditShare: 0.5,
      strictCorrectShare: 1 / 3,
      coreAnswerCorrectShare: 1,
      gradedCoreAnswerNullCount: 0,
      coreAnswerVerdictCount: 2,
      meanContinuousCoverage: 0.75,
      continuousCoverageRowCount: 2
    });
    expect(formatMeasurementMetrics(metrics)).toContain("0 graded null");
  });

  it("guards empty denominators and rejects invalid panel sizes", () => {
    expect(qaMeasurementMetrics([], [])).toMatchObject({
      halfCreditShare: null,
      strictCorrectShare: null,
      coreAnswerCorrectShare: null,
      meanContinuousCoverage: null,
      continuousCoverageRowCount: 0
    });
    expect(parseJudgePanel(undefined)).toBe(1);
    expect(() => parseJudgePanel("1")).toThrow(/2 or 3/);
    expect(() => parseJudgePanel("4")).toThrow(/2 or 3/);
    expect(parseMaxPanelCases(undefined)).toBe(10);
    expect(parseMaxPanelCases("0")).toBe(0);
    expect(() => parseMaxPanelCases("-1")).toThrow(/non-negative integer/);
  });
});
