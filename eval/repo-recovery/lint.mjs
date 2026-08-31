#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  CONTRACT,
  EXPLAIN_REPO_ID,
  FROZEN_CASE_CONTENT_DIGEST,
  FROZEN_ORDERED_IDS_DIGEST,
  NEGATIVE_TOTAL,
  POSITIVE_TOTAL,
  REQUIRED_POSITIVE_PASSES,
  MAX_PREMATURE_DETOURS,
  caseContentDigest,
  orderedIdsDigest
} from "./contract.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_SUITE_PATH = resolve(HERE, "cases.json");
const DEFAULT_MANIFEST_PATH = resolve(HERE, "../../catalog/manifest.json");
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ID = /^rr-(?:pos|neg)-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const REPOSITORY = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const SOURCE_CLASSES = new Set(["A", "B", "C", "D", "E", "F"]);

const isObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const hasText = (value) => typeof value === "string" && value.trim().length > 0;

export function lintSuite(suite, manifest) {
  const errors = [];
  const fail = (message) => errors.push(message);
  if (!isObject(suite)) return ["suite must be an object"];
  if (suite.contract !== CONTRACT) fail(`contract must equal ${CONTRACT}`);
  if (!isObject(suite.contractProvenance)) fail("contractProvenance must be an object");
  if (!Array.isArray(suite.cases)) return [...errors, "cases must be an array"];
  if (suite.cases.length !== POSITIVE_TOTAL + NEGATIVE_TOTAL) {
    fail(`cases must contain exactly ${POSITIVE_TOTAL + NEGATIVE_TOTAL} entries`);
  }
  if (suite.contractProvenance?.caseContentDigest !== FROZEN_CASE_CONTENT_DIGEST) {
    fail("contractProvenance.caseContentDigest does not match the frozen contract literal");
  }
  if (caseContentDigest(suite.cases) !== FROZEN_CASE_CONTENT_DIGEST) {
    fail("contractProvenance.caseContentDigest does not match the frozen case content");
  }
  if (suite.contractProvenance?.orderedIdsDigest !== FROZEN_ORDERED_IDS_DIGEST) {
    fail("contractProvenance.orderedIdsDigest does not match the frozen contract literal");
  }
  if (orderedIdsDigest(suite.cases) !== FROZEN_ORDERED_IDS_DIGEST) {
    fail("contractProvenance.orderedIdsDigest does not match the frozen ordered IDs");
  }
  if (!hasText(suite.contractProvenance?.authoredAt) || !ISO_DATE.test(suite.contractProvenance.authoredAt)) {
    fail("contractProvenance.authoredAt must be an ISO date");
  }
  if (!hasText(suite.contractProvenance?.blindAuthor)) fail("contractProvenance.blindAuthor is required");
  if (!hasText(suite.contractProvenance?.startingRevision)) fail("contractProvenance.startingRevision is required");
  if (suite.thresholds?.positivePasses !== REQUIRED_POSITIVE_PASSES) {
    fail(`thresholds.positivePasses must equal ${REQUIRED_POSITIVE_PASSES}`);
  }
  if (suite.thresholds?.prematureDetours !== MAX_PREMATURE_DETOURS) {
    fail(`thresholds.prematureDetours must equal ${MAX_PREMATURE_DETOURS}`);
  }

  const manifestEntries = new Map((manifest?.entries ?? []).map((entry) => [entry.id, entry]));
  const ids = new Set();
  const repositories = new Set();
  let positives = 0;
  let negatives = 0;
  for (const [index, entry] of suite.cases.entries()) {
    const at = `cases[${index}]`;
    if (!isObject(entry)) {
      fail(`${at} must be an object`);
      continue;
    }
    if (!hasText(entry.id) || !ID.test(entry.id)) fail(`${at}.id has an invalid form`);
    if (ids.has(entry.id)) fail(`${at}.id repeats ${entry.id}`);
    ids.add(entry.id);
    if (entry.class === "positive") positives += 1;
    else if (entry.class === "negative") negatives += 1;
    else fail(`${at}.class must be positive or negative`);
    if (!hasText(entry.question)) fail(`${at}.question is required`);
    if (!hasText(entry.repository) || !REPOSITORY.test(entry.repository)) {
      fail(`${at}.repository must be an exact owner/name`);
    } else {
      repositories.add(entry.repository);
    }
    if (!isObject(entry.initialEvidence)) fail(`${at}.initialEvidence must be an object`);
    else if (Object.keys(entry.initialEvidence).some((key) => key !== "id")) {
      fail(`${at}.initialEvidence must contain only id`);
    }
    const initialId = entry.initialEvidence?.id;
    const initialManifestEntry = manifestEntries.get(initialId);
    if (!hasText(initialId) || !initialManifestEntry) fail(`${at}.initialEvidence.id must be manifest-exposed`);
    if (entry.class === "positive") {
      if (!initialId?.startsWith("stellarDocs.")) fail(`${at} positive recovery must start with Stellar Docs`);
      if (entry.expectedOperationOrder?.length !== 2 ||
          entry.expectedOperationOrder[0] !== initialId ||
          entry.expectedOperationOrder[1] !== EXPLAIN_REPO_ID) {
        fail(`${at} positive expectedOperationOrder must be Docs then ${EXPLAIN_REPO_ID}`);
      }
    } else {
      if (!(initialId?.startsWith("stellarDocs.") || initialId?.startsWith("skills."))) {
        fail(`${at} negative authority must be Docs or a skill`);
      }
      if (entry.expectedOperationOrder?.length !== 1 || entry.expectedOperationOrder[0] !== initialId) {
        fail(`${at} negative expectedOperationOrder must contain only its authority source`);
      }
    }
    if (!isObject(entry.golden)) fail(`${at}.golden must be an object`);
    if (!hasText(entry.golden?.answer)) fail(`${at}.golden.answer is required`);
    if (!Array.isArray(entry.golden?.keyFacts) || entry.golden.keyFacts.length < 1 || entry.golden.keyFacts.length > 5 || entry.golden.keyFacts.some((fact) => !hasText(fact))) {
      fail(`${at}.golden.keyFacts must contain 1-5 non-empty facts`);
    }
    if (!Array.isArray(entry.golden?.avoid) || entry.golden.avoid.some((fact) => !hasText(fact))) {
      fail(`${at}.golden.avoid must be an array of non-empty strings`);
    }
    if (!isObject(entry.truth)) fail(`${at}.truth must be an object`);
    if (!["real-world", "corpus-grounded", "mixed"].includes(entry.truth?.domain)) {
      fail(`${at}.truth.domain is invalid`);
    }
    if (!["confirmed", "disputed", "unverifiable", "mixed"].includes(entry.truth?.status)) {
      fail(`${at}.truth.status is invalid`);
    }
    if (!ISO_DATE.test(entry.truth?.asOf ?? "")) fail(`${at}.truth.asOf must be an ISO date`);
    if (!ISO_DATE.test(entry.truth?.reverifyBy ?? "")) fail(`${at}.truth.reverifyBy must be an ISO date`);
    if (!Array.isArray(entry.truth?.sources) || entry.truth.sources.length < 2) {
      fail(`${at}.truth.sources must contain at least two sources`);
    }
    const classes = new Set();
    for (const [sourceIndex, source] of (entry.truth?.sources ?? []).entries()) {
      if (!SOURCE_CLASSES.has(source?.class)) fail(`${at}.truth.sources[${sourceIndex}].class is invalid`);
      else classes.add(source.class);
      if (!hasText(source?.ref)) fail(`${at}.truth.sources[${sourceIndex}].ref is required`);
    }
    if (classes.size < 2) fail(`${at}.truth.sources must span at least two source classes`);
    if (entry.class === "positive" && !classes.has("B")) fail(`${at} positive truth needs source-code class B`);
    if (!classes.has("A") && !classes.has("B")) fail(`${at} truth needs a primary A or B source`);
    if (!Array.isArray(entry.truth?.corroboration) || entry.truth.corroboration.length < 1) {
      fail(`${at}.truth.corroboration is required`);
    }
    for (const [claimIndex, claim] of (entry.truth?.corroboration ?? []).entries()) {
      if (!hasText(claim?.claim)) fail(`${at}.truth.corroboration[${claimIndex}].claim is required`);
      if (!["confirmed", "confirmed-as-of", "disputed", "unverifiable", "corpus-only", "contradicted"].includes(claim?.verdict)) {
        fail(`${at}.truth.corroboration[${claimIndex}].verdict is invalid`);
      }
      if (!Array.isArray(claim?.evidence) || claim.evidence.length < 2) {
        fail(`${at}.truth.corroboration[${claimIndex}].evidence needs two entries`);
      }
      const claimClasses = new Set((claim?.evidence ?? []).map((item) => item?.class));
      if (claimClasses.size < 2) fail(`${at}.truth.corroboration[${claimIndex}] needs two source classes`);
      for (const [evidenceIndex, evidence] of (claim?.evidence ?? []).entries()) {
        if (!SOURCE_CLASSES.has(evidence?.class)) fail(`${at}.truth.corroboration[${claimIndex}].evidence[${evidenceIndex}].class is invalid`);
        if (!hasText(evidence?.ref)) fail(`${at}.truth.corroboration[${claimIndex}].evidence[${evidenceIndex}].ref is required`);
        if (!ISO_DATE.test(evidence?.observedAt ?? "")) fail(`${at}.truth.corroboration[${claimIndex}].evidence[${evidenceIndex}].observedAt must be an ISO date`);
      }
    }
    if (!ISO_DATE.test(entry.truth?.verified?.date ?? "")) fail(`${at}.truth.verified.date must be an ISO date`);
    if (!hasText(entry.truth?.verified?.by)) fail(`${at}.truth.verified.by is required`);
    if (!Array.isArray(entry.truth?.verified?.evidence) || entry.truth.verified.evidence.length < 1 || entry.truth.verified.evidence.some((item) => !hasText(item))) {
      fail(`${at}.truth.verified.evidence is required`);
    }
    if (!Array.isArray(entry.truth?.verified?.rootCause) || entry.truth.verified.rootCause.length < 1 || entry.truth.verified.rootCause.some((item) => !hasText(item))) {
      fail(`${at}.truth.verified.rootCause is required`);
    }
  }
  if (positives !== POSITIVE_TOTAL) fail(`suite must contain exactly ${POSITIVE_TOTAL} positives`);
  if (negatives !== NEGATIVE_TOTAL) fail(`suite must contain exactly ${NEGATIVE_TOTAL} negatives`);
  if (repositories.size < 4) fail("suite must cover at least four repositories");
  const explainRepo = manifestEntries.get(EXPLAIN_REPO_ID);
  if (explainRepo?.kind !== "operation") fail(`${EXPLAIN_REPO_ID} must remain an exposed operation`);
  return errors;
}

export function loadSuite(path = DEFAULT_SUITE_PATH) {
  return JSON.parse(readFileSync(path, "utf8"));
}

export function loadManifest(path = DEFAULT_MANIFEST_PATH) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function main() {
  const suitePath = process.argv[2] ? resolve(process.argv[2]) : DEFAULT_SUITE_PATH;
  const errors = lintSuite(loadSuite(suitePath), loadManifest());
  if (errors.length > 0) {
    console.error(`Repository-recovery suite lint failed (${errors.length}):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log(`Repository-recovery suite lint PASS — ${POSITIVE_TOTAL} positive, ${NEGATIVE_TOTAL} negative, frozen ${CONTRACT}`);
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) main();
