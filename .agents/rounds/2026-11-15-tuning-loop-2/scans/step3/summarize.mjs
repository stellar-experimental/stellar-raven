#!/usr/bin/env node
/**
 * Tables for STEP-3-IMPL.md from the report that test/replay-identifier-pointer.test.ts writes.
 * Usage: node summarize.mjs <replay-report.json>
 * It reads the report only: counts of executes and rows, the 17 identifier rows, and lengths.
 */
import { readFileSync } from "node:fs";

const report = JSON.parse(readFileSync(process.argv[2], "utf8"));
const seventeen = new Set(report.identifierRows.rows);
const runs = Object.entries(report).filter(([key]) => key !== "identifierRows");
const median = (list) => {
  const sorted = [...list].sort((a, b) => a - b);
  return sorted.length ? sorted[Math.floor(sorted.length / 2)] : null;
};
const pct = (n, d) => (d ? `${Math.round((100 * n) / d)}%` : "n/a");
const out = [];

out.push("## Replay: how often the pointer fires", "");
out.push("| Run | Rows | Executes with calls | Executes naming a series identifier | Executes that fire, certain | Executes that fire, possible only | Rows, certain | Rows, possible | Series that fired |");
out.push("|---|---:|---:|---:|---:|---:|---:|---:|---|");
for (const [label, run] of runs) {
  out.push(
    `| ${label} | ${run.totals.rows} | ${run.totals.executesWithCalls} | ${run.totals.namedASeriesIdentifier} | ${run.totals.certainFires} | ${run.totals.possibleOnly} | ${run.rowsWithCertainFire.length} | ${run.rowsWithPossibleFire.length} | ${Object.entries(run.firesBySeries).map(([s, n]) => `${s} ${n}`).join(", ") || "none"} |`
  );
}

out.push("", "## Replay: against the agent's own research calls", "");
out.push("| Run | Fires | Research for that identifier earlier in the row | Research for it in a later execute of the row | Fires on a row outside the 17 | Fires whose identifier the script's literals do not hold |");
out.push("|---|---:|---:|---:|---:|---:|");
for (const [label, run] of runs) {
  const fires = run.fires.filter((fire) => fire.kind === "certain");
  out.push(
    `| ${label} | ${fires.length} | ${fires.filter((f) => f.researchEarlierInRow).length} | ${fires.filter((f) => f.researchLaterInRow).length} | ${fires.filter((f) => !seventeen.has(f.id)).length} | ${fires.filter((f) => !f.inScriptLiterals).length} |`
  );
}

out.push("", "## The 17 identifier rows, per run", "");
out.push("| Run | Of the 17 rows present | Row names a series identifier in a call | Pointer fires on the row | Research called with a series identifier in the row |");
out.push("|---|---:|---:|---:|---:|");
for (const [label, run] of runs) {
  const rows = Object.entries(run.perRow).filter(([id]) => seventeen.has(id));
  out.push(
    `| ${label} | ${rows.length} | ${rows.filter(([, x]) => x.named).length} | ${rows.filter(([, x]) => x.fires).length} | ${rows.filter(([, x]) => x.researchedWithIt).length} |`
  );
}

out.push("", "## Rows where the pointer fires in at least one stored run (certain)", "");
const byRow = new Map();
for (const [label, run] of runs) {
  for (const fire of run.fires.filter((f) => f.kind === "certain")) {
    const entry = byRow.get(fire.id) ?? { runs: new Set(), tokens: new Set() };
    entry.runs.add(label);
    entry.tokens.add(fire.token.toUpperCase());
    byRow.set(fire.id, entry);
  }
}
out.push("| Row | In the 17 | Runs where it fires | Identifiers |", "|---|---|---:|---|");
for (const [id, entry] of [...byRow.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  out.push(`| \`${id}\` | ${seventeen.has(id) ? "yes" : "no"} | ${entry.runs.size} | ${[...entry.tokens].sort().join(", ")} |`);
}

out.push("", "## Replay: measured lengths (characters)", "");
out.push("| Run | Firing executes | Sentences per execute (max) | Executes with more than three identifiers (cap drops the rest) | One sentence, min to max | All sentences of an execute, median / max | Added to the result, median / max | Stored result of a firing execute, median / max | Firing executes with a stored result of 20,000 or more |");
out.push("|---|---:|---:|---:|---|---|---|---|---:|");
for (const [label, run] of runs) {
  const rows = run.lengths;
  if (rows.length === 0) {
    out.push(`| ${label} | 0 | | | | | | | |`);
    continue;
  }
  const one = rows.filter((r) => r.sentences === 1).map((r) => r.sentenceChars);
  out.push(
    `| ${label} | ${rows.length} | ${Math.max(...rows.map((r) => r.sentences))} | ${rows.filter((r) => r.beforeCap > 3).length} | ${one.length ? `${Math.min(...one)} to ${Math.max(...one)}` : "n/a"} | ${median(rows.map((r) => r.sentenceChars))} / ${Math.max(...rows.map((r) => r.sentenceChars))} | ${median(rows.map((r) => r.addedToResult))} / ${Math.max(...rows.map((r) => r.addedToResult))} | ${median(rows.map((r) => r.storedResultChars))} / ${Math.max(...rows.map((r) => r.storedResultChars))} | ${rows.filter((r) => r.beyondGrokClip).length} |`
  );
}
const pooled = runs.filter(([label]) => !["P1b", "P1c"].includes(label)).flatMap(([, run]) => run.lengths);
out.push("", `Pooled over the seven full runs (${pooled.length} firing executes): one sentence ${Math.min(...pooled.filter((r) => r.sentences === 1).map((r) => r.sentenceChars))} to ${Math.max(...pooled.filter((r) => r.sentences === 1).map((r) => r.sentenceChars))}; the checkpoint block without the pointer, median ${median(pooled.map((r) => r.blockWithout))}, with it, median ${median(pooled.map((r) => r.blockWith))}; the stored result, median ${median(pooled.map((r) => r.storedResultChars))}, so the pointer is ${pct(median(pooled.map((r) => r.addedToResult)), median(pooled.map((r) => r.storedResultChars)))} of a median firing result.`);

out.push("", "## Replay: what the static reading could not see", "");
out.push("| Run | Call sites | Sites with an argument it could not follow | Executes whose script shows a different operation set from the result's footer |");
out.push("|---|---:|---:|---:|");
for (const [label, run] of runs) out.push(`| ${label} | ${run.totals.sites} | ${run.totals.sitesUnresolved} | ${run.totals.opSetDiffersFromFooter} |`);
process.stdout.write(`${out.join("\n")}\n`);
