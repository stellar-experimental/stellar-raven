#!/usr/bin/env node
// check-mirrors.mjs — validate the ecosystem-skills/ PIN SET in THIS repo.
//
// Skill bodies are not vendored here (they are fetched from upstream at the
// pinned commit and hash-verified — see ecosystem-skills/README.md), so this
// validates the pin metadata rather than files on disk: manifest completeness,
// a resolvable commit + blob sha per file, skill_count, group coverage (no
// duplicates, no ungrouped skills), catalog.json presence.
//
// Offline by default. With --fetch it additionally retrieves every pinned file
// FROM UPSTREAM (bypassing the working cache) and verifies it against its blob
// sha — the end-to-end check that the pins the Worker serves from still
// resolve. Run it BEFORE any builder, or the builder's cache writes make the
// check about local bytes instead of upstream availability.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readSkillFile } from "./lib/skill-mirror.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const failures = [];

function readJson(path) {
  return JSON.parse(readFileSync(join(ROOT, path), "utf8"));
}

function fail(message) {
  failures.push(message);
}

function assertFile(path, message = `${path} is missing`) {
  if (!existsSync(join(ROOT, path))) fail(message);
}

function collectGroupMembers(groupsPath) {
  const { groups } = readJson(groupsPath);
  const members = [];
  for (const group of groups) {
    for (const member of group.members ?? []) {
      members.push({ member, group: group.id ?? group.title ?? "<unknown>" });
    }
  }
  return members;
}

function checkNoDuplicateMembers(label, members) {
  const seen = new Map();
  for (const { member, group } of members) {
    if (seen.has(member)) {
      fail(`${label}: ${member} is listed in both ${seen.get(member)} and ${group}`);
    }
    seen.set(member, group);
  }
}

function checkEcosystemSkills() {
  const manifest = readJson("ecosystem-skills/MANIFEST.json");
  if (manifest.status !== "complete") {
    fail(`ecosystem-skills mirror is ${manifest.status}; expected complete`);
  }

  const skillIds = new Set();
  for (const source of manifest.sources) {
    // A pin is only usable if it names an immutable commit: everything
    // downstream (transport URLs, integrity checks) is derived from it.
    if (!/^[0-9a-f]{40}$/.test(source.commit ?? "")) {
      fail(`ecosystem-skills source "${source.id}" has no full commit SHA (got "${source.commit}")`);
    }
    if (!Array.isArray(source.skills) || source.skills.length === 0) {
      fail(`ecosystem-skills source "${source.id}" pins no skills`);
    }
    for (const skill of source.skills ?? []) {
      const id = `${source.id}/${skill.name}`;
      skillIds.add(id);
      for (const file of skill.files) {
        // The blob sha IS the integrity contract with upstream — a file
        // without one could be fetched but never verified.
        if (!/^[0-9a-f]{40}$/.test(file.sha ?? "")) {
          fail(`ecosystem-skills manifest lists ${id}/${file.path} without a git blob sha`);
        }
      }
    }
    // Upstream license/notice names are recorded as provenance (nothing is
    // redistributed) — THIRD-PARTY-NOTICES.md maps each source to its license,
    // so a source with none recorded means the map cannot be verified.
    if ((source.license_files ?? []).length === 0) {
      fail(
        `ecosystem-skills source "${source.id}" records no upstream LICENSE/NOTICE — ` +
          `every source must carry its license provenance (see THIRD-PARTY-NOTICES.md)`,
      );
    }
  }

  if (manifest.skill_count !== skillIds.size) {
    fail(`ecosystem-skills skill_count is ${manifest.skill_count}, but manifest contains ${skillIds.size} skills`);
  }

  const members = collectGroupMembers("ecosystem-skills/groups.json");
  const memberIds = new Set(members.map(({ member }) => member));
  checkNoDuplicateMembers("ecosystem-skills/groups.json", members);

  for (const { member, group } of members) {
    if (!skillIds.has(member)) {
      fail(`ecosystem-skills/groups.json lists ${member} in ${group}, but it is not in MANIFEST.json`);
    }
  }

  const uncategorized = [...skillIds].filter((id) => !memberIds.has(id));
  if (uncategorized.length) {
    fail(`ecosystem-skills has uncategorized skills: ${uncategorized.join(", ")}`);
  }

  assertFile("ecosystem-skills/catalog.json");
  assertFile("ecosystem-skills/INDEX.md");
}

/**
 * --fetch: prove every pin still RESOLVES UPSTREAM and hashes as recorded.
 *
 * `noCache` is what makes that claim true. Reading through the working cache
 * proves only that the bytes we already hold match the pin — which a warm
 * `ecosystem-skills/.cache/` always satisfies, so the check would pass while
 * upstream was gone. In the daily refresh the builders run first and warm every
 * exposed file, so a cached `--fetch` there verified essentially nothing.
 */
async function checkPinsResolve() {
  const manifest = readJson("ecosystem-skills/MANIFEST.json");
  const jobs = [];
  for (const source of manifest.sources) {
    for (const skill of source.skills) {
      for (const file of skill.files) {
        jobs.push(
          readSkillFile(source, skill.name, file, { noCache: true }).catch((e) =>
            fail(`ecosystem-skills pin unusable: ${source.id}/${skill.name}/${file.path} — ${e.message}`),
          ),
        );
      }
    }
  }
  await Promise.all(jobs);
  console.log(`fetched + verified ${jobs.length} pinned skill files (upstream, cache bypassed)`);
}

// Three-way exit contract, matching scripts/check-skills-drift.mjs and consumed
// as an enum by .github/workflows/refresh.yml:
//   0 = pins valid (and, with --fetch, all resolving upstream)
//   1 = a real pin problem — the manifest is malformed, or a pinned file no
//       longer resolves. With --fetch that is a LIVE user-facing outage.
//   2 = the CHECK itself failed (crash, unreadable manifest, runner network
//       fault). Fails the job, but must never be reported as an outage: the
//       whole point of the classified drift issue is that it asserts a domain
//       fact, and "our checker broke" is not one.
try {
  checkEcosystemSkills();
  if (process.argv.includes("--fetch")) await checkPinsResolve();
} catch (err) {
  console.error(`check-mirrors: check could not complete — ${err?.message ?? err}`);
  process.exit(2);
}

if (failures.length) {
  console.error("mirror checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  // A 4xx on an immutable commit-pinned URL is upstream genuinely losing the
  // content — the domain result. A transport error, a 5xx that survived the
  // retries, or a 429 says something about THIS runner's network, not about
  // what users are being served; reporting that as a production outage would
  // cry wolf on exactly the alert that must stay trustworthy.
  const transportOnly =
    process.argv.includes("--fetch") &&
    failures.every((f) => /could not fetch/.test(f) && !/HTTP 4(?!29)/.test(f));
  if (transportOnly) {
    console.error(
      "\ncheck-mirrors: every failure was a transport/rate error rather than an upstream 4xx — " +
        "reporting as a CHECK ERROR, not a pin loss.",
    );
    process.exit(2);
  }
  process.exit(1);
}

console.log("mirror checks ok");
