/**
 * Tests for scripts/emitted-text-guard.mjs (ADR-0003) using the real exclusion sets
 * from scripts/exposure.mjs so Playground page copy and prompts share the catalog guard.
 */
import { describe, expect, it } from "vitest";
import { assertNoNonExposedRefsInText } from "../scripts/emitted-text-guard.mjs";
import {
  EXCLUDED_LUMENLOOP_OPS,
  EXCLUDED_SCOUT_PATHS,
  NON_EXPOSED_SCOUT_OP_NAMES,
  RETIRED_ONBOARDING_SKILLS,
  RETIRED_PARTNER_ONBOARDING_SKILLS
} from "../scripts/exposure.mjs";
import { RETIRED_SKILL_REF_RE } from "../src/skills/scrub.ts";

describe("assertNoNonExposedRefsInText", () => {
  it("passes clean text with no non-exposed references", () => {
    expect(() =>
      assertNoNonExposedRefsInText(
        "search the catalog, then call execute — this playground exercises the same " +
          "server-side Raven tool implementations as /mcp.",
        "demo system prompt"
      )
    ).not.toThrow();
  });

  it("matches a templated excluded Scout path with a concrete value, not its exposed parent", () => {
    expect(() =>
      assertNoNonExposedRefsInText("fetch /api/hackathons/builds/dorahacks-buidl-12", "skill prose")
    ).toThrow(/\/api\/hackathons\/builds\/\{id\}/);
    expect(() =>
      assertNoNonExposedRefsInText("search /api/hackathons/builds?q=defi first", "skill prose")
    ).not.toThrow();
  });

  it("throws on a bare excluded lumenloop op name", () => {
    expect(EXCLUDED_LUMENLOOP_OPS.has("request_research")).toBe(true);
    expect(() =>
      assertNoNonExposedRefsInText(
        "the gateway can commission a request_research job for you",
        "demo page copy"
      )
    ).toThrow(/request_research/);
  });

  it("throws on the service-qualified form of an excluded lumenloop op", () => {
    expect(() =>
      assertNoNonExposedRefsInText(
        "call lumenloop.request_research to start a deep-research job",
        "demo tool description"
      )
    ).toThrow(/lumenloop\.request_research/);
  });

  it("rejects every excluded Scout name, bare and service-qualified", () => {
    expect(NON_EXPOSED_SCOUT_OP_NAMES.has("reviewSubmission")).toBe(true);
    expect(NON_EXPOSED_SCOUT_OP_NAMES.has("getRwaAssets")).toBe(true);
    for (const name of NON_EXPOSED_SCOUT_OP_NAMES) {
      for (const reference of [name, `scout.${name}`]) {
        expect(() => assertNoNonExposedRefsInText(`Use ${reference} here.`, "emitted text"))
          .toThrow(name);
      }
    }
  });

  it("rejects snake_case and case variants of every excluded Scout name", () => {
    for (const name of NON_EXPOSED_SCOUT_OP_NAMES) {
      const snake = name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
      for (const reference of [snake, `scout.${snake}`, name.toUpperCase()]) {
        expect(() => assertNoNonExposedRefsInText(`Use ${reference}.`, "emitted text"))
          .toThrow(/excluded scout operation name/);
      }
    }
  });

  it.each(["/api/Hackathons/review", "/API/HACKATHONS/REVIEW",
    "/api/hackathons%2Freview", "%2Fapi%2Fhackathons%2Freview",
    "100% coverage: /api/hackathons%2freview", "%ZZ /api/hackathons%2Freview"])(
    "rejects encoded or case variants of an excluded path: %s", (text) => {
      expect(() => assertNoNonExposedRefsInText(text, "emitted text"))
        .toThrow("/api/hackathons/review");
    }
  );

  it("preserves clean text with malformed percent encoding", () => {
    expect(() => assertNoNonExposedRefsInText("100% %ZZ %E0%A4%A", "emitted text")).not.toThrow();
  });

  it("rejects the excluded child path that an exposed prefix once hid", () => {
    expect(() => assertNoNonExposedRefsInText(
      "See GET /api/hackathons/review before you apply.", "emitted text"
    )).toThrow("/api/hackathons/review");
  });

  it("rejects every path in EXCLUDED_SCOUT_PATHS (including trailing slash) while allowing distinct child paths", () => {
    for (const path of EXCLUDED_SCOUT_PATHS) {
      expect(() => assertNoNonExposedRefsInText(`Use ${path}.`, "emitted text"), path).toThrow(path);
      expect(() => assertNoNonExposedRefsInText(`Use ${path}/.`, "emitted text"), `${path}/`).toThrow(path);
      if (!path.includes("{")) {
        expect(() => assertNoNonExposedRefsInText(`Use ${path}/child.`, "emitted text"), `${path}/child`).not.toThrow();
      }
    }
  });

  it("does not match an excluded name inside a longer identifier", () => {
    expect(() => assertNoNonExposedRefsInText(
      "reviewSubmissionCount getRwaAssetsExtra prereviewSubmission", "emitted text"
    )).not.toThrow();
  });

  it("throws on a retired-skill id taken from the real exclusion data", () => {
    const [retiredSkillId] = RETIRED_ONBOARDING_SKILLS;
    expect(typeof retiredSkillId).toBe("string");
    // The retired-skill check (like build-catalog.mjs's original) reports
    // that a reference was found without echoing the matched id back — the
    // id itself is still what triggers the throw.
    expect(() =>
      assertNoNonExposedRefsInText(
        `see the ${retiredSkillId} skill for connector setup`,
        "demo page copy"
      )
    ).toThrow(/retired-skill reference/);
  });

  it("catches EVERY retired family the runtime scrub strips, not just the onboarding one", () => {
    // Pins parity with src/skills/scrub.ts (shared RETIRED_SKILL_REF_RE across all retired families).
    const everyRetiredId = [
      ...RETIRED_ONBOARDING_SKILLS,
      ...RETIRED_PARTNER_ONBOARDING_SKILLS,
      "stellar-developer-activity" // internal-guidance, non-exposed (scrub.ts)
    ];
    expect(everyRetiredId.length).toBeGreaterThan(6);
    for (const id of everyRetiredId) {
      expect(RETIRED_SKILL_REF_RE.test(id), `scrub does not strip ${id}`).toBe(true);
      expect(
        () => assertNoNonExposedRefsInText(`see the ${id} skill`, "emitted text"),
        `guard does not catch retired id ${id}`
      ).toThrow(/retired-skill reference/);
    }
  });

  it("names the offending reference and the label in the thrown message", () => {
    expect(() =>
      assertNoNonExposedRefsInText("request_research", "rendered demo HTML")
    ).toThrow(/rendered demo HTML.*request_research/s);
  });
});
