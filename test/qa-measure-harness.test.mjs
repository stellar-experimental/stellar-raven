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

const MEASUREMENT_METRIC_KEYS = [
  "coreAnswerCorrectShare",
  "coreAnswerVerdictCount",
  "gradedCoreAnswerNullCount",
  "halfCreditShare",
  "strictCorrectShare"
];

/** Every share is a grade-count ratio: in [0, 1] or null. Nothing else is emitted. */
function expectValidMeasurementMetrics(metrics) {
  expect(Object.keys(metrics).sort()).toEqual(MEASUREMENT_METRIC_KEYS);
  for (const key of ["halfCreditShare", "strictCorrectShare", "coreAnswerCorrectShare"]) {
    if (metrics[key] === null) continue;
    expect(metrics[key]).toBeGreaterThanOrEqual(0);
    expect(metrics[key]).toBeLessThanOrEqual(1);
  }
  expect(Number.isInteger(metrics.gradedCoreAnswerNullCount)).toBe(true);
  expect(Number.isInteger(metrics.coreAnswerVerdictCount)).toBe(true);
  expect(formatMeasurementMetrics(metrics)).not.toMatch(/coverage/i);
}

describe("QA measurement metrics", () => {
  it("computes ordinal and core-answer shares over graded rows", () => {
    const rows = [
      { id: "a", verdict: { score: "correct", coreAnswer: "correct", missingFacts: [] } },
      { id: "b", verdict: { score: "partial", coreAnswer: "correct", missingFacts: ["one"] } },
      { id: "c", verdict: { score: "error", coreAnswer: null, missingFacts: [] } }
    ];

    const metrics = qaMeasurementMetrics(rows);
    expect(metrics).toEqual({
      halfCreditShare: 0.5,
      strictCorrectShare: 1 / 3,
      coreAnswerCorrectShare: 1,
      gradedCoreAnswerNullCount: 0,
      coreAnswerVerdictCount: 2
    });
    expectValidMeasurementMetrics(metrics);
    expect(formatMeasurementMetrics(metrics)).toBe(
      "half-credit 50.0% · strict-correct 33.3% · core-answer-correct 100.0% (0 graded null)"
    );
  });

  it("derives no coverage share from a panel union that exceeds the key facts", async () => {
    // Three votes, three paraphrases of one missing fact, two key facts. The
    // retired formula 1 - missingFacts / keyFacts produced -0.5 on this shape
    // (`q-jutsu-what-is-a-memo`, 2026-09-04 500-case arm).
    const panel = await judgeCasePanel(
      { golden: { keyFacts: ["Defines a memo.", "Explains the crediting use."] } },
      {
        panelSize: 3,
        judge: queuedJudge([
          verdict("partial", ["Does not instruct the user to use the supplied memo value"]),
          verdict("partial", ["Does not state the instruction to use the exact memo type and value"]),
          verdict("partial", ["Omits the exact memo type/value instruction"])
        ])
      }
    );
    expect(panel.missingFacts).toHaveLength(3);
    expect(panel.meta.panelSize).toBe(3);

    const metrics = qaMeasurementMetrics([{ id: "q-memo", verdict: panel }]);
    expect(metrics).toEqual({
      halfCreditShare: 0.5,
      strictCorrectShare: 0,
      coreAnswerCorrectShare: 1,
      gradedCoreAnswerNullCount: 0,
      coreAnswerVerdictCount: 1
    });
    expectValidMeasurementMetrics(metrics);
  });

  it("keeps duplicated paraphrases as diagnostic text and never counts them", async () => {
    const panel = await judgeCasePanel(
      {},
      {
        panelSize: 3,
        judge: queuedJudge([
          verdict("partial", ["fact one", "fact one restated"]),
          verdict("wrong", ["fact one", "fact one again"]),
          verdict("partial", ["fact one restated"])
        ])
      }
    );
    // The union dedupes byte-identical strings only; semantic duplicates stay.
    expect(panel.missingFacts).toEqual(["fact one", "fact one restated", "fact one again"]);
    expect(panel.score).toBe("partial");

    const metrics = qaMeasurementMetrics([{ id: "q-dup", verdict: panel }]);
    expect(metrics).toMatchObject({ halfCreditShare: 0.5, strictCorrectShare: 0, coreAnswerCorrectShare: 1 });
    expectValidMeasurementMetrics(metrics);
  });

  it("stays in range when one judge lists more missing facts than the case has", () => {
    const rows = [
      { id: "over", verdict: { score: "partial", coreAnswer: "correct", missingFacts: ["a", "b", "c", "d", "e"] } },
      { id: "wrong", verdict: { score: "wrong", coreAnswer: "incorrect", missingFacts: ["a", "b", "c"] } },
      { id: "ok", verdict: { score: "correct", coreAnswer: "correct", missingFacts: [] } }
    ];

    const metrics = qaMeasurementMetrics(rows);
    expect(metrics).toEqual({
      halfCreditShare: 0.5,
      strictCorrectShare: 1 / 3,
      coreAnswerCorrectShare: 2 / 3,
      gradedCoreAnswerNullCount: 0,
      coreAnswerVerdictCount: 3
    });
    expectValidMeasurementMetrics(metrics);
  });

  it("guards empty denominators", () => {
    const empty = qaMeasurementMetrics([]);
    expect(empty).toEqual({
      halfCreditShare: null,
      strictCorrectShare: null,
      coreAnswerCorrectShare: null,
      gradedCoreAnswerNullCount: 0,
      coreAnswerVerdictCount: 0
    });
    expectValidMeasurementMetrics(empty);
    expect(formatMeasurementMetrics(empty)).toBe(
      "half-credit n/a · strict-correct n/a · core-answer-correct n/a (0 graded null)"
    );

    // Error-only rows keep an ordinal denominator but have no graded denominator.
    const errorOnly = qaMeasurementMetrics([
      { id: "e", verdict: { score: "error", coreAnswer: null, missingFacts: [] } }
    ]);
    expect(errorOnly).toEqual({
      halfCreditShare: 0,
      strictCorrectShare: 0,
      coreAnswerCorrectShare: null,
      gradedCoreAnswerNullCount: 0,
      coreAnswerVerdictCount: 0
    });
    expectValidMeasurementMetrics(errorOnly);

    // A graded row with a null core answer stays in the denominator and is counted.
    const nullCore = qaMeasurementMetrics([
      { id: "n", verdict: { score: "partial", coreAnswer: null, missingFacts: [] } }
    ]);
    expect(nullCore).toMatchObject({
      coreAnswerCorrectShare: 0,
      gradedCoreAnswerNullCount: 1,
      coreAnswerVerdictCount: 1
    });
    expectValidMeasurementMetrics(nullCore);
  });

  it("rejects invalid panel sizes and cap values", () => {
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
