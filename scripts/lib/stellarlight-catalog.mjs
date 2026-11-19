#!/usr/bin/env node
// stellarlight-catalog.mjs — shared fetch, projection, diff, and snapshot writer
// for the stellarlight.xyz/api/skills directory (ecosystem-skills/catalog.json).
//
// Imported by scripts/check-skills-drift.mjs and scripts/refresh-skill-directories.mjs,
// and invoked directly by ecosystem-skills/update.sh so every surface uses one projection.

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchJson, sortDeep, writeFileAtomic } from "./shared.mjs";

export const STELLARLIGHT_CATALOG_URL = "https://stellarlight.xyz/api/skills";

const canon = (value) => JSON.stringify(sortDeep(value));
export const entryKey = (entry) => `${entry.source}/${entry.name}`;
const isoSeconds = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

/**
 * Project the live /api/skills payload into the committed directory shape.
 * Volatile request-scoped fields (such as meta.generatedAt) are dropped by construction.
 * Fails closed if Stellar Light fell back because skills.stellar.org was unreachable
 * (meta.registry.live === false omits community-built entries).
 */
export function projectStellarlightCatalog(live) {
  if (!live || typeof live !== "object" || !Array.isArray(live.skills)) {
    throw new Error("stellarlight catalog: expected a skills array");
  }
  if (live.meta?.registry?.live === false) {
    throw new Error("stellarlight catalog: upstream skills.stellar.org registry fallback (meta.registry.live is false)");
  }
  return {
    counts: live.meta?.counts ?? null,
    validKinds: live.meta?.validKinds ?? null,
    entries: live.skills
      .map((skill) => ({
        name: skill.slug ?? skill.name ?? null,
        title: skill.name ?? null,
        source: skill.source ?? null,
        kind: skill.kind ?? null,
        tagline: skill.tagline ?? null,
        install: skill.install ?? null,
        repository: skill.repository ?? null,
        homepage: skill.homepage ?? null,
      }))
      .sort((a, b) => (entryKey(a) < entryKey(b) ? -1 : entryKey(a) > entryKey(b) ? 1 : 0)),
  };
}

export async function fetchStellarlightCatalog(url = STELLARLIGHT_CATALOG_URL) {
  const live = await fetchJson(url, { label: "stellarlight /api/skills" });
  return projectStellarlightCatalog(live);
}

/**
 * Canonical diff between a committed catalog.json snapshot and a live projection.
 * Returns "" when equal, or an actionable summary string on drift.
 */
export function compareStellarlightCatalog(localCatalog, projected) {
  const snapshot = {
    counts: localCatalog?.counts ?? null,
    validKinds: localCatalog?.validKinds ?? null,
    entries: Array.isArray(localCatalog?.entries) ? localCatalog.entries : [],
  };
  if (canon(projected) === canon(snapshot)) return "";

  const before = new Map(snapshot.entries.map((entry) => [entryKey(entry), entry]));
  const after = new Map(projected.entries.map((entry) => [entryKey(entry), entry]));
  const added = [...after.keys()].filter((key) => !before.has(key));
  const removed = [...before.keys()].filter((key) => !after.has(key));
  const changed = [...after.keys()].filter(
    (key) => before.has(key) && canon(after.get(key)) !== canon(before.get(key)),
  );
  const parts = [];
  if (added.length) parts.push(`added: ${added.join(", ")}`);
  if (removed.length) parts.push(`removed: ${removed.join(", ")}`);
  if (changed.length) parts.push(`changed: ${changed.join(", ")}`);
  if (canon(projected.counts) !== canon(snapshot.counts)) parts.push("counts changed");
  if (canon(projected.validKinds) !== canon(snapshot.validKinds)) parts.push("validKinds changed");
  return parts.join("; ") || "entry content differs";
}

export function formatStellarlightCatalog(
  projected,
  { source = STELLARLIGHT_CATALOG_URL, fetchedAt = isoSeconds() } = {},
) {
  return `${JSON.stringify(
    {
      source,
      fetched_at: fetchedAt,
      counts: projected.counts,
      validKinds: projected.validKinds,
      entries: projected.entries,
    },
    null,
    2,
  )}\n`;
}

function parseCliArgs(argv) {
  let outPath = null;
  let fetchedAt = null;
  let source = STELLARLIGHT_CATALOG_URL;
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--fetched-at" || arg === "--source") {
      const value = argv[i + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`stellarlight-catalog: ${arg} needs a value`);
      }
      if (arg === "--fetched-at") fetchedAt = value;
      else source = value;
      i += 1;
    } else if (arg.startsWith("--")) {
      throw new Error(`stellarlight-catalog: unknown flag ${arg}`);
    } else if (!outPath) {
      outPath = arg;
    } else {
      throw new Error(`stellarlight-catalog: unexpected argument ${arg}`);
    }
  }
  if (!outPath) {
    throw new Error("usage: node scripts/lib/stellarlight-catalog.mjs <out-path> [--fetched-at <iso>] [--source <url>]");
  }
  return { outPath, fetchedAt: fetchedAt ?? isoSeconds(), source };
}

// Snapshot only the public directory. Never downloads or pins skill bodies.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { outPath, fetchedAt, source } = parseCliArgs(process.argv.slice(2));
  const projected = await fetchStellarlightCatalog(source);
  writeFileAtomic(outPath, formatStellarlightCatalog(projected, { source, fetchedAt }));
}
