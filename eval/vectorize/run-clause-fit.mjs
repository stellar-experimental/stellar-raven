#!/usr/bin/env node
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createRequire } from "node:module";
import { aggregate, cardMatchesExact, gradeCase } from "../lib/grade.mjs";
import { overlayExpectedAnyById, unionExpectedAny } from "../lib/labels.mjs";
import { resultStamp, writeResult } from "../discovery/lib.mjs";
import { embedQueries } from "./embedder.mjs";
import { CLAUSE_ARTIFACT_PATH, MARGINS, MODEL, REPO, applyClauseHysteresis, sha256 } from "./clause-config.mjs";
import { buildCandidateUnion, decodeFloat32Vectors, encodeFloat32Vectors, entryFits, loadClauseArtifact } from "./clause-retrieval.mjs";

const require = createRequire(import.meta.url);
const ROUTING_CASES = path.join(REPO, "eval/routing-cases.json");
const SKILLS_CASES = path.join(REPO, "eval/skills-cases.json");
const HOLDOUT_CASES = path.join(REPO, "eval/holdout-cases.json");
const ORIGINAL_CONTRACT = path.join(REPO, "eval/protocol-history-cases.json");
const BLIND_CONTRACT = path.join(REPO, "eval/protocol-history-blind-cases.json");
const OVERLAY = path.join(REPO, "eval/build-question-overlay.json");
const GATES = path.join(REPO, "eval/gates.json");
const RESULTS_DIR = path.join(REPO, "eval/vectorize/results");
const INSPECTION_IDS = [
  "q-protocol-24-whisk-incident", "q-protocol-version-history-list", "q-pc-protocol-upgrade-timing",
  "q-sor-p23-auto-restore-extendto", "q-sor-x-ray-bn254-sdk-gap", "q-ti-run-tune-own-horizon",
];

export function shouldFail(result) {
  return !result.readings?.some((reading) => reading.role === "grid" && reading.acceptance?.pass === true);
}

const json = (file) => JSON.parse(readFileSync(file, "utf8"));
const hitsFor = (prepared, question, margin) => applyClauseHysteresis(prepared.get(question).base, prepared.get(question).fits, margin).slice(0, 5);

function gradeRoutingCases(cases, expectedAnyById, prepared, margin) {
  return cases.map((row) => {
    const hits = hitsFor(prepared, row.question, margin);
    const expectedAny = unionExpectedAny(row.expected_service, row.expected_any, expectedAnyById.get(row.id));
    return {
      id: row.id, question: row.question, expected_service: row.expected_service,
      ...(expectedAny ? { expected_any: expectedAny } : {}),
      ...gradeCase(hits, row.expected_service, row.expected_cards, expectedAny),
      topHits: hits.map(({ id, service, score, tier }) => ({ id, service, score, tier })),
    };
  });
}

function acceptEither(row) {
  return row.any1 === undefined ? row : {
    expected_service: row.expected_service, top1: row.any1, top3: row.any3, top5: row.any5, cardHit5: row.cardHit5,
  };
}

function gradeHoldout(cases, prepared, margin) {
  return cases.map((row) => {
    const hits = hitsFor(prepared, row.question, margin);
    const expectedIndex = hits.findIndex((hit) => row.expected_cards.some((card) => cardMatchesExact(card, hit)));
    const expectedRank = expectedIndex < 0 ? null : expectedIndex + 1;
    const forbiddenHits = hits.filter((hit) => row.forbidden_cards.some((card) => cardMatchesExact(card, hit))).map((hit) => hit.id);
    return {
      id: row.id, question: row.question, expected_service: row.expected_service, expectedRank,
      top1: expectedRank === 1, top3: expectedRank !== null && expectedRank <= 3,
      top5: expectedRank !== null && expectedRank <= 5, cardHit5: expectedRank !== null && expectedRank <= 5,
      forbiddenCapture: forbiddenHits.length > 0, forbiddenHits,
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
      id: row.id, role: row.role, targetRank: index < 0 ? null : index + 1,
      topHits: hits.map(({ id, service, score, tier }) => ({ id, service, score, tier })),
    };
  });
  const positives = rows.filter((row) => row.role === "positive");
  const controls = rows.filter((row) => row.role === "control");
  return {
    contract: contract.contract, targetOperation: contract.targetOperation, positives: positives.length,
    top1: positives.filter((row) => row.targetRank === 1).length,
    top3: positives.filter((row) => row.targetRank !== null && row.targetRank <= 3).length,
    top5: positives.filter((row) => row.targetRank !== null && row.targetRank <= 5).length,
    controls: controls.length,
    controlTop5Captures: controls.filter((row) => row.targetRank !== null && row.targetRank <= 5).length,
    positiveMisses: positives.filter((row) => row.targetRank === null || row.targetRank > 5).map((row) => row.id),
    controlCaptures: controls.filter((row) => row.targetRank !== null && row.targetRank <= 5).map((row) => row.id), rows,
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
  const contractPass = reading.original.top5 === 8 && reading.original.controlTop5Captures === 0 &&
    reading.blind.top5 === 11 && reading.blind.controlTop5Captures === 0;
  return { pass: gate.pass && contractPass, gate, contractPass };
}

function printReading(reading) {
  console.log(`\n=== ${reading.name} (m=${reading.margin === Infinity ? "Infinity" : reading.margin}) ===`);
  for (const contract of [reading.original, reading.blind]) {
    console.log(`${contract.contract}: ${contract.top1}/${contract.top3}/${contract.top5} of ${contract.positives}; controls ${contract.controlTop5Captures}/${contract.controls}`);
    console.log(`positive misses: ${contract.positiveMisses.join(", ") || "none"}`);
    console.log(`control captures: ${contract.controlCaptures.join(", ") || "none"}`);
    console.table(contract.rows.map((row) => ({ id: row.id, role: row.role, targetRank: row.targetRank ?? "miss", top1: row.topHits[0]?.id ?? "none" })));
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
  if (dumpIndex >= 0 && (!process.argv[dumpIndex + 1] || process.argv[dumpIndex + 1].startsWith("--"))) throw new Error("--dump-dir requires a directory");
  const dumpDir = dumpIndex >= 0 ? path.resolve(process.argv[dumpIndex + 1]) : null;
  const { loadManifest, searchCatalog } = await import(pathToFileURL(path.join(REPO, "src/catalog/search.ts")).href);
  const compiled = json(ROUTING_CASES);
  const skills = json(SKILLS_CASES).cases;
  const holdout = json(HOLDOUT_CASES).cases;
  const original = json(ORIGINAL_CONTRACT);
  const blind = json(BLIND_CONTRACT);
  const gates = json(GATES);
  const catalog = loadManifest(json(path.join(REPO, "catalog/manifest.json")));
  const known = new Set([...compiled.cases, ...compiled.extendedCases].map((row) => row.id));
  const expectedAnyById = overlayExpectedAnyById(json(OVERLAY), known);
  const comparisonCases = [
    ...compiled.cases.map((row) => ({ ...row, lane: "legacy" })),
    ...compiled.extendedCases.map((row) => ({ ...row, lane: "extended" })),
    ...skills.map((row) => ({ ...row, lane: "skills" })),
    ...original.positiveCases.map((row) => ({ ...row, lane: original.contract })),
    ...original.controlCases.map((row) => ({ ...row, lane: original.contract })),
  ];
  if (comparisonCases.length !== 495) throw new Error(`expected 495 comparison cases, got ${comparisonCases.length}`);
  const allRows = [...comparisonCases, ...holdout, ...blind.positiveCases, ...blind.controlCases];
  const questions = [...new Set(allRows.map((row) => row.question))];

  const artifactData = loadClauseArtifact();
  console.log(`embedding ${questions.length} unique referee queries once`);
  const encodedQueries = encodeFloat32Vectors(await embedQueries(questions));
  const queryVectors = decodeFloat32Vectors(encodedQueries, questions.length);
  const queryVectorHash = sha256(Buffer.from(encodedQueries, "base64"));
  const onnxruntimeVersion = require("onnxruntime-node/package.json").version;
  const cacheStamp = resultStamp("clause-fit-query-vectors");
  const queryCachePath = path.join(RESULTS_DIR, `${cacheStamp}.json`);
  writeResult(queryCachePath, {
    schemaVersion: 1, experiment: "clause-fit-hysteresis-v1", model: MODEL,
    questions: questions.map((question) => ({ question, sha256: sha256(question) })),
    encoding: { type: "float32-base64", byteOrder: "little-endian", dimensions: MODEL.dimensions },
    vectors: encodedQueries, vectorsSha256: queryVectorHash,
    environment: { node: process.version, onnxruntimeNode: onnxruntimeVersion, platform: process.platform },
  });
  const queryCacheFileHash = sha256(readFileSync(queryCachePath));
  const prepared = new Map();
  for (let index = 0; index < questions.length; index += 1) {
    const question = questions[index];
    prepared.set(question, {
      base: buildCandidateUnion(searchCatalog, catalog, question),
      fits: entryFits(queryVectors[index], artifactData.clauses, artifactData.vectors),
    });
  }

  const definitions = [
    { name: "identity", role: "identity", margin: Infinity },
    { name: "pure-fit", role: "diagnostic", margin: 0 },
    ...MARGINS.slice(1).map((margin) => ({ name: `grid-${margin.toFixed(2)}`, role: "grid", margin })),
  ];
  const readings = [];
  let identityRankings;
  let identityCaptures;
  for (const definition of definitions) {
    const legacyRows = gradeRoutingCases(compiled.cases, expectedAnyById, prepared, definition.margin);
    const extendedRows = gradeRoutingCases(compiled.extendedCases, expectedAnyById, prepared, definition.margin);
    const skillsRows = gradeRoutingCases(skills, new Map(), prepared, definition.margin);
    const holdoutRows = gradeHoldout(holdout, prepared, definition.margin);
    const comparisonRankings = Object.fromEntries(comparisonCases.map((row) => [row.id, hitsFor(prepared, row.question, definition.margin).map((hit) => hit.id)]));
    const captures = comparisonCases.filter((row) => comparisonRankings[row.id].includes("scout.searchResearch")).map((row) => row.id);
    if (definition.role === "identity") { identityRankings = comparisonRankings; identityCaptures = new Set(captures); }
    const changedRankings = Object.entries(comparisonRankings)
      .filter(([id, ranked]) => JSON.stringify(ranked) !== JSON.stringify(identityRankings[id]))
      .map(([id, after]) => ({ id, before: identityRankings[id], after }));
    const holdoutOverall = aggregate(holdoutRows).overall;
    const reading = {
      ...definition,
      original: gradeContract(original, prepared, definition.margin), blind: gradeContract(blind, prepared, definition.margin),
      legacy: aggregate(legacyRows).overall, skills: aggregate(skillsRows).overall,
      holdout: {
        ...holdoutOverall,
        forbiddenCaptures: holdoutRows.filter((row) => row.forbiddenCapture).length,
        passed: holdoutRows.filter((row) => row.top5 && !row.forbiddenCapture).length,
      },
      extended: { strict: aggregate(extendedRows).overall, acceptEither: aggregate(extendedRows.map(acceptEither)).overall },
      protocolVersionTop1: comparisonRankings["q-protocol-version-history-list"]?.[0] ?? null,
      changedRankings, newTargetCaptures: captures.filter((id) => !identityCaptures.has(id)),
      inspectionCases: INSPECTION_IDS.map((id) => ({ id, hits: comparisonRankings[id]?.join(", ") ?? "missing" })), rankings: comparisonRankings,
    };
    reading.routingGate = readingGate(reading);
    reading.acceptance = acceptance(reading);
    readings.push(reading);
    if (dumpDir) { mkdirSync(dumpDir, { recursive: true }); writeResult(path.join(dumpDir, `${definition.name}.json`), comparisonRankings); }
  }

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
  if (identity.original.top5 !== 4 || identity.original.controlTop5Captures !== 1) throw new Error(`identity original contract drift: ${identity.original.top5}/8, ${identity.original.controlTop5Captures}/4`);
  if (identity.blind.top5 !== 3 || identity.blind.controlTop5Captures !== 6) throw new Error(`identity blind contract drift: ${identity.blind.top5}/11, ${identity.blind.controlTop5Captures}/9`);

  const passing = readings.filter((reading) => reading.role === "grid" && reading.acceptance.pass)
    .sort((left, right) => left.changedRankings.length - right.changedRankings.length || right.margin - left.margin);
  const partial = readings.find((reading) => reading.role === "grid" && reading.routingGate.pass && reading.original.controlTop5Captures === 0 && reading.blind.controlTop5Captures === 0);
  const outcome = passing.length ? "PASS" : partial ? "PARTIAL" : "FAIL";
  const selected = passing[0] ?? partial ?? null;
  const stamp = resultStamp("clause-fit-hysteresis-v1");
  const resultPath = path.join(RESULTS_DIR, `${stamp}.json`);
  const result = {
    schemaVersion: 1, experiment: "clause-fit-hysteresis-v1", stamp, outcome,
    selected: selected ? { name: selected.name, margin: selected.margin } : null,
    artifact: { path: path.relative(REPO, CLAUSE_ARTIFACT_PATH), sha256: sha256(readFileSync(CLAUSE_ARTIFACT_PATH)) },
    queryCache: { path: path.relative(REPO, queryCachePath), sha256: queryCacheFileHash, vectorsSha256: queryVectorHash },
    environment: { node: process.version, onnxruntimeNode: onnxruntimeVersion, platform: process.platform }, readings,
  };
  writeResult(resultPath, result);
  for (const reading of readings) printReading(reading);
  console.log(`\nquery cache -> ${queryCachePath}`);
  console.log(`query cache SHA-256 -> ${queryCacheFileHash}`);
  console.log(`result -> ${resultPath}`);
  console.log(`outcome -> ${outcome}${selected ? ` (${selected.name}, m=${selected.margin})` : ""}`);
  if (shouldFail(result)) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(`run-clause-fit failed: ${error.stack ?? error.message}`); process.exit(1); });
}
