/**
 * Freeze arm 3's arm 2 exclusion list BEFORE any verdict is read (ARM-3-REVIEW.md 7.3.2).
 *
 *   npx tsx .agents/rounds/2026-11-14-baseline-tuning/arm3/freeze-exclusion.mts \
 *     <step-0-prime results.json> <panel ids, comma separated> <out.json>
 *
 * Reads, for the 50 panel ids only, each row's execute scripts (tool inputs). It never touches a verdict, an answer
 * or a judge field. Each `scout.searchResearch` call a script makes is captured in a stub sandbox (as the arm 2 replay
 * does), repeated read-only against live Scout through the real operation wrapper, and a row is "arm 2 exposed" when
 * any of its calls gets an exact row. No model is called.
 */
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";
import { loadManifest } from "../../../../src/catalog/search.ts";
import { buildOpsFns } from "../../../../src/executor/providers.ts";
import { scanTranscript, scriptOf } from "../../../../eval/qa/scan-tuning-exposure.mjs";

const [resultsPath, idsArg, outPath] = process.argv.slice(2);
const ids = idsArg.split(",");
if (ids.length !== 50 || new Set(ids).size !== 50) throw new Error("panel must be 50 unique ids");

async function captureResearchArgs(code: string): Promise<Array<Record<string, unknown>>> {
  const captured: Array<Record<string, unknown>> = [];
  const deep: unknown = new Proxy(function () {}, {
    get: (_t, key) => (key === "then" ? undefined : deep),
    apply: () => Promise.resolve({ ok: true, data: {} })
  });
  const namespace = (service: string) =>
    new Proxy({}, {
      get: (_t, op) => (args: Record<string, unknown>) => {
        if (service === "scout" && op === "searchResearch" && args && typeof args === "object") captured.push(args);
        return Promise.resolve({ ok: true, data: { results: [], hits: [], items: [], meta: {} } });
      }
    });
  const sandbox = { scout: namespace("scout"), lumenloop: namespace("lumenloop"), stellarDocs: namespace("stellarDocs"), codemode: deep, console: { log() {} } };
  try {
    const run = vm.runInNewContext(`(${code})()`, sandbox, { timeout: 2000 }) as Promise<unknown>;
    await Promise.race([run, new Promise((resolve) => setTimeout(resolve, 1500))]);
  } catch {
    // a script that fails after its first research calls still yielded those calls
  }
  return captured;
}

const all = JSON.parse(readFileSync(resultsPath, "utf8")).rows as Array<{ id: string; transcript?: Array<{ tool?: string; input?: unknown }> }>;
const want = new Set(ids);
const rows = all.filter((r) => want.has(r.id)).map((r) => ({ id: r.id, transcript: r.transcript })); // ids first; nothing else is kept
if (rows.length !== 50) throw new Error(`panel rows ${rows.length}`);

const catalog = loadManifest(JSON.parse(readFileSync("catalog/manifest.json", "utf8")));
const ops = buildOpsFns(catalog, {}, {});
const report: Array<Record<string, unknown>> = [];
const seen = new Set<string>();
for (const row of rows.sort((a, b) => a.id.localeCompare(b.id))) {
  const scan = scanTranscript(row.transcript);
  for (const entry of row.transcript ?? []) {
    if (!/(^|__)execute$/.test(String(entry.tool ?? ""))) continue;
    for (const args of await captureResearchArgs(scriptOf(entry))) {
      const key = `${row.id}|${JSON.stringify(args)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      type Reply = { ok: boolean; exactRows?: Array<{ index: number; key: string }>; error?: { status?: number } };
      const call = () => (ops.scout!.searchResearch as (a: unknown) => Promise<Reply>)(args);
      let result = await call();
      for (let attempt = 0; attempt < 3 && !result.ok && result.error?.status === 429; attempt++) {
        await new Promise((resolve) => setTimeout(resolve, 16_000));
        result = await call();
      }
      report.push({ row: row.id, query: String(args.q ?? args.query ?? ""), ok: result.ok, exactKeys: (result.exactRows ?? []).map((r) => r.key), scanArm2Exposed: scan.arm2Exposed });
      await new Promise((resolve) => setTimeout(resolve, 1_600));
    }
  }
}
const excluded = [...new Set(report.filter((r) => (r.exactKeys as string[]).length > 0).map((r) => String(r.row)))].sort();
const scanOnly = rows.filter((r) => scanTranscript(r.transcript).arm2Exposed).map((r) => r.id).sort().filter((id) => !excluded.includes(id));
const out = {
  method: "step 0-prime stored research queries, replayed live read-only; exposed = any call gets an exact row; no verdict read",
  source: resultsPath.split("/").pop(),
  researchCallsReplayed: report.length,
  callsWithExactRow: report.filter((r) => (r.exactKeys as string[]).length > 0).length,
  failedCalls: report.filter((r) => !r.ok).length,
  excludedIds: excluded,
  excludedSha256: createHash("sha256").update(excluded.join("\n")).digest("hex"),
  scanExposedButNoExactRow: scanOnly,
  calls: report
};
writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`);
console.log(JSON.stringify({ n: excluded.length, excluded, sha256: out.excludedSha256, calls: report.length, withExact: out.callsWithExactRow, failed: out.failedCalls, scanOnly }));
