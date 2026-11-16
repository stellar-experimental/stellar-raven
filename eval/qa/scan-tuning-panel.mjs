#!/usr/bin/env node
/**
 * Deterministic panel rule for the second tuning loop, over `sets.tuning` only.
 *
 * The panel is loop 1's 50 rows plus every tuning row whose golden cites a stellar.org page
 * outside /blog, /press and /events. The scan reads, per tuning row, only the case tags and the
 * golden source URLs (`truth.sources[].ref`), and each stored run's verdict score. It reads no
 * question, golden answer, key fact, stored answer or transcript, and it makes no model call.
 *
 * Usage: node eval/qa/scan-tuning-panel.mjs --split <split.json> [--cases eval/qa/cases.json]
 *          --run <label>=<results.json> ... [--json]
 * The first `--run` is the baseline (every tuning row); every other run is a stored panel run
 * (50 rows, all tuning, the same 50 ids).
 */
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { TUNING_ROW_COUNT, selectById, tuningIdsOf } from "./tuning-rows.mjs";

const PANEL_RUN_ROWS = 50;
/** Paths on the SDF site that the `stellarOrg` source does not serve. */
const EXCLUDED_PATHS = /^\/(blog|press|events)(\/|$)/;

/** The path of a stellar.org (or www.stellar.org) URL, or null for any other host or a bad URL. */
export function stellarOrgPath(ref) {
  try {
    const url = new URL(String(ref));
    return url.hostname === "stellar.org" || url.hostname === "www.stellar.org" ? url.pathname : null;
  } catch {
    return null;
  }
}

/** Golden source paths on stellar.org for one case, and whether any is outside the excluded paths. */
export function sdfSiteSources(sources) {
  const paths = (sources ?? []).map((source) => stellarOrgPath(source?.ref)).filter((p) => p !== null);
  return { paths, servedByNewSource: paths.some((p) => !EXCLUDED_PATHS.test(p)) };
}

export function scanPanel({ split, cases, runs }) {
  const ids = tuningIdsOf(split);
  const tuningCases = selectById(cases?.cases ?? cases, ids, ids.length, "cases");
  const [baselineRun, ...panelRuns] = runs;
  const baseline = selectById(baselineRun.results.rows, ids, ids.length, baselineRun.label);
  const panelRowsByRun = panelRuns.map((run) => ({
    label: run.label,
    rows: selectById(run.results.rows, ids, PANEL_RUN_ROWS, run.label)
  }));
  const loop1 = new Set(panelRowsByRun[0].rows.map((r) => r.id));
  for (const run of panelRowsByRun) {
    const here = run.rows.map((r) => r.id).sort().join(",");
    if (here !== [...loop1].sort().join(",")) throw new Error(`${run.label} is not the same 50 rows`);
  }
  const verdictOf = (rows) => new Map(rows.map((r) => [r.id, r.verdict?.score ?? null]));
  const verdicts = [
    { label: baselineRun.label, byId: verdictOf(baseline) },
    ...panelRowsByRun.map((run) => ({ label: run.label, byId: verdictOf(run.rows) }))
  ];
  const rows = tuningCases
    .map((c) => {
      const site = sdfSiteSources(c.truth?.sources);
      const inLoop1 = loop1.has(c.id);
      return {
        id: c.id,
        category: c.tags?.category ?? null,
        service: c.tags?.service ?? null,
        trap: c.tags?.trap ?? null,
        citesStellarOrg: site.paths.length > 0,
        stellarOrgPaths: site.paths,
        sourceRow: site.servedByNewSource,
        inLoop1Panel: inLoop1,
        inPanel: inLoop1 || site.servedByNewSource,
        verdicts: Object.fromEntries(verdicts.map((v) => [v.label, v.byId.get(c.id) ?? null]))
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
  const panel = rows.filter((r) => r.inPanel);
  const count = (list, fn) => list.filter(fn).length;
  const services = (list) => {
    const out = {};
    for (const r of list) out[r.service ?? "none"] = (out[r.service ?? "none"] ?? 0) + 1;
    return out;
  };
  return {
    runLabels: verdicts.map((v) => v.label),
    summary: {
      tuningRows: rows.length,
      citeStellarOrg: count(rows, (r) => r.citesStellarOrg),
      citeServedPath: count(rows, (r) => r.sourceRow),
      servedPathInLoop1Panel: count(rows, (r) => r.sourceRow && r.inLoop1Panel),
      added: count(rows, (r) => r.inPanel && !r.inLoop1Panel),
      loop1Panel: count(rows, (r) => r.inLoop1Panel),
      panel: panel.length,
      loop1ServiceTags: services(rows.filter((r) => r.inLoop1Panel)),
      panelServiceTags: services(panel),
      traps: panel.filter((r) => r.trap).map((r) => `${r.id} (${r.trap})`)
    },
    rows
  };
}

export function renderMarkdown(scan) {
  const s = scan.summary;
  const lines = [
    `Tuning rows scanned: ${s.tuningRows} (asserted ${TUNING_ROW_COUNT}). Rows citing any stellar.org page: ${s.citeStellarOrg}. Rows citing a page outside /blog, /press and /events: ${s.citeServedPath}, of which ${s.servedPathInLoop1Panel} are in loop 1's panel.`,
    `Panel: ${s.loop1Panel} loop 1 rows + ${s.added} added = ${s.panel}. Loop 1 panel by \`tags.service\`: ${JSON.stringify(s.loop1ServiceTags)}. Panel: ${JSON.stringify(s.panelServiceTags)}.`,
    `Trap-tagged panel rows: ${s.traps.join(", ") || "none"}.`,
    "",
    `| Case | Panel | Category | Service | Trap | Source row | ${scan.runLabels.join(" | ")} |`,
    `|---|---|---|---|---|---|${scan.runLabels.map(() => "---").join("|")}|`
  ];
  for (const r of scan.rows.filter((x) => x.inPanel)) {
    const how = r.inLoop1Panel ? "loop 1" : "added";
    lines.push(
      `| \`${r.id}\` | ${how} | ${r.category} | ${r.service} | ${r.trap ?? ""} | ${r.sourceRow ? "yes" : ""} | ${scan.runLabels.map((l) => r.verdicts[l] ?? "").join(" | ")} |`
    );
  }
  return `${lines.join("\n")}\n`;
}

function main() {
  const { values } = parseArgs({
    options: {
      split: { type: "string" },
      cases: { type: "string", default: "eval/qa/cases.json" },
      run: { type: "string", multiple: true },
      json: { type: "boolean", default: false }
    }
  });
  if (!values.split || !values.run?.length) throw new Error("--split and at least two --run label=path are required");
  const runs = values.run.map((spec) => {
    const at = spec.indexOf("=");
    return { label: spec.slice(0, at), results: JSON.parse(readFileSync(spec.slice(at + 1), "utf8")) };
  });
  const scan = scanPanel({
    split: JSON.parse(readFileSync(values.split, "utf8")),
    cases: JSON.parse(readFileSync(values.cases, "utf8")),
    runs
  });
  process.stdout.write(values.json ? `${JSON.stringify(scan, null, 2)}\n` : renderMarkdown(scan));
}

if (import.meta.url === `file://${process.argv[1]}`) main();
