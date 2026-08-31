import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SERVICE_FAMILY_PURPOSES, WORKFLOW_ARCHETYPES } from "../../scripts/catalog-data/workflow-archetypes.mjs";
import { MODEL, QUERY_TASK } from "./frontier-config.mjs";

export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
export const CLAUSE_ARTIFACT_PATH = path.join(
  REPO,
  "eval/vectorize/artifacts/qwen3-embedding-0.6b-q8-c25a394-clauses.json",
);
export const EXPERIMENT = "clause-fit-hysteresis-v1";
export const MARGINS = [0, 0.03, 0.06, 0.10];
export const CLAUSE_POLICY = {
  id: EXPERIMENT,
  margins: MARGINS,
  baseOrder: "P5+ungated-remainder",
  swap: ">=m and not-equal",
};
export const EXCLUSIONS = ["x-routing.keywords", "keywords", "routingKeywords"];
export const EXPECTED_UNMATCHED_SCOUT_OPS = [
  "scout.getChangelog",
  "scout.getChanges",
  "scout.getPartner",
  "scout.matchPartners",
];
export { MODEL, QUERY_TASK };

export function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

export function splitDescription(description) {
  return String(description)
    .split(/\n\s*\n/)
    .flatMap((part) => part.split(/(?<=[.!?])\s+(?=[A-Z"(])/))
    .map((part) => part.trim())
    .filter((part) => part.length >= 12 && !part.startsWith("Returns:"));
}

export function scoutRoutingByEntry(inventory, searchableIds) {
  const byId = new Map();
  for (const pathItem of Object.values(inventory?.openapi?.paths ?? {})) {
    for (const operation of Object.values(pathItem ?? {})) {
      if (!operation || typeof operation !== "object" || typeof operation.operationId !== "string") continue;
      const id = `scout.${operation.operationId}`;
      if (!searchableIds.has(id) || !operation["x-routing"]) continue;
      byId.set(id, operation["x-routing"]);
    }
  }
  return byId;
}

export function buildClauses(
  manifest,
  inventory,
  { familyPurposes = SERVICE_FAMILY_PURPOSES, workflows = WORKFLOW_ARCHETYPES } = {},
) {
  const entries = manifest.entries
    .filter((entry) => entry.searchable !== false)
    .slice()
    .sort((left, right) => left.id.localeCompare(right.id));
  const searchableIds = new Set(entries.map((entry) => entry.id));
  const routingByEntry = scoutRoutingByEntry(inventory, searchableIds);
  const familyById = new Map(familyPurposes.map((family) => [family.family, family]));
  const clauses = [];

  const add = (entry, header, role, source, index, line) => {
    const text = `${header}\n\n${line}`;
    clauses.push({
      entryId: entry.id,
      service: entry.service,
      kind: entry.kind,
      role,
      source,
      index,
      text,
      textSha256: sha256(text),
    });
  };

  for (const entry of entries) {
    const family = familyById.get(entry.service);
    if (!family) throw new Error(`missing source-family purpose for ${entry.service}`);
    const header = `Catalog entry: ${entry.id}. Kind: ${entry.kind}. Source family: ${family.label}. ${family.line} ${family.authority}`;
    const routing = routingByEntry.get(entry.id);
    if (routing?.purpose) add(entry, header, "positive", "purpose", 0, `Purpose: ${routing.purpose}`);
    for (const [index, value] of (routing?.useWhen ?? []).entries()) {
      add(entry, header, "positive", "useWhen", index, `Use when: ${value}`);
    }
    for (const [index, value] of (routing?.exampleQuestions ?? []).entries()) {
      add(entry, header, "positive", "exampleQuestion", index, `Example question: ${value}`);
    }
    for (const [index, value] of splitDescription(entry.description).entries()) {
      add(entry, header, "positive", "description", index, `Description: ${value}`);
    }
    const entryWorkflows = workflows.filter((workflow) => workflow.steps.includes(entry.id));
    for (const [index, workflow] of entryWorkflows.entries()) {
      add(entry, header, "positive", "workflow", index, `Workflow: ${workflow.title}: ${workflow.questionShape}`);
    }
    for (const [index, value] of (routing?.notFor ?? []).entries()) {
      add(entry, header, "negative", "notFor", index, `Not for: ${value}`);
    }
  }

  const unmatchedScoutOps = entries
    .filter((entry) => entry.service === "scout" && !routingByEntry.has(entry.id))
    .map((entry) => entry.id)
    .sort();
  return { clauses, unmatchedScoutOps };
}

export function clauseSetHash(clauses) {
  return sha256(
    JSON.stringify(
      clauses.map(({ entryId, service, kind, role, source, index, textSha256, text }) => ({
        entryId,
        service,
        kind,
        role,
        source,
        index,
        textSha256,
        text,
      })),
    ),
  );
}

export function loadClauseSource() {
  const manifestPath = path.join(REPO, "catalog/manifest.json");
  const inventoryPath = path.join(REPO, "inventory/stellar-light.json");
  const archetypesPath = path.join(REPO, "scripts/catalog-data/workflow-archetypes.mjs");
  const manifestBytes = readFileSync(manifestPath);
  const inventoryBytes = readFileSync(inventoryPath);
  const archetypesBytes = readFileSync(archetypesPath);
  const manifest = JSON.parse(manifestBytes);
  const inventory = JSON.parse(inventoryBytes);
  const built = buildClauses(manifest, inventory);
  return {
    manifest,
    inventory,
    ...built,
    inputs: {
      manifestSha256: sha256(manifestBytes),
      inventorySha256: sha256(inventoryBytes),
      archetypesSha256: sha256(archetypesBytes),
      inventoryFetchedAt: inventory.fetchedAt,
    },
  };
}

export function clauseFit(positiveScores, negativeScores = []) {
  if (!positiveScores.length) return Number.NEGATIVE_INFINITY;
  const pos = Math.max(...positiveScores);
  const neg = negativeScores.length ? Math.max(...negativeScores) : -1;
  return pos - Math.max(0, neg - pos);
}

export function applyClauseHysteresis(base, fits, margin) {
  if (margin === Infinity) return base.slice();
  const ordered = base.slice();
  for (let index = 1; index < ordered.length; index += 1) {
    const candidate = ordered[index];
    const candidateFit = fits.get(candidate.id) ?? Number.NEGATIVE_INFINITY;
    let target = index;
    while (target > 0) {
      const previousFit = fits.get(ordered[target - 1].id) ?? Number.NEGATIVE_INFINITY;
      if (!(candidateFit >= previousFit + margin && candidateFit !== previousFit)) break;
      target -= 1;
    }
    if (target !== index) {
      ordered.splice(index, 1);
      ordered.splice(target, 0, candidate);
    }
  }
  return ordered;
}
