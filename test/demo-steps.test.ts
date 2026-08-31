import { describe, expect, it } from "vitest";
import { DEMO_CAPS, createDemoToolBudget } from "../src/demo/budget";
import { demoStepSignals, demoStepTelemetry, prepareDemoStep } from "../src/demo/steps";

const step = (toolName: string, output: unknown) => ({
  toolResults: [{ toolName, output }]
});

describe("prepareDemoStep", () => {
  it("does not impose a phase when no prior result needs recovery", () => {
    expect(prepareDemoStep({ steps: [], stepNumber: 0 })).toBeUndefined();
    expect(prepareDemoStep({ steps: [step("execute", '{"project":"Soroswap"}')], stepNumber: 2 })).toBeUndefined();
  });

  it("treats observed search hits as navigation and asks for factual execute evidence", () => {
    const prepared = prepareDemoStep({
      steps: [step("search", { hits: [{ id: "lumenloop.search_directory" }] })],
      stepNumber: 1
    });
    expect(prepared?.activeTools).toBeUndefined();
    expect(prepared?.system).toContain("search results are navigation metadata, not factual evidence");
    expect(prepared?.system).toContain(`remaining execute budget (${DEMO_CAPS.maxExecuteCallsPerTurn})`);
    expect(prepared?.system).toContain("rather than following a fixed phase sequence");
  });

  it("recovers only from reliable top-level failure and explicit truncation signals", () => {
    const failed = prepareDemoStep({
      steps: [step("execute", "Execution failed: bad arguments")],
      stepNumber: 2
    });
    expect(failed?.system).toContain("failed at the top level");

    const truncated = prepareDemoStep({
      steps: [step("execute", "partial\n\n--- demo advisory ---\nThis execute result was truncated before synthesis")],
      stepNumber: 2
    });
    expect(truncated?.system).toContain("explicitly truncated");

    const arbitraryPayloadMention = prepareDemoStep({
      steps: [step("execute", '{"note":"soft-empty was discussed, but this is arbitrary result data"}')],
      stepNumber: 2
    });
    expect(arbitraryPayloadMention).toBeUndefined();
  });

  it("uses the executor-owned operation summary for only-error and only-soft-empty recovery", () => {
    const errors = createDemoToolBudget();
    errors.executeCalls = 1;
    errors.operations = { total: 2, ok: 0, error: 2, softEmpty: 0 };
    errors.latestOperations = { total: 2, ok: 0, error: 2, softEmpty: 0 };
    errors.latestExecuteEvidence = "service-inconclusive";
    const errorRecovery = prepareDemoStep({ steps: [], stepNumber: 2, budget: errors });
    expect(errorRecovery?.system).toContain("returned only errors");
    expect(errorRecovery?.system).toContain("remaining execute budget (2)");

    const softEmpty = createDemoToolBudget();
    softEmpty.executeCalls = 1;
    softEmpty.operations = { total: 1, ok: 0, error: 0, softEmpty: 1 };
    softEmpty.latestOperations = { total: 1, ok: 0, error: 0, softEmpty: 1 };
    softEmpty.latestExecuteEvidence = "service-inconclusive";
    expect(prepareDemoStep({ steps: [], stepNumber: 2, budget: softEmpty })?.system).toContain(
      "soft-empty results, which are inconclusive"
    );

    softEmpty.operations = { total: 2, ok: 1, error: 0, softEmpty: 1 };
    softEmpty.latestOperations = { total: 2, ok: 1, error: 0, softEmpty: 1 };
    softEmpty.latestExecuteEvidence = "service-data";
    expect(prepareDemoStep({ steps: [], stepNumber: 2, budget: softEmpty })).toBeUndefined();
  });

  it("uses only the latest execute outcome for recovery", () => {
    const budget = createDemoToolBudget();
    budget.executeCalls = 2;
    budget.operations = { total: 3, ok: 1, error: 2, softEmpty: 0 };
    budget.latestOperations = { total: 2, ok: 0, error: 2, softEmpty: 0 };
    budget.latestExecuteEvidence = "service-inconclusive";
    expect(prepareDemoStep({ steps: [], stepNumber: 3, budget })?.system).toContain(
      "returned only errors"
    );
  });

  it("recovers from a successful but structurally empty service result", () => {
    const budget = createDemoToolBudget();
    budget.executeCalls = 1;
    budget.latestOperations = { total: 1, ok: 1, error: 0, softEmpty: 0 };
    budget.latestExecuteEvidence = "service-inconclusive";
    expect(prepareDemoStep({ steps: [], stepNumber: 2, budget })?.system).toContain(
      "contained no result rows"
    );
  });

  it("conditionally surfaces exact recovery candidates after narrow-only success", () => {
    const budget = createDemoToolBudget();
    budget.executeCalls = 1;
    budget.latestOperations = { total: 2, ok: 2, error: 0, softEmpty: 0 };
    budget.latestExecuteEvidence = "service-data";
    budget.latestRecoveryHint = {
      mode: "narrow-only",
      sourceOperations: ["scout.getBuilders", "lumenloop.find_content_by_entity"],
      candidates: [
        {
          id: "lumenloop.search_content_semantic",
          relation: "broader-semantic",
          reasons: ["empty", "weak", "adjacent", "ambiguous"]
        }
      ]
    };
    const prepared = prepareDemoStep({ steps: [], stepNumber: 2, budget });
    expect(prepared?.system).toContain("only completed narrow, operation-scoped lookup");
    expect(prepared?.system).toContain("If the returned projection exactly answers");
    expect(prepared?.system).toContain("question is closed-world, stop at that scope");
    expect(prepared?.system).toContain("lumenloop.search_content_semantic");
    expect(prepared?.system).toContain("remaining execute budget (2)");
    expect(budget.recoveryAdviceDelivered).toBe(true);
    expect(budget.latestRecoveryHint).toBeNull();
    expect(prepareDemoStep({ steps: [], stepNumber: 3, budget })).toBeUndefined();
  });

  it("consumes broad conditional advice once without masking later structural recovery", () => {
    const budget = createDemoToolBudget();
    budget.executeCalls = 1;
    budget.latestOperations = { total: 1, ok: 1, error: 0, softEmpty: 0 };
    budget.latestExecuteEvidence = "service-data";
    budget.latestRecoveryHint = {
      mode: "conditional-alternatives",
      sourceOperations: ["stellarDocs.search_docs"],
      candidates: [
        {
          id: "lumenloop.search_content_semantic",
          relation: "cross-family",
          reasons: ["weak", "adjacent", "ambiguous"]
        }
      ]
    };
    const first = prepareDemoStep({ steps: [], stepNumber: 2, budget });
    expect(first?.system).toContain("completed broad operation class(es)");
    expect(first?.system).toContain("did not inspect or judge their rows");
    expect(first?.system).toContain("at most one bounded uncalled alternative");
    expect(budget.recoveryAdviceDelivered).toBe(true);
    expect(prepareDemoStep({ steps: [], stepNumber: 3, budget })).toBeUndefined();

    budget.latestOperations = { total: 1, ok: 0, error: 1, softEmpty: 0 };
    budget.latestExecuteEvidence = "service-inconclusive";
    expect(prepareDemoStep({ steps: [], stepNumber: 4, budget })?.system).toContain(
      "returned only errors"
    );
  });

  it("bounds soft-empty source-code recovery to one exact repository", () => {
    const budget = createDemoToolBudget();
    budget.executeCalls = 1;
    budget.latestOperations = { total: 1, ok: 0, error: 0, softEmpty: 1 };
    budget.latestExecuteEvidence = "service-inconclusive";
    budget.latestRecoveryHint = {
      mode: "conditional-alternatives",
      sourceOperations: ["stellarDocs.search_sdk_cli_tools_docs"],
      candidates: [
        {
          id: "scout.explainRepo",
          relation: "source-code",
          reasons: ["empty", "adjacent"]
        }
      ]
    };

    const prepared = prepareDemoStep({ steps: [], stepNumber: 2, budget });
    expect(prepared?.system).toContain("completed broad operation class(es)");
    expect(prepared?.system).toContain("one exact repository");
    expect(prepared?.system).toContain("Pass its canonical owner/name");
    expect(prepared?.system).toContain("make only one repository explanation attempt");
  });

  it("recovers when the latest execute has no host-observed evidence", () => {
    const budget = createDemoToolBudget();
    budget.executeCalls = 1;
    budget.latestExecuteEvidence = "none";
    expect(prepareDemoStep({ steps: [], stepNumber: 2, budget })?.system).toContain(
      "no host-observed service, skill-content, or artifact evidence"
    );

    const fromVisibleFooter = prepareDemoStep({
      steps: [step("execute", '{"hits":[]}\n\n--- host evidence summary ---\nevidence: none')],
      stepNumber: 2
    });
    expect(fromVisibleFooter?.system).toContain("obtain or recover compact factual evidence");
  });

  it("reserves the seventh and final step for tool-free synthesis", () => {
    const prepared = prepareDemoStep({ steps: [], stepNumber: DEMO_CAPS.maxSteps - 1 });
    expect(prepared?.activeTools).toEqual([]);
    expect(prepared?.system).toContain("tools are disabled now");
    expect(prepared?.system).toContain("qualify or abstain instead of guessing");
  });
});

describe("demo step signals and telemetry", () => {
  it("uses later successful execute evidence to clear earlier navigation-only state", () => {
    expect(
      demoStepSignals([
        step("search", { hits: [{ id: "stellarDocs.search_docs" }] }),
        step("execute", '{"hits":[{"url":"https://developers.stellar.org"}]}')
      ])
    ).toMatchObject({ evidenceState: "grounded", searchResults: 1, executeResults: 1 });
  });

  it("does not let a later discovery search erase grounded execute evidence", () => {
    expect(
      demoStepSignals([
        step("execute", '{"project":"Soroswap"}'),
        step("search", { hits: [{ id: "lumenloop.search_content_semantic" }] })
      ])
    ).toMatchObject({ evidenceState: "grounded", searchResults: 1, executeResults: 1 });
  });

  it("emits compact metadata without tool inputs, outputs, or text content", () => {
    const budget = createDemoToolBudget();
    budget.operations = { total: 2, ok: 1, error: 0, softEmpty: 1 };
    const telemetry = demoStepTelemetry(
      {
        stepNumber: 1,
        finishReason: "tool-calls",
        text: "private answer content",
        toolCalls: [{ toolName: "execute" }],
        toolResults: [{ toolName: "execute", output: "private tool output" }],
        usage: { inputTokens: 10, outputTokens: 4, totalTokens: 14 }
      },
      budget
    );
    expect(telemetry).toMatchObject({
      step: 2,
      finishReason: "tool-calls",
      toolCalls: 1,
      toolResults: 1,
      tools: ["execute"],
      textChars: 22,
      evidenceState: "grounded",
      operationSummary: { total: 2, ok: 1, error: 0, softEmpty: 1 },
      totalTokens: 14
    });
    expect(JSON.stringify(telemetry)).not.toContain("private");
  });
});
