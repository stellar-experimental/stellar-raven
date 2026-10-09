import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  rewriteScoutRefs,
  scoutRefRewrites,
  scrubNonExposedScoutSchemaRefs
} from "../scripts/description-notes.mjs";
import { assertNoNonExposedRefsInText } from "../scripts/emitted-text-guard.mjs";
import { NON_EXPOSED_SCOUT_OP_NAMES } from "../scripts/exposure.mjs";

const openapi = JSON.parse(readFileSync(new URL("../inventory/stellar-light.json", import.meta.url))).openapi;
const pairs = scoutRefRewrites(openapi);

describe("Scout references use complete paths", () => {
  it.each([
    "GET /api/hackathons/review",
    "/api/hackathons/review",
    "/api/hackathonsExtra",
    "/api/hackathons-extra",
    "/api/hackathons.json",
    "/api/hackathons%2Freview",
    "/api/hackathons+review",
    "/api/hackathons;review",
    "/api/hackathons:review",
    "/other/api/hackathons",
    "prefix/api/hackathons"
  ])("preserves a longer path: %s", (path) => {
    const text = `See ${path} before you apply.`;
    expect(rewriteScoutRefs(text, pairs)).toBe(text);
  });

  it.each([
    ["GET /api/hackathons", "scout.getHackathons"],
    ["/api/hackathons", "scout.getHackathons"],
    ["(/api/hackathons)", "(scout.getHackathons)"],
    ["`/api/hackathons`", "`scout.getHackathons`"],
    ["/api/hackathons.", "scout.getHackathons."],
    ["/api/hackathons?limit=5", "scout.getHackathons?limit=5"],
    ["GET /api/hackathons/{slug}", "scout.getHackathon"],
    ["use get_hackathons", "use getHackathons"]
  ])("rewrites an exact reference: %s", (text, expected) => {
    expect(rewriteScoutRefs(text, pairs)).toBe(expected);
  });

  it("leaves an excluded child path visible to the emitted-text guard", () => {
    const text = "See GET /api/hackathons/review before you apply.";
    const rewritten = rewriteScoutRefs(text, pairs);
    expect(rewritten).toBe(text);
    expect(() => assertNoNonExposedRefsInText(rewritten, "rewritten description"))
      .toThrow("/api/hackathons/review");
  });
});

describe("Scout schema descriptions remove excluded operation names", () => {
  it("preserves the current warning policies and exposed operation references", () => {
    const meta = openapi.components.schemas.Meta;
    const scrubbed = scrubNonExposedScoutSchemaRefs(meta);
    const original = meta.properties.warnings.description;
    const expected = original
      .replaceAll("getQualityReport", "upstream quality report")
      .replaceAll("verifyClaim", "upstream verify claim")
      .replaceAll("getRwaAssets", "upstream rwa assets");
    expect(scrubbed.properties.warnings.description).toBe(expected);
    expect(meta.properties.warnings.description).toBe(original);
    expect(() => assertNoNonExposedRefsInText(JSON.stringify(scrubbed), "Meta schema")).not.toThrow();
  });

  it("scrubs every excluded name in nested descriptions and arrays", () => {
    const names = [...NON_EXPOSED_SCOUT_OP_NAMES];
    const schema = { allOf: names.map((name) => ({ properties: {
      value: { description: `Use ${name} and scout.${name} semantics.` }
    } })) };
    const scrubbed = scrubNonExposedScoutSchemaRefs(schema);
    expect(() => assertNoNonExposedRefsInText(JSON.stringify(scrubbed), "nested schema")).not.toThrow();
    expect(scrubNonExposedScoutSchemaRefs(scrubbed)).toEqual(scrubbed);
  });

  it("preserves longer identifiers, exposed names, and non-description data", () => {
    const schema = {
      description: "reviewSubmissionCount getRwaAssetsExtra searchResearch getStablecoins",
      enum: ["reviewSubmission"],
      properties: { getRwaAssets: { type: "string" } }
    };
    expect(scrubNonExposedScoutSchemaRefs(schema)).toEqual(schema);
    expect(() => assertNoNonExposedRefsInText(JSON.stringify(schema), "schema data"))
      .toThrow("reviewSubmission");
  });

  it("preserves the existing excluded-path scrub", () => {
    expect(scrubNonExposedScoutSchemaRefs({ description: "Aggregated nightly from POST /api/feedback vote kinds." }))
      .toEqual({ description: "Aggregated nightly from upstream feedback vote kinds." });
  });
});
