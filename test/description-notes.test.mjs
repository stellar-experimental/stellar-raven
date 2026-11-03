import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  rewriteScoutRefs,
  scoutRefRewrites,
  scrubNonExposedScoutText,
  scrubScoutDescription,
  scrubNonExposedScoutSchemaRefs
} from "../scripts/description-notes.mjs";
import { assertNoNonExposedRefsInText } from "../scripts/emitted-text-guard.mjs";
import { EXCLUDED_SCOUT_OPS, NON_EXPOSED_SCOUT_OP_NAMES } from "../scripts/exposure.mjs";

const openapi = JSON.parse(readFileSync(new URL("../inventory/stellar-light.json", import.meta.url))).openapi;
const pairs = scoutRefRewrites(openapi);

describe("Scout upstream text removes excluded references", () => {
  it.each([...NON_EXPOSED_SCOUT_OP_NAMES])("scrubs every spelling of %s", (name) => {
    const snake = name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
    const text = `Count like ${name}; use scout.${name}, ${snake}, SCOUT.${snake.toUpperCase()}. ` +
      "Resolve events with getHackathons.";
    const scrubbed = scrubNonExposedScoutText(text);
    expect(() => assertNoNonExposedRefsInText(scrubbed, "upstream text")).not.toThrow();
    expect(scrubbed).toContain("Resolve events with getHackathons.");
    expect(scrubNonExposedScoutText(scrubbed)).toBe(scrubbed);
  });

  it("preserves clean text and longer identifiers", () => {
    const text = "reviewSubmissionCount getRwaAssetsExtra searchResearch quality report";
    expect(scrubNonExposedScoutText(text)).toBe(text);
  });
});

describe("Scout operation descriptions drop excluded clauses", () => {
  it.each([...NON_EXPOSED_SCOUT_OP_NAMES])("drops %s without adding its words", (name) => {
    const snake = name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
    for (const spelling of [name, `scout.${name}`, snake, `SCOUT.${snake.toUpperCase()}`]) {
      expect(scrubScoutDescription("compareHackathons", {
        summary: `Use ${spelling}. Keep the summary.`,
        description: `Keep this sentence. Compare with ${spelling}; Keep this clause.`
      })).toEqual({ summary: "Keep the summary.", description: "Keep this sentence. Keep this clause." });
    }
  });

  it.each([...EXCLUDED_SCOUT_OPS])("drops excluded path clauses for %s", (signature) => {
    const path = signature.slice(signature.indexOf(" ") + 1);
    for (const reference of [signature, path]) {
      expect(scrubScoutDescription("compareHackathons", {
        description: `See ${reference}. Keep this sentence.`
      })).toEqual({ summary: "", description: "Keep this sentence." });
    }
  });

  it("checks authored scrubs across both fields and rejects missing needles", () => {
    expect(scrubScoutDescription("getStatus", {
      summary: "Use to check freshness or to discover endpoints.", description: "Read the status."
    })).toEqual({ summary: "Use to check freshness.", description: "Read the status." });
    expect(() => scrubScoutDescription("getStatus", { summary: "Read the status." }))
      .toThrow("needle not found");
  });
});

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
    "prefix/api/hackathons",
    "https://stellarlight.xyz/api/hackathons",
    "GET https://stellarlight.xyz/api/hackathons",
    "/api/hackathons/{id}",
    "/api/hackathons/"
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
    ["/api/hackathons; more text", "scout.getHackathons; more text"],
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
      .replace(", getQualityReport, verifyClaim", "")
      .replace(", getRwaAssets", "");
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

  it.each(["/api/rwa/assets", "/api/feedback-forms", "/api/feedbacks", "/api/feedback/",
    "https://stellarlight.xyz/api/feedback"])("preserves a longer or hosted schema path: %s", (path) => {
    expect(scrubNonExposedScoutSchemaRefs({ description: path })).toEqual({ description: path });
  });

  it.each(["GET /api/hackathons/review", "/api/hackathons/review"])(
    "scrubs an absent-from-spec schema path: %s", (path) => {
      expect(scrubNonExposedScoutSchemaRefs({ description: `See ${path}.` }))
        .toEqual({ description: "See upstream review." });
    }
  );

  it("removes excluded items at either list boundary and preserves clean lists", () => {
    for (const description of [
      "Policy (getRwaAssets, listAudits, getStablecoins).",
      "Policy (listAudits, getStablecoins, scout.reviewSubmission).",
      "Policy (GET_RWA_ASSETS, listAudits, getStablecoins)."
    ]) {
      expect(scrubNonExposedScoutSchemaRefs({ description })).toEqual({
        description: "Policy (listAudits, getStablecoins)."
      });
    }
    const clean = { description: "Policy (listAudits,  getStablecoins)." };
    expect(scrubNonExposedScoutSchemaRefs(clean)).toEqual(clean);
    expect(scrubNonExposedScoutSchemaRefs({ description: "(getRwaAssets, reviewSubmission)" }))
      .toEqual({ description: "" });
  });

  it.each([...EXCLUDED_SCOUT_OPS])("uses a static path label for %s", (signature) => {
    const path = signature.slice(signature.indexOf(" ") + 1);
    const label = path.split("/").filter((part) => part && !/^\{.*\}$/.test(part)).at(-1).replaceAll("-", " ");
    for (const reference of [signature, path]) {
      const scrubbed = scrubNonExposedScoutSchemaRefs({ description: `See ${reference}.` });
      expect(scrubbed).toEqual({ description: `See upstream ${label}.` });
      expect(scrubbed.description).not.toMatch(/[{}]/);
    }
  });

  it.each([...NON_EXPOSED_SCOUT_OP_NAMES])("removes empty list spacing for %s", (name) => {
    for (const [description, expected] of [
      [`Policy (${name}, scout.${name}).`, "Policy."],
      [`Policy (${name}, scout.${name}) applies.`, "Policy applies."],
      [`  (${name}, scout.${name})  `, ""]
    ]) {
      expect(scrubNonExposedScoutSchemaRefs({ description })).toEqual({ description: expected });
    }
  });

  it("preserves the existing excluded-path scrub", () => {
    expect(scrubNonExposedScoutSchemaRefs({ description: "Aggregated nightly from POST /api/feedback vote kinds." }))
      .toEqual({ description: "Aggregated nightly from upstream feedback vote kinds." });
  });
});
