import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildStabilityRegister,
  calculateCaseStability,
  generateStabilityRegister,
  loadJudgeStabilityRegister,
  STABILITY_SCHEMA_VERSION
} from "../eval/qa/judge-stability.mjs";
import {
  createPanelCaseBudget,
  judgeCaseTiered,
  selectJudgeTier
} from "../eval/qa/judge.mjs";
import {
  judgeTieringMetadata,
  prepareJudgeStabilityRegister,
  resolvePanelCaseLimit
} from "../eval/qa/run-qa.mjs";

const correct = (extra = {}) => ({
  score: "correct",
  coreAnswer: "correct",
  missingFacts: [],
  wrongClaims: [],
  avoidMatches: [],
  rationale: "correct",
  costUsd: 0.1,
  ...extra
});

const partial = (missingFacts = ["one"], extra = {}) => ({
  ...correct(),
  score: "partial",
  missingFacts,
  rationale: "partial",
  ...extra
});

const wrong = (wrongClaims = ["one"], extra = {}) => ({
  ...correct(),
  score: "wrong",
  coreAnswer: "incorrect",
  wrongClaims,
  rationale: "wrong",
  ...extra
});

function queuedJudge(verdicts, calls = []) {
  let index = 0;
  return async (input) => {
    calls.push(input.id);
    return verdicts[index++];
  };
}

describe("QA judge stability register", () => {
  it("handles zero samples and one initial sample", () => {
    expect(calculateCaseStability()).toEqual({
      initialDisagreements: 0,
      crossPassFlips: 0,
      comparisonCount: 0,
      sampleCount: 0,
      stabilityScore: null
    });
    expect(calculateCaseStability({ initialScores: ["correct"] })).toEqual({
      initialDisagreements: 0,
      crossPassFlips: 0,
      comparisonCount: 0,
      sampleCount: 1,
      stabilityScore: 1
    });
  });

  it("collects initial verdicts and tolerates missing verdict fields", () => {
    const register = buildStabilityRegister([
      {
        name: "one-variantA.json",
        data: {
          rows: [
            { id: "case-a", verdict: partial(undefined, { wrongClaims: undefined }) },
            { id: "case-b", verdict: correct() },
            { id: "case-c", verdict: { score: "partial" } },
            { id: "case-without-verdict" },
            { verdict: correct() }
          ]
        }
      }
    ]);

    expect(register["case-a"]).toMatchObject({
      appearances: 1,
      verdictDistribution: { correct: 0, partial: 1, wrong: 0, error: 0 },
      meanMissingFactsOnPartials: 1,
      anyWrongClaims: false,
      sampleCount: 1,
      stabilityScore: 1
    });
    expect(register["case-b"].verdictDistribution.correct).toBe(1);
    expect(register["case-c"]).toMatchObject({
      meanMissingFactsOnPartials: 0,
      anyWrongClaims: false
    });
    expect(register).not.toHaveProperty("case-without-verdict");
  });

  it("counts initial disagreement and original-to-new rejudge flips", () => {
    const register = buildStabilityRegister([
      {
        name: "one-variantA.json",
        data: { rows: [{ id: "case-a", verdict: correct() }] }
      },
      {
        name: "two-variantA.json",
        data: { rows: [{ id: "case-a", verdict: partial(["fact"]) }] }
      },
      {
        name: "three-rejudge.json",
        data: {
          rows: [
            {
              id: "case-a",
              original: partial(["fact"]),
              new: wrong(["claim"])
            }
          ]
        }
      }
    ]);

    expect(register["case-a"]).toMatchObject({
      appearances: 3,
      initialDisagreements: 1,
      crossPassComparisons: 1,
      crossPassFlips: 1,
      comparisonCount: 2,
      sampleCount: 3,
      stabilityScore: 0,
      meanMissingFactsOnPartials: 1,
      anyWrongClaims: true
    });
  });

  it("writes a register from real-shaped artifacts and loads absent or stale files safely", () => {
    const root = mkdtempSync(join(tmpdir(), "qa-stability-"));
    try {
      const resultsDir = join(root, "results");
      const outPath = join(root, "judge-stability.json");
      mkdirSync(resultsDir);
      writeFileSync(
        join(resultsDir, "one-variantA.json"),
        JSON.stringify({ rows: [{ id: "case-a", verdict: correct() }] })
      );
      writeFileSync(join(resultsDir, "ignored.plan.json"), JSON.stringify({ rows: [] }));

      const generated = generateStabilityRegister({ resultsDir, outPath });
      expect(generated.caseCount).toBe(1);
      const sourceText = readFileSync(outPath, "utf8");
      const document = JSON.parse(sourceText);
      expect(document._meta.schemaVersion).toBe(STABILITY_SCHEMA_VERSION);
      expect(loadJudgeStabilityRegister(outPath)).toMatchObject({
        status: "available",
        cases: { "case-a": { sampleCount: 1 } },
        sha256: createHash("sha256").update(sourceText).digest("hex"),
        generatedAt: document._meta.generatedAt,
        sourceArtifactCount: 1,
        caseCount: 1
      });
      writeFileSync(
        join(resultsDir, "one-variantA.json"),
        JSON.stringify({ rows: [{ id: "case-a", verdict: partial(["changed"]) }] })
      );
      expect(loadJudgeStabilityRegister(outPath)).toMatchObject({
        status: "stale",
        reason: "source-artifacts-changed",
        cases: {},
        sha256: createHash("sha256").update(sourceText).digest("hex"),
        generatedAt: document._meta.generatedAt,
        sourceArtifactCount: 1,
        caseCount: 1
      });
      expect(loadJudgeStabilityRegister(join(root, "absent.json"))).toMatchObject({
        status: "absent",
        cases: {},
        sha256: null,
        generatedAt: null,
        sourceArtifactCount: null,
        caseCount: 0
      });

      const stalePath = join(root, "stale.json");
      writeFileSync(
        stalePath,
        JSON.stringify({ _meta: { schemaVersion: STABILITY_SCHEMA_VERSION - 1 } })
      );
      expect(loadJudgeStabilityRegister(stalePath)).toMatchObject({
        status: "stale",
        cases: {}
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("regenerates at startup and treats refresh failures as non-fatal", () => {
    const root = mkdtempSync(join(tmpdir(), "qa-stability-refresh-"));
    try {
      const resultsDir = join(root, "results");
      const registerPath = join(root, "judge-stability.json");
      mkdirSync(resultsDir);
      writeFileSync(
        join(resultsDir, "one-variantA.json"),
        JSON.stringify({ rows: [{ id: "case-a", verdict: correct() }] })
      );
      const logs = [];
      const loaded = prepareJudgeStabilityRegister({
        resultsDir,
        registerPath,
        log: (message) => logs.push(message)
      });
      expect(loaded).toMatchObject({ status: "available", caseCount: 1 });
      expect(logs).toEqual([expect.stringContaining("1 case(s) from 1 artifact(s)")]);

      const warnings = [];
      const failed = prepareJudgeStabilityRegister({
        resultsDir,
        registerPath: join(root, "missing", "judge-stability.json"),
        log: () => {},
        warn: (message) => warnings.push(message)
      });
      expect(failed.status).toBe("absent");
      expect(warnings).toEqual([expect.stringContaining("refresh failed")]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("tiered QA judge selection", () => {
  const available = (entry) => ({ status: "available", cases: { "case-a": entry } });

  it.each([
    ["unstable history", correct(), {}, available({ stabilityScore: 0.5, comparisonCount: 3 }), "panel", "unstable-register"],
    ["stable history wins", partial(["one"]), {}, available({ stabilityScore: 1, comparisonCount: 3 }), "single", null],
    ["partial boundary", partial(["one"]), {}, { status: "absent", cases: {} }, "panel", "boundary-partial"],
    ["single wrong claim", wrong(["one"]), {}, { status: "absent", cases: {} }, "panel", "boundary-wrong-claim"],
    ["trap non-correct", partial(["one", "two"]), { trap: "scam-check" }, { status: "absent", cases: {} }, "panel", "boundary-trap"],
    ["ordinary verdict", correct(), {}, { status: "absent", cases: {} }, "single", null],
    ["stale register", partial(["one"]), {}, { status: "stale", cases: {} }, "panel", "boundary-partial"],
    ["insufficient history", partial(["one"]), {}, available({ stabilityScore: 1, comparisonCount: 0 }), "panel", "boundary-partial"]
  ])("selects %s", (_name, verdict, tags, stabilityRegister, tier, reason) => {
    expect(
      selectJudgeTier({
        caseId: "case-a",
        verdict,
        tags,
        stabilityRegister,
        panelBudget: createPanelCaseBudget(10)
      })
    ).toMatchObject({ judgeTierUsed: tier, escalationReason: reason });
  });

  it("caps only boundary-triggered panels", () => {
    const budget = createPanelCaseBudget(1);
    const first = selectJudgeTier({
      caseId: "case-a",
      verdict: partial(["one"]),
      tags: {},
      stabilityRegister: { status: "absent", cases: {} },
      panelBudget: budget
    });
    const second = selectJudgeTier({
      caseId: "case-b",
      verdict: wrong(["one"]),
      tags: {},
      stabilityRegister: { status: "absent", cases: {} },
      panelBudget: budget
    });
    const unstable = selectJudgeTier({
      caseId: "case-c",
      verdict: correct(),
      tags: {},
      stabilityRegister: {
        status: "available",
        cases: { "case-c": { stabilityScore: 0.2, comparisonCount: 2 } }
      },
      panelBudget: budget
    });

    expect(first).toMatchObject({ judgeTierUsed: "panel", escalationReason: "boundary-partial" });
    expect(second).toMatchObject({
      judgeTierUsed: "single",
      escalationReason: "boundary-wrong-claim",
      panelEscalationSkipped: "max-panel-cases"
    });
    expect(unstable).toMatchObject({ judgeTierUsed: "panel", escalationReason: "unstable-register" });
  });

  it("reuses the first vote when it escalates to a three-call panel", async () => {
    const calls = [];
    const verdict = await judgeCaseTiered(
      { id: "case-a", tags: {} },
      {
        judge: queuedJudge(
          [partial(["one"]), correct(), partial(["two"])],
          calls
        ),
        stabilityRegister: { status: "absent", cases: {} },
        panelBudget: createPanelCaseBudget(2)
      }
    );

    expect(calls).toEqual(["case-a", "case-a", "case-a"]);
    expect(verdict.score).toBe("partial");
    expect(verdict.missingFacts).toEqual(["one", "two"]);
    expect(verdict.meta).toMatchObject({
      panelSize: 3,
      judgeTierUsed: "panel",
      escalationReason: "boundary-partial"
    });
  });

  it("records an absent-register single tier and does not add calls", async () => {
    const calls = [];
    const verdict = await judgeCaseTiered(
      { id: "case-a", tags: {} },
      {
        judge: queuedJudge([correct()], calls),
        stabilityRegister: { status: "absent", cases: {} },
        panelBudget: createPanelCaseBudget(1)
      }
    );

    expect(calls).toEqual(["case-a"]);
    expect(verdict.meta).toMatchObject({
      judgeTierUsed: "single",
      escalationReason: null,
      stabilityRegisterStatus: "absent"
    });
  });

  it("does not add panel calls after the boundary cap is full", async () => {
    const calls = [];
    const judge = queuedJudge(
      [partial(["one"]), partial(["one"]), partial(["one"]), wrong(["one"])],
      calls
    );
    const panelBudget = createPanelCaseBudget(1);
    const options = {
      judge,
      stabilityRegister: { status: "absent", cases: {} },
      panelBudget
    };

    const first = await judgeCaseTiered({ id: "case-a", tags: {} }, options);
    const second = await judgeCaseTiered({ id: "case-b", tags: {} }, options);

    expect(calls).toEqual(["case-a", "case-a", "case-a", "case-b"]);
    expect(first.meta.judgeTierUsed).toBe("panel");
    expect(second.meta).toMatchObject({
      judgeTierUsed: "single",
      escalationReason: "boundary-wrong-claim",
      panelEscalationSkipped: "max-panel-cases"
    });
  });

  it("does not escalate an error vote from history or a trap boundary", async () => {
    const calls = [];
    const verdict = await judgeCaseTiered(
      { id: "case-a", tags: { trap: "scam-check" } },
      {
        judge: queuedJudge([{ ...correct(), score: "error", coreAnswer: null }], calls),
        stabilityRegister: {
          status: "available",
          cases: { "case-a": { stabilityScore: 0.2, comparisonCount: 2 } }
        },
        panelBudget: createPanelCaseBudget(3)
      }
    );

    expect(calls).toEqual(["case-a"]);
    expect(verdict.meta).toMatchObject({
      judgeTierUsed: "single",
      escalationReason: null,
      stabilityScore: 0.2
    });
  });

  it("projects register identity into judge tiering metadata", () => {
    expect(
      judgeTieringMetadata({
        judgePanel: 1,
        stabilityRegister: {
          status: "available",
          reason: null,
          sha256: "a".repeat(64),
          generatedAt: "2026-08-27T00:00:00.000Z",
          sourceArtifactCount: 187,
          caseCount: 538
        },
        panelLimit: resolvePanelCaseLimit(30),
        rows: [
          {
            verdict: {
              meta: { judgeTierUsed: "panel", escalationReason: "boundary-partial" }
            }
          },
          {
            verdict: {
              meta: { judgeTierUsed: "panel", escalationReason: "boundary-wrong-claim" }
            }
          }
        ]
      })
    ).toMatchObject({
      stabilityRegisterSha256: "a".repeat(64),
      stabilityRegisterGeneratedAt: "2026-08-27T00:00:00.000Z",
      stabilityRegisterSourceArtifactCount: 187,
      stabilityRegisterCaseCount: 538,
      selectedCaseCount: 30,
      maxPanelCases: 10,
      boundaryEligibleCases: 2,
      panelUsedCases: 2,
      panelSkippedCases: 0,
      boundaryPanelCases: 2
    });
  });
});
