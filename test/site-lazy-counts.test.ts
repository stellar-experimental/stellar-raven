/**
 * Pins lazy catalog count loading in src/site.ts: auth/health routes import src/site.ts,
 * so catalog/manifest.json must be validated only on first count access and memoized per isolate.
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
