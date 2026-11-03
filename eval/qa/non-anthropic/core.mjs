import { createHash } from "node:crypto";
import { assertFailClosedCliSyntax, assertRunPlan, runCompleteness } from "../../lib/harness-guards.mjs";
import { parseMaxBudgetUsd } from "../spend-budget.mjs";
import { extractJsonObject } from "../lib.mjs";
import { checkVerdictConsistency, isValidAvoidMatches } from "../verdict-consistency.mjs";
import { attachTranscriptEvidenceDiagnostics, buildJudgePrompt, buildTranscriptEvidence, JUDGE_RUBRIC } from "../judge.mjs";
import { PACK_VERSION } from "../evidence-pack.mjs";

export const SCHEMA = "direct-grok-binding-diagnostic-v1";
export const MODEL = "xai/grok-4.7";
export const DEADLINE = "2026-11-03T10:00:00Z";
export const sha256 = (value) => createHash("sha256").update(value).digest("hex");
export const hashJson = (value) => sha256(JSON.stringify(value));

export function parseArgs(args) {
  if (args.length === 1 && args[0] === "--help") return { help: true };
  const flags = ["--mode", "--plan", "--expect-plan-sha256", "--max-budget-usd", "--out"];
  assertFailClosedCliSyntax(args, { valueFlags: flags, booleanFlags: [], label: SCHEMA });
  const result = {};
  for (let i = 0; i < args.length; i += 2) {
    const name = args[i].slice(2);
    if (Object.hasOwn(result, name)) throw new Error(`duplicate ${args[i]}`);
    result[name] = args[i + 1];
  }
  if (!["pins", "canary", "selftest", "baseline"].includes(result.mode)) throw new Error("invalid --mode");
  if (!result.out) throw new Error("--out is required");
  if (result.mode !== "pins") {
    for (const flag of flags.slice(1, -1)) {
      if (!result[flag.slice(2)]) throw new Error(`${flag} is required`);
    }
    result.maxBudgetUsd = parseMaxBudgetUsd(result["max-budget-usd"]);
    if (!(result.maxBudgetUsd > 0)) throw new Error("budget must be positive");
    if (!/^[a-f0-9]{64}$/.test(result["expect-plan-sha256"])) throw new Error("invalid plan hash");
  } else if (Object.keys(result).length !== 2) throw new Error("pins accepts only --mode and --out");
  return result;
}

export function assertDeadline(deadline = DEADLINE, now = Date.now()) {
  const limit = Date.parse(deadline);
  if (!Number.isFinite(limit) || limit > Date.parse(DEADLINE) || now >= limit) throw new Error("method-deadline");
}

export function validatePlan(plan, { mode, maxBudgetUsd }) {
  if (plan.schema !== SCHEMA || plan.mode !== mode) throw new Error("plan contract mismatch");
  if (plan.answerModel !== MODEL || plan.judgeModel !== MODEL || plan.effort !== "high") throw new Error("model tuple mismatch");
  if (plan.maxBudgetUsd !== maxBudgetUsd) throw new Error("budget differs from reviewed plan");
  assertDeadline(plan.deadline);
  for (const [name, upper] of [["maxOutputTokens", 8192], ["maxAnswerSteps", 24], ["maxProviderCalls", 4800]]) {
    if (!Number.isSafeInteger(plan[name]) || plan[name] < 1 || plan[name] > upper) throw new Error(`invalid ${name}`);
  }
  if (mode === "canary" && plan.maxProviderCalls !== 1) throw new Error("canary requires exactly one authorized provider call");
  if (mode === "selftest" && (plan.maxProviderCalls !== 7 || maxBudgetUsd !== 3.5)) throw new Error("selftest requires seven calls and $3.50");
  if (plan.gatewayId !== "stellar-raven-demo" || !/^[a-f0-9]{32}$/.test(plan.accountId)) throw new Error("invalid Gateway identity");
  if (plan.server?.port !== 8790 || !/^[a-f0-9]{40}$/.test(plan.server?.revision) || !/^[a-f0-9]{64}$/.test(plan.server?.surfaceSha256)) throw new Error("invalid server pin");
  if (!plan.sourcePins || !plan.selection?.path || !/^[a-f0-9]{64}$/.test(plan.selection?.sha256)) throw new Error("missing source or selection pin");
  if (!plan.remote?.probePath || !/^[a-f0-9]{64}$/.test(plan.remote?.probeSha256) || !/^[a-f0-9]{64}$/.test(plan.remote?.vectorSha256)) throw new Error("missing remote identity pins");
  if (!/^[a-f0-9]{64}$/.test(plan.corpusSha256)) throw new Error("missing corpus pin");
  return plan;
}

export function validateTools(tools) {
  if (!Array.isArray(tools) || tools.length !== 2 || new Set(tools.map((t) => t.name)).size !== 2 ||
    !tools.every((t) => ["search", "execute"].includes(t.name) && t.inputSchema?.type === "object")) throw new Error("unexpected MCP tool inventory");
  return tools.map((t) => ({ type: "function", function: { name: t.name, description: t.description, parameters: t.inputSchema } }));
}

export function validateToolCall(call, { judge = false } = {}) {
  if (judge) throw new Error("judge attempted a tool");
  if (!call || call.type !== "function" || typeof call.id !== "string" || !call.id ||
      !["search", "execute"].includes(call.function?.name) || typeof call.function?.arguments !== "string") throw new Error("forbidden tool target");
  let input;
  try { input = JSON.parse(call.function.arguments); } catch { throw new Error("invalid tool JSON"); }
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("tool input must be an object");
  if (["file", "tool_input_file", "tool_name", "server", "server_name"].some((key) => Object.hasOwn(input, key))) throw new Error("forbidden tool indirection");
  if (call.function.name === "execute" && (Object.keys(input).length !== 1 || typeof input.code !== "string" || !input.code.trim())) throw new Error("invalid execute input");
  return { id: call.id, name: call.function.name, input };
}

export function parseCompletion(body, { judge = false } = {}) {
  if (!body || body.model !== "grok-4.7" && body.model !== MODEL || !Array.isArray(body.choices) || body.choices.length !== 1) throw new Error("invalid completion or model identity");
  const choice = body.choices[0];
  const message = choice.message;
  if (message?.role !== "assistant" || !["stop", "tool_calls"].includes(choice.finish_reason) ||
      message.refusal || typeof message.content !== "string" && message.content !== null) throw new Error("incomplete or refused completion");
  const calls = message.tool_calls ?? [];
  if (!Array.isArray(calls) || calls.length > 32 || new Set(calls.map((c) => c.id)).size !== calls.length) throw new Error("invalid tool call batch");
  const validatedCalls = calls.map((call) => validateToolCall(call, { judge }));
  if ((choice.finish_reason === "tool_calls") !== (calls.length > 0)) throw new Error("tool finish mismatch");
  if (!calls.length && !message.content?.trim()) throw new Error("empty completion");
  return { message, calls: validatedCalls, answer: message.content ?? "", finishReason: choice.finish_reason, usage: body.usage ?? null, responseId: body.id ?? null };
}

export function nativeCostTicks(usage) {
  for (const flag of ["cost_is_partial", "usage_is_incomplete"]) {
    if (usage && Object.hasOwn(usage, flag) && usage[flag] !== false) throw new Error("invalid native reported cost");
  }
  const ticks = usage?.cost_in_usd_ticks;
  if (ticks === undefined) return null;
  if (!Number.isSafeInteger(ticks) || ticks < 0) throw new Error("invalid native reported cost");
  return { ticks, usd: ticks / 1e10 };
}

export function judgeInput(input) {
  const transcriptEvidence = buildTranscriptEvidence(input);
  const prompt = buildJudgePrompt({ ...input, transcriptEvidence });
  return { prompt, transcriptEvidence, promptSha256: sha256(prompt) };
}

export function parseVerdict(text, input, evidence) {
  const verdict = extractJsonObject(text);
  if (!verdict) throw new Error("invalid judge JSON");
  if (!["correct", "partial", "wrong"].includes(verdict.score)) throw new Error("invalid judge verdict");
  const normalizedVerdict = {
    score: verdict.score,
    coreAnswer: verdict.coreAnswer,
    missingFacts:
      Array.isArray(verdict.missingFacts) && verdict.missingFacts.every((f) => typeof f === "string")
        ? verdict.missingFacts
        : [],
    wrongClaims:
      Array.isArray(verdict.wrongClaims) && verdict.wrongClaims.every((c) => typeof c === "string")
        ? verdict.wrongClaims
        : [],
    avoidMatches: verdict.avoidMatches,
    rationale: typeof verdict.rationale === "string" ? verdict.rationale : ""
  };
  const checked = checkVerdictConsistency({
    golden: input.golden,
    tags: input.tags,
    verdict: { ...normalizedVerdict, missingFacts: verdict.missingFacts, wrongClaims: verdict.wrongClaims }
  });
  const stamp = { rubric: JUDGE_RUBRIC, packVersion: PACK_VERSION, promptSha256: evidence.promptSha256 };
  if (!checked.ok) return {
    ...normalizedVerdict,
    ...(isValidAvoidMatches(input.golden, normalizedVerdict.avoidMatches) ? {} : { avoidMatches: [] }),
    ...stamp, judgeScore: normalizedVerdict.score, score: "error", coreAnswer: null,
    failureClass: "consistency", consistencyViolations: checked.violations
  };
  return { ...attachTranscriptEvidenceDiagnostics({ verdict: normalizedVerdict, input, transcriptEvidence: evidence.transcriptEvidence }), ...stamp };
}

export function diagnosticCompleteness(selectedIds, rows, invalidReasons = []) {
  assertRunPlan(selectedIds);
  const completeness = runCompleteness({ expectedIds: selectedIds, rows, judging: true });
  const failed = rows.filter((r) => !["correct", "partial", "wrong"].includes(r.verdict?.score) || r.failure).map((r) => r.id);
  const suppressed = invalidReasons.length > 0 || !completeness.aggregatesAllowed || failed.length > 0;
  const scores = { correct: 0, partial: 0, wrong: 0 };
  for (const row of rows) if (Object.hasOwn(scores, row.verdict?.score)) scores[row.verdict.score]++;
  return { completeness, failedIds: failed, aggregatesSuppressed: suppressed, summary: suppressed ? null : { selected: selectedIds.length, ...scores } };
}
