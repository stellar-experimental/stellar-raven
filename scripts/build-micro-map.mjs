#!/usr/bin/env node
/**
 * build-micro-map.mjs — deterministic discovery orientation emitter.
 *
 * Reads the checked-in catalog manifest plus the authored source-family
 * purposes and emits src/mcp/micro-map.ts, and the corroboration guard into
 * src/policy/corroboration.ts. This is model-facing text, so it is
 * generated and guarded like the other emitted surfaces: family validation and
 * ADR-0003 leak checks fail loud. Its length is bounded where it is consumed:
 * test/mcp-instructions.test.ts holds the whole instructions string and each
 * tool description to Claude Code's character limit.
 */
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { assertNoNonExposedRefsInText } from "./emitted-text-guard.mjs";
import { writeFileAtomic } from "./lib/shared.mjs";
import {
  AUTHORITY_RULES,
  CORROBORATING_FAMILIES,
  CORROBORATION_GUARD_TEMPLATE,
  FAMILY_LINE,
  SERVICE_FAMILY_PURPOSES
} from "./catalog-data/source-families.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_PATH = join(ROOT, "catalog", "manifest.json");
const OUT_PATH = join(ROOT, "src", "mcp", "micro-map.ts");
const CORROBORATION_OUT_PATH = join(ROOT, "src", "policy", "corroboration.ts");

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

function countsByFamily(entries) {
  const counts = new Map();
  for (const entry of entries) {
    const family = counts.get(entry.service) ?? { operations: 0, skills: 0, skillSections: 0 };
    if (entry.kind === "operation") family.operations += 1;
    else if (entry.kind === "skill") family.skills += 1;
    else if (entry.kind === "skill-section") family.skillSections += 1;
    counts.set(entry.service, family);
  }
  return counts;
}

function countLabel(counts) {
  const parts = [];
  if (counts.operations) parts.push(`${counts.operations} ops`);
  if (counts.skills) parts.push(`${counts.skills} skills`);
  if (counts.skillSections) parts.push(`${counts.skillSections} sections`);
  return parts.join(", ");
}

export function validateFamilyPurposes(entries, familyPurposes = SERVICE_FAMILY_PURPOSES) {
  const serviceFamilies = new Set(entries.map((entry) => entry.service));
  for (const purpose of familyPurposes) {
    if (!serviceFamilies.has(purpose.family)) {
      throw new Error(`micro-map family "${purpose.family}" is not present in catalog/manifest.json`);
    }
  }
  for (const family of serviceFamilies) {
    if (!familyPurposes.some((purpose) => purpose.family === family)) {
      throw new Error(`catalog family "${family}" has no micro-map purpose prose`);
    }
  }
}

export function validateCorroboratingFamilies(entries, families = CORROBORATING_FAMILIES) {
  const serviceFamilies = new Set(entries.map((entry) => entry.service));
  if (!families.length) throw new Error("the corroboration guard needs at least one corroborating family");
  for (const { family, name } of families) {
    if (!serviceFamilies.has(family)) {
      throw new Error(`corroborating family "${family}" is not present in catalog/manifest.json`);
    }
    if (!name || /[`{}]/.test(name)) throw new Error(`corroborating family "${family}" has no plain name`);
  }
}

/** The guard sentence: the frozen template with the names of the corroborating families. */
export function corroborationGuard(families = CORROBORATING_FAMILIES, template = CORROBORATION_GUARD_TEMPLATE) {
  if (template.split("{families}").length !== 2) throw new Error("the guard template needs one {families}");
  return template.replace("{families}", families.map(({ name }) => name).join(", "));
}

export function assertGeneratedTextNoNonExposedRefs(text, entries, label) {
  const opIds = new Set(entries.filter((entry) => entry.kind === "operation").map((entry) => entry.id));
  const callableRe = /(?<![.\w])(?:lumenloop|scout|stellarDocs)\.[A-Za-z_]\w*/g;
  const TLDS = new Set(["com", "org", "net", "io", "xyz", "dev", "app", "buzz"]);
  for (const token of text.match(callableRe) ?? []) {
    if (TLDS.has(token.split(".")[1])) continue;
    if (!opIds.has(token)) {
      throw new Error(
        `ADR-0003 leak: ${label} emits a reference to non-exposed operation "${token}" — ` +
          `fix scripts/catalog-data/source-families.mjs or regenerate the catalog.`
      );
    }
  }
  assertNoNonExposedRefsInText(text, label);
}

export function buildMicroMap(manifest) {
  const entries = manifest.entries ?? [];
  validateFamilyPurposes(entries);
  validateCorroboratingFamilies(entries);

  const familyCounts = countsByFamily(entries);
  const sourceLines = SERVICE_FAMILY_PURPOSES.map((purpose) => {
    const counts = familyCounts.get(purpose.family);
    return `- ${purpose.label} (${purpose.family}; ${countLabel(counts)}): ${purpose.line} ${purpose.authority}`;
  });
  const authorityLines = AUTHORITY_RULES.map((rule) => `- ${rule}`);

  const microMap = [
    "## Source Micro-Map",
    "",
    "### Sources",
    ...sourceLines,
    "",
    "### Authority Rules",
    ...authorityLines
  ].join("\n");

  assertGeneratedTextNoNonExposedRefs(microMap, entries, "generated MICRO_MAP");
  assertGeneratedTextNoNonExposedRefs(FAMILY_LINE, entries, "generated FAMILY_LINE");
  const guard = corroborationGuard();
  assertGeneratedTextNoNonExposedRefs(guard, entries, "generated CORROBORATION_GUARD");

  return {
    microMap,
    familyLine: FAMILY_LINE,
    corroborationGuard: guard,
    corroboratingFamilyIds: CORROBORATING_FAMILIES.map(({ family }) => family)
  };
}

export function renderTs({ microMap, familyLine }) {
  return [
    "// Generated by scripts/build-micro-map.mjs. Do not edit by hand.",
    "",
    `export const MICRO_MAP = ${JSON.stringify(microMap)};`,
    "",
    `export const FAMILY_LINE = ${JSON.stringify(familyLine)};`,
    ""
  ].join("\n");
}

export function renderCorroborationTs({ corroborationGuard: guard, corroboratingFamilyIds }) {
  return [
    "// Generated by scripts/build-micro-map.mjs. Do not edit by hand.",
    "",
    `export const CORROBORATION_GUARD = ${JSON.stringify(guard)};`,
    "",
    "/** Service families whose own text is an official record; a call to any other family is uncorroborated. */",
    `export const CORROBORATING_FAMILY_IDS: readonly string[] = ${JSON.stringify(corroboratingFamilyIds)};`,
    ""
  ].join("\n");
}

function main() {
  const manifest = readJson(MANIFEST_PATH);
  const rendered = buildMicroMap(manifest);
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileAtomic(OUT_PATH, renderTs(rendered));
  writeFileAtomic(CORROBORATION_OUT_PATH, renderCorroborationTs(rendered));
  console.log(
    `src/mcp/micro-map.ts — MICRO_MAP ${rendered.microMap.length} chars, FAMILY_LINE ${rendered.familyLine.length} chars, CORROBORATION_GUARD ${rendered.corroborationGuard.length} chars`
  );
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main();
