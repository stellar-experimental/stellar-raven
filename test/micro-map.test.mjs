/**
 * build-micro-map.mjs — staleness and guard coverage for the generated
 * SERVER_INSTRUCTIONS orientation layer.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertGeneratedTextNoNonExposedRefs,
  buildMicroMap,
  estimateTokens,
  renderTs,
  validateWorkflowArchetypes
} from "../scripts/build-micro-map.mjs";
import { SERVICE_FAMILY_PURPOSES, WORKFLOW_ARCHETYPES } from "../scripts/catalog-data/workflow-archetypes.mjs";
import {
  FAMILY_LINE,
  FAMILY_LINE_TOKEN_ESTIMATE,
  MICRO_MAP,
  MICRO_MAP_TOKEN_ESTIMATE
} from "../src/mcp/micro-map.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_PATH = join(ROOT, "catalog", "manifest.json");
const MICRO_MAP_PATH = join(ROOT, "src", "mcp", "micro-map.ts");

const committed = readFileSync(MICRO_MAP_PATH, "utf8");
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));

describe("build-micro-map.mjs", () => {
  it("the checked-in generated file matches the in-memory render", () => {
    expect(committed, "src/mcp/micro-map.ts is stale — run node scripts/build-micro-map.mjs").toBe(
      renderTs(buildMicroMap(manifest))
    );
  });

  it("emits text within the model-facing token budgets", () => {
    const rendered = buildMicroMap(manifest);
    expect(rendered.microMap).toBe(MICRO_MAP);
    expect(rendered.familyLine).toBe(FAMILY_LINE);
    expect(rendered.microMapTokens).toBe(MICRO_MAP_TOKEN_ESTIMATE);
    expect(rendered.familyLineTokens).toBe(FAMILY_LINE_TOKEN_ESTIMATE);
    expect(MICRO_MAP_TOKEN_ESTIMATE).toBeGreaterThanOrEqual(800);
    expect(MICRO_MAP_TOKEN_ESTIMATE).toBeLessThanOrEqual(1500);
    expect(FAMILY_LINE_TOKEN_ESTIMATE).toBeLessThanOrEqual(150);
    expect(estimateTokens(MICRO_MAP)).toBe(MICRO_MAP_TOKEN_ESTIMATE);
    expect(estimateTokens(FAMILY_LINE)).toBe(FAMILY_LINE_TOKEN_ESTIMATE);
  });

  it("validates every workflow archetype against real service families and manifest ids", () => {
    expect(() => validateWorkflowArchetypes(WORKFLOW_ARCHETYPES, manifest.entries)).not.toThrow();
    expect(() =>
      validateWorkflowArchetypes(
        [{ ...WORKFLOW_ARCHETYPES[0], id: "bad-family", families: ["notAService"] }],
        manifest.entries
      )
    ).toThrow(/unknown family "notAService"/);
    expect(() =>
      validateWorkflowArchetypes(
        [
          {
            ...WORKFLOW_ARCHETYPES[0],
            id: "bad-step",
            steps: ["lumenloop.not_exposed"]
          }
        ],
        manifest.entries
      )
    ).toThrow(/non-manifest id "lumenloop.not_exposed"/);
    expect(() =>
      validateWorkflowArchetypes([WORKFLOW_ARCHETYPES[0], WORKFLOW_ARCHETYPES[0]], manifest.entries)
    ).toThrow(/duplicate workflow archetype id/);
  });

  it("requires purpose prose for each emitted source family", () => {
    expect(() =>
      validateWorkflowArchetypes(WORKFLOW_ARCHETYPES, manifest.entries, SERVICE_FAMILY_PURPOSES)
    ).not.toThrow();
    expect(() =>
      validateWorkflowArchetypes(WORKFLOW_ARCHETYPES, manifest.entries, SERVICE_FAMILY_PURPOSES.slice(1))
    ).toThrow(/with no purpose prose/);
  });

  it("applies ADR-0003 emitted-text guards to micro-map prose", () => {
    expect(() =>
      assertGeneratedTextNoNonExposedRefs(MICRO_MAP + "\n" + FAMILY_LINE, manifest.entries, "micro-map")
    ).not.toThrow();
    expect(() =>
      assertGeneratedTextNoNonExposedRefs("call lumenloop.request_research", manifest.entries, "bad text")
    ).toThrow(/ADR-0003 leak/);
    expect(() =>
      assertGeneratedTextNoNonExposedRefs("call lumenloop.not_exposed", manifest.entries, "bad text")
    ).toThrow(/non-exposed operation "lumenloop.not_exposed"/);
  });
});
