/**
 * Free replay of item 5 over the stored tuning executes. It is skipped unless the environment
 * variables are set, so `npm test` never reads a results file:
 *
 *   RAVEN_REPLAY_SPLIT=<split.json> \
 *   RAVEN_REPLAY_RUNS=baseline=<a.json>,step0prime=<b.json>,arm1=<c.json>,arm3=<d.json>,P0=<e.json>,P1=<f.json>,P1b=<g.json>,P1c=<h.json>,P2=<i.json> \
 *   RAVEN_REPLAY_OUT=<report.json> npx vitest run test/replay-identifier-pointer.test.ts
 *
 * The rows are selected by `sets.tuning` id before any other field is read, and each selection
 * asserts its count. The replay reads the scripts and the result text of each execute entry, and
 * never an answer or a golden. A stored row holds the operations each execute called (the footer
 * of its result) and its script, not the arguments each call received, so the strings a call's
 * arguments can hold come from the script's syntax tree (eval/qa/replay-call-args.mjs). A script
 * value that cannot be followed makes the case ambiguous, and the report counts it apart:
 * - certain: no call to the research operation can have named the identifier, even if every
 *   research call whose arguments could not be followed named every string of the script;
 * - possible: the identifier reaches a call only through an argument that could not be followed.
 * The sentence, the call ledger and the hint builder are the real ones.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
// run.ts is Worker-only; the replay needs only its pure hint builder, not the sandbox.
vi.mock("cloudflare:workers", () => ({ tracing: { trace: async (_name: string, fn: () => unknown) => fn() } }));
vi.mock("@cloudflare/codemode", () => ({ DynamicWorkerExecutor: class DynamicWorkerExecutor {} }));

import { getCatalog } from "../src/catalog/load.ts";
import { evidenceCheckpointBlock } from "../src/policy/evidence-checkpoint.ts";
import { identifierKey, identifierTokens, identifiersInArguments, type IdentifierToken } from "../src/policy/identifier-token.ts";
import { evidenceRecoveryHint, identifierPointersOf, summarizeOperationLedger } from "../src/executor/run.ts";
import type { OpLedgerCall } from "../src/executor/providers.ts";
import { callSitesOf, footerCallsOf, literalsOf } from "../eval/qa/replay-call-args.mjs";
import { identifiersIn, seriesOfCatalog } from "../eval/qa/scan-corroboration.mjs";
import { scriptOf } from "../eval/qa/scan-tuning-exposure.mjs";
import { selectById, tuningIdsOf } from "../eval/qa/tuning-rows.mjs";

const SPLIT = process.env.RAVEN_REPLAY_SPLIT;
const RUNS = process.env.RAVEN_REPLAY_RUNS;
const OUT = process.env.RAVEN_REPLAY_OUT;
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const COMMITTED_SCAN = join(ROOT, ".agents/rounds/2026-11-15-tuning-loop-2/scans/corroboration.json");
const RESEARCH = "scout.searchResearch";
const GROK_CLIP = 20_000;
/** The rows each stored run holds in `sets.tuning`. */
const EXPECTED_ROWS: Record<string, number> = { baseline: 79, step0prime: 50, arm1: 50, arm3: 50, P0: 58, P1: 58, P1b: 10, P1c: 10, P2: 58 };
const RULE_RUNS = ["baseline", "step0prime", "arm1", "arm3"];

type Entry = { tool?: string; input?: unknown; result?: unknown };
type Row = { id: string; transcript?: Entry[] };
type Site = { op: string; strings: string[]; unresolved: boolean };

const isExecute = (entry: Entry) => /(^|__)execute$/.test(String(entry.tool ?? ""));
const keysOf = (tokens: readonly IdentifierToken[]) => new Set(tokens.map(identifierKey));
const keyOfToken = (text: string) => identifierKey(identifierTokens(text, { joinedOnly: true })[0]!);
const HEADER = "\n\n--- EVIDENCE CHECKPOINT ---\n";

describe.skipIf(!SPLIT || !RUNS)("item 5 replay over the stored tuning executes", () => {
  it("fires where a call names a series identifier and no research call can have, and says so per row", () => {
    const catalog = getCatalog();
    const operations = new Set(catalog.entries.filter((entry) => entry.kind === "operation").map((entry) => entry.id));
    const series = new Set(catalog.entries.flatMap((entry) => entry.documentSeries?.values ?? []));
    const tuningIds = tuningIdsOf(JSON.parse(readFileSync(SPLIT!, "utf8")));
    const runs = RUNS!.split(",").map((spec) => {
      const at = spec.indexOf("=");
      const label = spec.slice(0, at);
      const results = JSON.parse(readFileSync(spec.slice(at + 1), "utf8")) as { rows: Row[] };
      return { label, rows: selectById(results.rows, tuningIds, EXPECTED_ROWS[label]!, label) as Row[] };
    });

    /** The strings a call to `op` can hold, across the script's call sites of it. */
    const namedBy = (sites: Site[], op: string, loose: boolean, literals: string[]): string[] => {
      const own = sites.filter((site) => site.op === op);
      // A call the footer lists and the script shows no site for (a helper dispatches it) is unresolved.
      if (own.length === 0) return loose ? literals : [];
      return own.flatMap((site) => (loose && site.unresolved ? [...site.strings, ...literals] : site.strings));
    };

    const catalogSeries = seriesOfCatalog(JSON.parse(readFileSync(join(ROOT, "catalog/manifest.json"), "utf8")));
    const report: Record<string, unknown> = {};
    for (const run of runs) {
      const totals = {
        rows: run.rows.length,
        executes: 0,
        executesWithCalls: 0,
        unparsed: 0,
        opSetDiffersFromFooter: 0,
        namedASeriesIdentifier: 0,
        certainFires: 0,
        possibleOnly: 0,
        sitesUnresolved: 0,
        sites: 0
      };
      const fires: Array<Record<string, unknown>> = [];
      const rowsWithCertain = new Set<string>();
      const rowsWithPossible = new Set<string>();
      const rowsNaming = new Set<string>();
      const series_: Record<string, number> = {};
      const lengths: Array<Record<string, unknown>> = [];
      const opMismatches: Array<Record<string, unknown>> = [];
      const perRow: Record<string, { named: boolean; researchedWithIt: boolean; fires: boolean }> = {};

      for (const row of run.rows) {
        const executes = (row.transcript ?? []).filter(isExecute).map((entry) => {
          const code = scriptOf(entry) as string;
          const result = typeof entry.result === "string" ? entry.result : "";
          const sites = callSitesOf(code, operations) as Site[] | null;
          return { code, result, sites, footer: footerCallsOf(result), literals: sites ? literalsOf(code) : [] };
        });
        executes.forEach((execute, index) => {
          totals.executes += 1;
          if (execute.footer.length === 0) return;
          totals.executesWithCalls += 1;
          if (!execute.sites) {
            totals.unparsed += 1;
            return;
          }
          totals.sites += execute.sites.length;
          totals.sitesUnresolved += execute.sites.filter((site) => site.unresolved).length;
          const siteOps = [...new Set(execute.sites.map((site) => site.op))].sort().join();
          const footerSet = [...new Set(execute.footer.map((call) => call.op))].sort().join();
          if (footerSet !== siteOps) {
            totals.opSetDiffersFromFooter += 1;
            opMismatches.push({ id: row.id, execute: index + 1, footer: footerSet.split(","), script: siteOps.split(",").filter(Boolean) });
          }

          // One ledger entry per call the footer lists; the identifiers come from the script.
          const ledger = (researchLoose: boolean, otherLoose: boolean): OpLedgerCall[] =>
            execute.footer.map((call) => {
              const strings = namedBy(execute.sites!, call.op, call.op === RESEARCH ? researchLoose : otherLoose, execute.literals);
              const identifiers = identifiersInArguments(strings, series);
              return {
                op: call.op,
                outcome: call.outcome,
                hasServiceData: call.outcome === "ok",
                ms: 0,
                ...(identifiers.length > 0 ? { identifiers } : {})
              };
            });
          const certainLedger = ledger(true, false);
          const upperLedger = ledger(false, true);
          const certain = identifierPointersOf(catalog, certainLedger);
          const upper = identifierPointersOf(catalog, upperLedger);
          const certainKeys = new Set(certain.map((pointer) => keyOfToken(pointer.token)));
          const possible = upper.filter((pointer) => !certainKeys.has(keyOfToken(pointer.token)));
          const state = (perRow[row.id] ??= { named: false, researchedWithIt: false, fires: false });
          if ([...certainLedger, ...upperLedger].some((call) => call.identifiers?.length)) {
            totals.namedASeriesIdentifier += 1;
            rowsNaming.add(row.id);
            state.named = true;
          }
          // Strict: only identifiers a research call's own resolved arguments hold.
          if (upperLedger.some((call) => call.op === RESEARCH && call.identifiers?.length)) state.researchedWithIt = true;
          if (certain.length > 0) state.fires = true;
          if (certain.length === 0 && possible.length === 0) return;
          if (certain.length > 0) {
            totals.certainFires += 1;
            rowsWithCertain.add(row.id);
          } else {
            totals.possibleOnly += 1;
          }
          if (possible.length > 0) rowsWithPossible.add(row.id);

          // The same identifier researched in another execute of the row.
          const researchNaming = (other: (typeof executes)[number]) =>
            keysOf(identifiersInArguments(namedBy(other.sites ?? [], RESEARCH, false, other.literals), series));
          const before = new Set(executes.slice(0, index).flatMap((other) => [...researchNaming(other)]));
          const after = new Set(executes.slice(index + 1).flatMap((other) => [...researchNaming(other)]));
          for (const [kind, pointers] of [["certain", certain], ["possible", possible]] as const) {
            for (const pointer of pointers) {
              const key = keyOfToken(pointer.token);
              series_[pointer.series] = (series_[pointer.series] ?? 0) + 1;
              fires.push({
                id: row.id,
                execute: index + 1,
                kind,
                token: pointer.token,
                series: pointer.series,
                // The committed scan reads the same identifier from the script's literals (a dynamic string it cannot).
                inScriptLiterals: new Set(identifiersIn(execute.code, catalogSeries).map(keyOfToken)).has(key),
                researchEarlierInRow: before.has(key),
                researchLaterInRow: after.has(key)
              });
            }
          }

          const hint = evidenceRecoveryHint(certainLedger, summarizeOperationLedger(certainLedger));
          if (hint?.identifier?.length) {
            const withPointer = evidenceCheckpointBlock(hint);
            const without = evidenceCheckpointBlock({ ...hint, identifier: undefined });
            const sentences = evidenceCheckpointBlock({ mode: "pointers-only", sourceOperations: [], candidates: [], identifier: hint.identifier });
            lengths.push({
              id: row.id,
              execute: index + 1,
              sentences: hint.identifier.length,
              beforeCap: new Set(
                certainLedger.flatMap((call) => call.identifiers ?? []).map(identifierKey)
              ).size - new Set(certainLedger.filter((call) => call.op === RESEARCH).flatMap((call) => call.identifiers ?? []).map(identifierKey)).size,
              sentenceChars: sentences.length - HEADER.length,
              addedToResult: withPointer.length - without.length,
              blockWith: withPointer.length,
              blockWithout: without.length,
              storedResultChars: execute.result.length,
              beyondGrokClip: execute.result.length >= GROK_CLIP
            });
          }
        });
      }
      report[run.label] = {
        totals,
        rowsNamingASeriesIdentifier: rowsNaming.size,
        rowsWithCertainFire: [...rowsWithCertain].sort(),
        rowsWithPossibleFire: [...rowsWithPossible].sort(),
        firesBySeries: series_,
        fires,
        lengths,
        opMismatches,
        perRow
      };
    }

    // The rule of the 17 identifier rows: the committed scan's own function over the four stored runs.
    const namesByRun = new Map<string, Set<string>>();
    for (const run of runs.filter((candidate) => RULE_RUNS.includes(candidate.label))) {
      const named = new Set<string>();
      for (const row of run.rows) {
        if ((row.transcript ?? []).filter(isExecute).some((entry) => identifiersIn(scriptOf(entry), catalogSeries).length > 0)) named.add(row.id);
      }
      namesByRun.set(run.label, named);
    }
    const loopOnePanel = new Set(runs.find((run) => run.label === "step0prime")!.rows.map((row) => row.id));
    const identifierRows = [...loopOnePanel]
      .filter((id) => RULE_RUNS.filter((label) => namesByRun.get(label)?.has(id)).length >= 2)
      .sort();
    const committed = (JSON.parse(readFileSync(COMMITTED_SCAN, "utf8")) as { identifierRows: string[] }).identifierRows;
    report.identifierRows = { rows: identifierRows, committedScanRows: committed, equal: JSON.stringify(identifierRows) === JSON.stringify(committed) };

    if (OUT) writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
    console.log(JSON.stringify({ identifierRows: identifierRows.length, equal: (report.identifierRows as { equal: boolean }).equal }));
    expect(identifierRows).toEqual(committed);
    expect(identifierRows).toHaveLength(17);
  }, 300_000);
});
