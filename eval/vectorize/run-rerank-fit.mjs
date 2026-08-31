#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { aggregate, cardMatchesExact, gradeCase } from "../lib/grade.mjs";
import { overlayExpectedAnyById, unionExpectedAny } from "../lib/labels.mjs";
import { resultStamp, writeResult } from "../discovery/lib.mjs";
import {
  BATCH_SIZE,
  CLAUSE_ARTIFACT_PATH,
  CLAUSE_ARTIFACT_SHA256,
  CLAUSE_SET_SHA256,
  EXPERIMENT,
  GRID_MARGINS,
  REPO,
  RERANK_MODEL,
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

const require = createRequire(import.meta.url);
const ROUTING_CASES = path.join(REPO, "eval/routing-cases.json");
const SKILLS_CASES = path.join(REPO, "eval/skills-cases.json");
const HOLDOUT_CASES = path.join(REPO, "eval/holdout-cases.json");
const ORIGINAL_CONTRACT = path.join(REPO, "eval/protocol-history-cases.json");
const BLIND_CONTRACT = path.join(REPO, "eval/protocol-history-blind-cases.json");
const OVERLAY = path.join(REPO, "eval/build-question-overlay.json");
const GATES = path.join(REPO, "eval/gates.json");
const INSPECTION_IDS = [
  "q-protocol-24-whisk-incident",
  "q-protocol-version-history-list",
  "q-pc-protocol-upgrade-timing",
  "q-sor-p23-auto-restore-extendto",
  "q-sor-x-ray-bn254-sdk-gap",
  "q-ti-run-tune-own-horizon",
];

const json = (file) => JSON.parse(readFileSync(file, "utf8"));

export function shouldFail(result) {
  return !result.readings?.some((reading) => reading.role === "grid" && reading.acceptance?.pass === true);
}

export function encodeFloat32Scores(scores) {
  const bytes = Buffer.alloc(scores.length * Float32Array.BYTES_PER_ELEMENT);
  scores.forEach((score, index) => bytes.writeFloatLE(score, index * Float32Array.BYTES_PER_ELEMENT));
  return bytes;
}

export function decodeFloat32Scores(base64, count) {
  const bytes = Buffer.from(base64, "base64");
  const expectedBytes = count * Float32Array.BYTES_PER_ELEMENT;
  if (bytes.byteLength !== expectedBytes) throw new Error(`score payload byte length ${bytes.byteLength} != ${expectedBytes}`);
  return Array.from({ length: count }, (_, index) => bytes.readFloatLE(index * Float32Array.BYTES_PER_ELEMENT));
}

export function scoreCacheRecordSha256(cache) {
  return sha256(JSON.stringify({
    queries: cache.queries,
    pairIndex: cache.pairIndex,
    scoresSha256: cache.scoresSha256,
  }));
}

export function createScoreCache({ questions, pairIndex, scores, environment }) {
  const payload = encodeFloat32Scores(scores);
  return {
    schemaVersion: 1,
    experiment: EXPERIMENT,
    model: RERANK_MODEL,
    clauseArtifactSha256: CLAUSE_ARTIFACT_SHA256,
    clauseSetSha256: CLAUSE_SET_SHA256,
    batchSize: BATCH_SIZE,
    queries: questions.map((question) => ({ textSha256: sha256(question) })),
    pairIndex: pairIndex.map((indexes) => indexes.slice()),
    scores: payload.toString("base64"),
    scoresSha256: sha256(payload),
    environment,
  };
}

export function validateScoreCache(cache, { questions = null, pairIndex = null } = {}) {
  if (cache.schemaVersion !== 1 || cache.experiment !== EXPERIMENT) throw new Error("rerank score-cache schema drift");
  if (JSON.stringify(cache.model) !== JSON.stringify(RERANK_MODEL)) throw new Error("rerank score-cache model drift");
  if (cache.clauseArtifactSha256 !== CLAUSE_ARTIFACT_SHA256) throw new Error("rerank score-cache clause artifact drift");
  if (cache.clauseSetSha256 !== CLAUSE_SET_SHA256) throw new Error("rerank score-cache clause-set drift");
  if (cache.batchSize !== BATCH_SIZE) throw new Error("rerank score-cache batch-size drift");
  if (!Array.isArray(cache.queries) || !Array.isArray(cache.pairIndex) || cache.queries.length !== cache.pairIndex.length) {
    throw new Error("rerank score-cache query/pair-index shape drift");
  }
  if (cache.queries.some((row) => Object.keys(row).length !== 1 || !/^[0-9a-f]{64}$/.test(row.textSha256 ?? ""))) {
    throw new Error("rerank score-cache query hash drift");
  }
  const scoreCount = cache.pairIndex.reduce((total, indexes) => {
    if (!Array.isArray(indexes) || indexes.some((index) => !Number.isInteger(index) || index < 0)) {
      throw new Error("rerank score-cache pair index is invalid");
    }
    if (indexes.some((index, offset) => offset > 0 && index <= indexes[offset - 1])) {
      throw new Error("rerank score-cache pair-index order drift");
    }
    return total + indexes.length;
  }, 0);
  const payload = Buffer.from(cache.scores, "base64");
  if (cache.scoresSha256 !== sha256(payload)) throw new Error("rerank score-cache payload hash mismatch");
  const scores = decodeFloat32Scores(cache.scores, scoreCount);
  if (scores.some((score) => !Number.isFinite(score) || score < 0 || score > 1)) {
    throw new Error("rerank score-cache score range drift");
  }
  for (const key of ["node", "onnxruntimeNode", "platform", "probeScoreSha256"]) {
    if (typeof cache.environment?.[key] !== "string" || !cache.environment[key]) {
      throw new Error(`rerank score-cache environment.${key} drift`);
    }
  }
  if (questions) {
    const expectedQueries = questions.map((question) => ({ textSha256: sha256(question) }));
    if (JSON.stringify(cache.queries) !== JSON.stringify(expectedQueries)) throw new Error("rerank score-cache query order drift");
  }
  if (pairIndex && JSON.stringify(cache.pairIndex) !== JSON.stringify(pairIndex)) {
    throw new Error("rerank score-cache pair-index order drift");
  }
  return scores;
}

export function loadRefereeInputs() {
  return {
    compiled: json(ROUTING_CASES),
    skills: json(SKILLS_CASES).cases,
    holdout: json(HOLDOUT_CASES).cases,
    original: json(ORIGINAL_CONTRACT),
    blind: json(BLIND_CONTRACT),
    overlay: json(OVERLAY),
    gates: json(GATES),
  };
}

export function buildRefereeDataset({ compiled, skills, holdout, original, blind }) {
  const comparisonCases = [
    ...compiled.cases.map((row) => ({ ...row, lane: "legacy" })),
    ...compiled.extendedCases.map((row) => ({ ...row, lane: "extended" })),
    ...skills.map((row) => ({ ...row, lane: "skills" })),
    ...original.positiveCases.map((row) => ({ ...row, lane: original.contract })),
    ...original.controlCases.map((row) => ({ ...row, lane: original.contract })),
  ];
  if (comparisonCases.length !== 495) throw new Error(`expected 495 comparison cases, got ${comparisonCases.length}`);
  if (holdout.length !== 49) throw new Error(`expected 49 holdout cases, got ${holdout.length}`);
  const blindRows = [...blind.positiveCases, ...blind.controlCases];
  if (blindRows.length !== 20) throw new Error(`expected 20 blind cases, got ${blindRows.length}`);
  const allRows = [...comparisonCases, ...holdout, ...blindRows];
  const questions = [...new Set(allRows.map((row) => row.question))];
  if (questions.length !== 563) throw new Error(`expected 563 unique referee queries, got ${questions.length}`);
  return { comparisonCases, allRows, questions };
}

export function prepareReadingsFromCache({ cache, questions, pairIndex, bases, clauses }) {
  const scores = validateScoreCache(cache, { questions, pairIndex });
  const prepared = new Map();
  let offset = 0;
  for (let queryIndex = 0; queryIndex < questions.length; queryIndex += 1) {
    const indexes = pairIndex[queryIndex];
    const queryScores = scores.slice(offset, offset + indexes.length);
    offset += indexes.length;
    prepared.set(questions[queryIndex], {
      base: bases[queryIndex],
      fits: entryFitsFromPairScores(clauses, indexes, queryScores),
    });
  }
  if (offset !== scores.length) throw new Error(`unused rerank scores: ${scores.length - offset}`);
  return prepared;
}

function hitsFor(prepared, question, margin) {
  const row = prepared.get(question);
  if (!row) throw new Error(`missing prepared rerank query: ${sha256(question)}`);
  return applyRerankHysteresis(row.base, row.fits, margin).slice(0, 5);
}

function gradeRoutingCases(cases, expectedAnyById, prepared, margin) {
  return cases.map((row) => {
    const hits = hitsFor(prepared, row.question, margin);
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

function gradeHoldout(cases, prepared, margin) {
  return cases.map((row) => {
    const hits = hitsFor(prepared, row.question, margin);
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

function gradeContract(contract, prepared, margin) {
  const rows = [
    ...contract.positiveCases.map((row) => ({ ...row, role: "positive" })),
    ...contract.controlCases.map((row) => ({ ...row, role: "control" })),
  ].map((row) => {
    const hits = hitsFor(prepared, row.question, margin);
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

function readingGate(reading) {
  const failures = [];
  for (const [key, expected] of [["top1", 208], ["top3", 279], ["top5", 311]]) {
    if (Math.abs(reading.legacy[key] - expected) > 3) failures.push(`legacy ${key}=${reading.legacy[key]}`);
  }
  if (reading.skills.top1 < 16) failures.push(`skills top1=${reading.skills.top1}`);
  for (const [key, floor] of [["top1", 10], ["top3", 22], ["top5", 25]]) {
    if (reading.holdout[key] < floor) failures.push(`holdout ${key}=${reading.holdout[key]}`);
  }
  if (reading.holdout.forbiddenCaptures > 11) failures.push(`holdout forbidden=${reading.holdout.forbiddenCaptures}`);
  for (const [key, floor] of [["top1", 90], ["top3", 109], ["top5", 117]]) {
    if (reading.extended.strict[key] < floor) failures.push(`extended ${key}=${reading.extended.strict[key]}`);
  }
  if (reading.extended.acceptEither.top5 !== 122) failures.push(`extended accept top5=${reading.extended.acceptEither.top5}`);
  if (reading.protocolVersionTop1 !== "stellarDocs.search_protocol_concepts_docs") {
    failures.push(`q-protocol-version-history-list top1=${reading.protocolVersionTop1 ?? "none"}`);
  }
  return { pass: failures.length === 0, failures };
}

function acceptance(reading) {
  const gate = readingGate(reading);
  const contractPass = reading.original.top5 === 8
    && reading.original.controlTop5Captures === 0
    && reading.blind.top5 === 11
    && reading.blind.controlTop5Captures === 0;
  return { pass: gate.pass && contractPass, gate, contractPass };
}

export function buildReadings(inputs, dataset, prepared) {
  const known = new Set([...inputs.compiled.cases, ...inputs.compiled.extendedCases].map((row) => row.id));
  const expectedAnyById = overlayExpectedAnyById(inputs.overlay, known);
  const definitions = [
    { name: "identity", role: "identity", margin: Infinity },
    { name: "pure-fit", role: "diagnostic", margin: 0 },
    ...GRID_MARGINS.map((margin) => ({ name: `grid-${margin.toFixed(2)}`, role: "grid", margin })),
  ];
  const readings = [];
  let identityRankings;
  let identityCaptures;
  for (const definition of definitions) {
    const legacyRows = gradeRoutingCases(inputs.compiled.cases, expectedAnyById, prepared, definition.margin);
    const extendedRows = gradeRoutingCases(inputs.compiled.extendedCases, expectedAnyById, prepared, definition.margin);
    const skillsRows = gradeRoutingCases(inputs.skills, new Map(), prepared, definition.margin);
    const holdoutRows = gradeHoldout(inputs.holdout, prepared, definition.margin);
    const comparisonRankings = Object.fromEntries(dataset.comparisonCases.map((row) => [
      row.id,
      hitsFor(prepared, row.question, definition.margin).map((hit) => hit.id),
    ]));
    const captures = dataset.comparisonCases
      .filter((row) => comparisonRankings[row.id].includes("scout.searchResearch"))
      .map((row) => row.id);
    if (definition.role === "identity") {
      identityRankings = comparisonRankings;
      identityCaptures = new Set(captures);
    }
    const changedRankings = Object.entries(comparisonRankings)
      .filter(([id, ranked]) => JSON.stringify(ranked) !== JSON.stringify(identityRankings[id]))
      .map(([id, after]) => ({ id, before: identityRankings[id], after }));
    const holdoutOverall = aggregate(holdoutRows).overall;
    const reading = {
      ...definition,
      original: gradeContract(inputs.original, prepared, definition.margin),
      blind: gradeContract(inputs.blind, prepared, definition.margin),
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
      protocolVersionTop1: comparisonRankings["q-protocol-version-history-list"]?.[0] ?? null,
      changedRankings,
      newTargetCaptures: captures.filter((id) => !identityCaptures.has(id)),
      inspectionCases: INSPECTION_IDS.map((id) => ({ id, hits: comparisonRankings[id]?.join(", ") ?? "missing" })),
      rankings: comparisonRankings,
    };
    reading.routingGate = readingGate(reading);
    reading.acceptance = acceptance(reading);
    readings.push(reading);
  }
  return readings;
}

function assertIdentity(readings, gates) {
  const identity = readings[0];
  const accepted = gates.evidence.acceptedTotals;
  for (const lane of ["legacy", "skills"]) {
    for (const [key, expected] of Object.entries(accepted[lane])) {
      if (identity[lane][key] !== expected) throw new Error(`identity ${lane}.${key}=${identity[lane][key]} != ${expected}`);
    }
  }
  for (const [key, expected] of Object.entries(accepted.holdout)) {
    if (identity.holdout[key] !== expected) throw new Error(`identity holdout.${key}=${identity.holdout[key]} != ${expected}`);
  }
  if (identity.original.top5 !== 4 || identity.original.controlTop5Captures !== 1) {
    throw new Error(`identity original contract drift: ${identity.original.top5}/8, ${identity.original.controlTop5Captures}/4`);
  }
  if (identity.blind.top5 !== 3 || identity.blind.controlTop5Captures !== 6) {
    throw new Error(`identity blind contract drift: ${identity.blind.top5}/11, ${identity.blind.controlTop5Captures}/9`);
  }
}

function assertRunIdentity() {
  const expectedCommit = process.env.RAVEN_RERANK_IMPLEMENTATION_COMMIT;
  if (!/^[0-9a-f]{40}$/.test(expectedCommit ?? "")) {
    throw new Error("RAVEN_RERANK_IMPLEMENTATION_COMMIT must contain the ledger's implementation commit");
  }
  const actualCommit = execFileSync("git", ["rev-parse", "HEAD"], { cwd: REPO, encoding: "utf8" }).trim();
  if (actualCommit !== expectedCommit) throw new Error(`implementation commit drift: ${actualCommit} != ${expectedCommit}`);
  const probeScoreSha256 = process.env.RAVEN_RERANK_PROBE_SCORE_SHA256;
  if (!/^[0-9a-f]{64}$/.test(probeScoreSha256 ?? "")) {
    throw new Error("RAVEN_RERANK_PROBE_SCORE_SHA256 must contain the recorded preflight probe hash");
  }
  return probeScoreSha256;
}

function printReading(reading) {
  console.log(`\n=== ${reading.name} (m=${reading.margin === Infinity ? "Infinity" : reading.margin}) ===`);
  for (const contract of [reading.original, reading.blind]) {
    console.log(`${contract.contract}: ${contract.top1}/${contract.top3}/${contract.top5} of ${contract.positives}; controls ${contract.controlTop5Captures}/${contract.controls}`);
    console.log(`positive misses: ${contract.positiveMisses.join(", ") || "none"}`);
    console.log(`control captures: ${contract.controlCaptures.join(", ") || "none"}`);
  }
  console.table([
    { lane: "legacy", n: reading.legacy.n, top1: reading.legacy.top1, top3: reading.legacy.top3, top5: reading.legacy.top5 },
    { lane: "skills", n: reading.skills.n, top1: reading.skills.top1, top3: reading.skills.top3, top5: reading.skills.top5 },
    { lane: "holdout", n: reading.holdout.n, top1: reading.holdout.top1, top3: reading.holdout.top3, top5: reading.holdout.top5, forbidden: reading.holdout.forbiddenCaptures },
    { lane: "extended", n: reading.extended.strict.n, top1: reading.extended.strict.top1, top3: reading.extended.strict.top3, top5: reading.extended.strict.top5, acceptTop5: reading.extended.acceptEither.top5 },
  ]);
  console.log(`routing gate: ${reading.routingGate.pass ? "PASS" : `FAIL (${reading.routingGate.failures.join("; ")})`}`);
  console.log(`changed rankings: ${reading.changedRankings.length}/495`);
  console.log(JSON.stringify(reading.changedRankings, null, 2));
  console.log("inspection cases:");
  console.table(reading.inspectionCases);
  console.log(`new scout.searchResearch top-five captures: ${reading.newTargetCaptures.join(", ") || "none"}`);
  console.log(`acceptance: ${reading.acceptance.pass ? "PASS" : "FAIL"}`);
}

async function main() {
  const dumpIndex = process.argv.indexOf("--dump-dir");
  if (dumpIndex >= 0 && (!process.argv[dumpIndex + 1] || process.argv[dumpIndex + 1].startsWith("--"))) {
    throw new Error("--dump-dir requires a directory");
  }
  const dumpDir = dumpIndex >= 0 ? path.resolve(process.argv[dumpIndex + 1]) : null;
  const probeScoreSha256 = assertRunIdentity();
  const inputs = loadRefereeInputs();
  const dataset = buildRefereeDataset(inputs);
  const { loadManifest, searchCatalog } = await import(pathToFileURL(path.join(REPO, "src/catalog/search.ts")).href);
  const catalog = loadManifest(json(path.join(REPO, "catalog/manifest.json")));
  const { clauses } = loadRerankClauseArtifact();
  const bases = dataset.questions.map((question) => buildCandidateUnion(searchCatalog, catalog, question));
  const pairIndex = bases.map((base) => pairIndexForBase(base, clauses));
  const pairQueries = [];
  const pairClauses = [];
  for (let queryIndex = 0; queryIndex < dataset.questions.length; queryIndex += 1) {
    for (const clauseIndex of pairIndex[queryIndex]) {
      pairQueries.push(dataset.questions[queryIndex]);
      pairClauses.push(clauses[clauseIndex].text);
    }
  }
  console.log(`scoring ${pairQueries.length} pairs in frozen contiguous batches of ${BATCH_SIZE}`);
  let reported = 0;
  const { scorePairs } = await import("./rerank-scorer.mjs");
  const scores = await scorePairs(pairQueries, pairClauses, {
    batchSize: BATCH_SIZE,
    onProgress: ({ completed, total }) => {
      if (completed === total || completed - reported >= 1_024) {
        reported = completed;
        console.log(`scored ${completed}/${total}`);
      }
    },
  });
  const environment = {
    node: process.version,
    onnxruntimeNode: require("onnxruntime-node/package.json").version,
    platform: process.platform,
    probeScoreSha256,
  };
  const cache = createScoreCache({ questions: dataset.questions, pairIndex, scores, environment });
  const cacheStamp = resultStamp("cross-encoder-pair-scores");
  const cachePath = path.join(RESULTS_DIR, `${cacheStamp}.json`);
  writeResult(cachePath, cache);
  const prepared = prepareReadingsFromCache({ cache, questions: dataset.questions, pairIndex, bases, clauses });
  const readings = buildReadings(inputs, dataset, prepared);
  assertIdentity(readings, inputs.gates);

  if (dumpDir) {
    mkdirSync(dumpDir, { recursive: true });
    for (const reading of readings) writeResult(path.join(dumpDir, `${reading.name}.json`), reading.rankings);
  }
  const passing = readings
    .filter((reading) => reading.role === "grid" && reading.acceptance.pass)
    .sort((left, right) => left.changedRankings.length - right.changedRankings.length || right.margin - left.margin);
  const partial = readings.find((reading) => reading.role === "grid"
    && reading.routingGate.pass
    && reading.original.controlTop5Captures === 0
    && reading.blind.controlTop5Captures === 0);
  const outcome = passing.length ? "PASS" : partial ? "PARTIAL" : "FAIL";
  const selected = passing[0] ?? partial ?? null;
  const stamp = resultStamp(EXPERIMENT);
  const resultPath = path.join(RESULTS_DIR, `${stamp}.json`);
  const result = {
    schemaVersion: 1,
    experiment: EXPERIMENT,
    stamp,
    outcome,
    selected: selected ? { name: selected.name, margin: selected.margin } : null,
    artifact: { path: path.relative(REPO, CLAUSE_ARTIFACT_PATH), sha256: sha256(readFileSync(CLAUSE_ARTIFACT_PATH)) },
    scoreCache: {
      path: path.relative(REPO, cachePath),
      sha256: sha256(readFileSync(cachePath)),
      scoresSha256: cache.scoresSha256,
      recordSha256: scoreCacheRecordSha256(cache),
    },
    environment,
    readings,
  };
  writeResult(resultPath, result);
  for (const reading of readings) printReading(reading);
  console.log(`\nscore cache -> ${cachePath}`);
  console.log(`score cache SHA-256 -> ${result.scoreCache.sha256}`);
  console.log(`score payload SHA-256 -> ${cache.scoresSha256}`);
  console.log(`result -> ${resultPath}`);
  console.log(`outcome -> ${outcome}${selected ? ` (${selected.name}, m=${selected.margin})` : ""}`);
  if (shouldFail(result)) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`run-rerank-fit failed: ${error.stack ?? error.message}`);
    process.exit(1);
  });
}
