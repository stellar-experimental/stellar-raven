#!/usr/bin/env node
/**
 * diff-pins.mjs — print a unified diff of skill BODIES between two manifests.
 *
 * The review gate for re-pinning. Skill markdown is prompt input, and pinning by
 * hash means a re-pin commit shows only sha changes — the text itself never
 * reaches `git diff` the way it did when bodies were vendored. This fetches both
 * the old and new pinned bytes and prints the actual difference, so the human
 * running `update.sh` sees what the model will start reading.
 *
 * Writes nothing to the repo: the diff is terminal output by design (committing
 * it would re-introduce the vendored copy this design removes).
 *
 * Usage: node scripts/diff-pins.mjs <old-manifest.json> <new-manifest.json>
 * Exit 0 always on success, whether or not anything changed; non-zero only if a
 * pinned file could not be fetched (fail closed — an unreviewable pin is not
 * a reviewed pin).
 */
import { readFileSync } from "node:fs";
import { scrubNonExposedRefs } from "./exposure.mjs";
import { readSkillFile } from "./lib/skill-mirror.mjs";

const [, , oldPath, newPath] = process.argv;
if (!oldPath || !newPath) {
  console.error("usage: diff-pins.mjs <old-manifest.json> <new-manifest.json>");
  process.exit(2);
}

const index = (manifest) => {
  const out = new Map();
  for (const source of manifest.sources) {
    for (const skill of source.skills) {
      for (const file of skill.files ?? []) {
        if (!file.path.endsWith(".md")) continue;
        out.set(`${source.id}/${skill.name}/${file.path}`, { source, skill, file });
      }
    }
  }
  return out;
};

const before = index(JSON.parse(readFileSync(oldPath, "utf8")));
const after = index(JSON.parse(readFileSync(newPath, "utf8")));

/** Minimal unified diff — no dependency, and the output only has to be readable. */
function unified(a, b, label) {
  const x = a.split("\n");
  const y = b.split("\n");
  const lines = [`--- a/${label}`, `+++ b/${label}`];
  // Longest common subsequence over lines; corpora are a few hundred lines.
  const m = x.length;
  const n = y.length;
  const lcs = Array.from({ length: m + 1 }, () => new Uint32Array(n + 1));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      lcs[i][j] = x[i] === y[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (x[i] === y[j]) {
      i++;
      j++;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      lines.push(`- ${x[i++]}`);
    } else {
      lines.push(`+ ${y[j++]}`);
    }
  }
  while (i < m) lines.push(`- ${x[i++]}`);
  while (j < n) lines.push(`+ ${y[j++]}`);
  return lines;
}

/** Surface any sentence narrowed by the exposure scrub so the reviewer reads the served wording. */
function reportScrubNarrowings(text, key) {
  const narrowed = [];
  try {
    scrubNonExposedRefs(text, key, { onNarrow: (change) => narrowed.push(change) });
  } catch (e) {
    console.log(`### SCRUB BLOCKED ${key}: ${e.message}`);
    return;
  }
  if (narrowed.length === 0) return;
  console.log(`### SCRUB NARROWED ${narrowed.length} sentence(s) in ${key} (review the served wording):`);
  for (const { before, after } of narrowed) {
    console.log(`- before: ${before}`);
    console.log(`+ after:  ${after}`);
  }
}

let changed = 0;
for (const [key, next] of after) {
  const prev = before.get(key);
  if (prev && prev.file.sha === next.file.sha) continue;
  changed++;
  if (!prev) {
    // A brand-new file is the case with the MOST unreviewed prompt input, not
    // the least: every byte is incoming. Print it in full — a header alone let
    // an operator "review" an upstream addition or rename without ever seeing
    // the text, then truthfully attest to it.
    console.log(`\n### NEW ${key} (${next.file.size} bytes)`);
    console.log("### Entirely new prompt input — review it in full.");
    const newText = await readSkillFile(next.source, next.skill.name, next.file);
    for (const line of unified("", newText, key)) {
      console.log(line);
    }
    reportScrubNarrowings(newText, key);
    continue;
  }
  // The NEW bytes are mandatory — you cannot review what you cannot read. The
  // OLD bytes are best-effort: if upstream force-pushed and GC'd the commit we
  // are pinned to, the old side is simply gone. Aborting there would brick the
  // re-pin in the exact disaster this tool exists to help recover from (dead
  // pin, failing reads, and the fix refusing to run because it cannot draw a
  // two-sided diff). The gate is "a human saw what is coming IN", not "a human
  // saw a diff".
  const newText = await readSkillFile(next.source, next.skill.name, next.file);
  let oldText = null;
  try {
    oldText = await readSkillFile(prev.source, prev.skill.name, prev.file);
  } catch (e) {
    console.log(`\n### CHANGED ${key}`);
    console.log(`### ${prev.file.sha.slice(0, 12)} -> ${next.file.sha.slice(0, 12)}`);
    console.log(`### OLD SIDE UNAVAILABLE (${e.message})`);
    console.log("### Showing the incoming file in full — review it as if new.");
    for (const line of unified("", newText, key)) console.log(line);
    reportScrubNarrowings(newText, key);
    continue;
  }
  console.log(`\n### CHANGED ${key}`);
  console.log(`### ${prev.file.sha.slice(0, 12)} -> ${next.file.sha.slice(0, 12)}`);
  for (const line of unified(oldText, newText, key)) console.log(line);
  reportScrubNarrowings(newText, key);
}
for (const key of before.keys()) {
  if (!after.has(key)) {
    changed++;
    console.log(`\n### REMOVED ${key}`);
  }
}
console.log(changed === 0 ? "\nNo skill body changed." : `\n${changed} skill file(s) changed.`);
