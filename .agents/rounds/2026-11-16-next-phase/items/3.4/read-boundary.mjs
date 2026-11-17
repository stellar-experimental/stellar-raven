#!/usr/bin/env node
/**
 * Item 3.4: the `execute` boundary read. Reads the output of select-tuning.mjs (tuning rows only)
 * and reports, with no model call and no network:
 *   - sizes: `execute` results, results truncated at 24,000, original value over 16,000 / 18,000 /
 *     24,000 (results, units, rows), value characters a cut removes;
 *   - candidates: facts the stored answer or a later script uses that sit only past a cut;
 *   - the Grok 20,000-byte clip fit table and the candidates a 20,000-byte head clip loses today;
 *   - R(C), when a classes file supplies the reader's class for every candidate.
 *
 * Usage (repository root as working directory; acorn resolves from there):
 *   node read-boundary.mjs <selected-dir> [--classes <classes.json>] [--candidates <out.json>]
 *                          [--surface src/mcp/tools.ts]
 *
 * A unit is one (run, row). Row ids printed are tuning ids only. The matching rules are the plan's
 * step 3: raw-offset cut first, JSON escapes decoded per region, an occurrence kept only when it
 * ends at or before the cut, case-insensitive, numbers at digit boundaries, commas removed only
 * inside digit groups, dates normalized to ISO.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { parseArgs } from "node:util";

const { parse, parseExpressionAt } = createRequire(path.join(process.cwd(), "package.json"))("acorn");

const { values: opt, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    classes: { type: "string" },
    candidates: { type: "string" },
    surface: { type: "string", default: "src/mcp/tools.ts" }
  }
});
const [selectedDir] = positionals;
if (!selectedDir) {
  console.error("usage: node read-boundary.mjs <selected-dir> [--classes <classes.json>] [--candidates <out.json>]");
  process.exit(2);
}

const CUTS = [16000, 18000];
const STORED_MAX = 24000;
const GROK_BYTES = 20000;
const MANIFEST_BOUND = 1600;
/** The two runs that carry the identifier pointer, which did not ship. */
const POINTER_RUNS = new Set(["2026-11-15T08-55-41", "2026-11-15T09-08-35"]);

// ---- result layout --------------------------------------------------------------------------

const HEADER =
  /\n--- (?:SOURCE BASIS|SOURCE METADATA|EVIDENCE RECOVERY|SERVICE ERRORS|INCONCLUSIVE SERVICE OUTCOMES|CANDIDATE EVIDENCE|PRIOR-ART CANDIDATES|EVIDENCE CHECKPOINT) ---|\n--- console \(/;

/** Splits a stored `execute` result into the value text and the host blocks. */
function parseResult(entry) {
  const text = entry.result;
  const at = text.search(HEADER);
  const value = at < 0 ? text : text.slice(0, at);
  const host = at < 0 ? "" : text.slice(at);
  const truncated = host.startsWith("\n--- SOURCE BASIS ---");
  let origLen = value.length;
  if (truncated) {
    const m = /shape: [^;]*; ([\d,]+) chars/.exec(host);
    if (!m) throw new Error("truncated result without a shape line");
    origLen = Number(m[1].replace(/,/g, ""));
    if (value.length !== STORED_MAX) throw new Error(`truncated value is ${value.length} characters, not ${STORED_MAX}`);
  }
  return { text, value, host, truncated, origLen, isError: entry.isError === true };
}

const bytes = (s) => Buffer.byteLength(s, "utf8");

// ---- text normalization ---------------------------------------------------------------------

const ESCAPES = { '"': '"', "\\": "\\", "/": "/", b: "\b", f: "\f", n: "\n", r: "\r", t: "\t" };
/** Decodes JSON string escapes in one pass (a cut may leave a partial escape, which stays as is). */
const decode = (s) =>
  s.replace(/\\(u[0-9a-fA-F]{4}|["\\/bfnrt])/g, (_, e) => (e[0] === "u" ? String.fromCharCode(parseInt(e.slice(1), 16)) : ESCAPES[e]));

const MONTHS = {
  january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3, april: 4, apr: 4, may: 5, june: 6, jun: 6,
  july: 7, jul: 7, august: 8, aug: 8, september: 9, sep: 9, sept: 9, october: 10, oct: 10, november: 11,
  nov: 11, december: 12, dec: 12
};
const MONTH_RE = Object.keys(MONTHS).sort((a, b) => b.length - a.length).join("|");
const iso = (y, m, d) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const normDates = (s) =>
  s
    .replace(new RegExp(`\\b(${MONTH_RE})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?,?\\s+(\\d{4})\\b`, "g"), (_, m, d, y) => iso(y, MONTHS[m], d))
    .replace(new RegExp(`\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(${MONTH_RE})\\.?,?\\s+(\\d{4})\\b`, "g"), (_, d, m, y) => iso(y, MONTHS[m], d));
/** Lowercase, dates to ISO, commas removed only inside digit groups. */
const norm = (s) => normDates(s.toLowerCase()).replace(/(?<!\d)\d{1,3}(?:,\d{3})+(?!\d)/g, (m) => m.replace(/,/g, ""));

const NUMERIC = /^\d[\d.]*$/;
/** Start offsets of `needle` in `hay`; a numeric needle matches only at digit boundaries. */
function occurrences(hay, needle) {
  const out = [];
  if (!needle) return out;
  if (NUMERIC.test(needle)) {
    const re = new RegExp(`(?<!\\d|\\d\\.)${needle.replace(/\./g, "\\.")}(?!\\d|\\.\\d)`, "g");
    for (const m of hay.matchAll(re)) out.push(m.index);
  } else {
    let i = -1;
    while ((i = hay.indexOf(needle, i + 1)) >= 0) out.push(i);
  }
  return out;
}

// ---- candidates from the answer -------------------------------------------------------------

/** Candidate texts of the stored answer (plan step 5, answer side), keyed by normalized text. */
function answerCandidates(answer) {
  const found = new Map();
  const add = (text, kind) => {
    const key = norm(text.trim());
    if (key && !found.has(key)) found.set(key, { text: text.trim(), kind });
  };
  for (const m of answer.matchAll(/https?:\/\/[^\s)\]>"'`]+/g)) add(m[0].replace(/[.,;:!?*]+$/, ""), "url");
  for (const m of normDates(answer.toLowerCase()).matchAll(/\b\d{4}-\d{2}-\d{2}\b/g)) add(m[0], "date");
  for (const m of answer.matchAll(/(?<![\w.])v?\d+(?:\.\d+){2,}(?:[-+][\w.]+)?(?![\w])/g)) add(m[0].replace(/^v/, ""), "version");
  for (const m of answer.matchAll(/(?<![\w.])\d[\d,]*(?:\.\d+)?(?![\w]|\.\d)/g)) {
    const v = m[0].replace(/(?<=\d),(?=\d{3})/g, "").replace(/[,]+$/, "");
    if (v.replace(/\D/g, "").length >= 3 && !/^(199\d|20[0-3]\d)$/.test(v)) add(v, "number");
  }
  for (const m of answer.matchAll(/`([^`\n]{4,})`/g)) add(m[1], "backtick");
  for (const m of answer.matchAll(/\*\*([^*\n]{3,})\*\*/g)) add(m[1], "bold");
  for (const m of answer.matchAll(/\[([^\]\n]{3,})\]\(/g)) add(m[1], "link");
  for (const m of answer.matchAll(/\b[GCMS][A-Z2-7]{55}\b/g)) add(m[0], "strkey");
  for (const m of answer.matchAll(/\b[0-9a-fA-F]{8,}\b/g)) add(m[0], "hex");
  return found;
}

// ---- candidates from the tail ---------------------------------------------------------------

const TOKEN = /[A-Za-z0-9_][A-Za-z0-9_.-]*[A-Za-z0-9_]|[A-Za-z0-9]/g;
const CAP_RUN = /\b[A-Z][a-z]+(?: [A-Z][a-z]+)+\b/g;
/** Distinctive tokens of the decoded text ending after `from`: a digit, a capital, or 8+ characters. */
function tailTokens(full, from) {
  const out = new Set();
  for (const m of full.matchAll(TOKEN)) {
    if (m.index + m[0].length <= from) continue;
    const t = m[0].replace(/[.-]+$/, "");
    if (/\d/.test(t) || /^[A-Z]/.test(t) || t.length >= 8) out.add(t);
  }
  for (const m of full.matchAll(CAP_RUN)) if (m.index + m[0].length > from) out.add(m[0]);
  return out;
}

// ---- later-script literals ------------------------------------------------------------------

function parseScript(code) {
  const options = { ecmaVersion: "latest", sourceType: "module", allowAwaitOutsideFunction: true, allowReturnOutsideFunction: true };
  try {
    return parse(code, options);
  } catch {
    try {
      const node = parseExpressionAt(code, 0, options);
      const rest = code.slice(node.end);
      return parse(rest, options).body.every((n) => n.type === "EmptyStatement") ? node : null;
    } catch {
      return null;
    }
  }
}
function walk(node, visit) {
  if (!node || typeof node.type !== "string") return;
  visit(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) for (const item of value) walk(item, visit);
    else if (value && typeof value === "object" && typeof value.type === "string") walk(value, visit);
  }
}
const scriptOf = (entry) => {
  try {
    return JSON.parse(entry.input).code ?? "";
  } catch {
    return typeof entry.input === "string" ? entry.input : "";
  }
};
/** String literals and static template parts of a script, 4 to 300 characters, one line. */
function scriptLiterals(code) {
  const ast = parseScript(code);
  if (!ast) return null;
  const out = new Set();
  walk(ast, (node) => {
    let v = null;
    if (node.type === "Literal" && typeof node.value === "string") v = node.value;
    else if (node.type === "TemplateElement") v = node.value.cooked;
    if (v && v.length >= 4 && v.length <= 300 && !v.includes("\n")) out.add(v);
  });
  return [...out];
}

// ---- one unit under one view of the boundary ------------------------------------------------

const staticSurface = (() => {
  const src = readFileSync(opt.surface, "utf8");
  const from = src.indexOf("export const SEARCH_DESCRIPTION");
  const to = src.indexOf("export const SERVER_INSTRUCTIONS =");
  if (from < 0 || to < 0) throw new Error("surface markers not found in " + opt.surface);
  return src.slice(from, to).replace(/\\`/g, "`");
})();

function searchText(entry) {
  const p = entry.resultProjection;
  if (!p) return "";
  const ids = (p.hits ?? []).map((h) => h.id).join("\n");
  const next = typeof p.nextSteps === "string" ? p.nextSteps : JSON.stringify(p.nextSteps ?? "");
  return `${ids}\n${next}`;
}

/** The view of one stored execute result: what the model keeps, and what the boundary loses. */
function viewOf(parsed, mode) {
  if (mode.kind === "cut") {
    const C = mode.C;
    const over = parsed.value.length > C;
    return {
      head: decode(over ? parsed.value.slice(0, C) : parsed.value),
      tail: over ? decode(parsed.value.slice(C, STORED_MAX)) : "",
      host: parsed.host,
      changingHost: over && !parsed.truncated
    };
  }
  // Grok: the first 20,000 UTF-8 bytes of the whole stored text; everything after is lost.
  const over = bytes(parsed.text) > GROK_BYTES;
  if (!over) return { head: decode(parsed.text), tail: "", host: "", changingHost: false };
  const headRaw = Buffer.from(parsed.text, "utf8").subarray(0, GROK_BYTES).toString("utf8").replace(/\uFFFD+$/, "");
  return { head: decode(headRaw), tail: decode(parsed.text.slice(headRaw.length)), host: "", changingHost: false };
}

const SEP = "\n\u0001\n";
const first = (arr) => (arr.length ? arr[0] : -1);
const around = (text, at, len, pad = 110) =>
  text.slice(Math.max(0, at - pad), at + len + pad).replace(/\s+/g, " ").trim();

function analyzeUnit(run, row, mode) {
  const question = norm(row.question ?? "");
  const answer = row.answer ?? "";
  const normAnswer = norm(answer);
  const transcript = row.transcript ?? [];
  const steps = [];
  let execIndex = 0;
  for (const entry of transcript) {
    if (/execute$/.test(entry.tool)) {
      const parsed = parseResult(entry);
      const view = viewOf(parsed, mode);
      const nh = norm(view.head);
      const nt = norm(view.tail);
      steps.push({
        type: "execute", index: execIndex++, entry, parsed, view, nh, nt, full: nh + nt,
        keptText: nh + SEP + norm(view.host)
      });
    } else if (/search$/.test(entry.tool) && entry.tool !== "ToolSearch") {
      steps.push({ type: "search", keptText: norm(searchText(entry)) });
    }
  }
  const execs = steps.filter((s) => s.type === "execute");
  const exposed = execs.some((s) => s.view.tail.length > 0);
  if (!exposed) return { exposed: false, candidates: [] };

  const base = [norm(staticSurface), question].join(SEP);
  const keptAll = [base, ...steps.map((s) => s.keptText)].join(SEP);
  const keptNoChanging = [base, ...steps.map((s) => (s.type === "execute" && s.view.changingHost ? s.nh : s.keptText))].join(SEP);
  const inTail = (needle) =>
    execs.filter((s) => s.nt && occurrences(s.full, needle).some((at) => at + needle.length > s.nh.length));
  const tailSnippet = (s, needle) => {
    const at = first(occurrences(s.full, needle).filter((x) => x + needle.length > s.nh.length));
    return at < 0 ? "" : around(s.full, at, needle.length);
  };
  const answerSnippet = (needle) => {
    const at = first(occurrences(normAnswer, needle));
    return at < 0 ? "" : around(normAnswer, at, needle.length, 160);
  };

  const cands = new Map();
  const put = (key, init) => {
    if (!cands.has(key)) cands.set(key, { candidate: key, sources: [], kinds: [], resultIndexes: [], flags: [], ...init });
    return cands.get(key);
  };

  // answer side and tail side share one check: occurs in a value tail, nowhere kept
  const examine = (needle, source, kind) => {
    if (needle.length < 3 || occurrences(question, needle).length > 0) return;
    const tails = inTail(needle);
    if (tails.length === 0) return;
    if (occurrences(keptAll, needle).length > 0) {
      if (occurrences(keptNoChanging, needle).length === 0) {
        const c = put(needle, { status: "kept-in-changing-block" });
        if (!c.sources.includes(source)) c.sources.push(source);
        if (!c.kinds.includes(kind)) c.kinds.push(kind);
        for (const s of tails) if (!c.resultIndexes.includes(s.index)) c.resultIndexes.push(s.index);
        c.tailSnippet ??= tailSnippet(tails[0], needle);
        c.answerSnippet ??= answerSnippet(needle);
      }
      return;
    }
    const c = put(needle, { status: "past-the-cut" });
    if (!c.sources.includes(source)) c.sources.push(source);
    if (!c.kinds.includes(kind)) c.kinds.push(kind);
    for (const s of tails) if (!c.resultIndexes.includes(s.index)) c.resultIndexes.push(s.index);
    c.tailSnippet ??= tailSnippet(tails[0], needle);
    c.answerSnippet ??= answerSnippet(needle);
    if (kind === "url") {
      const topFive = [...first5Urls(tails[0])];
      if (topFive.some((u) => needle.startsWith(u) || u.startsWith(needle))) c.flags.push("url-in-first-five");
    }
  };
  for (const [key, { kind }] of answerCandidates(answer)) examine(key, "answer", kind);
  for (const s of execs) {
    if (!s.nt) continue;
    for (const token of tailTokens(s.view.head + s.view.tail, s.view.head.length)) {
      const key = norm(token);
      if (occurrences(normAnswer, key).length > 0) examine(key, "tail", "token");
    }
  }

  // chained: a later script's literal that only an earlier result's tail holds
  let unparsedScripts = 0;
  const keptBefore = (k) => {
    const parts = [base];
    let seen = 0;
    for (const s of steps) {
      if (s.type === "execute") {
        if (s.index >= k) break;
        seen++;
      }
      parts.push(s.keptText);
    }
    return parts.join(SEP);
  };
  for (const s of execs) {
    if (s.index === 0) continue;
    const literals = scriptLiterals(scriptOf(s.entry));
    if (!literals) {
      unparsedScripts++;
      continue;
    }
    const before = keptBefore(s.index);
    const code = scriptOf(s.entry);
    for (const literal of literals) {
      const needle = norm(literal);
      if (occurrences(question, needle).length > 0 || occurrences(before, needle).length > 0) continue;
      const earlier = execs.filter(
        (e) => e.index < s.index && e.nt && occurrences(e.full, needle).some((at) => at + needle.length > e.nh.length)
      );
      if (earlier.length === 0) continue;
      const c = put(needle, { status: "past-the-cut" });
      if (!c.sources.includes("chained")) c.sources.push("chained");
      if (!c.kinds.includes("literal")) c.kinds.push("literal");
      for (const e of earlier) if (!c.resultIndexes.includes(e.index)) c.resultIndexes.push(e.index);
      c.tailSnippet ??= tailSnippet(earlier[0], needle);
      const at = code.indexOf(literal);
      c.scriptSnippet ??= `script ${s.index}: ${around(code, Math.max(0, at), literal.length, 90)}`;
      const earlierCode = norm(execs.filter((e) => e.index < s.index).map((e) => scriptOf(e.entry)).join("\n"));
      if (occurrences(earlierCode, needle).length > 0 && !c.flags.includes("in-earlier-script")) c.flags.push("in-earlier-script");
    }
  }
  // flag only: a candidate the model's own scripts contain was authored by the model, not read
  const codes = execs.map((s) => norm(scriptOf(s.entry)));
  for (const c of cands.values()) {
    if (codes.some((code) => occurrences(code, c.candidate).length > 0)) c.flags.push("in-script");
  }
  const list = [...cands.values()].map((c) => ({ run, row: row.id, mode: mode.label, ...c }));
  list.sort((a, b) => a.candidate.localeCompare(b.candidate));
  return { exposed: true, candidates: list, unparsedScripts };
}

/** The first five https URLs of the stored value of one result (the truncated block's canonicalUrls). */
function first5Urls(step) {
  const urls = [];
  for (const m of (step.view.head + step.view.tail).matchAll(/https:\/\/[^\s"'\\<>)\]]+/g)) {
    urls.push(m[0].replace(/[.,;:!?*]+$/, "").toLowerCase());
    if (urls.length === 5) break;
  }
  return urls;
}

// ---- main -----------------------------------------------------------------------------------

const files = readdirSync(selectedDir).filter((f) => f.endsWith(".json")).sort();
const runs = files.map((f) => JSON.parse(readFileSync(path.join(selectedDir, f), "utf8")));

// sizes
const sizeRows = [];
const total = { results: 0, truncated: 0, units: 0, valueChars: 0, failed: 0, failedMax: 0 };
const totalOver = Object.fromEntries([...CUTS, STORED_MAX].map((c) => [c, { results: 0, units: 0, rows: new Set(), removed: 0 }]));
const allRows = new Set();
for (const run of runs) {
  const per = { run: run.run, rows: run.rows.length, results: 0, truncated: 0 };
  const over = Object.fromEntries([...CUTS, STORED_MAX].map((c) => [c, { results: 0, units: 0, rows: new Set() }]));
  for (const row of run.rows) {
    allRows.add(row.id);
    total.units++;
    const hit = new Set();
    for (const entry of row.transcript ?? []) {
      if (!/execute$/.test(entry.tool)) continue;
      const p = parseResult(entry);
      per.results++;
      total.results++;
      total.valueChars += Math.min(p.value.length, STORED_MAX);
      if (p.isError) {
        total.failed++;
        total.failedMax = Math.max(total.failedMax, p.text.length);
      }
      if (p.truncated) {
        per.truncated++;
        total.truncated++;
      }
      for (const c of [...CUTS, STORED_MAX]) {
        if (p.origLen > c) {
          over[c].results++;
          totalOver[c].results++;
          hit.add(c);
          over[c].rows.add(row.id);
          totalOver[c].rows.add(row.id);
          if (c !== STORED_MAX) totalOver[c].removed += Math.min(p.value.length, STORED_MAX) - c;
        }
      }
    }
    for (const c of hit) {
      over[c].units++;
      totalOver[c].units++;
    }
  }
  sizeRows.push({
    run: per.run, rows: per.rows, executeResults: per.results, truncatedAt24000: per.truncated,
    over16000: `${over[16000].results}r/${over[16000].units}u/${over[16000].rows.size}rows`,
    over18000: `${over[18000].results}r/${over[18000].units}u/${over[18000].rows.size}rows`,
    over24000: `${over[24000].results}r/${over[24000].units}u/${over[24000].rows.size}rows`
  });
}
console.log("## Sizes (tuning rows; r = results, u = units, rows = distinct rows)");
console.table(sizeRows);
console.log(
  JSON.stringify({
    units: total.units, distinctRows: allRows.size, executeResults: total.results, failed: total.failed,
    failedLongest: total.failedMax, truncatedAt24000: total.truncated,
    over16000: { results: totalOver[16000].results, units: totalOver[16000].units, rows: totalOver[16000].rows.size },
    over18000: { results: totalOver[18000].results, units: totalOver[18000].units, rows: totalOver[18000].rows.size },
    over24000: { results: totalOver[24000].results, units: totalOver[24000].units, rows: totalOver[24000].rows.size },
    removed16000: {
      chars: totalOver[16000].removed, shareOfValueChars: +(totalOver[16000].removed / total.valueChars).toFixed(4),
      tokensPerUnit: Math.round(totalOver[16000].removed / 4 / total.units)
    },
    removed18000: {
      chars: totalOver[18000].removed, shareOfValueChars: +(totalOver[18000].removed / total.valueChars).toFixed(4),
      tokensPerUnit: Math.round(totalOver[18000].removed / 4 / total.units)
    }
  })
);

// Grok fit table and the largest stored search result
const fit = Object.fromEntries(CUTS.map((c) => [c, { over: 0, stillOverLow: 0, stillOverHigh: 0, maxLow: 0, maxHigh: 0 }]));
let grokNow = 0;
let maxSearch = 0;
for (const run of runs)
  for (const row of run.rows)
    for (const entry of row.transcript ?? []) {
      if (/search$/.test(entry.tool) && entry.tool !== "ToolSearch") maxSearch = Math.max(maxSearch, entry.resultChars ?? 0);
      if (!/execute$/.test(entry.tool)) continue;
      const p = parseResult(entry);
      if (bytes(p.text) > GROK_BYTES) grokNow++;
      for (const C of CUTS) {
        if (p.value.length <= C) continue;
        const head = bytes(p.value.slice(0, C));
        const low = head + bytes(p.host);
        const nextHeader = p.host.indexOf("\n\n--- ", 1);
        const rest = nextHeader < 0 ? "" : p.host.slice(nextHeader);
        const high = p.truncated ? low : head + 1 + MANIFEST_BOUND + bytes(rest);
        const f = fit[C];
        f.over++;
        if (low > GROK_BYTES) f.stillOverLow++;
        if (high > GROK_BYTES) f.stillOverHigh++;
        f.maxLow = Math.max(f.maxLow, low);
        f.maxHigh = Math.max(f.maxHigh, high);
      }
    }
console.log("## Grok 20,000-byte clip: results over the cut still over the clip (stored host blocks / manifest at 1,600)");
console.log(JSON.stringify({ storedResultsOver20000Bytes: grokNow, largestStoredSearchResultChars: maxSearch, fit }));

// candidates
const all = [];
const exposure = {};
let unparsed = 0;
const modes = [
  ...CUTS.map((C) => ({ kind: "cut", C, label: String(C) })),
  { kind: "grok", label: "grok" }
];
for (const mode of modes) exposure[mode.label] = { units: 0, rows: new Set(), byRun: {} };
for (const run of runs)
  for (const row of run.rows)
    for (const mode of modes) {
      const out = analyzeUnit(run.run, row, mode);
      unparsed += out.unparsedScripts ?? 0;
      if (!out.exposed) continue;
      exposure[mode.label].units++;
      exposure[mode.label].rows.add(row.id);
      exposure[mode.label].byRun[run.run] = (exposure[mode.label].byRun[run.run] ?? 0) + 1;
      all.push(...out.candidates);
    }
console.log("## Exposed units and candidates (unclassified; classification is the reader's)");
console.log(
  JSON.stringify(
    Object.fromEntries(
      modes.map((m) => {
        const mine = all.filter((c) => c.mode === m.label);
        const bySource = {};
        for (const c of mine) for (const s of c.sources) bySource[s] = (bySource[s] ?? 0) + 1;
        return [m.label, {
          exposedUnits: exposure[m.label].units, exposedRows: exposure[m.label].rows.size,
          candidatesPastCut: mine.filter((c) => c.status === "past-the-cut").length,
          keptInChangingBlock: mine.filter((c) => c.status === "kept-in-changing-block").length,
          bySource
        }];
      })
    )
  )
);
if (unparsed > 0) console.log(`later scripts that did not parse (no chained literals read): ${unparsed}`);
if (opt.candidates) writeFileSync(opt.candidates, JSON.stringify(all, null, 1));

// R from the reader's classes
if (opt.classes) {
  const classes = JSON.parse(readFileSync(opt.classes, "utf8"));
  const key = (r) => `${r.run}|${r.row}|${r.mode}|${r.candidate}`;
  const byKey = new Map(classes.map((c) => [`${c.run}|${c.row}|${c.mode}|${norm(c.candidate)}`, c]));
  const COUNTS = new Set(["cited", "chained"]);
  const report = {};
  for (const mode of modes) {
    const mine = all.filter((c) => c.mode === mode.label && c.status === "past-the-cut");
    const unclassified = mine.filter((c) => !byKey.has(key(c)));
    const counted = mine.filter((c) => COUNTS.has(byKey.get(key(c))?.class));
    const rowsOf = (list) => new Set(list.map((c) => c.row));
    const unitsOf = (list) => new Set(list.map((c) => `${c.run}|${c.row}`));
    const noPointer = counted.filter((c) => !POINTER_RUNS.has(c.run));
    const classTally = {};
    for (const c of mine) {
      const k = byKey.get(key(c))?.class ?? "UNCLASSIFIED";
      classTally[k] = (classTally[k] ?? 0) + 1;
    }
    // A unit is settled when it holds a cited or chained candidate (the reader stopped there) or
    // when every one of its candidates is classified. Anything else is open.
    const unitKey = (c) => `${c.run}|${c.row}`;
    const withCands = new Set(mine.map(unitKey));
    const positive = new Set(counted.map(unitKey));
    const open = [...new Set(unclassified.map(unitKey))].filter((u) => !positive.has(u)).sort();
    report[mode.label] = {
      candidates: mine.length, classified: mine.length - unclassified.length, classTally,
      unitsWithCandidates: withCands.size, unitsPositive: positive.size, unitsOpen: open.length, open,
      R: rowsOf(counted).size, units: unitsOf(counted).size,
      RwithoutPointerRuns: rowsOf(noPointer).size, unitsWithoutPointerRuns: unitsOf(noPointer).size,
      rows: [...rowsOf(counted)].sort()
    };
  }
  const stale = classes.filter((c) => !all.some((a) => key(a) === `${c.run}|${c.row}|${c.mode}|${norm(c.candidate)}`));
  console.log("## R from classes (cited + chained, distinct rows)");
  console.log(JSON.stringify({ ...report, classesNotMatchingACandidate: stale.length }, null, 1));
  const floor = exposure["16000"].rows.size;
  console.log(`floor: ${floor} exposed rows at 16,000 (floor 30) -> ${floor >= 30 ? "ok" : "sample too small"}`);
}
