#!/usr/bin/env node
/**
 * Stamp consistency-register entries with their owned case-file hashes.
 * A changed known hash reopens the entry; a missing historical hash is seeded
 * without blocking or reopening it.
 * Each review applies once to a reopened entry. Date-trap reviews match the old
 * trigger text and can rewrite that same match key.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { writeFileAtomic } from "../../scripts/lib/shared.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DEFAULT_REGISTER = path.join(ROOT, "eval/qa/consistency-register.json");
const DEFAULT_CORPUS = path.join(ROOT, "eval/qa/corpus/battery");

function walkJsonFiles(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkJsonFiles(full));
    else if (entry.isFile() && entry.name.endsWith(".json")) out.push(full);
  }
  return out;
}

export function caseFileHashes(corpusDir) {
  const hashes = new Map();
  for (const file of walkJsonFiles(corpusDir)) {
    const bytes = readFileSync(file);
    const parsed = JSON.parse(bytes.toString("utf8"));
    if (typeof parsed.id !== "string" || !parsed.id) throw new Error(`case file has no id: ${file}`);
    if (hashes.has(parsed.id)) throw new Error(`duplicate case id while hashing: ${parsed.id}`);
    hashes.set(parsed.id, createHash("sha256").update(bytes).digest("hex"));
  }
  return hashes;
}

function clusterMembers(cluster) {
  return cluster.members ?? cluster.memberIds ?? cluster.cases ?? [];
}

function clusterList(register) {
  const clusters = Array.isArray(register.clusters)
    ? [...register.clusters]
    : register.clusters && Array.isArray(register.clusters.entries)
      ? [...register.clusters.entries]
      : [];
  for (const sweep of register.sweeps ?? []) {
    clusters.push(...(sweep.contradictions ?? []), ...(sweep.tensions ?? []), ...(sweep.verifiedConsistent ?? []));
  }
  return clusters;
}

function entryLabel(entry) {
  return entry.id ?? entry.name ?? entry.cluster ?? entry.label ?? entry.triggerDateEvent
    ?? entry.cases?.join(",") ?? "unnamed";
}

export function updateRegister(register, hashes, { seed = false, date = new Date().toISOString().slice(0, 10) } = {}) {
  let changed = false;
  const reopened = [];
  const missingCases = [];
  for (const entry of clusterList(register)) {
    if (typeof entry.reSwept === "string") {
      throw new Error(`${entryLabel(entry)}: reSwept must be an object, not a string`);
    }
  }
  const entries = [
    ...clusterList(register).map((entry) => [entry, clusterMembers(entry)]),
    ...(register.numericInvariants?.entries ?? []).map((entry) => [entry, entry.affectedCaseIds ?? []]),
    ...(register.dateContingentTraps?.entries ?? []).map((entry) => [entry, entry.caseIds ?? []])
  ];
  for (const [entry, memberIds] of entries) {
    const previous = entry.memberContentSha256 && typeof entry.memberContentSha256 === "object"
      ? entry.memberContentSha256
      : {};
    const next = {};
    let knownHashChanged = false;
    for (const id of [...memberIds].sort()) {
      const hash = hashes.get(id);
      if (!hash) {
        missingCases.push({ entry: entryLabel(entry), id });
        if (typeof previous[id] === "string") next[id] = previous[id];
        continue;
      }
      next[id] = hash;
      if (typeof previous[id] === "string" && previous[id] !== hash) knownHashChanged = true;
    }
    if (JSON.stringify(previous) !== JSON.stringify(next)) {
      entry.memberContentSha256 = next;
      changed = true;
    }
    // Seed mode and absent historical member hashes establish the baseline;
    // only a changed hash that was actually recorded can reopen an entry.
    if (!seed && knownHashChanged) {
      const label = entryLabel(entry);
      if (entry.verdict !== "reopen") { entry.verdict = "reopen"; changed = true; }
      const marker = { date, reason: "member-content-changed" };
      if (JSON.stringify(entry.reopened) !== JSON.stringify(marker)) { entry.reopened = marker; changed = true; }
      reopened.push(label);
    }
  }
  // The grafted collections are always present after the helper writes, even
  // when migration has not populated them yet.
  if (register.numericInvariants === undefined) { register.numericInvariants = { entries: [] }; changed = true; }
  if (register.dateContingentTraps === undefined) { register.dateContingentTraps = { entries: [] }; changed = true; }
  return { register, changed, reopened: reopened.sort(), missingCases: missingCases.sort((a, b) => a.entry.localeCompare(b.entry) || a.id.localeCompare(b.id)) };
}

const REVIEW_FIELDS = new Set(["verdict", "lastChecked", "reSwept", "triggerDateEvent", "disposition"]);

function applyReviewFields(entry, review, label) {
  for (const key of Object.keys(review)) {
    if (!["id", "matchTriggerDateEvent", "clearReopened"].includes(key) && !REVIEW_FIELDS.has(key)) {
      throw new Error(`${label}: unsupported review field ${key}`);
    }
  }
  if (entry.verdict !== "reopen" || !entry.reopened || typeof entry.reopened !== "object") {
    throw new Error(`${label}: target must be reopened`);
  }
  if (review.verdict !== "consistent") throw new Error(`${label}: review verdict must be consistent`);
  if (typeof review.lastChecked !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(review.lastChecked)) {
    throw new Error(`${label}: lastChecked must be an ISO date`);
  }
  if (!review.reSwept || typeof review.reSwept !== "object" || Array.isArray(review.reSwept)) {
    throw new Error(`${label}: reSwept must be an object`);
  }
  if (review.reSwept.date !== review.lastChecked) {
    throw new Error(`${label}: reSwept.date must match lastChecked`);
  }
  if (typeof review.reSwept.reason !== "string" || !review.reSwept.reason.trim()) {
    throw new Error(`${label}: reSwept.reason must be a non-empty string`);
  }
  if (review.reSwept.verdict !== review.verdict) {
    throw new Error(`${label}: reSwept.verdict must match verdict`);
  }
  if (review.clearReopened !== true) throw new Error(`${label}: clearReopened must be true`);
  for (const key of REVIEW_FIELDS) {
    if (review[key] !== undefined) entry[key] = review[key];
  }
  delete entry.reopened;
}

export function applyRegisterReview(register, review) {
  const clusters = clusterList(register);
  const traps = register.dateContingentTraps?.entries ?? [];
  for (const item of review.clusters ?? []) {
    const matches = clusters.filter((entry) => entry.id === item.id);
    if (matches.length !== 1) throw new Error(`review cluster ${item.id}: expected one match, found ${matches.length}`);
    applyReviewFields(matches[0], item, `review cluster ${item.id}`);
  }
  for (const item of review.dateContingentTraps ?? []) {
    const matches = traps.filter((entry) => entry.triggerDateEvent === item.matchTriggerDateEvent);
    if (matches.length !== 1) {
      throw new Error(`review date trap ${item.matchTriggerDateEvent}: expected one match, found ${matches.length}`);
    }
    applyReviewFields(matches[0], item, `review date trap ${item.matchTriggerDateEvent}`);
  }
  return register;
}

function parseArgs(argv) {
  const options = { seed: false, check: false };
  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];
    if (arg === "--seed") options.seed = true;
    else if (arg === "--check") options.check = true;
    else if (["--register", "--corpus", "--date", "--review"].includes(arg)) {
      if (!argv[index + 1]) throw new Error(`${arg} requires a value`);
      options[arg.slice(2)] = argv[++index];
    } else throw new Error(`unknown argument: ${arg}`);
  }
  return options;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.review && options.check) throw new Error("--review cannot be combined with --check");
  if (options.review && options.seed) throw new Error("--review cannot be combined with --seed");
  const registerPath = path.resolve(options.register ?? DEFAULT_REGISTER);
  const corpusDir = path.resolve(options.corpus ?? DEFAULT_CORPUS);
  const register = JSON.parse(readFileSync(registerPath, "utf8"));
  const result = updateRegister(register, caseFileHashes(corpusDir), { seed: options.seed, date: options.date });
  for (const item of result.missingCases) {
    console.warn(`[register-helper] WARN ${item.entry}: missing case ${item.id}; historical missing hashes never block`);
  }
  for (const id of result.reopened) console.log(`[register-helper] REOPEN ${id}: member content changed`);
  if (options.review) {
    if (result.reopened.length > 0) throw new Error("cannot apply a review while member changes are unstamped");
    applyRegisterReview(result.register, JSON.parse(readFileSync(path.resolve(options.review), "utf8")));
    result.changed = true;
  }
  if (options.check) {
    console.log(`[register-helper] ${result.changed ? "changes required" : "up to date"}`);
    if (result.changed) process.exitCode = 1;
    return;
  }
  if (result.changed) writeFileAtomic(registerPath, `${JSON.stringify(result.register, null, 2)}\n`);
  console.log(`[register-helper] ${result.changed ? "updated" : "up to date"}; ${result.reopened.length} reopened`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try { main(); }
  catch (error) { console.error(`[register-helper] ERROR: ${error.message}`); process.exitCode = 1; }
}
