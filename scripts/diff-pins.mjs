#!/usr/bin/env node
/**
 * Print a unified diff of pinned skill bodies between two manifests for human review
 * (stdout only; writes nothing to the repo).
 * Usage: node scripts/diff-pins.mjs <old-manifest.json> <new-manifest.json>
 * Exits 0 on success; non-zero if an incoming pinned file cannot be fetched.
 */
import { readFileSync } from "node:fs";
import { RETIRED_ONBOARDING_SKILLS, scrubNonExposedRefs } from "./exposure.mjs";
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

/** Surface any new or changed sentence narrowed by the exposure scrub so the reviewer reads the served wording. */
function reportScrubNarrowings(newText, key, skillName, oldText = null) {
  if (RETIRED_ONBOARDING_SKILLS.has(skillName)) return;
  const narrowed = [];
  try {
    scrubNonExposedRefs(newText, key, { onNarrow: (change) => narrowed.push(change) });
  } catch (e) {
    console.log(`### SCRUB BLOCKED ${key}: ${e.message}`);
    return;
  }
  const previous = new Set();
  if (oldText !== null) {
    try {
      scrubNonExposedRefs(oldText, key, {
        onNarrow: ({ before, after }) => previous.add(`${before}\0${after}`)
      });
    } catch {
      // Old pin failed to scrub; treat every narrowing in the incoming text as new.
    }
  }
  const fresh = narrowed.filter(({ before, after }) => !previous.has(`${before}\0${after}`));
  if (fresh.length === 0) return;
  console.log(`### SCRUB NARROWED ${fresh.length} sentence(s) in ${key} (review the served wording):`);
  for (const { before, after } of fresh) {
    console.log(`  narrowed from: ${before}`);
    console.log(`  served as:     ${after}`);
  }
}

let changed = 0;
for (const [key, next] of after) {
  const prev = before.get(key);
  if (prev && prev.file.sha === next.file.sha) continue;
  changed++;
  if (!prev) {
    // Print brand-new files in full so incoming prompt text is reviewed before attestation.
    console.log(`\n### NEW ${key} (${next.file.size} bytes)`);
    console.log("### Entirely new prompt input — review it in full.");
    const newText = await readSkillFile(next.source, next.skill.name, next.file);
    for (const line of unified("", newText, key)) {
      console.log(line);
    }
    reportScrubNarrowings(newText, key, next.skill.name);
    continue;
  }
  // New bytes are required; old bytes are best-effort so a GC'd upstream pin can still be replaced.
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
    reportScrubNarrowings(newText, key, next.skill.name);
    continue;
  }
  console.log(`\n### CHANGED ${key}`);
  console.log(`### ${prev.file.sha.slice(0, 12)} -> ${next.file.sha.slice(0, 12)}`);
  for (const line of unified(oldText, newText, key)) console.log(line);
  reportScrubNarrowings(newText, key, next.skill.name, oldText);
}
for (const key of before.keys()) {
  if (!after.has(key)) {
    changed++;
    console.log(`\n### REMOVED ${key}`);
  }
}
console.log(changed === 0 ? "\nNo skill body changed." : `\n${changed} skill file(s) changed.`);
