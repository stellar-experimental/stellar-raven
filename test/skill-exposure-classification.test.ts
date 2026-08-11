/**
 * The raw Lumenloop onboarding skills stay out of model-facing catalog text,
 * but the exclusion decision still needs an auditable classification. This
 * guards the review ledger in scripts/exposure.mjs without changing emitted
 * artifacts.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  RETIRED_ONBOARDING_SKILLS,
  RETIRED_PARTNER_ONBOARDING_SKILLS,
  SKILL_EXPOSURE_CLASSIFICATION_BY_ID,
  SKILL_EXPOSURE_CLASSIFICATION_VALUES,
  SKILL_EXPOSURE_CLASSIFICATIONS
} from "../scripts/exposure.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const INVENTORY_PATH = join(ROOT, "research", "skill-exposure-inventory.json");
const inventory = JSON.parse(readFileSync(INVENTORY_PATH, "utf8")) as {
  columns: string[];
  allowedStates: string[];
  entries: Array<{
    id: string;
    aliases: string[];
    canonicalSource: string;
    sourceFamily: string;
    currentState: string;
    rawBodyPublic: string;
    acceptedLesson: string;
    rejectedLessons: string;
    targetSurface: string;
    rationale: string;
    evidenceRefs: string[];
    localOnlyEvidence?: string;
    leakGuardIds?: string[];
  }>;
};

const INVENTORY_COLUMNS = [
  "id",
  "aliases",
  "canonicalSource",
  "sourceFamily",
  "currentState",
  "rawBodyPublic",
  "acceptedLesson",
  "rejectedLessons",
  "targetSurface",
  "rationale",
  "evidenceRefs"
];

const REQUIRED_INVENTORY_IDS = [
  "skills.lumenloop.scf-submission-radar",
  "skills.lumenloop.stellar-builder-quickstart",
  "skills.lumenloop.stellar-content-auditor",
  "skills.lumenloop.stellar-ecosystem-digest",
  "skills.lumenloop.stellar-ecosystem-scout",
  "skills.lumenloop.stellar-integration-finder",
  "skills.lumenloop.stellar-project-dossier",
  "lumenloop-mcp-connect",
  "lumenloop-api-billing",
  "lumenloop-api-connect",
  "lumenloop-api-integrate",
  "lumenloop-api-keys",
  "lumenloop-api-query",
  "lumenloop-api-research",
  "skills.stellar-dev.smart-contracts",
  "legacy-soroban",
  "skills.stellar-dev.agentic-payments",
  "skills.stellar-dev.assets",
  "skills.stellar-dev.cross-chain",
  "skills.stellar-dev.dapp",
  "skills.stellar-dev.data",
  "skills.stellar-dev.standards",
  "skills.stellar-dev.zk-proofs",
  "skills.openzeppelin-stellar.setup-stellar-contracts",
  "skills.openzeppelin-stellar.develop-secure-contracts",
  "skills.openzeppelin-stellar.upgrade-stellar-contracts",
  "openzeppelin-nonstellar-skills",
  "skills.stellar-light.stellar-scout",
  "stellar-developer-activity",
  "legacy-lumenloop-public-copies",
  "legacy-stellar-light-copies",
  "legacy-sdf-build-skill-copies",
  "legacy-openzeppelin-copies",
  "cloudflare-agents",
  "ecosystem-skills",
  "eval-improvement",
  "raven-golden-evals",
  "service-skills-updater",
  "flue-docs-sync",
  "mastra",
  "flue",
  "generated-cache-example-skill-copies",
  "node-modules-package-skills",
  "stellar-ecosystem-directory-non-skill-cards",
  "sdf-marketplace-community-cards"
];

describe("skill exposure classifications", () => {
  it("covers every retired or removed Lumenloop onboarding skill exactly once", () => {
    const expected = new Set([...RETIRED_ONBOARDING_SKILLS, ...RETIRED_PARTNER_ONBOARDING_SKILLS]);
    const actual = SKILL_EXPOSURE_CLASSIFICATIONS.map((entry) => entry.id);
    expect(new Set(actual)).toEqual(expected);
    expect(actual).toHaveLength(expected.size);
  });

  it("uses only known non-emitted classification values", () => {
    for (const entry of SKILL_EXPOSURE_CLASSIFICATIONS) {
      expect(SKILL_EXPOSURE_CLASSIFICATION_VALUES.has(entry.classification), entry.id).toBe(true);
      expect(entry.emittedSurface, entry.id).toBe("none");
      expect(entry.rationale.trim().length, entry.id).toBeGreaterThan(20);
    }
  });

  it("keeps the public connector as internal guidance and partner skills as removed", () => {
    expect(SKILL_EXPOSURE_CLASSIFICATION_BY_ID.get("lumenloop-mcp-connect")?.classification).toBe(
      "internal-guidance"
    );
    for (const id of RETIRED_PARTNER_ONBOARDING_SKILLS) {
      expect(SKILL_EXPOSURE_CLASSIFICATION_BY_ID.get(id)?.classification, id).toBe("removed");
    }
  });
});

describe("skill exposure inventory artifact", () => {
  it("uses the required columns and known verdict values", () => {
    expect(inventory.columns).toEqual(INVENTORY_COLUMNS);
    const allowedStates = new Set(inventory.allowedStates);
    expect(allowedStates).toEqual(
      new Set([
        "exposed",
        "internal-guidance",
        "removed",
        "excluded-duplicate",
        "out-of-scope-operational"
      ])
    );

    for (const entry of inventory.entries) {
      expect(allowedStates.has(entry.currentState), entry.id).toBe(true);
      expect(["yes", "no", "name-only"].includes(entry.rawBodyPublic), entry.id).toBe(true);
      for (const column of INVENTORY_COLUMNS) {
        expect(Object.hasOwn(entry, column), `${entry.id} missing ${column}`).toBe(true);
      }
      expect(entry.canonicalSource.trim().length, entry.id).toBeGreaterThan(0);
      expect(entry.sourceFamily.trim().length, entry.id).toBeGreaterThan(0);
      expect(entry.rationale.trim().length, entry.id).toBeGreaterThan(20);
      expect(entry.evidenceRefs.length, entry.id).toBeGreaterThan(0);
    }
  });

  it("keeps inventory evidence portable or explicitly marked local-only", () => {
    const machineLocalRef = /^(\/Users\/|\/tmp\/)/;
    for (const entry of inventory.entries) {
      const portableRefs = entry.evidenceRefs.filter((ref) => !machineLocalRef.test(ref));
      const hasLocalOnlyMarker = typeof entry.localOnlyEvidence === "string"
        && entry.localOnlyEvidence.trim().length > 20;
      expect(
        portableRefs.length > 0 || hasLocalOnlyMarker,
        `${entry.id} needs portable evidenceRefs or localOnlyEvidence`
      ).toBe(true);
      if (!hasLocalOnlyMarker) {
        expect(entry.evidenceRefs.some((ref) => machineLocalRef.test(ref)), entry.id).toBe(false);
      }
    }
  });

  it("covers every required historical/non-exposed source family exactly once", () => {
    const ids = inventory.entries.map((entry) => entry.id);
    expect(ids).toEqual(REQUIRED_INVENTORY_IDS);
    expect(new Set(ids).size).toBe(ids.length);

    const aliasOwner = new Map<string, string>();
    for (const entry of inventory.entries) {
      for (const alias of entry.aliases) {
        const previous = aliasOwner.get(alias);
        expect(previous, `${alias} appears on both ${previous} and ${entry.id}`).toBeUndefined();
        aliasOwner.set(alias, entry.id);
      }
    }
  });

  it("keeps exposed skill rows aligned with the committed manifest", () => {
    const manifest = JSON.parse(readFileSync(join(ROOT, "catalog", "manifest.json"), "utf8")) as {
      entries: Array<{ id: string; kind: string }>;
    };
    const exposedSkillIds = manifest.entries
      .filter((entry) => entry.kind === "skill")
      .map((entry) => entry.id)
      .sort();
    const inventoryExposedIds = inventory.entries
      .filter((entry) => entry.currentState === "exposed")
      .map((entry) => entry.id)
      .sort();
    expect(inventoryExposedIds).toEqual(exposedSkillIds);
  });

  it("keeps retired/internal ids out of emitted model-facing artifacts", () => {
    const leakGuardIds = inventory.entries.flatMap((entry) => entry.leakGuardIds ?? []);
    expect(leakGuardIds).toEqual([
      "lumenloop-mcp-connect",
      "lumenloop-api-billing",
      "lumenloop-api-connect",
      "lumenloop-api-integrate",
      "lumenloop-api-keys",
      "lumenloop-api-query",
      "lumenloop-api-research",
      "stellar-developer-activity"
    ]);

    const emittedFiles = [
      "catalog/manifest.json",
      "specs/super-spec.json",
      "src/demo/page.ts",
      "src/demo/prompt.ts",
      "src/demo/tools.ts",
      "src/mcp/tools.ts"
    ];
    for (const rel of emittedFiles) {
      const text = readFileSync(join(ROOT, rel), "utf8");
      for (const id of leakGuardIds) {
        expect(text.includes(id), `${rel} leaks ${id}`).toBe(false);
      }
    }
  });
});
