/**
 * src/site.ts must not validate the catalog manifest at module scope.
 *
 * Every request the auth handler serves — /authorize, /callback, /health, the
 * static pages — imports src/site.ts. A module-scope `getCatalog()` call made
 * every isolate init pay for validating catalog/manifest.json (~700 KB) even
 * when the response never renders a count. These tests pin the counts to a
 * memoized accessor: nothing on import, one catalog read on first use, cached
 * for the isolate afterwards.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

const catalogReads = vi.fn();

vi.mock("../src/catalog/load", async () => {
  const actual =
    await vi.importActual<typeof import("../src/catalog/load")>("../src/catalog/load");
  return {
    ...actual,
    getCatalog: () => {
      catalogReads();
      return actual.getCatalog();
    }
  };
});

describe("docs catalog counts are lazy", () => {
  beforeEach(() => {
    vi.resetModules();
    catalogReads.mockClear();
  });

  it("reads no catalog while importing src/site", async () => {
    await import("../src/site");

    expect(catalogReads).not.toHaveBeenCalled();
  });

  it("reads the catalog once on first count use, then serves the cache", async () => {
    const { getDocCatalogCounts } = await import("../src/site");
    expect(catalogReads).not.toHaveBeenCalled();

    const first = getDocCatalogCounts();
    expect(catalogReads).toHaveBeenCalledTimes(1);

    const second = getDocCatalogCounts();
    expect(catalogReads).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });

  it("keeps the counts shape the pages read", async () => {
    const { getDocCatalogCounts } = await import("../src/site");
    const counts = getDocCatalogCounts();

    expect(Object.keys(counts).sort()).toEqual(["operations", "sections", "skills"]);
    for (const value of Object.values(counts)) {
      expect(Number.isInteger(value)).toBe(true);
      expect(value).toBeGreaterThan(0);
    }
  });

  it("renders the pages without reading the catalog more than once", async () => {
    const { docsPage, landingPage } = await import("../src/site");
    expect(catalogReads).not.toHaveBeenCalled();

    docsPage();
    landingPage();
    docsPage();

    expect(catalogReads).toHaveBeenCalledTimes(1);
  });
});
