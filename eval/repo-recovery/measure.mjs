#!/usr/bin/env node
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  loadManifest as parseManifest,
  recoveryCandidates,
  searchCatalogPage
} from "../../src/catalog/search.ts";
import {
  EXPLAIN_REPO_ID,
  MAX_PREMATURE_DETOURS,
  RECOVERY_TRIGGER_OUTCOMES,
  REQUIRED_POSITIVE_PASSES,
  suiteIdentity
} from "./contract.mjs";
import { DEFAULT_SUITE_PATH, lintSuite, loadManifest, loadSuite } from "./lint.mjs";

export function measureSuite(suite, manifest) {
  const catalog = parseManifest(manifest);
  const target = catalog.entries.find((entry) => entry.id === EXPLAIN_REPO_ID);
  const positives = suite.cases.filter((entry) => entry.class === "positive").map((entry) => {
    const candidatesByOutcome = [...RECOVERY_TRIGGER_OUTCOMES].map((outcome) => ({
      outcome,
      candidates: recoveryCandidates(catalog, [entry.initialEvidence.id], outcome, 3)
    }));
    return {
      id: entry.id,
      source: entry.initialEvidence.id,
      outcomes: [...RECOVERY_TRIGGER_OUTCOMES],
      eligible: candidatesByOutcome.every(({ candidates }) =>
        candidates.some((item) => item.id === EXPLAIN_REPO_ID && item.relation === "source-code")
      ),
      recoveryIds: Object.fromEntries(candidatesByOutcome.map(({ outcome, candidates }) => [outcome, candidates.map((item) => item.id)]))
    };
  });
  const negatives = suite.cases.filter((entry) => entry.class === "negative").map((entry) => {
    const page = searchCatalogPage(catalog, { query: entry.question, limit: 10 });
    const authorityIndex = page.hits.findIndex((hit) => hit.service === "stellarDocs" || hit.service === "skills");
    const explainIndex = page.hits.findIndex((hit) => hit.id === EXPLAIN_REPO_ID);
    const prematureRankRisk = explainIndex >= 0 && (authorityIndex < 0 || explainIndex < authorityIndex);
    return {
      id: entry.id,
      authorityIndex,
      explainIndex,
      prematureRankRisk,
      top: page.hits.map((hit) => hit.id)
    };
  });
  const positiveEligible = positives.filter((entry) => entry.eligible).length;
  const prematureRankRisks = negatives.filter((entry) => entry.prematureRankRisk).length;
  const discoveryProbes = [
    ...suite.cases.map((entry) => entry.question),
    `${EXPLAIN_REPO_ID} ${target?.description ?? "repository source code explanation"}`
  ];
  const ordinaryDiscoveryLeaks = discoveryProbes.filter((query) =>
    searchCatalogPage(catalog, { query, kind: "operation", service: "scout", limit: 50 })
      .hits.some((hit) => hit.id === EXPLAIN_REPO_ID)
  );
  const mechanism = {
    targetExposed: target?.kind === "operation",
    targetRecoveryOnly: target?.discoveryMode === "recovery-only",
    targetSearchable: target?.searchable !== false,
    ordinaryDiscoveryLeaks: ordinaryDiscoveryLeaks.length,
    pass:
      target?.kind === "operation" &&
      target.discoveryMode === "recovery-only" &&
      target.searchable === false &&
      ordinaryDiscoveryLeaks.length === 0
  };
  return {
    ...suiteIdentity(suite),
    note: "Free mechanism and graph proxy only. The stored live-agent grader owns cross-execute operation order and grounded-answer checks.",
    mechanism,
    positiveEligible,
    positiveTotal: positives.length,
    requiredPositivePasses: REQUIRED_POSITIVE_PASSES,
    prematureRankRisks,
    negativeTotal: negatives.length,
    maxPrematureDetours: MAX_PREMATURE_DETOURS,
    pass:
      mechanism.pass &&
      positiveEligible >= REQUIRED_POSITIVE_PASSES &&
      prematureRankRisks <= MAX_PREMATURE_DETOURS,
    positives,
    negatives
  };
}

function main() {
  const suitePathIndex = process.argv.indexOf("--suite");
  const suitePath = suitePathIndex >= 0 ? resolve(process.argv[suitePathIndex + 1]) : DEFAULT_SUITE_PATH;
  const enforce = process.argv.includes("--gate");
  const suite = loadSuite(suitePath);
  const manifest = loadManifest();
  const lintErrors = lintSuite(suite, manifest);
  if (lintErrors.length > 0) throw new Error(`suite lint failed: ${lintErrors.join("; ")}`);
  const measurement = measureSuite(suite, manifest);
  console.log(JSON.stringify(measurement, null, 2));
  if (enforce && !measurement.pass) process.exitCode = 1;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) main();
