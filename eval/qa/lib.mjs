/**
 * Shared helpers for the golden Q→A accuracy eval (eval/qa/*).
 *
 * Kept dependency-free (plain Node ≥ 18). Everything deterministic lives here
 * so compile-qa.mjs and run-qa.mjs sample identically.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

export const QA_DIR = path.dirname(fileURLToPath(import.meta.url));
export const CASES_PATH = path.join(QA_DIR, "cases.json");
export const SAMPLE_PATH = path.join(QA_DIR, "sample.json");

export const QA_CATEGORIES = new Set([
  "protocol-core",
  "soroban",
  "tooling-infra",
  "assets-anchors-seps",
  "defi-ecosystem",
  "scf-grants-builders",
  "compliance-rwa-payments",
  "history-org-tokenomics",
  "retail-consumer",
  "edge-behavior"
]);
export const QA_SERVICES = new Set(["stellarDocs", "scout", "lumenloop", "skills", "none"]);

/** corpus expected_service → our catalog namespace (same map as eval/routing-cases.json) */
export const SERVICE_MAP = {
  stellar_docs: "stellarDocs",
  stellar_light: "scout",
  lumenloop: "lumenloop",
  skills: "skills",
  none: "none"
};

export function loadCases(casesPath = CASES_PATH) {
  const parsed = JSON.parse(readFileSync(casesPath, "utf8"));
  if (!Array.isArray(parsed.cases)) throw new Error(`${casesPath}: missing cases[]`);
  return parsed;
}

/**
 * Deterministic stratified sample: strata = tags.service (traps live in the
 * "none" stratum plus their home service), proportional allocation with a
 * minimum of 1 per non-empty stratum, even-spaced picks over id-sorted strata.
 * Same N in → same cases out, always.
 */
export function stratifiedSample(cases, n) {
  if (!Number.isInteger(n) || n <= 0) throw new Error(`--sample must be a positive integer, got ${n}`);
  if (n >= cases.length) return [...cases].sort((a, b) => a.id.localeCompare(b.id));

  const strata = new Map();
  for (const c of cases) {
    const key = c.tags.service;
    if (!strata.has(key)) strata.set(key, []);
    strata.get(key).push(c);
  }
  const keys = [...strata.keys()].sort();
  for (const k of keys) strata.get(k).sort((a, b) => a.id.localeCompare(b.id));

  // proportional allocation (largest-remainder), min 1 per stratum while n allows
  const total = cases.length;
  const alloc = new Map();
  let assigned = 0;
  const remainders = [];
  for (const k of keys) {
    const exact = (strata.get(k).length / total) * n;
    const base = Math.floor(exact);
    alloc.set(k, base);
    assigned += base;
    remainders.push({ k, r: exact - base });
  }
  remainders.sort((a, b) => b.r - a.r || a.k.localeCompare(b.k));
  for (let i = 0; assigned < n && i < remainders.length; i++, assigned++) {
    alloc.set(remainders[i].k, alloc.get(remainders[i].k) + 1);
  }
  // minimums: give every non-empty stratum ≥1 by stealing from the largest allocations
  for (const k of keys) {
    if (alloc.get(k) === 0 && strata.get(k).length > 0) {
      const donor = keys.reduce((best, x) => (alloc.get(x) > alloc.get(best) ? x : best), keys[0]);
      if (alloc.get(donor) > 1) {
        alloc.set(donor, alloc.get(donor) - 1);
        alloc.set(k, 1);
      }
    }
  }

  const picked = [];
  for (const k of keys) {
    const pool = strata.get(k);
    const want = Math.min(alloc.get(k), pool.length);
    if (want <= 0) continue;
    const step = pool.length / want;
    for (let i = 0; i < want; i++) picked.push(pool[Math.floor(i * step)]);
  }
  return picked.sort((a, b) => a.id.localeCompare(b.id));
}

/** Tally verdict rows into { overall, byCategory, byService, traps } summary. */
export function summarize(rows) {
  const bucket = () => ({ correct: 0, partial: 0, wrong: 0, error: 0, total: 0 });
  const add = (b, score) => {
    b.total++;
    b[score in b ? score : "error"]++;
  };
  const overall = bucket();
  const byCategory = {};
  const byService = {};
  const traps = bucket();
  for (const row of rows) {
    const score = row.verdict?.score ?? "error";
    add(overall, score);
    const cat = row.tags?.category ?? "unknown";
    (byCategory[cat] ??= bucket());
    add(byCategory[cat], score);
    const svc = row.tags?.service ?? "unknown";
    (byService[svc] ??= bucket());
    add(byService[svc], score);
    if (row.tags?.trap) add(traps, score);
  }
  return { overall, byCategory, byService, traps };
}

export function formatSummaryTable(summary, { includeTraps = true } = {}) {
  const line = (label, b) =>
    `${label.padEnd(26)} ${String(b.correct).padStart(3)} correct  ${String(b.partial).padStart(3)} partial  ${String(b.wrong).padStart(3)} wrong  ${String(b.error).padStart(2)} error  / ${b.total}`;
  const out = [line("OVERALL", summary.overall)];
  out.push("-- by service --");
  for (const [k, b] of Object.entries(summary.byService).sort()) out.push(line(k, b));
  out.push("-- by category --");
  for (const [k, b] of Object.entries(summary.byCategory).sort()) out.push(line(k, b));
  if (includeTraps && summary.traps.total > 0) {
    out.push("-- trap handling --");
    out.push(line("traps (all kinds)", summary.traps));
  }
  return out.join("\n");
}

/** Extract the first top-level JSON object from LLM text output. */
export function extractJsonObject(text) {
  if (typeof text !== "string") return null;
  const start = text.indexOf("{");
  if (start === -1) return null;
  for (let end = text.length; end > start; end--) {
    const candidate = text.slice(start, end);
    if (!candidate.endsWith("}")) continue;
    try {
      return JSON.parse(candidate);
    } catch {
      /* keep shrinking */
    }
  }
  return null;
}
