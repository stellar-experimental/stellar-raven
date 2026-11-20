#!/usr/bin/env node
// check-skills-drift.mjs — detection-only upstream drift check for ecosystem-skills/.
// Usage: node scripts/check-skills-drift.mjs [--json]
//
// Never auto-syncs: mirrored skills are prompt input requiring human review.
// Source drift needs a reviewed re-pin (ecosystem-skills/update.sh); directory-only drift
// (stellarlight-catalog, stellar-community-catalog) needs scripts/refresh-skill-directories.mjs.
// Keyless (optional GITHUB_TOKEN / GH_TOKEN for rate limits; reads .env + process.env).
//
// Checks:
// - GitHub sources: latest commit at pinned path vs MANIFEST.json SHA, plus unclassified
//   upstream skill dirs for `mode: "pick"` sources (must be pinned or in groups.json).
// - stellarlight-catalog / stellar-community-catalog: projected live entries vs snapshots.
//
// Exit codes (consumed by .github/workflows/refresh.yml):
//   0 = clean, 1 = drift, 2 = error (error beats drift).

import { readFileSync, realpathSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchJson, parseEnvFile } from "./lib/shared.mjs";
import { readSourceDefinitions, sourceDefinition } from "./lib/skill-source-definitions.mjs";
import { COMMUNITY_SOURCE, compareCommunity, fetchCommunityEntries } from "./lib/stellar-community.mjs";
import {
  STELLARLIGHT_CATALOG_URL,
  compareStellarlightCatalog,
  fetchStellarlightCatalog,
} from "./lib/stellarlight-catalog.mjs";

export const DIRECTORY_SOURCE_IDS = new Set(["stellarlight-catalog", "stellar-community-catalog"]);

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_MODE = process.argv.includes("--json");

const ENV = { ...parseEnvFile(join(ROOT, ".env")), ...process.env };

function githubHeaders() {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "stellar-raven-codemode-skills-drift-check",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const token = ENV.GITHUB_TOKEN || ENV.GH_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function latestCommit(owner, repo, ref, path) {
  const params = new URLSearchParams({ sha: ref, per_page: "1" });
  if (path) params.set("path", path);
  const label = `github ${owner}/${repo}${path ? `/${path}` : ""}@${ref}`;
  const commits = await fetchJson(
    `https://api.github.com/repos/${owner}/${repo}/commits?${params}`,
    { headers: githubHeaders(), label },
  );
  const head = Array.isArray(commits) ? commits[0] : undefined;
  if (!head?.sha) throw new Error(`${label}: no commits returned`);
  return { sha: head.sha, date: head.commit?.committer?.date ?? null };
}

const short = (sha) => (sha ? String(sha).slice(0, 12) : "?");

/** The skill-dirs parent as a GitHub API path — "" for `path: "."` (dirs at the repo root). */
const dirPrefix = (source) => (source.path === "." ? "" : source.path);

/**
 * Upstream skill directories for `mode: "pick"` sources that are neither pinned nor listed in
 * `groups.json` `unpinnedUpstream`. Runs on every check so newly published siblings fail drift
 * until explicitly pinned or excluded.
 */
async function unclassifiedSkillDirs(source, unpinnedUpstream, definition) {
  if (definition.mode !== "pick") return [];
  const pinned = new Set((source.skills ?? []).map((skill) => skill.name));
  const excluded = new Set(Object.keys(unpinnedUpstream[source.id] ?? {}));
  const parent = dirPrefix(source);
  const tree = await fetchJson(
    `https://api.github.com/repos/${source.owner}/${source.repo}/contents${parent ? `/${parent}` : ""}?ref=${encodeURIComponent(source.ref)}`,
    { headers: githubHeaders(), label: `github ${source.owner}/${source.repo}${parent ? `/${parent}` : ""} contents` },
  );
  if (!Array.isArray(tree)) throw new Error(`github ${source.id}: contents response has no directory array`);
  return tree
    .filter((entry) => entry.type === "dir" && !pinned.has(entry.name) && !excluded.has(entry.name))
    .map((entry) => entry.name)
    .sort();
}

async function checkGithubSource(source, unpinnedUpstream, definition) {
  const [latest, unclassified] = await Promise.all([
    latestCommit(source.owner, source.repo, source.ref, dirPrefix(source)),
    unclassifiedSkillDirs(source, unpinnedUpstream, definition),
  ]);

  // Unclassified siblings are drift even when the commit SHA matches.
  const unclassifiedNote = unclassified.length
    ? `upstream skill dir(s) neither pinned nor excluded: ${unclassified.join(", ")} — ` +
      `add their picks to ecosystem-skills/sources.json, or record why not under ` +
      `unpinnedUpstream["${source.id}"] in ecosystem-skills/groups.json`
    : null;

  if (latest.sha === source.commit) {
    return unclassifiedNote
      ? {
          id: source.id,
          status: "DRIFT",
          pinned: short(source.commit),
          upstream: short(latest.sha),
          note: unclassifiedNote,
        }
      : { id: source.id, status: "ok", pinned: short(source.commit), upstream: short(latest.sha) };
  }

  let note = `pinned ${source.commit_date ?? "?"} → upstream ${latest.date ?? "?"}`;
  if (unclassifiedNote) note += `; ${unclassifiedNote}`;
  // Best-effort sequential per-skill probe for subdir sources (preserves GitHub rate budget).
  if (source.path) {
    try {
      const affected = [];
      for (const skill of source.skills ?? []) {
        const skillLatest = await latestCommit(
          source.owner,
          source.repo,
          source.ref,
          dirPrefix(source) ? `${dirPrefix(source)}/${skill.name}` : skill.name,
        );
        if (
          skillLatest.sha !== source.commit &&
          skillLatest.date &&
          source.commit_date &&
          skillLatest.date > source.commit_date
        ) {
          affected.push(skill.name);
        }
      }
      note += affected.length
        ? `; mirrored skills touched: ${affected.join(", ")}`
        : `; no mirrored skill dir touched since pin (change is elsewhere under ${source.path}/ — re-pin still required)`;
    } catch (err) {
      // the drift verdict above stands on its own
      note += `; annotation unavailable: ${err.message}`;
    }
  }
  return {
    id: source.id,
    status: "DRIFT",
    pinned: short(source.commit),
    upstream: short(latest.sha),
    note,
  };
}

// ---------------------------------------------------------------------------
// stellarlight.xyz/api/skills directory vs ecosystem-skills/catalog.json
// ---------------------------------------------------------------------------
async function checkStellarlightCatalog(localCatalog) {
  const url = localCatalog.source ?? STELLARLIGHT_CATALOG_URL;
  const projected = await fetchStellarlightCatalog(url);
  const snapshotCount = Array.isArray(localCatalog.entries) ? localCatalog.entries.length : 0;
  const pinned = `${snapshotCount} entries (snapshot ${localCatalog.fetched_at ?? "?"})`;
  const upstream = `${projected.entries.length} entries`;
  const note = compareStellarlightCatalog(localCatalog, projected);
  return {
    id: "stellarlight-catalog",
    status: note ? "DRIFT" : "ok",
    pinned,
    upstream,
    ...(note ? { note } : {}),
  };
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
async function checkCommunityCatalog(snapshot) {
  const liveEntries = await fetchCommunityEntries();
  const note = compareCommunity(snapshot.entries, liveEntries);
  return {
    id: "stellar-community-catalog",
    source: COMMUNITY_SOURCE,
    status: note ? "DRIFT" : "ok",
    pinned: `${snapshot.entries.length} entries (snapshot ${snapshot.fetched_at})`,
    upstream: `${liveEntries.length} entries (${COMMUNITY_SOURCE} source)`,
    ...(note ? { note } : {})
  };
}

async function checkSource(source, unpinnedUpstream, definitions) {
  if (source.type === "github") return checkGithubSource(source, unpinnedUpstream, sourceDefinition(source, definitions));
  // "lumenloop-archive" (the credentialed partner source) is deliberately NOT
  // supported anymore — its reappearance in MANIFEST.json should fail here.
  throw new Error(`unknown source type "${source.type}" — teach scripts/check-skills-drift.mjs about it`);
}

async function main() {
  const manifest = JSON.parse(readFileSync(join(ROOT, "ecosystem-skills/MANIFEST.json"), "utf8"));
  const definitions = readSourceDefinitions(join(ROOT, "ecosystem-skills/sources.json"));
  const localCatalog = JSON.parse(readFileSync(join(ROOT, "ecosystem-skills/catalog.json"), "utf8"));
  const communityCatalog = JSON.parse(readFileSync(join(ROOT, "ecosystem-skills/community.json"), "utf8"));
  // Committed decisions about upstream skills we deliberately do not pin.
  const { unpinnedUpstream = {} } = JSON.parse(
    readFileSync(join(ROOT, "ecosystem-skills/groups.json"), "utf8"),
  );

  // Independent checks run in parallel (manifest sources + directory
  // comparisons); each settles into a per-source result object, and the
  // combined list is sorted by source id so output is deterministic regardless
  // of completion order.
  const checks = [
    ...manifest.sources.map((source) => ({
      id: source.id,
      run: () => checkSource(source, unpinnedUpstream, definitions),
    })),
    { id: "stellarlight-catalog", run: () => checkStellarlightCatalog(localCatalog) },
    { id: "stellar-community-catalog", run: () => checkCommunityCatalog(communityCatalog) },
  ];
  const settled = await Promise.allSettled(checks.map((check) => check.run()));
  const results = settled
    .map((outcome, i) =>
      outcome.status === "fulfilled"
        ? outcome.value
        : {
            id: checks[i].id,
            status: "error",
            pinned: "?",
            upstream: "?",
            note: outcome.reason?.message ?? String(outcome.reason),
          },
    )
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  const drifted = results.filter((r) => r.status === "DRIFT");
  const errored = results.filter((r) => r.status === "error");
  const skipped = results.filter((r) => r.status === "skipped");

  if (JSON_MODE) {
    console.log(JSON.stringify({ checkedAt: new Date().toISOString(), drift: drifted.length > 0, results }, null, 2));
  } else {
    const rows = [["source", "pinned", "upstream", "status"], ...results.map((r) => [r.id, r.pinned, r.upstream, r.status])];
    const widths = rows[0].map((_, i) => Math.max(...rows.map((row) => String(row[i]).length)));
    for (const row of rows) {
      console.log(row.map((cell, i) => String(cell).padEnd(widths[i])).join("  "));
    }
    for (const r of results) {
      if (r.note) console.log(`\n${r.id} [${r.status}]: ${r.note}`);
    }
  }

  if (errored.length) {
    console.error(`\ncheck-skills-drift: ${errored.length} source(s) could not be checked — failing closed.`);
  }
  if (drifted.length) {
    const pinDrifted = drifted.filter((entry) => !DIRECTORY_SOURCE_IDS.has(entry.id));
    const directoryDrifted = drifted.filter((entry) => DIRECTORY_SOURCE_IDS.has(entry.id));
    console.error(`\ncheck-skills-drift: ${drifted.length} source(s) changed from the local snapshots.`);
    if (pinDrifted.length) {
      console.error(
        "Source remediation: run ecosystem-skills/update.sh locally. Review the skill diffs, re-pin, and commit.\n" +
        "Change picks in ecosystem-skills/sources.json. Record exclusions in ecosystem-skills/groups.json.",
      );
    }
    if (directoryDrifted.length) {
      const names = directoryDrifted.map((entry) => entry.id).join(", ");
      console.error(
        `Directory remediation (${names}): refresh the directory snapshots and index without moving pins. Review and commit.\n` +
        "node scripts/refresh-skill-directories.mjs",
      );
    }
    console.error("Never auto-sync from CI.");
  }
  if (skipped.length && !drifted.length && !errored.length) {
    console.error(`\ncheck-skills-drift: clean, but ${skipped.length} source(s) SKIPPED (see warning above).`);
  }
  // Three-way contract (see header): error beats drift beats clean.
  process.exit(errored.length ? 2 : drifted.length ? 1 : 0);
}

// realpath: on macOS tmpdir() is /var, a symlink to /private/var.
function isMainModule() {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(resolve(process.argv[1])) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (isMainModule()) {
  main().catch((err) => {
    console.error(`check-skills-drift failed: ${err.message}`);
    process.exit(2); // check error, not drift — see the exit-code contract above
  });
}
