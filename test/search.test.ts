/**
 * searchCatalog tests — the FROZEN contract (scratchpad 514): ranked hits,
 * excluded-op absence, kind/service filters, default limit 10, TS signatures on
 * operation hits. Runs against the real generated manifest.
 */
import { describe, expect, it, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadManifest,
  searchCatalog,
  searchCatalogPage,
  recoveryCandidates,
  renderSignature,
  COMPACT_OUTPUT_THRESHOLD,
  DEFAULT_SEARCH_LIMIT,
  TIER_INTERLEAVE_MARGIN,
  type Catalog,
  type CatalogEntry,
  type SearchHit
} from "../src/catalog/search.ts";
import {
  jsonSchemaToType,
  toPascalCase,
  sanitizeToolName,
  type JsonSchema
} from "../src/catalog/vendor/json-schema-types.ts";
import { readSkill } from "../src/skills/store.ts";
import { lazyPinnedSkillSource as skillSource } from "./helpers/skill-source.ts";
import { RUNNERS } from "../src/skills/runners/index.ts";
import { scoreEntryWeighted, canonicalizeQuery } from "../src/catalog/scoring.ts";
import { lastIdSegment } from "../src/catalog/id.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

let catalog: Catalog;

beforeAll(() => {
  catalog = loadManifest(JSON.parse(readFileSync(join(ROOT, "catalog", "manifest.json"), "utf8")));
});

describe("searchCatalog — contract shape", () => {
  it("returns SearchHit-shaped hits, ranked by score desc then id asc", () => {
    const hits = searchCatalog(catalog, { query: "search directory" });
    expect(hits.length).toBeGreaterThan(0);
    for (const hit of hits) {
      expect(typeof hit.id).toBe("string");
      expect(typeof hit.service).toBe("string");
      expect(["operation", "skill"]).toContain(hit.kind);
      expect(typeof hit.score).toBe("number");
      expect(typeof hit.description).toBe("string");
      if (hit.signature !== undefined) expect(typeof hit.signature).toBe("string");
    }
    for (let i = 1; i < hits.length; i++) {
      const prev = hits[i - 1] as SearchHit;
      const cur = hits[i] as SearchHit;
      expect(prev.score >= cur.score).toBe(true);
      if (prev.score === cur.score) expect(prev.id < cur.id).toBe(true);
    }
  });

  it("boosts an exact id match to the top", () => {
    const hits = searchCatalog(catalog, { query: "lumenloop.search_directory" });
    expect(hits[0]?.id).toBe("lumenloop.search_directory");
  });

  it("defaults to limit 10 and honors an explicit limit", () => {
    // A broad query that matches far more than 10 entries.
    const defaulted = searchCatalog(catalog, { query: "stellar" });
    expect(defaulted).toHaveLength(DEFAULT_SEARCH_LIMIT);
    expect(searchCatalog(catalog, { query: "stellar", limit: 3 })).toHaveLength(3);
    expect(searchCatalog(catalog, { query: "stellar", limit: 25 })).toHaveLength(25);
  });

  it("applies kind and service filters", () => {
    const opsOnly = searchCatalog(catalog, { query: "stellar projects", kind: "operation" });
    expect(opsOnly.length).toBeGreaterThan(0);
    expect(opsOnly.every((h) => h.kind === "operation")).toBe(true);

    const scoutOnly = searchCatalog(catalog, { query: "stellar projects", service: "scout" });
    expect(scoutOnly.length).toBeGreaterThan(0);
    expect(scoutOnly.every((h) => h.service === "scout")).toBe(true);
  });

  it("returns [] for queries with no lexical overlap", () => {
    // Both tokens must be true non-matches (no vendor token/prefix/substring
    // hit anywhere in the catalog): since the M1 tiered backfill, a single
    // matched token — even a prefix overlap like "nonexistent" ~ "no" or a
    // single-letter catalog token like "x"/"q" — legitimately surfaces weak
    // hits on an otherwise-empty page.
    expect(searchCatalog(catalog, { query: "zzzzqqqq zzqqzzqq" })).toEqual([]);
    expect(searchCatalog(catalog, { query: "   " })).toEqual([]);
  });

  it("is pure — does not mutate the catalog", () => {
    const before = JSON.stringify(catalog);
    searchCatalog(catalog, { query: "soroban storage" });
    expect(JSON.stringify(catalog)).toBe(before);
  });
});

describe("recoveryCandidates — advisory contingency graph", () => {
  it("keeps recovery separate from ranked hits and filters by reason", () => {
    const before = searchCatalogPage(catalog, { query: "builder directory", limit: 5 });
    const recovery = recoveryCandidates(catalog, ["scout.getBuilders"], "empty");
    const after = searchCatalogPage(catalog, { query: "builder directory", limit: 5 });

    expect(after).toEqual(before);
    expect(recovery.map((candidate) => candidate.id)).toEqual([
      "lumenloop.search_content_semantic",
      "scout.searchResearch"
    ]);
    expect(recovery.every((candidate) => candidate.from === "scout.getBuilders")).toBe(true);
    expect(recovery[0]?.outputKeys).toEqual(["counts", "items", "meta"]);
    expect(recovery[0]?.outputItemKeys?.items).toContain("dateField");
    expect(recovery.map((candidate) => candidate.id)).not.toContain("scout.getBuilders");
  });

  it("deduplicates targets, excludes attempted ids, and observes its bound", () => {
    const recovery = recoveryCandidates(
      catalog,
      ["scout.getBuilders", "lumenloop.find_content_by_entity"],
      "weak",
      2
    );
    expect(recovery).toHaveLength(2);
    expect(new Set(recovery.map((candidate) => candidate.id)).size).toBe(2);
    expect(recovery.map((candidate) => candidate.id)).not.toContain("scout.getBuilders");
    expect(recovery.map((candidate) => candidate.id)).not.toContain("lumenloop.find_content_by_entity");
  });

  it("returns no candidates for zero or negative bounds", () => {
    expect(recoveryCandidates(catalog, ["scout.getBuilders"], "empty", 0)).toEqual([]);
    expect(recoveryCandidates(catalog, ["scout.getBuilders"], "empty", -1)).toEqual([]);
  });
});

describe("searchCatalogPage — structural wider candidates", () => {
  it("uses canonical Lumenloop lanes for the production-shaped Tomer Weller query", () => {
    const page = searchCatalogPage(catalog, {
      query: "Tomer Weller",
      kind: "operation",
      service: "lumenloop",
      limit: 5
    });
    expect(page.hits.every((hit) => hit.tier === "backfill")).toBe(true);
    expect(page.widerCandidates.map(({ id, basis }) => ({ id, basis }))).toEqual([
      { id: "lumenloop.find_av_passages", basis: "page-broad-hit" },
      { id: "lumenloop.search_content_semantic", basis: "catalog-anchor" }
    ]);
    expect(page.widerCandidates.map((candidate) => candidate.id)).not.toContain(
      "lumenloop.find_content_about_project"
    );
    expect(page.widerCandidates.map((candidate) => candidate.id)).not.toContain(
      "lumenloop.find_similar_scf_submissions"
    );
  });

  it("never recommends entries with a same-lane broader-semantic edge", () => {
    const byId = new Map(catalog.entries.map((entry) => [entry.id, entry]));
    const pages = [
      searchCatalogPage(catalog, {
        query: "Tomer Weller",
        kind: "operation",
        service: "lumenloop",
        limit: 5
      }),
      searchCatalogPage(catalog, {
        query: "zzzzqqqq zzqqzzqq",
        kind: "operation"
      })
    ];

    for (const page of pages) {
      expect(page.hits.length === 0 || page.hits.every((hit) => hit.tier === "backfill")).toBe(true);
      expect(page.widerCandidates.length).toBeGreaterThan(0);
      for (const candidate of page.widerCandidates) {
        const profile = byId.get(candidate.id)?.retrievalProfile;
        expect(profile?.recoverWith.some((edge) => {
          const target = byId.get(edge.id);
          return edge.relation === "broader-semantic" &&
            target?.kind === "operation" &&
            target.retrievalProfile?.lane === profile.lane;
        }), candidate.id).toBe(false);
      }
    }
  });

  it("recommends semantic and research anchors for exact low-evidence person questions", () => {
    for (const query of ["Who is Tyler van der Hoeven?", "Who is Danel Jed McCaleb?"]) {
      const page = searchCatalogPage(catalog, { query, limit: 5 });
      expect(page.hits.every((hit) => hit.tier === "backfill"), query).toBe(true);
      expect(page.widerCandidates.map((candidate) => candidate.id), query).toEqual([
        "scout.searchResearch",
        "lumenloop.search_content_semantic",
        "stellarDocs.search_docs"
      ]);
    }
  });

  it("routes a current SDF person query to the structured people directory", () => {
    const page = searchCatalogPage(catalog, {
      query: "justin rice history",
      kind: "operation",
      limit: 10
    });
    expect(page.hits[0]).toMatchObject({ id: "scout.getPeople", tier: "gated" });
    expect(page.widerCandidates).toEqual([]);
  });

  it("uses deterministic manifest anchors for a zero-hit operation page", () => {
    const page = searchCatalogPage(catalog, {
      query: "zzzzqqqq zzqqzzqq",
      kind: "operation"
    });
    expect(page.hits).toEqual([]);
    expect(page.widerCandidates.map((candidate) => candidate.id)).toEqual([
      "scout.searchResearch",
      "lumenloop.search_content_semantic",
      "stellarDocs.search_docs"
    ]);
    expect(new Set(page.widerCandidates.map((candidate) => candidate.lane)).size).toBe(
      page.widerCandidates.length
    );
  });

  it("keeps long technical all-backfill advice broad-only and ranking untouched", () => {
    const query =
      "design a cross chain remittance corridor that quotes fees checks anchor deposit " +
      "limits verifies trustline flags and streams payment status webhooks to a dashboard";
    const page = searchCatalogPage(catalog, { query, kind: "operation", limit: 10 });
    const frozenHits = searchCatalog(catalog, { query, kind: "operation", limit: 10 });
    expect(page.hits).toEqual(frozenHits);
    expect(page.hits.every((hit) => hit.tier === "backfill")).toBe(true);
    // Canonical broad recovery applies to every structurally poor page: a
    // slug-scoped semantic page hit yields its lane to the catalog anchor.
    expect(page.widerCandidates.map(({ id, basis }) => ({ id, basis }))).toEqual([
      { id: "stellarDocs.search_anchor_sep_docs", basis: "page-broad-hit" },
      { id: "scout.searchResearch", basis: "catalog-anchor" },
      { id: "lumenloop.search_content_semantic", basis: "catalog-anchor" }
    ]);
  });

  it("stays silent for gated, mixed, and skill-only pages and honors service filters", () => {
    expect(
      searchCatalogPage(catalog, {
        query: "stellar soroban contract",
        kind: "operation",
        limit: 10
      }).widerCandidates
    ).toEqual([]);
    expect(
      searchCatalogPage(catalog, {
        query:
          "In a SEP-6 programmatic deposit, which SEP actually carries the customer's KYC data — SEP-6 itself or another SEP?",
        kind: "operation",
        limit: 5
      }).widerCandidates
    ).toEqual([]);
    expect(
      searchCatalogPage(catalog, {
        query: "zzzzqqqq zzqqzzqq",
        kind: "skill"
      }).widerCandidates
    ).toEqual([]);
    const lumenloopOnly = searchCatalogPage(catalog, {
      query: "zzzzqqqq zzqqzzqq",
      kind: "operation",
      service: "lumenloop"
    }).widerCandidates;
    expect(lumenloopOnly.length).toBeGreaterThan(0);
    expect(lumenloopOnly.every((candidate) => candidate.service === "lumenloop")).toBe(true);
    expect(lumenloopOnly.length).toBeLessThanOrEqual(3);
  });

  it("returns only current exposed operations", () => {
    const exposed = new Set(
      catalog.entries.filter((entry) => entry.kind === "operation").map((entry) => entry.id)
    );
    const candidates = searchCatalogPage(catalog, {
      query: "zzzzqqqq zzqqzzqq",
      kind: "operation"
    }).widerCandidates;
    expect(candidates.every((candidate) => exposed.has(candidate.id))).toBe(true);
  });
});

describe("loadManifest — structural invariants (F6)", () => {
  function rawManifest(): { entries: Record<string, unknown>[] } {
    return JSON.parse(readFileSync(join(ROOT, "catalog", "manifest.json"), "utf8"));
  }

  it("loads the real generated manifest without complaint", () => {
    expect(() => loadManifest(rawManifest())).not.toThrow();
  });

  it("rejects a duplicate entry id", () => {
    const raw = rawManifest();
    const dup = { ...raw, entries: [...raw.entries, raw.entries[0]] };
    expect(() => loadManifest(dup)).toThrow(/duplicate catalog id/);
  });

  it("rejects two operations in a service colliding on their terminal name (would shadow a sandbox fn)", () => {
    const raw = rawManifest();
    const op = raw.entries.find((e) => (e as { kind: string }).kind === "operation") as {
      id: string;
      service: string;
    };
    const terminal = op.id.split(".").pop();
    // Same service + same terminal segment, but a distinct id → the two map to
    // the same sandbox function name in providers.ts.
    const collide = { ...op, id: `${op.service}.extra.${terminal}` };
    expect(() => loadManifest({ ...raw, entries: [...raw.entries, collide] })).toThrow(/collision/);
  });
});

describe("searchCatalog — excluded ops are absent by construction (ADR-0003)", () => {
  it("never surfaces build-excluded ops, even on exact id queries", () => {
    // These are excluded at build time (paid, write, side-effecting) and have
    // no manifest entry — search cannot surface what does not exist.
    for (const query of [
      "request research",
      "lumenloop.request_research",
      "submit feedback",
      "scout.submitFeedback",
      "submit partner listing",
      "scout.submitPartnerListing",
      "partner assistant chat",
      "scout.partnerAssistant",
      "get listed as a partner"
    ]) {
      const ids = searchCatalog(catalog, { query, limit: 50 }).map((h) => h.id);
      expect(ids, `query: ${query}`).not.toContain("lumenloop.request_research");
      expect(ids, `query: ${query}`).not.toContain("scout.submitFeedback");
      expect(ids, `query: ${query}`).not.toContain("scout.submitPartnerListing");
      expect(ids, `query: ${query}`).not.toContain("scout.partnerAssistant");
    }
    // The side-effect-free partner ops remain reachable.
    const match = searchCatalog(catalog, { query: "scout.matchPartners", limit: 50 });
    expect(match.map((h) => h.id)).toContain("scout.matchPartners");
  });
});

describe("searchCatalog — routing quality", () => {
  it("never surfaces skill-section hits — sections left search (2026-07-13 A/B)", () => {
    // Sections are exposed (skill.read, availableSections) but carry
    // searchable:false since arm B shipped; a WHOLE skill may still rank.
    for (const query of ["soroban storage", "when to use this skill", "worked example digest"]) {
      const hits = searchCatalog(catalog, { query, limit: 10 });
      expect(hits.some((h) => h.kind === "skill-section"), query).toBe(false);
    }
    const hits = searchCatalog(catalog, { query: "soroban storage" });
    expect(hits.length).toBeGreaterThan(0);
  });

  it("routes \"soroban defi projects\" to project-search operations", () => {
    const hits = searchCatalog(catalog, { query: "soroban defi projects", limit: 15 });
    expect(hits[0]?.id).toBe("scout.searchProjects");
    // Purely lexical scorer: search_directory has no "defi"/"soroban" text,
    // so it ranks on "projects" alone — present, but further down.
    expect(hits.map((h) => h.id)).toContain("lumenloop.search_directory");
  });

  it("surfaces the partner directory for regional asset issuer and service-provider queries", () => {
    for (const query of [
      "LatAm asset issuers services",
      "stablecoin service providers Latin America",
      "RWA provider partners Africa",
      "regional on off ramp integration providers"
    ]) {
      const hits = searchCatalog(catalog, { query, kind: "operation", limit: 6 });
      expect(hits.map((h) => h.id), query).toContain("scout.getPartners");
    }
  });

  it("finds the docs search operation", () => {
    const hits = searchCatalog(catalog, { query: "stellar docs search" });
    expect(hits.map((h) => h.id)).toContain("stellarDocs.search_docs");
  });

  it("routes a topical docs question to a stellarDocs op in the top 3 (structural)", () => {
    // Mechanism check (not a golden-corpus case): the 12 authored docs ops
    // carry topical vocabulary, so a docs-shaped natural-language question
    // must surface stellarDocs near the top despite 300+ competing entries.
    const hits = searchCatalog(catalog, { query: "how do I extend TTL state archival", limit: 5 });
    expect(hits.slice(0, 3).some((h) => h.service === "stellarDocs")).toBe(true);
  });

  it("diversifies services in the returned set (per-service quota)", () => {
    // Broad query matching many entries: the top-5 page must not be a single
    // service five times over (quota = 2 per service at limit 5), and the
    // top-scoring hit is never displaced by the quota.
    const all = searchCatalog(catalog, { query: "stellar soroban contract", limit: 5 });
    const perService = new Map<string, number>();
    for (const h of all) perService.set(h.service, (perService.get(h.service) ?? 0) + 1);
    for (const [service, n] of perService) {
      expect(n, `service ${service} exceeds quota`).toBeLessThanOrEqual(2);
    }
  });
});

describe("searchCatalog — tiered gate-rescue backfill (round 4, M1)", () => {
  /**
   * Gated (tier-1) score of a returned hit, recomputed through the same
   * public scorer searchCatalog uses for tier 1. null ⇒ the hit could only
   * have arrived via the tier-2 (ungated) backfill.
   */
  function gatedScore(hitId: string, query: string): number | null {
    const entry = catalog.entries.find((e) => e.id === hitId)!;
    expect(entry).toBeDefined();
    return scoreEntryWeighted(
      {
        id: entry.id,
        name: lastIdSegment(entry.id),
        service: entry.service,
        kind: entry.kind,
        description: entry.description,
        keywords: entry.keywords,
        routingKeywords: entry.routingKeywords
      },
      query
    );
  }

  it("a full tier-1 page is untouched — every hit passes the gated scorer with its tier-1 score", () => {
    // Tier 2 only fires when fewer than `limit` gate-passing candidates
    // exist; a page of all-gate-passers therefore proves the backfill never
    // ran and the results are identical to the pre-tiering pipeline.
    for (const query of ["stellar soroban contract", "search directory", "soroban storage"]) {
      const hits = searchCatalog(catalog, { query, limit: 5 });
      expect(hits, `query: ${query}`).toHaveLength(5);
      for (const hit of hits) {
        expect(gatedScore(hit.id, query), `query: ${query}, hit: ${hit.id}`).toBe(hit.score);
        expect(hit.tier, `query: ${query}, hit: ${hit.id}`).toBe("gated");
      }
      for (let i = 1; i < hits.length; i++) {
        expect(hits[i - 1]!.score >= hits[i]!.score).toBe(true);
      }
    }
  });

  it("backfills a long multi-clause query that the coverage gate zeroed out", () => {
    // >20 tokens of content words spanning services: no entry covers 60% of
    // the vocabulary, so the vendor gate nulls the ENTIRE catalog (measured:
    // 58/122 extended-lane questions). Tier 2 must fill the page.
    const query =
      "design a cross chain remittance corridor that quotes fees checks anchor deposit " +
      "limits verifies trustline flags and streams payment status webhooks to a dashboard";
    const hits = searchCatalog(catalog, { query, limit: 5 });
    expect(hits).toHaveLength(5);
    // Pure tier-2 page: nothing passes the gated scorer (this is exactly the
    // query shape that returned [] before the backfill existed).
    for (const hit of hits) {
      expect(gatedScore(hit.id, query)).toBeNull();
      expect(hit.tier).toBe("backfill");
    }
    // Within the tier, ranking stays score desc.
    for (let i = 1; i < hits.length; i++) {
      expect(hits[i - 1]!.score >= hits[i]!.score).toBe(true);
    }
  });

  it("interleaves a backfill hit when the cross-tier margin is met", () => {
    // Extended-corpus mechanism check: this question passes the gate for
    // only a handful of entries, so the page mixes tiers. The docs backfill
    // hit overwhelmingly dominates the first gated hit on the common score
    // scale and must therefore interleave above it. (The previous fixture
    // question stopped mixing tiers at the Scout 1.7.16 absorb — its gated
    // hits were scout ops whose fat descriptions no longer pass the gate.)
    const query =
      "In a SEP-6 programmatic deposit, which SEP actually carries the customer's KYC " +
      "data — SEP-6 itself or another SEP?";
    const hits = searchCatalog(catalog, { query, limit: 5 });
    expect(hits).toHaveLength(5);
    const tiers = hits.map((h) => gatedScore(h.id, query) !== null);
    expect(tiers[0], "top hit must be the dominant backfill").toBe(false);
    expect(tiers).toContain(false); // page actually mixes tiers
    // The tier marker (todo 838) must agree with the recomputed ground truth.
    for (let i = 0; i < hits.length; i++) {
      expect(hits[i]!.tier).toBe(tiers[i] ? "gated" : "backfill");
    }
    expect(hits[0]!.id).toBe("stellarDocs.search_anchor_sep_docs");
    expect(hits[1]!.tier).toBe("gated");
    expect(hits[0]!.score).toBeGreaterThanOrEqual(
      TIER_INTERLEAVE_MARGIN * hits[1]!.score
    );
    // The next backfill does not dominate the next gated hit and stays below
    // it: the threshold is applied pairwise, not as a global score sort.
    const nextBackfill = hits.findIndex((hit, index) => index > 0 && hit.tier === "backfill");
    expect(nextBackfill).toBeGreaterThan(1);
    expect(hits[nextBackfill]!.score).toBeLessThan(
      TIER_INTERLEAVE_MARGIN * hits[nextBackfill - 1]!.score
    );
  });
});

describe("searchCatalogPage — non-finite limit cannot disable the clamp", () => {
  // `codemode.search` inside the sandbox forwards any `typeof opts.limit ===
  // "number"`, and `typeof NaN === "number"`. Before the guard, a NaN limit
  // made every comparison false, so the page returned EVERY gated candidate
  // with `truncated: false` — the contract asserting a complete answer while
  // silently dropping its own bounds. Model-authored code reaches this by
  // ordinary arithmetic (`n * 2` over undefined, `+"ten"`, `0/0`).
  it("falls back to the default limit for NaN and infinities, and still honors real limits", () => {
    const query = "search directory";
    const baseline = searchCatalogPage(catalog, { query });

    for (const bad of [NaN, Infinity, -Infinity]) {
      const page = searchCatalogPage(catalog, { query, limit: bad });
      expect(page.hits.length, `limit ${bad} must clamp to the default`).toBe(baseline.hits.length);
      expect(page.truncated, `limit ${bad} must not claim a complete page`).toBe(baseline.truncated);
      expect(page.hits.length).toBeLessThanOrEqual(DEFAULT_SEARCH_LIMIT);
    }

    // Real values keep working — the guard must not swallow legitimate limits.
    expect(searchCatalogPage(catalog, { query, limit: 1 }).hits).toHaveLength(1);
    expect(searchCatalogPage(catalog, { query, limit: 3 }).hits).toHaveLength(3);
  });
});

describe("searchCatalogPage — tier marker + total/truncated (todos 838/840)", () => {
  /** Hand-built operation entry (passes loadManifest's structural invariants). */
  function op(name: string, description: string) {
    return {
      id: `lumenloop.${name}`,
      service: "lumenloop" as const,
      kind: "operation" as const,
      description,
      inputSchema: null,
      outputSchema: null,
      transport: null,
      provenance: { source: "test://hand-built", fetchedAt: "2026-01-01T00:00:00Z" }
    };
  }

  /**
   * A catalog engineered so a long query gates MOST entries out: on the
   * 10-content-token query below only alpha_handler covers ≥60% of the
   * vocabulary (7/10); every other entry matches 1–2 tokens, failing the
   * vendor coverage gate but scoring non-null ungated. Exact candidate
   * counts are therefore known, so total/truncated are checkable as math,
   * not just invariants.
   */
  const tiny = loadManifest({
    version: 1,
    generatedAt: "2026-01-01T00:00:00Z",
    entries: [
      op("alpha_handler", "alpha beta gamma delta epsilon zeta omega handler"),
      op("kappa_export", "kappa metrics exporter"),
      op("iota_relay", "iota queue relay"),
      op("theta_warm", "theta cache warmer"),
      op("alpha_lookup", "alpha beta lookup"),
      op("alpha_feed", "alpha beta history feed"),
      op("alpha_store", "alpha beta config store")
    ]
  });
  const LONG_QUERY = "alpha beta gamma delta epsilon zeta omega theta iota kappa";

  it("marks tiers on a mixed page and counts gated + novel ungated candidates", () => {
    const page = searchCatalogPage(tiny, { query: LONG_QUERY, limit: 5 });
    expect(page.effectiveLimit).toBe(5);
    expect(page.hits).toHaveLength(5);
    // Exactly one entry passes the coverage gate; it leads the page.
    expect(page.hits[0]!.id).toBe("lumenloop.alpha_handler");
    expect(page.hits[0]!.tier).toBe("gated");
    for (const hit of page.hits.slice(1)) expect(hit.tier).toBe("backfill");
    // Strongest backfill is below the required margin, so the seam stays put.
    expect(page.hits[1]!.score).toBeLessThan(
      TIER_INTERLEAVE_MARGIN * page.hits[0]!.score
    );
    // total = 1 gated + 6 novel ungated (every entry matches ≥1 token).
    expect(page.total).toBe(7);
    expect(page.truncated).toBe(true);
  });

  it("reports the effective page limit from the same default/min/max clamp search uses", () => {
    expect(searchCatalogPage(tiny, { query: "alpha beta" }).effectiveLimit).toBe(10);
    expect(searchCatalogPage(tiny, { query: "alpha beta", limit: 0 }).effectiveLimit).toBe(1);
    expect(searchCatalogPage(tiny, { query: "alpha beta", limit: 500 }).effectiveLimit).toBe(50);
  });

  it("keeps page membership, total, and truncated fixed while interleaving", () => {
    const query =
      "In a SEP-6 programmatic deposit, which SEP actually carries the customer's KYC " +
      "data — SEP-6 itself or another SEP?";
    const page = searchCatalogPage(catalog, { query, limit: 5 });
    // This is the pre-interleave selected page membership, asserted as a set:
    // the candidate only changes its order.
    expect(page.hits.map((hit) => hit.id).sort()).toEqual(
      [
        "scout.explainRepo",
        "stellarDocs.search_anchor_sep_docs",
        "stellarDocs.search_docs",
        "stellarDocs.search_docs_in_category",
        "stellarDocs.search_meeting_notes"
      ].sort()
    );
    // total counts searchable candidates only — 210 sections left search at
    // the 2026-07-13 A/B, so the candidate pool shrank from 272.
    expect(page.total).toBe(73);
    expect(page.truncated).toBe(true);
  });

  it("excludes searchable:false entries from results and totals, keeping them exposed", () => {
    // Skills-form arm seam (scratchpad 608): hidden entries stay in the
    // catalog (exact-id describe/read) but never score, rank, or count.
    const hidden = loadManifest({
      version: 1,
      generatedAt: "2026-01-01T00:00:00Z",
      entries: [
        op("alpha_handler", "alpha beta gamma delta epsilon zeta omega handler"),
        { ...op("alpha_shadow", "alpha beta gamma delta epsilon zeta omega shadow"), searchable: false },
        op("kappa_export", "kappa metrics exporter")
      ]
    });
    const page = searchCatalogPage(hidden, { query: "alpha beta gamma delta epsilon", limit: 5 });
    const ids = page.hits.map((h) => h.id);
    expect(ids).toContain("lumenloop.alpha_handler");
    expect(ids).not.toContain("lumenloop.alpha_shadow");
    // total counts only searchable candidates (shadow matches lexically but is hidden).
    expect(page.total).toBe(ids.length);
    // Still exposed: the entry exists in the catalog for exact-id surfaces.
    expect(hidden.entries.some((e) => e.id === "lumenloop.alpha_shadow")).toBe(true);
  });

  it("is deterministic across repeated mixed-page interleaves", () => {
    const opts = { query: LONG_QUERY, limit: 5 } as const;
    const first = searchCatalogPage(tiny, opts);
    for (let i = 0; i < 10; i++) {
      expect(searchCatalogPage(tiny, opts)).toEqual(first);
    }
  });

  it("searchCatalog is the thin .hits wrapper — identical page", () => {
    for (const [query, limit] of [
      [LONG_QUERY, 5],
      ["alpha beta", 2],
      ["alpha beta", 10]
    ] as const) {
      expect(searchCatalog(tiny, { query, limit })).toEqual(
        searchCatalogPage(tiny, { query, limit }).hits
      );
    }
  });

  it("tier-1-only full page: total counts gated candidates only, truncated flags the cut", () => {
    // 2-token query, 100%-coverage gate: exactly the four alpha+beta entries
    // pass. Page of 2 fills from tier 1 alone, so tier 2 is never consulted
    // and total is the gated candidate count.
    const page = searchCatalogPage(tiny, { query: "alpha beta", limit: 2 });
    expect(page.hits).toHaveLength(2);
    for (const hit of page.hits) expect(hit.tier).toBe("gated");
    expect(page.total).toBe(4);
    expect(page.truncated).toBe(true);
  });

  it("total <= limit: tier 2 consulted but novel-empty, truncated false", () => {
    // Same four gated candidates, page of 10: tier 1 leaves the page short,
    // tier 2 re-runs ungated — but every ungated candidate is already a
    // gated one (no other entry matches any token), so total stays 4.
    const page = searchCatalogPage(tiny, { query: "alpha beta", limit: 10 });
    expect(page.hits).toHaveLength(4);
    for (const hit of page.hits) expect(hit.tier).toBe("gated");
    expect(page.total).toBe(4);
    expect(page.truncated).toBe(false);
  });

  it("real-manifest invariants: wrapper equality and truncated ⇔ total > hits.length", () => {
    for (const query of [
      "stellar soroban contract",
      "search directory",
      "wallet balance lookup",
      "zzzzqqqq zzqqzzqq"
    ]) {
      const page = searchCatalogPage(catalog, { query, limit: 5 });
      expect(searchCatalog(catalog, { query, limit: 5 })).toEqual(page.hits);
      expect(page.total).toBeGreaterThanOrEqual(page.hits.length);
      expect(page.truncated).toBe(page.total > page.hits.length);
    }
  });
});

describe("searchCatalog — availableSections on skill hits (todo 812)", () => {
  it("skill hits carry availableSections matching the skills store's key set, slugs before file: keys", async () => {
    const hit = searchCatalog(catalog, {
      query: "skills.lumenloop-api.lumenloop-api-billing"
    })[0] as SearchHit;
    expect(hit.kind).toBe("skill");
    expect(hit.availableSections!.length).toBeGreaterThan(0);
    // Shape: every ## slug precedes every file:<relpath> key.
    const firstFile = hit.availableSections!.findIndex((k) => k.startsWith("file:"));
    expect(firstFile).toBeGreaterThan(0); // this skill has a file: reference
    expect(hit.availableSections!.slice(firstFile).every((k) => k.startsWith("file:"))).toBe(true);
    // Membership identical to readSkill's availableSections for the same
    // skill (order may differ: the catalog is id-sorted, the store follows
    // document order).
    const r = await readSkill(catalog, skillSource, hit.id);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect([...hit.availableSections!].sort()).toEqual([...r.availableSections].sort());
  });

  it("keeps the field OFF operation hits", () => {
    // (Skill-section hits no longer occur in search — sections carry
    // searchable:false since the 2026-07-13 A/B; the searchable-seam test in
    // this file guards that directly.)
    const opHit = searchCatalog(catalog, { query: "lumenloop.search_directory" })[0] as SearchHit;
    expect(opHit.kind).toBe("operation");
    expect(opHit.availableSections).toBeUndefined();
  });

  it("skills exist only under the canonical skills.* id — one skill, one hit (ADR-0003)", () => {
    // The lumenloop.skill.* twin namespace was never emitted into the
    // manifest; the only discoverable form is the readable skills.* mirror
    // entry (which carries availableSections).
    const hits = searchCatalog(catalog, {
      query: "lumenloop.skill.stellar-project-dossier",
      kind: "skill",
      limit: 20
    });
    expect(hits.find((h) => h.id === "lumenloop.skill.stellar-project-dossier")).toBeUndefined();
    const readable = hits.find((h) => h.id.startsWith("skills.") && h.id.endsWith("stellar-project-dossier"));
    expect(readable).toBeDefined();
  });
});

describe("searchCatalog — section entries are addresses, not content (todo 810)", () => {
  it("carries no body-derived keywords for out-of-search sections, and still answers from elsewhere", () => {
    // Sections are searchable:false since the 2026-07-13 A/B, so body-derived
    // keywords would be upstream-derived text in a committed artifact that
    // nothing scores. The extraction machinery still exists for arm A
    // (scripts/build-catalog.mjs emitSectionKeywords) — it just is not shipped.
    const sectionId = "skills.stellar-dev.smart-contracts#file:testing.md";
    const entry = catalog.entries.find((e) => e.id === sectionId)!;
    expect(entry).toBeDefined();
    expect(entry.description.toLowerCase()).not.toContain("fuzz");
    expect(entry.keywords).toBeUndefined();
    expect(entry.searchable).toBe(false);
    const hits = searchCatalog(catalog, { query: "fuzz testing smart contracts" });
    expect(hits.map((h) => h.id)).not.toContain(sectionId);
    expect(hits.length).toBeGreaterThan(0); // other surfaces still answer
  });

  it("keeps keywords out of the SearchHit contract (internal scoring field only)", () => {
    const hits = searchCatalog(catalog, { query: "fuzz testing smart contracts" });
    expect(hits.length).toBeGreaterThan(0);
    for (const hit of hits) expect("keywords" in hit).toBe(false);
  });
});

describe("searchCatalog — signatures", () => {
  it("renders TS signatures for operation hits (and runnable skills — see the design §5 describe), never prose hits", () => {
    const opHit = searchCatalog(catalog, { query: "search directory" })[0] as SearchHit;
    expect(opHit.kind).toBe("operation");
    expect(opHit.signature).toContain("type SearchDirectoryInput");
    // The callable line spells out the full result envelope — the signature
    // is the model's primary teaching surface for `r.data.*` access.
    expect(opHit.signature).toContain(
      "lumenloop.search_directory(input: SearchDirectoryInput): Promise<{ ok: true, data: SearchDirectoryOutput } | { ok: false, error: { kind: \"error\" | \"soft-empty\", message: string, hint?: string } }>"
    );

    // Non-operation hits carry no signature UNLESS runnable (skills carrying
    // a bundled runner are the only exception, asserted separately).
    const proseHits = searchCatalog(catalog, { query: "soroban storage" }).filter(
      (h) => h.kind !== "operation" && !(h.id in RUNNERS)
    );
    expect(proseHits.length).toBeGreaterThan(0);
    expect(proseHits.every((h) => h.signature === undefined)).toBe(true);
  });

  it("renders GET-operation signatures from OpenAPI parameters", () => {
    const hits = searchCatalog(catalog, { query: "scout.searchProjects" });
    const hit = hits.find((h) => h.id === "scout.searchProjects");
    expect(hit?.signature).toContain("type SearchProjectsInput");
    expect(hit?.signature).toMatch(/q\?: string/);
  });

  it("carries canonical payload keys outside the rendered signature", () => {
    const hit = searchCatalog(catalog, { query: "lumenloop.search_content_semantic" }).find(
      (candidate) => candidate.id === "lumenloop.search_content_semantic"
    );
    expect(hit?.outputKeys).toEqual(["counts", "items", "meta"]);
    expect(hit?.outputItemKeys).toEqual({
      items: ["collection", "date", "dateField", "snippet", "source", "sourceField", "title", "url"]
    });
  });
});

describe("search-hit signature compaction (todo 841)", () => {
  /** Full-render output type block length for one operation entry. */
  function outputBlockLength(entry: CatalogEntry): number {
    if (!entry.outputSchema) return 0;
    const typeBase = toPascalCase(sanitizeToolName(lastIdSegment(entry.id)));
    return jsonSchemaToType(entry.outputSchema as JsonSchema, `${typeBase}Output`).length;
  }

  it("stubs scout.searchProjects' oversized output type in search hits — top-level names kept, full type gone", () => {
    const hit = searchCatalog(catalog, { query: "scout.searchProjects" }).find(
      (h) => h.id === "scout.searchProjects"
    ) as SearchHit;
    // The input type and callable envelope line are ALWAYS full — they are
    // what the model needs to make the call.
    expect(hit.signature).toContain("type SearchProjectsInput");
    expect(hit.signature).toContain(
      "scout.searchProjects(input: SearchProjectsInput): Promise<{ ok: true, data: SearchProjectsOutput }"
    );
    // The output type is the stub declaration: top-level field names stay
    // visible (payload field selection without a describe round-trip)…
    // (Asserting the load-bearing parts, not the prose — the stub's wording
    // may be tuned without breaking CI; the type name, field names, and the
    // exact describe pointer may not.)
    expect(hit.signature).toContain("type SearchProjectsOutput");
    expect(hit.signature).toContain("codeReferences, meta, projects");
    expect(hit.signature).toContain('codemode.describe("scout.searchProjects")');
    // …and the ~12.7KB rendered property tree is gone.
    expect(hit.signature).not.toContain("codeReferences?:");
    expect(hit.signature!.length).toBeLessThan(3000);
  });

  it("only output blocks over the threshold are compacted; every other op's search signature is byte-identical", () => {
    const ops = catalog.entries.filter((e) => e.kind === "operation" && e.inputSchema);
    const compacted: string[] = [];
    for (const entry of ops) {
      const full = renderSignature(entry)!;
      const compact = renderSignature(entry, { compactOversizedOutput: true })!;
      if (outputBlockLength(entry) > COMPACT_OUTPUT_THRESHOLD) {
        compacted.push(entry.id);
        expect(compact, entry.id).not.toBe(full);
        // The describe pointer is the branch-independent stub invariant
        // (object schemas list field names; non-object ones degrade to an
        // `unknown` stub — both carry the pointer).
        expect(compact, entry.id).toContain(`codemode.describe(${JSON.stringify(entry.id)})`);
      } else {
        expect(compact, entry.id).toBe(full); // byte-identical below the line
      }
    }
    // The threshold trims ONLY the measured monsters. Scout 1.8.28 expanded
    // several shared response schemas past the line, and 1.8.30 added +622 chars of shared
    // `meta` prose (nullable `total` + `totalBasis`) that carried scout.getHackathon
    // (1631 -> 2253) and scout.searchResearch (1769 -> 2391) over it too; pin the complete
    // set so a later schema refresh cannot silently widen compaction coverage.
    // 1.8.32 (the contract-honesty release: 69 already-served meta fields finally declared)
    // carried exactly ONE more op over the line — scout.getPeople, 1099 -> 3196 — so its
    // output type is now stubbed in search hits and reaching the full shape costs a
    // codemode.describe("scout.getPeople") round-trip. Every other member was already over.
    expect(compacted.sort()).toEqual([
      "scout.analyzeEcosystem",
      "scout.explainRepo",
      "scout.getBuilders",
      "scout.getClusters",
      "scout.getHackathon",
      "scout.getHackathons",
      "scout.getLeaderboard",
      "scout.getPartners",
      "scout.getPeople",
      "scout.getRfps",
      "scout.getStablecoins",
      "scout.listAudits",
      "scout.listSkills",
      "scout.searchProjects",
      "scout.searchRepos",
      "scout.searchResearch"
    ]);
  });

  it("search hits (both surfaces share searchCatalogPage) carry the compact rendering", () => {
    const { hits } = searchCatalogPage(catalog, { query: "scout.searchRepos" });
    const hit = hits.find((h) => h.id === "scout.searchRepos")!;
    expect(hit.signature).toContain("top-level field");
    const small = hits.find((h) => {
      if (h.kind !== "operation") return false;
      const entry = catalog.entries.find((e) => e.id === h.id)!;
      return outputBlockLength(entry) <= COMPACT_OUTPUT_THRESHOLD;
    });
    expect(small).toBeDefined(); // the page isn't all monsters
    const entry = catalog.entries.find((e) => e.id === small!.id)!;
    expect(small!.signature).toBe(renderSignature(entry)); // full === compact below threshold
  });

  it("exercises COMPACT_OUTPUT_THRESHOLD exactly at its boundary (hand-built schema)", () => {
    // One string property whose description pads the rendered JSDoc line —
    // the rendered block length is linear in the pad, so the entry can be
    // calibrated to land EXACTLY on the threshold.
    const makeEntry = (pad: string): CatalogEntry => ({
      id: "scout.boundaryProbe",
      service: "scout",
      kind: "operation",
      description: "hand-built boundary probe",
      inputSchema: { type: "object", properties: { q: { type: "string" } } },
      outputSchema: {
        type: "object",
        properties: {
          alpha: { type: "string", description: pad },
          beta: { type: "number" }
        }
      },
      transport: null,
      provenance: { source: "test://boundary", fetchedAt: "2026-07-06T00:00:00Z" }
    });
    const baseLen = outputBlockLength(makeEntry("x"));
    expect(baseLen).toBeLessThan(COMPACT_OUTPUT_THRESHOLD); // calibration sanity
    const atThreshold = makeEntry("x".repeat(COMPACT_OUTPUT_THRESHOLD - baseLen + 1));
    expect(outputBlockLength(atThreshold)).toBe(COMPACT_OUTPUT_THRESHOLD);
    const overThreshold = makeEntry("x".repeat(COMPACT_OUTPUT_THRESHOLD - baseLen + 2));
    expect(outputBlockLength(overThreshold)).toBe(COMPACT_OUTPUT_THRESHOLD + 1);

    // AT the threshold: not compacted (strictly-greater comparison).
    expect(renderSignature(atThreshold, { compactOversizedOutput: true })).toBe(
      renderSignature(atThreshold)
    );
    // ONE char over: compacted to the stub with both top-level names.
    const compacted = renderSignature(overThreshold, { compactOversizedOutput: true })!;
    expect(compacted).toContain("type BoundaryProbeOutput");
    expect(compacted).toContain("alpha, beta");
    expect(compacted).toContain('codemode.describe("scout.boundaryProbe")');
    expect(compacted).not.toContain("xxxx");
    // Full mode never compacts, no matter the size (describe's rendering).
    expect(renderSignature(overThreshold)).toContain("alpha?: string");
  });
});

describe("runnable skills — loadManifest refinements (design §5)", () => {
  const DIGEST = "skills.lumenloop.stellar-ecosystem-digest";
  const rawManifest = (): { entries: Record<string, unknown>[] } =>
    JSON.parse(readFileSync(join(ROOT, "catalog", "manifest.json"), "utf8"));

  it("accepts the real manifest and carries the runnable flag through the parse", () => {
    const parsed = loadManifest(rawManifest());
    const entry = parsed.entries.find((e) => e.id === DIGEST)!;
    expect(entry.runnable).toBe(true);
    expect(entry.inputSchema).not.toBeNull();
    expect(entry.outputSchema).not.toBeNull();
  });

  it("keeps the retired dossier runner's skill entry a plain readable skill (todo 849)", () => {
    const parsed = loadManifest(rawManifest());
    const entry = parsed.entries.find((e) => e.id === "skills.lumenloop.stellar-project-dossier")!;
    expect(entry).toBeDefined();
    expect(entry.kind).toBe("skill");
    expect(entry.runnable).toBeUndefined();
    expect(entry.inputSchema).toBeNull();
    expect(entry.outputSchema).toBeNull();
  });

  it("rejects a runnable entry missing either schema", () => {
    for (const field of ["inputSchema", "outputSchema"] as const) {
      const raw = rawManifest();
      const entry = raw.entries.find((e) => e.id === DIGEST)!;
      entry[field] = null;
      expect(() => loadManifest(raw), field).toThrow(/must carry both schemas/);
    }
  });

  it("rejects the runnable flag on a non-skill kind", () => {
    const raw = rawManifest();
    const op = raw.entries.find((e) => e.id === "lumenloop.search_directory")!;
    op.runnable = true;
    expect(() => loadManifest(raw)).toThrow(/skill-entry affordance/);
  });
});

describe("runnable-skill signatures (design §5)", () => {
  const digest = () =>
    catalog.entries.find((e) => e.id === "skills.lumenloop.stellar-ecosystem-digest")!;

  it("renders the exact codemode.skill.run callable line with the same envelope union operations use", () => {
    const sig = renderSignature(digest())!;
    expect(sig).toContain("type StellarEcosystemDigestInput");
    expect(sig).toContain("type StellarEcosystemDigestOutput");
    expect(sig).toContain(
      'codemode.skill.run("skills.lumenloop.stellar-ecosystem-digest", input: StellarEcosystemDigestInput): Promise<{ ok: true, data: StellarEcosystemDigestOutput } | { ok: false, error: { kind: "error" | "soft-empty", message: string, hint?: string } }>'
    );
  });

  it("non-runnable skills and sections still render no signature", () => {
    const prose = catalog.entries.find((e) => e.kind === "skill" && e.runnable !== true)!;
    expect(prose).toBeDefined();
    expect(renderSignature(prose)).toBeUndefined();
    const section = catalog.entries.find((e) => e.kind === "skill-section")!;
    expect(renderSignature(section)).toBeUndefined();
  });

  it("search hits for a runnable skill carry BOTH the signature and availableSections", () => {
    for (const id of Object.keys(RUNNERS)) {
      const hit = searchCatalog(catalog, { query: id }).find((h) => h.id === id)!;
      expect(hit, id).toBeDefined();
      expect(hit.kind).toBe("skill");
      const entry = catalog.entries.find((e) => e.id === id)!;
      expect(hit.signature).toBe(renderSignature(entry, { compactOversizedOutput: true }));
      expect(hit.signature).toContain(`codemode.skill.run(${JSON.stringify(id)}`);
      expect(hit.availableSections!.length).toBeGreaterThan(0);
    }
  });

  it("honors COMPACT_OUTPUT_THRESHOLD for runnable skills exactly as for operations", () => {
    // Hand-built runnable entry with an oversized output block: the search-
    // hit rendering mode must stub it down to top-level field names + the
    // describe pointer while keeping the callable line intact.
    const entry: CatalogEntry = {
      id: "skills.test.padded-runner",
      service: "skills",
      kind: "skill",
      runnable: true,
      description: "hand-built runnable compaction probe",
      inputSchema: { type: "object", properties: { q: { type: "string" } } },
      outputSchema: {
        type: "object",
        properties: {
          alpha: { type: "string", description: "x".repeat(COMPACT_OUTPUT_THRESHOLD + 10) },
          beta: { type: "number" }
        }
      },
      transport: null,
      provenance: { source: "test://runnable", fetchedAt: "2026-07-06T00:00:00Z" }
    };
    const compact = renderSignature(entry, { compactOversizedOutput: true })!;
    expect(compact).toContain("alpha, beta");
    expect(compact).toContain('codemode.describe("skills.test.padded-runner")');
    expect(compact).not.toContain("xxxx");
    expect(compact).toContain('codemode.skill.run("skills.test.padded-runner"');
    // Full mode (describe's rendering) never compacts, no matter the size.
    expect(renderSignature(entry)).toContain("alpha?: string");
  });
});

describe("runnable byte-stability — the §10.1 invariant, pinned offline (design §12)", () => {
  const RUNNABLE_IDS = new Set(Object.keys(RUNNERS));

  /** The same manifest with the runnable attachment undone — "current main". */
  function strippedCatalog(): Catalog {
    const raw = JSON.parse(readFileSync(join(ROOT, "catalog", "manifest.json"), "utf8")) as {
      entries: Record<string, unknown>[];
    };
    raw.entries = raw.entries.map((entry) => {
      if (entry.runnable !== true) return entry;
      const { runnable: _runnable, ...rest } = entry;
      return { ...rest, inputSchema: null, outputSchema: null };
    });
    return loadManifest(raw);
  }

  it("every pre-existing hit field is byte-identical to a non-runnable build; signature on the runnable entries is the only delta", () => {
    const stripped = strippedCatalog();
    const queries: { query: string; limit?: number }[] = [
      // Queries that surface the runnable entry (exact id + topical), plus
      // the retired-runner dossier skill (now a plain hit on both sides)…
      { query: "skills.lumenloop.stellar-project-dossier" },
      { query: "skills.lumenloop.stellar-ecosystem-digest" },
      { query: "project dossier scf funding history", limit: 20 },
      { query: "recent ecosystem digest news roundup", limit: 20 },
      { query: "scf funding award project", limit: 25 },
      // …and a spread of ordinary pages (ops, sections, backfill, broad).
      { query: "stellar", limit: 50 },
      { query: "stellar soroban contract", limit: 15 },
      { query: "search directory" },
      { query: "soroban storage" },
      { query: "stellar docs search" },
      { query: "wallet balance lookup" },
      { query: "fuzz testing smart contracts" },
      {
        query:
          "design a cross chain remittance corridor that quotes fees checks anchor deposit " +
          "limits verifies trustline flags and streams payment status webhooks to a dashboard",
        limit: 5
      }
    ];
    let runnableHitsSeen = 0;
    for (const opts of queries) {
      const before = searchCatalog(stripped, opts);
      const after = searchCatalog(catalog, opts);
      // Rank/membership identity: same ids in the same order.
      expect(
        after.map((h) => h.id),
        opts.query
      ).toEqual(before.map((h) => h.id));
      for (let i = 0; i < after.length; i++) {
        const { signature: sigBefore, ...restBefore } = before[i]!;
        const { signature: sigAfter, ...restAfter } = after[i]!;
        // Every pre-existing field byte-identical (score, tier, description,
        // availableSections, …) — the scorer reads nothing this change touches.
        expect(JSON.stringify(restAfter), `${opts.query} #${i} (${after[i]!.id})`).toBe(
          JSON.stringify(restBefore)
        );
        if (RUNNABLE_IDS.has(after[i]!.id)) {
          // The one permitted delta: the runnable hit GAINS a signature.
          expect(sigBefore, `${opts.query} #${i}`).toBeUndefined();
          expect(typeof sigAfter, `${opts.query} #${i}`).toBe("string");
          runnableHitsSeen += 1;
        } else {
          expect(sigAfter, `${opts.query} #${i} (${after[i]!.id})`).toBe(sigBefore);
        }
      }
    }
    // The battery must actually exercise the delta, or it proves nothing.
    expect(runnableHitsSeen).toBeGreaterThan(0);
  });
});

describe("alias canonicalization — lever 6 (todo 844)", () => {
  it("canonicalizeQuery: null when no alias token (byte-identical no-op path)", () => {
    expect(canonicalizeQuery("wallet balance lookup")).toBeNull();
    expect(canonicalizeQuery("soroban contract storage")).toBeNull();
    // "transaction" spelled out is NOT an alias — no rewrite.
    expect(canonicalizeQuery("transaction history")).toBeNull();
  });

  it("canonicalizeQuery: substitutes abbreviation tokens, single-token only", () => {
    expect(canonicalizeQuery("tx history")).toBe("transaction history");
    expect(canonicalizeQuery("check acct addr")).toBe("check account address");
    // Alias must be its own token — "taxes"/"txhash" style substrings are untouched.
    expect(canonicalizeQuery("txhash lookup")).toBeNull();
  });

  it("bridges the register gap: an abbreviation query hits transaction-vocabulary entries", () => {
    // Vendor prefix matching cannot bridge tx->transaction ("transaction"
    // does not start with "tx"); the lever must. Real-manifest behavioral
    // pin from the live probes that motivated the lever: a transaction-
    // related entry ranks in the top 3 for the abbreviated phrasing.
    const hits = searchCatalog(catalog, { query: "txn submit failed", limit: 5 });
    expect(
      hits.slice(0, 3).some(
        (h) => h.id.includes("transaction") || h.description.toLowerCase().includes("transaction")
      )
    ).toBe(true);
  });

  it("never reduces original-query scores: alias variant only adds via max", () => {
    // An entry matching the ORIGINAL tokens keeps at least its original
    // score when the query also contains an alias token.
    const entry = {
      id: "svc.op",
      name: "op",
      service: "svc",
      kind: "operation",
      description: "spike analysis for fees"
    };
    const withAlias = scoreEntryWeighted(entry, "tx fee spike");
    const originalOnly = scoreEntryWeighted(entry, "fee spike");
    expect(withAlias).not.toBeNull();
    expect(originalOnly).not.toBeNull();
  });
});
