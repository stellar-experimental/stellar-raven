#!/usr/bin/env node
/**
 * Grade the frozen protocol-history sets without merging them into routing lanes.
 * Positive cases require scout.searchResearch in the top five. Controls forbid it.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadManifest, searchCatalog } from "../src/catalog/search.ts";

const EVAL_DIR = dirname(fileURLToPath(import.meta.url));
const RESULTS_DIR = join(EVAL_DIR, "results");
const TARGET = "scout.searchResearch";
const inputs = [
  join(EVAL_DIR, "protocol-history-cases.json"),
  join(EVAL_DIR, "protocol-history-blind-cases.json")
];

const catalog = loadManifest(
  JSON.parse(readFileSync(join(EVAL_DIR, "..", "catalog", "manifest.json"), "utf8"))
);

function runSet(path) {
  const diagnostic = JSON.parse(readFileSync(path, "utf8"));
  if (diagnostic.frozen !== true || typeof diagnostic.contract !== "string") {
    throw new Error(`${path} must declare a frozen contract`);
  }
  if (diagnostic.targetOperation !== TARGET) {
    throw new Error(`${path} target must be ${TARGET}`);
  }
  const seen = new Set();
  const runCase = (testCase, role) => {
    if (seen.has(testCase.id)) throw new Error(`${path} repeats id ${testCase.id}`);
    seen.add(testCase.id);
    const hits = searchCatalog(catalog, { query: testCase.question, limit: 5 });
    const index = hits.findIndex((hit) => hit.id === TARGET);
    return {
      id: testCase.id,
      class: testCase.class,
      role,
      targetRank: index === -1 ? null : index + 1,
      topHits: hits.map(({ id, score, tier }) => ({ id, score, tier }))
    };
  };
  const cases = [
    ...diagnostic.positiveCases.map((testCase) => runCase(testCase, "positive")),
    ...diagnostic.controlCases.map((testCase) => runCase(testCase, "control"))
  ];
  const positives = cases.filter((testCase) => testCase.role === "positive");
  const controls = cases.filter((testCase) => testCase.role === "control");
  const top5 = positives.filter(
    (testCase) => testCase.targetRank !== null && testCase.targetRank <= 5
  ).length;
  const controlTop5Captures = controls.filter(
    (testCase) => testCase.targetRank !== null && testCase.targetRank <= 5
  ).length;
  return {
    contract: diagnostic.contract,
    targetOperation: TARGET,
    positives: positives.length,
    top5,
    controls: controls.length,
    controlTop5Captures,
    pass: top5 === positives.length && controlTop5Captures === 0,
    cases
  };
}

const sets = inputs.map(runSet);
for (const set of sets) {
  console.log(
    `${set.contract}: positives ${set.top5}/${set.positives} top-five; ` +
      `control captures ${set.controlTop5Captures}/${set.controls}; ` +
      `${set.pass ? "PASS" : "FAIL"}`
  );
  console.table(
    set.cases.map((testCase) => ({
      id: testCase.id,
      role: testCase.role,
      targetRank: testCase.targetRank ?? "miss",
      top: testCase.topHits[0]?.id ?? "none"
    }))
  );
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
mkdirSync(RESULTS_DIR, { recursive: true });
const outputPath = join(RESULTS_DIR, `protocol-history-${stamp}.json`);
writeFileSync(
  outputPath,
  `${JSON.stringify({ ranAt: new Date().toISOString(), sets }, null, 2)}\n`
);
console.log(`results -> ${outputPath}`);

if (sets.some((set) => !set.pass)) process.exitCode = 1;
