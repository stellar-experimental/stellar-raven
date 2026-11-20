#!/usr/bin/env node
// Validate ecosystem-skills/ pin metadata (manifest completeness, commit/blob SHAs,
// skill_count, group coverage, catalog.json and INDEX.md presence).
// Offline by default; `--fetch` bypasses ecosystem-skills/.cache to prove every pin still
// resolves upstream and matches its blob SHA.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { pinnedSourceFailures, readSkillFile } from "./lib/skill-mirror.mjs";

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
    for (const message of pinnedSourceFailures(source)) fail(message);
    for (const skill of Array.isArray(source.skills) ? source.skills : []) {
      skillIds.add(`${source.id}/${skill.name}`);
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

/** Fetch every pinned file from upstream (`noCache: true`) and verify its blob SHA. */
async function checkPinsResolve() {
  const manifest = readJson("ecosystem-skills/MANIFEST.json");
  const jobs = [];
  for (const source of manifest.sources) {
    // Skip malformed pins already recorded by checkEcosystemSkills (keeps exit 1, not 2).
    if (pinnedSourceFailures(source).length) continue;
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

// Exit codes (consumed by .github/workflows/refresh.yml):
// 0 = valid/resolving, 1 = malformed manifest or missing pin, 2 = check/transport error.
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
  // Only 4xx (excluding 429) proves an upstream pin is gone; transport/5xx/429 are check errors (exit 2).
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
