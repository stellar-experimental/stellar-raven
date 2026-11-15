/**
 * build-micro-map.mjs — staleness and guard coverage for the generated
 * family line that sits inside the `search` description.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertGeneratedTextNoNonExposedRefs,
  buildMicroMap,
  renderCorroborationTs,
  renderTs
} from "../scripts/build-micro-map.mjs";
import * as emitted from "../src/mcp/micro-map.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_PATH = join(ROOT, "catalog", "manifest.json");
const MICRO_MAP_PATH = join(ROOT, "src", "mcp", "micro-map.ts");
const CORROBORATION_PATH = join(ROOT, "src", "policy", "corroboration.ts");

const committed = readFileSync(MICRO_MAP_PATH, "utf8");
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));

describe("build-micro-map.mjs", () => {
  it("the checked-in generated file matches the in-memory render", () => {
    expect(committed, "src/mcp/micro-map.ts is stale — run node scripts/build-micro-map.mjs").toBe(
      renderTs(buildMicroMap(manifest))
    );
  });

  it("the checked-in corroboration module matches the in-memory render", () => {
    expect(
      readFileSync(CORROBORATION_PATH, "utf8"),
      "src/policy/corroboration.ts is stale — run node scripts/build-micro-map.mjs"
    ).toBe(renderCorroborationTs(buildMicroMap(manifest)));
  });

  it("emits only the family line to micro-map.ts: the per-family source map is not generated", () => {
    // Length is bounded by the `search` description guard in test/mcp-instructions.test.ts.
    expect(Object.keys(emitted)).toEqual(["FAMILY_LINE"]);
    expect(buildMicroMap(manifest)).toMatchObject({ familyLine: emitted.FAMILY_LINE });
    expect(committed).not.toContain("MICRO_MAP");
  });

  it("names every catalog family in the family line, and no operation chain", () => {
    const families = [...new Set(manifest.entries.map((entry) => entry.service))];
    for (const family of families) expect(emitted.FAMILY_LINE, family).toContain(`${family}=`);
    expect(emitted.FAMILY_LINE).not.toMatch(/\w+\.\w+ -> /);
  });

  it("applies ADR-0003 emitted-text guards to the family line", () => {
    expect(() => assertGeneratedTextNoNonExposedRefs(emitted.FAMILY_LINE, manifest.entries, "family line")).not.toThrow();
    expect(() =>
      assertGeneratedTextNoNonExposedRefs("call lumenloop.request_research", manifest.entries, "bad text")
    ).toThrow(/ADR-0003 leak/);
    expect(() =>
      assertGeneratedTextNoNonExposedRefs("call lumenloop.not_exposed", manifest.entries, "bad text")
    ).toThrow(/non-exposed operation "lumenloop.not_exposed"/);
  });
});
