import { assertRunPlan } from "../../lib/harness-guards.mjs";
import { runJudgeSelfTestCandidate } from "../judge.mjs";
import { PACK_VERSION } from "../evidence-pack.mjs";
import { createSpendLedger, authorizeSpend, recordSpend, spendLedgerRecord,
  MissingReportedCostError, BudgetAuthorizationExceededError, BudgetExhaustedError } from "../spend-budget.mjs";
import { caseInputPayload, caseInputSha256 } from "../paired-verdict.mjs";
import { diagnosticCompleteness, judgeInput, parseVerdict, validateToolCall, validateTools } from "./core.mjs";
import { RUN_SCHEMA, MODEL, assertDeadline, jsonSha } from "./runner-support.mjs";
import { resolveReportedCost } from "./provider.mjs";

const reason = (error) => {
  if (error instanceof MissingReportedCostError) return "provider-cost-missing";
  if (error instanceof BudgetAuthorizationExceededError) return "provider-budget-exceeded";
  if (error instanceof BudgetExhaustedError) return "provider-budget-exhausted";
  return /^[a-z][a-z0-9-]{0,100}$/.test(error?.message ?? "") ? error.message : "method-error";
};
const HTTP_CASE_FAILURES = new Set([500, 502, 503, 504]);

class CaseHttpFailure extends Error {
  constructor(role) { super("provider-http-failure"); this.role = role; }
}

function toolText(result) {
  if (!result || !Array.isArray(result.content) || result.content.some((item) => item.type !== "text" || typeof item.text !== "string")) throw new Error("unexpected-mcp-result");
  return result.content.map((item) => item.text).join("\n");
}

function retainCompletion(attempt, completion) {
  const parsed = completion?.parsed;
  if (parsed?.finishReason === "stop" && typeof parsed.answer === "string") {
    attempt.unacceptedEvidence = { answer: parsed.answer, responseId: parsed.responseId ?? null,
      model: completion.model ?? null, usage: completion.usage ?? null, stream: completion.stream ?? null };
  }
}

/** All side effects are injected so the complete method can be tested without inference. */
export async function runMethod({ plan, cases, tools, instructions, evidence = {},
  provider, guard, callTool, remote, finalize = async () => {}, write }) {
  assertRunPlan(cases.map((row) => row.id));
  const transportCanary = plan.method === "transport-canary";
  const functionTools = transportCanary ? [] : validateTools(tools);
  const ledger = createSpendLedger(plan.maxBudgetUsd);
  const artifact = {
    schema: RUN_SCHEMA, diagnostic: true, method: plan.method,
    historicalQaComparable: false, canonicalFiveTrack: false,
    model: MODEL, effort: "high", fallback: [], retries: 0, panels: 0, resume: false,
    startedAt: new Date().toISOString(), finishedAt: null, status: "started",
    selectedIds: cases.map((row) => row.id), selectedContentSha256: jsonSha(cases),
    selectedCaseInputs: transportCanary ? cases : cases.map((row) => ({ id: row.id, caseInput: caseInputPayload(row), caseInputSha256: caseInputSha256(row) })),
    instructions, tools, evidence, rows: [], providerAttempts: [], rawProviderCalls: 0,
    invalidReasons: [], aggregatesSuppressed: true, summary: null, consecutiveProviderHttpFailures: { answer: 0, judge: 0 },
    budgetSemantics: "Sequential reported-cost checkpoints; no provider-side USD reservation or in-call USD ceiling.",
    cancellationSemantics: "Host termination does not prove upstream inference cancellation. Unknown costs remain unknown."
  };
  const seenLogIds = new Set();
  const save = () => {
    artifact.budget = spendLedgerRecord(ledger);
    artifact.totalReportedCostUsd = ledger.reportedSpendUsd;
    artifact.completeCostAccounting = artifact.providerAttempts.length === ledger.calls.length && artifact.budget.missingCosts === 0;
    artifact.totalCompleteCostUsd = artifact.completeCostAccounting ? ledger.reportedSpendUsd : null;
    const gatewayReports = artifact.providerAttempts.filter((attempt) => attempt.gatewayCostComplete);
    artifact.gatewayReportedCalls = gatewayReports.length;
    artifact.gatewayReportedCostUsd = Number(gatewayReports.reduce((sum, attempt) => sum + attempt.result.receipt.costUsd, 0).toFixed(12));
    artifact.completeGatewayCostAccounting = gatewayReports.length === artifact.providerAttempts.length;
    artifact.nativeReportedCalls = artifact.providerAttempts.filter((attempt) => attempt.costSource === "native-reported").length;
    artifact.unattemptedIds = artifact.selectedIds.filter((id) => !artifact.rows.some((row) => row.id === id && row.providerAttemptNumbers.length));
    const observedRawIds = new Set(artifact.providerAttempts.filter((attempt) => attempt.rawStarted).map((attempt) => attempt.id));
    artifact.attemptedAllSelectedCases = artifact.unattemptedIds.length === 0 && artifact.selectedIds.every((id) => observedRawIds.has(id));
    artifact.gradedAllSelectedCases = artifact.selectedIds.every((id) => artifact.rows.some((row) =>
      row.id === id && ["correct", "partial", "wrong"].includes(row.verdict?.score)));
    if (!artifact.gradedAllSelectedCases) { artifact.aggregatesSuppressed = true; artifact.summary = null; }
    artifact.incompleteIds = artifact.rows.filter((row) => row.failure || (transportCanary ? row.canaryOk !== true : !["correct", "partial", "wrong"].includes(row.verdict?.score))).map((row) => row.id);
    write(artifact);
  };

  async function infer(row, role, messages, perCallCap = null) {
    assertDeadline(plan.deadline);
    if (artifact.providerAttempts.length >= plan.maxProviderCalls || artifact.rawProviderCalls >= plan.maxProviderCalls) throw new Error("provider-call-limit");
    const authorization = authorizeSpend(ledger, { method: role, id: row.id, attempt: artifact.providerAttempts.length + 1 });
    if (perCallCap !== null) authorization.maxBudgetUsd = Math.min(authorization.maxBudgetUsd, perCallCap);
    await guard();
    assertDeadline(plan.deadline);
    const attempt = {
      number: artifact.providerAttempts.length + 1, id: row.id, role,
      startedAt: new Date().toISOString(), endedAt: null, rawStarted: false,
      inputSha256: jsonSha(messages), requestMessages: structuredClone(messages),
      costUsd: null, costSource: null, gatewayCostComplete: false, completionAccepted: false, unacceptedEvidence: null,
      result: null, response: null, responseBrand: null, reportedCosts: [], failure: null
    };
    artifact.providerAttempts.push(attempt);
    row.providerAttemptNumbers.push(attempt.number);
    save();
    let recorded = false;
    const record = (costUsd, costSource) => {
      attempt.costUsd = costUsd;
      attempt.costSource = costSource;
      save();
      recorded = true;
      try { recordSpend(ledger, authorization, costUsd); }
      finally {
        ledger.calls.at(-1).costSource = costSource;
        save();
      }
    };
    try {
      const response = await provider({
        requestId: String(attempt.number),
        options: { gatewayId: plan.gatewayId, maxBudgetUsd: authorization.maxBudgetUsd,
          messages, tools: role === "answer" ? functionTools : undefined,
          maxOutputTokens: plan.maxOutputTokens, judge: role !== "answer" },
        onEvidence(event) {
          if (event.type === "raw-started") {
            if (attempt.rawStarted) throw new Error("duplicate-raw-provider-call");
            attempt.rawStarted = true;
            artifact.rawProviderCalls++;
          } else if (event.type === "response") {
            if (attempt.response) throw new Error("duplicate-provider-response");
            if (event.logId !== null && (typeof event.logId !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(event.logId))) throw new Error("invalid-provider-log-id");
            attempt.response = { status: event.status, logId: event.logId };
          } else if (event.type === "reported-cost") {
            if (!Number.isFinite(event.costUsd) || event.costUsd < 0) throw new Error("invalid-reported-cost");
            attempt.reportedCosts.push({ logId: event.logId, costUsd: event.costUsd });
          } else if (event.type === "response-boundary") {
            attempt.responseBrand = event.brand;
            retainCompletion(attempt, event.completion);
          }
          save();
        }
      });
      attempt.result = response.result;
      retainCompletion(attempt, response.result);
      attempt.endedAt = new Date().toISOString();
      const cost = resolveReportedCost(response.result);
      if (cost.costSource === "native-reported" && attempt.reportedCosts.some((entry) => entry.costUsd !== cost.costUsd)) {
        cost.accountingError = "provider-cost-conflict";
        cost.costUsd = null;
        cost.costSource = null;
      }
      attempt.gatewayCostComplete = cost.gatewayCostComplete;
      // Store the complete returned evidence before accounting or after-call guards can fail.
      save();
      let spendingError = null;
      if (cost.gatewayCostComplete && cost.accountingError !== "provider-cost-conflict") {
        try { record(response.result.receipt.costUsd, "gateway-reported"); } catch (error) { spendingError = error; }
      }
      if (response.requestId !== String(attempt.number)) throw new Error("worker-request-identity-mismatch");
      if (response.rawCalls !== 1 || !attempt.rawStarted || response.result.receipt?.calls !== 1 ||
          !["node-response", "miniflare-response"].includes(attempt.responseBrand)) throw new Error("invalid-provider-outcome");
      const logId = response.result.logId;
      if (!logId || seenLogIds.has(logId) || attempt.response?.logId !== logId ||
          attempt.reportedCosts.some((entry) => entry.logId !== logId)) throw new Error("missing-or-reused-provider-log-id");
      seenLogIds.add(logId);
      if (attempt.response.status !== response.result.status) throw new Error("provider-response-status-mismatch");
      const caseHttpFailure = plan.method === "baseline" && HTTP_CASE_FAILURES.has(response.result.status) &&
        response.result.error === "provider-response-invalid" && response.result.parsed === null &&
        cost.gatewayCostComplete && response.result.receipt.error === null &&
        attempt.reportedCosts.some((cost) => cost.logId === logId && cost.costUsd === attempt.costUsd) &&
        attempt.reportedCosts.every((cost) => cost.logId === logId);
      await guard();
      assertDeadline(plan.deadline);
      if (spendingError) throw spendingError;
      if (cost.accountingError) throw new Error(cost.accountingError);
      if (response.result.error && !caseHttpFailure) throw new Error("invalid-provider-outcome");
      if (!recorded) record(cost.costUsd, cost.costSource);
      else {
        attempt.costSource = cost.costSource;
        ledger.calls.at(-1).costSource = cost.costSource;
      }
      if (caseHttpFailure) {
        artifact.consecutiveProviderHttpFailures[role]++;
        throw new CaseHttpFailure(role);
      }
      attempt.completionAccepted = role !== "answer";
      save();
      if (plan.method === "baseline") artifact.consecutiveProviderHttpFailures[role] = 0;
      return response.result.parsed;
    } catch (error) {
      if (!recorded) {
        // No complete receipt exists. A prior observed cost remains separate evidence.
        try { record(null, null); } catch { /* Missing cost remains a ledger entry. */ }
      }
      attempt.failure = reason(error);
      row.failureRole = role;
      row.failureStatus = attempt.response?.status ?? null;
      attempt.endedAt ??= new Date().toISOString();
      save();
      throw error;
    }
  }

  async function grade(input, row, cap = null) {
    const prepared = judgeInput(input);
    const parsed = await infer(row, "judge", [{ role: "user", content: prepared.prompt }], cap);
    const verdict = parseVerdict(parsed.answer, input, prepared);
    verdict.costUsd = artifact.providerAttempts.at(-1).costUsd;
    row.evidencePack = { packVersion: PACK_VERSION, promptSha256: prepared.promptSha256 };
    return verdict;
  }

  save();
  try {
    for (const [index, kase] of cases.entries()) {
      const row = { id: kase.id, question: kase.question, answer: "", transcript: [],
        verdict: null, failure: null, failureRole: null, failureStatus: null,
        providerAttemptNumbers: [], startedAt: new Date().toISOString(), endedAt: null };
      artifact.rows.push(row);
      save();
      try {
        if (transportCanary) {
          const result = await infer(row, "transport-canary", [{ role: "user", content: kase.question }]);
          row.answer = result.answer;
          if (result.answer.trim() !== "READY") throw new Error("transport-response-mismatch");
          row.canaryOk = true;
        } else if (plan.method === "selftest") {
          row.selftest = await runJudgeSelfTestCandidate(index, {
            maxBudgetUsd: 0.5, log: () => {},
            judge: async (input) => {
              row.verdict = await grade(input, row, 0.5);
              save();
              if (row.verdict.score === "error") throw new Error("selftest-invalid-verdict");
              return row.verdict;
            }
          });
        } else {
          const context = { id: row.id, attempt: 1 };
          remote.beforeCall(context);
          let finalAnswer = null;
          let turnSucceeded = false;
          try {
            const messages = [{ role: "system", content: instructions }, { role: "user", content: kase.question }];
            const toolIds = new Set();
            for (let step = 1; step <= plan.maxAnswerSteps; step++) {
              const result = await infer(row, "answer", messages);
              messages.push(result.message);
              if (result.finishReason === "stop") { finalAnswer = result.answer; break; }
              const calls = result.message.tool_calls.map((call) => validateToolCall(call));
              for (const call of calls) {
                if (toolIds.has(call.id)) throw new Error("reused-tool-call-id");
                toolIds.add(call.id);
              }
              for (const call of calls) {
                assertDeadline(plan.deadline);
                await guard();
                const entry = { toolUseId: call.id, tool: call.name, input: JSON.stringify(call.input),
                  assistantTurn: step, assistantTurnBasis: "provider-response", startedAt: new Date().toISOString() };
                row.transcript.push(entry);
                save();
                const raw = await callTool(call.name, call.input);
                entry.rawResult = raw;
                entry.result = toolText(raw);
                entry.isError = raw.isError === true;
                entry.endedAt = new Date().toISOString();
                // The identical tool text goes to the model and the stored transcript.
                save();
                messages.push({ role: "tool", tool_call_id: call.id, content: entry.result });
              }
            }
            turnSucceeded = true;
          } finally {
            await remote.afterCall(context, { completed: row.providerAttemptNumbers.length > 0 });
            assertDeadline(plan.deadline);
            for (const number of row.providerAttemptNumbers) {
              const attempt = artifact.providerAttempts[number - 1];
              if (turnSucceeded && attempt.role === "answer" && attempt.failure === null) attempt.completionAccepted = true;
            }
          }
          if (finalAnswer === null) {
            row.failure = "answer-step-limit";
            row.verdict = { score: "error", coreAnswer: null, failureClass: "answer-step-limit" };
          } else {
            row.answer = finalAnswer;
            save();
            row.verdict = await grade({ ...kase, candidateAnswer: row.answer, transcript: row.transcript }, row);
          }
        }
      } catch (error) {
        row.failure = reason(error);
        row.endedAt = new Date().toISOString();
        save();
        if (error instanceof CaseHttpFailure) {
          if (artifact.consecutiveProviderHttpFailures[error.role] >= 3) throw new Error("provider-http-circuit-breaker");
          if (artifact.providerAttempts.length >= plan.maxProviderCalls || artifact.rawProviderCalls >= plan.maxProviderCalls) throw new Error("provider-call-limit");
          if (artifact.budget.exhausted) throw new Error("provider-budget-exhausted");
          continue;
        }
        throw error;
      }
      row.endedAt = new Date().toISOString();
      save();
    }
  } catch (error) { artifact.invalidReasons.push(reason(error)); }
  try { await finalize(); } catch (error) { artifact.invalidReasons.push(reason(error)); }
  if (transportCanary) {
    artifact.measurement = "Provider transport only; no golden, MCP, or remote-service QA claim.";
    artifact.aggregatesSuppressed = true;
    artifact.summary = null;
    artifact.completeness = { selectedProviderCalls: 1, rawProviderCalls: artifact.rawProviderCalls };
  } else Object.assign(artifact, diagnosticCompleteness(artifact.selectedIds, artifact.rows, artifact.invalidReasons));
  if (plan.method === "selftest") {
    artifact.summary = null;
    artifact.aggregatesSuppressed = true;
    artifact.selftestPassed = artifact.invalidReasons.length === 0 && artifact.rows.length === 7 && artifact.rows.every((row) => row.selftest?.ok === true);
  }
  artifact.status = artifact.invalidReasons.length || artifact.incompleteIds.length || artifact.unattemptedIds.length ? "invalid-or-incomplete" : "complete";
  artifact.finishedAt = new Date().toISOString();
  save();
  return artifact;
}
