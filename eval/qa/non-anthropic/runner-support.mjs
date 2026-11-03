import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, realpathSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertFailClosedCliSyntax, assertRunPlan } from "../../lib/harness-guards.mjs";
import { loadCases, lifecycleSnapshot, lifecycleSnapshotSha256, partitionLifecycleCases } from "../lib.mjs";
import { runJudgeSelfTestCandidate } from "../judge.mjs";
import { parseMaxBudgetUsd } from "../spend-budget.mjs";

export const RUN_SCHEMA = "direct-grok-final-synthesis-candidate-v1";
export const PLAN_SCHEMA = "direct-grok-final-synthesis-plan-v1";
export const ANSWER_POLICY = "reserve-last-answer-request-v1";
export const FINAL_ANSWER_REMINDER = "This is the final request. Answer from the retrieved evidence. State what remains unknown. Do not invent facts or request tools.";
export const MODEL = "xai/grok-4.7";
export const DEADLINE = "2026-11-03T10:00:00Z";
export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
export const sha = (value) => createHash("sha256").update(value).digest("hex");
export const jsonSha = (value) => sha(JSON.stringify(value));

// These names control display or IPC bookkeeping, not inference or credential discovery.
export const ENV_EXCLUSIONS = Object.freeze([
  "HC_TERMINAL_ID", "HC_SCOPE", "HC_PARENT_TERMINAL_ID", "HC_ADDRESS", "SHLVL", "_",
  "TERM", "COLORTERM", "TERM_PROGRAM", "TERM_PROGRAM_VERSION", "COLUMNS", "LINES",
  "NODE_CHANNEL_FD", "NODE_CHANNEL_SERIALIZATION_MODE"
]);

export function environmentIdentity(env = process.env) {
  const names = Object.keys(env).filter((name) => !ENV_EXCLUSIONS.includes(name)).sort();
  return { schema: "direct-grok-environment-v1", names, sha256: jsonSha(names.map((name) => [name, String(env[name])])) };
}

export function assertDeadline(deadline = DEADLINE, now = Date.now()) {
  const limit = Date.parse(deadline);
  if (!Number.isFinite(limit) || limit > Date.parse(DEADLINE) || now >= limit) throw new Error("method-deadline");
  return limit - now;
}

export function assertIdentity(expected, actual, label = "source") {
  if (jsonSha(expected) !== jsonSha(actual)) throw new Error(`${label}-identity-changed`);
}

export function filePins(files) {
  return [...new Set(files.map((file) => realpathSync(file)))].sort().map((file) => ({ path: file, sha256: sha(readFileSync(file)) }));
}

export function checkFilePins(pins) {
  if (!Array.isArray(pins) || !pins.length) throw new Error("missing-source-pins");
  for (const pin of pins) {
    if (realpathSync(pin.path) !== pin.path || sha(readFileSync(pin.path)) !== pin.sha256) throw new Error("source-pin-changed");
  }
}

export function atomicWrite(file, value) {
  mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  const temporary = `${file}.tmp`;
  writeFileSync(temporary, JSON.stringify(value, null, 2) + "\n", { mode: 0o600, flag: "wx" });
  renameSync(temporary, file);
}

export function requireNewOutput(file) {
  if (existsSync(file) || existsSync(`${file}.tmp`)) throw new Error("output-already-exists");
}

export function parseRunnerArgs(args) {
  if (args.length === 1 && args[0] === "--help") return { help: true };
  const flags = ["--mode", "--plan", "--expect-plan-sha256", "--out", "--max-budget-usd"];
  assertFailClosedCliSyntax(args, { valueFlags: flags, booleanFlags: [], label: RUN_SCHEMA });
  const out = {};
  for (let i = 0; i < args.length; i += 2) {
    if (Object.hasOwn(out, args[i])) throw new Error("duplicate-flag");
    out[args[i]] = args[i + 1];
  }
  if (!["prepare-pins", "validate-plan", "transport-canary", "selftest", "baseline"].includes(out["--mode"]) || !out["--plan"] || !out["--out"]) throw new Error("missing-method-flags");
  const free = ["prepare-pins", "validate-plan"].includes(out["--mode"]);
  if (!/^[a-f0-9]{64}$/.test(out["--expect-plan-sha256"] ?? "")) throw new Error("missing-plan-hash");
  if (free && out["--max-budget-usd"] !== undefined) throw new Error("free-mode-rejects-budget");
  if (!free) {
    if (out["--max-budget-usd"] === undefined) throw new Error("missing-budget");
    out.budgetUsd = parseMaxBudgetUsd(out["--max-budget-usd"]);
    if (!(out.budgetUsd > 0)) throw new Error("nonpositive-budget");
  }
  return out;
}

export function readPinnedJson(file, expected) {
  const bytes = readFileSync(file);
  if (sha(bytes) !== expected) throw new Error("input-file-hash-mismatch");
  return JSON.parse(bytes);
}

export function validateRunnerPlan(plan, { mode, budgetUsd, preparing = false }) {
  const keys = new Set(["schema", "method", "model", "effort", "gatewayId", "accountId", "deadline", "maxBudgetUsd", "maxProviderCalls", "maxAnswerSteps", "maxOutputTokens", "requestTimeoutMs", "hostBackstopMs", "settlementGraceMs", "server", "remote", "corpus", "selection", "sourcePins", "answerPolicy"]);
  if (Object.keys(plan).some((key) => !keys.has(key))) throw new Error("unknown-plan-field");
  if (plan.schema !== PLAN_SCHEMA || !["baseline", "selftest", "transport-canary"].includes(plan.method)) throw new Error("invalid-plan-contract");
  if (["baseline", "selftest", "transport-canary"].includes(mode) && mode !== plan.method) throw new Error("method-plan-mismatch");
  if (plan.answerPolicy !== ANSWER_POLICY) throw new Error("answer-policy-mismatch");
  if (plan.model !== MODEL || plan.effort !== "high" || plan.gatewayId !== "stellar-raven-demo" || plan.accountId !== "ba55b7ae9acfb3ed152103e3497c0752") throw new Error("model-or-account-mismatch");
  if (plan.deadline !== DEADLINE) throw new Error("deadline-plan-mismatch");
  assertDeadline(plan.deadline);
  const baseline = plan.method === "baseline";
  const canary = plan.method === "transport-canary";
  if (plan.maxProviderCalls !== (baseline ? 1700 : canary ? 1 : 7) || plan.maxAnswerSteps !== (baseline ? 16 : 0) || plan.maxOutputTokens !== (canary ? 256 : 8192)) throw new Error("method-limit-mismatch");
  if (!Number.isFinite(plan.maxBudgetUsd) || plan.maxBudgetUsd <= 0 || plan.maxBudgetUsd > (baseline ? 30 : canary ? 1 : 3.5) || !baseline && plan.maxBudgetUsd !== (canary ? 1 : 3.5)) throw new Error("invalid-method-budget");
  if (budgetUsd !== undefined && budgetUsd !== plan.maxBudgetUsd) throw new Error("budget-plan-mismatch");
  for (const key of ["requestTimeoutMs", "hostBackstopMs", "settlementGraceMs"]) {
    if (!Number.isSafeInteger(plan[key]) || plan[key] < 1 || plan[key] > 300_000) throw new Error("invalid-timeout");
  }
  if (plan.hostBackstopMs < plan.requestTimeoutMs || plan.hostBackstopMs > plan.requestTimeoutMs + plan.settlementGraceMs) throw new Error("invalid-host-backstop");
  if (!canary) {
    if (plan.server?.port !== 8790 || plan.server?.revision !== "ce21317ff46d7491d82caf058baca7328c4177a9" || !/^[a-f0-9]{64}$/.test(plan.server?.surfaceSha256 ?? "")) throw new Error("invalid-server-pin");
    if (!plan.remote?.probePath || !/^[a-f0-9]{64}$/.test(plan.remote?.probeSha256 ?? "") || !/^[a-f0-9]{64}$/.test(plan.remote?.vectorSha256 ?? "")) throw new Error("invalid-remote-pin");
    if (!plan.corpus?.path || !/^[a-f0-9]{64}$/.test(plan.corpus?.sha256 ?? "")) throw new Error("invalid-corpus-pin");
  } else if (plan.server || plan.remote || plan.corpus) throw new Error("transport-canary-is-not-qa");
  assertRunPlan(plan.selection?.ids);
  if (plan.selection.ids.length !== (baseline ? 100 : canary ? 1 : 7) || !/^[a-f0-9]{64}$/.test(plan.selection?.contentSha256 ?? "") || !/^[a-f0-9]{64}$/.test(plan.selection?.lifecycleSha256 ?? "") || plan.selection.idsSha256 !== jsonSha(plan.selection.ids)) throw new Error("invalid-selection-pin");
  if (!preparing && (!plan.sourcePins?.path || !/^[a-f0-9]{64}$/.test(plan.sourcePins?.sha256 ?? ""))) throw new Error("missing-source-pin-file");
  return plan;
}

export async function selftestInputs() {
  const inputs = [];
  for (let index = 0; index < 7; index++) {
    await runJudgeSelfTestCandidate(index, {
      judge: async (input) => { inputs.push(input); return { score: "error", costUsd: 0 }; },
      maxBudgetUsd: 0.5, log: () => {}
    });
  }
  return inputs;
}

export async function loadSelection(plan) {
  if (plan.method === "transport-canary") {
    const cases = [{ id: "provider-ready", question: "Reply with exactly READY." }];
    if (jsonSha(plan.selection.ids) !== jsonSha(["provider-ready"]) || plan.selection.contentSha256 !== jsonSha(cases) || plan.selection.lifecycleSha256 !== jsonSha(null)) throw new Error("transport-input-mismatch");
    return { cases, lifecycle: null };
  }
  const corpus = readPinnedJson(plan.corpus.path, plan.corpus.sha256);
  // Independently load through the canonical corpus helper as well.
  const battery = loadCases(plan.corpus.path);
  assertIdentity(corpus.cases, battery.cases, "corpus");
  let cases;
  let lifecycle;
  if (plan.method === "baseline") {
    const frozen = readPinnedJson(plan.selection.path, plan.selection.sha256);
    assertIdentity(frozen.ids, plan.selection.ids, "selection");
    if (frozen.sourceRevision !== plan.server.revision || frozen.activeCorpusCount !== 501 || frozen.selectedCount !== 100 || frozen.sourceCaseBytesSha256 !== plan.corpus.sha256) throw new Error("frozen-selection-mismatch");
    const byId = new Map(battery.cases.map((row) => [row.id, row]));
    cases = frozen.ids.map((id) => byId.get(id));
    if (cases.some((row) => !row)) throw new Error("selected-case-missing");
    const partition = partitionLifecycleCases(cases);
    if (partition.quarantined.length || partition.active.length !== 100) throw new Error("selected-lifecycle-changed");
    lifecycle = lifecycleSnapshot(cases);
    if (jsonSha(cases) !== frozen.selectedContentSha256 || lifecycleSnapshotSha256(lifecycle) !== frozen.lifecycleSha256 || jsonSha(frozen.ids) !== frozen.orderedIdsSha256) throw new Error("frozen-content-mismatch");
  } else {
    const inputs = await selftestInputs();
    cases = inputs.map((input, index) => ({ ...input, id: `judge-selftest-${index}` }));
    lifecycle = null;
    assertIdentity(plan.selection.ids, cases.map((row) => row.id), "selftest-membership");
  }
  if (jsonSha(cases) !== plan.selection.contentSha256 || jsonSha(lifecycle) !== plan.selection.lifecycleSha256) throw new Error("selected-input-changed");
  return { cases, lifecycle };
}
