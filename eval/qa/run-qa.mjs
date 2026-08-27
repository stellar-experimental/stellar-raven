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
 *   --max-panel-cases N cap boundary-triggered panels (default 10, or
 *                      QA_MAX_PANEL_CASES). Stability-triggered panels do
 *                      not consume this cap.
 *   --surface name     search-execute (default) | per-operation. The latter
 *                      starts the isolated stdio proxy harness for the
 *                      manifest's 59 operations and still uses the existing
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
import { QA_DIR, loadCases, stratifiedSample, summarize, formatSummaryTable } from "./lib.mjs";
import {
  buildAgentErrorVerdict,
  buildTranscriptEvidence,
  hasSuccessfulAnswer,
  isRetryableJudgeError,
  judgeCase,
  judgeCaseTiered,
  createPanelCaseBudget,
  DEFAULT_MAX_PANEL_CASES,
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

function verdictCallCount(verdict) {
  return Number.isInteger(verdict?.meta?.panelSize) ? verdict.meta.panelSize : 1;
}

function verdictReportedCostCount(verdict) {
  return Number.isInteger(verdict?.meta?.panelReportedCostCount)
    ? verdict.meta.panelReportedCostCount
    : Number.isFinite(verdict?.costUsd) ? 1 : 0;
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
function costAccounting(rows, judgeAttempts = null) {
  const judged = rows.filter((row) => hasSuccessfulAnswer(row.answer, row.agent?.failure) && row.verdict != null);
  const expectedJudgeCalls = Array.isArray(judgeAttempts)
    ? judgeAttempts.reduce((sum, attempt) => sum + (Number.isInteger(attempt.callCount) ? attempt.callCount : 1), 0)
    : judged.reduce((sum, row) => sum + verdictCallCount(row.verdict), 0);
  const reportedJudgeCalls = Array.isArray(judgeAttempts)
    ? judgeAttempts.reduce(
        (sum, attempt) => sum + (Number.isInteger(attempt.reportedCostCount)
          ? attempt.reportedCostCount
          : Number.isFinite(attempt.costUsd) ? 1 : 0),
        0
      )
    : judged.reduce((sum, row) => sum + verdictReportedCostCount(row.verdict), 0);
  const judgeCosts = Array.isArray(judgeAttempts)
    ? reportedCosts(judgeAttempts, (attempt) => attempt.costUsd)
    : reportedCosts(judged, (row) => row.verdict?.costUsd);
  const agentCosts = reportedCosts(rows, (row) => row.agent?.costUsd);
  return {
    expectedJudgeCalls,
    reportedJudgeCalls,
    missingJudgeCosts: expectedJudgeCalls - reportedJudgeCalls,
    expectedAgentRuns: rows.length,
    reportedAgentCosts: agentCosts.length,
    missingAgentCosts: rows.length - agentCosts.length
  };
}

export function parseJudgePanel(value) {
  if (value === undefined) return 1;
  const panelSize = Number(value);
  if (!Number.isInteger(panelSize) || (panelSize !== 2 && panelSize !== 3)) {
    throw new Error(`--judge-panel must be 2 or 3, got ${value}`);
  }
  return panelSize;
}

export function parseMaxPanelCases(value) {
  if (value === undefined || value === "") return DEFAULT_MAX_PANEL_CASES;
  const maxPanelCases = Number(value);
  if (!Number.isInteger(maxPanelCases) || maxPanelCases < 0) {
    throw new Error(`--max-panel-cases must be a non-negative integer, got ${value}`);
  }
  return maxPanelCases;
}

export function prepareJudgeStabilityRegister({
  resultsDir = DEFAULT_STABILITY_RESULTS_DIR,
  registerPath = DEFAULT_STABILITY_REGISTER_PATH,
  log = console.log,
  warn = console.warn
} = {}) {
  if (existsSync(resultsDir)) {
    try {
      const generated = generateStabilityRegister({ resultsDir, outPath: registerPath });
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
  return loadJudgeStabilityRegister(registerPath);
}

export function judgeTieringMetadata({
  judgePanel,
  stabilityRegister,
  maxPanelCases,
  boundaryPanelCases
}) {
  return {
    policy: judgePanel > 1 ? "forced-panel" : "stability-boundary-v1",
    stabilityThreshold: JUDGE_STABILITY_THRESHOLD,
    stabilityRegisterStatus: stabilityRegister.status,
    stabilityRegisterReason: stabilityRegister.reason ?? null,
    stabilityRegisterSha256: stabilityRegister.sha256 ?? null,
    stabilityRegisterGeneratedAt: stabilityRegister.generatedAt ?? null,
    stabilityRegisterSourceArtifactCount: stabilityRegister.sourceArtifactCount ?? null,
    stabilityRegisterCaseCount: stabilityRegister.caseCount ?? 0,
    maxPanelCases,
    boundaryPanelCases
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
function costTotals(rows, judgeAttempts = null) {
  const agentCosts = reportedCosts(rows, (row) => row.agent?.costUsd);
  const judgeCosts = Array.isArray(judgeAttempts)
    ? reportedCosts(judgeAttempts, (attempt) => attempt.costUsd)
    : reportedCosts(rows, (row) => row.verdict?.costUsd);
  return {
    totalAgentCostUsd: sumReported(agentCosts),
    totalJudgeCostUsd: sumReported(judgeCosts),
    totalCostUsd: sumReported([...agentCosts, ...judgeCosts]),
    costAccounting: costAccounting(rows, judgeAttempts)
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

function agentPrompt(question, { surface, searchTool }) {
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
  environment = process.env
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
 * Run one answering agent ONCE and hand the raw spawn to the pure parser
 * (eval/qa/agent-result.mjs). There is deliberately no retry here: only a
 * `transport` failure is even eligible, and a provider safeguard must never be
 * re-issued in any form.
 */
function runAgent(question, { surface, searchTool, allowedTools, mcpConfigPath, model, agentCwd, agentCommand }) {
  const prompt = agentPrompt(question, { surface, searchTool });
  const spawn = buildAgentSpawn({
    prompt,
    allowedTools,
    mcpConfigPath,
    model,
    cwd: agentCwd,
    command: agentCommand
  });
  const res = spawnSync(spawn.command, spawn.args, spawn.options);
  const searchToolNames =
    surface === "search-execute" ? [`mcp__raven__${searchTool}`] : [];
  const isSearchTool = (tool) => searchToolNames.includes(String(tool));
  const keepWholeResult = (tool) =>
    tool.endsWith("execute") || operationIdFromPlainTool(String(tool).replace(/^mcp__[^_]+__/, "")) !== null;
  return parseAgentResult(
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
}

function isRequiredMcpServerFailure(failure) {
  return (
    failure?.class === "protocol" &&
    String(failure.reason ?? "").startsWith(`required MCP server ${REQUIRED_MCP_SERVER_NAME}`)
  );
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
    maxPanelCases = DEFAULT_MAX_PANEL_CASES,
    stabilityRegister = loadJudgeStabilityRegister(),
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
  const identity = verifySourceCases(results, resultsPath);
  if (!identity.guard.matches) {
    throw new Error(
      `--judge-stored: case input snapshot differs (expected ${identity.guard.expectedCasesSha256}, got ${identity.guard.actualCasesSha256}; missing ids: ${identity.guard.missingCaseIds.join(", ") || "none"}) — the golden corpus moved since collection; re-collect`
    );
  }

  // Judge-side CLI and parse errors on answered rows remain retryable — a
  // failed call can still grade on the next attempt. Deterministic consistency
  // errors are terminal (isRetryableJudgeError), and empty-answer error
  // verdicts are collection facts that stay.
  const unjudged = results.rows.filter(
    (row) =>
      typeof row.verdict?.score !== "string" ||
      (isRetryableJudgeError(row.verdict) && hasSuccessfulAnswer(row.answer, row.agent?.failure))
  );

  // Every persisted state must be internally consistent, so finalize stamps
  // costs + summary and writes atomically. A resume that finds nothing left to
  // judge still finalizes: a crash between the last row and the old
  // end-of-run write used to leave summary:null with stale costs and no way
  // back (re-running threw "nothing to judge").
  const priorJudgeStored = meta.judgeStored ?? {};
  const judgeAttempts = Array.isArray(priorJudgeStored.attempts)
    ? priorJudgeStored.attempts
    : results.rows
      .filter(
        (row) =>
          hasSuccessfulAnswer(row.answer, row.agent?.failure) &&
          typeof row.verdict?.score === "string"
      )
      .map((row) => ({
        id: row.id,
        startedAt: null,
        completedAt: null,
        outcome: row.verdict.score,
        costUsd: Number.isFinite(row.verdict.costUsd) ? row.verdict.costUsd : null,
        ...(verdictCallCount(row.verdict) > 1
          ? {
              callCount: verdictCallCount(row.verdict),
              reportedCostCount: verdictReportedCostCount(row.verdict)
            }
          : {}),
        provenance: "recorded-before-judge-stored-v2"
      }));
  const paidIds = [];
  const panelBudget = createPanelCaseBudget(maxPanelCases);
  const sourceResultsSha256 = priorJudgeStored.sourceResultsSha256 ?? sha256(sourceText);
  const collectionAggregatesAllowed =
    meta.comparable !== false && meta.completeness?.aggregatesAllowed === true;
  const initiallyJudgedIds = judgeAttempts
    .filter((attempt) => attempt.outcome !== null)
    .map((attempt) => attempt.id);
  const writeState = ({ withSummary }) => {
    meta.judgeModel = judgeModel;
    meta.judgeRubric = JUDGE_RUBRIC;
    if (judgePanel > 1) meta.judgePanel = judgePanel;
    meta.judgeTiering = judgeTieringMetadata({
      judgePanel,
      stabilityRegister,
      maxPanelCases,
      boundaryPanelCases: panelBudget.boundaryPanelCases
    });
    Object.assign(meta, costTotals(results.rows, judgeAttempts));
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
    const measurementMetrics = qaMeasurementMetrics(results.rows, identity.caseById);
    for (const key of Object.keys(measurementMetrics)) delete meta[key];
    if (aggregatesAllowed) Object.assign(meta, measurementMetrics);
    if (judgeBinary) meta.judgeBinary = judgeBinary;
    if (judgeEnvironment) meta.judgeEnvironment = judgeEnvironment;
    meta.judgeStored = {
      judgedAt: new Date().toISOString(),
      // Keep the ORIGINAL collection-time hash across resumes; re-hashing the
      // partially judged file would erase the link this block exists to record.
      sourceResultsSha256,
      // Only ids that actually reached a paid judge, merged across resumes.
      judgedIds: [
        ...new Set([...(priorJudgeStored.judgedIds ?? []), ...initiallyJudgedIds, ...paidIds])
      ],
      attempts: judgeAttempts,
      toolVersion: "run-qa/judge-stored-v2"
    };
    results.meta = meta;
    if (withSummary) {
      results.summary = aggregatesAllowed ? summarize(results.rows) : null;
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
    return {
      judgedCount: 0,
      summary: results.summary,
      metrics: meta.aggregatesSuppressed
        ? null
        : qaMeasurementMetrics(results.rows, identity.caseById),
      outPath: resultsPath
    };
  }
  log(
    `judge-stored: ${resultsPath} · ${unjudged.length}/${results.rows.length} unjudged row(s) · ` +
    `judge ${judgeModel}${judgePanel > 1 ? ` forced panel ${judgePanel}` : ` tiered (${stabilityRegister.status})`}`
  );

  // Stamp the judge tuple BEFORE the first paid call so a crash-resume with a
  // different model trips the mixing guard instead of silently mixing tuples.
  meta.judgeModel = judgeModel;
  meta.judgeRubric = JUDGE_RUBRIC;
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
      const attempt = {
        id: row.id,
        startedAt: new Date().toISOString(),
        completedAt: null,
        outcome: null,
        costUsd: null,
        ...(judgePanel > 1 ? { callCount: judgePanel, reportedCostCount: 0 } : {})
      };
      judgeAttempts.push(attempt);
      // The attempt and judge tuple must reach durable storage before spend.
      writeState({ withSummary: false });
      row.verdict = await judgeCaseTiered(
        { ...kase, candidateAnswer: row.answer, transcript: row.transcript, transcriptEvidence },
        {
          model: judgeModel,
          judgePanel,
          judge,
          stabilityRegister,
          panelBudget
        }
      );
      attempt.completedAt = new Date().toISOString();
      attempt.outcome = row.verdict.score ?? "error";
      attempt.costUsd = Number.isFinite(row.verdict.costUsd) ? row.verdict.costUsd : null;
      attempt.callCount = verdictCallCount(row.verdict);
      attempt.reportedCostCount = verdictReportedCostCount(row.verdict);
      paidIds.push(row.id);
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
    }
  }

  writeState({ withSummary: true });
  return {
    judgedCount: unjudged.length,
    summary: results.summary,
    metrics: meta.aggregatesSuppressed
      ? null
      : qaMeasurementMetrics(results.rows, identity.caseById),
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
  return {
    completeness,
    summary: judging ? summarize(rows) : null,
    metrics: qaMeasurementMetrics(judging ? rows : [], cases)
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
  const judgeStoredPath = argVal("--judge-stored");
  if (judgeStoredPath) {
    if (args.includes("--no-judge")) throw new Error("--judge-stored and --no-judge are contradictory");
    const stabilityRegister = prepareJudgeStabilityRegister();
    const { summary, metrics } = await judgeStoredResults(path.resolve(process.cwd(), judgeStoredPath), {
      judgeModel: argVal("--judge-model") ?? JUDGE_MODEL,
      judgePanel: parseJudgePanel(argVal("--judge-panel")),
      judge: safeJudge,
      judgeBinary: agentBinary,
      judgeEnvironment: inheritedAgentEnvironment,
      maxPanelCases: parseMaxPanelCases(
        argVal("--max-panel-cases") ?? process.env.QA_MAX_PANEL_CASES
      ),
      stabilityRegister
    });
    console.log("\n" + formatSummaryTable(summary));
    if (metrics) console.log(formatMeasurementMetrics(metrics));
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
  const maxPanelCases = parseMaxPanelCases(
    argVal("--max-panel-cases") ?? process.env.QA_MAX_PANEL_CASES
  );
  const stabilityRegister = prepareJudgeStabilityRegister();
  const panelBudget = createPanelCaseBudget(maxPanelCases);
  const noJudge = args.includes("--no-judge");
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
  // Pre-spend: an empty selection spawns nothing, and a duplicated id pays
  // twice for one case and then collapses on every per-id join.
  assertRunPlan(cases.map((c) => c.id), { label: "run-qa" });

  const preflightResult = await probeLiveSurface(port, { surface, searchTool, plainSurface });
  const surfacePin = assertExpectedSurface(preflightResult.metrics, argVal("--expect-sha256"), {
    label: "run-qa live MCP surface"
  });
  const sourceRevisionPin = assertExpectedSourceRevision(preflightResult.serverInfo, serverRevision, {
    label: "run-qa live Worker"
  });
  const serverProcess = boundServerIdentity(port, serverRevision);
  console.log(
    `run-qa: surface ${surface} · variant ${variant}${surface === "search-execute" ? ` (search tool "${searchTool}")` : ""} · ${battery.contract ? `contract ${battery.contract} · ` : ""}${cases.length} cases · server :${port} · ${preflightResult.exposedNames.length} exposed tool(s) · agent ${model} · judge ${noJudge ? "OFF" : `${judgeModel}${judgePanel > 1 ? ` forced panel ${judgePanel}` : ` tiered (${stabilityRegister.status})`}`}`
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
      const run = runAgent(c.question, {
        surface,
        searchTool,
        allowedTools,
        mcpConfigPath,
        model,
        agentCwd,
        agentCommand: agentBinary.resolvedPath
      });
      const successfulAnswer = hasSuccessfulAnswer(run.answer, run.failure);
      const transcriptEvidence = successfulAnswer
        ? buildTranscriptEvidence({ ...c, candidateAnswer: run.answer, transcript: run.transcript })
        : "";
      let verdict = null;
      if (!noJudge) {
        verdict = successfulAnswer
          ? await judgeCaseTiered(
              { ...c, candidateAnswer: run.answer, transcript: run.transcript, transcriptEvidence },
              {
                model: judgeModel,
                judgePanel,
                judge: safeJudge,
                stabilityRegister,
                panelBudget
              }
            )
          : buildAgentErrorVerdict(run.failure);
      }
      const durationMs = Date.now() - t0;
      rows.push({
        id: c.id,
        question: c.question,
        tags: c.tags,
        truth: {
          status: c.truth.status,
          ...(c.truth.asOf ? { asOf: c.truth.asOf } : {})
        },
        answer: run.answer,
        transcript: run.transcript,
        agent: {
          model,
          turns: run.turns,
          costUsd: run.costUsd,
          usage: run.usage,
          mcpServers: run.mcpServers,
          promptChars: run.promptChars,
          stderr: run.stderr,
          // ONE failure field. A row is failed iff this is non-null.
          failure: run.failure
        },
        // Derived artifact-continuation outcomes (handles, info/read calls,
        // read failures by host reason, bounded final projection). Model-facing
        // MCP results are unaffected — this is eval-side evidence only.
        artifacts: run.artifacts,
        verdict,
        evidencePack: {
          packVersion: PACK_VERSION,
          chars: transcriptEvidence.length,
          sha256: transcriptEvidence ? sha256(transcriptEvidence) : null
        },
        durationMs
      });
      console.log(
        `${verdict ? verdict.score : "answered"}` +
        `${verdict?.meta?.judgeTierUsed ? ` [${verdict.meta.judgeTierUsed}${verdict.meta.escalationReason ? `:${verdict.meta.escalationReason}` : ""}]` : ""} ` +
        `(${run.transcript.length} tool calls, ${Math.round(durationMs / 1000)}s)`
      );
      if (isRequiredMcpServerFailure(run.failure)) {
        throw new Error(`answering harness failed: ${run.failure.reason}`);
      }
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
          variant: surface === "search-execute" ? variant : null,
          surface,
          searchTool: surface === "search-execute" ? searchTool : null,
          port,
          model,
          judgeModel: noJudge ? null : judgeModel,
          judgeRubric: noJudge ? null : JUDGE_RUBRIC,
          ...(judgePanel > 1 && !noJudge ? { judgePanel } : {}),
          ...(!noJudge
            ? {
                judgeTiering: judgeTieringMetadata({
                  judgePanel,
                  stabilityRegister,
                  maxPanelCases,
                  boundaryPanelCases: panelBudget.boundaryPanelCases
                })
              }
            : {}),
          packVersion: PACK_VERSION,
          resultsSchema: AGENT_RESULT_SCHEMA,
          casesPath,
          caseContract: battery.contract ?? null,
          sampleN: sampleN ?? null,
          ids: ids ?? null,
          startedAt,
          finishedAt: new Date().toISOString(),
          caseCount: rows.length,
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
          ...(metrics ?? {}),
          ...costTotals(rows)
        },
        summary,
        rows
      },
      null,
      2
    ) + "\n"
  );
  if (!comparable) {
    throw new Error(
      `QA collection is non-comparable; saved evidence at ${outPath}: ${comparabilityReasons.join("; ")}`
    );
  }
  console.log(`\nwrote ${outPath}`);
  if (!completeness.aggregatesAllowed) {
    console.log("\n" + formatCompletenessNotice(completeness, { label: "run-qa collection" }));
  } else if (summary) {
    console.log("\n" + formatSummaryTable(summary));
    console.log(formatMeasurementMetrics(metrics));
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await main();
}
