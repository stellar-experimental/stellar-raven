#!/usr/bin/env node
/**
 * Offline deterministic referee for the pinned frontier artifact. Calibrates
 * pure lexical counts first, then measures the exact semantic rerank policy on
 * legacy, skills, extended, and mined-query replay lanes.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadManifest, searchCatalog } from "../../src/catalog/search.ts";
import { overlayExpectedAnyById, unionExpectedAny } from "../lib/labels.mjs";
import { MODEL, POLICY, REPO } from "./frontier-config.mjs";
import { rerankSearchPage } from "./retrieval.mjs";
import { resultStamp, writeResult } from "../discovery/lib.mjs";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const ROUTING_CASES = path.join(REPO, "eval", "routing-cases.json");
const SKILLS_CASES = path.join(REPO, "eval", "skills-cases.json");
const OVERLAY = path.join(REPO, "eval", "build-question-overlay.json");
const GATES = path.join(REPO, "eval", "gates.json");
const REPLAY = path.join(REPO, "eval", "discovery", "mined-lumenloop-queries.json");
const CATALOG = loadManifest(JSON.parse(readFileSync(path.join(REPO, "catalog", "manifest.json"), "utf8")));

function counts(cases, hitsById, acceptable = false) {
  const hit = (c, k) => {
    const expected = new Set([
      c.expected_service,
      ...(acceptable ? c.expected_any ?? [] : [])
    ].filter(Boolean));
    return (hitsById.get(c.id) ?? []).slice(0, k).some((row) => expected.has(row.service));
  };
  return {
    n: cases.length,
    top1: cases.filter((c) => hit(c, 1)).length,
    top3: cases.filter((c) => hit(c, 3)).length,
    top5: cases.filter((c) => hit(c, 5)).length
  };
}

function withOverlay(cases, expectedAnyById) {
  return cases.map((c) => ({
    ...c,
    expected_any: unionExpectedAny(c.expected_service, c.expected_any, expectedAnyById.get(c.id))
  }));
}

async function searchCases(cases, mode) {
  const map = new Map();
  for (const [index, c] of cases.entries()) {
    if (mode === "frontier") process.stdout.write(`[${index + 1}/${cases.length}] ${c.id}\r`);
    const hits =
      mode === "lexical"
        ? searchCatalog(CATALOG, { query: c.question, limit: 5 })
        : await rerankSearchPage(searchCatalog, CATALOG, { query: c.question, limit: 5 });
    map.set(c.id, hits);
  }
  if (mode === "frontier") process.stdout.write(" ".repeat(100) + "\r");
  return map;
}

function replaySummary(rows) {
  const metric = (field) => {
    const count = rows.filter((row) => row[field]).length;
    return { count, pct: Number(((100 * count) / rows.length).toFixed(1)) };
  };
  const bucket = (subset) => ({
    n: subset.length,
    familyTop1: (() => {
      const count = subset.filter((row) => row.familyTop1).length;
      return { count, pct: Number(((100 * count) / subset.length).toFixed(1)) };
    })(),
    familyTop5: (() => {
      const count = subset.filter((row) => row.familyTop5).length;
      return { count, pct: Number(((100 * count) / subset.length).toFixed(1)) };
    })(),
    usableOpAt5: (() => {
      const count = subset.filter((row) => row.usableOpAt5).length;
      return { count, pct: Number(((100 * count) / subset.length).toFixed(1)) };
    })()
  });
  const byCase = {};
  for (const id of [...new Set(rows.map((row) => row.caseId))].sort()) {
    byCase[id] = bucket(rows.filter((row) => row.caseId === id));
  }
  return { overall: { n: rows.length, familyTop1: metric("familyTop1"), familyTop5: metric("familyTop5"), usableOpAt5: metric("usableOpAt5") }, byCase };
}

async function runReplay(mode) {
  const replay = JSON.parse(readFileSync(REPLAY, "utf8"));
  const rows = [];
  for (const [index, occurrence] of replay.occurrences.entries()) {
    if (mode === "frontier") process.stdout.write(`[replay ${index + 1}/${replay.occurrences.length}] ${occurrence.id}\r`);
    const hits =
      mode === "lexical"
        ? searchCatalog(CATALOG, { query: occurrence.query, limit: 8 })
        : await rerankSearchPage(searchCatalog, CATALOG, { query: occurrence.query, limit: 8 });
    const gradedHits = hits.slice(0, 5);
    const expected = new Set(occurrence.expectedFamilies);
    const acceptable = new Set(occurrence.acceptableOps);
    rows.push({
      id: occurrence.id,
      caseId: occurrence.caseId,
      register: occurrence.register,
      familyTop1: Boolean(gradedHits[0] && expected.has(gradedHits[0].service)),
      familyTop5: gradedHits.some((hit) => expected.has(hit.service)),
      usableOpAt5: gradedHits.some((hit) => acceptable.has(hit.id)),
      topIds: hits.map((hit) => hit.id)
    });
  }
  if (mode === "frontier") process.stdout.write(" ".repeat(120) + "\r");
  return { summary: replaySummary(rows), rows };
}

function gateVerdict(frontier) {
  const gates = JSON.parse(readFileSync(GATES, "utf8"));
  const legacy = gates.legacy;
  const bandPct = legacy.bandPct;
  const band = Math.round((legacy.n * bandPct) / 100);
  const skillsFloor = gates.skills.minTop1;
  const checks = {
    legacyTop1: Math.abs(frontier.legacy.top1 - legacy.top1) <= band,
    legacyTop3: Math.abs(frontier.legacy.top3 - legacy.top3) <= band,
    legacyTop5: Math.abs(frontier.legacy.top5 - legacy.top5) <= band,
    skillsTop1: frontier.skills.top1 >= skillsFloor,
    extendedAcceptEitherTop5: frontier.extendedAcceptEither.top5 === frontier.extendedAcceptEither.n
  };
  return { pass: Object.values(checks).every(Boolean), checks, baselines: { legacy, bandPct, band, skillsFloor } };
}

export function shouldFailFrontier(triggerCleared) {
  return !triggerCleared;
}

async function main() {
  const compiled = JSON.parse(readFileSync(ROUTING_CASES, "utf8"));
  const skillsData = JSON.parse(readFileSync(SKILLS_CASES, "utf8"));
  const overlay = JSON.parse(readFileSync(OVERLAY, "utf8"));
  const expectedAnyById = overlayExpectedAnyById(
    overlay,
    new Set([...compiled.cases, ...compiled.extendedCases].map((c) => c.id)),
  );
  const legacyCases = withOverlay(compiled.cases, expectedAnyById);
  const extendedCases = withOverlay(compiled.extendedCases, expectedAnyById);
  const skillsCases = skillsData.cases;
  const all = [...legacyCases, ...extendedCases, ...skillsCases];

  const lexicalHits = await searchCases(all, "lexical");
  const frontierHits = await searchCases(all, "frontier");
  const summarize = (hits) => ({
    legacy: counts(legacyCases, hits),
    skills: counts(skillsCases, hits),
    extended: counts(extendedCases, hits),
    extendedAcceptEither: counts(extendedCases, hits, true)
  });
  const lexical = summarize(lexicalHits);
  const frontier = summarize(frontierHits);
  const replayLexical = await runReplay("lexical");
  const replayFrontier = await runReplay("frontier");
  const expectedCalibration = { legacy: { n: 338, top1: 213, top3: 271, top5: 304 }, skills: { n: 23, top1: 18 } };
  const calibrationPass =
    lexical.legacy.n === expectedCalibration.legacy.n &&
    lexical.legacy.top1 === expectedCalibration.legacy.top1 &&
    lexical.legacy.top3 === expectedCalibration.legacy.top3 &&
    lexical.legacy.top5 === expectedCalibration.legacy.top5 &&
    lexical.skills.n === expectedCalibration.skills.n &&
    lexical.skills.top1 === expectedCalibration.skills.top1;
  if (!calibrationPass) throw new Error(`lexical calibration failed: ${JSON.stringify(lexical)}`);

  const triggerDelta = {
    top1Points: Number((replayFrontier.summary.overall.familyTop1.pct - replayLexical.summary.overall.familyTop1.pct).toFixed(1)),
    top5Points: Number((replayFrontier.summary.overall.familyTop5.pct - replayLexical.summary.overall.familyTop5.pct).toFixed(1))
  };
  const gate = gateVerdict(frontier);
  const triggerCleared = (triggerDelta.top1Points >= 5 || triggerDelta.top5Points >= 3) && gate.pass;
  const outPath = path.join(DIR, "results", `${resultStamp("vectorize-frontier")}.json`);
  writeResult(outPath, {
    meta: {
      instrument: "vectorize-frontier-offline",
      model: MODEL,
      policy: POLICY,
      calibrationPass,
      trigger: "+5 percentage points family top1 OR +3 percentage points family top5 on mined replay, with all blocking gates passing"
    },
    routing: { lexical, frontier, gate },
    replay: { lexical: replayLexical.summary, frontier: replayFrontier.summary, triggerDelta, triggerCleared },
    matrices: { lexical: replayLexical.rows, frontier: replayFrontier.rows }
  });
  console.log(JSON.stringify({ outPath, calibrationPass, lexical, frontier, gate, triggerDelta, triggerCleared }, null, 2));
  if (shouldFailFrontier(triggerCleared)) process.exitCode = 1;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  main().catch((error) => {
    console.error(`run-frontier failed: ${error.message}`);
    process.exit(1);
  });
}
