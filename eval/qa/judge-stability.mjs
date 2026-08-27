#!/usr/bin/env node
/**
 * Build the local QA judge stability register from saved result artifacts.
 *
 * The register is derived, local data. It is not a corpus input and it must
 * not become a hard dependency for judging. The score formula is:
 *
 *   1 - (initial disagreements + cross-pass flips) / comparison count
 *
 * Initial disagreement counts every non-modal initial verdict. Initial
 * comparison count is max(0, initial verdicts - 1). Each rejudge
 * original-to-new pair adds one comparison and one new sample. A case with
 * one sample and no comparison scores 1. A case with no sample scores null.
 */
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const QA_DIR = path.dirname(fileURLToPath(import.meta.url));
const SCORE_VALUES = ["correct", "partial", "wrong", "error"];
const SCORE_SET = new Set(SCORE_VALUES);

export const STABILITY_SCHEMA_VERSION = 1;
export const DEFAULT_STABILITY_REGISTER_PATH = path.join(QA_DIR, "judge-stability.json");
export const DEFAULT_STABILITY_RESULTS_DIR = path.join(QA_DIR, "results");
export const JUDGE_STABILITY_THRESHOLD = 0.75;
export const STABILITY_FORMULA =
  "1 - (initialDisagreements + crossPassFlips) / comparisonCount; " +
  "comparisonCount = max(0, initialVerdictCount - 1) + crossPassComparisons; " +
  "one sample with no comparisons scores 1; zero samples score null";

function emptyDistribution() {
  return Object.fromEntries(SCORE_VALUES.map((score) => [score, 0]));
}

function verdictScore(verdict) {
  return SCORE_SET.has(verdict?.score) ? verdict.score : null;
}

function missingFactCount(verdict) {
  return Array.isArray(verdict?.missingFacts)
    ? verdict.missingFacts.filter((fact) => typeof fact === "string").length
    : 0;
}

function hasWrongClaims(verdict) {
  return Array.isArray(verdict?.wrongClaims) &&
    verdict.wrongClaims.some((claim) => typeof claim === "string" && claim.length > 0);
}

function validCrossPassPair(pair) {
  if (Array.isArray(pair)) return verdictScore({ score: pair[0] }) && verdictScore({ score: pair[1] });
  return verdictScore({ score: pair?.original }) && verdictScore({ score: pair?.next });
}

function crossPassScores(pair) {
  return Array.isArray(pair) ? pair : [pair.original, pair.next];
}

export function calculateCaseStability({ initialScores = [], crossPassPairs = [] } = {}) {
  const validInitialScores = initialScores.filter((score) => SCORE_SET.has(score));
  const validPairs = crossPassPairs.filter(validCrossPassPair).map(crossPassScores);
  const distribution = emptyDistribution();
  for (const score of validInitialScores) distribution[score] += 1;
  const modalCount = Math.max(0, ...Object.values(distribution));
  const initialDisagreements = validInitialScores.length
    ? validInitialScores.length - modalCount
    : 0;
  const crossPassFlips = validPairs.filter(([original, next]) => original !== next).length;
  const comparisonCount = Math.max(0, validInitialScores.length - 1) + validPairs.length;
  const sampleCount = validInitialScores.length + validPairs.length;
  const instabilityEvents = initialDisagreements + crossPassFlips;
  const stabilityScore = sampleCount === 0
    ? null
    : comparisonCount === 0
      ? 1
      : Number(Math.max(0, 1 - instabilityEvents / comparisonCount).toFixed(6));
  return {
    initialDisagreements,
    crossPassFlips,
    comparisonCount,
    sampleCount,
    stabilityScore
  };
}

function artifactKind(name, data) {
  if (!Array.isArray(data?.rows)) return null;
  if (/-variant[A-Z]\.json$/i.test(name)) return "collection";
  if (/-rejudge\.json$/i.test(name)) return "rejudge";
  return null;
}

function artifactCandidateName(name) {
  return /-(?:variant[A-Z]|rejudge)\.json$/i.test(name);
}

function accumulatorFor(accumulators, id) {
  if (!accumulators.has(id)) {
    accumulators.set(id, {
      appearances: 0,
      initialScores: [],
      crossPassPairs: [],
      partialMissingFactCounts: [],
      anyWrongClaims: false
    });
  }
  return accumulators.get(id);
}

function observeVerdict(accumulator, verdict) {
  if (verdictScore(verdict) === "partial") {
    accumulator.partialMissingFactCounts.push(missingFactCount(verdict));
  }
  accumulator.anyWrongClaims ||= hasWrongClaims(verdict);
}

/** Build the case-keyed body. Artifact entries use `{ name, data }`. */
export function buildStabilityRegister(artifacts) {
  const accumulators = new Map();

  for (const artifact of artifacts) {
    const kind = artifactKind(artifact?.name ?? "", artifact?.data);
    if (!kind) continue;
    for (const row of artifact.data.rows) {
      if (typeof row?.id !== "string" || !row.id) continue;
      if (kind === "collection") {
        const score = verdictScore(row.verdict);
        if (!score) continue;
        const accumulator = accumulatorFor(accumulators, row.id);
        accumulator.appearances += 1;
        accumulator.initialScores.push(score);
        observeVerdict(accumulator, row.verdict);
        continue;
      }

      const original = verdictScore(row.original);
      const next = verdictScore(row.new);
      if (!original || !next) continue;
      const accumulator = accumulatorFor(accumulators, row.id);
      accumulator.appearances += 1;
      accumulator.crossPassPairs.push([original, next]);
      observeVerdict(accumulator, row.new);
    }
  }

  const register = {};
  for (const id of [...accumulators.keys()].sort()) {
    const accumulator = accumulators.get(id);
    const verdictDistribution = emptyDistribution();
    for (const score of accumulator.initialScores) verdictDistribution[score] += 1;
    const stability = calculateCaseStability({
      initialScores: accumulator.initialScores,
      crossPassPairs: accumulator.crossPassPairs
    });
    const meanMissingFactsOnPartials = accumulator.partialMissingFactCounts.length
      ? Number((
          accumulator.partialMissingFactCounts.reduce((sum, count) => sum + count, 0) /
          accumulator.partialMissingFactCounts.length
        ).toFixed(6))
      : null;
    register[id] = {
      appearances: accumulator.appearances,
      verdictDistribution,
      initialVerdictCount: accumulator.initialScores.length,
      initialDisagreements: stability.initialDisagreements,
      crossPassComparisons: accumulator.crossPassPairs.length,
      crossPassFlips: stability.crossPassFlips,
      comparisonCount: stability.comparisonCount,
      meanMissingFactsOnPartials,
      anyWrongClaims: accumulator.anyWrongClaims,
      stabilityScore: stability.stabilityScore,
      sampleCount: stability.sampleCount
    };
  }
  return register;
}

function artifactSignature(filePath, name) {
  const stat = statSync(filePath);
  return { name, size: stat.size, mtimeMs: Math.trunc(stat.mtimeMs) };
}

function candidateNames(resultsDir) {
  try {
    return readdirSync(resultsDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && artifactCandidateName(entry.name))
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

function sourceSignatures(resultsDir) {
  return candidateNames(resultsDir).map((name) => artifactSignature(path.join(resultsDir, name), name));
}

function sameSignatures(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function generateStabilityRegister({
  resultsDir = DEFAULT_STABILITY_RESULTS_DIR,
  outPath = DEFAULT_STABILITY_REGISTER_PATH,
  now = new Date()
} = {}) {
  const resolvedResultsDir = path.resolve(resultsDir);
  const resolvedOutPath = path.resolve(outPath);
  const sourceArtifacts = sourceSignatures(resolvedResultsDir);
  const artifacts = [];
  const skippedArtifacts = [];

  for (const source of sourceArtifacts) {
    const filePath = path.join(resolvedResultsDir, source.name);
    try {
      const data = JSON.parse(readFileSync(filePath, "utf8"));
      if (artifactKind(source.name, data)) artifacts.push({ name: source.name, data });
    } catch (error) {
      skippedArtifacts.push({ name: source.name, reason: error instanceof Error ? error.message : String(error) });
    }
  }

  const cases = buildStabilityRegister(artifacts);
  const collectionArtifactCount = artifacts.filter((artifact) => artifactKind(artifact.name, artifact.data) === "collection").length;
  const rejudgeArtifactCount = artifacts.filter((artifact) => artifactKind(artifact.name, artifact.data) === "rejudge").length;
  const document = {
    _meta: {
      schemaVersion: STABILITY_SCHEMA_VERSION,
      generatedAt: now.toISOString(),
      resultsDir: resolvedResultsDir,
      formula: STABILITY_FORMULA,
      unstableThreshold: JUDGE_STABILITY_THRESHOLD,
      sourceArtifactCount: sourceArtifacts.length,
      collectionArtifactCount,
      rejudgeArtifactCount,
      skippedArtifacts,
      sourceArtifacts
    },
    ...cases
  };
  writeFileSync(resolvedOutPath, JSON.stringify(document, null, 2) + "\n");
  return {
    outPath: resolvedOutPath,
    caseCount: Object.keys(cases).length,
    sourceArtifactCount: sourceArtifacts.length,
    collectionArtifactCount,
    rejudgeArtifactCount,
    skippedArtifactCount: skippedArtifacts.length
  };
}

function caseEntries(document) {
  return Object.fromEntries(
    Object.entries(document).filter(([id, entry]) =>
      id !== "_meta" &&
      entry &&
      typeof entry === "object" &&
      Number.isInteger(entry.sampleCount) &&
      (entry.stabilityScore === null || Number.isFinite(entry.stabilityScore))
    )
  );
}

/**
 * Load the optional register. Missing, invalid, source-drifted, and expired
 * files return a status and an empty case map. Judging never throws for them.
 */
export function loadJudgeStabilityRegister(
  registerPath = DEFAULT_STABILITY_REGISTER_PATH,
  { resultsDir, nowMs = Date.now(), maxAgeMs = Infinity, verifySources = true } = {}
) {
  const unavailable = (status, reason, identity = {}) => ({
    status,
    reason,
    cases: {},
    sha256: identity.sha256 ?? null,
    generatedAt: identity.generatedAt ?? null,
    sourceArtifactCount: identity.sourceArtifactCount ?? null,
    caseCount: identity.caseCount ?? 0
  });
  let sourceText;
  try {
    sourceText = readFileSync(registerPath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return unavailable("absent", "file-not-found");
    return unavailable("stale", "unreadable-register");
  }
  let document;
  try {
    document = JSON.parse(sourceText);
  } catch {
    return unavailable("stale", "unreadable-register", { sha256: sha256(sourceText) });
  }
  const meta = document?._meta;
  const cases = caseEntries(document);
  const identity = {
    sha256: sha256(sourceText),
    generatedAt: typeof meta?.generatedAt === "string" ? meta.generatedAt : null,
    sourceArtifactCount: Number.isInteger(meta?.sourceArtifactCount)
      ? meta.sourceArtifactCount
      : null,
    caseCount: Object.keys(cases).length
  };
  const generatedAtMs = Date.parse(meta?.generatedAt);
  if (meta?.schemaVersion !== STABILITY_SCHEMA_VERSION) {
    return unavailable("stale", "schema-version", identity);
  }
  if (!Number.isFinite(generatedAtMs)) {
    return unavailable("stale", "invalid-generated-at", identity);
  }
  if (Number.isFinite(maxAgeMs) && nowMs - generatedAtMs > maxAgeMs) {
    return unavailable("stale", "max-age", identity);
  }
  if (verifySources) {
    const sourceDir = path.resolve(resultsDir ?? meta.resultsDir ?? DEFAULT_STABILITY_RESULTS_DIR);
    let currentSignatures;
    try {
      currentSignatures = sourceSignatures(sourceDir);
    } catch {
      return unavailable("stale", "source-unreadable", identity);
    }
    if (!sameSignatures(currentSignatures, meta.sourceArtifacts ?? [])) {
      return unavailable("stale", "source-artifacts-changed", identity);
    }
  }
  return { status: "available", reason: null, cases, meta, ...identity };
}

function parseArgs(argv) {
  let resultsDir = DEFAULT_STABILITY_RESULTS_DIR;
  let outPath = DEFAULT_STABILITY_REGISTER_PATH;
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === "--results-dir") {
      resultsDir = argv[++index];
      if (!resultsDir || resultsDir.startsWith("--")) throw new Error("--results-dir requires a path");
    } else if (arg === "--out") {
      outPath = argv[++index];
      if (!outPath || outPath.startsWith("--")) throw new Error("--out requires a path");
    } else if (arg === "--help" || arg === "-h") {
      return { help: true, resultsDir, outPath };
    } else {
      throw new Error(`unknown flag ${arg}`);
    }
  }
  return { help: false, resultsDir, outPath };
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log("usage: node eval/qa/judge-stability.mjs [--results-dir eval/qa/results] [--out eval/qa/judge-stability.json]");
    return;
  }
  const result = generateStabilityRegister(options);
  console.log(
    `judge-stability: ${result.caseCount} case(s) from ${result.sourceArtifactCount} artifact(s) ` +
    `(${result.collectionArtifactCount} collection, ${result.rejudgeArtifactCount} rejudge, ` +
    `${result.skippedArtifactCount} skipped) -> ${result.outPath}`
  );
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) main();
