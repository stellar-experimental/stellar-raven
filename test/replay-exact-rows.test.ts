/**
 * Free, read-only check of arm 2 against live Scout research. Skipped unless the environment names
 * the stored results and the split, and RAVEN_REPLAY_LIVE=1 allows the network reads:
 *
 *   RAVEN_REPLAY_SPLIT=<split.json> RAVEN_REPLAY_RESULTS=<results.json> RAVEN_REPLAY_LIVE=1 \
 *     RAVEN_REPLAY_OUT=<report.json> npx vitest run test/replay-exact-rows.test.ts
 *
 * Step A runs each stored tuning `execute` script in a stub sandbox and records the arguments of
 * every `scout.searchResearch` call it makes before it stops. Step B repeats those calls, plus a
 * few fixed identifier probes, against the live Scout API through the real operation wrapper and
 * records which rows the host marks exact. No model is called. Rows are selected by `sets.tuning`
 * id before any other field is read.
 */
import { readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";
import { describe, expect, it } from "vitest";
import { loadManifest } from "../src/catalog/search.ts";
import { buildOpsFns, type OpLedgerCall } from "../src/executor/providers.ts";
import { scriptOf, selectTuningRows } from "../eval/qa/scan-tuning-exposure.mjs";

const SPLIT = process.env.RAVEN_REPLAY_SPLIT;
const RESULTS = process.env.RAVEN_REPLAY_RESULTS;
const OUT = process.env.RAVEN_REPLAY_OUT;
const LIVE = process.env.RAVEN_REPLAY_LIVE === "1";

const PROBES = ["SEP-43", "SEP-53", "SEP-57", "SEP-45", "CAP-33", "CAP-38", "SEP-12", "SEP-1", "SEP-9999"];

async function captureResearchArgs(code: string): Promise<Array<Record<string, unknown>>> {
  const captured: Array<Record<string, unknown>> = [];
  const deep: unknown = new Proxy(function () {}, {
    get: (_t, key) => (key === "then" ? undefined : deep),
    apply: () => Promise.resolve({ ok: true, data: {} })
  });
  const namespace = (service: string) =>
    new Proxy(
      {},
      {
        get: (_t, op) => (args: Record<string, unknown>) => {
          if (service === "scout" && op === "searchResearch" && args && typeof args === "object") captured.push(args);
          return Promise.resolve({ ok: true, data: { results: [], hits: [], items: [], meta: {} } });
        }
      }
    );
  const sandbox = {
    scout: namespace("scout"),
    lumenloop: namespace("lumenloop"),
    stellarDocs: namespace("stellarDocs"),
    codemode: deep,
    console: { log() {} }
  };
  try {
    const run = vm.runInNewContext(`(${code})()`, sandbox, { timeout: 2000 }) as Promise<unknown>;
    await Promise.race([run, new Promise((resolve) => setTimeout(resolve, 1500))]);
  } catch {
    // A script that fails after its first research calls still yielded those calls.
  }
  return captured;
}

describe.skipIf(!SPLIT || !RESULTS || !LIVE)("arm 2 against live Scout research", () => {
  it("marks the document a query names, and only that", async () => {
    const catalog = loadManifest(JSON.parse(readFileSync("catalog/manifest.json", "utf8")));
    const ledger: OpLedgerCall[] = [];
    const ops = buildOpsFns(catalog, {}, { onOpCall: (call) => ledger.push(call) });
    const rows = selectTuningRows({
      split: JSON.parse(readFileSync(SPLIT!, "utf8")),
      results: JSON.parse(readFileSync(RESULTS!, "utf8"))
    }) as Array<{ id: string; transcript?: Array<{ tool?: string; input?: unknown }> }>;

    const calls: Array<{ row: string; args: Record<string, unknown> }> = [];
    const seen = new Set<string>();
    for (const row of rows) {
      for (const entry of row.transcript ?? []) {
        if (!/(^|__)execute$/.test(String(entry.tool ?? ""))) continue;
        for (const args of await captureResearchArgs(scriptOf(entry))) {
          const key = `${row.id}|${JSON.stringify(args)}`;
          if (!seen.has(key)) {
            seen.add(key);
            calls.push({ row: row.id, args });
          }
        }
      }
    }
    for (const probe of PROBES) calls.push({ row: "(probe)", args: { query: probe } });

    const report = [];
    for (const { row, args } of calls) {
      const before = ledger.length;
      type Reply = {
        ok: boolean;
        caveat?: string;
        exactRows?: Array<{ index: number; key: string }>;
        data?: { results?: Array<{ source?: string; url?: string }> };
        error?: { kind: string; status?: number };
      };
      const call = () => (ops.scout!.searchResearch as (a: unknown) => Promise<Reply>)(args);
      let result = await call();
      // Scout rate-limits a burst with 429 and a short retry-after; wait it out, at most three times.
      for (let attempt = 0; attempt < 3 && !result.ok && result.error?.status === 429; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 16_000));
        result = await call();
      }
      const results = result.data?.results ?? [];
      report.push({
        row,
        query: String(args.q ?? args.query ?? ""),
        ok: result.ok,
        errorKind: result.ok ? undefined : result.error?.kind,
        caveat: result.caveat,
        rows: results.length,
        exactRows: result.exactRows ?? [],
        exactUrls: (result.exactRows ?? []).map((r) => results[r.index]?.url),
        top3: results.slice(0, 3).map((r) => `${r.source}:${String(r.url).split("/").at(-1)}`),
        ledgerExact: ledger.slice(before).flatMap((c) => c.exactRows ?? []).length
      });
      await new Promise((resolve) => setTimeout(resolve, 1_600));
    }
    if (OUT) writeFileSync(OUT, `${JSON.stringify(report, null, 2)}\n`);
    console.log(`research calls replayed: ${report.length}; with an exact row: ${report.filter((r) => r.exactRows.length).length}`);
    expect(report.length).toBeGreaterThan(PROBES.length);
  }, 900_000);
});
