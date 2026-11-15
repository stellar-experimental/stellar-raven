#!/usr/bin/env node
/**
 * Deterministic panel roles and exposure facts for tuning loop 2, step 2, over `sets.tuning` only.
 *
 * The roles are the target sets of the plan (section 3): the 12 source rows, the 17 identifier rows
 * and the 10 guard rows, each fixed by rule. The exposure facts are the ones P2's reading uses to
 * separate its three changes, defined here before P2 runs and read from a stored transcript with
 * no verdict:
 *
 * - source-exposed: a `search` page that holds a `stellarOrg` operation the same query's page does
 *   not hold on the catalog without the source, or an `execute` script that names a `stellarOrg`
 *   operation;
 * - seven-exposed: a `search` call that passed no `limit`, so the default governs it;
 * - seven-used: an operation the row's scripts call that the default-limit search's own query ranks
 *   6th or 7th on the page at limit 7, so it is on the page only because the default grew.
 *
 * A row in both the source-exposed and the seven-exposed sets is reported apart (`both`).
 *
 * Hygiene: the split file is read for `sets.tuning` only. Every results file is filtered by that id
 * list before any other field of any row is read, and each selection asserts its count. The scan
 * reads `id`, the case tags and golden source URLs (through scan-tuning-panel.mjs), and each row's
 * transcript tool calls. It reads no verdict, answer, key fact or tool result, and it makes no
 * model call.
 *
 * Usage: node eval/qa/scan-step2-roles.mjs --split <split.json> --cases eval/qa/cases.json \
 *          --loop1 baseline=<r> --loop1 step0prime=<r> --loop1 arm1=<r> --loop1 arm3=<r> \
 *          --run P0=<r> --run P1=<r> --manifest catalog/manifest.json --manifest-without-source <m.json> [--json]
 */
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { loadManifest, searchCatalogPage } from "../../src/catalog/search.ts";
import { scanPanel } from "./scan-tuning-panel.mjs";
import { scriptOf } from "./scan-tuning-exposure.mjs";
import { selectById, tuningIdsOf } from "./tuning-rows.mjs";

/** The default page of each catalog: the public `search` default before and after item 3. */
export const DEFAULT_LIMIT_BEFORE = 5;
export const DEFAULT_LIMIT_AFTER = 7;

const isSearchTool = (tool) => /(^|__)search$/.test(String(tool ?? ""));
const isExecuteTool = (tool) => /(^|__)execute$/.test(String(tool ?? ""));
const STRING_LITERAL_RE = /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g;
/** Letters then digits, joined or hyphenated, never separated by a space (amendment A6). */
const IDENTIFIER_RE = /\b([A-Za-z]{2,})-?\d+\b/g;
const OPERATION_RE = /\b(lumenloop|scout|stellarDocs|stellarOrg)\.([A-Za-z_]\w*)\b/g;

/** The `search` calls of a transcript: their arguments, in order. A call with unreadable input is skipped. */
export function searchCallsOf(transcript) {
  const calls = [];
  for (const entry of transcript ?? []) {
    if (!isSearchTool(entry?.tool)) continue;
    try {
      const args = JSON.parse(String(entry.input));
      if (args && typeof args.query === "string") calls.push(args);
    } catch {
      // unreadable input: no replay
    }
  }
  return calls;
}

/** Operation ids named in the `execute` scripts of a transcript. */
export function operationsCalledIn(transcript, operationIds) {
  const called = new Set();
  for (const entry of transcript ?? []) {
    if (!isExecuteTool(entry?.tool)) continue;
    for (const m of scriptOf(entry).matchAll(OPERATION_RE)) {
      const id = `${m[1]}.${m[2]}`;
      if (operationIds.has(id)) called.add(id);
    }
  }
  return called;
}

/** The enum values of a `source`-like filter on `scout.searchResearch`, lower case, from the catalog. */
export function seriesOf(catalog, operationId = "scout.searchResearch", field = "source") {
  const entry = catalog.entries.find((e) => e.id === operationId);
  const values = entry?.inputSchema?.properties?.[field]?.enum;
  if (!Array.isArray(values)) throw new Error(`${operationId} declares no ${field} enum`);
  return new Set(values.map((v) => String(v).toLowerCase()));
}

/** Series identifiers (`SEP-45`, `cap33`) that a string literal of an execute script names. */
export function seriesIdentifiersIn(transcript, series) {
  const found = new Set();
  for (const entry of transcript ?? []) {
    if (!isExecuteTool(entry?.tool)) continue;
    for (const literal of scriptOf(entry).match(STRING_LITERAL_RE) ?? []) {
      for (const m of literal.matchAll(IDENTIFIER_RE)) if (series.has(m[1].toLowerCase())) found.add(m[0].toLowerCase());
    }
  }
  return [...found].sort();
}

const pageIds = (catalog, args, limit) =>
  searchCatalogPage(catalog, { query: args.query, kind: args.kind, service: args.service, limit }).hits.map((hit) => hit.id);

/** Exposure facts of one stored transcript. `without` is the catalog before the source, `with` after. */
export function exposureOf(transcript, { without, withSource }) {
  const operationIds = new Set(withSource.entries.filter((e) => e.kind === "operation").map((e) => e.id));
  const called = operationsCalledIn(transcript, operationIds);
  const calls = searchCallsOf(transcript);
  const sourceCalls = [];
  const sevenCalls = [];
  for (const args of calls) {
    const limit = args.limit ?? DEFAULT_LIMIT_BEFORE;
    const before = pageIds(without, args, limit);
    const after = pageIds(withSource, args, limit);
    const gained = after.filter((id) => id.startsWith("stellarOrg.") && !before.includes(id));
    if (gained.length > 0) {
      const displaced = before.filter((id) => !after.includes(id));
      sourceCalls.push({ query: args.query, limit, gained, displaced, displacedCalled: displaced.filter((id) => called.has(id)) });
    }
    if (args.limit === undefined) {
      const seven = pageIds(withSource, args, DEFAULT_LIMIT_AFTER);
      const added = seven.slice(DEFAULT_LIMIT_BEFORE);
      sevenCalls.push({ query: args.query, ranks6to7: added, used: added.filter((id) => called.has(id)) });
    }
  }
  const scriptNamesSource = [...called].some((id) => id.startsWith("stellarOrg."));
  const sourceExposed = sourceCalls.length > 0 || scriptNamesSource;
  const sevenExposed = sevenCalls.length > 0;
  const sevenUsed = sevenCalls.some((c) => c.used.length > 0);
  return {
    searchCalls: calls.length,
    sourceExposed,
    sevenExposed,
    sevenUsed,
    both: sourceExposed && sevenExposed,
    sourceCalls,
    sevenCalls: sevenCalls.filter((c) => c.ranks6to7.length > 0)
  };
}

/** The plan's three target sets, by rule, plus the reproduction of the panel. */
export function scanRoles({ split, cases, loop1, runs, manifest, manifestWithoutSource }) {
  const ids = tuningIdsOf(split);
  const panel = scanPanel({ split, cases, runs: loop1 });
  const panelIds = panel.rows.filter((r) => r.inPanel).map((r) => r.id);
  const withSource = loadManifest(manifest);
  const without = loadManifest(manifestWithoutSource);
  const series = seriesOf(withSource);
  // Identifier rows: a series identifier in an execute string in two or more of the stored loop 1 runs.
  const seen = new Map();
  const seriesSeen = new Map();
  // The first loop 1 run is the baseline (79 tuning rows); the others are the 50-row panel runs.
  for (const [i, run] of loop1.entries()) {
    for (const row of selectById(run.results.rows, ids, i === 0 ? 79 : 50, run.label)) {
      if (!panelIds.includes(row.id)) continue;
      const named = seriesIdentifiersIn(row.transcript, series);
      if (named.length === 0) continue;
      seen.set(row.id, (seen.get(row.id) ?? 0) + 1);
      seriesSeen.set(row.id, new Set([...(seriesSeen.get(row.id) ?? []), ...named.map((t) => t.replace(/-?\d+$/, ""))]));
    }
  }
  const identifierRows = [...seen].filter(([, n]) => n >= 2).map(([id]) => id).sort();
  const sourceRows = panel.rows.filter((r) => r.sourceRow).map((r) => r.id).sort();
  const exposures = {};
  for (const run of runs) {
    const rows = selectById(run.results.rows, ids, run.results.rows.length, run.label);
    exposures[run.label] = Object.fromEntries(
      rows.filter((r) => panelIds.includes(r.id)).map((r) => [r.id, exposureOf(r.transcript, { without, withSource })])
    );
  }
  // Amendment A6: the firings whose series is not `sep` or `cap` are listed, because each is a defect of the rule.
  const identifierSeries = Object.fromEntries(identifierRows.map((id) => [id, [...seriesSeen.get(id)].sort()]));
  return { series: [...series].sort(), panelIds: [...panelIds].sort(), sourceRows, identifierRows, identifierSeries, exposures };
}

export function renderMarkdown(scan) {
  const lines = [
    `Panel rows: ${scan.panelIds.length}. Source rows (rule: golden cites a stellar.org page outside /blog, /press, /events): ${scan.sourceRows.length}. Identifier rows (a \`${scan.series.join("`/`")}\` identifier in an execute string in two or more stored loop 1 runs, hyphenated or joined): ${scan.identifierRows.length}.`,
    "",
    `Source rows: ${scan.sourceRows.map((id) => `\`${id}\``).join(", ")}`,
    "",
    `Identifier rows: ${scan.identifierRows.map((id) => `\`${id}\``).join(", ")}`,
    "",
    `Series named by the identifier rows (A6: any series other than sep or cap is a defect of the rule): ${[...new Set(Object.values(scan.identifierSeries).flat())].sort().join(", ")}.`,
    ""
  ];
  for (const [label, rows] of Object.entries(scan.exposures)) {
    const list = Object.entries(rows);
    const count = (key) => list.filter(([, e]) => e[key]).length;
    lines.push(
      `### ${label} replayed on the rebased catalog (${list.length} rows)`,
      "",
      `Rows with a search call: ${list.filter(([, e]) => e.searchCalls > 0).length}. Source-exposed (a page gains a \`stellarOrg\` card): ${count("sourceExposed")}. Seven-exposed (a default-limit search): ${count("sevenExposed")}. Seven-used (a called operation sits at rank 6 or 7 of a default-limit page): ${count("sevenUsed")}. Both source- and seven-exposed: ${count("both")}.`,
      ""
    );
    for (const [id, e] of list.filter(([, e]) => e.sourceCalls.length > 0)) {
      for (const c of e.sourceCalls) {
        const called = c.displacedCalled.length ? `; the script calls ${c.displacedCalled.map((d) => `\`${d}\``).join(", ")}` : "";
        lines.push(`- \`${id}\` limit ${c.limit}: gains ${c.gained.map((g) => `\`${g}\``).join(", ")}; displaces ${c.displaced.map((d) => `\`${d}\``).join(", ") || "nothing"}${called}.`);
      }
    }
    for (const [id, e] of list.filter(([, e]) => e.sevenUsed)) {
      for (const c of e.sevenCalls.filter((x) => x.used.length)) lines.push(`- \`${id}\` seven-used: ${c.used.map((u) => `\`${u}\``).join(", ")} at rank 6 or 7.`);
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
}

function main() {
  const { values } = parseArgs({
    options: {
      split: { type: "string" },
      cases: { type: "string", default: "eval/qa/cases.json" },
      loop1: { type: "string", multiple: true },
      run: { type: "string", multiple: true },
      manifest: { type: "string", default: "catalog/manifest.json" },
      "manifest-without-source": { type: "string" },
      json: { type: "boolean", default: false }
    }
  });
  if (!values.split || !values.loop1?.length || !values.run?.length || !values["manifest-without-source"]) {
    throw new Error("--split, --loop1 (x4), --run and --manifest-without-source are required");
  }
  const read = (specs) =>
    specs.map((spec) => {
      const at = spec.indexOf("=");
      return { label: spec.slice(0, at), results: JSON.parse(readFileSync(spec.slice(at + 1), "utf8")) };
    });
  const scan = scanRoles({
    split: JSON.parse(readFileSync(values.split, "utf8")),
    cases: JSON.parse(readFileSync(values.cases, "utf8")),
    loop1: read(values.loop1),
    runs: read(values.run),
    manifest: JSON.parse(readFileSync(values.manifest, "utf8")),
    manifestWithoutSource: JSON.parse(readFileSync(values["manifest-without-source"], "utf8"))
  });
  process.stdout.write(values.json ? `${JSON.stringify(scan, null, 2)}\n` : renderMarkdown(scan));
}

if (import.meta.url === `file://${process.argv[1]}`) main();
