#!/usr/bin/env node
/**
 * run-qa.mjs — agentic golden Q→A runner (the A/B referee's driver).
 *
 * Contract (scratchpad 516): run(question, {searchVariant}) → {answer, transcript};
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
 *   npx wrangler dev --port 8788 --host localhost   # in another terminal
 *   (--host localhost is required: with custom-domain routes configured,
 *   wrangler dev rewrites request.url to the production host and the
 *   DEV_ALLOW_UNAUTHENTICATED loopback gate 401s every request)
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
 *                      hand-authored contracts include live-data-canonical-v2
 *                      (corpus/live/live-cases.json) and live-digest-supplement-v2
 *                      (corpus/live/live-digest-supplement-cases.json); run separately.
 *   --model name       answering-agent model (default claude-sonnet-5)
 *   --judge-model name judge model (default judge.mjs JUDGE_MODEL)
 *   --surface name     search-execute (default) | per-operation. The latter
 *                      starts the isolated stdio proxy harness for the
 *                      manifest's 50 operations and still uses the existing
 *                      local Wrangler server for adapter/executor traffic.
 *   --server-revision  git revision of the checkout running the already-bound
 *                      Wrangler process (recorded for reproducibility)
 *   --no-judge         collect answers only (judge later)
 *   --judge-stored F   two-phase mode, phase 2: judge a saved --no-judge
 *                      results file IN PLACE (no server, no agent). Judges
 *                      every row without a verdict, stamps per-row judge cost,
 *                      summary, and meta cost totals into the SAME file.
 *                      Refuses if the case snapshot or judge tuple no longer
 *                      matches the recorded one (re-collect instead; the
 *                      loudly-labeled escape hatch stays re-judge.mjs).
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, readdirSync, writeFileSync, mkdirSync, renameSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { QA_DIR, loadCases, stratifiedSample, summarize, formatSummaryTable } from "./lib.mjs";
import { buildTranscriptEvidence, judgeCase, JUDGE_MODEL, JUDGE_RUBRIC } from "./judge.mjs";
import { verifySourceCases } from "./re-judge.mjs";
import { PACK_VERSION } from "./evidence-pack.mjs";
import { AGENT_RESULT_SCHEMA, parseAgentResult } from "./agent-result.mjs";
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

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * A row is judgeable only when the agent produced an answer AND the parser
 * found no failure. `parseAgentResult` blanks the `result` text of any errored
 * provider outcome, so a safeguard notice can never arrive here as an answer.
 */
function hasSuccessfulAnswer(answer, failure) {
  return Boolean(answer) && !failure;
}

/**
 * One deterministic rationale per failure class — the stored verdict names
 * WHERE the run died (provider safeguard vs transport vs agent turn cap), which
 * the pre-parser `error: "success"` string could not distinguish.
 */
function agentErrorRationale(failure) {
  return failure ? `${failure.class}: ${failure.reason}` : "empty answer";
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
function costAccounting(rows, judgeAttempts = null) {
  const judged = rows.filter((row) => hasSuccessfulAnswer(row.answer, row.agent?.failure) && row.verdict != null);
  const expectedJudgeCalls = Array.isArray(judgeAttempts) ? judgeAttempts.length : judged.length;
  const judgeCosts = Array.isArray(judgeAttempts)
    ? reportedCosts(judgeAttempts, (attempt) => attempt.costUsd)
    : reportedCosts(judged, (row) => row.verdict?.costUsd);
  const agentCosts = reportedCosts(rows, (row) => row.agent?.costUsd);
  return {
    expectedJudgeCalls,
    reportedJudgeCalls: judgeCosts.length,
    missingJudgeCosts: expectedJudgeCalls - judgeCosts.length,
    expectedAgentRuns: rows.length,
    reportedAgentCosts: agentCosts.length,
    missingAgentCosts: rows.length - agentCosts.length
  };
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

export function sourceIdentity(serverRevision) {
  const repoRoot = path.resolve(QA_DIR, "..", "..");
  const statusResult = spawnSync(
    "git",
    ["status", "--porcelain=v1", "--untracked-files=all"],
    { cwd: repoRoot, encoding: "utf8" }
  );
  const status = statusResult.status === 0 ? String(statusResult.stdout) : null;
  const fileSha256 = (name) => sha256(readFileSync(path.join(QA_DIR, name), "utf8"));
  const qaImplementationRecords = readdirSync(QA_DIR)
    .filter((name) => name.endsWith(".mjs"))
    .sort()
    .map((name) => `${name}\0${fileSha256(name)}`)
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
- If the tools cannot support an answer — the question is out of scope, the thing does not exist, or the request itself is something you should not do — say that plainly and briefly instead of guessing or playing along.
- Do not use any tool other than the two named above.
- Your FINAL message must be the answer itself: concise, fact-dense, with source URLs from tool results where available. No preamble, no meta-commentary about tools.
${promptAppend ? `\nAdditional run instructions:\n${promptAppend}\n` : ""}

QUESTION:
${question}`;
}

/**
 * Run one answering agent ONCE and hand the raw spawn to the pure parser
 * (eval/qa/agent-result.mjs). There is deliberately no retry here: only a
 * `transport` failure is even eligible, and a provider safeguard must never be
 * re-issued in any form.
 */
function runAgent(question, { surface, searchTool, allowedTools, mcpConfigPath, model }) {
  const prompt = agentPrompt(question, { surface, searchTool });
  const res = spawnSync(
    "claude",
    [
      "-p",
      "--model",
      model,
      "--output-format",
      "stream-json",
      "--verbose",
      "--mcp-config",
      mcpConfigPath,
      "--strict-mcp-config",
      "--allowedTools",
      allowedTools.join(","),
      "--max-turns",
      String(MAX_TURNS)
    ],
    {
      input: prompt,
      encoding: "utf8",
      timeout: AGENT_TIMEOUT_MS,
      maxBuffer: 64 * 1024 * 1024
    }
  );
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
      keepWholeResult: (tool) =>
        tool.endsWith("execute") || operationIdFromPlainTool(String(tool).replace(/^mcp__[^_]+__/, "")) !== null
    }
  );
}

function surfaceMetrics(tools, instructions) {
  const serializedTools = JSON.stringify({ tools });
  const instructionsChars = String(instructions ?? "").length;
  const advertisedWireChars = serializedTools.length + instructionsChars;
  return {
    toolCount: tools.length,
    descriptionsChars: tools.reduce((sum, tool) => sum + String(tool.description ?? "").length, 0),
    inputSchemaChars: tools.reduce((sum, tool) => sum + JSON.stringify(tool.inputSchema ?? {}).length, 0),
    serializedToolsChars: serializedTools.length,
    instructionsChars,
    advertisedWireChars,
    estimatedAdvertisedWireTokens: Math.ceil(advertisedWireChars / 4),
    metricMeaning: "serialized MCP tool definitions plus server instructions; not consumed model context",
    surfaceSha256: sha256(`${instructions ?? ""}\n${serializedTools}`)
  };
}

async function preflight(port, { surface, searchTool, plainSurface }) {
  const url = `http://localhost:${port}/mcp`;
  const post = async (body) => {
    const r = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json, text/event-stream" },
      body: JSON.stringify(body)
    });
    const text = await r.text();
    if (!r.ok) throw new Error(`${url} → HTTP ${r.status}: ${text.slice(0, 200)}`);
    const data = text.startsWith("event:") ? text.split("data: ")[1] : text;
    return JSON.parse(data.trim().split("\n")[0]);
  };
  const initialized = await post({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "run-qa", version: "0" } }
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
      metrics: { ...plainSurface.metrics, instructionsSha256: sha256(PLAIN_SERVER_INSTRUCTIONS) }
    };
  }
  return {
    upstreamNames: names,
    exposedNames: names,
    metrics: surfaceMetrics(upstreamTools, initialized.result?.instructions)
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
  { judgeModel = JUDGE_MODEL, judge = judgeCase, log = console.log } = {}
) {
  const sourceText = readFileSync(resultsPath, "utf8");
  const results = JSON.parse(sourceText);
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
  const identity = verifySourceCases(results, resultsPath);
  if (!identity.guard.matches) {
    throw new Error(
      `--judge-stored: case input snapshot differs (expected ${identity.guard.expectedCasesSha256}, got ${identity.guard.actualCasesSha256}; missing ids: ${identity.guard.missingCaseIds.join(", ") || "none"}) — the golden corpus moved since collection; re-collect`
    );
  }

  // "error" verdicts on rows WITH an answer are judge-side failures (CLI
  // crash / unparseable output) — re-attemptable, or they'd poison the file
  // forever. Empty-answer error verdicts are collection facts and stay.
  const unjudged = results.rows.filter(
    (row) =>
      typeof row.verdict?.score !== "string" ||
      (row.verdict.score === "error" && hasSuccessfulAnswer(row.answer, row.agent?.failure))
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
        provenance: "recorded-before-judge-stored-v2"
      }));
  const paidIds = [];
  const sourceResultsSha256 = priorJudgeStored.sourceResultsSha256 ?? sha256(sourceText);
  const initiallyJudgedIds = judgeAttempts
    .filter((attempt) => attempt.outcome !== null)
    .map((attempt) => attempt.id);
  const writeState = ({ withSummary }) => {
    meta.judgeModel = judgeModel;
    meta.judgeRubric = JUDGE_RUBRIC;
    Object.assign(meta, costTotals(results.rows, judgeAttempts));
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
    if (withSummary) results.summary = summarize(results.rows);
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
    return { judgedCount: 0, summary: results.summary, outPath: resultsPath };
  }
  log(
    `judge-stored: ${resultsPath} · ${unjudged.length}/${results.rows.length} unjudged row(s) · judge ${judgeModel}`
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
        costUsd: null
      };
      judgeAttempts.push(attempt);
      // The attempt and judge tuple must reach durable storage before spend.
      writeState({ withSummary: false });
      row.verdict = await judge(
        { ...kase, candidateAnswer: row.answer, transcript: row.transcript, transcriptEvidence },
        { model: judgeModel }
      );
      attempt.completedAt = new Date().toISOString();
      attempt.outcome = row.verdict.score ?? "error";
      attempt.costUsd = Number.isFinite(row.verdict.costUsd) ? row.verdict.costUsd : null;
      paidIds.push(row.id);
      // Persist after every judged row: a crash on row N keeps rows 1..N-1's
      // paid verdicts on disk (the run resumes as judge-all-unjudged).
      writeState({ withSummary: true });
    } else {
      // Mirror the inline no-answer verdict exactly.
      row.verdict = {
        score: "error",
        missingFacts: [],
        wrongClaims: [],
        rationale: agentErrorRationale(row.agent?.failure),
        rubric: JUDGE_RUBRIC,
        packVersion: PACK_VERSION,
        promptSha256: null
      };
    }
  }

  writeState({ withSummary: true });
  return { judgedCount: unjudged.length, summary: results.summary, outPath: resultsPath };
}

async function main() {
  const args = process.argv.slice(2);
  const argVal = (flag) => {
    const i = args.indexOf(flag);
    return i !== -1 ? args[i + 1] : undefined;
  };
  const judgeStoredPath = argVal("--judge-stored");
  if (judgeStoredPath) {
    if (args.includes("--no-judge")) throw new Error("--judge-stored and --no-judge are contradictory");
    const { summary } = await judgeStoredResults(path.resolve(process.cwd(), judgeStoredPath), {
      judgeModel: argVal("--judge-model") ?? JUDGE_MODEL
    });
    console.log("\n" + formatSummaryTable(summary));
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

  const preflightResult = await preflight(port, { surface, searchTool, plainSurface });
  console.log(
    `run-qa: surface ${surface} · variant ${variant}${surface === "search-execute" ? ` (search tool "${searchTool}")` : ""} · ${battery.contract ? `contract ${battery.contract} · ` : ""}${cases.length} cases · server :${port} · ${preflightResult.exposedNames.length} exposed tool(s) · agent ${model} · judge ${noJudge ? "OFF" : judgeModel}`
  );

  const tmpDir = mkdtempSync(path.join(os.tmpdir(), "qa-mcp-"));
  const mcpConfigPath = path.join(tmpDir, "mcp.json");
  const upstreamUrl = `http://localhost:${port}/mcp`;
  const mcpServerConfig =
    surface === "per-operation"
      ? {
          command: process.execPath,
          args: [path.join(QA_DIR, "plain-operation-harness.mjs"), "--upstream", upstreamUrl]
        }
      : { type: "http", url: upstreamUrl };
  writeFileSync(mcpConfigPath, JSON.stringify({ mcpServers: { raven: mcpServerConfig } }));
  const allowedTools =
    surface === "per-operation"
      ? plainSurface.tools.map((tool) => `mcp__raven__${tool.name}`)
      : [`mcp__raven__${searchTool}`, "mcp__raven__execute"];

  const rows = [];
  const startedAt = new Date().toISOString();
  try {
    for (const [i, c] of cases.entries()) {
      const t0 = Date.now();
      process.stdout.write(`[${i + 1}/${cases.length}] ${c.id} … `);
      const run = runAgent(c.question, { surface, searchTool, allowedTools, mcpConfigPath, model });
      const successfulAnswer = hasSuccessfulAnswer(run.answer, run.failure);
      const transcriptEvidence = successfulAnswer
        ? buildTranscriptEvidence({ ...c, candidateAnswer: run.answer, transcript: run.transcript })
        : "";
      let verdict = null;
      if (!noJudge) {
        verdict = successfulAnswer
          ? await judgeCase(
              { ...c, candidateAnswer: run.answer, transcript: run.transcript, transcriptEvidence },
              { model: judgeModel }
            )
          : {
              score: "error",
              missingFacts: [],
              wrongClaims: [],
              rationale: agentErrorRationale(run.failure),
              rubric: JUDGE_RUBRIC,
              packVersion: PACK_VERSION,
              promptSha256: null
            };
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
        `${verdict ? verdict.score : "answered"} (${run.transcript.length} tool calls, ${Math.round(durationMs / 1000)}s)`
      );
    }
  } finally {
    rmSync(tmpDir, { recursive: true, force: true });
  }

  const summary = noJudge ? null : summarize(rows);
  const stampSuffix = surface === "per-operation" ? "perOperation" : `variant${variant}`;
  const stamp = `${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}-${stampSuffix}`;
  const resultsDir = path.join(QA_DIR, "results");
  mkdirSync(resultsDir, { recursive: true });
  const outPath = path.join(resultsDir, `${stamp}.json`);
  const finalSourceIdentity = sourceIdentity(serverRevision);
  const collectionSourceIdentityGuard = sourceIdentityGuard(collectionSourceIdentity, finalSourceIdentity);
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
          toolSurface: preflightResult.metrics,
          ...costTotals(rows)
        },
        summary,
        rows
      },
      null,
      2
    ) + "\n"
  );
  if (!collectionSourceIdentityGuard.matches) {
    throw new Error(
      `QA source identity changed during collection (${collectionSourceIdentityGuard.changedKeys.join(", ")}); saved a non-comparable artifact at ${outPath}`
    );
  }
  console.log(`\nwrote ${outPath}`);
  if (summary) {
    console.log("\n" + formatSummaryTable(summary));
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await main();
}
