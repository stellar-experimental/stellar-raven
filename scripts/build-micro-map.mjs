#!/usr/bin/env node
/**
 * build-micro-map.mjs — deterministic discovery orientation emitter.
 *
 * Reads the checked-in catalog manifest plus authored workflow archetypes and
 * emits src/mcp/micro-map.ts. This is model-facing text, so it is generated
 * and guarded like the other emitted surfaces: exact id validation, token
 * budget checks, and ADR-0003 leak checks all fail loud.
 */
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { assertNoNonExposedRefsInText } from "./emitted-text-guard.mjs";
import { writeFileAtomic } from "./lib/shared.mjs";
import {
  AUTHORITY_RULES,
  FAMILY_LINE,
  SERVICE_FAMILY_PURPOSES,
  WORKFLOW_ARCHETYPES
} from "./catalog-data/workflow-archetypes.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_PATH = join(ROOT, "catalog", "manifest.json");
const OUT_PATH = join(ROOT, "src", "mcp", "micro-map.ts");

const MICRO_MAP_MIN_TOKENS = 800;
const MICRO_MAP_MAX_TOKENS = 1500;
const FAMILY_LINE_MAX_TOKENS = 150;

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

export function estimateTokens(text) {
  return Math.ceil(text.length / 4);
}

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

export function validateWorkflowArchetypes(archetypes, entries, familyPurposes = SERVICE_FAMILY_PURPOSES) {
  const serviceFamilies = new Set(entries.map((entry) => entry.service));
  const entryIds = new Set(entries.map((entry) => entry.id));
  const purposeFamilies = new Set(familyPurposes.map((purpose) => purpose.family));
  const archetypeIds = new Set();

  for (const purpose of familyPurposes) {
    if (!serviceFamilies.has(purpose.family)) {
      throw new Error(`micro-map family "${purpose.family}" is not present in catalog/manifest.json`);
    }
  }

  for (const archetype of archetypes) {
    if (archetypeIds.has(archetype.id)) throw new Error(`duplicate workflow archetype id: ${archetype.id}`);
    archetypeIds.add(archetype.id);
    if (!Array.isArray(archetype.families) || archetype.families.length === 0) {
      throw new Error(`workflow archetype "${archetype.id}" has no families`);
    }
    for (const family of archetype.families) {
      if (!serviceFamilies.has(family)) {
        throw new Error(`workflow archetype "${archetype.id}" references unknown family "${family}"`);
      }
      if (!purposeFamilies.has(family)) {
        throw new Error(`workflow archetype "${archetype.id}" references family "${family}" with no purpose prose`);
      }
    }
    if (!Array.isArray(archetype.steps) || archetype.steps.length === 0) {
      throw new Error(`workflow archetype "${archetype.id}" has no steps`);
    }
    for (const step of archetype.steps) {
      if (!entryIds.has(step)) {
        throw new Error(`workflow archetype "${archetype.id}" references non-manifest id "${step}"`);
      }
    }
  }
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
          `fix scripts/catalog-data/workflow-archetypes.mjs or regenerate the catalog.`
      );
    }
  }
  assertNoNonExposedRefsInText(text, label);
}

export function buildMicroMap(manifest) {
  const entries = manifest.entries ?? [];
  validateWorkflowArchetypes(WORKFLOW_ARCHETYPES, entries);

  const familyCounts = countsByFamily(entries);
  const sourceLines = SERVICE_FAMILY_PURPOSES.map((purpose) => {
    const counts = familyCounts.get(purpose.family);
    return `- ${purpose.label} (${purpose.family}; ${countLabel(counts)}): ${purpose.line} ${purpose.authority}`;
  });
  const authorityLines = AUTHORITY_RULES.map((rule) => `- ${rule}`);
  const workflowLines = WORKFLOW_ARCHETYPES.map((archetype) => {
    const steps = archetype.steps.join(" -> ");
    return `- ${archetype.title} — ${archetype.questionShape} -> ${archetype.families.join("/")} -> ${steps}.`;
  });

  const microMap = [
    "## Source Micro-Map",
    "",
    "### Sources",
    ...sourceLines,
    "",
    "### Authority Rules",
    ...authorityLines,
    "",
    "### Workflow Archetypes",
    ...workflowLines
  ].join("\n");

  const microMapTokens = estimateTokens(microMap);
  const familyLineTokens = estimateTokens(FAMILY_LINE);
  if (microMapTokens < MICRO_MAP_MIN_TOKENS || microMapTokens > MICRO_MAP_MAX_TOKENS) {
    throw new Error(
      `MICRO_MAP token estimate ${microMapTokens} outside ${MICRO_MAP_MIN_TOKENS}-${MICRO_MAP_MAX_TOKENS} ` +
        `(chars/4). Adjust scripts/catalog-data/workflow-archetypes.mjs.`
    );
  }
  if (familyLineTokens > FAMILY_LINE_MAX_TOKENS) {
    throw new Error(
      `FAMILY_LINE token estimate ${familyLineTokens} exceeds ${FAMILY_LINE_MAX_TOKENS} (chars/4).`
    );
  }
  assertGeneratedTextNoNonExposedRefs(microMap, entries, "generated MICRO_MAP");
  assertGeneratedTextNoNonExposedRefs(FAMILY_LINE, entries, "generated FAMILY_LINE");

  return { microMap, familyLine: FAMILY_LINE, microMapTokens, familyLineTokens };
}

export function renderTs({ microMap, familyLine, microMapTokens, familyLineTokens }) {
  return [
    "// Generated by scripts/build-micro-map.mjs. Do not edit by hand.",
    "",
    `export const MICRO_MAP = ${JSON.stringify(microMap)};`,
    "",
    `export const FAMILY_LINE = ${JSON.stringify(familyLine)};`,
    "",
    `export const MICRO_MAP_TOKEN_ESTIMATE = ${microMapTokens};`,
    `export const FAMILY_LINE_TOKEN_ESTIMATE = ${familyLineTokens};`,
    ""
  ].join("\n");
}

function main() {
  const manifest = readJson(MANIFEST_PATH);
  const rendered = buildMicroMap(manifest);
  mkdirSync(dirname(OUT_PATH), { recursive: true });
  writeFileAtomic(OUT_PATH, renderTs(rendered));
  console.log(
    `src/mcp/micro-map.ts — MICRO_MAP ~${rendered.microMapTokens} tokens, ` +
      `FAMILY_LINE ~${rendered.familyLineTokens} tokens`
  );
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main();
