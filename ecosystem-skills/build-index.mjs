#!/usr/bin/env node
//
// build-index.mjs — regenerate INDEX.md from MANIFEST.json, catalog.json, and groups.json.
//
// For each pinned skill it reads SKILL.md from the pinned upstream commit
// (scripts/lib/skill-mirror.mjs — fetched once into the gitignored working
// cache, hash-verified; bodies are never vendored in this repo) and extracts
// the skill `name` + `description` straight from its YAML frontmatter, so the
// index stays fresh without hand-maintained copy. Skills are grouped by theme (groups.json);
// any skill present in the manifest but not filed in a group lands in an
// "Uncategorized" section so newly synced skills are impossible to miss. The
// stellarlight.xyz ecosystem DIRECTORY (catalog.json) is rendered as a
// separate "what exists in the ecosystem" map (incl. non-skill-md tools/SDKs).
//
// Run automatically by update.sh; safe to run standalone after a sync.
//
// Usage:
//   node build-index.mjs [--manifest <path>] [--catalog <path>] [--out <path>]
//
// The three paths default to the files beside this script. update.sh passes its
// staged MANIFEST.json and catalog.json and an output path inside its work tree,
// so the index is built and validated BEFORE any pinned file is swapped into
// place; a failure here then leaves the committed pin set untouched.
//
// Every source must be a public GitHub source (type "github"). The manifest
// carries no other source type: update.sh cannot produce one and
// scripts/check-skills-drift.mjs rejects one. This script fails closed on any
// other type instead of rendering a placeholder row for it.

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileAtomic } from "../scripts/lib/shared.mjs";
import { readSkillFile } from "../scripts/lib/skill-mirror.mjs";
import { parseFrontmatter } from "../scripts/lib/skill-markdown.mjs";
import {
  assertSkillDescriptionOverrideIdsResolve,
  skillDescription
} from "../scripts/description-notes.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));

function argPath(flag, fallback) {
  const i = process.argv.indexOf(flag);
  if (i < 0) return fallback;
  const value = process.argv[i + 1];
  if (!value || value.startsWith("--")) throw new Error(`build-index: ${flag} needs a path`);
  return value;
}

const MANIFEST_PATH = argPath("--manifest", join(DIR, "MANIFEST.json"));
const CATALOG_PATH = argPath("--catalog", join(DIR, "catalog.json"));
const OUT_PATH = argPath("--out", join(DIR, "INDEX.md"));

const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
const catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf8"));
const { groups } = JSON.parse(readFileSync(join(DIR, "groups.json"), "utf8"));

for (const src of manifest.sources) {
  if (src.type !== "github") {
    throw new Error(`build-index: source "${src.id}" has type "${src.type}"; only "github" sources are supported`);
  }
}

// Build an index of every synced skill: id "source/skill" -> metadata.
const skillById = new Map();
const sourceById = new Map();
for (const src of manifest.sources) {
  sourceById.set(src.id, src);
  for (const skill of src.skills) {
    const id = `${src.id}/${skill.name}`;
    const totalSize = skill.files.reduce((n, f) => n + f.size, 0);
    // Upstream browse URL at the pinned commit — the index links to the source
    // of truth, not to a local copy.
    const url = src.path ? `${src.url}/${skill.name}` : src.url;
    skillById.set(id, { id, source: src.id, name: skill.name, files: skill.files, totalSize, url });
  }
}

assertSkillDescriptionOverrideIdsResolve(
  [...skillById.values()].map((skill) => `skills.${skill.source}.${skill.name}`),
  "ecosystem-skills/build-index"
);

/** SKILL.md text per skill id, from the pinned upstream commit. */
const textById = new Map(
  await Promise.all(
    [...skillById.values()].map(async (skill) => {
      const file = skill.files.find((f) => f.path === "SKILL.md") || skill.files[0];
      const source = sourceById.get(skill.source);
      if (!file || !source) return [skill.id, ""];
      return [skill.id, await readSkillFile(source, skill.name, file)];
    })
  )
);

/** Extract `name` + `description` from a SKILL.md YAML frontmatter block. */
function frontmatter(id, skillName) {
  const text = textById.get(id);
  if (!text) return { name: skillName, description: "" };
  const { attrs } = parseFrontmatter(text);
  return {
    name: String(attrs.name ?? "").replace(/\s+/g, " ").trim() || skillName,
    description: skillDescription(
      `skills.${id.replace("/", ".")}`,
      String(attrs.description ?? "").replace(/\s+/g, " ").trim()
    )
  };
}

function meta(id) {
  const skill = skillById.get(id);
  if (!skill) return { name: id, description: "" };
  return frontmatter(id, skill.name);
}

function kb(bytes) {
  return bytes >= 1024 ? `${Math.round(bytes / 1024)} KB` : `${bytes} B`;
}

const categorized = new Set();
const warnings = [];
const out = [];

out.push("<!-- AUTO-GENERATED by build-index.mjs — do not edit by hand. Re-run ./update.sh. -->");
out.push("");
out.push("# Stellar/Soroban ecosystem skills — index");
out.push("");
out.push(
  `Directory of **${manifest.skill_count} agent skills** across **${manifest.sources.length} sources** · pinned ${manifest.synced_at}. ` +
    `Bodies are NOT vendored here: each row links to the upstream file at the commit pinned in ` +
    `[\`MANIFEST.json\`](./MANIFEST.json), which is what this server fetches and hash-verifies at read time.`,
);
out.push("");
out.push(
  "The **What it does** column is host-owned discovery text. Exact-ID overrides in " +
    "`scripts/description-notes.mjs` can narrow upstream frontmatter for routing. " +
    "They do not modify pinned source bytes. `codemode.skill.read` still applies its existing " +
    "exposure scrub."
);
out.push("");

// Per-source pin table.
out.push("## Sources (pinned)");
out.push("");
out.push("| Source | Origin | Pinned | Skills |");
out.push("| --- | --- | --- | --- |");
for (const src of manifest.sources) {
  const where = src.path === "." ? " (skill dirs at root)" : src.path ? ` \`${src.path}/\`` : " (root)";
  const origin = `[\`${src.owner}/${src.repo}\`](https://github.com/${src.owner}/${src.repo})${where}`;
  const pin = src.url ? `[\`${String(src.commit).slice(0, 12)}\`](${src.url})` : `\`${String(src.commit).slice(0, 12)}\``;
  out.push(`| \`${src.id}\` | ${origin} | ${pin} | ${src.skills.length} |`);
}
out.push("");
out.push(
  "_Every source is public GitHub, pinned to a full commit SHA (independently verifiable); " +
    "each source's upstream LICENSE/NOTICE file NAMES are recorded in `MANIFEST.json` as " +
    "provenance — those files are not fetched, copied, or served " +
    "(see `THIRD-PARTY-NOTICES.md` at the repo root)._",
);
out.push("");

// Themed groups.
for (const g of groups) {
  out.push(`## ${g.title}`);
  out.push("");
  if (g.description) {
    out.push(`_${g.description}_`);
    out.push("");
  }
  out.push("| Skill | Source | Size | What it does |");
  out.push("| --- | --- | --- | --- |");
  for (const id of g.members) {
    if (!skillById.has(id)) {
      warnings.push(`groups.json lists "${id}" but it is not in the manifest (renamed/removed upstream?)`);
      continue;
    }
    categorized.add(id);
    const skill = skillById.get(id);
    const { description } = meta(id);
    out.push(`| [\`${skill.name}\`](${skill.url}) | \`${skill.source}\` | ${kb(skill.totalSize)} | ${description} |`);
  }
  out.push("");
}

// Uncategorized synced skills.
const uncategorized = [...skillById.keys()].filter((id) => !categorized.has(id));
if (uncategorized.length) {
  out.push("## Uncategorized (newly synced — file these into `groups.json`)");
  out.push("");
  out.push("| Skill | Source | Size | What it does |");
  out.push("| --- | --- | --- | --- |");
  for (const id of uncategorized) {
    const skill = skillById.get(id);
    const { description } = meta(id);
    out.push(`| [\`${skill.name}\`](${skill.url}) | \`${skill.source}\` | ${kb(skill.totalSize)} | ${description} |`);
  }
  out.push("");
}

// Ecosystem directory snapshot (the broader map, incl. non-skill-md entries).
if (Array.isArray(catalog.entries)) {
  const cat = catalog;
  out.push("## Ecosystem directory (stellarlight.xyz catalog snapshot)");
  out.push("");
  out.push(
    `_The broader map of what exists across the Stellar agent-skill ecosystem — ${cat.entries.length} entries from ` +
      `[\`${cat.source}\`](${cat.source}), fetched ${cat.fetched_at}. Only \`skill-md\` entries are downloadable SKILL.md skills; ` +
      `\`mcp-server\` / \`sdk\` / \`cli\` / \`tool\` entries are pointers to runtime tools, not skills. Not all are served here._`,
  );
  out.push("");
  out.push("| Entry | Source | Kind |");
  out.push("| --- | --- | --- |");
  for (const e of cat.entries) {
    out.push(`| \`${e.name}\` | \`${e.source}\` | \`${e.kind}\` |`);
  }
  out.push("");
}

writeFileAtomic(OUT_PATH, out.join("\n"));

console.log(`${OUT_PATH === join(DIR, "INDEX.md") ? "INDEX.md" : OUT_PATH} written: ${categorized.size} categorized, ${uncategorized.length} uncategorized.`);
if (uncategorized.length) console.log("  uncategorized → " + uncategorized.join(", "));
for (const w of warnings) console.warn("  warning: " + w);
