#!/usr/bin/env node
/**
 * build-micro-map.mjs — deterministic family-line and corroboration-guard emitter.
 *
 * Reads the checked-in catalog manifest and the authored FAMILY_LINE and search opening and emits
 * src/mcp/micro-map.ts, and the corroboration guard into src/policy/corroboration.ts.
 * This is model-facing text, so it is generated and guarded like the other
 * emitted surfaces: family validation and ADR-0003 leak checks fail loud. The
 * family line's length is bounded where it is consumed: test/mcp-instructions.test.ts
 * holds each tool description to Claude Code's character limit.
 */
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { assertNoNonExposedRefsInText } from "./emitted-text-guard.mjs";
import { writeFileAtomic } from "./lib/shared.mjs";
import {
  CORROBORATING_FAMILIES,
  CORROBORATION_GUARD_TEMPLATE,
  FAMILY_LINE,
  SEARCH_OPENING_MAX_CHARS,
  SEARCH_OPENING_TEMPLATE
} from "./catalog-data/source-families.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_PATH = join(ROOT, "catalog", "manifest.json");
const OUT_PATH = join(ROOT, "src", "mcp", "micro-map.ts");
const CORROBORATION_OUT_PATH = join(ROOT, "src", "policy", "corroboration.ts");

const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));

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

/** The services that have at least one operation, in manifest order. */
export function operationFamilies(entries) {
  return [...new Set(entries.filter((entry) => entry.kind === "operation").map((entry) => entry.service))];
}

/** "a", "a and b", "a, b and c". */
function joinFamilies(names) {
  return names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

/**
 * The `search` opening: the frozen template with the operation families of the manifest. It must
 * fit where a client lists only the start of a description, so it fails loud when it does not.
 */
export function searchOpening(
  entries,
  template = SEARCH_OPENING_TEMPLATE,
  maxChars = SEARCH_OPENING_MAX_CHARS
) {
  if (template.split("{families}").length !== 2) throw new Error("the search opening template needs one {families}");
  const opening = template.replace("{families}", joinFamilies(operationFamilies(entries)));
  if (opening.length > maxChars || !opening.endsWith(".")) {
    throw new Error(
      `the search opening is ${opening.length} characters (limit ${maxChars}) or does not end in a full stop; reword SEARCH_OPENING_TEMPLATE: ${opening}`
    );
  }
  return opening;
}

export function assertGeneratedTextNoNonExposedRefs(text, entries, label) {
  const opIds = new Set(entries.filter((entry) => entry.kind === "operation").map((entry) => entry.id));
  const callableRe = /(?<![.\w])(?:lumenloop|scout|stellarDocs|stellarOrg)\.[A-Za-z_]\w*/g;
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
  validateCorroboratingFamilies(entries);
  assertGeneratedTextNoNonExposedRefs(FAMILY_LINE, entries, "generated FAMILY_LINE");
  const opening = searchOpening(entries);
  assertGeneratedTextNoNonExposedRefs(opening, entries, "generated SEARCH_OPENING");
  const guard = corroborationGuard();
  assertGeneratedTextNoNonExposedRefs(guard, entries, "generated CORROBORATION_GUARD");
  return {
    familyLine: FAMILY_LINE,
    searchOpening: opening,
    corroborationGuard: guard,
    corroboratingFamilyIds: CORROBORATING_FAMILIES.map(({ family }) => family)
  };
}

export function renderTs({ familyLine, searchOpening: opening }) {
  return [
    "// Generated by scripts/build-micro-map.mjs. Do not edit by hand.",
    "",
    `export const FAMILY_LINE = ${JSON.stringify(familyLine)};`,
    "",
    `export const SEARCH_OPENING = ${JSON.stringify(opening)};`,
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
    `src/mcp/micro-map.ts — FAMILY_LINE ${rendered.familyLine.length} chars, SEARCH_OPENING ${rendered.searchOpening.length} chars; src/policy/corroboration.ts — CORROBORATION_GUARD ${rendered.corroborationGuard.length} chars`
  );
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) main();
