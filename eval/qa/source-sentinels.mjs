#!/usr/bin/env node
/**
 * Golden source sentinels: re-read a golden's own primary source and test one anchor.
 *
 * Each sentinel in eval/qa/source-sentinels.json names a battery case, the case's
 * `truth.asOf` when the anchor was written (`caseAsOf`), a primary-source URL, and a check:
 *   present  the pattern still matches (the source still states the golden's value)
 *   absent   the pattern still does not match (a roadmap item has not shipped)
 *   count    the pattern matches exactly `count` times (a roster still has N rows)
 * A check that can hold on an empty page (absent, or a count of 0) also names a `guard`: a
 * pattern that must match before the page counts as read. A failed check is `drift`: a trigger
 * that queues the case for golden-truth re-verification, never evidence for a gospel change.
 * The method and its trial are recorded in
 * research/audits/2026-11-02-golden-freshness-probe/README.md.
 *
 *   node eval/qa/source-sentinels.mjs --check                offline: schema, cases, caseAsOf
 *   node eval/qa/source-sentinels.mjs [--ids a,b]            live run; prints a table
 *   node eval/qa/source-sentinels.mjs --report <file.md> [--previous <issue-body.md>]
 *                                                            live run; writes the issue report
 *
 * A live table run also reads stale sentinels, so an author can re-confirm an anchor before
 * updating caseAsOf. Report mode lists a stale sentinel as unread instead: its anchor is not
 * confirmed for the case's current truth. With --previous, a sentinel that drifted in the
 * previous report and is unreadable now stays in the drift set, so a flaky source cannot churn
 * the issue. Report mode prints `drift=<n>`, `errors=<n>`, and `fingerprint=<sha256>` lines for
 * $GITHUB_OUTPUT. The run exits 2 when every fetch fails, so an outage can never close the
 * sentinel issue as clean.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DEFAULT_SENTINELS = path.join(ROOT, "eval/qa/source-sentinels.json");
const BATTERY_DIR = path.join(ROOT, "eval/qa/corpus/battery");

export const SCHEMA = "qa-source-sentinels-v1";
export const MARKER = "golden-sentinels-report";
const ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const KINDS = new Set(["present", "absent", "count"]);
const USER_AGENT = "Mozilla/5.0 (compatible; raven-golden-sentinel; +https://github.com/stellar-experimental/stellar-raven)";
const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** Map case id -> { asOf, state } across the battery. */
export function loadBatteryCases(dir = BATTERY_DIR) {
  const cases = new Map();
  for (const category of readdirSync(dir)) {
    for (const file of readdirSync(path.join(dir, category))) {
      if (!file.endsWith(".json")) continue;
      const doc = JSON.parse(readFileSync(path.join(dir, category, file), "utf8"));
      cases.set(doc.id, { asOf: doc.truth?.asOf ?? null, state: doc.truth?.lifecycle?.state ?? null });
    }
  }
  return cases;
}

/**
 * Validate the sentinel document against the battery.
 * `stale` lists sentinels whose caseAsOf differs from the case's truth.asOf: the case was
 * re-verified, so its anchor must be re-confirmed and caseAsOf updated in the same change.
 */
export function validateSentinels(doc, cases) {
  const problems = [];
  const stale = [];
  if (doc?.schema !== SCHEMA) problems.push(`schema must be "${SCHEMA}"`);
  if (!Array.isArray(doc?.sentinels) || doc.sentinels.length === 0) {
    problems.push("sentinels must be a non-empty array");
    return { problems, stale };
  }
  const seen = new Set();
  for (const [index, s] of doc.sentinels.entries()) {
    const where = `sentinels[${index}]${s?.id ? ` (${s.id})` : ""}`;
    if (typeof s?.id !== "string" || !ID_RE.test(s.id)) problems.push(`${where}: id must be kebab-case`);
    else if (seen.has(s.id)) problems.push(`${where}: duplicate id`);
    else seen.add(s.id);

    const target = cases.get(s?.caseId);
    if (!target) problems.push(`${where}: caseId ${JSON.stringify(s?.caseId)} is not a battery case`);
    else if (!["active", "quarantined"].includes(target.state)) problems.push(`${where}: case is ${target.state}`);
    if (typeof s?.caseAsOf !== "string" || !DATE_RE.test(s.caseAsOf)) problems.push(`${where}: caseAsOf must be YYYY-MM-DD`);
    else if (target && target.asOf !== s.caseAsOf) stale.push(s.id);

    let url;
    try {
      url = new URL(s?.url);
    } catch {
      problems.push(`${where}: url must be an absolute URL`);
    }
    if (url && url.protocol !== "https:") problems.push(`${where}: url must use https`);
    if (url && isCommitPinned(url)) problems.push(`${where}: a commit-pinned URL cannot drift`);

    const check = s?.check ?? {};
    if (!KINDS.has(check.kind)) problems.push(`${where}: check.kind must be present, absent, or count`);
    if (check.flags !== undefined && !/^[imsu]*$/.test(check.flags)) problems.push(`${where}: check.flags may use only i, m, s, u`);
    try {
      new RegExp(check.pattern, `g${check.flags ?? ""}`);
      if (typeof check.pattern !== "string" || check.pattern.length === 0) throw new Error("empty");
    } catch {
      problems.push(`${where}: check.pattern must be a non-empty valid regular expression`);
    }
    if (check.kind === "count" && !(Number.isInteger(check.count) && check.count >= 0)) {
      problems.push(`${where}: a count check needs a non-negative integer count`);
    }
    if (check.kind !== "count" && check.count !== undefined) problems.push(`${where}: count applies only to a count check`);
    if (check.guard !== undefined) {
      try {
        if (typeof check.guard !== "string" || check.guard.length === 0) throw new Error("empty");
        new RegExp(check.guard, check.flags ?? "");
      } catch {
        problems.push(`${where}: check.guard must be a non-empty valid regular expression`);
      }
    } else if (check.kind === "absent" || (check.kind === "count" && check.count === 0)) {
      problems.push(`${where}: a check that holds on an empty page needs a guard pattern`);
    }
  }
  return { problems, stale };
}

/** A source pinned to a commit SHA never changes, so a sentinel on it cannot drift. */
function isCommitPinned(url) {
  if (url.hostname === "github.com") return /^\/[^/]+\/[^/]+\/(?:blob|tree)\/[0-9a-f]{40}(?:\/|$)/i.test(url.pathname);
  if (url.hostname === "raw.githubusercontent.com") return /^\/[^/]+\/[^/]+\/[0-9a-f]{40}\//i.test(url.pathname);
  return false;
}

/** GitHub blob URLs read the raw file; other URLs are fetched as given, without the fragment. */
export function fetchUrl(url) {
  const m = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/([^#?]+)/);
  if (m) return `https://raw.githubusercontent.com/${m[1]}/${m[2]}/${m[3]}/${m[4]}`;
  return url.split("#")[0];
}

/**
 * Reduce HTML, Markdown, and JSON bodies to one comparable text: decode JSON escapes so
 * server-rendered payloads read as text, drop tag-shaped spans from HTML only (JSON and
 * Markdown carry literal `<T>` text), decode entities, and collapse whitespace.
 */
const fromCodePoint = (code, entity) => (Number.isInteger(code) && code <= 0x10ffff ? String.fromCodePoint(code) : entity);

export function normalize(body, { html = true } = {}) {
  const decoded = body
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\"/g, '"');
  return (html ? decoded.replace(/<!--[\s\S]*?-->/g, " ").replace(/<\/?[a-zA-Z][^<>]*>/g, " ") : decoded)
    .replace(/&#(\d+);/g, (entity, dec) => fromCodePoint(Number(dec), entity))
    .replace(/&#x([0-9a-f]+);/gi, (entity, hex) => fromCodePoint(parseInt(hex, 16), entity))
    .replace(/&([a-z]+);/gi, (entity, name) => ENTITIES[name.toLowerCase()] ?? entity)
    .replace(/[\s\u200b]+/g, " ");
}

/** Apply one check to normalized text. A failed guard means the page did not load as expected. */
export function evaluate(check, text) {
  if (check.guard !== undefined && !new RegExp(check.guard, check.flags ?? "").test(text)) {
    return { verdict: "error", detail: "guard did not match: the source content was not recognized" };
  }
  const matches = [...text.matchAll(new RegExp(check.pattern, `g${check.flags ?? ""}`))].length;
  const hold =
    check.kind === "present" ? matches > 0 : check.kind === "absent" ? matches === 0 : matches === check.count;
  return { verdict: hold ? "hold" : "drift", matches };
}

async function fetchText(url, fetchImpl) {
  const headers = { "User-Agent": USER_AGENT };
  if (url.startsWith("https://api.github.com/")) {
    headers.Accept = "application/vnd.github+json";
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  let lastError;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetchImpl(url, { headers, redirect: "follow", signal: AbortSignal.timeout(25_000) });
      if (res.ok) return normalize(await res.text(), { html: /html/i.test(res.headers.get("content-type") ?? "") });
      lastError = new Error(`HTTP ${res.status}`);
      if (res.status < 500 && res.status !== 429) break;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

/**
 * Fetch each distinct URL once, then evaluate every sentinel against its page. Sentinels whose
 * id is in `unread` are not fetched; each becomes an error with the given detail.
 */
export async function runSentinels(sentinels, fetchImpl = fetch, unread = new Map()) {
  const pages = new Map();
  for (const url of new Set(sentinels.filter((s) => !unread.has(s.id)).map((s) => fetchUrl(s.url)))) {
    pages.set(url, fetchText(url, fetchImpl).then((text) => ({ text }), (error) => ({ error: String(error?.message ?? error) })));
  }
  const results = [];
  for (const s of sentinels) {
    const base = { id: s.id, caseId: s.caseId, url: s.url, kind: s.check.kind, expectedCount: s.check.count };
    if (unread.has(s.id)) {
      results.push({ ...base, verdict: "error", detail: unread.get(s.id) });
      continue;
    }
    const page = await pages.get(fetchUrl(s.url));
    results.push(page.error ? { ...base, verdict: "error", detail: page.error } : { ...base, ...evaluate(s.check, page.text) });
  }
  return results;
}

/** Read the drift set (id -> matches) from a previous report's first line; empty when absent. */
export function previousDrift(markdown) {
  const line = (markdown ?? "").split("\n", 1)[0];
  const m = line.match(new RegExp(`^<!-- ${MARKER} fingerprint=[0-9a-f]{64} drift=([^ ]*) -->$`));
  const drift = new Map();
  for (const entry of m?.[1] ? m[1].split(",") : []) {
    const [id, matches] = entry.split(":");
    if (ID_RE.test(id) && /^\d+$/.test(matches)) drift.set(id, Number(matches));
  }
  return drift;
}

/**
 * Keep a previously drifted sentinel in the drift set while its source is unreadable: an
 * unread page proves nothing, so it must not silently drop a case from the issue.
 */
export function carryDrift(results, previous) {
  return results.map((r) =>
    r.verdict === "error" && previous.has(r.id)
      ? { ...r, verdict: "drift", matches: previous.get(r.id), carried: true }
      : r
  );
}

/** Deterministic Markdown report; the fingerprint covers only the drift set. */
export function renderReport(results, commit = "") {
  const drift = results.filter((r) => r.verdict === "drift").sort((a, b) => a.id.localeCompare(b.id));
  const errors = results.filter((r) => r.verdict === "error").sort((a, b) => a.id.localeCompare(b.id));
  const fingerprint = createHash("sha256")
    .update(JSON.stringify(drift.map((r) => [r.id, r.matches])))
    .digest("hex");
  const describe = (r) =>
    (r.kind === "count" ? `expected ${r.expectedCount} matches, found ${r.matches}` : r.kind === "present" ? "anchor no longer matches" : `anchor now matches ${r.matches} times`) +
    (r.carried ? ` (previous run; unreadable now: ${r.detail})` : "");
  const lines = [
    `<!-- ${MARKER} fingerprint=${fingerprint} drift=${drift.map((r) => `${r.id}:${r.matches}`).join(",")} -->`,
    "# Golden source sentinels drifted",
    "",
    `${drift.length} of ${results.length} sentinels drifted${commit ? ` at commit \`${commit}\`` : ""}.`,
    "A drift is a re-verification trigger, not evidence. Run each named case through the `golden-truth` skill.",
    "When the fact still holds and only the wording changed, re-author the anchor in `eval/qa/source-sentinels.json`.",
    "",
    "| Sentinel | Case | Source | Result |",
    "| --- | --- | --- | --- |",
    ...drift.map((r) => `| \`${r.id}\` | \`${r.caseId}\` | ${r.url} | ${describe(r)} |`)
  ];
  if (errors.length) {
    lines.push("", `${errors.length} sentinels could not be read on this run:`, "");
    for (const r of errors) lines.push(`- \`${r.id}\`: ${r.detail}`);
  }
  return { markdown: `${lines.join("\n")}\n`, fingerprint, drift: drift.length, errors: errors.length };
}

function parseArgs(argv) {
  const opts = { check: false, sentinels: DEFAULT_SENTINELS, ids: null, report: null, previous: null, commit: "" };
  for (let i = 0; i < argv.length; i++) {
    const flag = argv[i];
    const value = () => {
      const v = argv[++i];
      if (v === undefined || v.startsWith("--")) throw new Error(`${flag} needs a value`);
      return v;
    };
    if (flag === "--check") opts.check = true;
    else if (flag === "--sentinels") opts.sentinels = path.resolve(value());
    else if (flag === "--ids") opts.ids = new Set(value().split(","));
    else if (flag === "--report") opts.report = path.resolve(value());
    else if (flag === "--previous") opts.previous = path.resolve(value());
    else if (flag === "--commit") opts.commit = value();
    else throw new Error(`unknown flag ${flag}`);
  }
  return opts;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const doc = JSON.parse(readFileSync(opts.sentinels, "utf8"));
  const { problems, stale } = validateSentinels(doc, loadBatteryCases());
  for (const problem of problems) console.error(`error: ${problem}`);
  for (const id of stale) {
    console.error(`stale sentinel: ${id}. Its case was re-verified: re-confirm the anchor live, then set caseAsOf to the case's truth.asOf.`);
  }
  if (opts.check) {
    console.error(`${doc.sentinels?.length ?? 0} sentinels; ${problems.length} errors; ${stale.length} stale`);
    process.exit(problems.length || stale.length ? 1 : 0);
  }
  if (problems.length) process.exit(1);

  if (opts.ids) for (const id of opts.ids) if (!doc.sentinels.some((s) => s.id === id)) throw new Error(`unknown sentinel id ${id}`);
  const selected = doc.sentinels.filter((s) => !opts.ids || opts.ids.has(s.id));
  const unread = new Map(
    opts.report ? stale.map((id) => [id, "stale: the case was re-verified; re-confirm the anchor and update caseAsOf"]) : []
  );
  let results = await runSentinels(selected, fetch, unread);

  if (opts.report) {
    if (opts.previous) results = carryDrift(results, previousDrift(existsSync(opts.previous) ? readFileSync(opts.previous, "utf8") : ""));
    const report = renderReport(results, opts.commit);
    writeFileSync(opts.report, report.markdown);
    console.log(`drift=${report.drift}`);
    console.log(`errors=${report.errors}`);
    console.log(`fingerprint=${report.fingerprint}`);
  } else {
    const order = { drift: 0, error: 1, hold: 2 };
    for (const r of [...results].sort((a, b) => order[a.verdict] - order[b.verdict] || a.id.localeCompare(b.id))) {
      const note = stale.includes(r.id) ? " (stale caseAsOf)" : "";
      console.log(`${r.verdict.padEnd(5)} ${r.id.padEnd(34)} ${r.caseId.padEnd(44)} ${r.detail ?? `matches=${r.matches}`}${note}`);
    }
  }
  if (results.length && results.every((r) => r.verdict === "error" && !unread.has(r.id))) process.exit(2);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
