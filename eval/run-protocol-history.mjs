#!/usr/bin/env node
/**
 * Grade the frozen protocol-history v2 sets without merging them into routing lanes.
 * Required cases need scout.searchResearch in the top five. Forbidden cases exclude it.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { loadManifest, searchCatalog } from "../src/catalog/search.ts";
import { evaluateProtocolHistory } from "./lib/protocol-history-source-epoch.mjs";

const EVAL_DIR = dirname(fileURLToPath(import.meta.url));
const REPO = join(EVAL_DIR, "..");
const RESULTS_DIR = join(EVAL_DIR, "results");
const MANIFEST_PATH = join(REPO, "catalog", "manifest.json");
const INVENTORY_PATH = join(REPO, "inventory", "stellar-light.json");
const inputs = [
  {
    path: join(EVAL_DIR, "protocol-history-cases-v2.json"),
    expectedContract: "protocol-history-routing-v2",
  },
  {
    path: join(EVAL_DIR, "protocol-history-blind-cases-v2.json"),
    expectedContract: "protocol-history-blind-v2",
  },
];

const manifestBytes = readFileSync(MANIFEST_PATH);
const inventoryBytes = readFileSync(INVENTORY_PATH);
const manifest = JSON.parse(manifestBytes.toString("utf8"));
const inventory = JSON.parse(inventoryBytes.toString("utf8"));
const contractInputs = inputs.map((input) => {
  const bytes = readFileSync(input.path);
  return {
    ...input,
    path: relative(REPO, input.path),
    bytes,
    contract: JSON.parse(bytes.toString("utf8")),
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
  for (const set of result.sets) {
    console.log(
      `${set.contract}: required ${set.requiredTop5}/${set.required} top-five; ` +
        `forbidden captures ${set.forbiddenTop5Captures}/${set.forbidden}; ` +
        `neutral captures ${set.neutralTop5Captures}/${set.neutral}; ` +
        `${set.pass ? "PASS" : "FAIL"}`,
    );
    console.table(
      set.cases.map((testCase) => ({
        id: testCase.id,
        role: testCase.role,
        targetRank: testCase.targetRank ?? "miss",
        top: testCase.topHits[0]?.id ?? "none",
      })),
    );
  }
  console.log(`results -> ${outputPath}`);
  if (result.sets.some((set) => !set.pass)) process.exitCode = 1;
}
