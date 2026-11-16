import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  OVERLAP_PATH,
  REGENERATE_COMMAND,
  computeOverlap,
  matchesAtThreshold,
  overlapDifferences,
  serialize,
  tokenSet,
} from "../eval/routing-qa-overlap.mjs";
import { confirmationOnlyFor, consoleValue, tagRows } from "../eval/lib/confirmation-only.mjs";

describe("tokenSet", () => {
  it("lowercases, applies NFKC and splits on non-letter, non-digit runs", () => {
    expect([...tokenSet("Soroban—RPC: ｆｅｅ 2.0!")].sort()).toEqual(["0", "2", "fee", "rpc", "soroban"]);
  });
});

describe("matchesAtThreshold", () => {
  const set = (...tokens) => new Set(tokens);
  it("includes exactly 0.8", () => {
    // 4 shared of 5 in the union: 5 * 4 >= 4 * 5
    expect(matchesAtThreshold(set("a", "b", "c", "d"), set("a", "b", "c", "d", "e"))).toBe(true);
  });
  it("excludes just under 0.8", () => {
    // 4 shared of 6 in the union: 20 < 24
    expect(matchesAtThreshold(set("a", "b", "c", "d"), set("a", "b", "c", "d", "e", "f"))).toBe(false);
  });
  it("matches identical sets and never matches an empty set", () => {
    expect(matchesAtThreshold(set("a"), set("a"))).toBe(true);
    expect(matchesAtThreshold(set(), set())).toBe(false);
    expect(matchesAtThreshold(set(), set("a"))).toBe(false);
  });
});

describe("committed list", () => {
  it("equals the recomputed list", () => {
    const committed = readFileSync(OVERLAP_PATH, "utf8");
    const computed = computeOverlap();
    if (committed !== serialize(computed)) {
      const differences = overlapDifferences(JSON.parse(committed), computed).join("; ") || "rule or layout differs";
      throw new Error(`eval/routing-qa-overlap.json is stale (${differences}); regenerate with: ${REGENERATE_COMMAND}`);
    }
  });

  it("carries no timestamp, so the whole file can be compared", () => {
    expect(JSON.parse(readFileSync(OVERLAP_PATH, "utf8"))).not.toHaveProperty("generatedAt");
  });
});

describe("confirmationOnlyFor", () => {
  const ids = JSON.parse(readFileSync(OVERLAP_PATH, "utf8")).sets.legacy.ids;

  it("answers by set and id", () => {
    const isListed = confirmationOnlyFor("legacy", ids);
    expect(isListed(ids[0])).toBe(true);
    expect(isListed("not-a-routing-id")).toBe(false);
  });

  it("throws on an unknown set and on a listed id the set no longer holds", () => {
    expect(() => confirmationOnlyFor("no-such-set", ids)).toThrow(/no set "no-such-set"/);
    expect(() => confirmationOnlyFor("legacy", ids.slice(1))).toThrow(new RegExp(REGENERATE_COMMAND));
  });

  it("tags listed rows and prints the label in place of the outcome", () => {
    const rows = tagRows([{ id: ids[0] }, { id: "other" }], confirmationOnlyFor("legacy", ids));
    expect(rows[0].confirmationOnly).toBe(true);
    expect(rows[1].confirmationOnly).toBeUndefined();
    expect(consoleValue(rows[0], 3)).toBe("confirmation-only");
    expect(consoleValue(rows[1], 3)).toBe(3);
  });
});
