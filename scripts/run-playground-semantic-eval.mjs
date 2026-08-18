#!/usr/bin/env node
/**
 * Drive QA golden cases through the public playground's real SSE turn, then
 * grade the completed assistant answer with the existing QA judge contract.
 *
 * This deliberately complements (not replaces) run-demo-model-gauntlet.mjs:
 * the gauntlet is a fast transport/tool-loop smoke, while this lane measures
 * end-to-end answer quality over the same golden, evidence-pack, and judge
 * semantics as eval/qa/run-qa.mjs.
 *
 * Results are local-only under eval/local-lanes/ (gitignored). A live request
 * invokes the playground model, so --confirm-paid is required. --full is an
 * additional explicit acknowledgement before selecting the complete battery.
 */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdir, open, readFile, rename, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { mintDemoCookie } from "../src/demo/auth.ts";
import { DEMO_CAPS } from "../src/demo/budget.ts";
import {
  DEMO_MODELS,
  DEMO_OPENAI_API_MODE,
  DEMO_REASONING_EFFORT,
  DEMO_TEMPERATURE,
  demoEffectiveOpenAiApiMode,
  demoModelsFromOverride,
  demoOpenAiApiModeFromOverride,
  demoReasoningEffortFromOverride,
  demoReasoningEffortOverride
} from "../src/demo/model-config.ts";
import { buildTranscriptEvidence, judgeCase, JUDGE_MODEL, JUDGE_RUBRIC } from "../eval/qa/judge.mjs";
import { PACK_VERSION } from "../eval/qa/evidence-pack.mjs";
import { QA_DIR, formatSummaryTable, loadCases, summarize } from "../eval/qa/lib.mjs";
import {
  PLAYGROUND_ROUND_CAP_CONTRACT,
  assertModelBackedRunInputs,
  buildQuarantineArtifact,
  buildPlaygroundArtifactMeta,
  deriveQuarantineState,
  sanitizeGenerationCheckError,
  sha256 as contractSha256,
  treeGenerationSha256
} from "../eval/playground/artifact-contract.mjs";

const DEFAULT_SAMPLE = 5;
const DEFAULT_SEED = "playground-semantic-v1";
const DEFAULT_TIMEOUT_MS = 150_000;
const DEFAULT_OUT_DIR = path.join("eval", "local-lanes", "playground-semantic");
const MAX_CASES_PER_RUN_SUBJECT = DEMO_CAPS.chatsPerHour;
const REPO_ROOT = path.resolve(QA_DIR, "..", "..");

function usage() {
  return `Usage: npm run eval:playground -- [options]

Runs QA cases through the actual POST /playground/chat SSE route, captures the
assistant final text and tool trace, then grades it through eval/qa/judge.mjs.
The default selection is a seeded, stratified 5-case sample. Live requests use
the playground model, so --confirm-paid is required; --full also requires it.

Options:
  --url URL             Local playground base URL (default http://localhost:8787)
  --cases PATH          QA case file (default eval/qa/cases.json)
  --ids A,B,C           Exact case ids to run (cannot combine with --sample/--full)
  --sample N            Seeded stratified sample size (default ${DEFAULT_SAMPLE})
  --seed VALUE          Deterministic selection seed (default ${DEFAULT_SEED})
  --full                Select every case only when the selected contract has <=${MAX_CASES_PER_RUN_SUBJECT} cases
  --confirm-paid        Allow model-backed HTTP turns (required unless --dry-run)
  --no-judge            Capture turns but skip the paid QA judge call
  --judge-model NAME    Existing QA judge model (default ${JUDGE_MODEL})
  --server-generation SHA
                        REQUIRED for model-backed runs: operator assertion of the loopback
                        server's local working-tree generation SHA-256
  --round-cap-context PATH
                        REQUIRED for model-backed runs: JSON ${PLAYGROUND_ROUND_CAP_CONTRACT}
  --timeout-ms N        Per-turn client timeout in milliseconds (default ${DEFAULT_TIMEOUT_MS})
  --out-dir PATH        Local-only results directory (default ${DEFAULT_OUT_DIR})
  --print-generation    Print the current working-tree generation SHA-256; no model request
  --dry-run             Validate case selection only; sends no HTTP/model request
  --preflight           Verify signed-cookie route access with an invalid body; no model request
  --help                Show this help

Examples:
  npm run eval:playground -- --dry-run
  npm run eval:playground -- --print-generation
  npm run eval:playground -- --confirm-paid --server-generation <sha256> --round-cap-context <path> --sample 5 --seed baseline-a
  npm run eval:playground -- --confirm-paid --server-generation <sha256> --round-cap-context <path> --ids q-aas-burn-clawback-redemption-mechanics
  npm run eval:playground -- --confirm-paid --server-generation <sha256> --round-cap-context <path> --cases eval/qa/corpus/live/live-cases.json --full
`;
}

function parseArgs(argv) {
  const out = {
    sample: DEFAULT_SAMPLE,
    sampleExplicit: false,
    seed: DEFAULT_SEED,
    timeoutMs: DEFAULT_TIMEOUT_MS
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help") out.help = true;
    else if (arg === "--full" || arg === "--confirm-paid" || arg === "--no-judge" || arg === "--dry-run" || arg === "--preflight" || arg === "--print-generation") {
      out[arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = true;
    } else if (["--url", "--cases", "--ids", "--sample", "--seed", "--judge-model", "--server-generation", "--round-cap-context", "--timeout-ms", "--out-dir"].includes(arg)) {
      const value = argv[++index];
      if (!value || value.startsWith("--")) throw new Error(`${arg} requires a value`);
      out[arg.slice(2).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = value;
      if (arg === "--sample") out.sampleExplicit = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  out.sample = Number(out.sample);
  out.timeoutMs = Number(out.timeoutMs);
  if (!Number.isInteger(out.sample) || out.sample <= 0) throw new Error(`--sample must be a positive integer, got ${out.sample}`);
  if (!Number.isInteger(out.timeoutMs) || out.timeoutMs <= 0) throw new Error(`--timeout-ms must be a positive integer, got ${out.timeoutMs}`);
  if (out.serverGeneration && !/^[a-f0-9]{64}$/.test(out.serverGeneration)) {
    throw new Error("--server-generation must be a lowercase SHA-256");
  }
  return out;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function gitBytes(args) {
  const result = spawnSync("git", args, { cwd: REPO_ROOT, maxBuffer: 256 * 1024 * 1024 });
  if (result.status !== 0) {
    throw new Error(`git ${args.join(" ")} failed: ${String(result.stderr).slice(0, 500)}`);
  }
  return result.stdout;
}

async function workingTreeSnapshot() {
  const headRevision = gitBytes(["rev-parse", "HEAD"]).toString("utf8").trim();
  const status = gitBytes(["status", "--porcelain=v1", "--untracked-files=all"]);
  const trackedDiff = gitBytes(["diff", "--binary", "HEAD", "--"]);
  const untracked = gitBytes(["ls-files", "--others", "--exclude-standard", "-z"])
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .sort();
  const untrackedHash = createHash("sha256");
  for (const relativePath of untracked) {
    untrackedHash.update(relativePath);
    untrackedHash.update("\0");
    untrackedHash.update(await readFile(path.join(REPO_ROOT, relativePath)));
    untrackedHash.update("\0");
  }
  const tree = {
    headRevision,
    dirty: status.length > 0,
    statusSha256: sha256(status),
    trackedDiffSha256: sha256(trackedDiff),
    untrackedFilesSha256: untrackedHash.digest("hex")
  };
  return { ...tree, generationSha256: treeGenerationSha256(tree) };
}

function overrideFrom(name, devVars) {
  if (Object.hasOwn(process.env, name)) return { value: process.env[name], source: "process-env" };
  if (Object.hasOwn(devVars, name)) return { value: devVars[name], source: ".dev.vars" };
  return { value: undefined, source: "default" };
}

function answeringConfiguration(devVars) {
  const modelOverride = overrideFrom("DEMO_MODEL_OVERRIDE", devVars);
  const apiModeOverride = overrideFrom("DEMO_OPENAI_API_MODE", devVars);
  const reasoningOverride = overrideFrom("DEMO_REASONING_EFFORT_OVERRIDE", devVars);
  const models = demoModelsFromOverride(modelOverride.value).map(({ model, role }) => ({ model, role }));
  const requestedApiMode = demoOpenAiApiModeFromOverride(apiModeOverride.value);
  const effectiveApiMode = demoEffectiveOpenAiApiMode(models, requestedApiMode);
  const validReasoningOverride = demoReasoningEffortOverride(reasoningOverride.value);
  return {
    primaryModel: models[0].model,
    fallbackModels: models.slice(1).map(({ model }) => model),
    models,
    fallbackPolicy: "advance only when an attempt ends before useful output; attempts share one tool budget",
    apiMode: {
      requested: requestedApiMode,
      effective: effectiveApiMode,
      source: apiModeOverride.source,
      default: DEMO_OPENAI_API_MODE
    },
    reasoningEffort: {
      value: demoReasoningEffortFromOverride(reasoningOverride.value),
      source: validReasoningOverride ? reasoningOverride.source : "default",
      default: DEMO_REASONING_EFFORT,
      invalidOverrideIgnored: reasoningOverride.value !== undefined && !validReasoningOverride
    },
    temperature: DEMO_TEMPERATURE,
    modelSource: modelOverride.source,
    defaultModels: DEMO_MODELS.map(({ model, role }) => ({ model, role })),
    configurationBasis: "local model-config plus evaluator-visible process/.dev.vars overrides",
    runtimeIntrospection: "not-available",
    observedAttemptedModels: null,
    proofLimit:
      "Pins evaluator-visible process/.dev.vars configuration and the configured primary/fallback tuple; it does not prove the already-running Worker booted with those values or expose which model attempts actually ran."
  };
}

async function inputFileHashes(casesPath) {
  const files = {
    corpusFileSha256: casesPath,
    manifestFileSha256: path.join(REPO_ROOT, "catalog", "manifest.json"),
    superSpecFileSha256: path.join(REPO_ROOT, "specs", "super-spec.json"),
    runnerFileSha256: path.join(REPO_ROOT, "scripts", "run-playground-semantic-eval.mjs"),
    modelConfigFileSha256: path.join(REPO_ROOT, "src", "demo", "model-config.ts"),
    judgeFileSha256: path.join(REPO_ROOT, "eval", "qa", "judge.mjs"),
    evidencePackFileSha256: path.join(REPO_ROOT, "eval", "qa", "evidence-pack.mjs")
  };
  return Object.fromEntries(
    await Promise.all(
      Object.entries(files).map(async ([field, file]) => [field, contractSha256(await readFile(file))])
    )
  );
}

async function loadRoundCapContext(file) {
  const resolved = path.resolve(file);
  const raw = await readFile(resolved, "utf8");
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    throw new Error(`--round-cap-context is not valid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  return {
    ...parsed,
    sourceFile: {
      path: file,
      sha256: sha256(raw)
    }
  };
}

function seededStratifiedSample(cases, count, seed) {
  if (count >= cases.length) return [...cases].sort((a, b) => a.id.localeCompare(b.id));
  const strata = new Map();
  for (const item of cases) {
    const key = item.tags?.service ?? "unknown";
    const list = strata.get(key) ?? [];
    list.push(item);
    strata.set(key, list);
  }
  const keys = [...strata.keys()].sort();
  for (const key of keys) {
    strata.get(key).sort((a, b) => sha256(`${seed}\0${a.id}`).localeCompare(sha256(`${seed}\0${b.id}`)) || a.id.localeCompare(b.id));
  }

  const allocation = new Map();
  const remainders = [];
  let assigned = 0;
  for (const key of keys) {
    const exact = (strata.get(key).length / cases.length) * count;
    const base = Math.floor(exact);
    allocation.set(key, base);
    assigned += base;
    remainders.push({ key, remainder: exact - base });
  }
  remainders.sort((a, b) => b.remainder - a.remainder || a.key.localeCompare(b.key));
  for (let index = 0; assigned < count && index < remainders.length; index += 1, assigned += 1) {
    allocation.set(remainders[index].key, allocation.get(remainders[index].key) + 1);
  }
  for (const key of keys) {
    if (allocation.get(key) > 0) continue;
    const donor = keys.reduce((best, candidate) => (allocation.get(candidate) > allocation.get(best) ? candidate : best), keys[0]);
    if (allocation.get(donor) > 1) {
      allocation.set(donor, allocation.get(donor) - 1);
      allocation.set(key, 1);
    }
  }
  return keys.flatMap((key) => strata.get(key).slice(0, allocation.get(key))).sort((a, b) => a.id.localeCompare(b.id));
}

function selectCases(battery, args) {
  if (args.ids && (args.full || args.sampleExplicit)) {
    throw new Error("--ids cannot be combined with --sample or --full");
  }
  if (args.full && args.sampleExplicit) throw new Error("--full cannot be combined with --sample");
  if (args.ids) {
    const wanted = new Set(args.ids.split(",").map((value) => value.trim()).filter(Boolean));
    const cases = battery.cases.filter((item) => wanted.has(item.id));
    const missing = [...wanted].filter((id) => !cases.some((item) => item.id === id));
    if (missing.length) throw new Error(`--ids not found in battery: ${missing.join(", ")}`);
    return cases;
  }
  return args.full ? [...battery.cases].sort((a, b) => a.id.localeCompare(b.id)) : seededStratifiedSample(battery.cases, args.sample, args.seed);
}

function ensureLoopbackUrl(rawUrl) {
  const url = new URL(rawUrl);
  if (!new Set(["localhost", "127.0.0.1", "[::1]", "::1"]).has(url.hostname)) {
    throw new Error(`--url must be a loopback URL; refusing to run a paid playground evaluation against ${url.hostname}`);
  }
  url.pathname = url.pathname.replace(/\/$/, "") || "/";
  return url;
}

function frameText(frame) {
  return typeof frame.output === "string" ? frame.output : JSON.stringify(frame.output ?? null);
}

async function readSse(body, onFrame, onParseError) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  const consume = () => {
    const match = /\r?\n\r?\n/.exec(buffer);
    if (!match || match.index === undefined) return false;
    const event = buffer.slice(0, match.index);
    buffer = buffer.slice(match.index + match[0].length);
    const data = event
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n");
    if (!data) return true;
    try {
      onFrame(JSON.parse(data));
    } catch (error) {
      onParseError(`invalid SSE JSON: ${error instanceof Error ? error.message : String(error)}; payload=${data.slice(0, 300)}`);
    }
    return true;
  };
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    while (consume()) {
      // Drain every complete event in this chunk before awaiting another read.
    }
  }
  buffer += decoder.decode();
  while (consume()) {
    // Drain a final complete event after the stream closes.
  }
  if (buffer.trim()) onParseError(`unterminated SSE event: ${buffer.slice(0, 300)}`);
}

async function runCase(item, { endpoint, timeoutMs, cookie }) {
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const frames = [];
  const transcript = [];
  const sseErrors = [];
  let responseStatus = null;
  let httpError = null;
  let clientError = null;
  let firstFrameMs = null;
  let firstMeaningfulMs = null;
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: new URL(endpoint).origin,
        "sec-fetch-site": "same-origin",
        cookie
      },
      body: JSON.stringify({ messages: [{ role: "user", content: item.question }] }),
      signal: controller.signal
    });
    responseStatus = response.status;
    if (!response.ok || !response.body) {
      httpError = (await response.text()).slice(0, 2_000) || `HTTP ${response.status} with no response body`;
    } else {
      await readSse(
        response.body,
        (frame) => {
          const atMs = Date.now() - started;
          const captured = { ...frame, atMs };
          frames.push(captured);
          if (firstFrameMs === null) firstFrameMs = atMs;
          if (firstMeaningfulMs === null && frame.type !== "ready") firstMeaningfulMs = atMs;
          if (frame.type === "tool-start") {
            // Match the QA harness's MCP transcript convention. The plan grader
            // recognizes mcp__*__search and any *execute alias; the evidence
            // pack consumes the full execute result without a playground fork.
            transcript.push({ toolUseId: frame.id, tool: `mcp__playground__${frame.tool}`, input: JSON.stringify(frame.input ?? {}) });
          } else if (frame.type === "tool-result") {
            const entry = transcript.find((candidate) => candidate.toolUseId === frame.id);
            if (!entry) {
              sseErrors.push(`tool result ${frame.id} arrived without a matching tool-start`);
              return;
            }
            const result = frameText(frame);
            entry.resultChars = result.length;
            entry.isError = !frame.ok;
            // Keep full result text for every tool. Execute text remains in its
            // original JSON/string form so evidence-pack.mjs can parse it just
            // as it parses the existing QA runner's execute transcript.
            entry.result = result;
          }
        },
        (message) => sseErrors.push(message)
      );
    }
  } catch (error) {
    clientError = error instanceof Error ? error.message : String(error);
  } finally {
    clearTimeout(timeout);
  }
  const finalText = frames.filter((frame) => frame.type === "token").map((frame) => frame.text ?? "").join("");
  const done = frames.find((frame) => frame.type === "done");
  const errorFrames = frames.filter((frame) => frame.type === "error").map((frame) => frame.message);
  const toolCalls = ["search", "execute"].reduce((summary, tool) => {
    const startedCount = transcript.filter((entry) => entry.tool === `mcp__playground__${tool}`).length;
    const completed = transcript.filter((entry) => entry.tool === `mcp__playground__${tool}` && "isError" in entry);
    summary[tool] = {
      started: startedCount,
      ok: completed.filter((entry) => !entry.isError).length,
      failed: completed.filter((entry) => entry.isError).length,
      unfinished: startedCount - completed.length
    };
    return summary;
  }, {});
  return {
    answer: finalText,
    transcript,
    frames,
    toolCalls,
    finishReason: done?.reason ?? null,
    responseStatus,
    latencyMs: Date.now() - started,
    firstFrameMs,
    firstMeaningfulMs,
    httpError,
    sseErrors: [...errorFrames, ...sseErrors],
    clientError
  };
}

async function readDevVars(file) {
  const text = await readFile(file, "utf8");
  const vars = {};
  for (const line of text.split(/\r?\n/)) {
    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line.trim());
    if (!match || line.trimStart().startsWith("#")) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    vars[match[1]] = value;
  }
  return vars;
}

function boundedCheckError(error) {
  return sanitizeGenerationCheckError(error);
}

function actualSpend({ selectedCaseIds, attempted, judged, counters, reportedJudgeCalls, reportedJudgeCostUsd }) {
  return {
    accountingPolicy: "started-calls-count-conservatively; quarantine releases no authorization or reserve",
    actual: {
      answerCallsStarted: counters.answerStarted,
      judgeCallsStarted: counters.judgeStarted,
      reportedJudgeCalls,
      reportedJudgeCostUsd,
      answerProviderCostUsd: null,
      answerProviderCostSemantics: "not-emitted-by-playground-artifact",
      observedAttemptedModels: null
    },
    selectedCaseIds,
    caseIdsAttempted: attempted,
    caseIdsJudged: judged,
    infraRetryAuthorized: false
  };
}

/**
 * Paid-loop seam. Tests inject every side effect so they can prove checkpoint
 * ordering and that detected churn stops all later paid calls.
 */
export async function orchestratePlaygroundRun({
  cases,
  treeAtStart,
  startMeta,
  judgeEnabled,
  snapshotTree,
  runAnswer,
  judgeAnswer,
  makeRow,
  buildNormalArtifact,
  buildQuarantine = buildQuarantineArtifact,
  writeNormalArtifact,
  writeQuarantineArtifact,
  onAnswerStart = () => {},
  onRow = () => {},
  now = () => new Date().toISOString()
}) {
  const rows = [];
  const selectedCaseIds = cases.map((item) => item.id);
  const attempted = [];
  const judged = [];
  const counters = { answerStarted: 0, judgeStarted: 0 };
  let reportedJudgeCalls = 0;
  let reportedJudgeCostUsd = 0;

  const quarantine = async ({ code, phase, item, index, treeAtFinish, checkError }) => {
    const reason = {
      code,
      phase,
      caseId: item?.id ?? null,
      caseIndex: item ? index : null,
      detectedAt: now(),
      message:
        code === "local-provenance-generation-mismatch"
          ? "Local working-tree generation no longer matches the pinned start generation; running-Worker bytes were not introspected."
          : "A required local working-tree generation check failed after spend; no mismatch or server change is claimed.",
      checkError: checkError ?? null
    };
    const spend = actualSpend({ selectedCaseIds, attempted, judged, counters, reportedJudgeCalls, reportedJudgeCostUsd });
    const artifact = buildQuarantine({ meta: startMeta, rows, treeAtStart, treeAtFinish, reason, spend });
    await writeQuarantineArtifact(artifact, { reason, spend, treeAtStart, treeAtFinish });
    return { kind: "quarantined", artifact, reason, spend };
  };

  const checkpoint = async (phase, item, index) => {
    let tree;
    try {
      tree = await snapshotTree();
    } catch (error) {
      if (counters.answerStarted === 0) throw error;
      return quarantine({ code: "generation-check-error", phase, item, index, treeAtFinish: null, checkError: boundedCheckError(error) });
    }
    if (tree.generationSha256 === treeAtStart.generationSha256) return null;
    if (counters.answerStarted === 0) {
      throw new Error(`working-tree generation changed before spend (${treeAtStart.generationSha256} -> ${tree.generationSha256})`);
    }
    return quarantine({ code: "local-provenance-generation-mismatch", phase, item, index, treeAtFinish: tree });
  };

  for (const [index, item] of cases.entries()) {
    const beforeAnswer = await checkpoint("before-answer", item, index);
    if (beforeAnswer) return beforeAnswer;
    onAnswerStart({ item, index });
    counters.answerStarted += 1;
    attempted.push(item.id);
    const run = await runAnswer(item);
    const row = makeRow(item, run, null);
    rows.push(row);

    const beforeJudge = await checkpoint("before-judge", item, index);
    if (beforeJudge) return beforeJudge;
    if (judgeEnabled && run.answer) {
      counters.judgeStarted += 1;
      const verdict = await judgeAnswer(item, run);
      judged.push(item.id);
      if (typeof verdict?.costUsd === "number" && Number.isFinite(verdict.costUsd) && verdict.costUsd >= 0) {
        reportedJudgeCalls += 1;
        reportedJudgeCostUsd += verdict.costUsd;
      }
      row.verdict = verdict;
    } else if (judgeEnabled) {
      row.verdict = await judgeAnswer(item, run);
    }
    onRow({ item, row, index });
  }

  const final = await checkpoint("finalize", null, null);
  if (final) return final;
  const artifact = buildNormalArtifact(rows);
  await writeNormalArtifact(artifact, rows);
  return { kind: "normal", artifact, rows };
}

export async function writeAtomicQuarantine(outPath, artifact, {
  tempId = () => crypto.randomUUID(),
  openFile = open,
  renameFile = rename,
  remove = unlink
} = {}) {
  const tempPath = `${outPath}.${tempId()}.tmp`;
  let handle;
  let tempOwned = false;
  try {
    handle = await openFile(tempPath, "wx", 0o600);
    tempOwned = true;
    await handle.writeFile(`${JSON.stringify(artifact, null, 2)}\n`);
    await handle.close();
    handle = undefined;
    await renameFile(tempPath, outPath);
  } catch (error) {
    if (handle) await handle.close().catch(() => {});
    if (tempOwned) await remove(tempPath).catch(() => {});
    throw error;
  }
}

function formatNoticePath(value) {
  return JSON.stringify(sanitizeGenerationCheckError({ name: "Path", message: String(value ?? "") }).message);
}

export function formatQuarantineNotice({ writeFailed = false, path: quarantinePath, reason, treeAtStart, treeAtFinish, artifact, error }) {
  const { spend } = artifact;
  const derived = deriveQuarantineState(artifact);
  const accounting =
    `path=${formatNoticePath(quarantinePath)} reason=${reason.code} ` +
    `startGeneration=${treeAtStart.generationSha256} detectionGeneration=${treeAtFinish?.generationSha256 ?? "unavailable"} ` +
    `answerStarted=${spend.actual.answerCallsStarted} answerCompleted=${derived.actual.answerCallsCompleted} ` +
    `judgeStarted=${spend.actual.judgeCallsStarted} judgeCompleted=${derived.actual.judgeCallsCompleted}`;
  if (!writeFailed) return `QUARANTINED — NOT A RESULT: ${accounting}`;
  return `QUARANTINE WRITE FAILED — NOT A RESULT: ${accounting} error=${sanitizeGenerationCheckError(error).message}`;
}

export function exitCodeForRunDisposition(result) {
  return result?.kind === "quarantined" ? 1 : 0;
}

export class QuarantineNoticeEmittedError extends Error {
  constructor() {
    super("quarantine persistence failed after a safe marker was emitted");
    this.name = "QuarantineNoticeEmittedError";
  }
}

export function handleEntryDiagnostic(error, emit = (line) => console.error(line)) {
  if (error instanceof QuarantineNoticeEmittedError) return { exitCode: 1, emitted: false };
  emit(`playground semantic eval failed: ${sanitizeGenerationCheckError(error).message}`);
  return { exitCode: 1, emitted: true };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    process.stdout.write(usage());
    return;
  }
  const battery = loadCases(args.cases ?? path.join(QA_DIR, "cases.json"));
  const cases = selectCases(battery, args);
  const casesPath = args.cases ?? path.join(QA_DIR, "cases.json");
  if (cases.length > MAX_CASES_PER_RUN_SUBJECT) {
    throw new Error(
      `Selected ${cases.length} cases, exceeding the one-subject playground cap of ${MAX_CASES_PER_RUN_SUBJECT} chats/hour. ` +
        `Use --sample ${MAX_CASES_PER_RUN_SUBJECT}, a <=${MAX_CASES_PER_RUN_SUBJECT}-case named contract, or an explicit --ids shard; this harness never rotates subjects to bypass the real rate limit.`
    );
  }
  console.log(
    `playground semantic eval: ${battery.contract ? `contract ${battery.contract} · ` : ""}${cases.length} case(s) · ${args.full ? "full" : args.ids ? "ids" : `sample ${args.sample}, seed ${args.seed}`} · judge ${args.noJudge ? "OFF" : args.judgeModel ?? JUDGE_MODEL}`
  );
  console.log(`case ids: ${cases.map((item) => item.id).join(", ")}`);
  if (args.printGeneration) {
    console.log((await workingTreeSnapshot()).generationSha256);
    return;
  }
  if (args.dryRun) {
    console.log("dry-run complete: no HTTP request, playground model call, or judge call was made.");
    return;
  }
  const baseUrl = ensureLoopbackUrl(args.url ?? "http://localhost:8787");
  const endpoint = new URL("playground/chat", `${baseUrl.href.endsWith("/") ? baseUrl.href : `${baseUrl.href}/`}`).href;
  // Do not consume the shared dev-loopback throttle bucket. This is still the
  // real cookie-authenticated route and its ordinary per-subject rate limit;
  // the cookie is only minted for a loopback run and never logged or saved.
  const devVars = await readDevVars(".dev.vars").catch(() => ({}));
  const demoSecret = process.env.MCP_SERVER_SECRET ?? devVars.MCP_SERVER_SECRET;
  if (!demoSecret) {
    throw new Error("MCP_SERVER_SECRET is required to mint the run-scoped local evaluation cookie; refusing to fall back to the shared dev-loopback throttle bucket.");
  }
  const runId = `${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomUUID()}`;
  const cookie = await mintDemoCookie(demoSecret, `playground-semantic:${runId}`);
  if (args.preflight) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: new URL(endpoint).origin,
        "sec-fetch-site": "same-origin",
        cookie
      },
      // Deliberately invalid before the route's throttle/model stage.
      body: "{}"
    });
    const text = await response.text();
    if (response.status !== 400) {
      throw new Error(`playground preflight expected HTTP 400 before model execution, got ${response.status}: ${text.slice(0, 300)}`);
    }
    console.log("preflight complete: signed cookie reached body validation (HTTP 400); no throttle or model request was made.");
    return;
  }
  if (!args.confirmPaid) {
    throw new Error("Refusing a model-backed playground evaluation without --confirm-paid. Use --dry-run or --preflight to validate for free.");
  }
  assertModelBackedRunInputs(args);
  const judgeModel = args.judgeModel ?? JUDGE_MODEL;
  const treeAtStart = await workingTreeSnapshot();
  if (args.serverGeneration !== treeAtStart.generationSha256) {
    throw new Error(
      `--server-generation mismatch: expected ${args.serverGeneration}, current working tree is ${treeAtStart.generationSha256}`
    );
  }
  const answering = answeringConfiguration(devVars);
  const judge = {
    enabled: !args.noJudge,
    model: args.noJudge ? null : judgeModel,
    rubric: args.noJudge ? null : JUDGE_RUBRIC,
    packVersion: PACK_VERSION,
    temperature: {
      value: null,
      semantics: "provider-default-unpinned"
    }
  };
  const capContext = {
    demo: { ...DEMO_CAPS },
    evaluator: {
      timeoutMs: args.timeoutMs,
      maxCasesPerRunSubject: MAX_CASES_PER_RUN_SUBJECT,
      selectedCases: cases.length,
      answerCallsThisRun: cases.length,
      judgeCallsThisRun: args.noJudge ? 0 : cases.length,
      answerCallUnit: "one POST /playground/chat turn; provider fallback attempts remain inside that turn"
    },
    roundAuthorization: await loadRoundCapContext(args.roundCapContext)
  };
  const server = {
    endpoint,
    generationBasis: "operator-asserted-local-working-tree",
    generationSha256: treeAtStart.generationSha256,
    operatorAssertionSha256: args.serverGeneration,
    runtimeIntrospection: "not-available",
    proofLimit:
      "The assertion matches the local tree at run start/end; it does not prove that an already-running Worker loaded those bytes."
  };
  const sourceFiles = await inputFileHashes(path.resolve(casesPath));
  const startedAt = new Date().toISOString();
  const runMeta = (finishedAt) => ({
    runId,
    casesPath,
    caseContract: battery.contract ?? null,
    caseCount: cases.length,
    selection: args.ids ? { ids: args.ids } : args.full ? { full: true } : { sample: args.sample, seed: args.seed },
    startedAt,
    finishedAt
  });
  // Validate every source/config/cap pin before the first paid HTTP turn.
  const startMeta = buildPlaygroundArtifactMeta({
    run: runMeta(startedAt),
    answering,
    judge,
    capContext,
    inputFiles: sourceFiles,
    selectedCases: cases,
    tree: treeAtStart,
    server
  });
  const outDir = args.outDir ?? DEFAULT_OUT_DIR;
  await mkdir(outDir, { recursive: true });
  const quarantineDir = path.join(outDir, "quarantine");
  await mkdir(quarantineDir, { recursive: true });
  const outPath = path.join(outDir, `${runId}-playground-semantic.json`);
  const quarantinePath = path.join(quarantineDir, `${runId}-playground-semantic-quarantine.json`);
  const makeRow = (item, run, verdict) => {
    const transcriptEvidence = run.answer
      ? buildTranscriptEvidence({ ...item, candidateAnswer: run.answer, transcript: run.transcript })
      : "";
    return {
      id: item.id,
      question: item.question,
      tags: item.tags,
      truth: { status: item.truth.status, ...(item.truth.asOf ? { asOf: item.truth.asOf } : {}) },
      answer: run.answer,
      transcript: run.transcript,
      frames: run.frames,
      toolCalls: run.toolCalls,
      finishReason: run.finishReason,
      responseStatus: run.responseStatus,
      latencyMs: run.latencyMs,
      firstFrameMs: run.firstFrameMs,
      firstMeaningfulMs: run.firstMeaningfulMs,
      httpError: run.httpError,
      sseErrors: run.sseErrors,
      clientError: run.clientError,
      verdict,
      evidencePack: { packVersion: PACK_VERSION, chars: transcriptEvidence.length, sha256: transcriptEvidence ? sha256(transcriptEvidence) : null }
    };
  };
  const result = await orchestratePlaygroundRun({
    cases,
    treeAtStart,
    startMeta,
    judgeEnabled: !args.noJudge,
    snapshotTree: workingTreeSnapshot,
    runAnswer: (item) => runCase(item, { endpoint, timeoutMs: args.timeoutMs, cookie }),
    judgeAnswer: async (item, run) => {
      if (!run.answer) {
        return {
          score: "error", missingFacts: [], wrongClaims: [],
          rationale: run.clientError || run.httpError || run.sseErrors.join("; ") || "stream ended without an assistant final text or terminal error frame",
          rubric: JUDGE_RUBRIC, packVersion: PACK_VERSION, promptSha256: null
        };
      }
      const transcriptEvidence = buildTranscriptEvidence({ ...item, candidateAnswer: run.answer, transcript: run.transcript });
      return judgeCase({ ...item, candidateAnswer: run.answer, transcript: run.transcript, transcriptEvidence }, { model: judgeModel });
    },
    makeRow,
    buildNormalArtifact: (rows) => {
      const meta = buildPlaygroundArtifactMeta({
        run: runMeta(new Date().toISOString()), answering, judge, capContext, inputFiles: sourceFiles,
        selectedCases: cases, tree: treeAtStart, server
      });
      return { meta, summary: args.noJudge ? null : summarize(rows), rows };
    },
    writeNormalArtifact: async (artifact) => {
      await writeFile(outPath, `${JSON.stringify(artifact, null, 2)}\n`);
      console.log(`\nwrote ${outPath}`);
      if (artifact.summary) console.log(`\n${formatSummaryTable(artifact.summary)}`);
    },
    writeQuarantineArtifact: async (artifact, details) => {
      try {
        await writeAtomicQuarantine(quarantinePath, artifact);
      } catch (error) {
        console.error(formatQuarantineNotice({ writeFailed: true, path: quarantinePath, ...details, artifact, error }));
        throw new QuarantineNoticeEmittedError();
      }
      console.error(formatQuarantineNotice({ path: quarantinePath, ...details, artifact }));
    },
    onAnswerStart: ({ item, index }) => process.stdout.write(`[${index + 1}/${cases.length}] ${item.id} … `),
    onRow: ({ item, row, index }) => {
      console.log(`${row.verdict?.score ?? "captured"} (${row.toolCalls.search.started} search, ${row.toolCalls.execute.started} execute, ${Math.round(row.latencyMs / 1000)}s)`);
    }
  });
  process.exitCode = exitCodeForRunDisposition(result);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((error) => {
    process.exitCode = handleEntryDiagnostic(error).exitCode;
  });
}
