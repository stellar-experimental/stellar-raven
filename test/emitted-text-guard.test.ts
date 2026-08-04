/**
 * assertNoNonExposedRefsInText — the ADR-0003 leak guard's reusable core
 * (scripts/emitted-text-guard.mjs), factored out of build-catalog.mjs's
 * per-entry check so /demo page copy and prompt text (which have no
 * manifest opIds allowlist) can run the SAME exclusion-data checks. Real
 * exclusion data from scripts/exposure.mjs, not fixture stand-ins — a
 * renamed/removed exclusion must surface here, not just in the build.
 */
import { describe, expect, it } from "vitest";
import { assertNoNonExposedRefsInText } from "../scripts/emitted-text-guard.mjs";
import {
  EXCLUDED_LUMENLOOP_OPS,
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
    // The guard once built its own regex from RETIRED_ONBOARDING_SKILLS alone,
    // so it knew one id while src/skills/scrub.ts stripped three families —
    // emitted text could have carried a partner-retired or internal-guidance
    // id past the build. Both now share RETIRED_SKILL_REF_RE; this pins the
    // behavior so a future "simplification" back to a local list is caught.
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
