// Static check: in the stored execute scripts of the tuning rows, does any text hold an identifier-shaped
// token that the kept rule treats differently from the loop 1 matcher (title-case letters, or more than
// six digits) with letters equal to a value of a Scout `source` enum? Rows are selected by tuning id first.
import { readFileSync } from "node:fs";
import { scriptOf } from "/home/tyler/code/raven-wt/loop2/eval/qa/scan-tuning-exposure.mjs";
import { tuningIdsOf, selectById } from "/home/tyler/code/raven-wt/loop2/eval/qa/tuning-rows.mjs";
const split = JSON.parse(readFileSync("/home/tyler/backups/gca-2026-11-14-split-v2.json", "utf8"));
const manifest = JSON.parse(readFileSync("/home/tyler/code/raven-wt/loop2/catalog/manifest.json", "utf8"));
const series = new Set();
const research = manifest.entries.find((e) => e.id === "scout.searchResearch");
for (const v of research.inputSchema.properties.source.enum) if (/^[a-z]+$/.test(v)) series.add(v);
const RE = /\b([A-Za-z]+)[- ]?(\d+)\b(?![-.]\d)/g;
const dir = "/home/tyler/code/raven-wt/gca-eval/eval/qa/results/";
const ids = tuningIdsOf(split);
const runs = { P0: ["2026-11-15T04-31-41", 58], P1p1: ["2026-11-15T05-28-42", 58], P1p2: ["2026-11-15T05-38-45", 10], P1p3: ["2026-11-15T05-45-31", 10], P2: ["2026-11-15T07-33-40", 58], Rp1: ["2026-11-15T08-55-41", 17], Rp2: ["2026-11-15T09-08-35", 17], loop1: ["2026-11-14T20-13-51", 79] };
const out = [];
for (const [name, [stamp, count]] of Object.entries(runs)) {
  const results = JSON.parse(readFileSync(`${dir}${stamp}-variantA.json`, "utf8"));
  const rows = selectById(results.results ?? results.rows, ids, count, name);
  let executes = 0, tokens = 0; const hits = [];
  for (const row of rows) for (const entry of row.transcript ?? []) {
    if (!/(^|__)execute$/.test(String(entry.tool ?? ""))) continue;
    executes += 1;
    const code = scriptOf(entry);
    for (const m of code.matchAll(RE)) {
      if (!series.has(m[1].toLowerCase())) continue;
      tokens += 1;
      if (/^[A-Z][a-z]+$/.test(m[1]) || m[2].length > 6) hits.push({ row: row.id, token: m[0] });
    }
  }
  out.push({ run: name, rows: rows.length, executes, seriesTokens: tokens, differing: hits.length, hits: hits.slice(0, 5) });
}
console.log(JSON.stringify({ series: [...series].sort() }));
for (const o of out) console.log(JSON.stringify(o));
