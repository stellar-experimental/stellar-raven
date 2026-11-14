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
  validateFamilyPurposes
} from "../scripts/build-micro-map.mjs";
import { SERVICE_FAMILY_PURPOSES } from "../scripts/catalog-data/source-families.mjs";
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
    expect(MICRO_MAP_TOKEN_ESTIMATE).toBeLessThanOrEqual(700);
    expect(FAMILY_LINE_TOKEN_ESTIMATE).toBeLessThanOrEqual(150);
    expect(estimateTokens(MICRO_MAP)).toBe(MICRO_MAP_TOKEN_ESTIMATE);
    expect(estimateTokens(FAMILY_LINE)).toBe(FAMILY_LINE_TOKEN_ESTIMATE);
  });

  it("names every catalog family once, with its live counts, and no operation chain", () => {
    const families = [...new Set(manifest.entries.map((entry) => entry.service))];
    for (const family of families) {
      const lines = MICRO_MAP.split("\n").filter((line) => line.includes(`(${family};`));
      expect(lines, family).toHaveLength(1);
      const operations = manifest.entries.filter((e) => e.service === family && e.kind === "operation").length;
      if (operations > 0) expect(lines[0]).toContain(`${operations} ops`);
    }
    expect(MICRO_MAP).not.toMatch(/\w+\.\w+ -> /);
  });

  it("requires purpose prose for each catalog family, and a catalog family for each purpose", () => {
    expect(() => validateFamilyPurposes(manifest.entries)).not.toThrow();
    expect(() => validateFamilyPurposes(manifest.entries, SERVICE_FAMILY_PURPOSES.slice(1))).toThrow(
      /has no micro-map purpose prose/
    );
    expect(() =>
      validateFamilyPurposes(manifest.entries, [
        ...SERVICE_FAMILY_PURPOSES,
        { ...SERVICE_FAMILY_PURPOSES[0], family: "notAService" }
      ])
    ).toThrow(/family "notAService" is not present/);
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
