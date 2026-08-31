/**
 * Narrow playground loop policy and per-step telemetry shaping.
 *
 * This module deliberately recognizes only structural tool outputs owned by
 * the demo: search result objects, top-level execute failures/refusals, and
 * the explicit demo truncation advisory. It does not inspect arbitrary
 * execute payload text for service outcomes; the executor's op ledger is the
 * authoritative source for error/soft-empty aggregates when available.
 */
import { DEMO_CAPS, type DemoOperationSummary, type DemoToolBudget } from "./budget.ts";
import { DEMO_SYSTEM_PROMPT } from "./prompt.ts";

type ObservedToolResult = {
  toolName?: string;
  output?: unknown;
};

export type ObservedDemoStep = {
  stepNumber?: number;
  finishReason?: string;
  text?: string;
  toolCalls?: ReadonlyArray<{ toolName?: string }>;
  toolResults?: ReadonlyArray<ObservedToolResult>;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    outputTokenDetails?: { reasoningTokens?: number };
  };
};

export type DemoEvidenceState = "none" | "navigation-only" | "grounded" | "needs-recovery";

export type DemoStepSignals = {
  evidenceState: DemoEvidenceState;
  searchResults: number;
  searchHits: number;
  executeResults: number;
  executeFailures: number;
  executeTruncations: number;
};

export function demoOperationSummary(budget: DemoToolBudget): DemoOperationSummary {
  return budget.operations;
}

const EXECUTION_FAILED_PREFIX = "Execution failed:";
const DEMO_TRUNCATION_ADVISORY = "--- demo advisory ---\nThis execute result was truncated";
const NO_HOST_EVIDENCE = "--- host evidence summary ---\nevidence: none";
const INCONCLUSIVE_HOST_EVIDENCE =
  "--- host evidence summary ---\nevidence: service-inconclusive";

function isSearchOutput(value: unknown): value is { hits: unknown[] } {
  return value !== null && typeof value === "object" && Array.isArray((value as { hits?: unknown }).hits);
}

function isTopLevelExecuteFailure(value: unknown): boolean {
  if (typeof value === "string") return value.startsWith(EXECUTION_FAILED_PREFIX);
  return value !== null && typeof value === "object" && (value as { ok?: unknown }).ok === false;
}

function isExplicitlyTruncated(value: unknown): boolean {
  return typeof value === "string" && value.includes(DEMO_TRUNCATION_ADVISORY);
}

function isHostEvidencePoor(value: unknown): boolean {
  return (
    typeof value === "string" &&
    (value.includes(NO_HOST_EVIDENCE) || value.includes(INCONCLUSIVE_HOST_EVIDENCE))
  );
}

export function demoStepSignals(steps: ReadonlyArray<ObservedDemoStep>): DemoStepSignals {
  let searchResults = 0;
  let searchHits = 0;
  let executeResults = 0;
  let executeFailures = 0;
  let executeTruncations = 0;
  let evidenceState: DemoEvidenceState = "none";

  for (const step of steps) {
    for (const result of step.toolResults ?? []) {
      if (result.toolName === "search" && isSearchOutput(result.output)) {
        searchResults += 1;
        searchHits += result.output.hits.length;
        // Discovery after execute must not erase the latest execute evidence.
        // A later execute may still replace the state below.
        if (evidenceState === "none") evidenceState = "navigation-only";
        continue;
      }
      if (result.toolName !== "execute") continue;
      executeResults += 1;
      if (isTopLevelExecuteFailure(result.output)) {
        executeFailures += 1;
        evidenceState = "needs-recovery";
      } else if (isExplicitlyTruncated(result.output)) {
        executeTruncations += 1;
        evidenceState = "needs-recovery";
      } else if (isHostEvidencePoor(result.output)) {
        evidenceState = "needs-recovery";
      } else {
        evidenceState = "grounded";
      }
    }
  }

  return {
    evidenceState,
    searchResults,
    searchHits,
    executeResults,
    executeFailures,
    executeTruncations
  };
}

export function prepareDemoStep({
  steps,
  stepNumber,
  budget
}: {
  steps: ReadonlyArray<ObservedDemoStep>;
  stepNumber: number;
  budget?: DemoToolBudget;
}): { activeTools?: never[]; system?: string } | undefined {
  const signals = demoStepSignals(steps);
  const operations = budget?.latestOperations ?? null;
  const operationRecovery =
    operations !== null &&
    operations.total > 0 &&
    operations.ok === 0 &&
    (operations.error > 0 || operations.softEmpty > 0);
  const noHostEvidence = budget?.latestExecuteEvidence === "none";
  const inconclusiveServiceEvidence =
    budget?.latestExecuteEvidence === "service-inconclusive" && (operations?.ok ?? 0) > 0;
  const recoveryHint = budget?.latestRecoveryHint ?? null;

  if (stepNumber === DEMO_CAPS.maxSteps - 1) {
    return {
      activeTools: [],
      system: `${DEMO_SYSTEM_PROMPT}\n\nFinal-step policy: tools are disabled now. Synthesize a concise answer only from factual evidence already returned by execute. Search hits remain navigation only. If the evidence is missing, failed, inconclusive, or truncated in a way that matters, state that limitation and qualify or abstain instead of guessing.`
    };
  }

  if (
    !operationRecovery &&
    !noHostEvidence &&
    !inconclusiveServiceEvidence &&
    recoveryHint === null &&
    signals.evidenceState !== "navigation-only" &&
    signals.evidenceState !== "needs-recovery"
  ) {
    return undefined;
  }

  const remainingExecutes = Math.max(
    0,
    DEMO_CAPS.maxExecuteCallsPerTurn - (budget?.executeCalls ?? signals.executeResults)
  );
  const usesRecoveryHint = !noHostEvidence && recoveryHint !== null;
  const repositoryRecovery = recoveryHint?.candidates.some(
    (candidate) => candidate.relation === "source-code"
  )
    ? " Use a source-code candidate only when prior evidence identifies one exact repository. Pass its canonical owner/name and make only one repository explanation attempt."
    : "";
  const reason =
    noHostEvidence
      ? "The latest execute returned no host-observed service, skill-content, or artifact evidence; catalog/spec/search results and model-authored constants are navigation or unsupported data, not factual grounding."
      : inconclusiveServiceEvidence
        ? "The latest successful service response contained no result rows. Its envelope remains ok, but it is inconclusive host evidence."
      : recoveryHint
        ? recoveryHint.mode === "conditional-alternatives"
          ? `The latest execute used completed broad operation class(es) (${recoveryHint.sourceOperations.join(", ")}); the host did not inspect or judge their rows. If exact evidence answers the request or the question names a closed-world source, stop at that scope. If the open-world question remains unanswered, use at most one bounded uncalled alternative (${recoveryHint.candidates.map((candidate) => candidate.id).join(", ")}).${repositoryRecovery}`
          : `The latest execute used only completed narrow, operation-scoped lookup(s) (${recoveryHint.sourceOperations.join(", ")}). If the returned projection exactly answers the request or the question is closed-world, stop at that scope. If an open-world identity, history, or footprint remains empty, weak, adjacent, ambiguous, or partial, use one exact wider candidate (${recoveryHint.candidates.map((candidate) => candidate.id).join(", ")}).${repositoryRecovery}`
      : operationRecovery && operations.softEmpty > 0 && operations.error > 0
      ? "The host-observed operations returned only errors or soft-empty results, with no successful operation evidence."
      : operationRecovery && operations.softEmpty > 0
        ? "The host-observed operations returned only soft-empty results, which are inconclusive, with no successful operation evidence."
        : operationRecovery
          ? "The host-observed operations returned only errors, with no successful operation evidence."
          : signals.evidenceState === "navigation-only"
            ? "The observed search results are navigation metadata, not factual evidence."
            : signals.executeFailures > 0
              ? "The latest observed execute result failed at the top level."
              : "The latest observed execute result was explicitly truncated.";
  const action =
    remainingExecutes > 0
      ? `Use the remaining execute budget (${remainingExecutes}) to obtain or recover compact factual evidence; choose the correction from the actual result rather than following a fixed phase sequence.`
      : "No execute budget appears to remain; qualify the unsupported or incomplete claim, or abstain.";

  if (usesRecoveryHint && budget) {
    budget.recoveryAdviceDelivered = true;
    budget.latestRecoveryHint = null;
  }

  return {
    system: `${DEMO_SYSTEM_PROMPT}\n\nEvidence-recovery note: ${reason} ${action}`
  };
}

export function demoStepTelemetry(step: ObservedDemoStep, budget?: DemoToolBudget): Record<string, unknown> {
  const signals = demoStepSignals([step]);
  const toolNames = new Set<string>();
  for (const call of step.toolCalls ?? []) if (call.toolName) toolNames.add(call.toolName);
  for (const result of step.toolResults ?? []) if (result.toolName) toolNames.add(result.toolName);

  return {
    step: (step.stepNumber ?? 0) + 1,
    finishReason: step.finishReason ?? "unknown",
    toolCalls: step.toolCalls?.length ?? 0,
    toolResults: step.toolResults?.length ?? 0,
    tools: [...toolNames].sort(),
    textChars: step.text?.length ?? 0,
    inputTokens: step.usage?.inputTokens,
    outputTokens: step.usage?.outputTokens,
    reasoningTokens: step.usage?.outputTokenDetails?.reasoningTokens,
    totalTokens: step.usage?.totalTokens,
    operationSummary: budget ? demoOperationSummary(budget) : undefined,
    ...signals
  };
}
