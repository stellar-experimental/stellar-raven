/**
 * Free replay of the corroboration guard over the stored tuning transcripts. It is skipped unless
 * the environment names the split and results files, so `npm test` never reads a results file:
 *
 *   RAVEN_REPLAY_SPLIT=<split.json> RAVEN_REPLAY_RESULTS=<run1.json,run2.json,...> \
 *     RAVEN_REPLAY_OUT=<report.json> npx vitest run test/replay-guard.test.ts
 *
 * For every stored `execute` result that carries the CANDIDATE EVIDENCE block, the replay rebuilds
 * the block from its call count with the current code and asserts the stored text is that block
 * without the guard: the guard is the only difference, it ends the block, and nothing else in the
 * result moves. Rows are selected by `sets.tuning` id before any other field is read. No model is
 * called.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import { describe, expect, it } from "vitest";
import { CORROBORATION_GUARD } from "../src/policy/corroboration.ts";
import { candidateEvidenceBlock } from "../src/policy/evidence-checkpoint.ts";
import { scriptOf } from "../eval/qa/scan-tuning-exposure.mjs";
import { selectById, tuningIdsOf } from "../eval/qa/tuning-rows.mjs";

const SPLIT = process.env.RAVEN_REPLAY_SPLIT;
const RESULTS = process.env.RAVEN_REPLAY_RESULTS;
const OUT = process.env.RAVEN_REPLAY_OUT;

type Entry = { tool?: string; input?: unknown; result?: unknown };
const BLOCK_START = "\n\n--- CANDIDATE EVIDENCE ---\n";
const COUNT_RE = /^This run used (\d+) semantic, research, A\/V, or fallback-directory call\(s\)\./;

describe.skipIf(!SPLIT || !RESULTS)("guard replay over stored tuning executes", () => {
  it("adds the guard to the end of every stored candidate block and nothing else", () => {
    const ids = tuningIdsOf(JSON.parse(readFileSync(SPLIT!, "utf8")));
    const report: Array<Record<string, unknown>> = [];
    // The first file is the baseline (every tuning row); every other file is a stored panel run (50).
    for (const [index, path] of RESULTS!.split(",").entries()) {
      const results = JSON.parse(readFileSync(path, "utf8"));
      const rows = selectById<{ id: string; transcript?: Entry[] }>(results.rows, ids, index === 0 ? ids.length : 50, path);
      let executes = 0;
      let withBlock = 0;
      let matching = 0;
      const mismatches: string[] = [];
      for (const row of rows) {
        for (const entry of row.transcript ?? []) {
          if (!/(^|__)execute$/.test(String(entry.tool ?? ""))) continue;
          executes += 1;
          const result = String(entry.result ?? "");
          const start = result.indexOf(BLOCK_START);
          if (start < 0) continue;
          withBlock += 1;
          const afterStart = start + BLOCK_START.length;
          const next = result.indexOf("\n\n--- ", afterStart);
          const stored = result.slice(start, next < 0 ? undefined : next);
          const count = Number(COUNT_RE.exec(result.slice(afterStart))?.[1]);
          const before = candidateEvidenceBlock(count).slice(0, -(CORROBORATION_GUARD.length + 1));
          // The stored block is the pre-guard block, then any exact-row exception.
          const guarded = candidateEvidenceBlock(count);
          const replayed = result.slice(0, start) + guarded + stored.slice(before.length) + (next < 0 ? "" : result.slice(next));
          if (stored.startsWith(before) && replayed.replace(` ${CORROBORATION_GUARD}`, "") === result) matching += 1;
          else mismatches.push(`${row.id}: ${String(scriptOf(entry)).slice(0, 60)}`);
        }
      }
      report.push({ run: basename(path), rows: rows.length, executes, withBlock, matching, mismatches });
      expect(mismatches, path).toEqual([]);
      expect(matching).toBe(withBlock);
    }
    if (OUT) writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
  });
});
