#!/usr/bin/env node
/**
 * Grade the frozen protocol-history v2 sets without merging them into routing lanes.
 * Required cases need scout.searchResearch in the top five. Forbidden cases exclude it.
 * Console output prints set aggregates only; `--rows` adds the per-case tables. The results file
 * carries every row either way (eval/README.md, "Row output").
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { loadManifest, searchCatalog } from "../src/catalog/search.ts";
import { evaluateProtocolHistory } from "./lib/protocol-history-source-epoch.mjs";
import { confirmationOnlyFor, tagRows } from "./lib/confirmation-only.mjs";
import { reportProtocolHistorySets } from "./lib/protocol-history-report.mjs";
import { readJson } from "./lib/read-json.mjs";

const EVAL_DIR = dirname(fileURLToPath(import.meta.url));
const REPO = join(EVAL_DIR, "..");
const RESULTS_DIR = join(EVAL_DIR, "results");
const SHOW_ROWS = process.argv.includes("--rows");
const MANIFEST_PATH = join(REPO, "catalog", "manifest.json");
const INVENTORY_PATH = join(REPO, "inventory", "stellar-light.json");
const inputs = [
  {
    path: join(EVAL_DIR, "protocol-history-cases-v2.json"),
    expectedContract: "protocol-history-routing-v2",
    listSet: "protocol-history-v2",
  },
  {
    path: join(EVAL_DIR, "protocol-history-blind-cases-v2.json"),
    expectedContract: "protocol-history-blind-v2",
    listSet: "protocol-history-blind-v2",
  },
];

const manifestBytes = readFileSync(MANIFEST_PATH);
const inventoryBytes = readFileSync(INVENTORY_PATH);
const manifest = readJson(MANIFEST_PATH, REPO);
const inventory = readJson(INVENTORY_PATH, REPO);
const contractInputs = inputs.map((input) => {
  const bytes = readFileSync(input.path);
  return {
    ...input,
    path: relative(REPO, input.path),
    bytes,
    contract: readJson(input.path, REPO),
  };
});

let catalog;
const result = evaluateProtocolHistory({
  contractInputs,
  manifestBytes,
  manifest,
  inventoryBytes,
  inventory,
  rank: (question) => {
    catalog ??= loadManifest(manifest);
    return searchCatalog(catalog, { query: question, limit: 5 });
  },
});
result.ranAt = new Date().toISOString();

// Rows whose question matches a QA headline question are tagged confirmation-only (eval/README.md):
// the set totals above still count them, and the console prints no per-row outcome for them.
if (Array.isArray(result.sets)) {
  for (const set of result.sets) {
    const input = inputs.find((candidate) => candidate.expectedContract === set.contract);
    if (!input) throw new Error(`no listed question set for contract ${set.contract}`);
    tagRows(set.cases, confirmationOnlyFor(input.listSet, set.cases.map((testCase) => testCase.id)));
  }
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
mkdirSync(RESULTS_DIR, { recursive: true });
const outputPath = join(RESULTS_DIR, `protocol-history-${stamp}.json`);
writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);

if (result.measurementStatus === "source-expired") {
  for (const contract of result.contracts) {
    console.error(
      `${contract.contract}: ${contract.measurementStatus}` +
        (contract.expiryReasons.length ? ` (${contract.expiryReasons.join(", ")})` : ""),
    );
  }
  console.error("No protocol-history question was scored.");
  console.error(`audit result -> ${outputPath}`);
  process.exitCode = 1;
} else {
  reportProtocolHistorySets(result.sets, { showRows: SHOW_ROWS });
  console.log(`results -> ${outputPath}`);
  if (result.sets.some((set) => !set.pass)) process.exitCode = 1;
}
