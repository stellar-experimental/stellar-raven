import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeArchitectureRow,
  compareArchitectureResults,
  summarizeArchitecture,
  verifyPlanSourceAssociation
} from "../eval/qa/compare-architecture-ab.mjs";
import { AGENT_RESULT_SCHEMA } from "../eval/qa/agent-result.mjs";
import {
  DEFAULT_RULES_PATH,
  OP_CLASSES_PATH,
  gradeRow,
  loadRunnerOps,
  summarizePlan
} from "../eval/plan/grade-plan.mjs";

const baseMeta = {
  model: "claude-sonnet-5",
  judgeModel: "claude-sonnet-5",
  judgeRubric: "v2.4",
  packVersion: "p3",
  resultsSchema: AGENT_RESULT_SCHEMA,
  casesPath: "eval/qa/sample.json",
  caseContract: null,
  sampleN: 1,
  promptAppend: "Use the assigned surface.",
  inputSnapshot: { caseIdsSha256: "cases", manifestSha256: "manifest" },
  sourceIdentity: {
    runnerRevision: "abc",
    runnerStatusSha256: "dirty",
    serverRevision: "c".repeat(40),
    qaImplementationSha256: "a".repeat(64)
  },
  sourceIdentityGuard: { matches: true },
  toolSurface: { toolCount: 2, advertisedWireChars: 100 }
};

const plan = (requiredCovered) => ({
  summary: { cases: 1, requiredCoveredCount: requiredCovered ? 1 : 0 },
  rows: [{ id: "q1", requiredCovered, onPlanRatio: requiredCovered ? 1 : 0 }]
});

describe("architecture A/B metric collector", () => {
  it("counts direct operation calls, costs, truncation, and errors", () => {
    const row = {
      id: "q1",
      answer: "A judged answer.",
      agent: {
        turns: 4,
        costUsd: 0.2,
        promptChars: 900,
        usage: { final: { input_tokens: 10, output_tokens: 20 }, perTurn: [], perTurnAvailable: false },
        failure: null
      },
      verdict: { score: "partial", costUsd: 0.05 },
      transcript: [
        {
          tool: "mcp__raven__scout_getRfps",
          result: '{"ok":false,"error":{"kind":"soft-empty"}}',
          isError: false
        },
        {
          tool: "mcp__raven__stellarDocs_search_docs",
          result: '{"ok":true,"data":{}}\n--- SOURCE BASIS ---',
          isError: false
        },
        { tool: "ToolSearch", resultChars: 40 }
      ]
    };
    const analyzed = analyzeArchitectureRow(row);
    expect(analyzed.operationToolCalls).toBe(2);
    expect(analyzed.ravenToolCalls).toBe(2);
    expect(analyzed.harnessToolCalls).toBe(1);
    expect(analyzed.truncatedToolResults).toBe(1);
    expect(analyzed.visibleEnvelopes["soft-empty"]).toBe(1);
    expect(analyzed.totalCostUsd).toBeCloseTo(0.25);
    // The runner now stores ONE structured failure field; the collector must
    // read its class instead of the retired free-text `agent.error` string.
    expect(analyzed.agentError).toBe(false);
    expect(analyzed.agentFailureClass).toBeNull();
    const failed = analyzeArchitectureRow({
      ...row,
      agent: { ...row.agent, failure: { class: "provider-safeguard", reason: "blocked", retryable: false } }
    });
    expect(failed.agentError).toBe(true);
    expect(failed.agentFailureClass).toBe("provider-safeguard");
    const summary = summarizeArchitecture([row]);
    expect(summary.verdicts.partial).toBe(1);
    expect(summary.truncatedCases).toBe(1);
    expect(summary.capturedToolResultScope).toMatch(/not comparable/);
    // Numeric usage aggregation reads the provider's final usage, which now
    // lives under agent.usage.final.
    expect(summary.agentUsage).toMatchObject({ input_tokens: 10, output_tokens: 20 });
    expect(summary.agentFailureClasses).toEqual({});
  });

  it("refuses missing, mismatched, or empty agent-result schemas before comparing", () => {
    const arm = (surface, resultsSchema) => ({
      meta: (() => {
        const meta = { ...baseMeta, surface };
        if (resultsSchema === undefined) delete meta.resultsSchema;
        else meta.resultsSchema = resultsSchema;
        return meta;
      })(),
      rows: [{ id: "q1", agent: { turns: 3 }, verdict: { score: "correct" }, transcript: [] }]
    });
    const compare = (left, right) =>
      compareArchitectureResults({
        search: left,
        perOperation: right,
        searchPlan: plan(true),
        perOperationPlan: plan(true)
      });

    // A pre-parser artifact carries no schema. Reading it with the new reader
    // silently drops usage (agent.usage.final is absent) and reports zero agent
    // errors (agent.failure is absent) — a false clean bill, not a loud refusal.
    expect(() => compare(arm("search-execute", undefined), arm("per-operation", AGENT_RESULT_SCHEMA))).toThrow(
      /resultsSchema/
    );
    expect(() => compare(arm("search-execute", AGENT_RESULT_SCHEMA), arm("per-operation", undefined))).toThrow(
      /resultsSchema/
    );
    expect(() => compare(arm("search-execute", "qa-agent-result-v0"), arm("per-operation", AGENT_RESULT_SCHEMA))).toThrow(
      /resultsSchema/
    );
    // Present-but-empty is not a schema either.
    expect(() => compare(arm("search-execute", ""), arm("per-operation", ""))).toThrow(/resultsSchema/);

    // AGREEING on an unreadable schema is still unreadable. This reader knows
    // exactly one row shape, so both arms must equal AGENT_RESULT_SCHEMA — not
    // merely equal each other.
    expect(() =>
      compare(arm("search-execute", "qa-agent-result-v0"), arm("per-operation", "qa-agent-result-v0"))
    ).toThrow(/resultsSchema/);
    expect(() =>
      compare(arm("search-execute", "some-future-schema"), arm("per-operation", "some-future-schema"))
    ).toThrow(/resultsSchema/);

    // Only the schema this reader actually understands compares.
    expect(() =>
      compare(arm("search-execute", AGENT_RESULT_SCHEMA), arm("per-operation", AGENT_RESULT_SCHEMA))
    ).not.toThrow();
  });

  it("refuses mismatched cases and compares plan coverage", () => {
    const search = {
      meta: { ...baseMeta, surface: "search-execute" },
      rows: [{ id: "q1", agent: { turns: 3 }, verdict: { score: "correct" }, transcript: [] }]
    };
    const perOperation = {
      meta: {
        ...baseMeta,
        surface: "per-operation",
        toolSurface: { toolCount: 50, advertisedWireChars: 10000 }
      },
      rows: [{ id: "q1", agent: { turns: 4 }, verdict: { score: "partial" }, transcript: [] }]
    };
    const comparison = compareArchitectureResults({
      search,
      perOperation,
      searchPlan: plan(true),
      perOperationPlan: plan(false)
    });
    expect(comparison.verdictTransitions).toEqual({ "correct→partial": 1 });
    expect(comparison.searchExecute.plan.requiredCoveredCount).toBe(1);
    expect(comparison.perOperation.plan.requiredCoveredCount).toBe(0);
    expect(comparison.perOperation.toolSurface.toolCount).toBe(50);
    expect(comparison.meta.metricLimitations.capturedToolResultChars).toMatch(/absent/);

    perOperation.rows[0].id = "different";
    expect(() =>
      compareArchitectureResults({ search, perOperation, searchPlan: plan(true), perOperationPlan: plan(false) })
    ).toThrow(/case ids/);
  });

  it("keeps missing costs nullable and computes means from reported values only", () => {
    const agentFailure = {
      id: "q1",
      agent: {
        turns: 4,
        promptChars: 800,
        costUsd: 0.2,
        failure: { class: "provider-safeguard", retryable: false }
      },
      verdict: { score: "error" },
      transcript: []
    };
    const missingCosts = {
      id: "q2",
      answer: "A stored answer.",
      agent: { turns: null, promptChars: null, costUsd: null, failure: null },
      verdict: { score: "correct", costUsd: null },
      transcript: []
    };

    const analyzed = analyzeArchitectureRow(missingCosts);
    expect(analyzed).toMatchObject({ agentCostUsd: null, judgeCostUsd: null, totalCostUsd: null });

    const summary = summarizeArchitecture([agentFailure, missingCosts]);
    expect(summary.meanTurns).toBe(4);
    expect(summary.meanPromptChars).toBe(800);
    expect(summary.judgeErrors).toBe(0);
    expect(summary.totalCostUsd).toBe(0.2);
    expect(summary.costAccounting).toEqual({
      agent: { expected: 2, reported: 1, missing: 1 },
      judge: { expected: 1, reported: 0, missing: 1 },
      totalCostIsLowerBound: true
    });
  });

  it("does not expect a judge cost for a clean empty answer", () => {
    const row = {
      id: "q-empty",
      answer: "",
      agent: { costUsd: 0.1, failure: null },
      verdict: null,
      transcript: []
    };

    expect(analyzeArchitectureRow(row)).toMatchObject({
      judgeExpected: false,
      judgeError: false,
      judgeCostUsd: null,
      totalCostUsd: 0.1
    });
    expect(summarizeArchitecture([row]).costAccounting).toEqual({
      agent: { expected: 1, reported: 1, missing: 0 },
      judge: { expected: 0, reported: 0, missing: 0 },
      totalCostIsLowerBound: false
    });
  });

  it("rounds reported comparison costs without binary floating-point residue", () => {
    const row = (id, agentCostUsd, judgeCostUsd) => ({
      id,
      answer: "A judged answer.",
      agent: { costUsd: agentCostUsd, failure: null },
      verdict: { score: "correct", costUsd: judgeCostUsd },
      transcript: []
    });
    const summary = summarizeArchitecture([
      row("q1", 0.1, 0.2),
      row("q2", 0.2, 0.1)
    ]);

    expect(summary.agentCostUsd).toBe(0.3);
    expect(summary.judgeCostUsd).toBe(0.3);
    expect(summary.totalCostUsd).toBe(0.6);
  });

  it("refuses incomplete, extra, reordered, or miscounted plan rows", () => {
    const arm = (surface) => ({
      meta: { ...baseMeta, surface, sampleN: 2 },
      rows: [
        { id: "q1", agent: { failure: null }, verdict: { score: "correct" }, transcript: [] },
        { id: "q2", agent: { failure: null }, verdict: { score: "correct" }, transcript: [] }
      ]
    });
    const validPlan = {
      summary: { cases: 2, requiredCoveredCount: 2 },
      rows: [
        { id: "q1", requiredCovered: true, onPlanRatio: 1 },
        { id: "q2", requiredCovered: true, onPlanRatio: 1 }
      ]
    };
    const compare = (candidatePlan) => compareArchitectureResults({
      search: arm("search-execute"),
      perOperation: arm("per-operation"),
      searchPlan: candidatePlan,
      perOperationPlan: validPlan
    });

    expect(() => compare({ ...validPlan, rows: validPlan.rows.slice(0, 1) })).toThrow(/plan.*ids|plan.*rows/i);
    expect(() => compare({ ...validPlan, rows: [...validPlan.rows, { id: "q3" }] })).toThrow(/plan.*ids|plan.*rows/i);
    expect(() => compare({ ...validPlan, rows: [...validPlan.rows].reverse() })).toThrow(/plan.*ids|plan.*rows/i);
    expect(() => compare({ ...validPlan, summary: { ...validPlan.summary, cases: 1 } })).toThrow(/plan.*cases/i);
  });

  it("rejects a stale plan sidecar with matching row ids and counts", async () => {
    const directory = mkdtempSync(join(tmpdir(), "qa-plan-source-"));
    try {
      const resultsPath = join(directory, "results.json");
      const planPath = join(directory, "results.plan.json");
      const rules = JSON.parse(readFileSync(DEFAULT_RULES_PATH, "utf8"));
      const opClasses = JSON.parse(readFileSync(OP_CLASSES_PATH, "utf8")).classes;
      const { runnerOps } = await loadRunnerOps();
      const originalRow = {
        id: "q-plan-source",
        question: "What is Stellar?",
        tags: { category: "factual", service: "stellarDocs" },
        answer: "Saved answer.",
        verdict: { score: "correct" },
        transcript: []
      };
      const originalResults = { meta: {}, rows: [originalRow] };
      writeFileSync(resultsPath, JSON.stringify(originalResults));
      const planRows = [gradeRow(originalRow, rules, opClasses, runnerOps)];
      const sidecar = {
        meta: {
          resultsPath,
          rulesPath: DEFAULT_RULES_PATH,
          rulesVersion: rules.version,
          opClassesPath: OP_CLASSES_PATH,
          runnerRegistry: runnerOps ? { runnableIds: Object.keys(runnerOps).sort() } : { absent: true }
        },
        summary: summarizePlan(planRows),
        rows: planRows
      };
      writeFileSync(planPath, JSON.stringify(sidecar));

      await expect(verifyPlanSourceAssociation("search+execute", sidecar, resultsPath, originalResults, planPath)).resolves.toMatchObject({
        sourceResultsSha256: expect.stringMatching(/^[a-f0-9]{64}$/),
        planSha256: expect.stringMatching(/^[a-f0-9]{64}$/)
      });

      const changedResults = {
        ...originalResults,
        rows: [{
          ...originalRow,
          transcript: [{
            tool: "mcp__raven__execute",
            input: JSON.stringify({ code: "async () => codemode.search({ query: 'stellar' })" }),
            result: "{}"
          }]
        }]
      };
      writeFileSync(resultsPath, JSON.stringify(changedResults));
      await expect(verifyPlanSourceAssociation("search+execute", sidecar, resultsPath, changedResults, planPath)).rejects.toThrow(
        /plan rows do not match source results/
      );
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("replays the exact runner registry and rejects sidecar-authored operations", async () => {
    const directory = mkdtempSync(join(tmpdir(), "qa-plan-runner-"));
    try {
      const resultsPath = join(directory, "results.json");
      const rules = JSON.parse(readFileSync(DEFAULT_RULES_PATH, "utf8"));
      const opClasses = JSON.parse(readFileSync(OP_CLASSES_PATH, "utf8")).classes;
      const { runnerOps } = await loadRunnerOps();
      expect(runnerOps).not.toBeNull();
      const runnerId = Object.keys(runnerOps)[0];
      const transcript = [{
        tool: "mcp__raven__execute",
        input: JSON.stringify({ code: `async () => codemode.skill.run('${runnerId}')` }),
        result: "{}"
      }];
      const rows = ["q-plan-runner-a", "q-plan-runner-b"].map((id) => ({
        id,
        question: "What is Stellar?",
        tags: { category: "factual", service: "stellarDocs" },
        answer: "Saved answer.",
        verdict: { score: "correct" },
        transcript
      }));
      const results = { meta: {}, rows };
      writeFileSync(resultsPath, JSON.stringify(results));
      const planRows = rows.map((row) => gradeRow(row, rules, opClasses, runnerOps));
      const sidecar = {
        meta: {
          resultsPath,
          rulesPath: DEFAULT_RULES_PATH,
          rulesVersion: rules.version,
          opClassesPath: OP_CLASSES_PATH,
          runnerRegistry: { runnableIds: Object.keys(runnerOps).sort() }
        },
        summary: summarizePlan(planRows),
        rows: planRows
      };

      await expect(verifyPlanSourceAssociation("search+execute", sidecar, resultsPath, results)).resolves.toBeDefined();

      const fakeRunnerOps = { [runnerId]: ["scout.definitelyStaleOperation"] };
      const fakeRows = rows.map((row) => gradeRow(row, rules, opClasses, fakeRunnerOps));
      const fakeSidecar = { ...sidecar, rows: fakeRows, summary: summarizePlan(fakeRows) };
      await expect(verifyPlanSourceAssociation("search+execute", fakeSidecar, resultsPath, results)).rejects.toThrow(
        /runner registry|plan rows do not match/
      );
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it("refuses different source identities and prompt appendices", () => {
    const arm = (surface) => ({
      meta: { ...baseMeta, surface },
      rows: [{ id: "q1", agent: { failure: null }, verdict: { score: "correct" }, transcript: [] }]
    });
    const compare = (search, perOperation) => compareArchitectureResults({
      search,
      perOperation,
      searchPlan: plan(true),
      perOperationPlan: plan(true)
    });

    const sourceMismatch = arm("per-operation");
    sourceMismatch.meta.sourceIdentity = {
      ...sourceMismatch.meta.sourceIdentity,
      qaImplementationSha256: "b".repeat(64)
    };
    expect(() => compare(arm("search-execute"), sourceMismatch)).toThrow(/sourceIdentity/);

    const missingServerRevision = arm("per-operation");
    missingServerRevision.meta.sourceIdentity = {
      ...missingServerRevision.meta.sourceIdentity,
      serverRevision: null
    };
    const matchingMissingRevision = arm("search-execute");
    matchingMissingRevision.meta.sourceIdentity = {
      ...matchingMissingRevision.meta.sourceIdentity,
      serverRevision: null
    };
    expect(() => compare(matchingMissingRevision, missingServerRevision)).toThrow(/serverRevision/);

    const labeledServerRevision = arm("per-operation");
    labeledServerRevision.meta.sourceIdentity = {
      ...labeledServerRevision.meta.sourceIdentity,
      serverRevision: "server-1"
    };
    const matchingLabel = arm("search-execute");
    matchingLabel.meta.sourceIdentity = {
      ...matchingLabel.meta.sourceIdentity,
      serverRevision: "server-1"
    };
    expect(() => compare(matchingLabel, labeledServerRevision)).toThrow(/serverRevision/);

    const driftedSource = arm("per-operation");
    driftedSource.meta.sourceIdentityGuard = {
      matches: false,
      changedKeys: ["qaImplementationSha256"]
    };
    expect(() => compare(arm("search-execute"), driftedSource)).toThrow(/sourceIdentityGuard/);

    const promptMismatch = arm("per-operation");
    promptMismatch.meta.promptAppend = "Different prompt.";
    expect(() => compare(arm("search-execute"), promptMismatch)).toThrow(/promptAppend/);
  });
});
