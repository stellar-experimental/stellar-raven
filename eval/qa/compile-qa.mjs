#!/usr/bin/env node
/** Compile the owned one-file-per-case QA battery into deterministic artifacts. */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileAtomic } from "../../scripts/lib/shared.mjs";
import {
  CASES_PATH,
  LIFECYCLE_POLICY_PATH,
  LIFECYCLE_REGISTRY_PATH,
  QA_CATEGORIES,
  QA_DIR,
  QA_SERVICES,
  SAMPLE_PATH,
  stratifiedSample
} from "./lib.mjs";
import {
  COMPILED_LIFECYCLE_STATES,
  buildLifecycleRegistry,
  lifecyclePolicyProblems,
  lifecycleProblems,
  tombstoneProblems
} from "./lifecycle.mjs";
import { strkeyFindings } from "./strkey.mjs";

const CORPUS_DIR = path.join(QA_DIR, "corpus/battery");
const PROPOSED_DIR = path.join(QA_DIR, "corpus/proposed");
const RETIRED_DIR = path.join(QA_DIR, "corpus/retired");
const LEDGER_PATH = path.join(QA_DIR, "corpus/migration-ledger.json");
const REGISTER_PATH = path.join(QA_DIR, "consistency-register.json");
const SAMPLE_SIZE = 30;
const FRESHNESS = new Set(["stable", "scheduled", "live"]);
const TRAPS = new Set([
  "out-of-scope", "injection", "paid-bait", "fabrication-bait", "scam-check",
  "speculation", "cant-do", "ambiguous", "governance"
]);
const TRUTH_DOMAINS = new Set(["real-world", "corpus-grounded", "mixed"]);
const TRUTH_STATUSES = new Set(["confirmed", "disputed", "unverifiable", "mixed"]);
const SOURCE_CLASSES = new Set(["A", "B", "C", "D", "E", "F"]);
const CORROBORATION_VERDICTS = new Set([
  "confirmed", "confirmed-as-of", "disputed", "unverifiable", "corpus-only", "contradicted"
]);
const DISPOSITIONS = new Set(["carry", "merge", "redefine", "retire"]);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MIGRATION_KEYFACT_EXCEPTIONS = new Map([
  ["q-ti-cli-rust-windows-troubleshooting", 6],
  ["q-ti-run-tune-own-horizon", 6],
  ["q-ti-secret-key-custody-backend", 6],
  ["q-ti-secret-key-vs-mnemonic-derivation", 6],
  ["q-ti-self-host-core-rpc-full-history", 6],
  ["q-ti-self-host-retention-backfill", 6],
  ["q-ti-stellar-lab-usage-and-new-ui", 6],
  ["q-ti-testnet-mainnet-migration", 6],
  ["q-ti-xdr-decode-in-code", 6],
  ["q-tool-cctp-stellar-integration", 7]
]);

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function json(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function walkJsonFiles(dir) {
  if (!existsSync(dir)) return [];
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkJsonFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".json")) files.push(full);
  }
  return files;
}

function fail(file, message) {
  throw new Error(`${path.relative(QA_DIR, file)}: ${message}`);
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function assertStringArray(file, value, field, { min = 0, max = Infinity } = {}) {
  if (!Array.isArray(value) || value.length < min || value.length > max || !value.every(nonEmptyString)) {
    fail(file, `${field} must contain ${min}-${max === Infinity ? "many" : max} non-empty strings`);
  }
}

function validateEvidence(file, evidence, field) {
  if (!Array.isArray(evidence) || evidence.length === 0) fail(file, `${field} must be a non-empty array`);
  for (const [index, item] of evidence.entries()) {
    if (!item || typeof item !== "object" || !SOURCE_CLASSES.has(item.class) || !nonEmptyString(item.ref)) {
      fail(file, `${field}[${index}] requires class A-F and a non-empty ref`);
    }
  }
}

function validateCase(file, kase, { allowedLifecycleStates = COMPILED_LIFECYCLE_STATES } = {}) {
  if (!kase || typeof kase !== "object" || Array.isArray(kase)) fail(file, "case must be an object");
  const [strkeyFinding] = strkeyFindings(kase);
  if (strkeyFinding) {
    fail(file, `invalid strkey at ${strkeyFinding.path}: ${strkeyFinding.token} (${strkeyFinding.reason})`);
  }
  if (!nonEmptyString(kase.id) || !/^q-[a-z0-9-]+$/.test(kase.id)) fail(file, "id must be a q-* kebab id");
  if (path.basename(file) !== `${kase.id}.json`) fail(file, "filename must equal id + .json");
  const category = path.basename(path.dirname(file));
  if (kase.tags?.category !== category) fail(file, "parent directory must equal tags.category");
  if (!QA_CATEGORIES.has(category)) fail(file, `unknown category ${category}`);
  if (!nonEmptyString(kase.question)) fail(file, "question is required");
  if (!Array.isArray(kase.surface) || !kase.surface.every(nonEmptyString)) fail(file, "surface must be a string array");
  if (kase.tags?.service !== "none" && kase.surface.length === 0) fail(file, "surface is required unless service is none");
  if (!nonEmptyString(kase.golden?.answer)) fail(file, "golden.answer is required");
  const expectedLegacyCount = MIGRATION_KEYFACT_EXCEPTIONS.get(kase.id);
  // Ten mechanically carried cases already have 6-7 judge-visible facts. The
  // migration proof forbids changing them in C5; every other case is closed at
  // five, and even these ids may not grow beyond their pinned migration count.
  assertStringArray(file, kase.golden?.keyFacts, "golden.keyFacts", { min: 1, max: expectedLegacyCount ?? 5 });
  if (expectedLegacyCount && kase.golden.keyFacts.length !== expectedLegacyCount) {
    fail(file, `migration exception requires exactly ${expectedLegacyCount} golden.keyFacts until P4 consolidation`);
  }
  assertStringArray(file, kase.golden?.avoid, "golden.avoid");
  if (kase.golden.notes !== undefined && typeof kase.golden.notes !== "string") fail(file, "golden.notes must be a string");
  if (!QA_SERVICES.has(kase.tags?.service)) fail(file, `unknown service ${kase.tags?.service}`);
  if (!FRESHNESS.has(kase.tags?.freshness)) fail(file, `unknown freshness ${kase.tags?.freshness}`);
  if (kase.tags.trap !== undefined && !TRAPS.has(kase.tags.trap)) fail(file, `unknown trap ${kase.tags.trap}`);
  if (!TRUTH_DOMAINS.has(kase.truth?.domain)) fail(file, `unknown truth.domain ${kase.truth?.domain}`);
  if (!TRUTH_STATUSES.has(kase.truth?.status)) fail(file, `unknown truth.status ${kase.truth?.status}`);
  const [lifecycleProblem] = lifecycleProblems(kase, { allowedStates: allowedLifecycleStates });
  if (lifecycleProblem) fail(file, lifecycleProblem);
  const needsAsOf = kase.tags.freshness !== "stable" || kase.truth.status !== "confirmed";
  if (needsAsOf && !DATE_RE.test(kase.truth.asOf ?? "")) fail(file, "truth.asOf is required as YYYY-MM-DD");
  if (kase.truth.asOf !== undefined && !DATE_RE.test(kase.truth.asOf)) fail(file, "truth.asOf must be YYYY-MM-DD");
  if (kase.tags.freshness === "scheduled" && !DATE_RE.test(kase.truth.reverifyBy ?? "")) {
    fail(file, "scheduled cases require truth.reverifyBy as YYYY-MM-DD");
  }
  if (kase.truth.reverifyBy !== undefined && !DATE_RE.test(kase.truth.reverifyBy)) fail(file, "truth.reverifyBy must be YYYY-MM-DD");
  validateEvidence(file, kase.truth?.sources, "truth.sources");
  if (!nonEmptyString(kase.truth?.origin)) fail(file, "truth.origin is required");
  if (!kase.truth?.verified || !DATE_RE.test(kase.truth.verified.date ?? "") || !nonEmptyString(kase.truth.verified.by)) {
    fail(file, "truth.verified requires date and by");
  }
  assertStringArray(file, kase.truth.verified.evidence, "truth.verified.evidence", { min: 1 });
  for (const [index, row] of (kase.truth.corroboration ?? []).entries()) {
    if (!nonEmptyString(row?.claim) || !CORROBORATION_VERDICTS.has(row?.verdict)) {
      fail(file, `truth.corroboration[${index}] has an invalid claim or verdict`);
    }
    validateEvidence(file, row.evidence, `truth.corroboration[${index}].evidence`);
  }
  return kase;
}

export function validateCaseFile(file) {
  return validateCase(file, json(file));
}

function recordsFrom(dir, options) {
  return walkJsonFiles(dir).map((file) => ({ file, value: validateCase(file, json(file), options) }));
}

function tombstoneRecordsFrom(dir) {
  return walkJsonFiles(dir).map((file) => {
    const value = json(file);
    const [problem] = tombstoneProblems(value);
    if (problem) fail(file, problem);
    if (path.basename(file) !== `${value.id}.json`) fail(file, "filename must equal id + .json");
    return { file, value };
  });
}

function validateRegister(register) {
  const improvementFiles = [];
  const improvementRoot = path.resolve(QA_DIR, "../../improvements");
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".md")) improvementFiles.push(path.relative(path.resolve(QA_DIR, "../.."), full));
    }
  };
  walk(improvementRoot);
  const serialized = JSON.stringify(register);
  for (const match of serialized.matchAll(/improvements\/[a-z0-9-]+\/([a-z]{2,3}-\d{3})(?:-[a-z0-9-]+)?(?:\.md)?/g)) {
    if (!improvementFiles.some((file) => path.basename(file).startsWith(`${match[1]}-`))) {
      throw new Error(`consistency-register.json: unknown finding id ${match[1]}`);
    }
  }
}

function validateLedger(ledger, cases) {
  const rows = Array.isArray(ledger) ? ledger : ledger?.rows ?? ledger?.entries;
  if (!Array.isArray(rows)) throw new Error("migration-ledger.json: expected rows[]");
  const byId = new Map(cases.map((kase) => [kase.id, kase]));
  const seen = new Set();
  for (const row of rows) {
    const key = `${row.source ?? ""}\0${row.sourceId ?? ""}`;
    if (!nonEmptyString(row.sourceId) || seen.has(key)) throw new Error(`migration-ledger.json: invalid/duplicate source ${key}`);
    seen.add(key);
    if (!DISPOSITIONS.has(row.disposition)) throw new Error(`migration-ledger.json: invalid disposition for ${row.sourceId}`);
    if (["carry", "merge", "redefine"].includes(row.disposition) && (!Array.isArray(row.destination) || row.destination.length === 0)) {
      throw new Error(`migration-ledger.json: ${row.sourceId} requires destination[]`);
    }
    if (["merge", "redefine", "retire"].includes(row.disposition) && !nonEmptyString(row.reason)) {
      throw new Error(`migration-ledger.json: ${row.sourceId} requires reason`);
    }
    for (const id of row.destination ?? []) {
      const destination = byId.get(id);
      if (!destination) throw new Error(`migration-ledger.json: missing destination ${id}`);
      if (["carry", "redefine"].includes(row.disposition) && !destination.truth.origin.includes(row.sourceId)) {
        throw new Error(`migration-ledger.json: ${id} truth.origin does not name ${row.sourceId}`);
      }
    }
  }
  for (const kase of cases) {
    if (kase.truth.origin.startsWith("authored ")) continue;
    if (!rows.some((row) => (row.destination ?? []).includes(kase.id))) {
      throw new Error(`migration-ledger.json: ${kase.id} is not a destination`);
    }
  }
}

function countBy(items, select) {
  const counts = {};
  for (const item of items) counts[select(item)] = (counts[select(item)] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

function counts(cases) {
  return {
    total: cases.length,
    byCategory: countBy(cases, (kase) => kase.tags.category),
    byService: countBy(cases, (kase) => kase.tags.service),
    byFreshness: countBy(cases, (kase) => kase.tags.freshness),
    traps: countBy(cases.filter((kase) => kase.tags.trap), (kase) => kase.tags.trap),
    byLifecycleState: countBy(cases, (kase) => kase.truth.lifecycle.state),
    byReviewState: countBy(cases, (kase) => kase.truth.lifecycle.reviewState)
  };
}

function wrapper(cases, corpusContentSha256, comment) {
  return { $comment: comment, schema: "qa-case-v1", corpusContentSha256, counts: counts(cases), cases };
}

function main() {
  if (process.argv.length > 2) throw new Error("compile-qa.mjs takes no arguments; it always emits cases.json, sample.json, and lifecycle-registry.json");
  const seen = new Set();
  const batteryRecords = recordsFrom(CORPUS_DIR, { allowedLifecycleStates: COMPILED_LIFECYCLE_STATES });
  const proposedRecords = recordsFrom(PROPOSED_DIR, { allowedLifecycleStates: new Set(["proposed"]) });
  const tombstoneRecords = tombstoneRecordsFrom(RETIRED_DIR);
  const cases = batteryRecords.map(({ file, value: kase }) => {
    if (seen.has(kase.id)) fail(file, `duplicate id ${kase.id}`);
    seen.add(kase.id);
    return kase;
  }).sort((a, b) => a.id.localeCompare(b.id));
  if (!existsSync(LEDGER_PATH) || !existsSync(REGISTER_PATH)) throw new Error("migration ledger and consistency register are required");
  validateLedger(json(LEDGER_PATH), cases);
  validateRegister(json(REGISTER_PATH));
  if (!existsSync(LIFECYCLE_POLICY_PATH)) throw new Error("corpus/lifecycle-policy.json is required");
  const policyResult = lifecyclePolicyProblems(cases, json(LIFECYCLE_POLICY_PATH), undefined, {
    enforceTriggers: false
  });
  if (policyResult.problems.length) throw new Error(`corpus/lifecycle-policy.json: ${policyResult.problems[0]}`);
  const previousRegistry = existsSync(LIFECYCLE_REGISTRY_PATH) ? json(LIFECYCLE_REGISTRY_PATH) : null;
  const lifecycleRegistry = buildLifecycleRegistry({
    root: path.resolve(QA_DIR, "../.."),
    batteryRecords,
    proposedRecords,
    tombstoneRecords,
    previousRegistry
  });
  const corpusContentSha256 = sha256(JSON.stringify(cases));
  const sample = stratifiedSample(cases, SAMPLE_SIZE);
  writeFileAtomic(CASES_PATH, `${JSON.stringify(wrapper(cases, corpusContentSha256, "Generated owned QA battery. Regenerate with npm run eval:qa:compile."), null, 2)}\n`);
  writeFileAtomic(SAMPLE_PATH, `${JSON.stringify(wrapper(sample, corpusContentSha256, `Deterministic stratified sample (N=${SAMPLE_SIZE}, by service) of the owned QA battery.`), null, 2)}\n`);
  writeFileAtomic(LIFECYCLE_REGISTRY_PATH, `${JSON.stringify(lifecycleRegistry, null, 2)}\n`);
  console.log(`wrote ${CASES_PATH} (${cases.length} cases; sha256 ${corpusContentSha256})`);
  console.log(`wrote ${SAMPLE_PATH} (${sample.length} cases)`);
  console.log(`wrote ${LIFECYCLE_REGISTRY_PATH} (${lifecycleRegistry.reservedIds.length} reserved ids)`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
