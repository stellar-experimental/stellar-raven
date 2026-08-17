#!/usr/bin/env node
/**
 * Re-judge saved QA answers without re-running the answering agent.
 *
 * Usage:
 *   node eval/qa/re-judge.mjs <results.json> --ids id-a,id-b
 *   node eval/qa/re-judge.mjs <results.json> --flips-vs <baseline.json>
 *
 * A saved QA result records the full selected input snapshot. Before spending
 * on a re-judge, this tool reconstructs that snapshot from meta.casesPath and
 * refuses if it no longer hashes to the recorded value. --allow-non-identical
 * makes that exceptional decision explicit in the output artifact.
 */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildTranscriptEvidence, JUDGE_MODEL, JUDGE_RUBRIC, judgeCase } from "./judge.mjs";
import { PACK_VERSION } from "./evidence-pack.mjs";
import {
  PLAYGROUND_ARTIFACT_CONTRACT,
  assertNotPlaygroundQuarantine,
  assertPlaygroundArtifactMeta
} from "../playground/artifact-contract.mjs";

const QA_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(QA_DIR, "..", "..");
const TOOL_VERSION = "re-judge/v3";
const GIT_MAX_BUFFER = 32 * 1024 * 1024;

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function fail(message) {
  throw new Error(message);
}

function readJson(filePath, label) {
  let text;
  try {
    text = readFileSync(filePath, "utf8");
  } catch (error) {
    fail(`${label} cannot be read at ${filePath}: ${error.message}`);
  }
  try {
    return { parsed: JSON.parse(text), sha256: sha256(text) };
  } catch (error) {
    fail(`${label} is not valid JSON at ${filePath}: ${error.message}`);
  }
}

function requireRows(results, label) {
  if (!Array.isArray(results?.rows)) fail(`${label} is missing rows[]`);
  const ids = new Set();
  for (const row of results.rows) {
    if (!row || typeof row.id !== "string" || !row.id) fail(`${label} has a row without a valid id`);
    if (ids.has(row.id)) fail(`${label} has duplicate row id ${row.id}`);
    ids.add(row.id);
  }
}

function requireVerdictScore(row, label) {
  if (typeof row.verdict?.score !== "string") {
    fail(`${label} row ${row.id} has no saved verdict.score and cannot be compared/re-judged`);
  }
}

function parseArgs(argv) {
  const positional = [];
  let ids;
  let flipsVs;
  let judgeModel = JUDGE_MODEL;
  let casesRef;
  let allowNonIdentical = false;
  let allowEmpty = false;
  let dryRun = false;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--ids") {
      if (ids !== undefined) fail("--ids may be supplied only once");
      ids = argv[++i];
      if (!ids || ids.startsWith("--")) fail("--ids requires a comma-separated id list");
    } else if (arg === "--flips-vs") {
      if (flipsVs !== undefined) fail("--flips-vs may be supplied only once");
      flipsVs = argv[++i];
      if (!flipsVs || flipsVs.startsWith("--")) fail("--flips-vs requires a baseline results path");
    } else if (arg === "--judge-model") {
      judgeModel = argv[++i];
      if (!judgeModel || judgeModel.startsWith("--")) fail("--judge-model requires a model name");
    } else if (arg === "--cases-ref") {
      if (casesRef !== undefined) fail("--cases-ref may be supplied only once");
      casesRef = argv[++i];
      if (!casesRef || casesRef.startsWith("--")) fail("--cases-ref requires a Git revision");
    } else if (arg === "--allow-non-identical") {
      allowNonIdentical = true;
    } else if (arg === "--allow-empty") {
      allowEmpty = true;
    } else if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log("usage: node eval/qa/re-judge.mjs <results.json> (--ids id-a,id-b | --flips-vs <baseline.json>) [--judge-model <model>] [--cases-ref <git-revision>] [--allow-non-identical] [--allow-empty] [--dry-run]");
      process.exit(0);
    } else if (arg.startsWith("--")) {
      fail(`unknown flag ${arg}`);
    } else {
      positional.push(arg);
    }
  }

  if (positional.length !== 1) fail("provide exactly one source results JSON path");
  if ((ids !== undefined) === (flipsVs !== undefined)) {
    fail("provide exactly one of --ids or --flips-vs <baseline-results.json>");
  }
  return { resultsPath: positional[0], ids, flipsVs, judgeModel, casesRef, allowNonIdentical, allowEmpty, dryRun };
}

function repositoryRelativePath(casesPath, repoRoot) {
  const absolutePath = path.isAbsolute(casesPath) ? path.resolve(casesPath) : path.resolve(repoRoot, casesPath);
  const relativePath = path.relative(repoRoot, absolutePath);
  if (!relativePath || relativePath === ".." || relativePath.startsWith(`..${path.sep}`) || path.isAbsolute(relativePath)) {
    fail(`source results meta.casesPath is outside the repository: ${casesPath}`);
  }
  return relativePath.split(path.sep).join("/");
}

function git(repoRoot, args, label) {
  const result = spawnSync("git", ["-C", repoRoot, ...args], {
    encoding: "utf8",
    maxBuffer: GIT_MAX_BUFFER,
    env: { ...process.env, GIT_TERMINAL_PROMPT: "0" }
  });
  if (result.error || result.status !== 0) {
    const error = result.error?.code === "ENOBUFS"
      ? `Git output exceeded the ${GIT_MAX_BUFFER / (1024 * 1024)} MiB limit`
      : result.stderr || result.error?.message || `git exited ${result.status}`;
    fail(`${label}: ${error.trim()}`);
  }
  return result.stdout;
}

function readCasesAtRevision(casesPath, casesRef, repoRoot) {
  const repositoryRelativeCasesPath = repositoryRelativePath(casesPath, repoRoot);
  const resolvedCommit = git(repoRoot, ["rev-parse", "--verify", "--quiet", `${casesRef}^{commit}`], `cases revision ${casesRef} cannot be resolved`).trim();
  const text = git(
    repoRoot,
    ["show", "--no-textconv", `${resolvedCommit}:${repositoryRelativeCasesPath}`],
    `cases blob ${repositoryRelativeCasesPath} is missing from revision ${resolvedCommit}`
  );
  try {
    return {
      parsed: JSON.parse(text),
      sourceCasesPath: `${resolvedCommit}:${repositoryRelativeCasesPath}`,
      revision: { requested: casesRef, resolvedCommit, repositoryRelativeCasesPath }
    };
  } catch (error) {
    fail(`source cases file is not valid JSON at ${resolvedCommit}:${repositoryRelativeCasesPath}: ${error.message}`);
  }
}

export function verifySourceCases(results, sourceResultsPath, { casesRef, repoRoot = REPO_ROOT } = {}) {
  const casesPath = results?.meta?.casesPath;
  const expectedCasesSha256 = results?.meta?.inputSnapshot?.casesSha256;
  if (typeof casesPath !== "string" || !casesPath) fail("source results meta.casesPath is required for the identity guard");
  if (typeof expectedCasesSha256 !== "string" || !expectedCasesSha256) {
    fail("source results meta.inputSnapshot.casesSha256 is required for the identity guard");
  }

  const historical = casesRef === undefined ? null : readCasesAtRevision(casesPath, casesRef, repoRoot);
  const casePathCandidates = path.isAbsolute(casesPath)
    ? [casesPath]
    : [
        path.resolve(path.dirname(sourceResultsPath), casesPath),
        path.resolve(REPO_ROOT, casesPath)
      ];
  const resolvedCasesPath = historical ? historical.sourceCasesPath : casePathCandidates.find((candidate) => existsSync(candidate)) ?? casePathCandidates[0];
  const sourceCases = historical ? historical.parsed : readJson(resolvedCasesPath, "source cases file").parsed;
  if (!Array.isArray(sourceCases?.cases)) fail(`source cases file ${resolvedCasesPath} is missing cases[]`);

  const recordedIds = results.rows.map((row) => row.id);
  const allCasesById = new Map(sourceCases.cases.map((kase) => [kase?.id, kase]));
  const selectedCases = recordedIds.map((id) => allCasesById.get(id));
  const missingCaseIds = recordedIds.filter((id) => !allCasesById.has(id));
  const selectedIds = selectedCases.filter(Boolean).map((kase) => kase.id);
  const actualCasesSha256 = sha256(JSON.stringify(selectedCases));
  const expectedCaseIdsSha256 = results?.meta?.inputSnapshot?.caseIdsSha256;
  const actualCaseIdsSha256 = sha256(JSON.stringify(recordedIds));
  const orderMatches = historical && typeof expectedCaseIdsSha256 === "string"
    ? actualCaseIdsSha256 === expectedCaseIdsSha256
    : JSON.stringify(recordedIds) === JSON.stringify(selectedIds);
  const matches = actualCasesSha256 === expectedCasesSha256 && missingCaseIds.length === 0 && orderMatches;

  if (historical && !matches) {
    fail(
      `revision-pinned case identity guard failed: expected ${expectedCasesSha256}, got ${actualCasesSha256}; ` +
        `missing ids: ${missingCaseIds.join(", ") || "none"}; order matches: ${orderMatches}`
    );
  }

  return {
    sourceResultsPath,
    sourceCasesPath: resolvedCasesPath,
    selectedCases,
    caseById: allCasesById,
    ...(historical ? { revision: historical.revision } : {}),
    guard: {
      expectedCasesSha256,
      actualCasesSha256,
      ...(historical && typeof expectedCaseIdsSha256 === "string" ? { expectedCaseIdsSha256, actualCaseIdsSha256 } : {}),
      missingCaseIds,
      orderMatches,
      matches
    }
  };
}

export function tupleGuard(results, judgeModel) {
  const versionedPlayground = results?.meta?.artifactContract === PLAYGROUND_ARTIFACT_CONTRACT;
  const source = versionedPlayground
    ? {
        model: results.meta.judge?.model,
        rubric: results.meta.judge?.rubric,
        packVersion: results.meta.judge?.packVersion
      }
    : {
        model: results?.meta?.judgeModel,
        rubric: results?.meta?.judgeRubric,
        packVersion: results?.meta?.packVersion
      };
  const current = { model: judgeModel, rubric: JUDGE_RUBRIC, packVersion: PACK_VERSION };
  return {
    source,
    current,
    matches:
      source.model === current.model &&
      source.rubric === current.rubric &&
      source.packVersion === current.packVersion
  };
}

export function judgeCostAccounting(rows, expectedJudgeCalls) {
  const reportedCosts = rows.map((row) => row.new?.costUsd).filter((cost) => Number.isFinite(cost));
  return {
    expectedJudgeCalls,
    reportedJudgeCalls: reportedCosts.length,
    missingJudgeCosts: expectedJudgeCalls - reportedCosts.length,
    totalJudgeCostUsd: Number(reportedCosts.reduce((sum, cost) => sum + cost, 0).toFixed(12))
  };
}

function selectRows(results, { ids, flipsVs, allowEmpty }) {
  if (ids !== undefined) {
    const wanted = ids.split(",").map((id) => id.trim()).filter(Boolean);
    if (!wanted.length) fail("--ids requires at least one non-empty id");
    if (new Set(wanted).size !== wanted.length) fail("--ids must not repeat an id");
    const wantedSet = new Set(wanted);
    const selected = results.rows.filter((row) => wantedSet.has(row.id));
    const missing = wanted.filter((id) => !selected.some((row) => row.id === id));
    if (missing.length) fail(`--ids not found in source results: ${missing.join(", ")}`);
    const verdictStates = selected.map((row) => typeof row.verdict?.score === "string");
    if (verdictStates.some(Boolean) && verdictStates.some((hasVerdict) => !hasVerdict)) {
      fail("--ids cannot mix saved verdicts with --no-judge rows; judge them in separate invocations");
    }
    return { mode: "ids", rows: selected, initialJudging: !verdictStates[0] };
  }

  const baselinePath = path.resolve(process.cwd(), flipsVs);
  const { parsed: baseline, sha256: baselineSha256 } = readJson(baselinePath, "baseline results");
  assertNotPlaygroundQuarantine(baseline, "baseline results");
  requireRows(baseline, "baseline results");
  const baselineById = new Map(baseline.rows.map((row) => [row.id, row]));
  const sourceOnly = results.rows.map((row) => row.id).filter((id) => !baselineById.has(id));
  if (sourceOnly.length) {
    fail(`baseline results is missing source result ids: ${sourceOnly.join(", ")}`);
  }
  const selected = results.rows.filter((row) => {
    requireVerdictScore(row, "source results");
    const baselineRow = baselineById.get(row.id);
    requireVerdictScore(baselineRow, "baseline results");
    return row.verdict.score !== baselineRow.verdict.score;
  });
  if (!selected.length) {
    const message = "--flips-vs found no score changes; refusing to create an empty re-judge artifact (pass --allow-empty to override)";
    if (!allowEmpty) fail(message);
    console.warn(`warning: ${message}`);
  }
  return { mode: "flips-vs", rows: selected, baselinePath, baselineSha256, initialJudging: false };
}

export async function rejudgeRows({
  selectedRows,
  caseById,
  judgeModel,
  judge = judgeCase,
  checkpoint,
  log = console.log
}) {
  const rows = [];
  for (const [index, row] of selectedRows.entries()) {
    const kase = caseById.get(row.id);
    if (!kase) fail(`source cases file no longer contains selected case ${row.id}`);
    if (typeof row.answer !== "string") fail(`source results row ${row.id} has no saved answer string`);
    if (!Array.isArray(row.transcript)) fail(`source results row ${row.id} has no saved transcript array`);

    log(`[${index + 1}/${selectedRows.length}] ${row.id} …`);
    const verdict = await judge(
      { ...kase, candidateAnswer: row.answer, transcript: row.transcript },
      { model: judgeModel }
    );
    const transcriptEvidence = buildTranscriptEvidence({
      ...kase,
      candidateAnswer: row.answer,
      transcript: row.transcript
    });
    rows.push({
      id: row.id,
      original: row.verdict,
      new: verdict,
      agreement: typeof row.verdict?.score === "string" ? row.verdict.score === verdict.score : null,
      evidencePack: {
        packVersion: PACK_VERSION,
        chars: transcriptEvidence.length,
        sha256: transcriptEvidence ? sha256(transcriptEvidence) : null
      }
    });
    await checkpoint(rows);
    log(`${row.verdict?.score ?? "unjudged"} → ${verdict.score}`);
  }
  return rows;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const sourceResultsPath = path.resolve(process.cwd(), options.resultsPath);
  const { parsed: results, sha256: sourceResultsSha256 } = readJson(sourceResultsPath, "source results");
  assertNotPlaygroundQuarantine(results, "source results");
  requireRows(results, "source results");
  if (results?.meta?.artifactContract === PLAYGROUND_ARTIFACT_CONTRACT) {
    assertPlaygroundArtifactMeta(results.meta);
  }

  const identity = verifySourceCases(results, sourceResultsPath, { casesRef: options.casesRef });
  const tuple = tupleGuard(results, options.judgeModel);
  const selection = selectRows(results, options);
  const nonIdentical = !identity.guard.matches || !tuple.matches;
  const guards = {
    cases: identity.guard,
    ...(identity.revision
      ? {
          historicalCases: {
            ...identity.revision,
            selectedCasesSha256: identity.guard.actualCasesSha256,
            guard: identity.guard
          }
        }
      : {}),
    tuple,
    allowNonIdentical: options.allowNonIdentical,
    wouldRefuse: nonIdentical && !options.allowNonIdentical
  };

  if (options.dryRun) {
    console.log(
      JSON.stringify(
        {
          sourceResultsPath,
          selectedIds: selection.rows.map((row) => row.id),
          initialJudging: selection.initialJudging,
          guards
        },
        null,
        2
      )
    );
    return;
  }
  if (nonIdentical && !options.allowNonIdentical) {
    const reasons = [];
    if (!identity.guard.matches) {
      reasons.push(
        `case input snapshot differs (expected ${identity.guard.expectedCasesSha256}, got ${identity.guard.actualCasesSha256}; ` +
          `missing ids: ${identity.guard.missingCaseIds.join(", ") || "none"}; order matches: ${identity.guard.orderMatches})`
      );
    }
    if (!tuple.matches) {
      reasons.push(
        `judge tuple differs (source model ${tuple.source.model ?? "missing"}/rubric ${tuple.source.rubric ?? "missing"}/pack ${tuple.source.packVersion ?? "missing"}; ` +
          `current ${tuple.current.model}/${tuple.current.rubric}/${tuple.current.packVersion})`
      );
    }
    fail(`refusing non-identical re-judge: ${reasons.join("; ")}. Pass --allow-non-identical to create a loudly labeled artifact.`);
  }

  const startedAt = new Date().toISOString();
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const resultsDir = path.join(QA_DIR, "results");
  const outPath = path.join(resultsDir, `${stamp}-rejudge.json`);
  const baseMeta = {
      sourceResultsPath,
      sourceResultsSha256,
      ...(selection.baselinePath ? { baselinePath: selection.baselinePath, baselineSha256: selection.baselineSha256 } : {}),
      mode: selection.mode,
      initialJudging: selection.initialJudging,
      selectedIds: selection.rows.map((row) => row.id),
      emptySelection: selection.rows.length === 0,
      sourceCasesPath: identity.sourceCasesPath,
      casesSha256: identity.guard.actualCasesSha256,
      inputSnapshotCasesSha256: identity.guard.expectedCasesSha256,
      ...(identity.revision
        ? {
            historicalCases: {
              ...identity.revision,
              selectedCasesSha256: identity.guard.actualCasesSha256,
              guard: identity.guard
            }
          }
        : {}),
      nonIdentical,
      identity: identity.guard,
      tuple,
      judgeModel: options.judgeModel,
      judgeRubric: JUDGE_RUBRIC,
      packVersion: PACK_VERSION,
      startedAt,
      toolVersion: TOOL_VERSION
  };
  mkdirSync(resultsDir, { recursive: true });
  const writeCheckpoint = (rows, finishedAt = null) => {
    const artifact = {
      meta: {
        ...baseMeta,
        completedIds: rows.map((row) => row.id),
        promptSha256ById: Object.fromEntries(rows.map((row) => [row.id, row.new.promptSha256 ?? null])),
        costs: judgeCostAccounting(rows, selection.rows.length),
        finishedAt
      },
      rows
    };
    const tmpPath = `${outPath}.tmp`;
    writeFileSync(tmpPath, JSON.stringify(artifact, null, 2) + "\n");
    renameSync(tmpPath, outPath);
  };
  writeCheckpoint([]);
  const rows = await rejudgeRows({
    selectedRows: selection.rows,
    caseById: identity.caseById,
    judgeModel: options.judgeModel,
    checkpoint: (completedRows) => writeCheckpoint(completedRows),
    log: (message) => console.log(message)
  });
  writeCheckpoint(rows, new Date().toISOString());
  console.log(`wrote ${outPath}`);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((error) => {
    console.error(`re-judge: ${error.message}`);
    process.exitCode = 1;
  });
}
