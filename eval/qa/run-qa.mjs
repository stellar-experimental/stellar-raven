#!/usr/bin/env node
/**
 * run-qa.mjs — agentic golden Q→A runner (the A/B referee's driver).
 *
 * Contract: run(question, {searchVariant}) → {answer, transcript};
 * then judge(question, goldenAnswer, answer) → verdict. This script does both
 * per case and writes eval/qa/results/<stamp>.json + a console summary.
 *
 * For each case:
 *   1. drive an answering agent — headless `claude -p --model claude-sonnet-5`
 *      with a generated temp .mcp.json pointing at the live server
 *      (http://localhost:PORT/mcp), allowed tools = the variant's search tool
 *      + execute (verified working 2026-07-02)
 *   2. collect { answer, toolTranscript } from --output-format stream-json
 *   3. grade with judge.mjs (judgeCase)
 *
 * After a run: file service-level findings in improvements/ per eval/EVALS.md.
 *
 * Usage:
 *   npm run dev:eval -- --port 8788   # in another terminal
 *   (the launcher requires a clean worktree and compiles its commit into the
 *   Worker's MCP serverInfo)
 *   node eval/qa/run-qa.mjs --variant A --sample 30 [--port 8788]
 *
 * Flags:
 *   --variant A|B      A = host ranked-string search tool `search` — the
 *                      SHIPPED shape per ADR-0001
 *                      (research/decisions/0001-search-tool-shape.md); default A.
 *                      B = code-shaped spec search — no longer live by
 *                      default; running B requires a build that exposes a
 *                      code-shaped tool plus an explicit --search-tool.
 *   --search-tool name explicit search tool name override
 *   --sample N         deterministic stratified subset (same sampler used by
 *                      compile-qa.mjs for the committed sample.json)
 *   --ids a,b,c        run only these case ids (smoke tests)
 *   --port N           wrangler dev port (default 8788)
 *   --cases path       battery file (default eval/qa/cases.json). Named
 *                      hand-authored contracts include live-data-canonical-v3
 *                      (corpus/live/live-cases.json) and live-digest-supplement-v2
 *                      (corpus/live/live-digest-supplement-cases.json); run separately.
 *   --model name       answering-agent model (default claude-sonnet-5)
 *   --judge-model name judge model (default judge.mjs JUDGE_MODEL)
 *   --judge-panel N    force a 2- or 3-call judge panel. The default tier
 *                      starts with one call and can escalate to three.
 *   --max-panel-cases N cap boundary-triggered panels. The default is one-
 *                      third of the selected denominator, rounded up, with
 *                      a floor of 10 and a ceiling of 34. This flag or
 *                      QA_MAX_PANEL_CASES overrides that default.
 *                      Stability-triggered panels do not consume this cap.
 *   --stability-register path
 *                      use one frozen judge-stability register without
 *                      regenerating it. Paired runs must share this pin.
 *                      A pinned --judge-stored resume must reuse this path.
 *                      Unpinned resumes can refresh and cannot enter pairing.
 *   --surface name     search-execute (default) | per-operation. The latter
 *                      starts the isolated stdio proxy harness for the
 *                      manifest's 60 operations and still uses the existing
 *                      local Wrangler server for adapter/executor traffic.
 *   --server-revision  git revision of the checkout running the already-bound
 *                      Wrangler process (recorded for reproducibility)
 *   --expect-sha256    required SHA-256 of the bound MCP surface
 *   --expect-agent-binary-sha256
 *                      required SHA-256 of the capped Claude executable
 *   --no-judge         collect answers only (judge later)
 *   --judge-stored F   two-phase mode, phase 2: judge a saved --no-judge
 *                      results file IN PLACE (no server, no agent). Judges
 *                      every row without a verdict, stamps per-row judge cost,
 *                      summary, and meta cost totals into the SAME file.
 *                      Refuses if the case snapshot or judge tuple no longer
 *                      matches the recorded one (re-collect instead; the
 *                      loudly-labeled escape hatch stays re-judge.mjs).
 *
 * `re-judge.mjs` does not use stability tiering. Its default remains one
 * judge call, or the fixed panel selected by its own `--judge-panel` flag.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync, readdirSync, writeFileSync, mkdirSync, renameSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import {
  QA_DIR,
  formatSummaryTable,
  lifecycleSnapshot,
  lifecycleSnapshotSha256,
  loadCases,
  partitionLifecycleCases,
  stratifiedSample,
  summarize
} from "./lib.mjs";
import {
  buildAgentErrorVerdict,
  buildTranscriptEvidence,
  hasSuccessfulAnswer,
  isRetryableJudgeError,
  judgeInputSha256,
  judgeCase,
  judgeCaseTiered,
  createPanelCaseBudget,
  DEFAULT_PANEL_CASE_CEILING,
  DEFAULT_PANEL_CASE_DIVISOR,
  DEFAULT_PANEL_CASE_FLOOR,
  defaultMaxPanelCases,
  JUDGE_MODEL,
  JUDGE_RUBRIC
} from "./judge.mjs";
import {
  DEFAULT_STABILITY_REGISTER_PATH,
  DEFAULT_STABILITY_RESULTS_DIR,
  generateStabilityRegister,
  JUDGE_STABILITY_THRESHOLD,
  loadJudgeStabilityRegister
} from "./judge-stability.mjs";
import { verifySourceCases } from "./re-judge.mjs";
import { PACK_VERSION } from "./evidence-pack.mjs";
import { AGENT_RESULT_SCHEMA, parseAgentResult } from "./agent-result.mjs";
import {
  CASE_INPUT_IDENTITY,
  caseInputPayload,
  caseInputSha256
} from "./paired-verdict.mjs";
import { makeSearchResultProjector } from "./search-projection.mjs";
import {
  MCP_PROTOCOL_VERSION,
  assertExpectedSourceRevision,
  assertExpectedSurface,
  parseMcpHttpPayload,
  surfaceMetrics
} from "../lib/mcp-surface.mjs";
import {
  REQUIRED_MCP_SERVER_NAME,
  answeringAgentIsolationArgs,
  answeringAgentIsolationRecord,
  assertNeutralAgentCwd,
  assertRunPlan,
  formatCompletenessNotice,
  runCompleteness
} from "../lib/harness-guards.mjs";
import {
  agentEnvironmentIdentity,
  assertExpectedExecutable,
  executableIdentity
} from "../lib/executable-identity.mjs";
import {
  assertStableBoundServerIdentity,
  boundServerIdentity
} from "../lib/bound-server-identity.mjs";
import {
  PLAIN_SERVER_INSTRUCTIONS,
  loadPlainOperationSurface,
  operationIdFromPlainTool
} from "./plain-operation-harness.mjs";
import {
  QA_TRACK_SCHEMA,
  agentAttempts,
  buildFiveTrackSummary,
  costCompleteness,
  formatFiveTrackSummary,
  judgeAttempts,
  rowOutcomeClass,
  sha256Text
} from "./five-track.mjs";
import {
  BudgetAuthorizationExceededError,
  BudgetExhaustedError,
  MissingReportedCostError,
  authorizeSpend,
  createSpendLedger,
  formatBudgetUsd,
  parseMaxBudgetUsd,
  recordSpend,
  resumeSpendLedger,
  spendLedgerRecord
} from "./spend-budget.mjs";

// Variant→tool mapping post-ADR-0001: A (host-side ranked query) shipped as
// `search` (the `search_ranked` A/B alias retired with the decision). B
// (code-shaped {code} spec search) has NO default tool anymore — it is not
// registered top-level; re-testing it requires a build exposing a code-shaped
// tool via a --search-tool override.
const VARIANT_TOOL = { A: "search", B: null };
const AGENT_MODEL = "claude-sonnet-5";
const MAX_TURNS = 24;
const AGENT_TIMEOUT_MS = 10 * 60_000;
const SURFACES = new Set(["search-execute", "per-operation"]);
/** Repository root — the directory an answering agent must NOT be spawned in. */
const REPO_ROOT = path.resolve(QA_DIR, "..", "..");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

/** Float-noise guard for money totals; mirrors eval/qa/re-judge.mjs. */
function roundUsd(total) {
  return Number(total.toFixed(12));
}

function sumReported(values) {
  return roundUsd(values.reduce((sum, value) => sum + value, 0));
}

function reportedCosts(rows, pick) {
  return rows.map(pick).filter((cost) => Number.isFinite(cost));
}

/**
 * Spend provenance for one artifact. `judgeCase` can return a verdict with NO
 * costUsd when the provider omits cost data (eval/qa/judge.mjs), and the old
 * `costUsd ?? 0` totals made that indistinguishable from a genuinely free call —
 * understating real spend with no trace. Totals now sum ONLY reported costs, and
 * these counts say how many were reported out of how many were expected.
 *
 * Expected judge calls counts rows that actually reached a judge (answerable AND
 * verdicted), so an unjudged row reads as unjudged rather than as a lost cost.
 */
export function parseJudgePanel(value) {
  if (value === undefined) return 1;
  const panelSize = Number(value);
  if (!Number.isInteger(panelSize) || (panelSize !== 2 && panelSize !== 3)) {
    throw new Error(`--judge-panel must be 2 or 3, got ${value}`);
  }
  return panelSize;
}

export function parseRequiredBudgetFlag(args, { label = "run-qa" } = {}) {
  const indexes = args
    .map((arg, index) => arg === "--max-budget-usd" ? index : -1)
    .filter((index) => index !== -1);
  if (indexes.length === 0) throw new Error(`${label} requires --max-budget-usd for every paid run`);
  if (indexes.length > 1) throw new Error(`${label} accepts --max-budget-usd exactly once`);
  const value = args[indexes[0] + 1];
  if (value === undefined || value.startsWith("--")) {
    throw new Error("--max-budget-usd requires a value");
  }
  return parseMaxBudgetUsd(value);
}

export function parseMaxPanelCases(value) {
  if (value === undefined) return null;
  const trimmed = String(value).trim();
  if (!/^\d+$/.test(trimmed)) {
    throw new Error(`--max-panel-cases must contain only decimal digits, got ${value}`);
  }
  const maxPanelCases = Number(trimmed);
  if (!Number.isSafeInteger(maxPanelCases)) {
    throw new Error(`--max-panel-cases exceeds the safe integer range, got ${value}`);
  }
  return maxPanelCases;
}

export function parsePanelCaseOverride({
  cliValue,
  cliPresent = cliValue !== undefined,
  environmentValue
}) {
  if (cliPresent) {
    if (cliValue === undefined) {
      throw new Error("--max-panel-cases requires decimal digits");
    }
    return {
      maxPanelCases: parseMaxPanelCases(cliValue),
      maxPanelCasesSource: "cli-override"
    };
  }
  if (environmentValue !== undefined) {
    return {
      maxPanelCases: parseMaxPanelCases(environmentValue),
      maxPanelCasesSource: "environment-override"
    };
  }
  return { maxPanelCases: null, maxPanelCasesSource: "bounded-scaled-default" };
}

export function resolvePanelCaseLimit(
  selectedCaseCount,
  maxPanelCasesOverride = null,
  overrideSource = "explicit-override"
) {
  const scaled = defaultMaxPanelCases(selectedCaseCount);
  if (maxPanelCasesOverride == null) {
    return {
      selectedCaseCount,
      maxPanelCases: scaled,
      maxPanelCasesSource: "bounded-scaled-default"
    };
  }
  if (!Number.isInteger(maxPanelCasesOverride) || maxPanelCasesOverride < 0) {
    throw new Error(
      `max panel cases override must be a non-negative integer, got ${maxPanelCasesOverride}`
    );
  }
  return {
    selectedCaseCount,
    maxPanelCases: maxPanelCasesOverride,
    maxPanelCasesSource: overrideSource
  };
}

export function resolveStoredPanelCaseLimit({
  selectedCaseCount,
  storedJudgeTiering,
  maxPanelCasesOverride = null,
  overrideSource = "explicit-override"
}) {
  const storedMaxPanelCases = storedJudgeTiering?.maxPanelCases;
  if (storedMaxPanelCases === undefined) {
    return resolvePanelCaseLimit(selectedCaseCount, maxPanelCasesOverride, overrideSource);
  }
  if (!Number.isInteger(storedMaxPanelCases) || storedMaxPanelCases < 0) {
    throw new Error(`--judge-stored: stored panel cap is invalid: ${storedMaxPanelCases}`);
  }
  const storedSelectedCaseCount = storedJudgeTiering?.selectedCaseCount;
  if (
    storedSelectedCaseCount !== undefined &&
    storedSelectedCaseCount !== selectedCaseCount
  ) {
    throw new Error(
      `--judge-stored: stored selected denominator ${storedSelectedCaseCount}; ` +
      `current artifact has ${selectedCaseCount}`
    );
  }
  if (maxPanelCasesOverride !== null && maxPanelCasesOverride !== storedMaxPanelCases) {
    throw new Error(
      `--judge-stored: stored panel cap ${storedMaxPanelCases}; ` +
      `refusing to mix in ${maxPanelCasesOverride}`
    );
  }
  return {
    selectedCaseCount,
    maxPanelCases: storedMaxPanelCases,
    maxPanelCasesSource: storedJudgeTiering.maxPanelCasesSource ?? "stored-artifact"
  };
}

export function panelCaseCounts(rows) {
  let boundaryEligibleCases = 0;
  let panelUsedCases = 0;
  let panelSkippedCases = 0;
  let boundaryPanelCases = 0;
  for (const row of rows ?? []) {
    const tier = row.verdict?.meta;
    const used = tier?.judgeTierUsed === "panel";
    const skipped = tier?.panelEscalationSkipped === "max-panel-cases";
    const boundaryEligible = String(tier?.escalationReason ?? "").startsWith("boundary-");
    if (boundaryEligible) boundaryEligibleCases += 1;
    if (used) panelUsedCases += 1;
    if (skipped) panelSkippedCases += 1;
    if (used && boundaryEligible) {
      boundaryPanelCases += 1;
    }
  }
  return { boundaryEligibleCases, panelUsedCases, panelSkippedCases, boundaryPanelCases };
}

export function formatPanelSummary(judgeTiering, phase = "after") {
  return (
    `judge panels ${phase}: cap ${judgeTiering.maxPanelCases} · ` +
    `source ${judgeTiering.maxPanelCasesSource} · selected ${judgeTiering.selectedCaseCount} · ` +
    `boundary-eligible ${judgeTiering.boundaryEligibleCases} · ` +
    `used ${judgeTiering.panelUsedCases} · skipped ${judgeTiering.panelSkippedCases}`
  );
}

export function prepareJudgeStabilityRegister({
  resultsDir = DEFAULT_STABILITY_RESULTS_DIR,
  registerPath = DEFAULT_STABILITY_REGISTER_PATH,
  pinnedPath = null,
  log = console.log,
  warn = console.warn
} = {}) {
  const selectedPath = path.resolve(pinnedPath ?? registerPath);
  if (pinnedPath) {
    const loaded = loadJudgeStabilityRegister(selectedPath, { verifySources: false });
    if (loaded.status !== "available") {
      throw new Error(
        `--stability-register is not an available register: ${loaded.reason ?? loaded.status}`
      );
    }
    log(`judge-stability pin: ${selectedPath} · sha256 ${loaded.sha256}`);
    return { ...loaded, source: "pinned", path: selectedPath };
  }
  if (existsSync(resultsDir)) {
    try {
      const generated = generateStabilityRegister({ resultsDir, outPath: selectedPath });
      log(
        `judge-stability refresh: ${generated.caseCount} case(s) from ` +
        `${generated.sourceArtifactCount} artifact(s)`
      );
    } catch (error) {
      warn(
        `warning: judge-stability refresh failed; continuing without a hard dependency: ` +
        `${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
  return {
    ...loadJudgeStabilityRegister(selectedPath),
    source: "regenerated",
    path: selectedPath
  };
}

export function judgeTieringMetadata({
  judgePanel,
  stabilityRegister,
  panelLimit,
  rows
}) {
  const counts = panelCaseCounts(rows);
  return {
    policy: judgePanel > 1 ? "forced-panel" : "stability-boundary-v1",
    judgePanel,
    stabilityThreshold: JUDGE_STABILITY_THRESHOLD,
    stabilityRegisterStatus: stabilityRegister.status,
    stabilityRegisterSource: stabilityRegister.source ?? "regenerated",
    stabilityRegisterPath: stabilityRegister.path ?? null,
    stabilityRegisterReason: stabilityRegister.reason ?? null,
    stabilityRegisterSha256: stabilityRegister.sha256 ?? null,
    stabilityRegisterGeneratedAt: stabilityRegister.generatedAt ?? null,
    stabilityRegisterSourceArtifactCount: stabilityRegister.sourceArtifactCount ?? null,
    stabilityRegisterCaseCount: stabilityRegister.caseCount ?? 0,
    selectedCaseCount: panelLimit.selectedCaseCount,
    maxPanelCases: panelLimit.maxPanelCases,
    maxPanelCasesSource: panelLimit.maxPanelCasesSource,
    defaultPanelPolicy: {
      kind: "clamped-one-third",
      numerator: 1,
      denominator: DEFAULT_PANEL_CASE_DIVISOR,
      rounding: "ceil",
      floor: DEFAULT_PANEL_CASE_FLOOR,
      ceiling: DEFAULT_PANEL_CASE_CEILING
    },
    ...counts
  };
}

export function qaMeasurementMetrics(rows, compiledCases) {
  const caseById = compiledCases instanceof Map
    ? compiledCases
    : new Map((compiledCases ?? []).map((kase) => [kase.id, kase]));
  const verdictRows = rows.filter((row) => typeof row.verdict?.score === "string");
  const gradedRows = verdictRows.filter((row) => ["correct", "partial", "wrong"].includes(row.verdict.score));
  const correctRows = rows.filter((row) => row.verdict?.score === "correct").length;
  const partialRows = rows.filter((row) => row.verdict?.score === "partial").length;
  const coreCorrectRows = gradedRows.filter((row) => row.verdict.coreAnswer === "correct").length;
  const gradedCoreAnswerNullCount = gradedRows.filter((row) => row.verdict.coreAnswer == null).length;
  const coverage = gradedRows.flatMap((row) => {
    const keyFacts = caseById.get(row.id)?.golden?.keyFacts;
    if (!Array.isArray(keyFacts) || keyFacts.length === 0 || !Array.isArray(row.verdict.missingFacts)) return [];
    return [1 - row.verdict.missingFacts.length / keyFacts.length];
  });
  return {
    halfCreditShare: rows.length ? (correctRows + partialRows / 2) / rows.length : null,
    strictCorrectShare: rows.length ? correctRows / rows.length : null,
    coreAnswerCorrectShare: gradedRows.length ? coreCorrectRows / gradedRows.length : null,
    gradedCoreAnswerNullCount,
    coreAnswerVerdictCount: gradedRows.length,
    meanContinuousCoverage: coverage.length
      ? coverage.reduce((sum, value) => sum + value, 0) / coverage.length
      : null,
    continuousCoverageRowCount: coverage.length
  };
}

export function formatMeasurementMetrics(metrics) {
  const share = (value) => value == null ? "n/a" : `${(value * 100).toFixed(1)}%`;
  return [
    `half-credit ${share(metrics.halfCreditShare)}`,
    `strict-correct ${share(metrics.strictCorrectShare)}`,
    `core-answer-correct ${share(metrics.coreAnswerCorrectShare)} (${metrics.gradedCoreAnswerNullCount} graded null)`,
    `mean continuous coverage ${share(metrics.meanContinuousCoverage)} (${metrics.continuousCoverageRowCount} rows)`
  ].join(" · ");
}

/** Totals over REPORTED costs only, plus the counts that qualify them. */
function costTotals(rows) {
  const answerAttempts = rows.flatMap((row) => agentAttempts(row));
  const storedJudgeAttempts = rows.flatMap((row) => judgeAttempts(row));
  const agentCosts = reportedCosts(answerAttempts, (attempt) => attempt.costUsd);
  const judgeCosts = storedJudgeAttempts.length
    ? reportedCosts(storedJudgeAttempts, (attempt) => attempt.costUsd)
    : reportedCosts(rows, (row) => row.verdict?.costUsd);
  return {
    totalAgentCostUsd: sumReported(agentCosts),
    totalJudgeCostUsd: sumReported(judgeCosts),
    totalCostUsd: sumReported([...agentCosts, ...judgeCosts]),
    costAccounting: costCompleteness(rows)
  };
}

function gitValue(args) {
  const result = spawnSync("git", args, { cwd: path.resolve(QA_DIR, "..", ".."), encoding: "utf8" });
  return result.status === 0 ? String(result.stdout).trim() : null;
}

export function assertPinnedServerRevision(serverRevision, repoRoot = path.resolve(QA_DIR, "..", "..")) {
  const revision = typeof serverRevision === "string" ? serverRevision.trim() : "";
  if (!revision) {
    throw new Error("--server-revision is required before collection");
  }
  if (!/^[a-f0-9]{40}$/i.test(revision)) {
    throw new Error("--server-revision must be an immutable 40-character Git commit SHA");
  }
  const resolved = spawnSync("git", ["rev-parse", "--verify", `${revision}^{commit}`], {
    cwd: repoRoot,
    encoding: "utf8"
  });
  if (resolved.status !== 0 || String(resolved.stdout).trim().toLowerCase() !== revision.toLowerCase()) {
    throw new Error(`--server-revision ${revision} does not resolve to an exact local commit`);
  }
  return String(resolved.stdout).trim();
}

export function assertCollectionSourceIdentity(identity) {
  if (!identity || identity.runnerDirty !== false) {
    throw new Error("QA collection requires a clean runner working tree");
  }
  if (!/^[a-f0-9]{40}$/i.test(identity.runnerRevision ?? "")) {
    throw new Error("QA collection requires an immutable runner revision");
  }
  if (!/^[a-f0-9]{40}$/i.test(identity.serverRevision ?? "")) {
    throw new Error("QA collection requires an immutable server revision");
  }
  if (!/^[a-f0-9]{64}$/.test(identity.qaImplementationSha256 ?? "")) {
    throw new Error("QA collection requires an exact QA implementation hash");
  }
  return identity;
}

export function sourceIdentityGuard(before, after) {
  const changedKeys = [...new Set([...Object.keys(before ?? {}), ...Object.keys(after ?? {})])]
    .sort()
    .filter((key) => JSON.stringify(before?.[key]) !== JSON.stringify(after?.[key]));
  return changedKeys.length ? { matches: false, changedKeys } : { matches: true };
}

export function collectionGitStatus(status) {
  if (status === null) return null;
  return status
    .split("\n")
    .filter((line) => line && line !== "?? eval/qa/judge-stability.json")
    .join("\n");
}

export function sourceIdentity(serverRevision) {
  const repoRoot = path.resolve(QA_DIR, "..", "..");
  const statusResult = spawnSync(
    "git",
    ["status", "--porcelain=v1", "--untracked-files=all"],
    { cwd: repoRoot, encoding: "utf8" }
  );
  const status = statusResult.status === 0
    ? collectionGitStatus(String(statusResult.stdout))
    : null;
  const libraryDir = path.resolve(QA_DIR, "../lib");
  const fileSha256 = (name) => sha256(readFileSync(path.join(QA_DIR, name), "utf8"));
  const qaImplementationFiles = [
    ...readdirSync(QA_DIR)
      .filter((name) => name.endsWith(".mjs"))
      .map((name) => ({ label: name, filePath: path.join(QA_DIR, name) })),
    ...readdirSync(libraryDir)
      .filter((name) => name.endsWith(".mjs"))
      .map((name) => ({ label: `../lib/${name}`, filePath: path.join(libraryDir, name) }))
  ];
  const qaImplementationRecords = qaImplementationFiles
    .sort((a, b) => a.label.localeCompare(b.label))
    .map(({ label, filePath }) => `${label}\0${sha256(readFileSync(filePath, "utf8"))}`)
    .join("\n");
  return {
    runnerRevision: gitValue(["rev-parse", "HEAD"]),
    runnerDirty: status === null ? null : status.length > 0,
    runnerStatusSha256: status === null ? null : sha256(status),
    serverRevision: serverRevision ?? null,
    qaImplementationSha256: sha256(qaImplementationRecords),
    manifestFileSha256: sha256(readFileSync(path.join(repoRoot, "catalog", "manifest.json"), "utf8")),
    runnerFileSha256: fileSha256("run-qa.mjs"),
    agentResultFileSha256: fileSha256("agent-result.mjs"),
    evidencePackFileSha256: fileSha256("evidence-pack.mjs"),
    judgeFileSha256: fileSha256("judge.mjs"),
    plainHarnessFileSha256: fileSha256("plain-operation-harness.mjs")
  };
}

export function agentPrompt(question, { surface, searchTool }) {
  const promptAppend = process.env.QA_AGENT_PROMPT_APPEND?.trim();
  if (surface === "per-operation") {
    return `You answer questions about the Stellar ecosystem using ONLY this session's manifest-derived MCP operation tools.

The tools are named mcp__raven__<service>_<operation> for the lumenloop, scout, and stellarDocs source families. Choose operations directly from their descriptions and input schemas. Fan out independent broad calls when useful, then make targeted detail calls using ids or slugs returned by broad calls.

Rules:
- Ground every specific claim (names, numbers, SEP/CAP ids, commands, URLs) in tool results. Never invent them.
- State an as-of date for each changeable roster, status, or value. Keep exact symbols, types, and formulas from tool results.
- Tool results use { ok: true, data } | { ok: false, error }; read payload under data, and treat soft-empty as inconclusive.
- If the tools cannot support an answer — the question is out of scope, the thing does not exist, or the request itself is something you should not do — say that plainly and briefly instead of guessing or playing along.
- Do not use any tool outside the raven MCP operation set.
- Your FINAL message must be the answer itself: concise, fact-dense, with source URLs from tool results where available. No preamble, no meta-commentary about tools.
${promptAppend ? `\nAdditional run instructions:\n${promptAppend}\n` : ""}

QUESTION:
${question}`;
  }
  return `You answer questions about the Stellar ecosystem using ONLY this session's MCP tools:

- mcp__raven__${searchTool} — discover what the catalog can do (service operations, skills)
- mcp__raven__execute — run JavaScript that calls the discovered operations and returns data

Workflow: call ${searchTool} first with a short intent phrase, read the hits, then write execute scripts that gather real evidence (compose several operations; follow up with detail calls). Search again with different terms if the first pass misses.

Rules:
- Ground every specific claim (names, numbers, SEP/CAP ids, commands, URLs) in tool results. Never invent them.
- State an as-of date for each changeable roster, status, or value. Keep exact symbols, types, and formulas from tool results.
- If the tools cannot support an answer — the question is out of scope, the thing does not exist, or the request itself is something you should not do — say that plainly and briefly instead of guessing or playing along.
- Do not use any tool other than the two named above.
- Your FINAL message must be the answer itself: concise, fact-dense, with source URLs from tool results where available. No preamble, no meta-commentary about tools.
${promptAppend ? `\nAdditional run instructions:\n${promptAppend}\n` : ""}

QUESTION:
${question}`;
}

/**
 * Build the exact spawn for one answering agent. Exported so the neutral
 * working directory is assertable without paying for a live agent call: the
 * `cwd` is the whole of precondition P2 and it is invisible in the artifact.
 */
export function buildAgentSpawn({
  prompt,
  allowedTools,
  mcpConfigPath,
  model,
  cwd,
  command = "claude",
  environment = process.env,
  maxBudgetUsd = null
}) {
  assertNeutralAgentCwd(cwd, { repoRoot: REPO_ROOT, label: "run-qa answering agent" });
  return {
    command,
    args: [
      "-p",
      "--model",
      model,
      "--output-format",
      "stream-json",
      "--verbose",
      "--mcp-config",
      mcpConfigPath,
      "--strict-mcp-config",
      ...(maxBudgetUsd === null ? [] : ["--max-budget-usd", formatBudgetUsd(maxBudgetUsd)]),
      ...answeringAgentIsolationArgs(environment),
      "--allowedTools",
      allowedTools.join(","),
      "--max-turns",
      String(MAX_TURNS)
    ],
    options: {
      input: prompt,
      encoding: "utf8",
      timeout: AGENT_TIMEOUT_MS,
      maxBuffer: 64 * 1024 * 1024,
      // The agent under test must not read this repository's AGENTS.md and
      // CLAUDE.md — they describe the measurement grading it.
      cwd
    }
  };
}

/**
 * Run one answering agent once and hand the raw spawn to the pure parser.
 * The caller owns the transport-only retry and its total budget ledger.
 */
export function runAgent(question, {
  surface,
  searchTool,
  allowedTools,
  mcpConfigPath,
  model,
  agentCwd,
  agentCommand,
  maxBudgetUsd = null
}) {
  const prompt = agentPrompt(question, { surface, searchTool });
  const spawn = buildAgentSpawn({
    prompt,
    allowedTools,
    mcpConfigPath,
    model,
    cwd: agentCwd,
    command: agentCommand,
    maxBudgetUsd
  });
  const res = spawnSync(spawn.command, spawn.args, spawn.options);
  const searchToolNames =
    surface === "search-execute" ? [`mcp__raven__${searchTool}`] : [];
  const isSearchTool = (tool) => searchToolNames.includes(String(tool));
  const keepWholeResult = (tool) =>
    tool.endsWith("execute") || operationIdFromPlainTool(String(tool).replace(/^mcp__[^_]+__/, "")) !== null;
  const parsed = parseAgentResult(
    {
      stdout: res.stdout ?? "",
      stderr: res.stderr ?? "",
      status: res.status,
      signal: res.signal,
      spawnError: res.error ? { message: res.error.message, code: res.error.code } : null
    },
    {
      promptChars: prompt.length,
      // execute inputs/results are kept whole — eval/plan/grade-plan.mjs parses
      // the {code} for service-op extraction and eval/qa/analyze-composition.mjs
      // reads the results for truncation footers and skill.run `calls` tallies.
      // Bounded: the server already caps execute results at ~6k tokens via
      // truncateForModel (src/policy/truncate.ts). The per-operation surface's
      // manifest tools get the same whole treatment for the same reason.
      keepWholeResult,
      // The search QUERY is the routing behaviour under test, so it is never
      // sliced. Its RESULT includes descriptions, signatures, and conditional
      // response guidance, so it is projected instead of stored.
      keepWholeInput: (tool) => keepWholeResult(tool) || isSearchTool(tool),
      projectResult: makeSearchResultProjector(searchToolNames),
      requiredMcpServerName: REQUIRED_MCP_SERVER_NAME
    }
  );
  return {
    ...parsed,
    inputSha256: sha256(prompt),
    answerSha256: sha256Text(parsed.answer)
  };
}

export function agentAttemptRecord(run, number, durationMs) {
  return {
    number,
    inputSha256: run.inputSha256,
    answerSha256: run.answerSha256,
    failureClass: run.failure?.class ?? null,
    costUsd: Number.isFinite(run.costUsd) ? run.costUsd : null,
    answer: run.answer,
    transcript: run.transcript,
    agent: {
      turns: run.turns,
      costUsd: run.costUsd,
      usage: run.usage,
      mcpServers: run.mcpServers,
      promptChars: run.promptChars,
      stderr: run.stderr,
      failure: run.failure
    },
    artifacts: run.artifacts,
    durationMs
  };
}

function budgetFailureVerdict(error, calls) {
  return {
    score: "error",
    coreAnswer: null,
    missingFacts: [],
    wrongClaims: [],
    avoidMatches: [],
    consistencyViolations: [],
    rationale: error.message,
    failureClass: error instanceof BudgetExhaustedError ? "budget-exhausted" : "budget-cost",
    rubric: JUDGE_RUBRIC,
    packVersion: PACK_VERSION,
    promptSha256: calls[0]?.inputSha256 ?? null
  };
}

/** One judge method attempt. Its calls retain panel-call costs separately. */
export async function runJudgeAttempt(
  input,
  {
    number,
    kind,
    judgeModel,
    judgePanel,
    judge,
    stabilityRegister,
    panelBudget,
    spendLedger
  }
) {
  const calls = [];
  const inputSha256 = judgeInputSha256(input);
  const budgetedJudge = async (judgeInput, judgeOptions) => {
    const callNumber = calls.length + 1;
    const authorization = authorizeSpend(spendLedger, {
      method: "judge",
      id: input.id,
      attempt: `${number}.${callNumber}`
    });
    const verdict = await judge(judgeInput, {
      ...judgeOptions,
      maxBudgetUsd: authorization.maxBudgetUsd
    });
    const call = {
      number: callNumber,
      inputSha256: verdict?.promptSha256 ?? inputSha256,
      answerSha256: sha256Text(input.candidateAnswer),
      failureClass: verdict?.failureClass ?? null,
      costUsd: Number.isFinite(verdict?.costUsd) ? verdict.costUsd : null,
      verdict
    };
    calls.push(call);
    try {
      recordSpend(spendLedger, authorization, verdict?.costUsd);
    } catch (error) {
      error.judgeCall = call;
      throw error;
    }
    return verdict;
  };
  let verdict;
  try {
    verdict = await judgeCaseTiered(input, {
      model: judgeModel,
      judgePanel,
      judge: budgetedJudge,
      stabilityRegister,
      panelBudget
    });
  } catch (error) {
    if (calls.length === 0) throw error;
    const attempt = {
      number,
      kind,
      inputSha256,
      answerSha256: sha256Text(input.candidateAnswer),
      failureClass:
        error instanceof BudgetExhaustedError ? "budget-exhausted" :
          error instanceof MissingReportedCostError || error.code === "budget-cost" ? "budget-cost" : "harness",
      costUsd: calls.some((call) => Number.isFinite(call.costUsd))
        ? sumReported(calls.filter((call) => Number.isFinite(call.costUsd)).map((call) => call.costUsd))
        : null,
      verdict: budgetFailureVerdict(error, calls),
      calls
    };
    error.judgeAttempt = attempt;
    throw error;
  }
  return {
    number,
    kind,
    inputSha256: verdict.promptSha256 ?? inputSha256,
    answerSha256: sha256Text(input.candidateAnswer),
    failureClass: verdict.failureClass ?? null,
    costUsd: Number.isFinite(verdict.costUsd) ? verdict.costUsd : null,
    verdict,
    calls
  };
}

/** Enforce one total eligible retry across inline and stored judging. */
export async function judgeRowWithRetry(input, options, existingAttempts = []) {
  const attempts = existingAttempts;
  const onAttempt = options.onAttempt ?? (() => {});
  const first = attempts[0] ?? null;
  if (!first) {
    const attempt = await runJudgeAttempt(input, {
      ...options,
      number: 1,
      kind: "initial"
    });
    attempts.push(attempt);
    await onAttempt(attempts);
  }
  if (attempts.length === 1 && isRetryableJudgeError(attempts[0].verdict)) {
    const retry = await runJudgeAttempt(input, {
      ...options,
      number: 2,
      kind: "retry"
    });
    attempts.push(retry);
    await onAttempt(attempts);
  }
  return attempts;
}

export function isRequiredMcpServerFailure(failure) {
  return (
    failure?.class === "protocol" &&
    String(failure.reason ?? "").startsWith(`required MCP server ${REQUIRED_MCP_SERVER_NAME}`)
  );
}

export function isRetryableAgentFailure(failure) {
  return failure?.class === "transport" && failure.retryable === true;
}

/** Build the production five-track report from the immutable selected cases. */
export function buildRunnerTracks({ selectedCases, rows, unjudgedSelectedIds = null, lifecyclePartition = null }) {
  const partition = lifecyclePartition ?? partitionLifecycleCases(selectedCases);
  return buildFiveTrackSummary({
    selectedIds: partition.selected.map((kase) => kase.id),
    activeSelectedIds: partition.activeIds,
    quarantinedIds: partition.quarantinedIds,
    selectedTrapIds: partition.active.filter((kase) => Boolean(kase.tags?.trap)).map((kase) => kase.id),
    rows,
    unjudgedSelectedIds
  });
}

export function verifyStoredLifecycleSnapshot(results, currentSelectedCases) {
  const snapshot = results.meta?.inputSnapshot?.lifecycle;
  const expectedSha256 = results.meta?.inputSnapshot?.lifecycleSha256;
  if (!Array.isArray(snapshot) || !/^[a-f0-9]{64}$/.test(expectedSha256 ?? "")) {
    throw new Error("--judge-stored: a valid collection-time lifecycle snapshot is required; re-collect");
  }
  if (lifecycleSnapshotSha256(snapshot) !== expectedSha256) {
    throw new Error("--judge-stored: the collection-time lifecycle snapshot digest is invalid; re-collect");
  }
  const rowIds = results.rows.map((row) => row.id);
  const snapshotIds = snapshot.map((entry) => entry?.id);
  if (JSON.stringify(snapshotIds) !== JSON.stringify(rowIds)) {
    throw new Error("--judge-stored: the collection-time lifecycle snapshot does not match the stored row order; re-collect");
  }
  if (results.meta?.selectedIds && JSON.stringify(snapshotIds) !== JSON.stringify(results.meta.selectedIds)) {
    throw new Error("--judge-stored: the collection-time lifecycle snapshot does not match selectedIds; re-collect");
  }
  const rowSnapshot = results.rows.map((row) => ({ id: row.id, lifecycle: row.truth?.lifecycle }));
  if (JSON.stringify(rowSnapshot) !== JSON.stringify(snapshot)) {
    throw new Error("--judge-stored: stored row lifecycle differs from the collection snapshot; re-collect");
  }
  const currentSnapshot = lifecycleSnapshot(currentSelectedCases);
  if (JSON.stringify(currentSnapshot) !== JSON.stringify(snapshot)) {
    throw new Error("--judge-stored: current lifecycle differs from the collection snapshot; re-collect");
  }
  const selectedCases = currentSelectedCases.map((kase, index) => ({
    ...kase,
    truth: { ...kase.truth, lifecycle: snapshot[index].lifecycle }
  }));
  return { snapshot, selectedCases, partition: partitionLifecycleCases(selectedCases) };
}

/** Raw judge-score diagnostics are not the T1 quality or T3 safety report. */
export function formatRawFirstAttemptDiagnostics(summary) {
  return [
    "raw first-attempt judge-score diagnostics (not T1 quality or T3 safety)",
    formatSummaryTable(summary, { includeTraps: false })
  ].join("\n");
}

export async function probeLiveSurface(port, { surface, searchTool, plainSurface }) {
  if (surface === "per-operation" && !plainSurface) {
    throw new Error('probeLiveSurface requires plainSurface for the "per-operation" surface');
  }
  const url = `http://localhost:${port}/mcp`;
  const post = async (body) => {
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        // The synchronous agent can outlive Wrangler's pooled socket. Use a fresh
        // connection for each probe; see research/audits/2026-08-27-qa-postflight-keepalive.md.
        connection: "close"
      },
      body: JSON.stringify(body)
    });
    const text = await r.text();
    if (!r.ok) throw new Error(`${url} → HTTP ${r.status}: ${text.slice(0, 200)}`);
    return parseMcpHttpPayload(text);
  };
  const initialized = await post({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: MCP_PROTOCOL_VERSION,
      capabilities: {},
      clientInfo: { name: "run-qa", version: "0" }
    }
  });
  const list = await post({ jsonrpc: "2.0", id: 2, method: "tools/list", params: {} });
  const upstreamTools = list.result?.tools ?? [];
  const names = upstreamTools.map((t) => t.name);
  const required = surface === "per-operation" ? ["execute"] : [searchTool, "execute"];
  for (const need of required) {
    if (!names.includes(need)) {
      throw new Error(
        `live server at :${port} exposes [${names.join(", ")}] — required tool "${need}" is missing. ` +
          `Wrong --variant for this build? (A→search per ADR-0001; B needs --search-tool against a code-shaped build)`
      );
    }
  }
  if (surface === "per-operation") {
    return {
      upstreamNames: names,
      exposedNames: plainSurface.tools.map((tool) => tool.name),
      metrics: { ...plainSurface.metrics, instructionsSha256: sha256(PLAIN_SERVER_INSTRUCTIONS) },
      serverInfo: initialized.result?.serverInfo ?? null
    };
  }
  return {
    upstreamNames: names,
    exposedNames: names,
    metrics: surfaceMetrics(upstreamTools, initialized.result?.instructions),
    serverInfo: initialized.result?.serverInfo ?? null
  };
}

/**
 * Two-phase mode, phase 2: judge every unjudged row of a saved results file
 * and write the judged file back IN PLACE (same path, same shape run-qa
 * writes when judging inline). Guards mirror re-judge.mjs: the recorded case
 * snapshot must still reproduce from meta.casesPath, the evidence-pack
 * builder must reproduce each row's collection-time pack hash, and a
 * partially judged file must be resumed with the same judge tuple. There is
 * deliberately no override flag — a drifted snapshot means re-collect (or use
 * re-judge.mjs --allow-non-identical for a loudly-labeled side artifact).
 *
 * `judge` is injectable for tests only; production callers use the default.
 */
export async function judgeStoredResults(
  resultsPath,
  {
    judgeModel = JUDGE_MODEL,
    judgePanel = 1,
    judge = judgeCase,
    judgeBinary = null,
    judgeEnvironment = null,
    maxPanelCases = null,
    maxPanelCasesSource = "explicit-override",
    stabilityRegister = loadJudgeStabilityRegister(),
    maxBudgetUsd = null,
    log = console.log
  } = {}
) {
  const sourceText = readFileSync(resultsPath, "utf8");
  const results = JSON.parse(sourceText);
  if (results.meta?.comparable === false) {
    throw new Error(
      `--judge-stored: artifact is non-comparable: ${(results.meta.comparabilityReasons ?? []).join("; ") || "collection guard failed"}`
    );
  }
  if (!Array.isArray(results?.rows) || results.rows.length === 0) {
    throw new Error("--judge-stored: results file has no rows[]");
  }
  const meta = results.meta ?? {};
  for (const row of results.rows) {
    const persistedAgentAttempts = agentAttempts(row);
    const persistedJudgeAttempts = judgeAttempts(row);
    row.attempts = {
      agent: persistedAgentAttempts,
      judge: persistedJudgeAttempts
    };
    row.firstAttempt ??= {
      agent: persistedAgentAttempts.length ? 1 : null,
      judge: persistedJudgeAttempts.length ? 1 : null,
      inputSha256: persistedAgentAttempts[0]?.inputSha256 ?? null,
      answerSha256: persistedAgentAttempts[0]?.answerSha256 ?? null
    };
    row.outcomeClass = rowOutcomeClass(row);
  }
  const spendLedger = resumeSpendLedger(maxBudgetUsd, meta.budget ?? null);
  if (meta.packVersion !== PACK_VERSION) {
    throw new Error(
      `--judge-stored: results were collected with evidence pack ${meta.packVersion}, current is ${PACK_VERSION} — re-collect, or re-judge.mjs --allow-non-identical for a side artifact`
    );
  }
  if (meta.resultsSchema !== AGENT_RESULT_SCHEMA) {
    throw new Error(
      `--judge-stored: results were collected under agent-result schema ${meta.resultsSchema ?? "none"}, current is ${AGENT_RESULT_SCHEMA} — the stored failure/usage shape moved since collection; re-collect`
    );
  }
  if (meta.judgeModel != null && meta.judgeModel !== judgeModel) {
    throw new Error(
      `--judge-stored: file already carries verdicts from judge model ${meta.judgeModel}; refusing to mix in ${judgeModel}`
    );
  }
  if (meta.judgeRubric != null && meta.judgeRubric !== JUDGE_RUBRIC) {
    throw new Error(
      `--judge-stored: file already carries verdicts under rubric ${meta.judgeRubric}, current is ${JUDGE_RUBRIC} — use re-judge.mjs for cross-rubric work`
    );
  }
  const hasSavedVerdicts = results.rows.some((row) => typeof row.verdict?.score === "string");
  const recordedJudgePanel = meta.judgePanel ?? 1;
  if (hasSavedVerdicts && recordedJudgePanel !== judgePanel) {
    throw new Error(
      `--judge-stored: file already carries judge panel size ${recordedJudgePanel}; refusing to mix in ${judgePanel}`
    );
  }
  const recordedRegisterSource = meta.judgeTiering?.stabilityRegisterSource;
  const recordedRegisterSha256 = meta.judgeTiering?.stabilityRegisterSha256;
  const currentRegisterSource = stabilityRegister.source ?? "regenerated";
  const currentRegisterSha256 = stabilityRegister.sha256 ?? null;
  const resumeUsesPin =
    recordedRegisterSource === "pinned" || currentRegisterSource === "pinned";
  if (
    hasSavedVerdicts &&
    recordedRegisterSource != null &&
    resumeUsesPin &&
    (
      recordedRegisterSource !== currentRegisterSource ||
      recordedRegisterSha256 !== currentRegisterSha256
    )
  ) {
    throw new Error(
      "--judge-stored: file already carries a different stability-register contract"
    );
  }
  const identity = verifySourceCases(results, resultsPath);
  const lifecycleGuard = verifyStoredLifecycleSnapshot(results, identity.selectedCases);
  const storedSelectedCases = lifecycleGuard.selectedCases;
  const storedLifecyclePartition = lifecycleGuard.partition;
  const storedActiveIds = new Set(storedLifecyclePartition.activeIds);
  const storedActiveRows = () => results.rows.filter((row) => storedActiveIds.has(row.id));
  if (!identity.guard.matches) {
    throw new Error(
      `--judge-stored: case input snapshot differs (expected ${identity.guard.expectedCasesSha256}, got ${identity.guard.actualCasesSha256}; missing ids: ${identity.guard.missingCaseIds.join(", ") || "none"}) — the golden corpus moved since collection; re-collect`
    );
  }
  const panelLimit = resolveStoredPanelCaseLimit({
    selectedCaseCount: storedLifecyclePartition.active.length,
    storedJudgeTiering: meta.judgeTiering,
    maxPanelCasesOverride: maxPanelCases,
    overrideSource: maxPanelCasesSource
  });

  // Explicit judge CLI and parse classes on answered rows remain retryable.
  // Untyped legacy errors are terminal because their timeout and safeguard
  // status cannot be reconstructed safely. Send those rows through re-judge.
  const unjudged = results.rows.filter((row) => {
    const attempts = row.attempts.judge;
    if (!hasSuccessfulAnswer(row.answer, row.agent?.failure)) {
      return typeof row.verdict?.score !== "string";
    }
    if (attempts.length === 0) return true;
    return attempts.length === 1 && isRetryableJudgeError(attempts[0].verdict);
  });

  // Every persisted state must be internally consistent, so finalize stamps
  // costs + summary and writes atomically. A resume that finds nothing left to
  // judge still finalizes: a crash between the last row and the old
  // end-of-run write used to leave summary:null with stale costs and no way
  // back (re-running threw "nothing to judge").
  const priorJudgeStored = meta.judgeStored ?? {};
  const incompleteJudgeIds = new Set(priorJudgeStored.incompleteIds ?? []);
  const paidIds = [];
  let processedCount = 0;
  const existingPanelCounts = panelCaseCounts(results.rows);
  const panelBudget = createPanelCaseBudget(
    panelLimit.maxPanelCases,
    existingPanelCounts.boundaryPanelCases
  );
  const sourceResultsSha256 = priorJudgeStored.sourceResultsSha256 ?? sha256(sourceText);
  const collectionAggregatesAllowed =
    meta.comparable !== false && meta.completeness?.aggregatesAllowed === true;
  const initiallyJudgedIds = results.rows
    .filter((row) => row.attempts.judge.length > 0)
    .map((row) => row.id);
  const writeState = ({ withSummary }) => {
    meta.judgeModel = judgeModel;
    meta.judgeRubric = JUDGE_RUBRIC;
    meta.judgePanel = judgePanel;
    meta.judgeTiering = judgeTieringMetadata({
      judgePanel,
      stabilityRegister,
      panelLimit,
      rows: results.rows
    });
    const totals = costTotals(results.rows);
    Object.assign(meta, totals);
    // P4 for the two-phase path: the case snapshot is already guarded by
    // verifySourceCases, so what stays checkable here is the judged
    // denominator — a summary must never describe partly judged rows.
    const completeness = runCompleteness({
      expectedIds: results.rows.map((row) => row.id),
      rows: results.rows,
      judging: true
    });
    meta.judgingCompleteness = completeness;
    const aggregatesAllowed = collectionAggregatesAllowed && completeness.aggregatesAllowed;
    meta.aggregatesSuppressed = !aggregatesAllowed;
    const measurementMetrics = qaMeasurementMetrics(storedActiveRows(), storedLifecyclePartition.active);
    for (const key of Object.keys(measurementMetrics)) delete meta[key];
    if (aggregatesAllowed) Object.assign(meta, measurementMetrics);
    if (judgeBinary) meta.judgeBinary = judgeBinary;
    if (judgeEnvironment) meta.judgeEnvironment = judgeEnvironment;
    meta.trackSchema = QA_TRACK_SCHEMA;
    meta.selectedIds ??= results.rows.map((row) => row.id);
    meta.lifecycle = {
      activeCount: storedLifecyclePartition.active.length,
      selectedCount: storedSelectedCases.length,
      activeIds: storedLifecyclePartition.activeIds,
      excludedQuarantinedIds: storedLifecyclePartition.quarantinedIds
    };
    meta.unattemptedIds = meta.selectedIds.filter(
      (id) => !results.rows.some((row) => row.id === id)
    );
    const unjudgedSelectedIds = results.rows
      .filter((row) => hasSuccessfulAnswer(row.answer, row.agent?.failure) && row.attempts.judge.length === 0)
      .map((row) => row.id);
    meta.tracks = buildRunnerTracks({
      selectedCases: storedSelectedCases,
      rows: results.rows,
      unjudgedSelectedIds,
      lifecyclePartition: storedLifecyclePartition
    });
    meta.budget = spendLedgerRecord(spendLedger);
    meta.judgeStored = {
      judgedAt: new Date().toISOString(),
      // Keep the ORIGINAL collection-time hash across resumes; re-hashing the
      // partially judged file would erase the link this block exists to record.
      sourceResultsSha256,
      // Only ids that actually reached a paid judge, merged across resumes.
      judgedIds: [
        ...new Set([...(priorJudgeStored.judgedIds ?? []), ...initiallyJudgedIds, ...paidIds])
      ],
      unattemptedIds: unjudgedSelectedIds,
      incompleteIds: [...incompleteJudgeIds],
      attempts: results.rows.flatMap((row) =>
        row.attempts.judge.map((attempt) => ({ id: row.id, ...attempt }))
      ),
      toolVersion: "run-qa/judge-stored-v3"
    };
    results.meta = meta;
    if (withSummary) {
      results.summary = aggregatesAllowed ? summarize(storedActiveRows()) : null;
      if (!aggregatesAllowed) {
        log(formatCompletenessNotice(completeness, { label: "judge-stored" }));
      }
    }
    // Temp-then-rename: a truncate-in-place rewrite of the sole copy holding
    // every paid verdict is the loss this feature exists to prevent.
    const tmpPath = `${resultsPath}.tmp`;
    writeFileSync(tmpPath, JSON.stringify(results, null, 2) + "\n");
    renameSync(tmpPath, resultsPath);
  };

  if (unjudged.length === 0) {
    if (results.summary && meta.judgeStored) {
      throw new Error("--judge-stored: every row already has a verdict — nothing to judge");
    }
    // Unfinalized artifact from an interrupted run: complete it rather than
    // leaving a paid file stuck with a null summary.
    writeState({ withSummary: true });
    log(`judge-stored: ${resultsPath} · nothing left to judge · finalized stamps + summary`);
    log(formatFiveTrackSummary(meta.tracks));
    return {
      judgedCount: 0,
      summary: results.summary,
      metrics: meta.aggregatesSuppressed
        ? null
        : qaMeasurementMetrics(storedActiveRows(), storedLifecyclePartition.active),
      judgeTiering: meta.judgeTiering,
      outPath: resultsPath
    };
  }
  log(
    `judge-stored: ${resultsPath} · ${unjudged.length}/${results.rows.length} unjudged row(s) · ` +
    `judge ${judgeModel}${judgePanel > 1 ? ` forced panel ${judgePanel}` : ` tiered (${stabilityRegister.status})`}`
  );
  log(formatPanelSummary(judgeTieringMetadata({
    judgePanel,
    stabilityRegister,
    panelLimit,
    rows: results.rows
  }), "before"));

  // Stamp the judge tuple BEFORE the first paid call so a crash-resume with a
  // different model trips the mixing guard instead of silently mixing tuples.
  meta.judgeModel = judgeModel;
  meta.judgeRubric = JUDGE_RUBRIC;
  meta.judgePanel = judgePanel;
  results.meta = meta;
  writeState({ withSummary: false });

  for (const [i, row] of unjudged.entries()) {
    log(`[${i + 1}/${unjudged.length}] ${row.id} …`);
    const kase = identity.caseById.get(row.id);
    if (hasSuccessfulAnswer(row.answer, row.agent?.failure)) {
      if (!Array.isArray(row.transcript)) {
        throw new Error(`--judge-stored: row ${row.id} has no saved transcript array`);
      }
      const transcriptEvidence = buildTranscriptEvidence({
        ...kase,
        candidateAnswer: row.answer,
        transcript: row.transcript
      });
      const packSha = transcriptEvidence ? sha256(transcriptEvidence) : null;
      // Compare unconditionally, null included: a stable-freshness row records
      // sha256:null, so a truthiness guard here skipped the check on exactly
      // those rows (14 of 30 in the 2026-07-28 artifact) and let deleting one
      // field disable it on any row.
      if (!row.evidencePack || packSha !== (row.evidencePack.sha256 ?? null)) {
        throw new Error(
          `--judge-stored: row ${row.id} evidence pack no longer reproduces its collection-time hash (recorded ${row.evidencePack?.sha256 ?? "absent"}, rebuilt ${packSha ?? "null"}) — the pack builder changed since collection; re-collect`
        );
      }
      try {
        await judgeRowWithRetry(
          { ...kase, candidateAnswer: row.answer, transcript: row.transcript, transcriptEvidence },
          {
            judgeModel,
            judgePanel,
            judge,
            stabilityRegister,
            panelBudget,
            spendLedger,
            onAttempt: () => {
              row.verdict ??= row.attempts.judge[0]?.verdict ?? null;
              row.firstAttempt.judge = row.attempts.judge.length ? 1 : null;
              row.outcomeClass = rowOutcomeClass(row);
              writeState({ withSummary: false });
            }
          },
          row.attempts.judge
        );
      } catch (error) {
        if (error.judgeAttempt) row.attempts.judge.push(error.judgeAttempt);
        if (
          error instanceof MissingReportedCostError ||
          error instanceof BudgetAuthorizationExceededError ||
          (error instanceof BudgetExhaustedError && error.judgeAttempt)
        ) incompleteJudgeIds.add(row.id);
        row.verdict ??= row.attempts.judge[0]?.verdict ?? null;
        row.firstAttempt.judge = row.attempts.judge.length ? 1 : null;
        row.outcomeClass = rowOutcomeClass(row);
        writeState({ withSummary: true });
        if (error instanceof BudgetExhaustedError) break;
        throw error;
      }
      row.verdict ??= row.attempts.judge[0]?.verdict ?? null;
      row.firstAttempt.judge = row.attempts.judge.length ? 1 : null;
      row.outcomeClass = rowOutcomeClass(row);
      paidIds.push(row.id);
      processedCount += 1;
      // Persist after every judged row: a crash on row N keeps rows 1..N-1's
      // paid verdicts on disk (the run resumes as judge-all-unjudged).
      writeState({ withSummary: true });
      log(
        `${row.id} → ${row.verdict.score} · ${row.verdict.meta?.judgeTierUsed ?? "single"}` +
        `${row.verdict.meta?.escalationReason ? ` (${row.verdict.meta.escalationReason})` : ""}`
      );
    } else {
      // Mirror the inline no-answer verdict exactly.
      row.verdict = buildAgentErrorVerdict(row.agent?.failure);
      row.outcomeClass = rowOutcomeClass(row);
      processedCount += 1;
    }
  }

  writeState({ withSummary: true });
  log(formatFiveTrackSummary(meta.tracks));
  return {
    judgedCount: processedCount,
    summary: results.summary,
    metrics: meta.aggregatesSuppressed
      ? null
      : qaMeasurementMetrics(storedActiveRows(), storedLifecyclePartition.active),
    judgeTiering: meta.judgeTiering,
    outPath: resultsPath
  };
}

/**
 * Precondition P4: decide whether this run may report an aggregate at all.
 *
 * A lane that lost rows is incomplete, not smaller — but the rows it did buy
 * are still evidence, so the artifact is always written. Only the aggregate is
 * withheld, with the reason recorded next to it. Exported so the decision is
 * testable without paying for a run.
 */
export function collectionAggregates(rows, cases, { judging }) {
  const completeness = runCompleteness({
    expectedIds: cases.map((c) => c.id),
    rows,
    judging
  });
  if (!completeness.aggregatesAllowed) {
    return { completeness, summary: null, metrics: null };
  }
  const partition = partitionLifecycleCases(cases);
  const activeIds = new Set(partition.activeIds);
  const activeRows = rows.filter((row) => activeIds.has(row.id));
  return {
    completeness,
    summary: judging ? summarize(activeRows) : null,
    metrics: qaMeasurementMetrics(judging ? activeRows : [], partition.active)
  };
}

async function main() {
  const args = process.argv.slice(2);
  const argVal = (flag) => {
    const i = args.indexOf(flag);
    return i !== -1 ? args[i + 1] : undefined;
  };
  const agentBinary = assertExpectedExecutable(
    executableIdentity("claude"),
    argVal("--expect-agent-binary-sha256"),
    { label: "Claude CLI" }
  );
  const inheritedAgentEnvironment = agentEnvironmentIdentity();
  const safeJudge = (input, options) =>
    judgeCase(input, { ...options, command: agentBinary.resolvedPath, safeMode: true });
  const {
    maxPanelCases: maxPanelCasesOverride,
    maxPanelCasesSource
  } = parsePanelCaseOverride({
    cliValue: argVal("--max-panel-cases"),
    cliPresent: args.includes("--max-panel-cases"),
    environmentValue: process.env.QA_MAX_PANEL_CASES
  });
  const stabilityRegisterArgument = argVal("--stability-register");
  if (
    args.includes("--stability-register") &&
    (!stabilityRegisterArgument || stabilityRegisterArgument.startsWith("--"))
  ) {
    throw new Error("--stability-register requires a path");
  }
  const prepareStabilityRegister = () => prepareJudgeStabilityRegister({
    pinnedPath: stabilityRegisterArgument
      ? path.resolve(process.cwd(), stabilityRegisterArgument)
      : null
  });
  const maxBudgetUsd = parseRequiredBudgetFlag(args);
  const judgeStoredPath = argVal("--judge-stored");
  if (judgeStoredPath) {
    if (args.includes("--no-judge")) throw new Error("--judge-stored and --no-judge are contradictory");
    const stabilityRegister = prepareStabilityRegister();
    const { summary, metrics, judgeTiering } = await judgeStoredResults(path.resolve(process.cwd(), judgeStoredPath), {
      judgeModel: argVal("--judge-model") ?? JUDGE_MODEL,
      judgePanel: parseJudgePanel(argVal("--judge-panel")),
      judge: safeJudge,
      judgeBinary: agentBinary,
      judgeEnvironment: inheritedAgentEnvironment,
      maxPanelCases: maxPanelCasesOverride,
      maxPanelCasesSource,
      stabilityRegister,
      maxBudgetUsd
    });
    if (summary) console.log("\n" + formatRawFirstAttemptDiagnostics(summary));
    if (metrics) console.log(formatMeasurementMetrics(metrics));
    console.log(formatPanelSummary(judgeTiering, "after"));
    return;
  }
  const variant = (argVal("--variant") ?? "A").toUpperCase();
  if (!(variant in VARIANT_TOOL)) throw new Error(`--variant must be A or B, got ${variant}`);
  const searchTool = argVal("--search-tool") ?? VARIANT_TOOL[variant];
  const surface = argVal("--surface") ?? "search-execute";
  if (!SURFACES.has(surface)) throw new Error(`--surface must be search-execute or per-operation, got ${surface}`);
  if (surface === "search-execute" && !searchTool) {
    throw new Error(
      `variant ${variant} has no default tool since ADR-0001 (the code-shaped search is not registered top-level) — pass --search-tool <name> against a build that exposes one`
    );
  }
  const port = Number(argVal("--port") ?? 8788);
  const model = argVal("--model") ?? AGENT_MODEL;
  const judgeModel = argVal("--judge-model") ?? JUDGE_MODEL;
  const judgePanel = parseJudgePanel(argVal("--judge-panel"));
  const stabilityRegister = prepareStabilityRegister();
  const noJudge = args.includes("--no-judge");
  const spendLedger = createSpendLedger(maxBudgetUsd);
  const serverRevision = assertPinnedServerRevision(argVal("--server-revision"));
  const collectionSourceIdentity = assertCollectionSourceIdentity(sourceIdentity(serverRevision));
  const casesPath = argVal("--cases") ?? path.join(QA_DIR, "cases.json");
  const plainSurface = loadPlainOperationSurface();

  const battery = loadCases(casesPath);
  let cases = battery.cases;
  const ids = argVal("--ids");
  if (ids) {
    const want = new Set(ids.split(",").map((s) => s.trim()));
    cases = cases.filter((c) => want.has(c.id));
    const missing = [...want].filter((id) => !cases.some((c) => c.id === id));
    if (missing.length) throw new Error(`--ids not found in battery: ${missing.join(", ")}`);
  }
  const sampleN = argVal("--sample") ? Number(argVal("--sample")) : undefined;
  if (sampleN) cases = stratifiedSample(cases, sampleN);
  const lifecyclePartition = partitionLifecycleCases(cases);
  const collectionLifecycleSnapshot = lifecycleSnapshot(cases);
  // Pre-spend: an empty selection spawns nothing, and a duplicated id pays
  // twice for one case and then collapses on every per-id join.
  assertRunPlan(cases.map((c) => c.id), { label: "run-qa" });
  const panelLimit = resolvePanelCaseLimit(
    lifecyclePartition.active.length,
    maxPanelCasesOverride,
    maxPanelCasesSource
  );
  const panelBudget = createPanelCaseBudget(panelLimit.maxPanelCases);
  if (!noJudge) {
    console.log(formatPanelSummary(judgeTieringMetadata({
      judgePanel,
      stabilityRegister,
      panelLimit,
      rows: []
    }), "before"));
  }

  const preflightResult = await probeLiveSurface(port, { surface, searchTool, plainSurface });
  const surfacePin = assertExpectedSurface(preflightResult.metrics, argVal("--expect-sha256"), {
    label: "run-qa live MCP surface"
  });
  const sourceRevisionPin = assertExpectedSourceRevision(preflightResult.serverInfo, serverRevision, {
    label: "run-qa live Worker"
  });
  const serverProcess = boundServerIdentity(port, serverRevision);
  console.log(
    `run-qa: surface ${surface} · variant ${variant}${surface === "search-execute" ? ` (search tool "${searchTool}")` : ""} · ${battery.contract ? `contract ${battery.contract} · ` : ""}active ${lifecyclePartition.active.length} of ${cases.length} selected cases · excluded quarantined IDs: ${lifecyclePartition.quarantinedIds.join(", ") || "none"} · server :${port} · ${preflightResult.exposedNames.length} exposed tool(s) · agent ${model} · judge ${noJudge ? "OFF" : `${judgeModel}${judgePanel > 1 ? ` forced panel ${judgePanel}` : ` tiered (${stabilityRegister.status})`}`}`
  );

  const tmpDir = mkdtempSync(path.join(os.tmpdir(), "qa-mcp-"));
  // Precondition P2: the answering agent runs here, not in the repository.
  // An empty directory outside the repo keeps AGENTS.md and CLAUDE.md off its
  // project-instruction discovery walk.
  const agentCwd = mkdtempSync(path.join(os.tmpdir(), "qa-agent-cwd-"));
  assertNeutralAgentCwd(agentCwd, { repoRoot: REPO_ROOT, label: "run-qa answering agent" });
  const mcpConfigPath = path.join(tmpDir, "mcp.json");
  const upstreamUrl = `http://localhost:${port}/mcp`;
  const mcpServerConfig =
    surface === "per-operation"
      ? {
          command: process.execPath,
          args: [path.join(QA_DIR, "plain-operation-harness.mjs"), "--upstream", upstreamUrl]
        }
      : { type: "http", url: upstreamUrl };
  writeFileSync(
    mcpConfigPath,
    JSON.stringify({ mcpServers: { [REQUIRED_MCP_SERVER_NAME]: mcpServerConfig } })
  );
  const allowedTools =
    surface === "per-operation"
      ? plainSurface.tools.map((tool) => `mcp__raven__${tool.name}`)
      : [`mcp__raven__${searchTool}`, "mcp__raven__execute"];

  const rows = [];
  const incompleteIds = new Set();
  const startedAt = new Date().toISOString();
  let collectionError = null;
  let postflightResult;
  let surfacePinAfter;
  let sourceRevisionPinAfter;
  let serverProcessAfter;
  let serverProcessGuard;
  let postflightError = null;
  try {
    for (const [i, c] of cases.entries()) {
      const t0 = Date.now();
      process.stdout.write(`[${i + 1}/${cases.length}] ${c.id} … `);
      const answerAttempts = [];
      const rowJudgeAttempts = [];
      let stopError = null;
      for (let attemptNumber = 1; attemptNumber <= 2; attemptNumber++) {
        let authorization;
        try {
          authorization = authorizeSpend(spendLedger, {
            method: "agent",
            id: c.id,
            attempt: attemptNumber
          });
        } catch (error) {
          stopError = error;
          break;
        }
        const attemptStartedAt = Date.now();
        const run = runAgent(c.question, {
          surface,
          searchTool,
          allowedTools,
          mcpConfigPath,
          model,
          agentCwd,
          agentCommand: agentBinary.resolvedPath,
          maxBudgetUsd: authorization.maxBudgetUsd
        });
        const attempt = agentAttemptRecord(run, attemptNumber, Date.now() - attemptStartedAt);
        answerAttempts.push(attempt);
        try {
          recordSpend(spendLedger, authorization, run.costUsd);
        } catch (error) {
          stopError = error;
          break;
        }
        if (attemptNumber === 1 && isRetryableAgentFailure(run.failure)) {
          continue;
        }
        break;
      }
      if (answerAttempts.length === 0) throw stopError;
      const firstAttempt = answerAttempts[0];
      const successfulAnswer = hasSuccessfulAnswer(firstAttempt.answer, firstAttempt.agent?.failure);
      const transcriptEvidence = successfulAnswer
        ? buildTranscriptEvidence({
            ...c,
            candidateAnswer: firstAttempt.answer,
            transcript: firstAttempt.transcript
          })
        : "";
      let verdict = null;
      if (!noJudge) {
        if (successfulAnswer && !stopError) {
          try {
            await judgeRowWithRetry(
              {
                ...c,
                candidateAnswer: firstAttempt.answer,
                transcript: firstAttempt.transcript,
                transcriptEvidence
              },
              {
                judgeModel,
                judgePanel,
                judge: safeJudge,
                stabilityRegister,
                panelBudget,
                spendLedger
              },
              rowJudgeAttempts
            );
          } catch (error) {
            if (error.judgeAttempt) rowJudgeAttempts.push(error.judgeAttempt);
            stopError = error;
          }
          verdict = rowJudgeAttempts[0]?.verdict ?? null;
        } else if (!successfulAnswer) {
          verdict = buildAgentErrorVerdict(firstAttempt.agent?.failure);
        }
      }
      const durationMs = Date.now() - t0;
      const row = {
        id: c.id,
        question: c.question,
        caseInput: caseInputPayload(c),
        caseInputSha256: caseInputSha256(c),
        tags: c.tags,
        truth: {
          status: c.truth.status,
          ...(c.truth.asOf ? { asOf: c.truth.asOf } : {}),
          lifecycle: c.truth.lifecycle ?? { state: "active", reviewState: "none" }
        },
        answer: firstAttempt.answer,
        transcript: firstAttempt.transcript,
        agent: {
          model,
          ...firstAttempt.agent,
          inputSha256: firstAttempt.inputSha256,
          answerSha256: firstAttempt.answerSha256,
          // ONE failure field. A row is failed iff this is non-null.
          failure: firstAttempt.agent?.failure ?? null
        },
        // Derived artifact-continuation outcomes (handles, info/read calls,
        // read failures by host reason, bounded final projection). Model-facing
        // MCP results are unaffected — this is eval-side evidence only.
        artifacts: firstAttempt.artifacts,
        verdict,
        evidencePack: {
          packVersion: PACK_VERSION,
          chars: transcriptEvidence.length,
          sha256: transcriptEvidence ? sha256(transcriptEvidence) : null
        },
        durationMs,
        attempts: {
          agent: answerAttempts,
          judge: rowJudgeAttempts
        },
        firstAttempt: {
          agent: 1,
          judge: rowJudgeAttempts.length ? 1 : null,
          inputSha256: firstAttempt.inputSha256,
          answerSha256: firstAttempt.answerSha256
        }
      };
      row.outcomeClass = rowOutcomeClass(row);
      if (
        answerAttempts.length > 0 && (
          stopError instanceof BudgetExhaustedError ||
          stopError instanceof MissingReportedCostError ||
          stopError instanceof BudgetAuthorizationExceededError
        )
      ) incompleteIds.add(c.id);
      rows.push(row);
      console.log(
        `${verdict ? verdict.score : "answered"}` +
        `${verdict?.meta?.judgeTierUsed ? ` [${verdict.meta.judgeTierUsed}${verdict.meta.escalationReason ? `:${verdict.meta.escalationReason}` : ""}]` : ""} ` +
        `(${firstAttempt.transcript.length} tool calls, ${answerAttempts.length} agent attempt(s), ` +
        `${rowJudgeAttempts.length} judge attempt(s), ${Math.round(durationMs / 1000)}s)`
      );
      if (isRequiredMcpServerFailure(firstAttempt.agent?.failure)) {
        throw new Error(`answering harness failed: ${firstAttempt.agent.failure.reason}`);
      }
      if (stopError) throw stopError;
    }
  } catch (error) {
    collectionError = error;
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
    rmSync(agentCwd, { recursive: true, force: true });
  }

  try {
    postflightResult = await probeLiveSurface(port, { surface, searchTool, plainSurface });
    surfacePinAfter = assertExpectedSurface(postflightResult.metrics, argVal("--expect-sha256"), {
      label: "run-qa final live MCP surface"
    });
    sourceRevisionPinAfter = assertExpectedSourceRevision(postflightResult.serverInfo, serverRevision, {
      label: "run-qa final live Worker"
    });
    serverProcessAfter = boundServerIdentity(port, serverRevision);
    serverProcessGuard = assertStableBoundServerIdentity(serverProcess, serverProcessAfter);
  } catch (error) {
    postflightError = error;
  }

  const finalSourceIdentity = sourceIdentity(serverRevision);
  const collectionSourceIdentityGuard = sourceIdentityGuard(collectionSourceIdentity, finalSourceIdentity);
  const comparabilityReasons = [
    ...(collectionError ? [`collection failed: ${String(collectionError.message ?? collectionError)}`] : []),
    ...(postflightError ? [`postflight failed: ${String(postflightError.message ?? postflightError)}`] : []),
    ...(!collectionSourceIdentityGuard.matches
      ? [`source identity changed: ${collectionSourceIdentityGuard.changedKeys.join(", ")}`]
      : [])
  ];
  const comparable = comparabilityReasons.length === 0;
  const aggregates = collectionAggregates(rows, cases, { judging: !noJudge });
  const completeness = comparable
    ? aggregates.completeness
    : {
        ...aggregates.completeness,
        aggregatesAllowed: false,
        reasons: [...aggregates.completeness.reasons, ...comparabilityReasons]
      };
  const summary = comparable ? aggregates.summary : null;
  const metrics = comparable ? aggregates.metrics : null;
  const selectedIds = cases.map((c) => c.id);
  const unattemptedIds = selectedIds.filter((id) => !rows.some((row) => row.id === id));
  const totals = costTotals(rows);
  const tracks = buildRunnerTracks({ selectedCases: cases, rows, lifecyclePartition });
  const budget = spendLedgerRecord(spendLedger);
  const stampSuffix = surface === "per-operation" ? "perOperation" : `variant${variant}`;
  const stamp = `${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}-${stampSuffix}`;
  const resultsDir = path.join(QA_DIR, "results");
  mkdirSync(resultsDir, { recursive: true });
  const outPath = path.join(resultsDir, `${stamp}.json`);
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        meta: {
          trackSchema: QA_TRACK_SCHEMA,
          variant: surface === "search-execute" ? variant : null,
          surface,
          searchTool: surface === "search-execute" ? searchTool : null,
          port,
          model,
          judgeModel: noJudge ? null : judgeModel,
          judgeRubric: noJudge ? null : JUDGE_RUBRIC,
          ...(!noJudge ? { judgePanel } : {}),
          ...(!noJudge
            ? {
                judgeTiering: judgeTieringMetadata({
                  judgePanel,
                  stabilityRegister,
                  panelLimit,
                  rows
                })
              }
            : {}),
          packVersion: PACK_VERSION,
          resultsSchema: AGENT_RESULT_SCHEMA,
          caseIdentitySchema: CASE_INPUT_IDENTITY,
          casesPath,
          caseContract: battery.contract ?? null,
          sampleN: sampleN ?? null,
          ids: ids ?? null,
          startedAt,
          finishedAt: new Date().toISOString(),
          caseCount: rows.length,
          selectedIds,
          lifecycle: {
            activeCount: lifecyclePartition.active.length,
            selectedCount: cases.length,
            activeIds: lifecyclePartition.activeIds,
            excludedQuarantinedIds: lifecyclePartition.quarantinedIds
          },
          unattemptedIds,
          incompleteIds: [...incompleteIds],
          // Prompt-append experiments (QA_AGENT_PROMPT_APPEND) are invisible on
          // the wire without this: stamp exactly what the answering prompt
          // carried so arms are auditable from the artifact alone.
          promptAppend: process.env.QA_AGENT_PROMPT_APPEND?.trim()
            ? {
                sha256: sha256(process.env.QA_AGENT_PROMPT_APPEND.trim()),
                chars: process.env.QA_AGENT_PROMPT_APPEND.trim().length
              }
            : null,
          inputSnapshot: {
            casesSha256: sha256(JSON.stringify(cases)),
            caseIdsSha256: sha256(JSON.stringify(cases.map((c) => c.id))),
            lifecycle: collectionLifecycleSnapshot,
            lifecycleSha256: lifecycleSnapshotSha256(collectionLifecycleSnapshot),
            manifestGeneratedAt: plainSurface.metrics.manifestGeneratedAt,
            operationIdsSha256: plainSurface.metrics.operationIdsSha256,
            operationEntriesSha256: plainSurface.metrics.operationEntriesSha256
          },
          sourceIdentity: collectionSourceIdentity,
          sourceIdentityGuard: collectionSourceIdentityGuard,
          comparable,
          comparabilityReasons,
          serverProcess,
          serverProcessAfter,
          serverProcessGuard,
          toolSurface: preflightResult.metrics,
          toolSurfaceAfter: postflightResult?.metrics ?? null,
          surfacePin,
          surfacePinAfter: surfacePinAfter ?? null,
          serverInfo: preflightResult.serverInfo,
          serverInfoAfter: postflightResult?.serverInfo ?? null,
          sourceRevisionPin,
          sourceRevisionPinAfter: sourceRevisionPinAfter ?? null,
          postflightError: postflightError
            ? { message: String(postflightError.message ?? postflightError) }
            : null,
          agentBinary,
          // Denominator facts, always present. `aggregatesSuppressed` is the
          // one-field answer to "may I quote a percentage from this file?".
          completeness,
          aggregatesSuppressed: !completeness.aggregatesAllowed,
          agentCwdNeutral: true,
          agentEnvironment: {
            cwd: agentCwd,
            cwdOutsideRepository: true,
            isolation: answeringAgentIsolationRecord(),
            inherited: inheritedAgentEnvironment
          },
          tracks,
          budget,
          ...(metrics ?? {}),
          ...totals
        },
        summary,
        rows
      },
      null,
      2
    ) + "\n"
  );
  console.log(`\nwrote ${outPath}`);
  console.log("\n" + formatFiveTrackSummary(tracks));
  if (!completeness.aggregatesAllowed) {
    console.log("\n" + formatCompletenessNotice(completeness, { label: "run-qa collection" }));
  } else if (summary) {
    console.log("\n" + formatRawFirstAttemptDiagnostics(summary));
    console.log(formatMeasurementMetrics(metrics));
  }
  if (!noJudge) {
    console.log(formatPanelSummary(judgeTieringMetadata({
      judgePanel,
      stabilityRegister,
      panelLimit,
      rows
    }), "after"));
  }
  if (!comparable) {
    throw new Error(
      `QA collection is non-comparable; saved evidence at ${outPath}: ${comparabilityReasons.join("; ")}`
    );
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await main();
}
