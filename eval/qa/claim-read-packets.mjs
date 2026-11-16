#!/usr/bin/env node
/**
 * Packets for the governance and attribution read (tuning loop 2, amendments A2 and A3).
 *
 * For every stored pass whose answer holds a claim word (A3's list), this writes one Markdown file
 * with the question, the sentences the word scan picked, the full final answer, and each `execute`
 * script with its full result as the agent saw it. A reader (a person or a subagent, with
 * `claim-read-brief.md`) assigns support and form to each audit, incident, governance or
 * standards-authorship statement; the scan never judges. Results are written in full: a cut result
 * produces false "no support" findings.
 *
 * Hygiene: the split file is read for `sets.tuning` only and each results file is filtered by that
 * id list before any other row field is read. No model call.
 *
 * Usage: node eval/qa/claim-read-packets.mjs --split <split.json> --out <dir> [--require-block]
 *          --run <label>=<results.json> ... [--expected <label>=<rows>] ...
 * A baseline file holds every tuning row and a panel run 50; `--expected` states the count per label
 * (default 50, `baseline` the tuning row count).
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { CLAIM_PATTERNS, claimSentences, claimWordsIn } from "./corroboration-rubric.mjs";
import { scriptOf } from "./scan-tuning-exposure.mjs";
import { selectById, tuningIdsOf } from "./tuning-rows.mjs";

const isExecute = (entry) => /(^|__)execute$/.test(String(entry?.tool ?? ""));
const BLOCK = "--- CANDIDATE EVIDENCE ---";

/** The packet text of one stored pass, or null when the answer holds no claim word. */
export function packetOf(label, row, { requireBlock = false } = {}) {
  const answer = String(row.answer ?? "");
  if (!claimWordsIn(answer, CLAIM_PATTERNS).length) return null;
  const executes = (row.transcript ?? []).filter(isExecute);
  const hasBlock = executes.some((e) => String(e.result ?? "").includes(BLOCK));
  if (requireBlock && !hasBlock) return null;
  const parts = [
    `# ${label} / ${row.id}`,
    "",
    `Candidate block shown in a result: ${hasBlock}`,
    "",
    "## Question",
    String(row.question ?? ""),
    "",
    "## Sentences with a claim word (picked by a scan; you decide which state an audit, incident, governance-status or standards-authorship fact)",
    ...claimSentences(answer).map((s) => `- ${s}`),
    "",
    "## Full final answer",
    answer,
    ""
  ];
  executes.forEach((entry, index) => {
    const result = String(entry.result ?? "");
    parts.push(
      `## Execute call ${index + 1}: script`,
      "```js",
      scriptOf(entry),
      "```",
      `## Execute call ${index + 1}: result as the agent saw it (${result.length} chars)`,
      "```",
      result,
      "```",
      ""
    );
  });
  return { text: parts.join("\n"), hasBlock };
}

function main() {
  const { values } = parseArgs({
    options: {
      split: { type: "string" },
      out: { type: "string" },
      run: { type: "string", multiple: true },
      expected: { type: "string", multiple: true },
      "require-block": { type: "boolean", default: false }
    }
  });
  if (!values.split || !values.out || !values.run?.length) throw new Error("--split, --out and --run are required");
  const ids = tuningIdsOf(JSON.parse(readFileSync(values.split, "utf8")));
  const expected = Object.fromEntries((values.expected ?? []).map((spec) => spec.split("=")));
  mkdirSync(values.out, { recursive: true });
  const index = {};
  for (const spec of values.run) {
    const at = spec.indexOf("=");
    const label = spec.slice(0, at);
    const results = JSON.parse(readFileSync(spec.slice(at + 1), "utf8"));
    const count = Number(expected[label] ?? (label === "baseline" ? ids.length : 50));
    const rows = selectById(results.rows, ids, count, label);
    index[label] = [];
    for (const row of rows) {
      const packet = packetOf(label, row, { requireBlock: values["require-block"] });
      if (!packet) continue;
      const file = `${values.out}/${label}__${row.id}.md`;
      writeFileSync(file, packet.text);
      index[label].push({ id: row.id, file, block: packet.hasBlock, chars: packet.text.length });
    }
    console.log(`${label}: ${index[label].length} packets of ${rows.length} rows`);
  }
  writeFileSync(`${values.out}/index.json`, `${JSON.stringify(index, null, 1)}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
