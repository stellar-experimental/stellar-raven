import { describe, expect, it } from "vitest";
import {
  docsPathFromLlmsUrl,
  normalizeScoutStatus,
  normalizeTitles,
  parseLlmsIndex,
  parseServiceArg
} from "../scripts/refresh-inventory.mjs";

describe("refresh-inventory service selection", () => {
  it("defaults to all and accepts the three isolated refresh lanes", () => {
    expect(parseServiceArg([])).toBe("all");
    expect(parseServiceArg(["--service", "lumenloop"])).toBe("lumenloop");
    expect(parseServiceArg(["--service", "stellar-light"])).toBe("stellar-light");
    expect(parseServiceArg(["--service", "stellar-docs"])).toBe("stellar-docs");
  });

  it("rejects unknown or malformed selectors before reading service credentials", () => {
    expect(() => parseServiceArg(["--service", "nope"])).toThrow(/unknown service/);
    expect(() => parseServiceArg(["stellar-light"])).toThrow(/usage/);
  });
});

describe("Scout status volatility normalization", () => {
  it("strips request telemetry and corpus churn from both observed field names", () => {
    const normalized = normalizeScoutStatus({
      generatedAt: "volatile",
      usage: { requests: 42 },
      version: "1.8.28",
      sources: [{ name: "projects", count: 100, lastUpdatedAt: "today", notes: "volatile" }],
      dataSources: [{ name: "repos", count: 200, lastUpdatedAt: "today", notes: "volatile" }]
    });
    expect(normalized).toEqual({
      version: "1.8.28",
      sources: [{ name: "projects" }],
      dataSources: [{ name: "repos" }]
    });
  });
});

describe("Stellar Docs llms.txt page index", () => {
  it("maps page links to catalog paths", () => {
    expect(docsPathFromLlmsUrl("https://developers.stellar.org/docs/build/index.md")).toBe("/docs/build");
    expect(docsPathFromLlmsUrl("https://developers.stellar.org/docs/learn/glossary.md")).toBe("/docs/learn/glossary");
    expect(docsPathFromLlmsUrl("https://developers.stellar.org/index.md")).toBe("/");
    expect(docsPathFromLlmsUrl("https://stellar.org/blog")).toBeNull();
  });

  it("separates pages from nested indexes and ignores inline and external links", () => {
    const text = [
      "# Stellar Developer Docs",
      "- [Build (193 pages)](https://developers.stellar.org/_llms/build.txt): Documentation for Build.",
      "- [Glossary](https://developers.stellar.org/docs/learn/glossary.md): See [assets](https://developers.stellar.org/docs/learn/assets).",
      "- [Core Concepts](https://developers.stellar.org/docs/learn/fundamentals/index.md): Basics.",
      "- [2026-10-08](https://developers.stellar.org/meetings/2026/10/08.md)",
      "- [Blog](https://stellar.org/blog)",
      "Text with [a link](https://developers.stellar.org/docs/other.md)."
    ].join("\n");
    expect(parseLlmsIndex(text)).toEqual({
      indexes: ["https://developers.stellar.org/_llms/build.txt"],
      pages: [
        { path: "/docs/learn/glossary", title: "Glossary" },
        { path: "/docs/learn/fundamentals", title: "Core Concepts" },
        { path: "/meetings/2026/10/08", title: "2026-10-08" }
      ]
    });
  });

  it("dedupes path/title pairs and sorts by path", () => {
    expect(normalizeTitles([
      { path: "/docs/b", title: "B" },
      { path: "/docs/a", title: "A" },
      { path: "/docs/b", title: "B" }
    ])).toEqual([{ path: "/docs/a", title: "A" }, { path: "/docs/b", title: "B" }]);
  });
});
