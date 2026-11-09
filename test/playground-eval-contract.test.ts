import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as demoModelConfig from "../src/demo/model-config";
import type { DemoModelConfig } from "../src/demo/model-config";
// Plain Node evaluator module; exercised directly by Vitest without a build step.
// @ts-expect-error no declaration file is emitted for the local .mjs contract.
import * as artifactContract from "../eval/playground/artifact-contract.mjs";
// @ts-expect-error local executable module intentionally exposes a test seam.
import { answeringConfiguration, answeringWithObserved, orchestratePlaygroundRun } from "../scripts/run-playground-semantic-eval.mjs";

const {
  PLAYGROUND_ARTIFACT_CONTRACT,
  PLAYGROUND_QUARANTINE_CONTRACT,
  PLAYGROUND_INPUT_SNAPSHOT_CONTRACT,
  PLAYGROUND_ROUND_CAP_CONTRACT,
  assertCurrentPlaygroundContract,
  assertModelBackedRunInputs,
  assertNotPlaygroundQuarantine,
  assertPlaygroundArtifactMeta,
  assertQuarantineArtifact,
  buildQuarantineArtifact,
  buildPlaygroundArtifactMeta,
  deriveQuarantineState,
  sanitizeGenerationCheckError,
  sha256Json,
  treeGenerationSha256
} = artifactContract;

const sha = (character: string) => character.repeat(64);

function reviewedRound(overrides: Record<string, unknown> = {}) {
  return {
    contract: PLAYGROUND_ROUND_CAP_CONTRACT,
    experimentId: "reviewed-round-contract-test",
    kind: "reviewed-round",
    runAllocation: "planned",
    plannedAnswerCalls: 6,
    absoluteAnswerCallCap: 8,
    answerCallsConsumedBeforeRun: 2,
    plannedJudgeCalls: 6,
    absoluteJudgeCallCap: 8,
    judgeCallsConsumedBeforeRun: 2,
    infraRetryReserve: 2,
    infraRetryConsumedBeforeRun: 1,
    savedAnswerRejudgeReserve: 3,
    savedAnswerRejudgesConsumedBeforeRun: 1,
    ...overrides
  };
}

function fixtureMeta(roundAuthorization: any = reviewedRound(), shapeAnswering: (answering: any) => any = (answering) => answering) {
  const treeBase = {
    headRevision: "8e891fa6f9b913b723af897d1bf55bb2b5251c34",
    dirty: false,
    statusSha256: sha("a"),
    trackedDiffSha256: sha("b"),
    untrackedFilesSha256: sha("c")
  };
  const tree = { ...treeBase, generationSha256: treeGenerationSha256(treeBase) };
  return buildPlaygroundArtifactMeta({
    run: {
      runId: "fixture-run",
      endpoint: "http://localhost:8787/playground/chat",
      casesPath: "eval/qa/cases.json",
      caseContract: null,
      caseCount: 2,
      selection: { ids: "a,b" },
      startedAt: "2026-07-14T00:00:00.000Z",
      finishedAt: "2026-07-14T00:01:00.000Z"
    },
    answering: shapeAnswering({
      primaryModel: "openai/gpt-5.4",
      fallbackModels: ["openai/gpt-5.4-mini"],
      models: [
        { model: "openai/gpt-5.4", role: "primary" },
        { model: "openai/gpt-5.4-mini", role: "fallback" }
      ],
      fallbackPolicy: "fixture",
      apiMode: { requested: "responses", effective: "responses", source: "default", default: "responses" },
      reasoningEffort: { value: "none", source: "default", default: "none", invalidOverrideIgnored: false },
      temperature: 0.1,
      modelSource: "default",
      defaultModels: [],
      configurationBasis: "fixture config",
      runtimeIntrospection: "gateway-log",
      observedAttemptedModels: null,
      proofLimit: "fixture cannot introspect attempts"
    }),
    judge: {
      enabled: true,
      model: "claude-sonnet-5",
      rubric: "v2.4",
      packVersion: "p3",
      temperature: { value: null, semantics: "provider-default-unpinned" }
    },
    capContext: {
      demo: {
        maxSteps: 7,
        maxOutputTokens: 4096,
        maxHistoryMessages: 20,
        maxHistoryChars: 24000,
        maxSearchLimit: 6,
        maxSearchCallsPerTurn: 3,
        maxExecuteCallsPerTurn: 3,
        maxExecuteCodeChars: 8000,
        maxUserMessageChars: 8000,
        chatsPerHour: 30
      },
      evaluator: {
        timeoutMs: 150000,
        maxCasesPerRunSubject: 30,
        selectedCases: 2,
        answerCallsThisRun: 2,
        judgeCallsThisRun: 2,
        answerCallUnit: "one turn"
      },
      roundAuthorization: {
        ...roundAuthorization,
        sourceFile: { path: "/tmp/round-cap.json", sha256: sha("5") }
      }
    },
    inputFiles: {
      corpusFileSha256: sha("d"),
      manifestFileSha256: sha("e"),
      superSpecFileSha256: sha("f"),
      runnerFileSha256: sha("1"),
      modelConfigFileSha256: sha("2"),
      judgeFileSha256: sha("3"),
      evidencePackFileSha256: sha("4")
    },
    selectedCases: [{ id: "a" }, { id: "b" }],
    tree,
    server: {
      endpoint: "http://localhost:8787/playground/chat",
      generationBasis: "operator-asserted-local-working-tree",
      generationSha256: tree.generationSha256,
      operatorAssertionSha256: tree.generationSha256,
      runtimeIntrospection: "not-available",
      proofLimit: "operator assertion matched locally; Worker bytes were not introspected"
    }
  });
}

function fixtureQuarantine() {
  const meta = fixtureMeta();
  const treeAtStart = meta.inputSnapshot.tree;
  const treeAtDetection = {
    ...treeAtStart,
    headRevision: "9e891fa6f9b913b723af897d1bf55bb2b5251c34"
  };
  treeAtDetection.generationSha256 = treeGenerationSha256(treeAtDetection);
  return buildQuarantineArtifact({
    meta,
    rows: [{ id: "a", answer: "captured", verdict: null }],
    treeAtStart,
    treeAtFinish: treeAtDetection,
    reason: {
      code: "local-provenance-generation-mismatch",
      phase: "before-judge",
      caseId: "a",
      caseIndex: 0,
      detectedAt: "2026-07-14T00:00:30.000Z",
      message: "Local generation changed.",
      checkError: null
    },
    spend: {
      accountingPolicy: "started-calls-count-conservatively; quarantine releases no authorization or reserve",
      actual: {
        answerCallsStarted: 1,
        judgeCallsStarted: 0,
        reportedJudgeCalls: 0,
        reportedJudgeCostUsd: 0,
        answerProviderCostUsd: null,
        answerProviderCostSemantics: "not-emitted-by-playground-artifact",
        observedAttemptedModels: null
      },
      selectedCaseIds: ["a", "b"],
      caseIdsAttempted: ["a"],
      caseIdsJudged: [],
      infraRetryAuthorized: false
    }
  });
}

describe("playground answering receipt configuration", () => {
  const mixedTuple: readonly DemoModelConfig[] = [
    { model: "openai/receipt-primary", role: "primary", reasoningEffort: "high" },
    { model: "anthropic/claude-sonnet-5", role: "fallback", reasoningEffort: "low" }
  ];

  beforeEach(() => {
    for (const name of ["DEMO_MODEL_OVERRIDE", "DEMO_OPENAI_API_MODE", "DEMO_REASONING_EFFORT_OVERRIDE"]) {
      vi.stubEnv(name, undefined);
    }
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  function useTuple(tuple = mixedTuple) {
    const resolve = demoModelConfig.demoModelsFromOverride;
    vi.spyOn(demoModelConfig, "demoModelsFromOverride").mockImplementation((override) =>
      override?.trim() ? resolve(override) : tuple
    );
  }

  it("records each mixed-tuple effort in the real receipt builder and configuration hash", () => {
    useTuple();
    const answering = answeringConfiguration({});
    expect(answering.models).toEqual([
      { model: mixedTuple[0]!.model, role: "primary", reasoningEffort: { configured: "high", value: "high", source: "model" } },
      { model: mixedTuple[1]!.model, role: "fallback", reasoningEffort: { configured: "low", value: "low", source: "model" } }
    ]);
    expect(answering.reasoningEffort).toMatchObject({ scope: "primary-attempt", value: "high", source: "model", default: "none" });
    const meta = fixtureMeta(reviewedRound(), () => answering);
    expect(() => assertPlaygroundArtifactMeta(meta)).not.toThrow();
    const changed = structuredClone(meta);
    changed.answering.models[1].reasoningEffort.value = "medium";
    expect(() => assertPlaygroundArtifactMeta(changed)).toThrow(/answeringConfigSha256/);
    const changedMeta = fixtureMeta(reviewedRound(), () => changed.answering);
    expect(changedMeta.inputSnapshot.answeringConfigSha256).not.toBe(meta.inputSnapshot.answeringConfigSha256);
    expect(fixtureMeta(reviewedRound(), () => answeringWithObserved(answering, [
      { answerCost: { models: [mixedTuple[1]!.model] } }
    ])).inputSnapshot.answeringConfigSha256).toBe(meta.inputSnapshot.answeringConfigSha256);
  });

  it.each(["none", "low"])("gives explicit process %s precedence over dev-vars and tuple efforts", (value) => {
    useTuple();
    vi.stubEnv("DEMO_REASONING_EFFORT_OVERRIDE", value);
    const answering = answeringConfiguration({ DEMO_REASONING_EFFORT_OVERRIDE: "xhigh" });
    expect(answering.models.map((entry: any) => entry.reasoningEffort)).toEqual([
      { configured: "high", value, source: "process-env" },
      { configured: "low", value, source: "process-env" }
    ]);
    expect(answering.reasoningEffort).toMatchObject({ value, source: "process-env", invalidOverrideIgnored: false });
  });

  it("uses a dev-vars override when the process has no override", () => {
    useTuple();
    const answering = answeringConfiguration({ DEMO_REASONING_EFFORT_OVERRIDE: " none " });
    expect(answering.models.map((entry: any) => entry.reasoningEffort.value)).toEqual(["none", "none"]);
    expect(answering.models.map((entry: any) => entry.reasoningEffort.source)).toEqual([".dev.vars", ".dev.vars"]);
  });

  it.each(["", "invalid"])("ignores invalid process value %j without falling through to dev-vars", (value) => {
    useTuple();
    vi.stubEnv("DEMO_REASONING_EFFORT_OVERRIDE", value);
    const answering = answeringConfiguration({ DEMO_REASONING_EFFORT_OVERRIDE: "medium" });
    expect(answering.models.map((entry: any) => entry.reasoningEffort.value)).toEqual(["high", "low"]);
    expect(answering.reasoningEffort).toMatchObject({ value: "high", source: "model", invalidOverrideIgnored: true });
  });

  it.each(["process-env", ".dev.vars"])("does not inherit tuple effort for a slug-only override from %s", (source) => {
    useTuple();
    const slug = mixedTuple[0]!.model;
    const devVars = source === ".dev.vars" ? { DEMO_MODEL_OVERRIDE: slug } : {};
    if (source === "process-env") vi.stubEnv("DEMO_MODEL_OVERRIDE", slug);
    const answering = answeringConfiguration(devVars);
    expect(answering.models).toEqual([
      { model: slug, role: "primary", reasoningEffort: { configured: null, value: "none", source: "default" } }
    ]);
    expect(answering.fallbackModels).toEqual([]);
    expect(answering.modelSource).toBe(source);
    expect(answering.reasoningEffort).toMatchObject({ value: "none", source: "default", invalidOverrideIgnored: false });
  });

  it("records the production tuple and global default when no overrides are present", () => {
    const answering = answeringConfiguration({});
    expect(answering.defaultModels).toEqual(demoModelConfig.DEMO_MODELS);
    expect(answering.models.map(({ model, role }: DemoModelConfig) => ({ model, role }))).toEqual(demoModelConfig.DEMO_MODELS);
    expect(answering.models.map((entry: any) => entry.reasoningEffort)).toEqual([
      { configured: null, value: "none", source: "default" },
      { configured: null, value: "none", source: "default" }
    ]);
  });
});

describe("playground semantic artifact contract", () => {
  it("requires both paid-run provenance inputs before model execution", () => {
    expect(() => assertModelBackedRunInputs({})).toThrow(/server-generation/);
    expect(() => assertModelBackedRunInputs({ serverGeneration: sha("a") })).toThrow(/round-cap-context/);
    expect(() =>
      assertModelBackedRunInputs({ serverGeneration: sha("a"), roundCapContext: "/tmp/caps.json" })
    ).not.toThrow();
  });

  it("builds a complete, versioned, internally pinned artifact metadata block", () => {
    const meta = fixtureMeta();
    expect(meta.artifactContract).toBe(PLAYGROUND_ARTIFACT_CONTRACT);
    expect(meta.inputSnapshot.contract).toBe(PLAYGROUND_INPUT_SNAPSHOT_CONTRACT);
    expect(meta.answering.fallbackModels).toEqual(["openai/gpt-5.4-mini"]);
    expect(meta.server.runtimeIntrospection).toBe("not-available");
    expect(() => assertPlaygroundArtifactMeta(meta)).not.toThrow();
  });

  it("fails on omitted answering fields or a configuration/hash mismatch", () => {
    const missingFallback = structuredClone(fixtureMeta());
    delete missingFallback.answering.fallbackModels;
    expect(() => assertPlaygroundArtifactMeta(missingFallback)).toThrow(/fallbackModels/);

    const unconfiguredObserved = structuredClone(fixtureMeta());
    unconfiguredObserved.answering.observedAttemptedModels = ["openai/gpt-6-luna"];
    expect(() => assertPlaygroundArtifactMeta(unconfiguredObserved)).toThrow(/observedAttemptedModels/);

    const noIntrospection = structuredClone(fixtureMeta());
    noIntrospection.answering.runtimeIntrospection = "not-available";
    expect(() => assertPlaygroundArtifactMeta(noIntrospection)).toThrow(/runtimeIntrospection/);

    const changedTemperature = structuredClone(fixtureMeta());
    changedTemperature.answering.temperature = 0.2;
    expect(() => assertPlaygroundArtifactMeta(changedTemperature)).toThrow(/answeringConfigSha256/);
  });

  it("builds a valid artifact after a model mismatch and keeps the config hash free of observations", () => {
    const rows = [
      { answerCost: { models: ["openai/gpt-5.4"] } },
      { answerCost: { models: ["openai/gpt-5.6-terra"] }, provenanceError: "observed-model-mismatch: openai/gpt-5.6-terra" }
    ];
    const meta = fixtureMeta(reviewedRound(), (answering) => answeringWithObserved(answering, rows));
    expect(() => assertPlaygroundArtifactMeta(meta)).not.toThrow();
    expect(meta.answering.observedAttemptedModels).toEqual(["openai/gpt-5.4"]);
    expect(meta.inputSnapshot.answeringConfigSha256).toBe(fixtureMeta().inputSnapshot.answeringConfigSha256);
  });

  it("refuses an older playground contract instead of reading it as a legacy QA artifact", () => {
    expect(() => assertCurrentPlaygroundContract({ meta: { artifactContract: "playground-semantic-result/v2" } }))
      .toThrow(/stale playground-semantic-result\/v2/);
    expect(() => assertCurrentPlaygroundContract({ meta: { artifactContract: PLAYGROUND_ARTIFACT_CONTRACT } })).not.toThrow();
    expect(() => assertCurrentPlaygroundContract({ meta: { judgeModel: "claude-sonnet-5" } })).not.toThrow();
  });

  it("fails when the operator server assertion, local tree, or snapshot generation disagree", () => {
    const assertionMismatch = structuredClone(fixtureMeta());
    assertionMismatch.server.operatorAssertionSha256 = sha("9");
    expect(() => assertPlaygroundArtifactMeta(assertionMismatch)).toThrow(/operator assertion/);

    const snapshotMismatch = structuredClone(fixtureMeta());
    snapshotMismatch.inputSnapshot.serverGenerationSha256 = sha("8");
    expect(() => assertPlaygroundArtifactMeta(snapshotMismatch)).toThrow(/serverGenerationSha256/);
  });

  it("fails before spend when a reviewed round would exceed its absolute cap", () => {
    expect(() => fixtureMeta(reviewedRound({ answerCallsConsumedBeforeRun: 7 }))).toThrow(
      /absoluteAnswerCallCap/
    );
    expect(() => fixtureMeta(reviewedRound({ infraRetryConsumedBeforeRun: 3 }))).toThrow(
      /infraRetryReserve/
    );
    expect(() => fixtureMeta(reviewedRound({ plannedAnswerCalls: 3 }))).toThrow(/plannedAnswerCalls/);
  });

  it("accepts unreviewed diagnostics only with explicit null cap semantics", () => {
    const nullCaps = {
      contract: PLAYGROUND_ROUND_CAP_CONTRACT,
      experimentId: "one-off-transport-diagnostic",
      kind: "not-applicable",
      runAllocation: null,
      reason: "unreviewed diagnostic; not an eval-round result",
      plannedAnswerCalls: null,
      absoluteAnswerCallCap: null,
      answerCallsConsumedBeforeRun: null,
      plannedJudgeCalls: null,
      absoluteJudgeCallCap: null,
      judgeCallsConsumedBeforeRun: null,
      infraRetryReserve: null,
      infraRetryConsumedBeforeRun: null,
      savedAnswerRejudgeReserve: null,
      savedAnswerRejudgesConsumedBeforeRun: null
    };
    expect(() => fixtureMeta(nullCaps)).not.toThrow();

    const omitted = structuredClone(nullCaps) as Record<string, unknown>;
    delete omitted.absoluteAnswerCallCap;
    expect(() => fixtureMeta(omitted)).toThrow(/absoluteAnswerCallCap/);
  });

  it("builds a structurally non-promotable quarantine and rejects tampering", () => {
    const artifact = fixtureQuarantine();
    expect(artifact.artifactContract).toBe(PLAYGROUND_QUARANTINE_CONTRACT);
    expect(Object.hasOwn(artifact, "meta")).toBe(false);
    expect(Object.hasOwn(artifact, "rows")).toBe(false);
    expect(Object.hasOwn(artifact, "summary")).toBe(false);
    expect(artifact.preserved).toEqual({ quarantinedRowsSha256: sha256Json(artifact.quarantinedRows) });
    expect(deriveQuarantineState(artifact)).toEqual({
      planned: { answerCalls: 2, judgeCalls: 2 },
      actual: { answerCallsCompleted: 1, judgeCallsCompleted: 0 },
      caseIdsCompleted: ["a"],
      caseIdsNotRun: ["b"],
      nextLedgerMinimumIncrements: { answerCalls: 1, judgeCalls: 0 },
      preserved: { rowCount: 1, fullyJudgedRowCount: 0, unjudgedRowCount: 1 }
    });
    expect(() => assertQuarantineArtifact(artifact)).not.toThrow();
    expect(() => assertNotPlaygroundQuarantine(artifact, "fixture")).toThrow(/non-promotable/);
    expect(() => assertNotPlaygroundQuarantine({ quarantinedMeta: { artifactContract: PLAYGROUND_QUARANTINE_CONTRACT } }, "renamed")).toThrow(/non-promotable/);
    expect(() => assertNotPlaygroundQuarantine({ meta: { artifactContract: PLAYGROUND_QUARANTINE_CONTRACT } }, "legacy")).toThrow(/non-promotable/);

    const tamperedRows = structuredClone(artifact);
    tamperedRows.quarantinedRows.push({ id: "b", verdict: null });
    expect(() => assertQuarantineArtifact(tamperedRows)).toThrow(/quarantinedRowsSha256/);

    const equalGeneration = structuredClone(artifact);
    equalGeneration.provenanceFailure.treeAtDetection = equalGeneration.provenanceFailure.treeAtStart;
    equalGeneration.provenanceFailure.observedGenerationSha256 = equalGeneration.provenanceFailure.treeAtStart.generationSha256;
    expect(() => assertQuarantineArtifact(equalGeneration)).toThrow(/differing/);
  });

  it("permits only a bounded post-spend generation-check error", () => {
    const artifact = fixtureQuarantine();
    artifact.reason = {
      ...artifact.reason,
      code: "generation-check-error",
      phase: "before-judge",
      checkError: { name: "Error", message: "git unavailable" }
    };
    artifact.provenanceFailure.treeAtDetection = null;
    artifact.provenanceFailure.observedGenerationSha256 = null;
    expect(() => assertQuarantineArtifact(artifact)).not.toThrow();
    artifact.spend.actual.answerCallsStarted = 0;
    expect(() => assertQuarantineArtifact(artifact)).toThrow(/allowed only after an answer call started/);
  });

  it("normalizes generation-check errors and rejects every hardened accounting mutation", () => {
    expect(sanitizeGenerationCheckError({ name: "bad name!", message: `\u001bline\n${"x".repeat(501)}` })).toEqual({
      name: "Error",
      message: `line ${"x".repeat(495)}`
    });
    const mutations: Array<[string, (artifact: any) => void, RegExp]> = [
      ["reason flags", (a) => { a.reason.serverChangeEstablished = true; }, /reason flags/],
      ["missing tree field", (a) => { delete a.provenanceFailure.treeAtDetection.statusSha256; }, /statusSha256/],
      ["bad check name", (a) => { a.reason.code = "generation-check-error"; a.reason.phase = "before-judge"; a.reason.checkError = { name: "bad name!", message: "x\n" }; a.provenanceFailure.treeAtDetection = null; a.provenanceFailure.observedGenerationSha256 = null; }, /normalized checkError/],
      ["stored preserved counters", (a) => { a.preserved.unjudgedRowCount = 0; }, /preserved must contain only/],
      ["stored completed ids", (a) => { a.spend.caseIdsCompleted = ["a"]; }, /spend must contain only/],
      ["stored not-run ids", (a) => { a.spend.caseIdsNotRun = ["b"]; }, /spend must contain only/],
      ["stored planned counts", (a) => { a.spend.planned = { answerCalls: 2, judgeCalls: 2 }; }, /spend must contain only/],
      ["stored ledger increments", (a) => { a.spend.nextLedgerMinimumIncrements = { answerCalls: 1, judgeCalls: 0 }; }, /spend must contain only/],
      ["stored completed counters", (a) => { a.spend.actual.answerCallsCompleted = 1; }, /spend.actual must contain only/],
      ["policy", (a) => { a.spend.accountingPolicy = "anything"; }, /accountingPolicy/],
      ["phase", (a) => { a.reason.phase = "generation-check-error"; }, /mismatch reason.phase/]
    ];
    for (const [name, mutate, matcher] of mutations) {
      const artifact = structuredClone(fixtureQuarantine());
      mutate(artifact);
      expect(() => assertQuarantineArtifact(artifact), name).toThrow(matcher);
    }

    const paid = structuredClone(fixtureQuarantine());
    paid.quarantinedRows[0].verdict = { score: "error", costUsd: 0.25 };
    paid.preserved.quarantinedRowsSha256 = sha256Json(paid.quarantinedRows);
    Object.assign(paid.spend.actual, { judgeCallsStarted: 1, reportedJudgeCalls: 0 });
    paid.spend.caseIdsJudged = ["a"];
    expect(() => assertQuarantineArtifact(paid)).toThrow(/reported judge cost accounting/);
    paid.spend.actual.reportedJudgeCalls = 1;
    paid.spend.actual.reportedJudgeCostUsd = 0.25;
    expect(() => assertQuarantineArtifact(paid)).not.toThrow();
    expect(deriveQuarantineState(paid)).toMatchObject({
      actual: { answerCallsCompleted: 1, judgeCallsCompleted: 1 },
      preserved: { rowCount: 1, fullyJudgedRowCount: 1, unjudgedRowCount: 0 }
    });
  });

  it("composes the real orchestrator and builder for every quarantined checkpoint", async () => {
    const scenarios = [
      { name: "before judge", snapshots: ["same", "changed"], code: "local-provenance-generation-mismatch", phase: "before-judge", rows: 1 },
      { name: "check error", snapshots: ["same", "throw"], code: "generation-check-error", phase: "before-judge", rows: 1 },
      { name: "before next answer", snapshots: ["same", "same", "changed"], code: "local-provenance-generation-mismatch", phase: "before-answer", rows: 1 },
      { name: "finalize", snapshots: ["same", "same", "same", "same", "changed"], code: "local-provenance-generation-mismatch", phase: "finalize", rows: 2 }
    ];
    for (const scenario of scenarios) {
      const meta = fixtureMeta();
      const start = meta.inputSnapshot.tree;
      const changed = { ...start, headRevision: "7e891fa6f9b913b723af897d1bf55bb2b5251c34" };
      changed.generationSha256 = treeGenerationSha256(changed);
      let index = 0;
      let saved: any;
      const result: any = await orchestratePlaygroundRun({
        cases: [{ id: "a" }, { id: "b" }], maxBudgetUsd: 10, treeAtStart: start, startMeta: meta, judgeEnabled: true,
        snapshotTree: async () => {
          const step = scenario.snapshots[index++]!;
          if (step === "throw") throw new Error("git\nfailed");
          return step === "changed" ? changed : start;
        },
        runAnswer: async (item: any) => ({ answer: item.id, costUsd: 0.1 }),
        judgeAnswer: async () => ({ score: "pass", costUsd: 0.25 }),
        makeRow: (item: any, run: any, verdict: any) => ({ id: item.id, answer: run.answer, verdict }),
        buildNormalArtifact: (rows: any[]) => ({ rows }),
        writeNormalArtifact: async () => { throw new Error("normal write must not run"); },
        writeQuarantineArtifact: async (artifact: any) => { saved = artifact; }
      });
      expect(result.kind, scenario.name).toBe("quarantined");
      expect(result.reason).toMatchObject({ code: scenario.code, phase: scenario.phase });
      expect(saved.quarantinedRows).toHaveLength(scenario.rows);
      expect(() => assertQuarantineArtifact(saved), scenario.name).not.toThrow();
    }
  });

  it("preserves a synthetic empty-answer verdict as unjudged in the real quarantine builder", async () => {
    const meta = fixtureMeta();
    const start = meta.inputSnapshot.tree;
    const changed = { ...start, headRevision: "6e891fa6f9b913b723af897d1bf55bb2b5251c34" };
    changed.generationSha256 = treeGenerationSha256(changed);
    let snapshots = 0;
    let saved: any;
    const result: any = await orchestratePlaygroundRun({
      cases: [{ id: "a" }, { id: "b" }], maxBudgetUsd: 10, treeAtStart: start, startMeta: meta, judgeEnabled: true,
      snapshotTree: async () => (++snapshots === 3 ? changed : start),
      runAnswer: async () => ({ answer: "", costUsd: 0.1 }),
      judgeAnswer: async () => ({ score: "error" }),
      makeRow: (item: any, run: any, verdict: any) => ({ id: item.id, answer: run.answer, verdict }),
      buildNormalArtifact: () => { throw new Error("normal artifact must not be built"); },
      writeNormalArtifact: async () => { throw new Error("normal artifact must not be written"); },
      writeQuarantineArtifact: async (artifact: any) => { saved = artifact; }
    });
    expect(result.reason).toMatchObject({ code: "local-provenance-generation-mismatch", phase: "before-answer" });
    expect(saved.spend.actual).toMatchObject({ judgeCallsStarted: 0, reportedJudgeCalls: 0 });
    expect(saved.spend.caseIdsJudged).toEqual([]);
    expect(deriveQuarantineState(saved).preserved).toEqual({ rowCount: 1, fullyJudgedRowCount: 0, unjudgedRowCount: 1 });
    expect(() => assertQuarantineArtifact(saved)).not.toThrow();
  });
});

describe("Playground client error diagnostics", () => {
  const details = artifactContract.playgroundClientErrorDetails;
  it.each(["ECONNRESET", "ECONNREFUSED", "UND_ERR_SOCKET"])("retains %s without copying sensitive error text", (code) => {
    const error = new TypeError("fetch failed", { cause: Object.assign(new Error("cookie=secret"), {
      code, errno: -54, syscall: "read", socket: { remoteAddress: "secret" }
    }) });
    expect(details(error, "fetch")).toEqual({ phase: "fetch", name: "TypeError", cause: { name: "Error", code, errno: -54, syscall: "read" } });
    expect(JSON.stringify(details(error, "fetch"))).not.toContain("secret");
  });
  it("retains abort and stream phases and bounded aggregate connection codes", () => {
    expect(details(new DOMException("secret", "AbortError"), "stream")).toEqual({ phase: "stream", name: "AbortError" });
    const error = new AggregateError([Object.assign(new Error(), { code: "ECONNREFUSED" }), Object.assign(new Error(), { code: "ENETUNREACH" })], "secret");
    expect(details(new TypeError("fetch failed", { cause: error }), "fetch").cause).toEqual({ name: "AggregateError", errors: [{ name: "Error", code: "ECONNREFUSED" }, { name: "Error", code: "ENETUNREACH" }] });
  });
  it("drops arbitrary names, codes, syscalls, strings, and throwing properties", () => {
    const hostile = { name: "token-secret", code: "TOKEN_SECRET", errno: Infinity, syscall: "secret", message: "secret", stack: "secret", get cause() { throw new Error("secret"); } };
    expect(details(hostile, "fetch")).toEqual({ phase: "fetch", name: "Error" });
    expect(details("token-secret", "fetch")).toEqual({ phase: "fetch", name: "Error" });
  });
  it("bounds cyclic, deep and wide causes to eight nodes and three levels", () => {
    const cycle: { name: string; cause?: unknown } = { name: "Error" }; cycle.cause = cycle;
    expect(details(cycle, "fetch").cause).toEqual({ name: "Error", truncated: true });
    let deep = new Error();
    for (let i = 0; i < 10; i++) deep = new Error("secret", { cause: deep });
    const wide = new AggregateError(Array.from({ length: 20 }, () => new AggregateError([deep, deep, deep])), "secret");
    const captured = details(wide, "fetch");
    let nodes = 0, maxDepth = 0;
    const walk = (node: any, depth = 1) => { nodes++; maxDepth = Math.max(maxDepth, depth); if (node.cause) walk(node.cause, depth + 1); for (const child of node.errors ?? []) walk(child, depth + 1); };
    walk(captured);
    expect(nodes).toBeLessThanOrEqual(8); expect(maxDepth).toBeLessThanOrEqual(3); expect(captured.truncated).toBe(true);
    expect(JSON.stringify(captured)).not.toContain("secret");
  });
});
