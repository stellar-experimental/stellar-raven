#!/usr/bin/env node
// stellarlight-catalog.mjs — shared fetch, projection, diff, and snapshot writer
// for https://stellarlight.xyz/api/skills (ecosystem-skills/catalog.json).

import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchJson, sortDeep, writeFileAtomic } from "./shared.mjs";

export const STELLARLIGHT_CATALOG_URL = "https://stellarlight.xyz/api/skills";

const canon = (value) => JSON.stringify(sortDeep(value));
const entryKey = (entry) => `${entry.source}/${entry.name}`;
const isoSeconds = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");

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
  return projectStellarlightCatalog(await fetchJson(url, { label: "stellarlight /api/skills" }));
}

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
  const changed = [...after.keys()].filter((key) => before.has(key) && canon(after.get(key)) !== canon(before.get(key)));
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
    { source, fetched_at: fetchedAt, counts: projected.counts, validKinds: projected.validKinds, entries: projected.entries },
    null,
    2,
  )}\n`;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [, , outPath, fetchedAt] = process.argv;
  if (!outPath) throw new Error("usage: node scripts/lib/stellarlight-catalog.mjs <out-path> [fetched-at]");
  const projected = await fetchStellarlightCatalog();
  writeFileAtomic(outPath, formatStellarlightCatalog(projected, fetchedAt ? { fetchedAt } : undefined));
}
