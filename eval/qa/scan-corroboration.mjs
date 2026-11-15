#!/usr/bin/env node
/**
 * Deterministic scans for the corroboration guard and the identifier pointer (tuning loop 2),
 * over `sets.tuning` only. They pick rows and passes to read; they judge nothing and call no model.
 *
 * Per stored pass (one row in one run) the scan records, from the stored transcript and answer:
 * - block: an `execute` result carried the CANDIDATE EVIDENCE block (the guard's home today);
 * - claim words in the answer, by the plan's list and by amendment A3's longer list;
 * - guardLine: a static upper bound on the passes where amendment A1's standalone guard line would
 *   render. A script names an operation of a family outside the corroborating families, its
 *   result carries no candidate block, no PRIOR-ART block, and no all-failed or all-empty notice.
 *   The stored rows hold no call ledger, so "returned rows" cannot be read; the count is an upper
 *   bound and the live replay is the exact one;
 * - identifier: an `execute` string names a token of letters, an optional hyphen, and digits whose
 *   letters equal a value of the `source` enum of the research operation (a hyphenated or joined
 *   token only, amendment A6), and whether any `execute` that names one also calls research.
 *
 * Hygiene: the split file is read for `sets.tuning` only; each results file is filtered by that id
 * list before any other row field is read, and the counts are asserted.
 *
 * Usage: node eval/qa/scan-corroboration.mjs --split <split.json> --catalog catalog/manifest.json
 *          --panel <panel.json from scan-tuning-panel.mjs --json> --run <label>=<results.json> ... [--json]
 * The first `--run` is the baseline (79 tuning rows); the others are panel runs (50 rows each).
 */
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { CORROBORATING_FAMILIES } from "../../scripts/catalog-data/source-families.mjs";
import { CLAIM_PATTERNS, PLAN_CLAIM_PATTERNS, claimSentences, claimWordsIn } from "./corroboration-rubric.mjs";
import { scriptOf } from "./scan-tuning-exposure.mjs";
import { selectById, tuningIdsOf } from "./tuning-rows.mjs";

const PANEL_RUN_ROWS = 50;
const RESEARCH_OP = "scout.searchResearch";
const BLOCK_RE = /--- CANDIDATE EVIDENCE ---/;
const PRIOR_ART_RE = /--- PRIOR-ART CANDIDATES ---/;
const NO_ROWS_RE = /--- (?:SERVICE ERRORS|EVIDENCE RECOVERY|INCONCLUSIVE SERVICE OUTCOMES) ---/;
const OP_RE = /\b(lumenloop|scout|stellarDocs)\.([A-Za-z_]\w*)\b/g;
const STRING_LITERAL_RE = /"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`/g;
// Hyphenated or joined only; a token followed by `-` or `.` and another digit is a longer identifier.
const IDENTIFIER_RE = /\b([A-Za-z]+)-?(\d+)\b(?![-.]\d)/g;

const isExecuteTool = (tool) => /(^|__)execute$/.test(String(tool ?? ""));

/** The values of the research operation's `source` filter that are plain letters, lower-cased. */
export function seriesOfCatalog(manifest) {
  const entry = (manifest.entries ?? []).find((e) => e.id === RESEARCH_OP);
  const values = entry?.inputSchema?.properties?.source?.enum;
  if (!Array.isArray(values)) throw new Error(`${RESEARCH_OP} declares no source enum`);
  return new Set(values.filter((v) => /^[a-z]+$/.test(v)));
}

/** Identifier tokens, normalised to `LETTERS-DIGITS`, that the string literals of a script name. */
export function identifiersIn(code, series) {
  const found = new Set();
  for (const literal of code.match(STRING_LITERAL_RE) ?? []) {
    for (const m of literal.matchAll(IDENTIFIER_RE)) {
      if (series.has(m[1].toLowerCase())) found.add(`${m[1].toUpperCase()}-${m[2]}`);
    }
  }
  return [...found];
}

/** Everything one stored pass shows, by static reading of its transcript and its answer. */
export function scanPass(row, { operationIds, series }) {
  const corroborating = new Set(CORROBORATING_FAMILIES.map((f) => f.family));
  let block = false;
  let guardLine = false;
  let uncorroboratedCall = false;
  let calledScoutOrLumenloop = false;
  const identifiers = new Set();
  let identifierAndResearch = false;
  for (const entry of row.transcript ?? []) {
    if (!isExecuteTool(entry?.tool)) continue;
    const code = scriptOf(entry);
    const result = String(entry?.result ?? "");
    const hasBlock = BLOCK_RE.test(result);
    if (hasBlock) block = true;
    const ops = [...code.matchAll(OP_RE)].map((m) => `${m[1]}.${m[2]}`).filter((id) => operationIds.has(id));
    const outside = ops.filter((id) => !corroborating.has(id.split(".", 1)[0]));
    if (outside.length) {
      uncorroboratedCall = true;
      if (!hasBlock && !PRIOR_ART_RE.test(result) && !NO_ROWS_RE.test(result)) guardLine = true;
    }
    if (ops.some((id) => id.startsWith("scout.") || id.startsWith("lumenloop."))) calledScoutOrLumenloop = true;
    const named = identifiersIn(code, series);
    for (const token of named) identifiers.add(token);
    if (named.length && ops.includes(RESEARCH_OP)) identifierAndResearch = true;
  }
  const answer = String(row.answer ?? "");
  return {
    id: row.id,
    block,
    guardLine,
    uncorroboratedCall,
    calledScoutOrLumenloop,
    claimPlan: claimWordsIn(answer, PLAN_CLAIM_PATTERNS).length > 0,
    claimAmended: claimWordsIn(answer, CLAIM_PATTERNS).length > 0,
    claimWords: claimWordsIn(answer, CLAIM_PATTERNS),
    claimSentences: claimSentences(answer).length,
    identifiers: [...identifiers].sort(),
    identifierNamed: identifiers.size > 0,
    identifierWithoutResearch: identifiers.size > 0 && !identifierAndResearch
  };
}

const count = (list, fn) => list.filter(fn).length;

export function scanCorroboration({ split, manifest, runs, panel }) {
  const ids = tuningIdsOf(split);
  const context = {
    operationIds: new Set((manifest.entries ?? []).filter((e) => e.kind === "operation").map((e) => e.id)),
    series: seriesOfCatalog(manifest)
  };
  const perRun = runs.map((run, index) => {
    const rows = selectById(run.results.rows, ids, index === 0 ? ids.length : PANEL_RUN_ROWS, run.label);
    return { label: run.label, passes: rows.map((row) => scanPass(row, context)).sort((a, b) => a.id.localeCompare(b.id)) };
  });
  const panelIds = new Set(perRun[1].passes.map((p) => p.id));
  const withMap = perRun.slice(0, 3);
  const summaries = perRun.map(({ label, passes }) => ({
    label,
    rows: passes.length,
    block: count(passes, (p) => p.block),
    claimPlan: count(passes, (p) => p.claimPlan),
    claimAmended: count(passes, (p) => p.claimAmended),
    blockAndClaimPlan: count(passes, (p) => p.block && p.claimPlan),
    blockAndClaimAmended: count(passes, (p) => p.block && p.claimAmended),
    claimPlanNoBlock: count(passes, (p) => !p.block && p.claimPlan),
    claimAmendedNoBlock: count(passes, (p) => !p.block && p.claimAmended),
    claimAmendedNoBlockScoutOrLumenloop: count(passes, (p) => !p.block && p.claimAmended && p.calledScoutOrLumenloop),
    claimPlanNoBlockScoutOrLumenloop: count(passes, (p) => !p.block && p.claimPlan && p.calledScoutOrLumenloop),
    guardLineUpperBound: count(passes, (p) => p.guardLine),
    guardLineUpperBoundInPanel: count(passes, (p) => p.guardLine && panelIds.has(p.id)),
    identifierNamed: count(passes, (p) => p.identifierNamed),
    identifierWithoutResearch: count(passes, (p) => p.identifierWithoutResearch)
  })).map((x) => ({
    ...x,
    // Of the rows whose scripts name an identifier, the share where an execute that names one also calls research.
    researchShareOfNamed: x.identifierNamed ? (x.identifierNamed - x.identifierWithoutResearch) / x.identifierNamed : null
  }));
  const inPanel = (p) => panelIds.has(p.id);
  const distinct = (key, runsOf = perRun) => [...new Set(runsOf.flatMap((r) => r.passes.filter((p) => p[key]).map((p) => p.id)))].sort();
  const runsWith = (id, pick, runsOf = perRun) => runsOf.filter((r) => r.passes.some((p) => p.id === id && pick(p))).length;
  const panelRuns = perRun.slice(1);
  const coincident = (claim) => (p) => p.block && p[claim];
  const guardRows = (claim) =>
    distinct("block").filter((id) => panelIds.has(id) && runsWith(id, coincident(claim), perRun) >= 2);
  const identifierRows = [...panelIds].filter((id) => runsWith(id, (p) => p.identifierNamed, perRun) >= 2).sort();
  return {
    runLabels: perRun.map((r) => r.label),
    summaries,
    references: {
      // Amendment A3: the with-map, no-guard reference is the baseline, step 0-prime and arm 1;
      // arm 3 is the no-map, no-guard reference.
      withMapNoGuard: {
        runs: withMap.map((r) => r.label),
        blockAndClaimPlan: sum(summaries.slice(0, 3), "blockAndClaimPlan"),
        blockAndClaimAmended: sum(summaries.slice(0, 3), "blockAndClaimAmended"),
        claimAmended: sum(summaries.slice(0, 3), "claimAmended")
      },
      noMapNoGuard: {
        runs: [perRun[3]?.label],
        blockAndClaimPlan: summaries[3]?.blockAndClaimPlan ?? null,
        blockAndClaimAmended: summaries[3]?.blockAndClaimAmended ?? null,
        claimAmended: summaries[3]?.claimAmended ?? null
      }
    },
    distinctBlockAndClaimPlanRows: distinctPairs(perRun, coincident("claimPlan")),
    distinctBlockAndClaimPlanRowsInPanel: distinctPairs(perRun, coincident("claimPlan")).filter((id) => panelIds.has(id)),
    guardRowsPlan: guardRows("claimPlan"),
    guardRowsAmended: guardRows("claimAmended"),
    // The target set of the guard passes: the rule's rows by the amended claim words (A3), plus
    // every panel row tagged `trap: governance`. Rows come from the committed panel scan.
    governanceTrapRows: (panel?.rows ?? []).filter((r) => r.inPanel && r.trap === "governance").map((r) => r.id).sort(),
    guardRowsFinal: [
      ...new Set([
        ...guardRows("claimAmended"),
        ...(panel?.rows ?? []).filter((r) => r.inPanel && r.trap === "governance").map((r) => r.id)
      ])
    ].sort(),
    guardRowsPlanWithTrap: [
      ...new Set([
        ...guardRows("claimPlan"),
        ...(panel?.rows ?? []).filter((r) => r.inPanel && r.trap === "governance").map((r) => r.id)
      ])
    ].sort(),
    identifierRows,
    identifierShares: panelRuns.map((r) => {
      const rows = r.passes.filter((p) => identifierRows.includes(p.id));
      return {
        label: r.label,
        rows: rows.length,
        namedIdentifier: count(rows, (p) => p.identifierNamed),
        namedAndNoResearch: count(rows, (p) => p.identifierWithoutResearch),
        researchWithIdentifier: count(rows, (p) => p.identifierNamed && !p.identifierWithoutResearch)
      };
    }),
    passes: Object.fromEntries(perRun.map((r) => [r.label, r.passes.filter((p) => p.block || p.claimAmended || p.guardLine || p.identifierNamed)])),
    inPanelCount: perRun[0].passes.filter(inPanel).length
  };
}

const sum = (list, key) => list.reduce((total, item) => total + item[key], 0);
function distinctPairs(perRun, pick) {
  return [...new Set(perRun.flatMap((r) => r.passes.filter(pick).map((p) => p.id)))].sort();
}

export function renderMarkdown(scan) {
  const s = scan.summaries;
  const row = (label, key) => `| ${label} | ${s.map((x) => x[key]).join(" | ")} |`;
  return [
    `| Count of passes | ${scan.runLabels.join(" | ")} |`,
    `|---|${scan.runLabels.map(() => "---:").join("|")}|`,
    row("Rows", "rows"),
    row("CANDIDATE EVIDENCE block appeared", "block"),
    row("Answer has a claim word, plan list", "claimPlan"),
    row("Answer has a claim word, amended list (A3)", "claimAmended"),
    row("Block and claim word, plan list", "blockAndClaimPlan"),
    row("Block and claim word, amended list", "blockAndClaimAmended"),
    row("Claim word, no block, plan list", "claimPlanNoBlock"),
    row("Claim word, no block, amended list", "claimAmendedNoBlock"),
    row("Claim word, no block, a Scout or Lumenloop call, plan list", "claimPlanNoBlockScoutOrLumenloop"),
    row("Claim word, no block, a Scout or Lumenloop call, amended list", "claimAmendedNoBlockScoutOrLumenloop"),
    row("Standalone guard line, static upper bound (A1)", "guardLineUpperBound"),
    row("Standalone guard line, upper bound, panel rows only", "guardLineUpperBoundInPanel"),
    row("An execute string names a research-series identifier", "identifierNamed"),
    row("... and no execute that names one calls research", "identifierWithoutResearch"),
    `| ... share where research is called in a script that names one | ${s.map((x) => `${Math.round(100 * x.researchShareOfNamed)}%`).join(" | ")} |`,
    "",
    `References (amendment A3). With the map, no guard (${scan.references.withMapNoGuard.runs.join(", ")}): block and claim word, plan list ${scan.references.withMapNoGuard.blockAndClaimPlan}, amended list ${scan.references.withMapNoGuard.blockAndClaimAmended}. No map, no guard (${scan.references.noMapNoGuard.runs.join(", ")}): plan list ${scan.references.noMapNoGuard.blockAndClaimPlan}, amended list ${scan.references.noMapNoGuard.blockAndClaimAmended}.`,
    "",
    `Distinct tuning rows with block and a plan-list claim word in some run: ${scan.distinctBlockAndClaimPlanRows.length}, of which in the panel: ${scan.distinctBlockAndClaimPlanRowsInPanel.length}.`,
    "",
    `Guard rows by the plan's rule (block and a plan-list claim word in two or more runs; panel rows), ${scan.guardRowsPlan.length}: ${scan.guardRowsPlan.map((id) => `\`${id}\``).join(", ")}.`,
    "",
    `The same rule with the amended claim words (A3), ${scan.guardRowsAmended.length}: ${scan.guardRowsAmended.map((id) => `\`${id}\``).join(", ")}.`,
    "",
    `Governance-trap panel rows: ${scan.governanceTrapRows.map((id) => `\`${id}\``).join(", ") || "none"}.`,
    "",
    `Guard rows, final (amended-list rule plus the trap rows), ${scan.guardRowsFinal.length}: ${scan.guardRowsFinal.map((id) => `\`${id}\``).join(", ")}. The plan's list with the trap rows, ${scan.guardRowsPlanWithTrap.length}: ${scan.guardRowsPlanWithTrap.map((id) => `\`${id}\``).join(", ")}.`,
    "",
    `Identifier rows (a research-series identifier named in an execute string in two or more runs; panel rows), ${scan.identifierRows.length}: ${scan.identifierRows.map((id) => `\`${id}\``).join(", ")}.`,
    "",
    "| Identifier rows, per stored panel run | Rows | Identifier named | Named, no research call with it | Named, research called |",
    "|---|---:|---:|---:|---:|",
    ...scan.identifierShares.map((r) => `| ${r.label} | ${r.rows} | ${r.namedIdentifier} | ${r.namedAndNoResearch} | ${r.researchWithIdentifier} |`)
  ].join("\n") + "\n";
}

function main() {
  const { values } = parseArgs({
    options: {
      split: { type: "string" },
      catalog: { type: "string", default: "catalog/manifest.json" },
      panel: { type: "string" },
      run: { type: "string", multiple: true },
      json: { type: "boolean", default: false }
    }
  });
  if (!values.split || (values.run?.length ?? 0) < 4) throw new Error("--split and four --run label=path are required");
  const runs = values.run.map((spec) => {
    const at = spec.indexOf("=");
    return { label: spec.slice(0, at), results: JSON.parse(readFileSync(spec.slice(at + 1), "utf8")) };
  });
  const scan = scanCorroboration({
    split: JSON.parse(readFileSync(values.split, "utf8")),
    manifest: JSON.parse(readFileSync(values.catalog, "utf8")),
    panel: values.panel ? JSON.parse(readFileSync(values.panel, "utf8")) : undefined,
    runs
  });
  process.stdout.write(values.json ? `${JSON.stringify(scan, null, 2)}\n` : renderMarkdown(scan));
}

if (import.meta.url === `file://${process.argv[1]}`) main();
