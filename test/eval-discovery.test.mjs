import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { classifyRegister } from "../eval/discovery/mine-agent-queries.mjs";
import { aggregateAgentEvidence, classifyMiss } from "../eval/discovery/classify-misses.mjs";
import { capSearchEvidence, gradeVisibleSearches } from "../eval/discovery/lib.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("discovery measurement extensions", () => {
  it("classifies one-shot misses from paired <=3-search evidence", () => {
    expect(classifyMiss({ familyHitAt3: true, usableOpAt5: true }, null)).toBe("downstream");
    expect(
      classifyMiss(
        { familyHitAt3: false, usableOpAt5: false },
        { familyHitAt3: true, usableOpAt5: true }
      )
    ).toBe("agent-behavior");
    expect(
      classifyMiss(
        { familyHitAt3: false, usableOpAt5: false },
        { familyHitAt3: true, usableOpAt5: false }
      )
    ).toBe("retrieval");
  });

  it("grades visibility across multiple searches without crediting final prose", () => {
    const c = { expectedFamilies: ["lumenloop"], acceptableOps: ["lumenloop.search_directory"] };
    const grade = gradeVisibleSearches(c, [
      { hits: [{ id: "scout.searchProjects", service: "scout" }] },
      { hits: [{ id: "lumenloop.search_directory", service: "lumenloop" }] }
    ]);
    expect(grade).toEqual({ familyHitAt3: true, usableOpAt5: true });
  });

  it("caps over-limit search evidence and rejects its final selection contract", () => {
    const capped = capSearchEvidence([{ hits: [] }, { hits: [] }, { hits: [] }, { hits: [] }]);
    expect(capped.searches).toHaveLength(3);
    expect(capped.observedSearchCount).toBe(4);
    expect(capped.searchContractValid).toBe(false);
  });

  it("requires family and operation recovery in the same agent run", () => {
    const split = aggregateAgentEvidence([
      { familyHitAt3: true, usableOpAt5: false },
      { familyHitAt3: false, usableOpAt5: true }
    ]);
    expect(split).toMatchObject({ familyHitAt3: true, usableOpAt5: true, recoveredTogether: false });
    expect(classifyMiss({ familyHitAt3: false, usableOpAt5: false }, split)).toBe("retrieval");
  });

  it("classifies the mined register with an explicit, deterministic rule", () => {
    expect(classifyRegister("Soroswap DEX project profile", "q-defi-soroswap-what-is")).toBe("mixed");
    expect(classifyRegister("Soroswap DEX Stellar", "q-defi-soroswap-what-is")).toBe("entity-only");
    expect(classifyRegister("weighted AMM research articles", "q-defi-comet-content")).toBe("capability");
  });

  it("keeps the committed replay lane PII-safe and provenance-bearing", () => {
    const lane = JSON.parse(readFileSync(path.join(ROOT, "eval/discovery/mined-lumenloop-queries.json"), "utf8"));
    expect(lane.summary.occurrenceCount).toBe(lane.occurrences.length);
    expect(lane.summary.caseCount).toBe(8);
    expect(lane.provenance).toHaveLength(3);
    for (const row of lane.occurrences) {
      expect(row.query).not.toMatch(/[A-Z2-7]{56}/);
      expect(row.query).not.toMatch(/\b[^\s@]+@[^\s@]+\.[^\s@]+\b/);
    }
  });
});

