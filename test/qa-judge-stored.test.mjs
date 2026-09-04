/**
 * Contract tests for `run-qa.mjs --judge-stored`: phase 2 of
 * the two-phase collect → checkpoint → judge flow. Judges a --no-judge
 * collection IN PLACE with an injected judge stub — no claude CLI spawn, no
 * spend. Pins: write-back shape (verdicts, summary, judge-cost meta stamps,
 * judgeStored provenance block), the judge-all-unjudged default, the empty-
 * answer error verdict, and every refusal guard (drifted case snapshot,
 * mixed judge tuple, pack-hash drift, already-fully-judged).
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  assertCollectionSourceIdentity,
  assertPinnedServerRevision,
  collectionGitStatus,
  judgeStoredResults,
  sourceIdentity,
  sourceIdentityGuard
} from "../eval/qa/run-qa.mjs";
import { JUDGE_RUBRIC } from "../eval/qa/judge.mjs";
import { PACK_VERSION } from "../eval/qa/evidence-pack.mjs";
import { AGENT_RESULT_SCHEMA } from "../eval/qa/agent-result.mjs";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

const CASES = [
  {
    id: "q-fixture-answered",
    question: "What command builds a Soroban contract?",
    golden: {
      answer: "`stellar contract build` compiles the contract to Wasm.",
      keyFacts: ["Uses `stellar contract build`."],
      avoid: ["Do NOT name the retired `soroban` CLI."],
      sources: ["https://developers.stellar.org"],
      notes: ""
    },
    tags: { category: "soroban", service: "stellarDocs", freshness: "stable" },
    truth: { lifecycle: { state: "active", reviewState: "none" } }
  },
  {
    id: "q-fixture-empty",
    question: "What is SEP-10?",
    golden: {
      answer: "SEP-10 is the web authentication SEP.",
      keyFacts: ["SEP-10 is web authentication."],
      avoid: [],
      sources: [],
      notes: ""
    },
    tags: { category: "seps", service: "stellarDocs", freshness: "stable" },
    truth: { lifecycle: { state: "active", reviewState: "none" } }
  },
  {
    id: "q-fixture-third",
    question: "What is SEP-41?",
    golden: {
      answer: "SEP-41 defines a standard token interface.",
      keyFacts: ["SEP-41 defines a token interface."],
      avoid: [],
      sources: [],
      notes: ""
    },
    tags: { category: "seps", service: "stellarDocs", freshness: "stable" },
    truth: { lifecycle: { state: "active", reviewState: "none" } }
  }
];

function answeredRow(kase, answer, verdict = null) {
  return {
    id: kase.id,
    question: kase.question,
    tags: kase.tags,
    truth: { status: "verified", lifecycle: kase.truth.lifecycle },
    answer,
    transcript: [],
    agent: {
      model: "claude-sonnet-5",
      turns: 1,
      costUsd: 0.1,
      usage: { final: null, perTurn: [], perTurnAvailable: false },
      promptChars: 90,
      stderr: null,
      failure: null
    },
    verdict,
    evidencePack: { packVersion: PACK_VERSION, chars: 0, sha256: null },
    durationMs: 500
  };
}

/** Build a temp dir holding a battery file + a --no-judge results file whose
 *  snapshot hashes genuinely reproduce, mirroring run-qa's collection output. */
function writeFixture(root, { rows: rowOverrides, cases = CASES } = {}) {
  const casesPath = join(root, "cases.json");
  writeFileSync(casesPath, JSON.stringify({ cases }, null, 2));
  const rows = rowOverrides ?? [
    {
      id: "q-fixture-answered",
      question: CASES[0].question,
      tags: CASES[0].tags,
      truth: { status: "verified" },
      answer: "Run `stellar contract build` to compile the contract to Wasm.",
      transcript: [
        {
          toolUseId: "t1",
          tool: "mcp__raven__execute",
          input: '{"code":"async () => 1"}',
          resultChars: 21,
          isError: false
        }
      ],
      agent: {
        model: "claude-sonnet-5",
        turns: 3,
        costUsd: 0.5,
        usage: { final: null, perTurn: [], perTurnAvailable: false },
        promptChars: 100,
        stderr: null,
        failure: null
      },
      verdict: null,
      // stable-freshness case → collection-time evidence pack was empty
      evidencePack: { packVersion: PACK_VERSION, chars: 0, sha256: null },
      durationMs: 1000
    },
    {
      id: "q-fixture-empty",
      question: CASES[1].question,
      tags: CASES[1].tags,
      truth: { status: "verified" },
      answer: "",
      transcript: [],
      agent: {
        model: "claude-sonnet-5",
        turns: 1,
        costUsd: 0.1,
        usage: { final: null, perTurn: [], perTurnAvailable: false },
        promptChars: 90,
        stderr: null,
        failure: {
          class: "timeout",
          reason: "agent process exceeded its wall-clock budget",
          retryable: false,
          messageExcerpt: "spawnSync claude ETIMEDOUT",
          subtype: null,
          exitStatus: null,
          signal: "SIGTERM"
        }
      },
      verdict: null,
      evidencePack: { packVersion: PACK_VERSION, chars: 0, sha256: null },
      durationMs: 500
    }
  ];
  const selectedCases = rows.map((row) => cases.find((c) => c.id === row.id));
  for (const [index, row] of rows.entries()) {
    row.truth = { ...row.truth, lifecycle: selectedCases[index].truth.lifecycle };
  }
  const lifecycle = selectedCases.map((kase) => ({ id: kase.id, lifecycle: kase.truth.lifecycle }));
  const results = {
    meta: {
      variant: "A",
      surface: "search-execute",
      searchTool: "search",
      model: "claude-sonnet-5",
      judgeModel: null,
      judgeRubric: null,
      packVersion: PACK_VERSION,
      resultsSchema: AGENT_RESULT_SCHEMA,
      casesPath,
      caseCount: rows.length,
      inputSnapshot: {
        casesSha256: sha256(JSON.stringify(selectedCases)),
        caseIdsSha256: sha256(JSON.stringify(rows.map((row) => row.id))),
        lifecycle,
        lifecycleSha256: sha256(JSON.stringify(lifecycle))
      },
      comparable: true,
      completeness: {
        expectedRows: rows.length,
        collectedRows: rows.length,
        judgedRows: 0,
        complete: true,
        aggregatesAllowed: true,
        reasons: []
      },
      totalAgentCostUsd: rows.reduce((s, r) => s + (r.agent?.costUsd ?? 0), 0),
      totalJudgeCostUsd: 0,
      totalCostUsd: rows.reduce((s, r) => s + (r.agent?.costUsd ?? 0), 0)
    },
    summary: null,
    rows
  };
  const resultsPath = join(root, "results.json");
  writeFileSync(resultsPath, JSON.stringify(results, null, 2) + "\n");
  return { casesPath, resultsPath };
}

const stubVerdict = {
  score: "correct",
  coreAnswer: "correct",
  missingFacts: [],
  wrongClaims: [],
  avoidMatches: [],
  rationale: "stub",
  costUsd: 0.25,
  rubric: JUDGE_RUBRIC,
  packVersion: PACK_VERSION,
  promptSha256: "0".repeat(64)
};

function stubJudge(calls = []) {
  return async (input, opts) => {
    calls.push({ id: input.id, model: opts?.model, hasEvidence: typeof input.transcriptEvidence === "string" });
    return { ...stubVerdict };
  };
}

describe("run-qa --judge-stored", () => {
  it("uses the active lifecycle denominator for stored panel limits", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-lifecycle-"));
    try {
      const cases = CASES.slice(0, 2).map((kase, index) => ({
        ...kase,
        truth: {
          lifecycle: {
            state: index === 0 ? "active" : "quarantined",
            reviewState: index === 0 ? "none" : "queued"
          }
        }
      }));
      const rows = cases.map((kase) => ({
        ...answeredRow(kase, `answer for ${kase.id}`),
        truth: { status: "verified", lifecycle: kase.truth.lifecycle }
      }));
      const { resultsPath } = writeFixture(root, { rows, cases });
      const seeded = JSON.parse(readFileSync(resultsPath, "utf8"));
      seeded.meta.judgeTiering = {
        selectedCaseCount: 1,
        maxPanelCases: 1,
        maxPanelCasesSource: "bounded-scaled-default"
      };
      writeFileSync(resultsPath, JSON.stringify(seeded, null, 2));

      await judgeStoredResults(resultsPath, {
        judgeModel: "stub-judge",
        judge: stubJudge(),
        log: () => {}
      });

      const written = JSON.parse(readFileSync(resultsPath, "utf8"));
      expect(written.meta.judgeTiering.selectedCaseCount).toBe(1);
      expect(written.meta.lifecycle).toMatchObject({ activeCount: 1, selectedCount: 2 });
      expect(written.meta.tracks.t1.firstAttemptRows.denominator).toBe(1);
      expect(written.meta.tracks.t4.judging.attempted.denominator).toBe(2);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("fails closed when current lifecycle differs from the collection snapshot", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-lifecycle-drift-"));
    try {
      const { casesPath, resultsPath } = writeFixture(root, {
        rows: [answeredRow(CASES[0], "Run `stellar contract build`.")],
        cases: [CASES[0]]
      });
      const current = JSON.parse(readFileSync(casesPath, "utf8"));
      current.cases[0].truth.lifecycle = { state: "quarantined", reviewState: "queued" };
      writeFileSync(casesPath, JSON.stringify(current, null, 2));
      await expect(
        judgeStoredResults(resultsPath, { judge: stubJudge(), log: () => {} })
      ).rejects.toThrow(/current lifecycle differs from the collection snapshot/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects a false lifecycle digest and row lifecycle tampering", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-lifecycle-tamper-"));
    try {
      const first = writeFixture(root, {
        rows: [answeredRow(CASES[0], "Run `stellar contract build`.")],
        cases: [CASES[0]]
      });
      const falseDigest = JSON.parse(readFileSync(first.resultsPath, "utf8"));
      falseDigest.meta.inputSnapshot.lifecycleSha256 = "a".repeat(64);
      writeFileSync(first.resultsPath, JSON.stringify(falseDigest, null, 2));
      await expect(
        judgeStoredResults(first.resultsPath, { judge: stubJudge(), log: () => {} })
      ).rejects.toThrow(/lifecycle snapshot digest is invalid/);

      const secondRoot = mkdtempSync(join(tmpdir(), "qa-judge-stored-lifecycle-row-"));
      try {
        const second = writeFixture(secondRoot, {
          rows: [answeredRow(CASES[0], "Run `stellar contract build`.")],
          cases: [CASES[0]]
        });
        const rowTamper = JSON.parse(readFileSync(second.resultsPath, "utf8"));
        rowTamper.rows[0].truth.lifecycle = { state: "quarantined", reviewState: "queued" };
        writeFileSync(second.resultsPath, JSON.stringify(rowTamper, null, 2));
        await expect(
          judgeStoredResults(second.resultsPath, { judge: stubJudge(), log: () => {} })
        ).rejects.toThrow(/stored row lifecycle differs from the collection snapshot/);
      } finally {
        rmSync(secondRoot, { recursive: true, force: true });
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("allows regenerated-register refreshes but never upgrades saved verdicts to a pin", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-"));
    try {
      const rows = [
        answeredRow(CASES[0], "Run `stellar contract build`.", stubVerdict),
        answeredRow(CASES[1], "SEP-10 is web authentication.")
      ];
      const { resultsPath } = writeFixture(root, { rows });
      const seeded = JSON.parse(readFileSync(resultsPath, "utf8"));
      seeded.meta.judgeModel = "stub-judge";
      seeded.meta.judgeRubric = JUDGE_RUBRIC;
      seeded.meta.judgePanel = 1;
      seeded.meta.judgeTiering = {
        policy: "stability-boundary-v1",
        judgePanel: 1,
        stabilityRegisterSource: "regenerated",
        stabilityRegisterSha256: "a".repeat(64),
        selectedCaseCount: 2,
        maxPanelCases: 10,
        maxPanelCasesSource: "bounded-scaled-default"
      };
      writeFileSync(resultsPath, JSON.stringify(seeded, null, 2));

      const refreshed = {
        status: "available",
        source: "regenerated",
        sha256: "b".repeat(64),
        cases: {},
        generatedAt: "2026-08-29T00:00:00.000Z",
        sourceArtifactCount: 1,
        caseCount: 0
      };
      await expect(
        judgeStoredResults(resultsPath, {
          judgeModel: "stub-judge",
          judge: stubJudge(),
          stabilityRegister: { ...refreshed, source: "pinned" },
          log: () => {}
        })
      ).rejects.toThrow(/different stability-register contract/);

      const output = await judgeStoredResults(resultsPath, {
        judgeModel: "stub-judge",
        judge: stubJudge(),
        stabilityRegister: refreshed,
        log: () => {}
      });

      expect(output.judgedCount).toBe(1);
      const written = JSON.parse(readFileSync(resultsPath, "utf8"));
      expect(written.meta.judgeTiering).toMatchObject({
        stabilityRegisterSource: "regenerated",
        stabilityRegisterSha256: "b".repeat(64)
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("preserves the stored cap and resumes with existing panels and skips", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-"));
    try {
      const existingPanel = {
        ...stubVerdict,
        score: "partial",
        missingFacts: ["one detail"],
        costUsd: 0.75,
        meta: {
          judgeTierUsed: "panel",
          escalationReason: "boundary-partial",
          panelSize: 3,
          panelReportedCostCount: 3
        }
      };
      const existingSkip = {
        ...stubVerdict,
        score: "partial",
        missingFacts: ["one detail"],
        meta: {
          judgeTierUsed: "single",
          escalationReason: "boundary-partial",
          panelEscalationSkipped: "max-panel-cases"
        }
      };
      const rows = [
        answeredRow(CASES[0], "Run `stellar contract build`.", existingPanel),
        answeredRow(CASES[1], "SEP-10 is web authentication.", existingSkip),
        answeredRow(CASES[2], "SEP-41 defines a token interface.")
      ];
      const { resultsPath } = writeFixture(root, { rows });
      const seeded = JSON.parse(readFileSync(resultsPath, "utf8"));
      seeded.meta.judgeModel = "stub-judge";
      seeded.meta.judgeRubric = JUDGE_RUBRIC;
      seeded.meta.judgeTiering = {
        selectedCaseCount: 3,
        maxPanelCases: 1,
        maxPanelCasesSource: "cli-override"
      };
      writeFileSync(resultsPath, JSON.stringify(seeded, null, 2));

      const calls = [];
      const logs = [];
      const partialJudge = async (input) => {
        calls.push(input.id);
        return {
          ...stubVerdict,
          score: "partial",
          missingFacts: ["one detail"],
          rationale: "partial"
        };
      };
      const out = await judgeStoredResults(resultsPath, {
        judgeModel: "stub-judge",
        judge: partialJudge,
        log: (line) => logs.push(line)
      });

      expect(calls).toEqual(["q-fixture-third"]);
      expect(logs).toContain(
        "judge panels before: cap 1 · source cli-override · selected 3 · " +
        "boundary-eligible 2 · used 1 · skipped 1"
      );
      expect(out.judgeTiering).toMatchObject({
        selectedCaseCount: 3,
        maxPanelCases: 1,
        maxPanelCasesSource: "cli-override",
        boundaryEligibleCases: 3,
        panelUsedCases: 1,
        panelSkippedCases: 2,
        boundaryPanelCases: 1
      });
      const final = JSON.parse(readFileSync(resultsPath, "utf8"));
      expect(final.rows[2].verdict.meta).toMatchObject({
        judgeTierUsed: "single",
        escalationReason: "boundary-partial",
        panelEscalationSkipped: "max-panel-cases"
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("refuses a changed cap before a crash resume", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-"));
    try {
      const rows = [
        answeredRow(CASES[0], "Run `stellar contract build`.", {
          ...stubVerdict,
          meta: {
            judgeTierUsed: "panel",
            escalationReason: "boundary-partial",
            panelSize: 3
          }
        }),
        answeredRow(CASES[1], "SEP-10 is web authentication.")
      ];
      const { resultsPath } = writeFixture(root, { rows });
      const seeded = JSON.parse(readFileSync(resultsPath, "utf8"));
      seeded.meta.judgeModel = "stub-judge";
      seeded.meta.judgeRubric = JUDGE_RUBRIC;
      seeded.meta.judgeTiering = {
        selectedCaseCount: 2,
        maxPanelCases: 1,
        maxPanelCasesSource: "cli-override"
      };
      writeFileSync(resultsPath, JSON.stringify(seeded, null, 2));
      const calls = [];

      await expect(
        judgeStoredResults(resultsPath, {
          judgeModel: "stub-judge",
          maxPanelCases: 2,
          maxPanelCasesSource: "cli-override",
          judge: stubJudge(calls),
          log: () => {}
        })
      ).rejects.toThrow(/stored panel cap 1; refusing to mix in 2/);
      expect(calls).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("refuses to judge a collection that a final guard marked non-comparable", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-"));
    try {
      const { resultsPath } = writeFixture(root);
      const results = JSON.parse(readFileSync(resultsPath, "utf8"));
      results.meta.comparable = false;
      results.meta.comparabilityReasons = ["postflight failed: listener changed"];
      writeFileSync(resultsPath, JSON.stringify(results, null, 2));
      await expect(
        judgeStoredResults(resultsPath, { judge: stubJudge(), log: () => {} })
      ).rejects.toThrow(/non-comparable.*listener changed/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("does not restore aggregates for an incomplete original collection", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-"));
    try {
      const { resultsPath } = writeFixture(root);
      const results = JSON.parse(readFileSync(resultsPath, "utf8"));
      results.meta.completeness = {
        expectedRows: 3,
        collectedRows: 2,
        judgedRows: 0,
        complete: false,
        aggregatesAllowed: false,
        reasons: ["missing one collected row"]
      };
      results.meta.aggregatesSuppressed = true;
      writeFileSync(resultsPath, JSON.stringify(results, null, 2));

      const output = await judgeStoredResults(resultsPath, {
        judgeModel: "stub-judge",
        judge: stubJudge(),
        log: () => {}
      });
      const written = JSON.parse(readFileSync(resultsPath, "utf8"));
      expect(output.metrics).toBeNull();
      expect(written.summary).toBeNull();
      expect(written.meta.aggregatesSuppressed).toBe(true);
      expect(written.meta).not.toHaveProperty("strictCorrectShare");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("requires a non-empty server revision before collection", () => {
    expect(() => assertPinnedServerRevision(undefined)).toThrow(/--server-revision/);
    expect(() => assertPinnedServerRevision("   ")).toThrow(/--server-revision/);
    expect(() => assertPinnedServerRevision("server-deploy-123")).toThrow(/immutable/);
    expect(() => assertPinnedServerRevision("c".repeat(40))).toThrow(/resolve/);
    const head = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
    expect(assertPinnedServerRevision(head)).toBe(head);
  });

  it("requires a clean runner identity and detects drift before finalization", () => {
    const clean = {
      runnerRevision: "a".repeat(40),
      runnerDirty: false,
      runnerStatusSha256: "b".repeat(64),
      serverRevision: "c".repeat(40),
      qaImplementationSha256: "d".repeat(64)
    };
    expect(assertCollectionSourceIdentity(clean)).toBe(clean);
    expect(() => assertCollectionSourceIdentity({ ...clean, runnerDirty: true })).toThrow(/clean/);
    expect(sourceIdentityGuard(clean, clean)).toEqual({ matches: true });
    expect(sourceIdentityGuard(clean, { ...clean, qaImplementationSha256: "e".repeat(64) })).toMatchObject({
      matches: false,
      changedKeys: ["qaImplementationSha256"]
    });
    expect(
      collectionGitStatus("?? eval/qa/judge-stability.json\n M eval/qa/judge.mjs\n")
    ).toBe(" M eval/qa/judge.mjs");
    expect(collectionGitStatus("?? eval/qa/judge-stability.json\n")).toBe("");
  });

  it("judges every unjudged row in place and stamps summary + judge costs", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-"));
    try {
      const { resultsPath } = writeFixture(root);
      const calls = [];
      const stabilityRegister = {
        status: "available",
        reason: null,
        cases: {
          "q-fixture-answered": { stabilityScore: 0.8, comparisonCount: 2 }
        },
        sha256: "a".repeat(64),
        generatedAt: "2026-08-27T00:00:00.000Z",
        sourceArtifactCount: 4,
        caseCount: 2
      };
      const logs = [];
      const out = await judgeStoredResults(resultsPath, {
        judgeModel: "stub-judge",
        judge: stubJudge(calls),
        stabilityRegister,
        log: (line) => logs.push(line)
      });

      // Only the answered row hits the judge; the empty answer gets the
      // inline-path error verdict without spending.
      expect(calls).toEqual([{ id: "q-fixture-answered", model: "stub-judge", hasEvidence: true }]);
      expect(out.judgedCount).toBe(2);

      const written = JSON.parse(readFileSync(resultsPath, "utf8"));
      expect(written.rows[0].verdict).toMatchObject({
        score: "correct",
        coreAnswer: "correct",
        avoidMatches: [],
        meta: {
          judgeTierUsed: "single",
          escalationReason: null,
          stabilityScore: 0.8
        }
      });
      expect(written.rows[1].verdict).toMatchObject({
        score: "error",
        rationale: "timeout: agent process exceeded its wall-clock budget",
        rubric: JUDGE_RUBRIC
      });
      expect(written.summary.overall).toMatchObject({ correct: 1, error: 1, total: 2 });
      expect(written.meta.judgeModel).toBe("stub-judge");
      expect(written.meta.judgeRubric).toBe(JUDGE_RUBRIC);
      expect(written.meta.judgeTiering).toMatchObject({
        stabilityRegisterStatus: "available",
        stabilityRegisterSha256: "a".repeat(64),
        stabilityRegisterGeneratedAt: "2026-08-27T00:00:00.000Z",
        stabilityRegisterSourceArtifactCount: 4,
        stabilityRegisterCaseCount: 2,
        selectedCaseCount: 2,
        maxPanelCases: 10,
        maxPanelCasesSource: "bounded-scaled-default",
        defaultPanelPolicy: {
          kind: "clamped-one-third",
          numerator: 1,
          denominator: 3,
          rounding: "ceil",
          floor: 10,
          ceiling: 34
        },
        boundaryEligibleCases: 0,
        panelUsedCases: 0,
        panelSkippedCases: 0,
        boundaryPanelCases: 0
      });
      expect(written.meta.totalJudgeCostUsd).toBeCloseTo(0.25);
      expect(written.meta.totalCostUsd).toBeCloseTo(0.6 + 0.25);
      expect(written.meta).toMatchObject({
        strictCorrectShare: 0.5,
        halfCreditShare: 0.5,
        coreAnswerCorrectShare: 1,
        gradedCoreAnswerNullCount: 0,
        coreAnswerVerdictCount: 1
      });
      // The retired key-fact coverage share is never stamped again.
      expect(written.meta).not.toHaveProperty("meanContinuousCoverage");
      expect(written.meta).not.toHaveProperty("continuousCoverageRowCount");
      // judgedIds is spend provenance: only rows that actually reached a paid
      // judge belong in it. The empty-answer row is stamped without a call.
      expect(written.meta.judgeStored).toMatchObject({
        judgedIds: ["q-fixture-answered"],
        toolVersion: "run-qa/judge-stored-v3"
      });
      expect(typeof written.meta.judgeStored.sourceResultsSha256).toBe("string");
      expect(written.meta.costAccounting).toEqual({
        expectedAgentCalls: 2,
        reportedAgentCosts: 2,
        missingAgentCosts: 0,
        expectedJudgeCalls: 1,
        reportedJudgeCosts: 1,
        missingJudgeCosts: 0,
        complete: true
      });
      expect(logs.some((line) => line.includes("answer costs 2/2"))).toBe(true);
      expect(logs.some((line) => line.includes("judge costs 1/1"))).toBe(true);
      expect(logs.some((line) => line.includes("cost completeness complete"))).toBe(true);

      // Fully judged file → nothing to do, loudly.
      await expect(
        judgeStoredResults(resultsPath, {
          judgeModel: "stub-judge",
          judge: stubJudge(),
          stabilityRegister,
          log: () => {}
        })
      ).rejects.toThrow(/nothing to judge/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("persists consistency errors without counting the raw judge score as wrong", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-"));
    try {
      const { resultsPath } = writeFixture(root);
      await judgeStoredResults(resultsPath, {
        judgeModel: "stub-judge",
        judge: async () => ({
          score: "error",
          judgeScore: "wrong",
          coreAnswer: "correct",
          missingFacts: ["One detail is missing."],
          wrongClaims: [],
          avoidMatches: [],
          rationale: "The core answer is correct.",
          consistencyViolations: ["omission-only-wrong"],
          costUsd: 0.25,
          rubric: JUDGE_RUBRIC,
          packVersion: PACK_VERSION,
          promptSha256: "1".repeat(64)
        }),
        log: () => {}
      });

      const written = JSON.parse(readFileSync(resultsPath, "utf8"));
      expect(written.rows[0].verdict).toMatchObject({
        score: "error",
        judgeScore: "wrong",
        consistencyViolations: ["omission-only-wrong"],
        costUsd: 0.25
      });
      expect(written.summary.overall).toMatchObject({ wrong: 0, error: 2, total: 2 });

      const repeatCalls = [];
      await expect(
        judgeStoredResults(resultsPath, {
          judgeModel: "stub-judge",
          judge: stubJudge(repeatCalls),
          log: () => {}
        })
      ).rejects.toThrow(/nothing to judge/);
      expect(repeatCalls).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("does not spend on a nonempty API-error answer", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-"));
    try {
      const { resultsPath } = writeFixture(root);
      const results = JSON.parse(readFileSync(resultsPath, "utf8"));
      results.rows[1].answer = "API Error: connection closed";
      results.rows[1].agent.failure = {
        class: "transport",
        reason: "provider transport error",
        retryable: true,
        messageExcerpt: "API Error: connection closed",
        subtype: "success",
        exitStatus: 0,
        signal: null
      };
      writeFileSync(resultsPath, JSON.stringify(results, null, 2));

      const calls = [];
      await judgeStoredResults(resultsPath, {
        judgeModel: "stub-judge",
        judge: stubJudge(calls),
        log: () => {}
      });

      const written = JSON.parse(readFileSync(resultsPath, "utf8"));
      expect(calls.map((call) => call.id)).toEqual(["q-fixture-answered"]);
      expect(written.rows[1].verdict).toMatchObject({
        score: "error",
        rationale: "transport: provider transport error"
      });
      expect(written.meta.totalJudgeCostUsd).toBeCloseTo(0.25);
      expect(written.meta.judgeStored.judgedIds).toEqual(["q-fixture-answered"]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("re-attempts judge-side error verdicts on answered rows, but not empty-answer errors", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-"));
    try {
      const { resultsPath } = writeFixture(root);
      const results = JSON.parse(readFileSync(resultsPath, "utf8"));
      // Simulate a completed judge phase where the answered row's judge CLI
      // failed (score error despite an answer) — must be re-attemptable.
      results.meta.judgeModel = "stub-judge";
      results.meta.judgeRubric = JUDGE_RUBRIC;
      results.rows[0].verdict = { score: "error", failureClass: "cli", missingFacts: [], wrongClaims: [], rationale: "judge CLI failed: exit 1", costUsd: 0.4, rubric: JUDGE_RUBRIC, packVersion: PACK_VERSION, promptSha256: null };
      results.rows[1].verdict = { score: "error", missingFacts: [], wrongClaims: [], rationale: "timeout: agent process exceeded its wall-clock budget", rubric: JUDGE_RUBRIC, packVersion: PACK_VERSION, promptSha256: null };
      writeFileSync(resultsPath, JSON.stringify(results, null, 2));

      const calls = [];
      const out = await judgeStoredResults(resultsPath, { judgeModel: "stub-judge", judge: stubJudge(calls), log: () => {} });
      // Only the answered row is re-judged; the empty-answer error is a
      // collection fact and stays untouched.
      expect(calls.map((c) => c.id)).toEqual(["q-fixture-answered"]);
      expect(out.judgedCount).toBe(1);
      const written = JSON.parse(readFileSync(resultsPath, "utf8"));
      expect(written.rows[0].verdict.score).toBe("error");
      expect(written.rows[0].attempts.judge).toHaveLength(2);
      expect(written.rows[0].attempts.judge[1].verdict.score).toBe("correct");
      expect(written.rows[1].verdict.rationale).toBe("timeout: agent process exceeded its wall-clock budget");
      expect(written.meta.totalJudgeCostUsd).toBeCloseTo(0.65);
      expect(written.meta.costAccounting).toMatchObject({
        expectedJudgeCalls: 2,
        reportedJudgeCosts: 2,
        missingJudgeCosts: 0
      });
      expect(written.meta.judgeStored.attempts).toHaveLength(2);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("keeps an untyped legacy judge error terminal on the stored runner path", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-legacy-error-"));
    try {
      const legacy = answeredRow(CASES[0], "Run `stellar contract build`.", {
        score: "error",
        rationale: "judge CLI failed: exit 1",
        costUsd: 0.25,
        rubric: JUDGE_RUBRIC,
        packVersion: PACK_VERSION,
        promptSha256: "2".repeat(64)
      });
      const { resultsPath } = writeFixture(root, { rows: [legacy] });
      const calls = [];
      await judgeStoredResults(resultsPath, {
        judgeModel: "stub-judge",
        maxBudgetUsd: 1,
        judge: stubJudge(calls),
        log: () => {}
      });

      const written = JSON.parse(readFileSync(resultsPath, "utf8"));
      expect(calls).toEqual([]);
      expect(written.rows[0].attempts.judge).toHaveLength(1);
      expect(written.rows[0].attempts.judge[0].failureClass).toBeNull();
      expect(written.rows[0].verdict.rationale).toContain("judge CLI failed");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("records expected, reported, and missing cost counts instead of scoring a missing cost as zero", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-"));
    try {
      const { resultsPath } = writeFixture(root);
      // Two answered rows, and the judge omits costUsd on the second — exactly
      // what judge.mjs does when the provider returns no cost. Summing with
      // `?? 0` would report the same total as a genuinely free call.
      const seeded = JSON.parse(readFileSync(resultsPath, "utf8"));
      seeded.rows[1].answer = "SEP-10 is the web authentication SEP.";
      seeded.rows[1].agent.failure = null;
      writeFileSync(resultsPath, JSON.stringify(seeded, null, 2));

      let call = 0;
      const partialCostJudge = async () => {
        call += 1;
        const verdict = { ...stubVerdict };
        if (call === 2) delete verdict.costUsd;
        return verdict;
      };
      await expect(judgeStoredResults(resultsPath, {
        judgeModel: "stub-judge",
        maxBudgetUsd: 1,
        judge: partialCostJudge,
        log: () => {}
      })).rejects.toThrow(/did not report costUsd/);

      const written = JSON.parse(readFileSync(resultsPath, "utf8"));
      expect(written.meta.costAccounting).toEqual({
        expectedAgentCalls: 2,
        reportedAgentCosts: 2,
        missingAgentCosts: 0,
        expectedJudgeCalls: 2,
        reportedJudgeCosts: 1,
        missingJudgeCosts: 1,
        complete: false
      });
      // The totals cover only what was actually reported, and say so.
      expect(written.meta.totalJudgeCostUsd).toBe(0.25);
      expect(written.meta.totalAgentCostUsd).toBe(0.6);
      expect(written.meta.totalCostUsd).toBe(0.85);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("does not spend on a nonzero-exit row even when its answer looks complete", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-"));
    try {
      const { resultsPath } = writeFixture(root);
      const results = JSON.parse(readFileSync(resultsPath, "utf8"));
      // A complete-looking answer plus a nonzero exit: the parser now classifies
      // it, and the judge gate must honour that classification.
      results.rows[1].answer = "SEP-10 is the web authentication SEP, with full detail.";
      results.rows[1].agent.failure = {
        class: "unclassified",
        reason: "agent process exited with status 1 despite a clean result message",
        retryable: false,
        messageExcerpt: null,
        subtype: "success",
        exitStatus: 1,
        signal: null
      };
      writeFileSync(resultsPath, JSON.stringify(results, null, 2));

      const calls = [];
      await judgeStoredResults(resultsPath, { judgeModel: "stub-judge", judge: stubJudge(calls), log: () => {} });

      const written = JSON.parse(readFileSync(resultsPath, "utf8"));
      expect(calls.map((call) => call.id)).toEqual(["q-fixture-answered"]);
      expect(written.rows[1].verdict).toMatchObject({
        score: "error",
        rationale: "unclassified: agent process exited with status 1 despite a clean result message"
      });
      expect(written.meta.judgeStored.judgedIds).toEqual(["q-fixture-answered"]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("refuses a results file collected under a different agent-result schema", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-"));
    try {
      const { resultsPath } = writeFixture(root);
      const results = JSON.parse(readFileSync(resultsPath, "utf8"));
      // Pre-parser artifacts carried `agent.error` strings and no schema
      // stamp; judging one now would silently read a failed row as answered.
      delete results.meta.resultsSchema;
      writeFileSync(resultsPath, JSON.stringify(results, null, 2));
      await expect(
        judgeStoredResults(resultsPath, { judge: stubJudge(), log: () => {} })
      ).rejects.toThrow(/agent-result schema/);

      results.meta.resultsSchema = "qa-agent-result-v0";
      writeFileSync(resultsPath, JSON.stringify(results, null, 2));
      await expect(
        judgeStoredResults(resultsPath, { judge: stubJudge(), log: () => {} })
      ).rejects.toThrow(/agent-result schema/);

      results.meta.resultsSchema = "qa-agent-result-v3";
      writeFileSync(resultsPath, JSON.stringify(results, null, 2));
      await expect(
        judgeStoredResults(resultsPath, { judge: stubJudge(), log: () => {} })
      ).rejects.toThrow(/agent-result schema/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("stores one error verdict for a provider safeguard and never sends it to the judge", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-"));
    try {
      const { resultsPath } = writeFixture(root);
      const results = JSON.parse(readFileSync(resultsPath, "utf8"));
      // The parser blanks the provider notice, so the row is answer-less AND
      // classified — both facts must survive into the stored verdict.
      results.rows[1].agent.failure = {
        class: "provider-safeguard",
        reason: "provider safeguard blocked the request before any MCP call",
        retryable: false,
        messageExcerpt: "API Error: safeguards flagged this message",
        subtype: "success",
        exitStatus: 0,
        signal: null
      };
      writeFileSync(resultsPath, JSON.stringify(results, null, 2));

      const calls = [];
      await judgeStoredResults(resultsPath, { judgeModel: "stub-judge", judge: stubJudge(calls), log: () => {} });

      const written = JSON.parse(readFileSync(resultsPath, "utf8"));
      expect(calls.map((call) => call.id)).toEqual(["q-fixture-answered"]);
      expect(written.rows[1].verdict).toMatchObject({
        score: "error",
        rationale: "provider-safeguard: provider safeguard blocked the request before any MCP call"
      });
      expect(written.summary.overall).toMatchObject({ error: 1, total: 2 });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("refuses a drifted case snapshot", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-"));
    try {
      const { casesPath, resultsPath } = writeFixture(root);
      const drifted = JSON.parse(readFileSync(casesPath, "utf8"));
      drifted.cases[0].golden.answer = "edited after collection";
      writeFileSync(casesPath, JSON.stringify(drifted, null, 2));
      await expect(
        judgeStoredResults(resultsPath, { judge: stubJudge(), log: () => {} })
      ).rejects.toThrow(/case input snapshot differs/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("refuses to mix judge models and to cross rubric/pack versions", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-"));
    try {
      const { resultsPath } = writeFixture(root);
      const results = JSON.parse(readFileSync(resultsPath, "utf8"));
      results.meta.judgeModel = "some-other-judge";
      writeFileSync(resultsPath, JSON.stringify(results, null, 2));
      await expect(
        judgeStoredResults(resultsPath, { judgeModel: "stub-judge", judge: stubJudge(), log: () => {} })
      ).rejects.toThrow(/refusing to mix/);

      results.meta.judgeModel = null;
      results.meta.packVersion = "pack-v0-ancient";
      writeFileSync(resultsPath, JSON.stringify(results, null, 2));
      await expect(
        judgeStoredResults(resultsPath, { judge: stubJudge(), log: () => {} })
      ).rejects.toThrow(/evidence pack/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("treats an absent stored judge panel as a single-call panel", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-"));
    try {
      const { resultsPath } = writeFixture(root);
      const results = JSON.parse(readFileSync(resultsPath, "utf8"));
      results.meta.judgeModel = "stub-judge";
      results.meta.judgeRubric = JUDGE_RUBRIC;
      results.rows[0].verdict = { ...stubVerdict };
      writeFileSync(resultsPath, JSON.stringify(results, null, 2));

      await expect(
        judgeStoredResults(resultsPath, {
          judgeModel: "stub-judge",
          judgePanel: 2,
          judge: stubJudge(),
          log: () => {}
        })
      ).rejects.toThrow(/panel size 1; refusing to mix in 2/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("refuses a null recorded pack when the builder now emits one, and a missing evidencePack", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-"));
    try {
      const { casesPath, resultsPath } = writeFixture(root);
      // Flip the answered row's case to a freshness the pack builder serves, so
      // the rebuilt pack is non-empty against the recorded sha256:null. A
      // truthiness guard skipped exactly this class (14 of 30 rows in the
      // 2026-07-28 artifact of record).
      const cases = JSON.parse(readFileSync(casesPath, "utf8"));
      cases.cases[0].tags.freshness = "live";
      writeFileSync(casesPath, JSON.stringify(cases, null, 2));
      const results = JSON.parse(readFileSync(resultsPath, "utf8"));
      results.rows[0].transcript = [
        {
          toolUseId: "t1",
          tool: "mcp__raven__execute",
          input: '{"code":"async () => 1"}',
          result: '{"ok":true,"data":{"items":[{"title":"T","url":"https://e.test","date":"2026-07-01","summary":"s"}]}}',
          resultChars: 100,
          isError: false
        }
      ];
      // Keep the snapshot guard satisfied: it hashes the selected cases.
      results.meta.inputSnapshot.casesSha256 = sha256(
        JSON.stringify(results.rows.map((row) => cases.cases.find((c) => c.id === row.id)))
      );
      writeFileSync(resultsPath, JSON.stringify(results, null, 2));
      await expect(
        judgeStoredResults(resultsPath, { judge: stubJudge(), log: () => {} })
      ).rejects.toThrow(/no longer reproduces/);

      // An absent evidencePack must not pass either.
      const noPack = JSON.parse(readFileSync(resultsPath, "utf8"));
      delete noPack.rows[0].evidencePack;
      writeFileSync(resultsPath, JSON.stringify(noPack, null, 2));
      await expect(
        judgeStoredResults(resultsPath, { judge: stubJudge(), log: () => {} })
      ).rejects.toThrow(/no longer reproduces/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("keeps paid verdicts + judge tuple on disk when the judge throws mid-run, then resumes and finalizes", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-"));
    try {
      const { resultsPath } = writeFixture(root);
      // Two answered rows so row 1 is paid before row 2 fails.
      const seeded = JSON.parse(readFileSync(resultsPath, "utf8"));
      seeded.rows[1].answer = "SEP-10 is the web authentication SEP.";
      seeded.rows[1].agent.failure = null;
      writeFileSync(resultsPath, JSON.stringify(seeded, null, 2));

      let calls = 0;
      const flaky = async () => {
        calls += 1;
        if (calls === 2) throw new Error("judge exploded");
        return { ...stubVerdict };
      };
      await expect(
        judgeStoredResults(resultsPath, { judgeModel: "stub-judge", judge: flaky, log: () => {} })
      ).rejects.toThrow(/judge exploded/);

      const afterCrash = JSON.parse(readFileSync(resultsPath, "utf8"));
      expect(afterCrash.rows[0].verdict.score).toBe("correct");
      expect(afterCrash.rows[1].verdict).toBeFalsy();
      expect(afterCrash.meta.judgeModel).toBe("stub-judge");
      expect(afterCrash.meta.totalJudgeCostUsd).toBeCloseTo(0.25);
      expect(afterCrash.meta.aggregatesSuppressed).toBe(true);
      expect(afterCrash.meta.judgingCompleteness.aggregatesAllowed).toBe(false);
      expect(afterCrash.meta).not.toHaveProperty("halfCreditShare");
      expect(afterCrash.meta).not.toHaveProperty("strictCorrectShare");
      expect(afterCrash.meta).not.toHaveProperty("coreAnswerCorrectShare");
      // Only the row that actually reached a paid judge is recorded.
      expect(afterCrash.meta.judgeStored.judgedIds).toEqual(["q-fixture-answered"]);
      const originalHash = afterCrash.meta.judgeStored.sourceResultsSha256;

      const resumed = await judgeStoredResults(resultsPath, {
        judgeModel: "stub-judge",
        judge: stubJudge(),
        log: () => {}
      });
      expect(resumed.judgedCount).toBe(1);
      const final = JSON.parse(readFileSync(resultsPath, "utf8"));
      expect(final.rows[1].verdict.score).toBe("correct");
      expect(final.summary.overall).toMatchObject({ correct: 2, total: 2 });
      // Provenance survives the resume: original collection hash kept, ids merged.
      expect(final.meta.judgeStored.sourceResultsSha256).toBe(originalHash);
      expect(final.meta.judgeStored.judgedIds).toEqual(["q-fixture-answered", "q-fixture-empty"]);
      expect(readdirSync(root).some((name) => name.endsWith(".tmp"))).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("persists the judge tuple before the first judge call", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-"));
    try {
      const { resultsPath } = writeFixture(root);
      let observed;
      const inspectingJudge = async () => {
        observed = JSON.parse(readFileSync(resultsPath, "utf8")).meta;
        return { ...stubVerdict };
      };

      await judgeStoredResults(resultsPath, {
        judgeModel: "stub-judge",
        judge: inspectingJudge,
        log: () => {}
      });

      expect(observed).toMatchObject({
        judgeModel: "stub-judge",
        judgeRubric: JUDGE_RUBRIC,
        judgeStored: {
          toolVersion: "run-qa/judge-stored-v3",
          attempts: []
        }
      });
      expect(observed.judgeStored.sourceResultsSha256).toHaveLength(64);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("finalizes an interrupted artifact instead of refusing when nothing is left to judge", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-"));
    try {
      const { resultsPath } = writeFixture(root);
      // Every row judged but the run died before stamping summary/provenance.
      const stuck = JSON.parse(readFileSync(resultsPath, "utf8"));
      stuck.meta.judgeModel = "stub-judge";
      stuck.meta.judgeRubric = JUDGE_RUBRIC;
      stuck.rows[0].verdict = { ...stubVerdict };
      stuck.rows[1].verdict = { ...stubVerdict, costUsd: 0 };
      stuck.summary = null;
      writeFileSync(resultsPath, JSON.stringify(stuck, null, 2));

      const out = await judgeStoredResults(resultsPath, {
        judgeModel: "stub-judge",
        judge: stubJudge(),
        log: () => {}
      });
      expect(out.judgedCount).toBe(0);
      const final = JSON.parse(readFileSync(resultsPath, "utf8"));
      expect(final.summary.overall.total).toBe(2);
      expect(final.meta.judgeStored.toolVersion).toBe("run-qa/judge-stored-v3");

      // Now that it IS finalized, a further call refuses.
      await expect(
        judgeStoredResults(resultsPath, { judgeModel: "stub-judge", judge: stubJudge(), log: () => {} })
      ).rejects.toThrow(/nothing to judge/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("hashes every QA implementation input in the source identity", () => {
    const identity = sourceIdentity(null);
    const qaImplementationRecords = readdirSync("eval/qa")
      .filter((name) => name.endsWith(".mjs"))
      .map((name) => ({ label: name, filePath: join("eval/qa", name) }))
      .concat(
        readdirSync("eval/lib")
          .filter((name) => name.endsWith(".mjs"))
          .map((name) => ({ label: `../lib/${name}`, filePath: join("eval/lib", name) }))
      )
      .sort((a, b) => a.label.localeCompare(b.label))
      .map(({ label, filePath }) => `${label}\0${sha256(readFileSync(filePath, "utf8"))}`)
      .join("\n");
    expect(identity).toMatchObject({
      runnerFileSha256: sha256(readFileSync("eval/qa/run-qa.mjs", "utf8")),
      agentResultFileSha256: sha256(readFileSync("eval/qa/agent-result.mjs", "utf8")),
      evidencePackFileSha256: sha256(readFileSync("eval/qa/evidence-pack.mjs", "utf8")),
      judgeFileSha256: sha256(readFileSync("eval/qa/judge.mjs", "utf8")),
      qaImplementationSha256: sha256(qaImplementationRecords)
    });
  });

  it("stops stored judging at the total cap and preserves unattempted IDs", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-budget-"));
    try {
      const rows = [
        answeredRow(CASES[0], "Run `stellar contract build`.", null),
        answeredRow(CASES[1], "SEP-10 is web authentication.", null)
      ];
      const { resultsPath } = writeFixture(root, { rows });
      const calls = [];
      const logs = [];
      const out = await judgeStoredResults(resultsPath, {
        judgeModel: "stub-judge",
        maxBudgetUsd: 0.25,
        judge: async (input, options) => {
          calls.push({ id: input.id, maxBudgetUsd: options.maxBudgetUsd });
          return { ...stubVerdict, costUsd: 0.25 };
        },
        log: (line) => logs.push(line)
      });

      expect(out.judgedCount).toBe(1);
      expect(calls).toEqual([{ id: "q-fixture-answered", maxBudgetUsd: 0.25 }]);
      const written = JSON.parse(readFileSync(resultsPath, "utf8"));
      expect(written.meta.budget).toMatchObject({
        claimed: true,
        reportedSpendUsd: 0.25,
        remainingUsd: 0,
        exhausted: true,
        stoppedBefore: { method: "judge", id: "q-fixture-empty" }
      });
      expect(written.meta.judgeStored.unattemptedIds).toEqual(["q-fixture-empty"]);
      expect(written.rows[0].attempts.judge).toHaveLength(1);
      expect(written.rows[1].attempts.judge).toHaveLength(0);
      expect(written.summary).toBeNull();
      expect(written.meta.tracks.t4.judging.attempted).toMatchObject({ count: 1, denominator: 2 });
      expect(written.meta.tracks.t4.judging.unattempted).toMatchObject({
        count: 1,
        denominator: 2,
        ids: ["q-fixture-empty"]
      });
      expect(logs.some((line) => line.includes(
        "judging unattempted 1/2 IDs: q-fixture-empty"
      ))).toBe(true);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("keeps earlier spend when a stored resume raises the total cap", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-budget-resume-"));
    try {
      const rows = [
        answeredRow(CASES[0], "Run `stellar contract build`.", null),
        answeredRow(CASES[1], "SEP-10 is web authentication.", null)
      ];
      const { resultsPath } = writeFixture(root, { rows });
      await judgeStoredResults(resultsPath, {
        judgeModel: "stub-judge",
        maxBudgetUsd: 0.25,
        judge: async () => ({ ...stubVerdict, costUsd: 0.25 }),
        log: () => {}
      });

      const resumedCalls = [];
      await judgeStoredResults(resultsPath, {
        judgeModel: "stub-judge",
        maxBudgetUsd: 0.5,
        judge: async (input, options) => {
          resumedCalls.push({ id: input.id, maxBudgetUsd: options.maxBudgetUsd });
          return { ...stubVerdict, costUsd: 0.25 };
        },
        log: () => {}
      });

      expect(resumedCalls).toEqual([{ id: "q-fixture-empty", maxBudgetUsd: 0.25 }]);
      const written = JSON.parse(readFileSync(resultsPath, "utf8"));
      expect(written.meta.budget).toMatchObject({
        authorizedUsd: 0.5,
        reportedSpendUsd: 0.5,
        remainingUsd: 0,
        expectedCalls: 2,
        reportedCalls: 2
      });
      expect(written.meta.judgeStored.unattemptedIds).toEqual([]);
      expect(written.rows.map((row) => row.attempts.judge.length)).toEqual([1, 1]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects a missing stored-judge cost when a budget is claimed", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-budget-cost-"));
    try {
      const { resultsPath } = writeFixture(root);
      const seeded = JSON.parse(readFileSync(resultsPath, "utf8"));
      seeded.rows[1].answer = "SEP-10 is web authentication.";
      seeded.rows[1].agent.failure = null;
      writeFileSync(resultsPath, JSON.stringify(seeded, null, 2));
      await expect(
        judgeStoredResults(resultsPath, {
          judgeModel: "stub-judge",
          maxBudgetUsd: 1,
          judge: async () => {
            const verdict = { ...stubVerdict };
            delete verdict.costUsd;
            return verdict;
          },
          log: () => {}
        })
      ).rejects.toThrow(/did not report costUsd/);

      const written = JSON.parse(readFileSync(resultsPath, "utf8"));
      expect(written.rows[0].attempts.judge[0]).toMatchObject({
        failureClass: "budget-cost",
        costUsd: null
      });
      expect(written.meta.budget).toMatchObject({
        claimed: true,
        expectedCalls: 1,
        reportedCalls: 0,
        missingCosts: 1
      });
      expect(written.meta.judgeStored.incompleteIds).toEqual(["q-fixture-answered"]);
      expect(written.meta.judgeStored.unattemptedIds).toEqual(["q-fixture-empty"]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("checkpoints a stored-judge authorization overspend before later IDs", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-budget-overspend-"));
    try {
      const { resultsPath } = writeFixture(root);
      const seeded = JSON.parse(readFileSync(resultsPath, "utf8"));
      seeded.rows[1].answer = "SEP-10 is web authentication.";
      seeded.rows[1].agent.failure = null;
      writeFileSync(resultsPath, JSON.stringify(seeded, null, 2));

      await expect(judgeStoredResults(resultsPath, {
        judgeModel: "stub-judge",
        maxBudgetUsd: 1,
        judge: async () => ({ ...stubVerdict, costUsd: 2 }),
        log: () => {}
      })).rejects.toThrow(/above its \$1 authorization/);

      const written = JSON.parse(readFileSync(resultsPath, "utf8"));
      expect(written.rows[0].attempts.judge[0]).toMatchObject({
        failureClass: "budget-cost",
        costUsd: 2
      });
      expect(written.meta.judgeStored.incompleteIds).toEqual(["q-fixture-answered"]);
      expect(written.meta.judgeStored.unattemptedIds).toEqual(["q-fixture-empty"]);
      expect(written.meta.budget).toMatchObject({ reportedSpendUsd: 2, remainingUsd: 0 });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("refuses when a row's evidence pack no longer reproduces its recorded hash", async () => {
    const root = mkdtempSync(join(tmpdir(), "qa-judge-stored-"));
    try {
      const { resultsPath } = writeFixture(root);
      const results = JSON.parse(readFileSync(resultsPath, "utf8"));
      results.rows[0].evidencePack.sha256 = "f".repeat(64);
      writeFileSync(resultsPath, JSON.stringify(results, null, 2));
      await expect(
        judgeStoredResults(resultsPath, { judge: stubJudge(), log: () => {} })
      ).rejects.toThrow(/no longer reproduces/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
