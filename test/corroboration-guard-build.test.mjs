/**
 * The corroboration guard's generator (tuning loop 2, amendment A2): the wording is frozen by hash,
 * the families are data, and the emitted module is the generator's output.
 */
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  buildMicroMap,
  corroborationGuard,
  renderCorroborationTs,
  validateCorroboratingFamilies
} from "../scripts/build-micro-map.mjs";
import { CORROBORATING_FAMILIES, CORROBORATION_GUARD_TEMPLATE } from "../scripts/catalog-data/source-families.mjs";
import { CORROBORATING_FAMILY_IDS, CORROBORATION_GUARD } from "../src/policy/corroboration.ts";
import { getCatalog } from "../src/catalog/load.ts";

const sha256 = (text) => createHash("sha256").update(text).digest("hex");

describe("the guard sentence", () => {
  it("is frozen: the wording of amendment A2, by hash", () => {
    // Changing this hash changes the sentence the measured runs carry. It was frozen before any
    // stored answer was read, and a later edit needs the orchestrator's ruling.
    expect(sha256(CORROBORATION_GUARD_TEMPLATE)).toBe(
      "780fae735c0eb8faff2ecf01edeb2ebaaee13b4842a828b528889f4b86cc9a3c"
    );
  });

  it("is the template with the corroborating families named, and the emitted module is current", () => {
    expect(CORROBORATION_GUARD).toBe(corroborationGuard());
    expect(CORROBORATION_GUARD).toHaveLength(415);
    expect(CORROBORATING_FAMILY_IDS).toEqual(CORROBORATING_FAMILIES.map(({ family }) => family));
    const manifest = { entries: getCatalog().entries };
    expect(renderCorroborationTs(buildMicroMap(manifest))).toContain(`"${CORROBORATION_GUARD.slice(0, 20)}`);
  });

  it("lengthens by the name of a family added as data, and by nothing else", () => {
    const added = corroborationGuard([...CORROBORATING_FAMILIES, { family: "x", name: "stellar.org" }]);
    expect(added.length - CORROBORATION_GUARD.length).toBe(", stellar.org".length);
    expect(added).toContain("Stellar Docs, a skill, stellar.org or a primary record");
  });

  it("rejects a template without exactly one slot", () => {
    expect(() => corroborationGuard(CORROBORATING_FAMILIES, "no slot")).toThrow(/one \{families\}/);
    expect(() => corroborationGuard(CORROBORATING_FAMILIES, "{families} {families}")).toThrow(/one \{families\}/);
  });

  it("fails the build for a family the catalog does not have, or one with no plain name", () => {
    const entries = getCatalog().entries;
    expect(() => validateCorroboratingFamilies(entries, CORROBORATING_FAMILIES)).not.toThrow();
    expect(() => validateCorroboratingFamilies(entries, [{ family: "nope", name: "Nope" }])).toThrow(/not present/);
    expect(() => validateCorroboratingFamilies(entries, [{ family: "skills", name: "{families}" }])).toThrow(/plain name/);
    expect(() => validateCorroboratingFamilies(entries, [])).toThrow(/at least one/);
  });
});
