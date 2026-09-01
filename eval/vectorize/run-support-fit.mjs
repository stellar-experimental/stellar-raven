#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { aggregate, cardMatchesExact, gradeCase } from "../lib/grade.mjs";
import { overlayExpectedAnyById, unionExpectedAny } from "../lib/labels.mjs";
import { resultStamp, writeResult } from "../discovery/lib.mjs";
import {
  CLAUSE_ARTIFACT_PATH,
  REPO,
  RESULTS_DIR,
  sha256,
} from "./rerank-config.mjs";
import {
  applyRerankHysteresis,
  buildCandidateUnion,
  entryFitsFromPairScores,
  loadRerankClauseArtifact,
  pairIndexForBase,
} from "./rerank-retrieval.mjs";
import {
  buildRefereeDataset,
  decodeFloat32Scores,
  loadRefereeInputs,
  scoreCacheRecordSha256,
  validateScoreCache,
} from "./run-rerank-fit.mjs";

export const SUPPORT_EXPERIMENT = "clause-support-fit-v1";
export const RETAINED_CACHE_PINS = Object.freeze({
  fileSha256: "fa1252fc8bfbf62b6f69bb8ca431cf603d2b512e4d0299b2ca0de0d7c2cec0bc",
  scoresSha256: "44c274680cd324d00aa16d240e21d3260005766d507a430e93c423e9c16fcd55",
  recordSha256: "ecea4c6981eb22a59d59b4b9434cad57732309e28504574e7ed483a01512fca1",
  queries: 563,
  scores: 383_273,
});

const INSPECTION_IDS = [
  "q-protocol-24-whisk-incident",
  "q-protocol-version-history-list",
  "q-pc-protocol-upgrade-timing",
  "q-sor-p23-auto-restore-extendto",
  "q-sor-x-ray-bn254-sdk-gap",
  "q-ti-run-tune-own-horizon",
];

const MAX_CLAUSE_EXPECTED = Object.freeze({
  original: Object.freeze({
    top1: 3,
    top3: 4,
    top5: 5,
    controlTop5Captures: 2,
    positiveMisses: Object.freeze([
      "ph-protocol-24-archival-root-cause",
      "ph-protocol-corrective-upgrade-history",
      "ph-protocol-upgrade-chronology",
    ]),
    controlCaptures: Object.freeze([
      "ph-control-current-protocol",
      "ph-control-validator-vote",
    ]),
  }),
  blind: Object.freeze({
    top1: 2,
    top3: 2,
    top5: 3,
    controlTop5Captures: 4,
    positiveMisses: Object.freeze([
      "phb-whisk-forced-follow-up",
      "phb-archival-defect-network-upgrade",
      "phb-auth-recursion-auditors",
      "phb-core-upgrades-dates-features",
      "phb-network-upgrades-reasons",
      "phb-second-cut-after-whisk",
      "phb-cap-archival-fee-repair",
      "phb-clawback-origin-emergency-changes",
    ]),
    controlCaptures: Object.freeze([
      "phb-control-incident-runbook",
      "phb-control-sdk-version-history",
      "phb-control-kyc-breach-report",
      "phb-control-failed-deploy-post-mortem",
    ]),
  }),
  changedRankings: 495,
  routingGatePass: false,
});

export function noisyOr(scores) {
  if (!scores.length) return 0;
  if (scores.length === 1) return scores[0];
  let logProduct = 0;
  for (const score of scores) {
    if (!Number.isFinite(score) || score < 0 || score > 1) {
      throw new RangeError(`noisy-OR score must be in [0, 1], got ${score}`);
    }
    if (score === 1) return 1;
    logProduct += Math.log1p(-score);
  }
  return -Math.expm1(logProduct);
}

export function supportFit(positiveScores, negativeScores = []) {
  if (!positiveScores.length) return Number.NEGATIVE_INFINITY;
  const pos = noisyOr(positiveScores);
  const neg = noisyOr(negativeScores);
  return pos - Math.max(0, neg - pos);
}

export function entrySupportFits(clauses, pairIndex, scores) {
  if (pairIndex.length !== scores.length) {
    throw new Error(`pair-index/score count mismatch: ${pairIndex.length} != ${scores.length}`);
  }
  const buckets = new Map();
  for (let offset = 0; offset < pairIndex.length; offset += 1) {
    const clauseIndex = pairIndex[offset];
    const clause = clauses[clauseIndex];
    if (!clause) throw new Error(`pair index ${clauseIndex} is outside the clause set`);
    let bucket = buckets.get(clause.entryId);
    if (!bucket) {
      bucket = { positive: [], negative: [] };
      buckets.set(clause.entryId, bucket);
    }
    bucket[clause.role].push(scores[offset]);
  }
  return new Map(
    [...buckets].map(([entryId, bucket]) => [entryId, supportFit(bucket.positive, bucket.negative)]),
  );
}

export function stableSortByFit(base, fits) {
  return base
    .map((entry, index) => ({ entry, index, fit: fits.get(entry.id) ?? Number.NEGATIVE_INFINITY }))
    .sort((left, right) => {
      if (left.fit > right.fit) return -1;
      if (left.fit < right.fit) return 1;
      return left.index - right.index;
    })
    .map(({ entry }) => entry);
}

export function assertRetainedCachePins({ cache, fileSha256, scoreCount }) {
  if (fileSha256 !== RETAINED_CACHE_PINS.fileSha256) {
    throw new Error(`retained cache file SHA-256 drift: ${fileSha256}`);
  }
  if (cache.scoresSha256 !== RETAINED_CACHE_PINS.scoresSha256) {
    throw new Error(`retained cache scoresSha256 drift: ${cache.scoresSha256}`);
  }
  const recordSha256 = scoreCacheRecordSha256(cache);
  if (recordSha256 !== RETAINED_CACHE_PINS.recordSha256) {
    throw new Error(`retained cache record SHA-256 drift: ${recordSha256}`);
  }
  if (cache.queries?.length !== RETAINED_CACHE_PINS.queries) {
    throw new Error(`retained cache query count drift: ${cache.queries?.length}`);
  }
  if (scoreCount !== RETAINED_CACHE_PINS.scores) {
    throw new Error(`retained cache score count drift: ${scoreCount}`);
  }
}

export function prepareSupportReadingsFromCache({ cache, questions, pairIndex, bases, clauses }) {
  const scores = validateScoreCache(cache, { questions, pairIndex });
  const prepared = new Map();
  let offset = 0;
  for (let queryIndex = 0; queryIndex < questions.length; queryIndex += 1) {
    const indexes = pairIndex[queryIndex];
    const queryScores = scores.slice(offset, offset + indexes.length);
    offset += indexes.length;
    prepared.set(questions[queryIndex], {
      base: bases[queryIndex],
      maxClauseFits: entryFitsFromPairScores(clauses, indexes, queryScores),
      supportFits: entrySupportFits(clauses, indexes, queryScores),
    });
  }
  if (offset !== scores.length) throw new Error(`unused retained scores: ${scores.length - offset}`);
  return prepared;
}

function hitsFor(prepared, question, readingName) {
  const row = prepared.get(question);
  if (!row) throw new Error(`missing prepared support query: ${sha256(question)}`);
  if (readingName === "identity") return row.base.slice(0, 5);
  if (readingName === "max-clause") return stableSortByFit(row.base, row.maxClauseFits).slice(0, 5);
  if (readingName === "support-fit") return stableSortByFit(row.base, row.supportFits).slice(0, 5);
  throw new Error(`unknown support reading ${readingName}`);
}

function gradeRoutingCases(cases, expectedAnyById, prepared, readingName) {
  return cases.map((row) => {
    const hits = hitsFor(prepared, row.question, readingName);
    const expectedAny = unionExpectedAny(row.expected_service, row.expected_any, expectedAnyById.get(row.id));
    return {
      id: row.id,
      question: row.question,
      expected_service: row.expected_service,
      ...(expectedAny ? { expected_any: expectedAny } : {}),
      ...gradeCase(hits, row.expected_service, row.expected_cards, expectedAny),
      topHits: hits.map(({ id, service, score, tier }) => ({ id, service, score, tier })),
    };
  });
}

function acceptEither(row) {
  return row.any1 === undefined ? row : {
    expected_service: row.expected_service,
    top1: row.any1,
    top3: row.any3,
    top5: row.any5,
    cardHit5: row.cardHit5,
  };
}

function gradeHoldout(cases, prepared, readingName) {
  return cases.map((row) => {
    const hits = hitsFor(prepared, row.question, readingName);
    const expectedIndex = hits.findIndex((hit) => row.expected_cards.some((card) => cardMatchesExact(card, hit)));
    const expectedRank = expectedIndex < 0 ? null : expectedIndex + 1;
    const forbiddenHits = hits
      .filter((hit) => row.forbidden_cards.some((card) => cardMatchesExact(card, hit)))
      .map((hit) => hit.id);
    return {
      id: row.id,
      question: row.question,
      expected_service: row.expected_service,
      expectedRank,
      top1: expectedRank === 1,
      top3: expectedRank !== null && expectedRank <= 3,
      top5: expectedRank !== null && expectedRank <= 5,
      cardHit5: expectedRank !== null && expectedRank <= 5,
      forbiddenCapture: forbiddenHits.length > 0,
      forbiddenHits,
      topHits: hits.map(({ id, service, score, tier }) => ({ id, service, score, tier })),
    };
  });
}

function gradeContract(contract, prepared, readingName) {
  const rows = [
    ...contract.positiveCases.map((row) => ({ ...row, role: "positive" })),
    ...contract.controlCases.map((row) => ({ ...row, role: "control" })),
  ].map((row) => {
    const hits = hitsFor(prepared, row.question, readingName);
    const index = hits.findIndex((hit) => hit.id === contract.targetOperation);
    return {
      id: row.id,
      role: row.role,
      targetRank: index < 0 ? null : index + 1,
      topHits: hits.map(({ id, service, score, tier }) => ({ id, service, score, tier })),
    };
  });
  const positives = rows.filter((row) => row.role === "positive");
  const controls = rows.filter((row) => row.role === "control");
  return {
    contract: contract.contract,
    targetOperation: contract.targetOperation,
    positives: positives.length,
    top1: positives.filter((row) => row.targetRank === 1).length,
    top3: positives.filter((row) => row.targetRank !== null && row.targetRank <= 3).length,
    top5: positives.filter((row) => row.targetRank !== null && row.targetRank <= 5).length,
    controls: controls.length,
    controlTop5Captures: controls.filter((row) => row.targetRank !== null && row.targetRank <= 5).length,
    positiveMisses: positives.filter((row) => row.targetRank === null || row.targetRank > 5).map((row) => row.id),
    controlCaptures: controls.filter((row) => row.targetRank !== null && row.targetRank <= 5).map((row) => row.id),
    rows,
  };
}

export function readingGate(reading) {
  const failures = [];
  for (const [key, expected] of [["top1", 208], ["top3", 279], ["top5", 311]]) {
    if (Math.abs(reading.legacy[key] - expected) > 3) failures.push(`legacy ${key}=${reading.legacy[key]}`);
  }
  if (reading.skills.top1 < 16) failures.push(`skills top1=${reading.skills.top1}`);
  for (const [key, floor] of [["top1", 10], ["top3", 22], ["top5", 25]]) {
    if (reading.holdout[key] < floor) failures.push(`holdout ${key}=${reading.holdout[key]}`);
  }
  if (reading.holdout.forbiddenCaptures > 11) {
    failures.push(`holdout forbidden=${reading.holdout.forbiddenCaptures}`);
  }
  for (const [key, floor] of [["top1", 90], ["top3", 109], ["top5", 117]]) {
    if (reading.extended.strict[key] < floor) failures.push(`extended ${key}=${reading.extended.strict[key]}`);
  }
  if (reading.extended.acceptEither.top5 !== 122) {
    failures.push(`extended accept top5=${reading.extended.acceptEither.top5}`);
  }
  if (reading.protocolVersionTop1 !== "stellarDocs.search_protocol_concepts_docs") {
    failures.push(`q-protocol-version-history-list top1=${reading.protocolVersionTop1 ?? "none"}`);
  }
  return { pass: failures.length === 0, failures };
}

export function acceptance(reading) {
  const gate = readingGate(reading);
  const contractPass = reading.original.top5 === 8
    && reading.original.controlTop5Captures === 0
    && reading.blind.top5 === 11
    && reading.blind.controlTop5Captures === 0;
  return { pass: gate.pass && contractPass, gate, contractPass };
}

function buildReading({ name, role }, inputs, dataset, prepared, identityRankings, identityCaptures) {
  const known = new Set([...inputs.compiled.cases, ...inputs.compiled.extendedCases].map((row) => row.id));
  const expectedAnyById = overlayExpectedAnyById(inputs.overlay, known);
  const legacyRows = gradeRoutingCases(inputs.compiled.cases, expectedAnyById, prepared, name);
  const extendedRows = gradeRoutingCases(inputs.compiled.extendedCases, expectedAnyById, prepared, name);
  const skillsRows = gradeRoutingCases(inputs.skills, new Map(), prepared, name);
  const holdoutRows = gradeHoldout(inputs.holdout, prepared, name);
  const rankings = Object.fromEntries(dataset.comparisonCases.map((row) => [
    row.id,
    hitsFor(prepared, row.question, name).map((hit) => hit.id),
  ]));
  const captures = dataset.comparisonCases
    .filter((row) => rankings[row.id].includes("scout.searchResearch"))
    .map((row) => row.id);
  const baselineRankings = identityRankings ?? rankings;
  const baselineCaptures = identityCaptures ?? new Set(captures);
  const changedRankings = Object.entries(rankings)
    .filter(([id, ranked]) => JSON.stringify(ranked) !== JSON.stringify(baselineRankings[id]))
    .map(([id, after]) => ({ id, before: baselineRankings[id], after }));
  const holdoutOverall = aggregate(holdoutRows).overall;
  const reading = {
    name,
    role,
    original: gradeContract(inputs.original, prepared, name),
    blind: gradeContract(inputs.blind, prepared, name),
    legacy: aggregate(legacyRows).overall,
    skills: aggregate(skillsRows).overall,
    holdout: {
      ...holdoutOverall,
      forbiddenCaptures: holdoutRows.filter((row) => row.forbiddenCapture).length,
      passed: holdoutRows.filter((row) => row.top5 && !row.forbiddenCapture).length,
    },
    extended: {
      strict: aggregate(extendedRows).overall,
      acceptEither: aggregate(extendedRows.map(acceptEither)).overall,
    },
    protocolVersionTop1: rankings["q-protocol-version-history-list"]?.[0] ?? null,
    changedRankings,
    newTargetCaptures: captures.filter((id) => !baselineCaptures.has(id)),
    inspectionCases: INSPECTION_IDS.map((id) => ({ id, topHits: rankings[id] ?? [] })),
    rankings,
  };
  reading.routingGate = readingGate(reading);
  reading.acceptance = acceptance(reading);
  return reading;
}

function assertField(actual, expected, label) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${label}=${JSON.stringify(actual)} != ${JSON.stringify(expected)}`);
  }
}

export function assertIdentityCalibration(identity, gates) {
  const accepted = gates.evidence.acceptedTotals;
  for (const lane of ["legacy", "skills", "holdout"]) {
    for (const [key, expected] of Object.entries(accepted[lane])) {
      assertField(identity[lane][key], expected, `identity ${lane}.${key}`);
    }
  }
  assertField(identity.original.top5, 4, "identity original.top5");
  assertField(identity.original.controlTop5Captures, 1, "identity original.controlTop5Captures");
  assertField(identity.blind.top5, 3, "identity blind.top5");
  assertField(identity.blind.controlTop5Captures, 6, "identity blind.controlTop5Captures");
  assertField(identity.changedRankings.length, 0, "identity changedRankings.length");
}

export function assertMaxClauseCalibration(reading) {
  for (const contract of ["original", "blind"]) {
    for (const [key, expected] of Object.entries(MAX_CLAUSE_EXPECTED[contract])) {
      assertField(reading[contract][key], expected, `max-clause ${contract}.${key}`);
    }
  }
  assertField(reading.changedRankings.length, MAX_CLAUSE_EXPECTED.changedRankings, "max-clause changedRankings.length");
  assertField(reading.routingGate.pass, MAX_CLAUSE_EXPECTED.routingGatePass, "max-clause routingGate.pass");
}

export function buildReadings(inputs, dataset, prepared) {
  const identity = buildReading({ name: "identity", role: "calibration" }, inputs, dataset, prepared);
  assertIdentityCalibration(identity, inputs.gates);
  const identityCaptures = new Set(dataset.comparisonCases
    .filter((row) => identity.rankings[row.id].includes("scout.searchResearch"))
    .map((row) => row.id));
  const maxClause = buildReading(
    { name: "max-clause", role: "calibration" },
    inputs,
    dataset,
    prepared,
    identity.rankings,
    identityCaptures,
  );
  assertMaxClauseCalibration(maxClause);
  const support = buildReading(
    { name: "support-fit", role: "candidate" },
    inputs,
    dataset,
    prepared,
    identity.rankings,
    identityCaptures,
  );
  return [identity, maxClause, support];
}

export function shouldFail(result) {
  const support = result.readings?.find((reading) => reading.name === "support-fit");
  return !support || acceptance(support).pass !== true;
}

export function outcomeFor(support) {
  if (support.acceptance.pass) return "PASS";
  if (
    support.routingGate.pass
    && support.original.controlTop5Captures === 0
    && support.blind.controlTop5Captures === 0
  ) return "PARTIAL";
  return "FAIL";
}

function assertRunIdentity() {
  const expectedCommit = process.env.RAVEN_SUPPORT_IMPLEMENTATION_COMMIT;
  if (!/^[0-9a-f]{40}$/.test(expectedCommit ?? "")) {
    throw new Error("RAVEN_SUPPORT_IMPLEMENTATION_COMMIT must contain the reviewed implementation commit");
  }
  const actualCommit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: REPO, encoding: "utf8" }).trim();
  if (actualCommit !== expectedCommit) throw new Error(`implementation commit drift: ${actualCommit} != ${expectedCommit}`);
  return actualCommit;
}

function printReading(reading) {
  console.log(`\n=== ${reading.name} ===`);
  for (const contract of [reading.original, reading.blind]) {
    console.log(`${contract.contract}: ${contract.top1}/${contract.top3}/${contract.top5} of ${contract.positives}; controls ${contract.controlTop5Captures}/${contract.controls}`);
    console.log(`positive misses: ${contract.positiveMisses.join(", ") || "none"}`);
    console.log(`control captures: ${contract.controlCaptures.join(", ") || "none"}`);
  }
  console.table([
    { lane: "legacy", ...reading.legacy },
    { lane: "skills", ...reading.skills },
    { lane: "holdout", ...reading.holdout },
    { lane: "extended", ...reading.extended.strict, acceptTop5: reading.extended.acceptEither.top5 },
  ]);
  console.log(`routing gate: ${reading.routingGate.pass ? "PASS" : `FAIL (${reading.routingGate.failures.join("; ")})`}`);
  console.log(`changed rankings: ${reading.changedRankings.length}/495`);
  console.log(JSON.stringify(reading.changedRankings, null, 2));
  console.log("inspection cases:");
  console.table(reading.inspectionCases.map((row) => ({ id: row.id, hits: row.topHits.join(", ") })));
  console.log(`new scout.searchResearch top-five captures: ${reading.newTargetCaptures.join(", ") || "none"}`);
  console.log(`acceptance: ${reading.acceptance.pass ? "PASS" : "FAIL"}`);
}

async function main() {
  const dumpIndex = process.argv.indexOf("--dump-dir");
  if (dumpIndex >= 0 && (!process.argv[dumpIndex + 1] || process.argv[dumpIndex + 1].startsWith("--"))) {
    throw new Error("--dump-dir requires a directory");
  }
  const dumpDir = dumpIndex >= 0 ? path.resolve(process.argv[dumpIndex + 1]) : null;
  const implementationCommit = assertRunIdentity();
  const inputs = loadRefereeInputs();
  const dataset = buildRefereeDataset(inputs);
  const { loadManifest, searchCatalog } = await import(pathToFileURL(path.join(REPO, "src/catalog/search.ts")).href);
  const catalog = loadManifest(JSON.parse(readFileSync(path.join(REPO, "catalog/manifest.json"), "utf8")));
  const { artifact, clauses } = loadRerankClauseArtifact();
  const bases = dataset.questions.map((question) => buildCandidateUnion(searchCatalog, catalog, question));
  const pairIndex = bases.map((base) => pairIndexForBase(base, clauses));

  const cachePathValue = process.env.RAVEN_SUPPORT_CACHE_PATH;
  if (!cachePathValue) throw new Error("RAVEN_SUPPORT_CACHE_PATH must name the retained attempt-two cache");
  const cachePath = path.resolve(cachePathValue);
  const cacheBytes = readFileSync(cachePath);
  const fileSha256 = sha256(cacheBytes);
  if (fileSha256 !== RETAINED_CACHE_PINS.fileSha256) {
    throw new Error(`retained cache file SHA-256 drift: ${fileSha256}`);
  }
  const cache = JSON.parse(cacheBytes);
  const scores = validateScoreCache(cache, { questions: dataset.questions, pairIndex });
  const decodedScores = decodeFloat32Scores(cache.scores, scores.length);
  assertRetainedCachePins({ cache, fileSha256, scoreCount: decodedScores.length });

  const prepared = prepareSupportReadingsFromCache({
    cache,
    questions: dataset.questions,
    pairIndex,
    bases,
    clauses,
  });
  const readings = buildReadings(inputs, dataset, prepared);
  const support = readings.find((reading) => reading.name === "support-fit");
  const outcome = outcomeFor(support);
  const stamp = resultStamp(SUPPORT_EXPERIMENT);
  const resultPath = path.join(RESULTS_DIR, `${stamp}.json`);
  const result = {
    schemaVersion: 1,
    experiment: "clause-support-fit-v1",
    stamp,
    outcome,
    aggregate: {
      positive: "noisy-or",
      negative: "noisy-or",
      fit: "pos - max(0, neg - pos)",
      ordering: "stable-sort-desc",
      ties: "base-order",
    },
    source: {
      experiment: "cross-encoder-fit-v1",
      cachePath,
      cacheSha256: fileSha256,
      scoresSha256: cache.scoresSha256,
      recordSha256: scoreCacheRecordSha256(cache),
      queries: RETAINED_CACHE_PINS.queries,
      scores: RETAINED_CACHE_PINS.scores,
    },
    artifact: {
      path: path.relative(REPO, CLAUSE_ARTIFACT_PATH),
      sha256: sha256(readFileSync(CLAUSE_ARTIFACT_PATH)),
    },
    implementationCommit,
    readings,
    calibration: { identity: "PASS", maxClause: "PASS" },
    environment: { node: process.version, platform: process.platform },
    sourceEnvironment: cache.environment,
  };
  writeResult(resultPath, result);
  if (dumpDir) {
    mkdirSync(dumpDir, { recursive: true });
    for (const reading of readings) writeResult(path.join(dumpDir, `${reading.name}.json`), reading.rankings);
  }
  for (const reading of readings) printReading(reading);
  console.log(`\nresult -> ${resultPath}`);
  console.log(`outcome -> ${outcome}`);
  if (shouldFail(result)) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`run-support-fit failed: ${error.stack ?? error.message}`);
    process.exit(1);
  });
}
