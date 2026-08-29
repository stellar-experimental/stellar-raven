import { describe, expect, it } from "vitest";
import { judgeCasePanel } from "../eval/qa/judge.mjs";
import {
  formatPanelSummary,
  formatMeasurementMetrics,
  judgeTieringMetadata,
  panelCaseCounts,
  parseMaxPanelCases,
  parsePanelCaseOverride,
  parseJudgePanel,
  qaMeasurementMetrics,
  resolvePanelCaseLimit
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
    expect(parseMaxPanelCases(undefined)).toBeNull();
    expect(parseMaxPanelCases("0")).toBe(0);
    expect(parseMaxPanelCases("10")).toBe(10);
    expect(parseMaxPanelCases(" 10 ")).toBe(10);
    for (const invalid of ["", " ", "-1", "+1", "0x10", "1e1", "1.0"]) {
      expect(() => parseMaxPanelCases(invalid)).toThrow(/only decimal digits/);
    }
  });

  it("parses the CLI override before the environment override", () => {
    expect(parsePanelCaseOverride({ cliValue: " 10 ", environmentValue: "7" })).toEqual({
      maxPanelCases: 10,
      maxPanelCasesSource: "cli-override"
    });
    expect(parsePanelCaseOverride({ environmentValue: "0" })).toEqual({
      maxPanelCases: 0,
      maxPanelCasesSource: "environment-override"
    });
    expect(parsePanelCaseOverride({})).toEqual({
      maxPanelCases: null,
      maxPanelCasesSource: "bounded-scaled-default"
    });
    expect(() => parsePanelCaseOverride({ cliPresent: true })).toThrow(/requires decimal digits/);
    expect(() => parsePanelCaseOverride({ environmentValue: " " })).toThrow(/decimal digits/);
  });
});

describe("QA denominator-scaled panel limit", () => {
  it.each([
    [0, 10],
    [1, 10],
    [2, 10],
    [15, 10],
    [30, 10]
  ])("keeps the frozen small denominator %i at %i", (selectedCaseCount, maxPanelCases) => {
    expect(resolvePanelCaseLimit(selectedCaseCount)).toEqual({
      selectedCaseCount,
      maxPanelCases,
      maxPanelCasesSource: "bounded-scaled-default"
    });
  });

  it("preserves the 10-panel default for a 30-case denominator", () => {
    expect(resolvePanelCaseLimit(30)).toMatchObject({ maxPanelCases: 10 });
  });

  it("raises the default to 34 for a 100-case denominator", () => {
    expect(resolvePanelCaseLimit(100)).toMatchObject({ maxPanelCases: 34 });
  });

  it.each([
    [31, 11],
    [99, 33],
    [499, 34],
    [500, 34]
  ])("interpolates and caps denominator %i at %i", (selectedCaseCount, maxPanelCases) => {
    expect(resolvePanelCaseLimit(selectedCaseCount)).toMatchObject({ maxPanelCases });
  });

  it("uses an explicit override without scaling it", () => {
    expect(resolvePanelCaseLimit(100, parseMaxPanelCases("10"), "cli-override")).toEqual({
      selectedCaseCount: 100,
      maxPanelCases: 10,
      maxPanelCasesSource: "cli-override"
    });
    expect(resolvePanelCaseLimit(30, parseMaxPanelCases("0"), "environment-override")).toEqual({
      selectedCaseCount: 30,
      maxPanelCases: 0,
      maxPanelCasesSource: "environment-override"
    });
  });

  it("stamps eligible, used, and skipped counts and formats the summary", () => {
    const rows = [
      {
        verdict: {
          meta: { judgeTierUsed: "panel", escalationReason: "boundary-partial" }
        }
      },
      {
        verdict: {
          meta: {
            judgeTierUsed: "single",
            escalationReason: "boundary-wrong-claim",
            panelEscalationSkipped: "max-panel-cases"
          }
        }
      },
      {
        verdict: {
          meta: { judgeTierUsed: "panel", escalationReason: "unstable-register" }
        }
      },
      { verdict: { meta: { judgeTierUsed: "single", escalationReason: null } } }
    ];
    expect(panelCaseCounts(rows)).toEqual({
      boundaryEligibleCases: 2,
      panelUsedCases: 2,
      panelSkippedCases: 1,
      boundaryPanelCases: 1
    });

    const artifactFields = judgeTieringMetadata({
      judgePanel: 1,
      stabilityRegister: { status: "absent", cases: {} },
      panelLimit: resolvePanelCaseLimit(100),
      rows
    });
    expect(artifactFields).toMatchObject({
      selectedCaseCount: 100,
      maxPanelCases: 34,
      maxPanelCasesSource: "bounded-scaled-default",
      defaultPanelPolicy: {
        kind: "clamped-one-third",
        numerator: 1,
        denominator: 3,
        rounding: "ceil",
        floor: 10,
        ceiling: 34
      },
      boundaryEligibleCases: 2,
      panelUsedCases: 2,
      panelSkippedCases: 1,
      boundaryPanelCases: 1
    });
    expect(formatPanelSummary(artifactFields, "after")).toBe(
      "judge panels after: cap 34 · source bounded-scaled-default · selected 100 · " +
      "boundary-eligible 2 · used 2 · skipped 1"
    );
  });
});
