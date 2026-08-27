#!/usr/bin/env node
/**
 * Re-judge saved QA answers without re-running the answering agent.
 *
 * Usage:
 *   node eval/qa/re-judge.mjs <results.json> --ids id-a,id-b
 *   node eval/qa/re-judge.mjs <results.json> --flips-vs <baseline.json>
 *   node eval/qa/re-judge.mjs <results.json> --ids id-a --cases-ref worktree
 *
 * A saved QA result records the full selected input snapshot. Before spending
 * on a re-judge, this tool reconstructs that snapshot from meta.casesPath and
 * refuses if it no longer hashes to the recorded value. --flips-vs holds its
 * baseline to the same snapshot and judge-tuple contract, and additionally
 * compares case content for every id the two artifacts share, because the
 * baseline decides which rows get paid for. That baseline guard is absolute.
 * --allow-non-identical makes an exceptional SOURCE decision explicit in the
 * output artifact; it never waives a baseline mismatch.
 * --cases-ref worktree selects current compiled cases without a revision pin.
 * The ordinary identity and golden-time guards still apply in that mode.
 */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  buildAgentErrorVerdict,
  buildTranscriptEvidence,
  hasSuccessfulAnswer,
  judgeCase,
  judgeCasePanel,
  JUDGE_MODEL,
  JUDGE_RUBRIC
} from "./judge.mjs";
import { PACK_VERSION } from "./evidence-pack.mjs";
import {
  PLAYGROUND_ARTIFACT_CONTRACT,
  assertNotPlaygroundQuarantine,
  assertPlaygroundArtifactMeta
} from "../playground/artifact-contract.mjs";

const QA_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(QA_DIR, "..", "..");
const TOOL_VERSION = "re-judge/v4";
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

export function effectiveVerdictScore(verdict) {
  return verdict?.score === "error" && typeof verdict.judgeScore === "string"
    ? verdict.judgeScore
    : verdict?.score;
}

/**
 * Whether two verdicts agree on the grade — `null` when the question does not
 * apply. `agreement` measures grade variance between two judge calls, so it
 * needs a grade on both sides. An effective "error" is not a grade: the CLI
 * crashed, or the reply was unparseable, and nothing about the candidate was
 * measured. Reporting that as `false` would count a missing measurement as a
 * disagreement and inflate every disagreement rate computed from the artifact.
 */
export function verdictAgreement(original, next) {
  const before = effectiveVerdictScore(original);
  const after = effectiveVerdictScore(next);
  if (typeof before !== "string" || typeof after !== "string") return null;
  if (before === "error" || after === "error") return null;
  return before === after;
}

function parseArgs(argv) {
  const positional = [];
  let ids;
  let flipsVs;
  let judgeModel = JUDGE_MODEL;
  let casesRef;
  let judgePanel = 1;
  let allowNonIdentical = false;
  let allowGoldenDrift = false;
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
      if (!casesRef || casesRef.startsWith("--")) fail("--cases-ref requires a Git revision or worktree");
    } else if (arg === "--judge-panel") {
      const value = argv[++i];
      judgePanel = Number(value);
      if ((judgePanel !== 2 && judgePanel !== 3) || !Number.isInteger(judgePanel)) {
        fail(`--judge-panel must be 2 or 3, got ${value}`);
      }
    } else if (arg === "--allow-non-identical") {
      allowNonIdentical = true;
    } else if (arg === "--allow-golden-drift") {
      allowGoldenDrift = true;
    } else if (arg === "--allow-empty") {
      allowEmpty = true;
    } else if (arg === "--dry-run") {
      dryRun = true;
    } else if (arg === "--help" || arg === "-h") {
      console.log("usage: node eval/qa/re-judge.mjs <results.json> (--ids id-a,id-b | --flips-vs <baseline.json>) [--judge-model <model>] [--judge-panel <2|3>] [--cases-ref <git-revision|worktree>] [--allow-non-identical] [--allow-golden-drift] [--allow-empty] [--dry-run]");
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
  return {
    resultsPath: positional[0],
    ids,
    flipsVs,
    judgeModel,
    judgePanel,
    casesRef,
    allowNonIdentical,
    allowGoldenDrift,
    allowEmpty,
    dryRun
  };
}

function mappedRepositoryRelativePath(casesPath, repoRoot) {
  const windowsAbsolute = /^(?:[A-Za-z]:[\\/]|\\\\)/;
  if (windowsAbsolute.test(casesPath)) {
    const portableRecordedPath = path.posix.normalize(casesPath.replaceAll("\\", "/"));
    const marker = "/eval/qa/";
    const markerIndex = portableRecordedPath.lastIndexOf(marker);
    if (markerIndex === -1) return null;
    const mapped = path.posix.normalize(`eval/qa/${portableRecordedPath.slice(markerIndex + marker.length)}`);
    return mapped.startsWith("eval/qa/") ? mapped : null;
  }
  const portableRelativePath = casesPath.startsWith("eval\\qa\\")
    ? path.posix.normalize(casesPath.replaceAll("\\", "/"))
    : casesPath;
  const absolutePath = path.isAbsolute(portableRelativePath)
    ? path.resolve(portableRelativePath)
    : path.resolve(repoRoot, portableRelativePath);
  const relativePath = path.relative(repoRoot, absolutePath);
  if (relativePath && relativePath !== ".." && !relativePath.startsWith(`..${path.sep}`) && !path.isAbsolute(relativePath)) {
    return relativePath.split(path.sep).join("/");
  }
  const normalized = absolutePath.split(path.sep).join("/");
  const marker = "/eval/qa/";
  const markerIndex = normalized.lastIndexOf(marker);
  return markerIndex === -1 ? null : `eval/qa/${normalized.slice(markerIndex + marker.length)}`;
}

function repositoryRelativePath(casesPath, repoRoot) {
  const mapped = mappedRepositoryRelativePath(casesPath, repoRoot);
  if (!mapped) fail(`source results meta.casesPath is outside the repository: ${casesPath}`);
  return mapped;
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

export function verifySourceCases(results, sourceResultsPath, { casesRef, repoRoot = REPO_ROOT, label = "source results" } = {}) {
  const casesPath = results?.meta?.casesPath;
  const expectedCasesSha256 = results?.meta?.inputSnapshot?.casesSha256;
  if (typeof casesPath !== "string" || !casesPath) fail(`${label} meta.casesPath is required for the identity guard`);
  if (typeof expectedCasesSha256 !== "string" || !expectedCasesSha256) {
    fail(`${label} meta.inputSnapshot.casesSha256 is required for the identity guard`);
  }

  const historical = casesRef === undefined ? null : readCasesAtRevision(casesPath, casesRef, repoRoot);
  const mappedCasesPath = mappedRepositoryRelativePath(casesPath, repoRoot);
  const casePathCandidates = path.isAbsolute(casesPath)
    ? [
        ...(mappedCasesPath ? [path.resolve(repoRoot, mappedCasesPath)] : []),
        casesPath
      ]
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

function goldenDates(kase) {
  return [
    ["truth.asOf", kase?.truth?.asOf],
    ["truth.verified.date", kase?.truth?.verified?.date],
    ["truth.verificationDate", kase?.truth?.verificationDate]
  ].filter(([, value]) => typeof value === "string" && value);
}

export function resolveCasesRef(results, explicitCasesRef) {
  if (explicitCasesRef === "worktree") return undefined;
  if (explicitCasesRef !== undefined) return explicitCasesRef;
  const recorded = results?.meta?.sourceIdentity?.runnerRevision;
  return typeof recorded === "string" && recorded ? recorded : undefined;
}

export function isUngradeableSavedRow(row) {
  const legacyAgentError =
    row?.verdict?.score === "error" &&
    row.verdict.promptSha256 == null &&
    typeof row.verdict.judgeScore !== "string";
  return !hasSuccessfulAnswer(row?.answer, row?.agent?.failure) || legacyAgentError;
}

export function goldenTimeConsistency(results, selectedRows, caseById) {
  const finishedAt = results?.meta?.finishedAt;
  const finishedAtMs = Date.parse(finishedAt);
  const violations = [];
  if (!Number.isFinite(finishedAtMs)) {
    return { matches: true, finishedAt: finishedAt ?? null, checkedIds: [], violations };
  }
  const checkedIds = [];
  for (const row of selectedRows) {
    const kase = caseById.get(row.id);
    if (kase?.tags?.freshness !== "live" && kase?.tags?.freshness !== "scheduled") continue;
    checkedIds.push(row.id);
    for (const [field, value] of goldenDates(kase)) {
      const goldenMs = Date.parse(value);
      if (Number.isFinite(goldenMs) && goldenMs > finishedAtMs) {
        violations.push({ id: row.id, freshness: kase.tags.freshness, field, value });
      }
    }
  }
  return { matches: violations.length === 0, finishedAt, checkedIds, violations };
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

// The --flips-vs baseline decides which rows are worth paying to re-judge, so
// it carries the same identity contract as the source: its recorded
// selected-case snapshot must still reproduce, its judge tuple must be the
// current one, and every case id it shares with the source must carry identical
// content on both sides. Only then is a score difference a real flip rather
// than an artifact of a drifted corpus, a different judge, or the same id
// holding a different question. This guard is ABSOLUTE: --allow-non-identical
// covers a source snapshot that no longer reproduces and never waives a
// baseline mismatch. The caller refuses before selection and before the first
// judge call, so --dry-run refuses too.
export function verifyBaselineIdentity(baseline, baselinePath, { casesRef, judgeModel, sourceCaseById, sharedIds = [], repoRoot = REPO_ROOT } = {}) {
  let cases;
  let baselineCaseById;
  try {
    const verified = verifySourceCases(baseline, baselinePath, { casesRef, repoRoot, label: "baseline results" });
    cases = verified.guard;
    baselineCaseById = verified.caseById;
  } catch (error) {
    // A revision-pinned guard and a malformed snapshot both throw. Both mean
    // the baseline cannot be trusted, so record the reason and fail closed.
    cases = { matches: false, reason: error.message };
  }
  const tuple = tupleGuard(baseline, judgeModel);
  // Each side reproducing its own snapshot is not enough: two cases files can
  // each be self-consistent while the SAME id carries a different question or
  // golden on each side. A score difference would then be a different question,
  // not a flip, so every shared id is compared by content.
  const mismatchedIds = [];
  const comparedIds = [];
  for (const id of sharedIds) {
    comparedIds.push(id);
    const sourceCase = sourceCaseById?.get(id);
    const baselineCase = baselineCaseById?.get(id);
    if (!baselineCaseById || JSON.stringify(sourceCase) !== JSON.stringify(baselineCase)) mismatchedIds.push(id);
  }
  const sharedCases = { comparedIds, mismatchedIds, matches: mismatchedIds.length === 0 };
  return {
    baselinePath,
    cases,
    tuple,
    sharedCases,
    matches: cases.matches && tuple.matches && sharedCases.matches
  };
}

// Every reason a baseline is not comparable to the source. Reported together so
// one refusal names all of them.
export function baselineRefusalReasons(guard) {
  const reasons = [];
  if (!guard.cases.matches) {
    reasons.push(
      `baseline case input snapshot differs (${
        guard.cases.reason ??
        `expected ${guard.cases.expectedCasesSha256}, got ${guard.cases.actualCasesSha256}; ` +
          `missing ids: ${guard.cases.missingCaseIds.join(", ") || "none"}; order matches: ${guard.cases.orderMatches}`
      })`
    );
  }
  if (!guard.tuple.matches) {
    reasons.push(
      `baseline judge tuple differs (baseline model ${guard.tuple.source.model ?? "missing"}/rubric ${guard.tuple.source.rubric ?? "missing"}/pack ${guard.tuple.source.packVersion ?? "missing"}; ` +
        `current ${guard.tuple.current.model}/${guard.tuple.current.rubric}/${guard.tuple.current.packVersion})`
    );
  }
  if (!guard.sharedCases.matches) {
    reasons.push(
      `shared case content differs between source and baseline for ${guard.sharedCases.mismatchedIds.length} of ` +
        `${guard.sharedCases.comparedIds.length} shared ids: ${guard.sharedCases.mismatchedIds.join(", ")}`
    );
  }
  return reasons;
}
export function judgeCostAccounting(rows, expectedJudgeCalls) {
  const reportedCosts = rows.map((row) => row.new?.costUsd).filter((cost) => Number.isFinite(cost));
  const reportedJudgeCalls = rows.reduce(
    (sum, row) => sum + (Number.isInteger(row.new?.meta?.panelReportedCostCount)
      ? row.new.meta.panelReportedCostCount
      : Number.isFinite(row.new?.costUsd) ? 1 : 0),
    0
  );
  return {
    expectedJudgeCalls,
    reportedJudgeCalls,
    missingJudgeCosts: expectedJudgeCalls - reportedJudgeCalls,
    totalJudgeCostUsd: Number(reportedCosts.reduce((sum, cost) => sum + cost, 0).toFixed(12))
  };
}

function selectRows(results, { ids, flipsVs, allowEmpty, casesRef, judgeModel }, identity) {
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

  // The baseline is what makes a score difference mean anything, so its guard
  // is absolute: --allow-non-identical covers a source snapshot that no longer
  // reproduces, never a baseline that is not comparable. Refused here, before
  // selection and before any judge call, so --dry-run refuses too.
  const baselineGuard = verifyBaselineIdentity(baseline, baselinePath, {
    casesRef,
    judgeModel,
    sourceCaseById: identity?.caseById,
    sharedIds: results.rows.map((row) => row.id).filter((id) => baselineById.has(id))
  });
  if (!baselineGuard.matches) {
    fail(
      `refusing re-judge against a non-comparable baseline: ${baselineRefusalReasons(baselineGuard).join("; ")}. ` +
        "--allow-non-identical does not waive a baseline mismatch; re-judge the baseline under the current tuple instead."
    );
  }
  const selected = results.rows.filter((row) => {
    requireVerdictScore(row, "source results");
    const baselineRow = baselineById.get(row.id);
    requireVerdictScore(baselineRow, "baseline results");
    return effectiveVerdictScore(row.verdict) !== effectiveVerdictScore(baselineRow.verdict);
  });
  if (!selected.length) {
    const message = "--flips-vs found no score changes; refusing to create an empty re-judge artifact (pass --allow-empty to override)";
    if (!allowEmpty) fail(message);
    console.warn(`warning: ${message}`);
  }
  return { mode: "flips-vs", rows: selected, baselinePath, baselineSha256, baselineGuard, initialJudging: false };
}

export async function rejudgeRows({
  selectedRows,
  caseById,
  judgeModel,
  judgePanel = 1,
  judge = judgeCase,
  checkpoint,
  log = console.log
}) {
  const rows = [];
  for (const [index, row] of selectedRows.entries()) {
    const kase = caseById.get(row.id);
    if (!kase) fail(`source cases file no longer contains selected case ${row.id}`);

    log(`[${index + 1}/${selectedRows.length}] ${row.id} …`);
    if (isUngradeableSavedRow(row)) {
      const verdict = row.verdict?.score === "error"
        ? row.verdict
        : buildAgentErrorVerdict(row.agent?.failure);
      rows.push({
        id: row.id,
        original: row.verdict,
        new: verdict,
        agreement: verdictAgreement(row.verdict, verdict),
        skipped: { reason: "unsuccessful-answer" },
        evidencePack: { packVersion: PACK_VERSION, chars: 0, sha256: null }
      });
      await checkpoint(rows);
      log(`${effectiveVerdictScore(row.verdict) ?? "unjudged"} → skipped (unsuccessful answer)`);
      continue;
    }
    if (!Array.isArray(row.transcript)) fail(`source results row ${row.id} has no saved transcript array`);
    const verdict = await judgeCasePanel(
      { ...kase, candidateAnswer: row.answer, transcript: row.transcript },
      { model: judgeModel, panelSize: judgePanel, judge }
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
      agreement: verdictAgreement(row.verdict, verdict),
      evidencePack: {
        packVersion: PACK_VERSION,
        chars: transcriptEvidence.length,
        sha256: transcriptEvidence ? sha256(transcriptEvidence) : null
      }
    });
    await checkpoint(rows);
    log(`${effectiveVerdictScore(row.verdict) ?? "unjudged"} → ${effectiveVerdictScore(verdict)}`);
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

  const casesRef = resolveCasesRef(results, options.casesRef);
  const casesMode = casesRef === undefined ? "worktree" : "revision";
  const effectiveOptions = { ...options, casesRef };
  const identity = verifySourceCases(results, sourceResultsPath, { casesRef });
  const tuple = tupleGuard(results, options.judgeModel);
  const selection = selectRows(results, effectiveOptions, identity);
  const goldenTime = goldenTimeConsistency(results, selection.rows, identity.caseById);
  if (!goldenTime.matches && !options.allowGoldenDrift) {
    const details = goldenTime.violations
      .map((item) => `${item.id} ${item.field}=${item.value}`)
      .join(", ");
    fail(
      `refusing time-inconsistent re-judge: source run finished at ${goldenTime.finishedAt}, but selected live/scheduled goldens are newer: ${details}. ` +
        "Pass --allow-golden-drift to acknowledge this golden drift explicitly."
    );
  }
  const nonIdentical = !identity.guard.matches || !tuple.matches;
  const guards = {
    cases: identity.guard,
    casesMode,
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
    goldenTime: { ...goldenTime, allowGoldenDrift: options.allowGoldenDrift },
    ...(selection.baselineGuard ? { baseline: selection.baselineGuard } : {}),
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
      casesMode,
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
      goldenTime: { ...goldenTime, allowGoldenDrift: options.allowGoldenDrift },
      ...(selection.baselineGuard ? { baselineGuard: selection.baselineGuard } : {}),
      judgeModel: options.judgeModel,
      ...(options.judgePanel > 1 ? { judgePanel: options.judgePanel } : {}),
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
        costs: judgeCostAccounting(
          rows,
          selection.rows.filter((row) => !isUngradeableSavedRow(row)).length * options.judgePanel
        ),
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
    judgePanel: options.judgePanel,
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
