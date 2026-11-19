#!/usr/bin/env node
// refresh-skill-directories.mjs — refresh ecosystem-skills/catalog.json and
// community.json when upstream content changed, then rebuild INDEX.md.
// Leaves MANIFEST.json and all pinned skills untouched.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileAtomic } from "./lib/shared.mjs";
import {
  COMMUNITY_URL,
  compareCommunity,
  fetchCommunityEntries,
  formatCommunitySnapshot,
} from "./lib/stellar-community.mjs";
import {
  STELLARLIGHT_CATALOG_URL,
  compareStellarlightCatalog,
  fetchStellarlightCatalog,
  formatStellarlightCatalog,
} from "./lib/stellarlight-catalog.mjs";

const SKILLS_DIR = join(resolve(dirname(fileURLToPath(import.meta.url)), ".."), "ecosystem-skills");
const CATALOG_PATH = join(SKILLS_DIR, "catalog.json");
const COMMUNITY_PATH = join(SKILLS_DIR, "community.json");
const INDEX_PATH = join(SKILLS_DIR, "INDEX.md");
const BUILD_INDEX = join(SKILLS_DIR, "build-index.mjs");

const readJson = (path) => {
  if (!existsSync(path)) return null;
  try { return JSON.parse(readFileSync(path, "utf8")); } catch { return null; }
};

async function main() {
  const existingCatalog = readJson(CATALOG_PATH);
  const existingCommunity = readJson(COMMUNITY_PATH);
  const catalogUrl = existingCatalog?.source || STELLARLIGHT_CATALOG_URL;

  const [projectedCatalog, liveCommunity] = await Promise.all([
    fetchStellarlightCatalog(catalogUrl),
    fetchCommunityEntries(),
  ]);

  const catalogNote = existingCatalog ? compareStellarlightCatalog(existingCatalog, projectedCatalog) : "new snapshot";
  if (!existingCatalog || existingCatalog.source !== catalogUrl || catalogNote !== "") {
    writeFileAtomic(CATALOG_PATH, formatStellarlightCatalog(projectedCatalog, { source: catalogUrl }));
    console.log(`ecosystem-skills/catalog.json: updated (${projectedCatalog.entries.length} entries; ${catalogNote})`);
  } else {
    console.log(`ecosystem-skills/catalog.json: unchanged (kept fetched_at ${existingCatalog.fetched_at ?? "?"})`);
  }

  const communityOk = Array.isArray(existingCommunity?.entries);
  const communityNote = communityOk ? compareCommunity(existingCommunity.entries, liveCommunity) : "new snapshot";
  if (!existingCommunity || existingCommunity.source !== COMMUNITY_URL || !communityOk || communityNote !== "") {
    writeFileAtomic(COMMUNITY_PATH, formatCommunitySnapshot(liveCommunity));
    console.log(`ecosystem-skills/community.json: updated (${liveCommunity.length} entries; ${communityNote})`);
  } else {
    console.log(`ecosystem-skills/community.json: unchanged (kept fetched_at ${existingCommunity.fetched_at ?? "?"})`);
  }

  const beforeIndex = existsSync(INDEX_PATH) ? readFileSync(INDEX_PATH, "utf8") : null;
  execFileSync(process.execPath, [BUILD_INDEX], { stdio: ["ignore", "pipe", "inherit"] });
  console.log(`ecosystem-skills/INDEX.md: ${readFileSync(INDEX_PATH, "utf8") !== beforeIndex ? "updated" : "unchanged"}`);
}

main().catch((err) => {
  console.error(`refresh-skill-directories failed: ${err.message}`);
  process.exit(1);
});
