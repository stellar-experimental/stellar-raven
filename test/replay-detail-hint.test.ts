/**
 * Free replay of arm 1 over the stored tuning transcripts. It is skipped unless the three
 * environment variables are set, so `npm test` never reads a results file:
 *
 *   RAVEN_REPLAY_SPLIT=<split.json> RAVEN_REPLAY_RESULTS=<results.json> RAVEN_REPLAY_OUT=<report.json> \
 *     npx vitest run test/replay-detail-hint.test.ts
 *
 * Each stored `execute` script is reduced to its operation ids, every id is assumed to have
 * succeeded with rows, and the ids go through the real hint builder. The rows are selected by
 * `sets.tuning` id before any other field is read (see eval/qa/scan-tuning-exposure.mjs).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
// run.ts is Worker-only; the replay needs only its pure hint builder, not the sandbox.
vi.mock("cloudflare:workers", () => ({ tracing: { trace: async (_name: string, fn: () => unknown) => fn() } }));
vi.mock("@cloudflare/codemode", () => ({ DynamicWorkerExecutor: class DynamicWorkerExecutor {} }));

import { getCatalog } from "../src/catalog/load.ts";
import { evidenceCheckpointBlock } from "../src/policy/evidence-checkpoint.ts";
import { evidenceRecoveryHint, summarizeOperationLedger } from "../src/executor/run.ts";
import type { OpLedgerCall } from "../src/executor/providers.ts";
import { scriptOf, selectTuningRows } from "../eval/qa/scan-tuning-exposure.mjs";
import { TUNING_ROW_COUNT } from "../eval/qa/tuning-rows.mjs";

const SPLIT = process.env.RAVEN_REPLAY_SPLIT;
const RESULTS = process.env.RAVEN_REPLAY_RESULTS;
const OUT = process.env.RAVEN_REPLAY_OUT;

type Entry = { tool?: string; input?: unknown; result?: unknown };
const OP_RE = /\b(lumenloop|scout|stellarDocs)\.([A-Za-z_]\w*)\b/g;
const CHECKPOINT_RE = /\n\n--- EVIDENCE CHECKPOINT ---\n([\s\S]*?)(?=\n\n--- |$)/;
const DOCS_SEARCH = /^stellarDocs\.search_/;

describe.skipIf(!SPLIT || !RESULTS)("arm 1 replay over the stored tuning executes", () => {
  it("puts the detail sentence on exactly the executes with a Docs search and no page read", () => {
    const catalog = getCatalog();
    const operations = new Set(catalog.entries.filter((e) => e.kind === "operation").map((e) => e.id));
    const rows = selectTuningRows({
      split: JSON.parse(readFileSync(SPLIT!, "utf8")),
      results: JSON.parse(readFileSync(RESULTS!, "utf8"))
    }) as Array<{ id: string; transcript?: Entry[] }>;
    expect(rows).toHaveLength(TUNING_ROW_COUNT);

    const totals = {
      executes: 0,
      withDocsSearchNoPage: 0,
      detailOnExecutes: 0,
      detailOnWrongExecute: 0,
      missingDetail: 0,
      alternatives: { identical: 0, replayOnly: 0, storedOnly: 0, differ: 0, bothNone: 0 }
    };
    const rowsWithDetail: string[] = [];
    const rowsExposedByScan: string[] = [];
    const mismatches: Array<{ id: string; kind: string; stored?: string; replay?: string }> = [];

    for (const row of rows) {
      let anySentence = false;
      let pageReadAnywhere = false;
      let docsSearchAnywhere = false;
      for (const entry of row.transcript ?? []) {
        if (!/(^|__)execute$/.test(String(entry.tool ?? ""))) continue;
        const code = scriptOf(entry);
        const ids = [...new Set([...code.matchAll(OP_RE)].map((m) => `${m[1]}.${m[2]}`))].filter((id) =>
          operations.has(id)
        );
        const ledger: OpLedgerCall[] = ids.map((op) => ({ op, outcome: "ok", hasServiceData: true, ms: 0 }));
        const hint = evidenceRecoveryHint(ledger, summarizeOperationLedger(ledger));
        const expectDetail = ids.some((id) => DOCS_SEARCH.test(id)) && !ids.includes("stellarDocs.get_doc_page");
        if (ids.some((id) => DOCS_SEARCH.test(id))) docsSearchAnywhere = true;
        if (ids.includes("stellarDocs.get_doc_page")) pageReadAnywhere = true;
        totals.executes += 1;
        if (expectDetail) totals.withDocsSearchNoPage += 1;
        const hasDetail = (hint?.detail?.length ?? 0) > 0;
        if (hasDetail && expectDetail) {
          totals.detailOnExecutes += 1;
          anySentence = true;
        }
        if (hasDetail && !expectDetail) totals.detailOnWrongExecute += 1;
        if (!hasDetail && expectDetail) totals.missingDetail += 1;

        const stored = CHECKPOINT_RE.exec(typeof entry.result === "string" ? entry.result : "")?.[1];
        const alternativesOnly = hint?.candidates.length ? { ...hint, detail: undefined } : undefined;
        const replay = evidenceCheckpointBlock(alternativesOnly).replace(/^\n\n--- EVIDENCE CHECKPOINT ---\n/, "");
        const bucket = totals.alternatives;
        if (stored === undefined && replay === "") bucket.bothNone += 1;
        else if (stored === undefined) {
          bucket.replayOnly += 1;
          mismatches.push({ id: row.id, kind: "replay-only" });
        } else if (replay === "") {
          bucket.storedOnly += 1;
          mismatches.push({ id: row.id, kind: "stored-only", stored: stored.slice(0, 160) });
        } else if (stored === replay) bucket.identical += 1;
        else {
          bucket.differ += 1;
          mismatches.push({ id: row.id, kind: "differ", stored: stored.slice(0, 220), replay: replay.slice(0, 220) });
        }
      }
      if (anySentence) rowsWithDetail.push(row.id);
      if (docsSearchAnywhere && !pageReadAnywhere) rowsExposedByScan.push(row.id);
    }

    const report = {
      totals,
      rowsWithDetailSentence: rowsWithDetail.length,
      rowsExposedNoPageAnywhere: rowsExposedByScan.length,
      exposedRowsWithoutSentence: rowsExposedByScan.filter((id) => !rowsWithDetail.includes(id)),
      mismatches
    };
    if (OUT) writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
    console.log(JSON.stringify({ ...report, mismatches: mismatches.length }));

    expect(totals.detailOnWrongExecute).toBe(0);
    expect(totals.missingDetail).toBe(0);
    expect(report.exposedRowsWithoutSentence).toEqual([]);
  });
});
