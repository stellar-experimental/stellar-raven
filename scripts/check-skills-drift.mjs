#!/usr/bin/env node
// check-skills-drift.mjs — detect upstream drift for the ecosystem-skills/ mirror.
//
//   node scripts/check-skills-drift.mjs [--json]
//
// DETECTION ONLY. This script never modifies ecosystem-skills/ and must never be
// replaced by an automated sync: mirrored skills are prompt input, so upstream
// edits go through a human review gate. Remediation for any drift reported here:
// run ecosystem-skills/update.sh locally, review the skill diffs (read them),
// re-pin, commit.
//
// Plain Node 20+ (global fetch, node:fs only — no deps). Like
// scripts/refresh-inventory.mjs it reads .env at the repo root and overlays
// process.env on top. No API keys are required: every mirrored source is
// public (the credentialed lumenloop-api partner source was removed from the
// mirror 2026-07-06 — go-public cleanup). GITHUB_TOKEN / GH_TOKEN are used for
// GitHub API rate limits when present; unauthenticated works too. No secret is
// ever printed.
//
// What is checked, per MANIFEST.json source:
//   - github sources: latest commit touching the source's pinned path
//     (GET /repos/{owner}/{repo}/commits?sha={ref}&path={path}&per_page=1 — the
//     exact query update.sh pins from) vs the pinned commit SHA. On drift, each
//     mirrored skill's subpath is probed to annotate whether the mirrored
//     content itself moved (openzeppelin-stellar cherry-picks 3 of a multi-chain
//     skills/ dir, so repo-path drift can be entirely in non-mirrored skills —
//     still drift, since re-running update.sh would re-pin, but the note says so).
//     A cherry-picked source also lists the upstream skill dirs it does NOT pin,
//     because update.sh's pick list is hard-coded: a newly published sibling
//     would otherwise never be pinned and nothing would ever mention it.
//   - stellarlight catalog: GET the live directory and project it through the
//     same field mapping update.sh's fetch_catalog uses, then deep-compare with
//     ecosystem-skills/catalog.json. Volatile fields never enter the compare by
//     construction: the local fetched_at is not projected, and live-side
//     request-scoped meta (generatedAt etc.) is dropped because only
//     meta.counts, meta.validKinds and the per-skill projected fields are kept.
//     "Drift" therefore means exactly: re-running update.sh would change catalog.json.
//
// Exit codes (three-way, consumed as an enum by .github/workflows/refresh.yml):
//   0 = every checked source clean;
//   1 = drift detected (any source DRIFTED);
//   2 = check error (any source ERRORED, or the script itself crashed) — still
//       fails the job, fail-closed, but distinguishable from real drift so CI
//       never pastes the re-pin remediation for a transient upstream outage.
// Error takes precedence over drift. SKIPPED sources (missing key) do not
// affect the exit code but are warned about on stderr.

import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { fetchJson, parseEnvFile, sortDeep } from "./lib/shared.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const JSON_MODE = process.argv.includes("--json");

// .env parser + JSON fetch (3 attempts, retry network/5xx, err.cause detail)
// + deep key sort are shared with scripts/refresh-inventory.mjs — see
// scripts/lib/shared.mjs.
const ENV = { ...parseEnvFile(join(ROOT, ".env")), ...process.env };

// ---------------------------------------------------------------------------
// GitHub sources
// ---------------------------------------------------------------------------
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
 * Upstream skill directories that are neither pinned nor explicitly excluded.
 *
 * Only openzeppelin-stellar cherry-picks today (3 Stellar skills out of a
 * multi-chain repo), and the pick list is hard-coded in update.sh. So a newly
 * published sibling — the repo already ships setup/upgrade/review per chain,
 * making a future `review-stellar-contracts` the obvious case — would never be
 * pinned, and re-running update.sh would not pull it in. Nothing else in the
 * lifecycle would mention it either.
 *
 * Listing every unpinned directory on drift was not enough: it buried the one
 * new name among eight long-standing out-of-scope ones, and it vanished as soon
 * as the operator re-pinned (a current commit takes the clean early-return).
 * So the exclusions are COMMITTED DATA (`groups.json` `unpinnedUpstream`) and
 * this runs on EVERY check, clean or not: an upstream directory that is neither
 * pinned nor recorded is unclassified, and unclassified is a failure until a
 * human pins it or writes down why not.
 */
async function unclassifiedSkillDirs(source, unpinnedUpstream) {
  if (!source.path) return []; // root-mode: the repo IS the skill, nothing to enumerate
  const pinned = new Set((source.skills ?? []).map((skill) => skill.name));
  const excluded = new Set(Object.keys(unpinnedUpstream[source.id] ?? {}));
  if (excluded.size === 0) return []; // not a cherry-picked source: update.sh pins every dir
  const parent = dirPrefix(source);
  const tree = await fetchJson(
    `https://api.github.com/repos/${source.owner}/${source.repo}/contents${parent ? `/${parent}` : ""}`,
    { headers: githubHeaders(), label: `github ${source.owner}/${source.repo}${parent ? `/${parent}` : ""} contents` },
  );
  return (Array.isArray(tree) ? tree : [])
    .filter((entry) => entry.type === "dir" && !pinned.has(entry.name) && !excluded.has(entry.name))
    .map((entry) => entry.name)
    .sort();
}

async function checkGithubSource(source, unpinnedUpstream) {
  const [latest, unclassified] = await Promise.all([
    latestCommit(source.owner, source.repo, source.ref, dirPrefix(source)),
    unclassifiedSkillDirs(source, unpinnedUpstream),
  ]);

  // An unclassified sibling is drift in its own right, independent of the
  // commit: it survives a re-pin that keeps omitting it, which is exactly the
  // silence this check exists to break.
  const unclassifiedNote = unclassified.length
    ? `upstream skill dir(s) neither pinned nor excluded: ${unclassified.join(", ")} — ` +
      `pin them in ecosystem-skills/update.sh, or record why not under ` +
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
  // Annotate which mirrored skill dirs moved since the pin (best-effort; only
  // meaningful for subdir-mode sources — root-mode means the whole repo is the
  // skill). Probes stay sequential (they share the GitHub rate budget), and an
  // annotation failure never flips the drift verdict — but it is surfaced in
  // the note, never swallowed.
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
const canon = (value) => JSON.stringify(sortDeep(value));
const entryKey = (e) => `${e.source}/${e.name}`;

async function checkStellarlightCatalog(localCatalog) {
  const url = localCatalog.source ?? "https://stellarlight.xyz/api/skills";
  const live = await fetchJson(url, { label: "stellarlight /api/skills" });

  // Same projection as update.sh fetch_catalog's jq (minus fetched_at, which is
  // the snapshot timestamp, not upstream state). Live-side volatile fields
  // (e.g. meta.generatedAt) are excluded because they are simply not projected.
  const projected = {
    counts: live.meta?.counts ?? null,
    validKinds: live.meta?.validKinds ?? null,
    entries: (live.skills ?? [])
      .map((s) => ({
        name: s.slug ?? s.name ?? null,
        title: s.name ?? null,
        source: s.source ?? null,
        kind: s.kind ?? null,
        tagline: s.tagline ?? null,
        install: s.install ?? null,
        repository: s.repository ?? null,
        homepage: s.homepage ?? null,
      }))
      .sort((a, b) => (entryKey(a) < entryKey(b) ? -1 : entryKey(a) > entryKey(b) ? 1 : 0)),
  };
  const snapshot = {
    counts: localCatalog.counts ?? null,
    validKinds: localCatalog.validKinds ?? null,
    entries: localCatalog.entries ?? [],
  };

  const pinned = `${snapshot.entries.length} entries (snapshot ${localCatalog.fetched_at ?? "?"})`;
  const upstream = `${projected.entries.length} entries`;
  if (canon(projected) === canon(snapshot)) {
    return { id: "stellarlight-catalog", status: "ok", pinned, upstream };
  }

  // Entry-level diff summary so the drift note is actionable.
  const before = new Map(snapshot.entries.map((e) => [entryKey(e), e]));
  const after = new Map(projected.entries.map((e) => [entryKey(e), e]));
  const added = [...after.keys()].filter((k) => !before.has(k));
  const removed = [...before.keys()].filter((k) => !after.has(k));
  const changed = [...after.keys()].filter(
    (k) => before.has(k) && canon(after.get(k)) !== canon(before.get(k)),
  );
  const parts = [];
  if (added.length) parts.push(`added: ${added.join(", ")}`);
  if (removed.length) parts.push(`removed: ${removed.join(", ")}`);
  if (changed.length) parts.push(`changed: ${changed.join(", ")}`);
  if (canon(projected.counts) !== canon(snapshot.counts)) parts.push("counts changed");
  if (canon(projected.validKinds) !== canon(snapshot.validKinds)) parts.push("validKinds changed");
  return {
    id: "stellarlight-catalog",
    status: "DRIFT",
    pinned,
    upstream,
    note: parts.join("; ") || "entry content differs",
  };
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
async function checkSource(source, unpinnedUpstream) {
  if (source.type === "github") return checkGithubSource(source, unpinnedUpstream);
  // "lumenloop-archive" (the credentialed partner source) is deliberately NOT
  // supported anymore — its reappearance in MANIFEST.json should fail here.
  throw new Error(`unknown source type "${source.type}" — teach scripts/check-skills-drift.mjs about it`);
}

async function main() {
  const manifest = JSON.parse(readFileSync(join(ROOT, "ecosystem-skills/MANIFEST.json"), "utf8"));
  const localCatalog = JSON.parse(readFileSync(join(ROOT, "ecosystem-skills/catalog.json"), "utf8"));
  // Committed decisions about upstream skills we deliberately do not pin.
  const { unpinnedUpstream = {} } = JSON.parse(
    readFileSync(join(ROOT, "ecosystem-skills/groups.json"), "utf8"),
  );

  // Independent checks run in parallel (manifest sources + the stellarlight
  // catalog compare); each settles into a per-source result object, and the
  // combined list is sorted by source id so output is deterministic regardless
  // of completion order.
  const checks = [
    ...manifest.sources.map((source) => ({
      id: source.id,
      run: () => checkSource(source, unpinnedUpstream),
    })),
    { id: "stellarlight-catalog", run: () => checkStellarlightCatalog(localCatalog) },
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
    console.error(
      `\ncheck-skills-drift: ${drifted.length} source(s) drifted from the pinned mirror.\n` +
        "Remediation: run ecosystem-skills/update.sh locally, review the skill diffs " +
        "(skills are prompt input — read them), re-pin, commit. Do NOT auto-sync from CI.",
    );
  }
  if (skipped.length && !drifted.length && !errored.length) {
    console.error(`\ncheck-skills-drift: clean, but ${skipped.length} source(s) SKIPPED (see warning above).`);
  }
  // Three-way contract (see header): error beats drift beats clean.
  process.exit(errored.length ? 2 : drifted.length ? 1 : 0);
}

main().catch((err) => {
  console.error(`check-skills-drift failed: ${err.message}`);
  process.exit(2); // check error, not drift — see the exit-code contract above
});
