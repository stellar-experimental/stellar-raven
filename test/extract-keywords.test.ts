/**
 * extractKeywords tests for the build-time section-body distiller
 * behind the manifest's optional `keywords` field. Deterministic, stopword-
 * filtered, deduped against already-scored text, capped. (How the scorer
 * BLENDS the distilled fields is pinned in test/scoring.test.ts.)
 */
import { describe, expect, it } from "vitest";
import { extractKeywords, DEFAULT_KEYWORD_CAP } from "../src/catalog/extract-keywords.ts";

describe("extractKeywords", () => {
  it("is deterministic — same inputs, same array (order included)", () => {
    const body = [
      "Run `stellar contract deploy --wasm target/out.wasm` on testnet.",
      "If deploy fails with error 402, retry after funding via friendbot.",
      "Deploy again once funded; friendbot grants testnet lumens."
    ].join("\n");
    const a = extractKeywords(body, { exclude: ["Deploying — how to ship"] });
    const b = extractKeywords(body, { exclude: ["Deploying — how to ship"] });
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThan(0);
  });

  it("filters stopwords and single-character splitter shrapnel", () => {
    const kw = extractKeywords("the a of and I x it's how to retry the 402 error");
    expect(kw).toContain("retry");
    expect(kw).toContain("402");
    expect(kw).toContain("error");
    for (const stop of ["the", "a", "of", "and", "how", "to", "it", "its", "s", "i", "x"]) {
      expect(kw, `stopword/1-char leaked: ${stop}`).not.toContain(stop);
    }
  });

  it("dedupes against tokens already visible to the scorer (exclude texts)", () => {
    const body = "Billing errors: HTTP 402 means budget exhausted; retry after topping up.";
    const kw = extractKeywords(body, {
      exclude: ["skills.lumenloop-api.lumenloop-api-billing#recover", "Billing — budget errors"]
    });
    // Tokens from the id/description never re-enter via keywords…
    for (const dup of ["billing", "budget", "errors", "lumenloop", "api", "recover", "skills"]) {
      expect(kw, `already-scored token leaked: ${dup}`).not.toContain(dup);
    }
    // …but genuinely new body vocabulary does.
    expect(kw).toEqual(expect.arrayContaining(["http", "402", "exhausted", "retry", "topping"]));
  });

  it("respects the cap, keeping most-frequent terms first (first occurrence breaks ties)", () => {
    const body = "delta delta delta alpha alpha zulu yankee xray whiskey victor";
    const kw = extractKeywords(body, { cap: 3 });
    // freq: delta 3, alpha 2, then four freq-1 terms — first occurrence wins.
    expect(kw).toEqual(["delta", "alpha", "zulu"]);
    expect(extractKeywords(body).length).toBeLessThanOrEqual(DEFAULT_KEYWORD_CAP);
    expect(extractKeywords(body, { cap: 0 })).toEqual([]);
  });

  it("mirrors the vendor tokenizer: lowercase, camelCase and punctuation splits", () => {
    const kw = extractKeywords("call requireAuth() then emitEvent(topic, data)");
    expect(kw).toEqual(expect.arrayContaining(["require", "auth", "emit", "event", "topic"]));
    for (const t of kw) expect(t).toBe(t.toLowerCase());
  });
});
