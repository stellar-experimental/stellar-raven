import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadManifest, type Catalog } from "../src/catalog/search.ts";
import { ARGUMENT_ALIASES, applyArgumentAliases } from "../src/policy/argument-aliases.ts";
import { guard } from "../src/policy/guard.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog: Catalog = loadManifest(JSON.parse(readFileSync(join(ROOT, "catalog/manifest.json"), "utf8")));
const entry = (id: string) => {
  const found = catalog.entries.find((e) => e.id === id);
  if (!found) throw new Error(`missing ${id}`);
  return found;
};

describe("documented argument aliases", () => {
  it("every alias names a manifest operation with the scalar and the array parameter", () => {
    for (const [id, aliases] of Object.entries(ARGUMENT_ALIASES)) {
      const schema = entry(id).inputSchema as { properties?: Record<string, { type?: string; items?: { enum?: unknown[] }; enum?: unknown[] }> };
      for (const alias of aliases) {
        expect(schema.properties?.[alias.from], `${id}.${alias.from}`).toBeDefined();
        expect(schema.properties?.[alias.to]?.type, `${id}.${alias.to}`).toBe("array");
        // The array accepts the same values the scalar does, so a split scalar validates.
        expect(schema.properties?.[alias.to]?.items?.enum).toEqual(schema.properties?.[alias.from]?.enum);
      }
    }
  });

  it("splits a comma-joined source into sources and passes validation", () => {
    const out = applyArgumentAliases(entry("scout.searchResearch"), { q: "base reserve", source: "cap, sep", perSource: 2 });
    expect(out).toEqual({ q: "base reserve", sources: ["cap", "sep"], perSource: 2 });
    expect(guard(entry("scout.searchResearch"), out)).toBeNull();
  });

  it("leaves a single source, an explicit sources array, and other operations alone", () => {
    const single = { q: "base reserve", source: "cap" };
    expect(applyArgumentAliases(entry("scout.searchResearch"), single)).toBe(single);
    const both = { q: "base reserve", source: "cap,sep", sources: ["dev-docs"] };
    expect(applyArgumentAliases(entry("scout.searchResearch"), both)).toBe(both);
    expect(guard(entry("scout.searchResearch"), both)).not.toBeNull();
    const other = { query: "a,b" };
    expect(applyArgumentAliases(entry("lumenloop.search_directory"), other)).toBe(other);
    expect(applyArgumentAliases(entry("scout.searchResearch"), undefined)).toBeUndefined();
  });

  it("still rejects the comma form without the alias", () => {
    expect(guard(entry("scout.searchResearch"), { q: "base reserve", source: "cap,sep" })).not.toBeNull();
  });

  it.each([
    ["cap", ["cap"]],
    ["cap,sep,dev-docs", ["cap", "sep", "dev-docs"]],
    [" , cap , , sep, ", ["cap", "sep"]]
  ])("splits documented sources %s before validation", (sources, expected) => {
    const args = { q: "base reserve", sources };
    const out = applyArgumentAliases(entry("scout.searchResearch"), args);
    expect(out).toEqual({ q: "base reserve", sources: expected });
    expect(args.sources).toBe(sources);
    expect(guard(entry("scout.searchResearch"), out)).toBeNull();
  });

  it("keeps unknown array values subject to the guard", () => {
    const out = applyArgumentAliases(entry("scout.searchResearch"), { q: "base reserve", sources: "cap,unknown" });
    expect(out).toEqual({ q: "base reserve", sources: ["cap", "unknown"] });
    expect(guard(entry("scout.searchResearch"), out)).toMatchObject({
      ok: false, error: { details: [{ path: "sources[1]" }] }
    });
  });

  it("uses declared array types and comma forms across operations", () => {
    expect(applyArgumentAliases(entry("scout.compareHackathons"), { slugs: "a, b" }))
      .toEqual({ slugs: ["a", "b"] });
    expect(applyArgumentAliases(entry("scout.getLeaderboard"), { type: "DEX,Lending" }))
      .toEqual({ type: ["DEX", "Lending"] });
    const undocumented = { sources: "a,b" };
    expect(applyArgumentAliases(entry("lumenloop.search_content_semantic"), undocumented)).toBe(undocumented);
    expect(guard(entry("lumenloop.search_content_semantic"), undocumented)).not.toBeNull();
  });
});

describe("documented argument aliases reach the wire", () => {
  it("sends the split sources array as the upstream comma-joined query parameter", async () => {
    const { buildOpsFns } = await import("../src/executor/providers.ts");
    const urls: string[] = [];
    const fetchImpl: typeof fetch = async (input) => {
      urls.push(String(input instanceof Request ? input.url : input));
      return new Response(JSON.stringify({ meta: { counts: { returned: 0 } }, results: [] }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    };
    const ops = buildOpsFns(catalog, {}, { fetchImpl });
    const searchResearch = ops.scout?.searchResearch;
    if (!searchResearch) throw new Error("scout.searchResearch closure missing");
    const result = await searchResearch({ q: "base reserve", source: "cap,sep", perSource: 2 });
    expect(result.ok).toBe(true);
    expect(urls).toHaveLength(1);
    const url = new URL(urls[0] ?? "");
    expect(url.searchParams.get("sources")).toBe("cap,sep");
    expect(url.searchParams.get("source")).toBeNull();
    expect(url.searchParams.get("perSource")).toBe("2");
  });
});
