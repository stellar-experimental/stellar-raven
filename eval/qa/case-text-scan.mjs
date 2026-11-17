#!/usr/bin/env node
/**
 * Case-text scan: counts the golden-answer text that a tracked file outside the `.ignore` paths
 * repeats, so a record cannot quietly copy it (eval/qa/README.md, "Held-out split").
 *
 * A shingle is 8 consecutive normalized words from a battery case's `golden` or `truth.notes`.
 * Only shingles that occur in at most two cases count, so shared public phrasing stays out. The
 * scan reads `git ls-files -co --exclude-standard`, skips the paths the three `.ignore` files list,
 * and prints paths and counts only, never text.
 *
 *   node eval/qa/case-text-scan.mjs            # every file at or above the floor
 *   node eval/qa/case-text-scan.mjs --check    # compare with case-text-baseline.json; exit 1 on a breach
 *
 * The 50-shingle floor guards against bulk copies. A short quote passes it; the repository rule
 * (cite the case id and field, never quote judge-facing text) is what covers those.
 */
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { loadEntries } from "../../scripts/agent-hooks/case-search-guard.mjs";

export const SHINGLE_WORDS = 8;
export const MAX_CASES_PER_SHINGLE = 2;
export const FLOOR = 50;
const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "..", "..");
export const BASELINE_PATH = join(HERE, "case-text-baseline.json");

const words = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim().split(" ").filter(Boolean);
const strings = (value, out = []) => {
  if (typeof value === "string") out.push(value);
  else if (value && typeof value === "object") for (const item of Object.values(value)) strings(item, out);
  return out;
};
const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });

/** Shingles found in at most MAX_CASES_PER_SHINGLE battery cases: Set of shingle keys. */
export function caseShingles(repo) {
  const owners = new Map();
  let cases = 0;
  for (const file of walk(join(repo, "eval/qa/corpus/battery")).filter((path) => path.endsWith(".json"))) {
    const kase = JSON.parse(readFileSync(file, "utf8"));
    cases++;
    for (const text of [kase.golden, kase.truth?.notes].flatMap((value) => strings(value))) {
      const tokens = words(text);
      for (let i = 0; i + SHINGLE_WORDS <= tokens.length; i++) {
        const key = tokens.slice(i, i + SHINGLE_WORDS).join(" ");
        if (!owners.has(key)) owners.set(key, new Set());
        owners.get(key).add(kase.id);
      }
    }
  }
  return { cases, shingles: new Set([...owners].filter(([, ids]) => ids.size <= MAX_CASES_PER_SHINGLE).map(([key]) => key)) };
}

/** Files outside the `.ignore` paths with at least one case shingle: [{ path, shingles }], by count. */
export function scanCaseText(repo = REPO) {
  const { cases, shingles } = caseShingles(repo);
  const skipped = loadEntries(repo).map((entry) => entry.path);
  const listed = execFileSync("git", ["-C", repo, "ls-files", "-co", "--exclude-standard"], { encoding: "utf8", maxBuffer: 1 << 28 })
    .split("\n")
    .filter(Boolean);
  const rows = [];
  for (const path of listed) {
    const absolute = join(repo, path);
    if (skipped.some((entry) => absolute === entry || absolute.startsWith(`${entry}${sep}`))) continue;
    let text;
    try {
      text = readFileSync(absolute, "utf8");
    } catch {
      continue;
    }
    if (text.includes("\u0000")) continue;
    const tokens = words(text);
    const seen = new Set();
    for (let i = 0; i + SHINGLE_WORDS <= tokens.length; i++) {
      const key = tokens.slice(i, i + SHINGLE_WORDS).join(" ");
      if (shingles.has(key)) seen.add(key);
    }
    if (seen.size > 0) rows.push({ path: relative(repo, absolute).split(sep).join("/"), shingles: seen.size });
  }
  return { cases, rows: rows.sort((a, b) => b.shingles - a.shingles || a.path.localeCompare(b.path)) };
}

/** A ceiling for a file measured at `count`: headroom for a corpus edit that shifts the counts. */
export const ceilingFor = (count) => count + Math.max(10, Math.ceil(count * 0.25));

export const BREACH_HELP =
  "Cite the case id and field instead of quoting golden text, and never print the matched text. " +
  "If a corpus edit raised a listed count, raise its ceiling in eval/qa/case-text-baseline.json and add a `reason`.";

/** Breaches of the baseline, as paths and counts only. */
export function baselineBreaches(rows, baseline) {
  const counts = new Map(rows.map((row) => [row.path, row.shingles]));
  const listed = new Map(baseline.files.map((file) => [file.path, file]));
  const breaches = [];
  for (const row of rows) {
    if (row.shingles < baseline.floor) continue;
    const entry = listed.get(row.path);
    if (!entry) breaches.push(`${row.path}: ${row.shingles} golden shingles, floor ${baseline.floor}, not in the baseline`);
    else if (row.shingles > entry.ceiling) breaches.push(`${row.path}: ${row.shingles} golden shingles, above its ceiling ${entry.ceiling}`);
  }
  for (const entry of baseline.files) {
    if (!counts.has(entry.path)) {
      breaches.push(`${entry.path}: listed in the baseline but absent or clean; remove the entry`);
    }
  }
  return breaches;
}

function main() {
  const { cases, rows } = scanCaseText();
  if (process.argv.includes("--check")) {
    const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
    const breaches = baselineBreaches(rows, baseline);
    console.log(`case-text scan: ${cases} battery cases, ${rows.length} files with case shingles, ${breaches.length} breaches`);
    for (const breach of breaches) console.log(`  ${breach}`);
    if (breaches.length) console.log(BREACH_HELP);
    process.exitCode = breaches.length ? 1 : 0;
    return;
  }
  console.log(`battery cases=${cases} shingle=${SHINGLE_WORDS} words, files with case shingles=${rows.length}`);
  for (const row of rows.filter((r) => r.shingles >= FLOOR)) console.log(`${row.shingles}\t${row.path}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
