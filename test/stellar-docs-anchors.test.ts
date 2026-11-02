import { describe, expect, it } from "vitest";
import anchorIndex from "../src/adapters/stellar-docs-anchors.json";
import pairs from "./fixtures/stellar-docs-anchors.json";
import { sectionAnchor } from "../src/adapters/stellar-docs.ts";

const pages = anchorIndex.pages as Record<string, Record<string, string[]>>;

describe("Stellar Docs section anchors", () => {
  it("pins every captured heading and ID against the generated index", () => {
    expect(new Set(pairs.map((pair) => pair.url)).size).toBeGreaterThanOrEqual(8);
    expect(pairs.some((pair) => pair.hasCodeSpan)).toBe(true);
    expect(pairs.some((pair) => /[^\x00-\x7f]/.test(pair.heading))).toBe(true);
    expect(pairs.some((pair) => /\d/.test(pair.heading))).toBe(true);
    let ambiguous = 0;
    for (const pair of pairs) {
      const path = new URL(pair.url).pathname;
      const ids = pages[path]?.[pair.heading.replace(/\u200b/g, "").trim()];
      expect(ids, `${pair.url}: ${pair.heading}`).toContain(pair.anchor);
      if (ids!.length > 1) ambiguous += 1;
      expect(sectionAnchor(path, pair.heading), `${pair.url}: ${pair.heading}`).toBe(ids!.length === 1 ? pair.anchor : undefined);
    }
    expect(ambiguous).toBeGreaterThan(0);
  });

  it("resolves inline code and custom IDs without deriving a false slug", () => {
    const path = "/docs/learn/fundamentals/contract-development/authorization";
    expect(sectionAnchor(path, "When to `require_auth`")).toBe("when-to-require_auth");
    expect(sectionAnchor(path, "Authorizing Multiple `Address`es")).toBe("authorizing-multiple-addresses");
    expect(sectionAnchor("/docs/learn/glossary", "Application (app)")).toBe("app");
    expect(sectionAnchor("/docs/learn/glossary", "Stellar.toml")).toBe("stellar-toml");
  });

  // Transcribed source headings and DOM IDs from the independent live review, 2026-11-02.
  it.each([
    ["/docs/tools/cli/agent-cli/reference/architecture", "Composition & Piping", "composition-&-piping"],
    ["/docs/build/guides/auth/contract-authorization", "`__check_auth()`", "__check_auth"],
    ["/docs/tools/cli/agent-cli/reference/output-and-errors", "Telling `#13` from `#6`", "telling-#13-from-#6"]
  ])("resolves the transcribed source heading at %s: %s", (path, heading, anchor) => {
    expect(sectionAnchor(path, heading)).toBe(anchor);
  });

  it("omits anchors for unknown pages, unknown headings, and ambiguous headings", () => {
    expect(sectionAnchor("/docs/missing", "Overview")).toBeUndefined();
    expect(sectionAnchor("/docs/learn/glossary", "A newly added heading")).toBeUndefined();
    expect(sectionAnchor("/docs/networks/software-versions", "Software")).toBeUndefined();
    expect(sectionAnchor("/docs/learn/glossary", "__proto__")).toBeUndefined();
    expect(sectionAnchor("toString", "Overview")).toBeUndefined();
  });
});
