import { describe, expect, it } from "vitest";
import { buildPlaygroundArtifactMeta, sha256Json, treeGenerationSha256, assertNotPlaygroundQuarantine } from "../eval/playground/artifact-contract.mjs";
import { diagnosticRejudgeSource } from "../eval/qa/diagnostic-rejudge-source.mjs";
import { buildRejudgeArtifact, parseArgs, rejudgeRows } from "../eval/qa/re-judge.mjs";
import { createSpendLedger } from "../eval/qa/spend-budget.mjs";

const hash = "a".repeat(64);
const cases = [{ id: "valid-answer-judge-error", question: "Question", golden: { answer: "Answer", keyFacts: [], avoid: [] }, tags: { freshness: "stable" } }];
function fixture() {
  const tree = { headRevision: "a".repeat(40), dirty: false, statusSha256: hash, trackedDiffSha256: hash, untrackedFilesSha256: hash };
  tree.generationSha256 = treeGenerationSha256(tree);
  const meta = buildPlaygroundArtifactMeta({
    run: { casesPath: "eval/qa/cases.json", finishedAt: "2026-11-06T00:00:00Z" },
    answering: {
      primaryModel: "openai/gpt-6-luna", fallbackModels: [], models: [{ model: "openai/gpt-6-luna", role: "primary" }],
      apiMode: { requested: "responses", effective: "responses" }, reasoningEffort: { value: "low", source: "explicit" },
      temperature: 0.1, configurationBasis: "fixture", runtimeIntrospection: "gateway-log", observedAttemptedModels: ["openai/gpt-6-luna"], proofLimit: "fixture"
    },
    judge: { enabled: true, model: "claude-sonnet-5", rubric: "v2.11", packVersion: "p9", temperature: { value: null, semantics: "provider-default-unpinned" } },
    capContext: {
      demo: Object.fromEntries(["maxSteps", "maxOutputTokens", "maxHistoryMessages", "maxHistoryChars", "maxSearchLimit", "maxSearchCallsPerTurn", "maxExecuteCallsPerTurn", "maxExecuteCodeChars", "maxUserMessageChars", "chatsPerHour"].map((key) => [key, 10])),
      evaluator: { timeoutMs: 1000, maxCasesPerRunSubject: 1, selectedCases: 1, answerCallsThisRun: 1, judgeCallsThisRun: 1, maxBudgetUsd: 1 },
      roundAuthorization: {
        contract: "playground-semantic-round-cap/v1", experimentId: "test", kind: "not-applicable", reason: "offline test", sourceFile: { path: "/fixture", sha256: hash }, runAllocation: null,
        ...Object.fromEntries(["plannedAnswerCalls", "absoluteAnswerCallCap", "answerCallsConsumedBeforeRun", "plannedJudgeCalls", "absoluteJudgeCallCap", "judgeCallsConsumedBeforeRun", "infraRetryReserve", "infraRetryConsumedBeforeRun", "savedAnswerRejudgeReserve", "savedAnswerRejudgesConsumedBeforeRun"].map((key) => [key, null]))
      }
    },
    inputFiles: Object.fromEntries(["corpusFileSha256", "manifestFileSha256", "superSpecFileSha256", "runnerFileSha256", "modelConfigFileSha256", "judgeFileSha256", "evidencePackFileSha256"].map((key) => [key, hash])),
    selectedCases: cases, tree,
    server: { endpoint: "http://localhost:8787/playground/chat", generationBasis: "operator-asserted-local-working-tree", generationSha256: tree.generationSha256, operatorAssertionSha256: tree.generationSha256, runtimeIntrospection: "not-available", proofLimit: "fixture" }
  });
  const id = cases[0].id;
  return {
    meta, nonPromotable: true, summary: null,
    budget: {
      status: "incomplete", error: null, claimed: true, authorizedUsd: 1, reportedSpendUsd: 0.2, remainingUsd: 0.8,
      missingCosts: 0, expectedCalls: 2, reportedCalls: 2, exhausted: false, stoppedBefore: null,
      selectedCaseIds: [id], incompleteCaseIds: [id], unattemptedCaseIds: [],
      calls: [{ id, method: "answer", costUsd: 0.1 }, { id, method: "judge", costUsd: 0.1 }]
    },
    rows: [{ id, answer: "A valid saved answer", costUsd: 0.1, answerCost: { calls: 1, models: ["openai/gpt-6-luna"], error: null }, transcript: [], finishReason: "stop", sseErrors: [], verdict: { score: "error", coreAnswer: null, costUsd: 0.1, promptSha256: hash } }]
  };
}

describe("diagnostic re-judge admission", () => {
  it("admits judge-error rows without mutating source or making them promotable", async () => {
    const source = fixture();
    const original = JSON.stringify(source);
    expect(() => assertNotPlaygroundQuarantine(source)).toThrow(/non-promotable/);
    const diagnostic = diagnosticRejudgeSource(source);
    expect(diagnostic.judgeErrorIds).toEqual([cases[0].id]);
    const calls = [];
    const rows = await rejudgeRows({ selectedRows: source.rows, caseById: new Map(cases.map((kase) => [kase.id, kase])), judgeModel: "fixture", judge: async (input) => { calls.push(input); return { score: "correct", costUsd: 0.1 }; }, checkpoint() {}, log() {} });
    expect(calls).toHaveLength(1);
    expect(rows[0].agreement).toBeNull();
    const artifact = buildRejudgeArtifact({ baseMeta: { diagnosticSource: diagnostic }, rows, spendLedger: createSpendLedger(1), runState: {} });
    expect(artifact).toMatchObject({ nonPromotable: true, summary: null, meta: { diagnosticSource: { sourceNonPromotable: true, sourceBudget: { status: "incomplete" } } } });
    expect(JSON.stringify(source)).toBe(original);
  });

  it.each([
    ["quarantine", (s) => { s.quarantinedMeta = s.meta; }],
    ["identity drift", (s) => { s.meta.comparable = false; }],
    ["invalid generation", (s) => { s.meta.server.generationSha256 = "b".repeat(64); }],
    ["cost missing", (s) => { s.budget.calls[0].costUsd = null; }],
    ["reported missing cost", (s) => { s.budget.missingCosts = 1; }],
    ["accounting error", (s) => { s.budget.error = "budget-cost"; }],
    ["wrong sum", (s) => { s.budget.reportedSpendUsd = 0; }],
    ["partial selection", (s) => { s.budget.selectedCaseIds.push("missing"); }],
    ["unattempted", (s) => { s.budget.unattemptedCaseIds.push("missing"); }],
    ["model mismatch", (s) => { s.rows[0].answerCost.models = ["other"]; }],
    ["model absent", (s) => { s.rows[0].answerCost.models = []; }],
    ["legacy agent failure", (s) => { s.rows[0].verdict.promptSha256 = null; }],
    ["erased error IDs", (s) => { s.budget.incompleteCaseIds = []; }],
    ["edited nonpromotable", (s) => { s.nonPromotable = false; }],
    ["cost reassigned", (s) => { s.budget.calls[1].id = "another"; }],
    ["unsupported schema", (s) => { s.meta.artifactContract = "playground-semantic-result/v2"; }]
  ])("rejects %s", (_, mutate) => {
    const source = fixture(); mutate(source);
    expect(() => diagnosticRejudgeSource(source)).toThrow();
  });

  it("requires explicit IDs and leaves ordinary CLI defaults alone", () => {
    expect(parseArgs(["source.json", "--ids", "a", "--diagnostic-source", "--dry-run"]).diagnosticSource).toBe(true);
    expect(parseArgs(["source.json", "--ids", "a", "--dry-run"]).diagnosticSource).toBe(false);
    expect(() => parseArgs(["source.json", "--flips-vs", "baseline.json", "--diagnostic-source", "--dry-run"])).toThrow(/explicit --ids/);
  });

  it.each(["length", "incomplete", "abort", "provider-error", "provider-refusal", "tool-budget"])("preserves settled %s cells beside gradeable rows", async (terminal) => {
    const source = fixture();
    const failed = { ...structuredClone(source.rows[0]), id: "failed-cell", answer: "", finishReason: terminal, verdict: { score: "error", promptSha256: null } };
    source.rows.push(failed);
    source.meta.inputSnapshot.caseIdsSha256 = sha256Json(source.rows.map((row) => row.id));
    source.budget.selectedCaseIds.push(failed.id);
    source.budget.incompleteCaseIds.push(failed.id);
    source.budget.calls.push({ id: failed.id, method: "answer", costUsd: 0.1 });
    Object.assign(source.budget, { expectedCalls: 3, reportedCalls: 3, reportedSpendUsd: 0.3, remainingUsd: 0.7 });
    const original = JSON.stringify(source);
    const diagnosticSource = diagnosticRejudgeSource(source);
    expect(diagnosticSource.ungradeableRows).toEqual([{ id: failed.id, reason: "empty-answer" }]);
    let calls = 0;
    const rows = await rejudgeRows({ selectedRows: source.rows, caseById: new Map([...cases, { ...cases[0], id: failed.id }].map((kase) => [kase.id, kase])), diagnosticSource, judgeModel: "fixture", judge: async () => { calls++; return { score: "correct", costUsd: 0.1 }; }, checkpoint() {}, log() {} });
    expect(calls).toBe(1);
    expect(rows).toHaveLength(2);
    expect(rows[1].skipped.reason).toBe("empty-answer");
    expect(rows[1].agreement).toBeNull();
    expect(JSON.stringify(source)).toBe(original);
  });

  it.each(["length", "provider-refusal", "tool-budget"])("skips an answer with %s terminal even when Judge A called it correct", async (terminal) => {
    const source = fixture(); source.rows[0].finishReason = terminal; source.rows[0].verdict.score = "correct";
    const diagnosticSource = diagnosticRejudgeSource(source);
    const rows = await rejudgeRows({ selectedRows: source.rows, caseById: new Map(cases.map((kase) => [kase.id, kase])), diagnosticSource, judgeModel: "fixture", judge: async () => { throw new Error("must not judge"); }, checkpoint() {}, log() {} });
    expect(rows[0].new.score).toBe("error"); expect(rows[0].original.score).toBe("correct");
  });
});
