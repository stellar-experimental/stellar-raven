#!/usr/bin/env node
// refresh-skill-directories.mjs — refresh the two ecosystem directory snapshots
// (ecosystem-skills/catalog.json and ecosystem-skills/community.json) and
// regenerate ecosystem-skills/INDEX.md without moving any skill pin in MANIFEST.json.
//
// Usage:
//   node scripts/refresh-skill-directories.mjs [--catalog <path>] [--community <path>] [--index <path>] [--manifest <path>] [--fetched-at <iso>]
//
// Guarantees:
//   - Leaves MANIFEST.json and every pinned skill untouched.
//   - Idempotent: rewrites a directory snapshot only when its content (ignoring
//     fetched_at) actually changed, and rewrites INDEX.md only when its rendered
//     bytes differ; running on a clean tree changes nothing.
//   - Fails closed: fetches both directories and validates INDEX.md generation
//     into a staging directory before modifying any target file.

import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
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

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const BUILD_INDEX = join(ROOT, "ecosystem-skills", "build-index.mjs");

function parseArgs(argv) {
  const options = {
    catalog: join(ROOT, "ecosystem-skills", "catalog.json"),
    community: join(ROOT, "ecosystem-skills", "community.json"),
    index: join(ROOT, "ecosystem-skills", "INDEX.md"),
    manifest: join(ROOT, "ecosystem-skills", "MANIFEST.json"),
    fetchedAt: null,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const flag = argv[i];
    const value = argv[i + 1];
    if (!["--catalog", "--community", "--index", "--manifest", "--fetched-at"].includes(flag)) {
      throw new Error(`refresh-skill-directories: unknown argument ${flag}`);
    }
    if (!value || value.startsWith("--")) {
      throw new Error(`refresh-skill-directories: ${flag} needs a value`);
    }
    if (flag === "--catalog") options.catalog = resolve(value);
    else if (flag === "--community") options.community = resolve(value);
    else if (flag === "--index") options.index = resolve(value);
    else if (flag === "--manifest") options.manifest = resolve(value);
    else if (flag === "--fetched-at") options.fetchedAt = value;
    i += 1;
  }
  return options;
}

function readJsonIfExists(path) {
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function labelFor(path) {
  const rel = relative(ROOT, path);
  return rel && !rel.startsWith("..") ? rel : path;
}

function writeAtomicallyWithRollback(writes) {
  const backups = writes.map(({ path }) => ({
    path,
    existed: existsSync(path),
    previous: existsSync(path) ? readFileSync(path) : null,
  }));
  const written = [];
  try {
    for (let i = 0; i < writes.length; i += 1) {
      writeFileAtomic(writes[i].path, writes[i].data);
      written.push(backups[i]);
    }
  } catch (error) {
    for (const entry of written.reverse()) {
      try {
        if (entry.existed) writeFileAtomic(entry.path, entry.previous);
        else if (existsSync(entry.path)) unlinkSync(entry.path);
      } catch {
        // Best-effort rollback; preserve the primary error.
      }
    }
    throw error;
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const existingCatalog = readJsonIfExists(options.catalog);
  const existingCommunity = readJsonIfExists(options.community);
  const catalogUrl = existingCatalog?.source || STELLARLIGHT_CATALOG_URL;

  const [projectedCatalog, liveCommunityEntries] = await Promise.all([
    fetchStellarlightCatalog(catalogUrl),
    fetchCommunityEntries(),
  ]);

  const catalogNote = existingCatalog ? compareStellarlightCatalog(existingCatalog, projectedCatalog) : "new snapshot";
  const catalogChanged =
    !existingCatalog || existingCatalog.source !== catalogUrl || catalogNote !== "";

  const communityNote =
    existingCommunity && Array.isArray(existingCommunity.entries)
      ? compareCommunity(existingCommunity.entries, liveCommunityEntries)
      : "new snapshot";
  const communityChanged =
    !existingCommunity ||
    existingCommunity.source !== COMMUNITY_URL ||
    !Array.isArray(existingCommunity.entries) ||
    communityNote !== "";

  const fetchedAtOption = options.fetchedAt ? { fetchedAt: options.fetchedAt } : {};
  const nextCatalogText = catalogChanged
    ? formatStellarlightCatalog(projectedCatalog, { source: catalogUrl, ...fetchedAtOption })
    : null;
  const nextCommunityText = communityChanged
    ? formatCommunitySnapshot(liveCommunityEntries, { source: COMMUNITY_URL, ...fetchedAtOption })
    : null;

  const stage = mkdtempSync(join(tmpdir(), "skill-directories-"));
  try {
    let effectiveCatalog = options.catalog;
    let effectiveCommunity = options.community;
    if (catalogChanged) {
      effectiveCatalog = join(stage, "catalog.json");
      writeFileAtomic(effectiveCatalog, nextCatalogText);
    }
    if (communityChanged) {
      effectiveCommunity = join(stage, "community.json");
      writeFileAtomic(effectiveCommunity, nextCommunityText);
    }
    const stagedIndex = join(stage, "INDEX.md");
    try {
      execFileSync(
        process.execPath,
        [
          BUILD_INDEX,
          "--manifest",
          options.manifest,
          "--catalog",
          effectiveCatalog,
          "--community",
          effectiveCommunity,
          "--out",
          stagedIndex,
        ],
        { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
      );
    } catch (error) {
      const stderr = error.stderr?.trim();
      throw new Error(stderr ? `build-index failed:\n${stderr}` : `build-index failed: ${error.message}`);
    }

    const nextIndexText = readFileSync(stagedIndex, "utf8");
    const indexChanged = !existsSync(options.index) || readFileSync(options.index, "utf8") !== nextIndexText;

    const writes = [];
    if (catalogChanged) writes.push({ path: options.catalog, data: nextCatalogText });
    if (communityChanged) writes.push({ path: options.community, data: nextCommunityText });
    if (indexChanged) writes.push({ path: options.index, data: nextIndexText });
    if (writes.length) writeAtomicallyWithRollback(writes);

    console.log(
      catalogChanged
        ? `${labelFor(options.catalog)}: updated (${projectedCatalog.entries.length} entries; ${catalogNote})`
        : `${labelFor(options.catalog)}: unchanged (kept fetched_at ${existingCatalog.fetched_at ?? "?"})`,
    );
    console.log(
      communityChanged
        ? `${labelFor(options.community)}: updated (${liveCommunityEntries.length} entries; ${communityNote})`
        : `${labelFor(options.community)}: unchanged (kept fetched_at ${existingCommunity.fetched_at ?? "?"})`,
    );
    console.log(`${labelFor(options.index)}: ${indexChanged ? "updated" : "unchanged"}`);
  } finally {
    rmSync(stage, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(`refresh-skill-directories failed: ${err.message}`);
  process.exit(1);
});
