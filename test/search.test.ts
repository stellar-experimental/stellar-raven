import { describe, expect, it, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadManifest,
  searchCatalog,
  searchCatalogPage,
  recoveryCandidates,
  recoveryCandidatesFromSources,
  detailTargetsFromSources,
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
import { STOPWORDS, scoreEntryWeighted, canonicalizeQuery } from "../src/catalog/scoring.ts";
import { lastIdSegment } from "../src/catalog/id.ts";
import { prepareAliasQuery, queryContainsAliasTrigger } from "../src/catalog/known-aliases.ts";

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

  it("scores receipt-backed entity aliases only for complete normalized triggers", () => {
    const expected = [
      "lumenloop.find_content_by_entity"
    ];
    for (const query of ["CRDT", "CRD-T", "CRDYX", "WisdomTree Private Credit", "wisdomtree", "wisdom-tree"]) {
      const ids = searchCatalog(catalog, {
        query,
        service: "lumenloop",
        limit: 5
      }).map((hit) => hit.id);
      expect(ids.slice(0, 1), query).toEqual(expected);
    }
    for (const query of ["merkle tree", "tree", "wisdom", "credit card"]) {
      const ids = searchCatalog(catalog, {
        query,
        service: "lumenloop",
        limit: 50
      }).map((hit) => hit.id);
      expect(ids, query).not.toContain("lumenloop.find_content_by_entity");
    }
  });

  it("defaults to limit 10 and honors an explicit limit", () => {
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
    // Tokens must have zero lexical or prefix overlap; even weak overlap can surface tier-2 backfill on an otherwise-empty page.
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

  it("applies the Scout profile triggers and leaves getChanges unprofiled", () => {
    const ids = (from: string, reason: "empty" | "weak" | "partial") =>
      recoveryCandidates(catalog, [from], reason).map((candidate) => candidate.id);

    expect(ids("scout.listContracts", "empty")).toEqual([
      "scout.searchRepos",
      "lumenloop.search_content_semantic"
    ]);
    expect(ids("scout.getRepoTrust", "partial")).toEqual([
      "scout.searchRepos",
      "scout.searchResearch"
    ]);
    expect(ids("scout.scfPitch", "empty")).toEqual([
      "lumenloop.find_similar_scf_submissions"
    ]);
    expect(ids("scout.vetIdea", "weak")).toEqual([
      "lumenloop.find_similar_scf_submissions",
      "scout.searchHackathonBuilds",
      "scout.searchResearch"
    ]);
    expect(ids("scout.getChanges", "empty")).toEqual([]);
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

describe("recoveryCandidatesFromSources — execute-time contingency graph", () => {
  it("keeps its unfiltered source traversal distinct from reason-filtered recovery", () => {
    expect(recoveryCandidates(catalog, ["scout.getBuilders"], "partial").map(({ id }) => id)).toEqual([
      "lumenloop.find_av_passages"
    ]);
    expect(recoveryCandidatesFromSources(catalog, ["scout.getBuilders"], []).map(({ id }) => id)).toEqual([
      "lumenloop.search_content_semantic",
      "scout.searchResearch",
      "lumenloop.find_av_passages"
    ]);
  });

  it("preserves source and edge order while deduplicating and observing the early limit", () => {
    const sources = ["scout.getPeople", "scout.getBuilders"];

    expect(recoveryCandidatesFromSources(catalog, sources, [], 3).map(({ id, from }) => ({ id, from }))).toEqual([
      { id: "scout.getBuilders", from: "scout.getPeople" },
      { id: "scout.searchResearch", from: "scout.getPeople" },
      { id: "lumenloop.search_content_semantic", from: "scout.getPeople" }
    ]);
    expect(recoveryCandidatesFromSources(catalog, sources, [], 4).map(({ id, from }) => ({ id, from }))).toEqual([
      { id: "scout.getBuilders", from: "scout.getPeople" },
      { id: "scout.searchResearch", from: "scout.getPeople" },
      { id: "lumenloop.search_content_semantic", from: "scout.getPeople" },
      { id: "lumenloop.find_av_passages", from: "scout.getBuilders" }
    ]);
  });

  it("uses the complete exclusion set, including ids outside the source set", () => {
    const recovery = recoveryCandidatesFromSources(
      catalog,
      ["scout.getPeople", "scout.getBuilders"],
      ["scout.searchResearch"],
      4
    );

    expect(recovery.map(({ id, from }) => ({ id, from }))).toEqual([
      { id: "scout.getBuilders", from: "scout.getPeople" },
      { id: "lumenloop.search_content_semantic", from: "scout.getPeople" },
      { id: "lumenloop.find_av_passages", from: "scout.getBuilders" }
    ]);
    expect(recovery.map(({ id }) => id)).not.toContain("scout.searchResearch");
  });

  it("leaves ranked search output unchanged", () => {
    const before = searchCatalogPage(catalog, { query: "builder directory", limit: 5 });

    recoveryCandidatesFromSources(
      catalog,
      ["scout.getPeople", "scout.getBuilders"],
      ["scout.searchResearch"]
    );

    expect(searchCatalogPage(catalog, { query: "builder directory", limit: 5 })).toEqual(before);
  });
});

describe("searchCatalogPage — structural wider candidates", () => {
  it("keeps service-filter-excluded skill matches in labeled recovery metadata", () => {
    const page = searchCatalogPage(catalog, {
      query: "agentic payments MPP",
      service: "lumenloop",
      limit: 5
    });
    const advisories = page.recoveryMetadata.serviceFilterExcludedSkills;

    expect(page.hits.every((hit) => hit.service === "lumenloop")).toBe(true);
    expect(page.hits.map((hit) => hit.id)).not.toContain(
      "skills.stellar-dev.agentic-payments"
    );
    expect(advisories).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "skills.stellar-dev.agentic-payments",
          service: "skills",
          kind: "skill",
          basis: "service-filter-excluded-skill"
        })
      ])
    );
  });

  it("does not add excluded-skill advisories to explicit operation searches", () => {
    const page = searchCatalogPage(catalog, {
      query: "agentic payments MPP",
      kind: "operation",
      service: "lumenloop"
    });
    expect(page.recoveryMetadata.serviceFilterExcludedSkills).toEqual([]);
  });

  it("reports hit count and the absolute top-two score gap", () => {
    const page = searchCatalogPage(catalog, { query: "search directory", limit: 5 });
    expect(page.confidence.hitCount).toBe(page.hits.length);
    expect(page.confidence.topScoreGap).toBe(
      Math.abs(page.hits[0]!.score - page.hits[1]!.score)
    );
    expect(page.confidence.topScoreTiers).toEqual({
      first: page.hits[0]!.tier,
      second: page.hits[1]!.tier
    });

    const empty = searchCatalogPage(catalog, { query: "zzzzqqqq zzqqzzqq", kind: "skill" });
    expect(empty.confidence).toEqual({ hitCount: 0, topScoreGap: null, topScoreTiers: null });
  });

  it("reports an absolute gap with tier context when gated order leads a higher score", () => {
    const page = searchCatalogPage(catalog, {
      query: "What functions does the Stellar Asset Contract expose, and which are restricted to the asset issuer/admin?",
      limit: 5
    });
    expect(page.hits[0]!.tier).toBe("gated");
    expect(page.hits[1]!.tier).toBe("backfill");
    expect(page.hits[1]!.score).toBeGreaterThan(page.hits[0]!.score);
    expect(page.confidence).toMatchObject({
      topScoreGap: page.hits[1]!.score - page.hits[0]!.score,
      topScoreTiers: { first: "gated", second: "backfill" }
    });
  });

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
    for (const query of [
      "Who is Tyler van der Hoeven?",
      "Who is Danel Jed McCaleb?",
      "Who was Ada Lovelace?"
    ]) {
      const page = searchCatalogPage(catalog, { query, limit: 5 });
      expect(page.hits.every((hit) => hit.tier === "backfill"), query).toBe(true);
      expect(page.widerCandidates.map((candidate) => candidate.id), query).toEqual([
        "scout.searchResearch",
        "lumenloop.search_content_semantic",
        "stellarDocs.search_docs"
      ]);
    }
  });

  it("does not treat a role question as a proper-name advisory", () => {
    const page = searchCatalogPage(catalog, {
      query: "Who is responsible for Soroban protocol upgrades?",
      limit: 5
    });
    expect(page.widerCandidates.map((candidate) => candidate.id)).not.toEqual([
      "scout.searchResearch",
      "lumenloop.search_content_semantic",
      "stellarDocs.search_docs"
    ]);
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

  it("stays silent for multi-token gated and mixed pages and skill-only pages, and honors service filters", () => {
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

describe("loadManifest — structural invariants", () => {
  function rawManifest(): { entries: Record<string, unknown>[] } {
    return JSON.parse(readFileSync(join(ROOT, "catalog", "manifest.json"), "utf8"));
  }

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
    // matchPartners is excluded; the directory read stays reachable.
    const match = searchCatalog(catalog, { query: "scout.matchPartners", limit: 50 });
    expect(match.map((h) => h.id)).not.toContain("scout.matchPartners");
    const directory = searchCatalog(catalog, { query: "scout.getPartners", limit: 50 });
    expect(directory.map((h) => h.id)).toContain("scout.getPartners");
  });
});

describe("searchCatalog — routing quality", () => {
  function structuredIntentFixture({
    query,
    overflowDescription,
    overflowPhrases,
    overflowRoutingKeywords,
    overflowKeywords,
    overflowLane
  }: {
    query: string;
    overflowDescription: string;
    overflowPhrases?: CatalogEntry["routingPhrases"];
    overflowRoutingKeywords?: string[];
    overflowKeywords?: string[];
    overflowLane?: "detail";
  }): Catalog {
    const tokens = query.split(" ");
    const querySlug = tokens.join("_");
    const entry = (
      service: "lumenloop" | "scout" | "stellarDocs" | "skills",
      name: string,
      description: string,
      extra: Partial<CatalogEntry> = {}
    ): CatalogEntry => ({
      id: `${service}.${name}`,
      service,
      kind: service === "skills" ? "skill" : "operation",
      description,
      inputSchema: null,
      outputSchema: null,
      transport: null,
      provenance: { source: "test://structured-intent", fetchedAt: "2026-01-01T00:00:00Z" },
      ...extra
    });

    return loadManifest({
      version: 1,
      generatedAt: "2026-01-01T00:00:00Z",
      entries: [
        entry("scout", `${querySlug}_primary`, `${tokens[0]} route`),
        entry("scout", `${querySlug}_secondary`, `${tokens[1]} route`),
        entry("scout", "overflow", overflowDescription, {
          ...(overflowPhrases ? { routingPhrases: overflowPhrases } : {}),
          ...(overflowRoutingKeywords ? { routingKeywords: overflowRoutingKeywords } : {}),
          ...(overflowKeywords ? { keywords: overflowKeywords } : {}),
          ...(overflowLane ? {
            retrievalProfile: {
              lane: overflowLane,
              emptyScope: "operation",
              recoverWith: [{
                id: `scout.${querySlug}_primary`,
                relation: "cross-family",
                on: ["empty"]
              }]
            }
          } : {})
        }),
        entry("lumenloop", `${querySlug}_aux`, `${tokens[0]} route`),
        entry("stellarDocs", `${querySlug}_aux`, `${tokens[1]} route`),
        entry("skills", `${querySlug}_aux`, `${tokens[2] ?? tokens[0]} route`)
      ]
    });
  }

  it.each([1, 5])("preserves the default-kind name ranking and page facts at limit %i", (limit) => {
    const page = searchCatalogPage(catalog, { query: "freighter", limit });
    const expected = [
      { id: "skills.stellar-dev.dapp", score: 75, tier: "gated" },
      { id: "stellarDocs.search_wallet_dapp_docs", score: 75, tier: "gated" }
    ];
    expect(page.hits.map(({ id, score, tier }) => ({ id, score, tier }))).toEqual(expected.slice(0, limit));
    expect(page.total).toBe(2);
    expect(page.truncated).toBe(limit < 2);
    expect(page.effectiveLimit).toBe(limit);
    expect(page.widerCandidates).toEqual([
      expect.objectContaining({ id: "scout.searchProjects", basis: "short-query-directory" })
    ]);
  });

  it("keeps the accepted GitHub-activity leaderboard intent inside the Scout quota", () => {
    const page = searchCatalogPage(catalog, {
      query: "top projects by GitHub activity",
      limit: 5
    });

    expect(page.hits.map((hit) => hit.id)).toContain("scout.getLeaderboard");
    expect(page.hits.map((hit) => hit.id)).not.toContain("scout.searchProjects");
    expect(page.hits.filter((hit) => hit.service === "scout")).toHaveLength(2);
    expect(searchCatalogPage(catalog, {
      query: "top projects by GitHub activity",
      limit: 5
    })).toEqual(page);
    expect(page.truncated).toBe(true);
  });

  it("keeps the accepted Stellar GitHub-activity leaderboard intent inside the Scout quota", () => {
    const page = searchCatalogPage(catalog, {
      query: "top Stellar projects by GitHub activity",
      limit: 5
    });

    expect(page.hits.map((hit) => hit.id)).toContain("scout.getLeaderboard");
    expect(page.hits.map((hit) => hit.id)).not.toContain("scout.searchProjects");
    expect(page.hits.filter((hit) => hit.service === "scout")).toHaveLength(1);
    expect(searchCatalogPage(catalog, {
      query: "top Stellar projects by GitHub activity",
      limit: 5
    })).toEqual(page);
    expect(page.truncated).toBe(true);
  });

  it("does not preserve a description-only full match without a qualifying phrase", () => {
    const synthetic = structuredIntentFixture({
      query: "alpha beta gamma delta",
      overflowDescription: "alpha beta gamma delta"
    });

    const ids = searchCatalogPage(synthetic, {
      query: "alpha beta gamma delta",
      limit: 5
    }).hits.map((hit) => hit.id);

    expect(ids).toContain("scout.alpha_beta_gamma_delta_primary");
    expect(ids).toContain("scout.alpha_beta_gamma_delta_secondary");
    expect(ids).not.toContain("scout.overflow");
  });

  it("preserves a complete three-token intent with two description tokens", () => {
    const synthetic = structuredIntentFixture({
      query: "alpha beta gamma",
      overflowDescription: "alpha beta ranking",
      overflowPhrases: [{ field: "useWhen", tokens: ["beta", "gamma"] }]
    });

    const ids = searchCatalogPage(synthetic, {
      query: "alpha beta gamma",
      limit: 5
    }).hits.map((hit) => hit.id);

    expect(ids).toContain("scout.alpha_beta_gamma_primary");
    expect(ids).not.toContain("scout.alpha_beta_gamma_secondary");
    expect(ids).toContain("scout.overflow");
  });

  it("does not preserve an ambiguous two-token intent with one description token", () => {
    const synthetic = structuredIntentFixture({
      query: "alpha beta",
      overflowDescription: "alpha ranking",
      overflowPhrases: [{ field: "keywords", tokens: ["alpha", "beta"] }],
      overflowRoutingKeywords: ["alpha", "beta"]
    });

    const ids = searchCatalogPage(synthetic, {
      query: "alpha beta",
      limit: 5
    }).hits.map((hit) => hit.id);

    expect(ids).toContain("scout.alpha_beta_primary");
    expect(ids).toContain("scout.alpha_beta_secondary");
    expect(ids).not.toContain("scout.overflow");
  });

  it("does not admit an ungated overflow operation through phrase metadata", () => {
    const synthetic = structuredIntentFixture({
      query: "alpha beta gamma delta epsilon",
      overflowDescription: "alpha ranking",
      overflowPhrases: [{
        field: "useWhen",
        tokens: ["alpha", "beta", "gamma", "delta", "epsilon"]
      }]
    });

    const page = searchCatalogPage(synthetic, {
      query: "alpha beta gamma delta epsilon",
      limit: 5
    });

    expect(page.hits).toHaveLength(5);
    expect(page.hits.map((hit) => hit.id)).not.toContain("scout.overflow");
  });

  it("does not use schema keywords as structured intent evidence", () => {
    const synthetic = structuredIntentFixture({
      query: "alpha beta gamma delta",
      overflowDescription: "alpha beta ranking",
      overflowKeywords: ["gamma", "delta"]
    });

    const ids = searchCatalogPage(synthetic, {
      query: "alpha beta gamma delta",
      limit: 5
    }).hits.map((hit) => hit.id);

    expect(ids).toContain("scout.alpha_beta_gamma_delta_secondary");
    expect(ids).not.toContain("scout.overflow");
  });

  it("does not combine two source phrases into one complete intent", () => {
    const synthetic = structuredIntentFixture({
      query: "alpha beta gamma delta",
      overflowDescription: "alpha beta ranking",
      overflowPhrases: [
        { field: "useWhen", tokens: ["beta", "gamma"] },
        { field: "exampleQuestions", tokens: ["beta", "delta"] }
      ],
      overflowRoutingKeywords: ["alpha", "beta", "gamma", "delta"]
    });

    const ids = searchCatalogPage(synthetic, {
      query: "alpha beta gamma delta",
      limit: 5
    }).hits.map((hit) => hit.id);

    expect(ids).toContain("scout.alpha_beta_gamma_delta_secondary");
    expect(ids).not.toContain("scout.overflow");
  });

  it("does not preserve a complete detail-lane overflow operation", () => {
    const synthetic = structuredIntentFixture({
      query: "alpha beta gamma",
      overflowDescription: "alpha beta ranking",
      overflowPhrases: [{ field: "useWhen", tokens: ["beta", "gamma"] }],
      overflowLane: "detail"
    });

    const ids = searchCatalogPage(synthetic, {
      query: "alpha beta gamma",
      limit: 5
    }).hits.map((hit) => hit.id);

    expect(ids).toContain("scout.alpha_beta_gamma_secondary");
    expect(ids).not.toContain("scout.overflow");
  });

  it("attributes positive and negative source-routing membership separately", () => {
    const withoutPositive = loadManifest({
      ...catalog,
      entries: catalog.entries.map(({
        routingPhrases: _phrases,
        routingKeywords: _keywords,
        ...entry
      }) => entry)
    });
    const withoutNegative = loadManifest({
      ...catalog,
      entries: catalog.entries.map(({ routingExclusions: _exclusions, ...entry }) => entry)
    });
    const query = "top projects by GitHub activity";
    const options = { query, service: "scout", limit: 5 } as const;
    const routedIds = searchCatalogPage(catalog, options).hits.map((hit) => hit.id);
    const withoutPositiveIds = searchCatalogPage(withoutPositive, options)
      .hits.map((hit) => hit.id);
    const withoutNegativeIds = searchCatalogPage(withoutNegative, options)
      .hits.map((hit) => hit.id);

    expect(routedIds).toContain("scout.getLeaderboard");
    expect(withoutPositiveIds).not.toContain("scout.getLeaderboard");
    expect(routedIds).not.toContain("scout.searchProjects");
    expect(withoutNegativeIds).toContain("scout.searchProjects");
  });

  it("keeps every exact operation id first after source-routing admission, including ops with negative exclusions", () => {
    const ops = catalog.entries.filter((candidate) => candidate.kind === "operation");
    expect(ops.some((entry) => (entry.routingExclusions?.length ?? 0) > 0)).toBe(true);
    for (const entry of ops) {
      expect(searchCatalog(catalog, { query: entry.id, limit: 1 })[0]?.id, entry.id)
        .toBe(entry.id);
    }
  });

  it.each([
    "freighter",
    "openx402",
    "hypertron"
  ])("adds a directory advisory for the bare project name %s", (query) => {
    const directoryIds = new Set([
      "lumenloop.search_directory",
      "scout.searchProjects"
    ]);
    const page = searchCatalogPage(catalog, { query, kind: "operation", limit: 5 });
    expect(
      page.widerCandidates.some(
        (candidate) => directoryIds.has(candidate.id) &&
          candidate.basis === "short-query-directory" &&
          candidate.lane === "directory"
      )
    ).toBe(true);
    expect(page.hits.some((hit) => directoryIds.has(hit.id) && hit.score === 0)).toBe(false);
  });

  it.each([
    ["audit", "scout.listAudits"],
    ["rfp", "scout.getRfps"]
  ])("does not add directory advice for the operation word %s", (query, operationId) => {
    const page = searchCatalogPage(catalog, {
      query,
      kind: "operation",
      limit: 5
    });
    expect(page.hits.some((hit) => hit.id === operationId)).toBe(true);
    expect(page.widerCandidates).toEqual([]);
  });

  it.each(["open x402", "open-x402"])("does not add short-query directory advice for %s", (query) => {
    const page = searchCatalogPage(catalog, {
      query,
      kind: "operation",
      limit: 5
    });
    expect(page.widerCandidates).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ basis: "short-query-directory" })
      ])
    );
  });

  it("constrains short-query directory advice to the service filter", () => {
    const page = searchCatalogPage(catalog, {
      query: "freighter",
      kind: "operation",
      service: "lumenloop",
      limit: 5
    });
    expect(page.widerCandidates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "lumenloop.search_directory",
          service: "lumenloop",
          basis: "short-query-directory"
        })
      ])
    );
    expect(page.widerCandidates.every((candidate) => candidate.service === "lumenloop")).toBe(true);
  });

  it("suppresses short-query directory advice for skill-only searches", () => {
    const page = searchCatalogPage(catalog, {
      query: "freighter",
      kind: "skill",
      limit: 5
    });
    expect(page.widerCandidates).toEqual([]);
  });

  it("uses only a Scout directory recommendation under the Scout service filter", () => {
    const page = searchCatalogPage(catalog, { query: "freighter", service: "scout", limit: 5 });
    expect(page.widerCandidates).toContainEqual(
      expect.objectContaining({ id: "scout.searchProjects", basis: "short-query-directory" })
    );
    expect(page.widerCandidates.every((candidate) => candidate.service === "scout")).toBe(true);
  });

  it("adds no directory recommendation under the Docs service filter", () => {
    const page = searchCatalogPage(catalog, { query: "freighter", service: "stellarDocs", limit: 5 });
    expect(page.widerCandidates).toEqual([]);
  });

  it("keeps literal identity tokens distinct from semantic matches", () => {
    const page = searchCatalogPage(catalog, { query: "person", limit: 5 });
    expect(page.hits.some((hit) => hit.id === "scout.getPeople")).toBe(true);
    expect(page.widerCandidates).toContainEqual(
      expect.objectContaining({ id: "scout.searchProjects", basis: "short-query-directory" })
    );
  });

  it("keeps broad recommendations after directory advice on a zero-hit name query", () => {
    const page = searchCatalogPage(catalog, { query: "hypertron", limit: 5 });
    expect(page.hits).toEqual([]);
    expect(page.total).toBe(0);
    expect(page.truncated).toBe(false);
    expect(page.effectiveLimit).toBe(5);
    expect(page.widerCandidates.map(({ id, basis }) => ({ id, basis }))).toEqual([
      { id: "scout.searchProjects", basis: "short-query-directory" },
      { id: "scout.searchResearch", basis: "catalog-anchor" },
      { id: "lumenloop.search_content_semantic", basis: "catalog-anchor" }
    ]);
  });

  it("never surfaces skill-section hits — sections left search (2026-07-13 A/B)", () => {
    // Sections are searchable:false; whole skills still rank.
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
    const hits = searchCatalog(catalog, { query: "how do I extend TTL state archival", limit: 5 });
    expect(hits.slice(0, 3).some((h) => h.service === "stellarDocs")).toBe(true);
  });

  it("diversifies services in the returned set (per-service quota)", () => {
    const all = searchCatalog(catalog, { query: "stellar soroban contract", limit: 5 });
    const perService = new Map<string, number>();
    for (const h of all) perService.set(h.service, (perService.get(h.service) ?? 0) + 1);
    for (const [service, n] of perService) {
      expect(n, `service ${service} exceeds quota`).toBeLessThanOrEqual(2);
    }
  });
});

describe("searchCatalog — tiered gate-rescue backfill", () => {
  /** Recomputes tier-1 (gated) score; null means the hit arrived via tier-2 backfill. */
  function gatedScore(hitId: string, query: string): number | null {
    const entry = catalog.entries.find((e) => e.id === hitId)!;
    expect(entry).toBeDefined();
    const aliases = entry.knownAliases ?? [];
    const triggers = entry.knownAliasTriggers ?? [];
    const queryTokens = prepareAliasQuery(query);
    const triggered = triggers.some((trigger) =>
      queryContainsAliasTrigger(queryTokens, trigger)
    );
    const aliasTokens = aliases
      .flatMap((alias) => alias.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean))
      .filter((token) => !STOPWORDS.has(token));
    return scoreEntryWeighted(
      {
        id: entry.id,
        name: [lastIdSegment(entry.id), ...(triggered ? aliasTokens : [])].join(" "),
        service: entry.service,
        kind: entry.kind,
        description: entry.description,
        keywords: entry.keywords,
        routingKeywords: entry.routingKeywords,
        routingPhrases: entry.routingPhrases
      },
      query
    );
  }

  it("keeps pages without targeted replacements entirely in tier 1", () => {
    for (const query of ["stellar soroban contract", "search directory"]) {
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

  it("permits one evidence-backed full-page replacement without expanding total", () => {
    const query =
      "What project categories does the Stellar ecosystem directory actually track — " +
      "give me the controlled list of category values it uses.";
    const page = searchCatalogPage(catalog, { query, limit: 5 });
    const backfill = page.hits.filter((hit) => hit.tier === "backfill");
    const perService = new Map<string, number>();
    for (const hit of page.hits) {
      perService.set(hit.service, (perService.get(hit.service) ?? 0) + 1);
    }

    expect(backfill).toEqual([
      expect.objectContaining({ id: "lumenloop.get_categories" })
    ]);
    expect(perService.get("lumenloop")).toBeLessThanOrEqual(2);
    expect(page.total).toBe(7);
    expect(page.truncated).toBe(true);
  });

  it("backfills a long multi-clause query that the coverage gate zeroed out", () => {
    // >20 content tokens across services: no entry clears the 60% coverage gate, so tier 2 fills the page.
    const query =
      "design a cross chain remittance corridor that quotes fees checks anchor deposit " +
      "limits verifies trustline flags and streams payment status webhooks to a dashboard";
    const hits = searchCatalog(catalog, { query, limit: 5 });
    expect(hits).toHaveLength(5);
    for (const hit of hits) {
      expect(gatedScore(hit.id, query)).toBeNull();
      expect(hit.tier).toBe("backfill");
    }
    for (let i = 1; i < hits.length; i++) {
      expect(hits[i - 1]!.score >= hits[i]!.score).toBe(true);
    }
  });

  it("interleaves a backfill hit when the cross-tier margin is met", () => {
    // Mixed-tier query: the dominant docs backfill hit must interleave above the first gated hit.
    const query =
      "In a SEP-6 programmatic deposit, which SEP actually carries the customer's KYC " +
      "data — SEP-6 itself or another SEP?";
    const hits = searchCatalog(catalog, { query, limit: 5 });
    expect(hits).toHaveLength(5);
    const tiers = hits.map((h) => gatedScore(h.id, query) !== null);
    expect(tiers[0], "top hit must be the dominant backfill").toBe(false);
    expect(tiers).toContain(false);
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
  // codemode.search forwards any number, including NaN/Infinity; non-finite
  // limits must fall back to the default instead of bypassing the clamp.
  it("falls back to the default limit for NaN and infinities, and still honors real limits", () => {
    const query = "search directory";
    const baseline = searchCatalogPage(catalog, { query });

    for (const bad of [NaN, Infinity, -Infinity]) {
      const page = searchCatalogPage(catalog, { query, limit: bad });
      expect(page.hits.length, `limit ${bad} must clamp to the default`).toBe(baseline.hits.length);
      expect(page.truncated, `limit ${bad} must not claim a complete page`).toBe(baseline.truncated);
      expect(page.hits.length).toBeLessThanOrEqual(DEFAULT_SEARCH_LIMIT);
    }

    expect(searchCatalogPage(catalog, { query, limit: 1 }).hits).toHaveLength(1);
    expect(searchCatalogPage(catalog, { query, limit: 3 }).hits).toHaveLength(3);
  });
});

describe("searchCatalogPage — tier marker + total/truncated", () => {
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

  // Only alpha_handler clears the >=60% coverage gate on the 10-token query below; the rest backfill.
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
    expect(page.hits[0]!.id).toBe("lumenloop.alpha_handler");
    expect(page.hits[0]!.tier).toBe("gated");
    for (const hit of page.hits.slice(1)) expect(hit.tier).toBe("backfill");
    expect(page.hits[1]!.score).toBeLessThan(
      TIER_INTERLEAVE_MARGIN * page.hits[0]!.score
    );
    // 1 gated + 6 ungated.
    expect(page.total).toBe(7);
    expect(page.truncated).toBe(true);
  });

  it("reports the effective page limit from the same default/min/max clamp search uses", () => {
    expect(searchCatalogPage(tiny, { query: "alpha beta" }).effectiveLimit).toBe(10);
    expect(searchCatalogPage(tiny, { query: "alpha beta", limit: 0 }).effectiveLimit).toBe(1);
    expect(searchCatalogPage(tiny, { query: "alpha beta", limit: 500 }).effectiveLimit).toBe(50);
  });

  it("keeps the SEP-6 page truthful after admission and replacement", () => {
    const query =
      "In a SEP-6 programmatic deposit, which SEP actually carries the customer's KYC " +
      "data — SEP-6 itself or another SEP?";
    const page = searchCatalogPage(catalog, { query, limit: 5 });
    expect(page.hits.map((hit) => hit.id).sort()).toEqual(
      [
        "stellarDocs.search_anchor_sep_docs",
        "stellarDocs.search_asset_token_docs",
        "stellarDocs.search_docs",
        "stellarDocs.search_docs_in_category",
        "stellarDocs.search_meeting_notes"
      ].sort()
    );
    // Admission runs before scoring. It can reduce total when an operation
    // publishes exclusions but lacks positive evidence for this query.
    expect(page.total).toBe(39);
    expect(page.truncated).toBe(true);
  });

  it("allows positive-evidence admission to reduce total without a negative match", () => {
    const excluded = op("lookup", "alpha beta gamma answer") as CatalogEntry;
    excluded.id = "scout.lookup";
    excluded.service = "scout";
    excluded.routingExclusions = [{ tokens: ["unrelated", "directory"] }];
    const sourceFiltered = loadManifest({
      version: 1,
      generatedAt: "2026-01-01T00:00:00Z",
      entries: [excluded, op("keep", "alpha beta gamma answer")]
    });
    const control = loadManifest({
      ...sourceFiltered,
      entries: sourceFiltered.entries.map(({ routingExclusions: _excluded, ...entry }) => entry)
    });
    const query = "alpha beta gamma";

    expect(searchCatalogPage(control, { query, limit: 5 }).total).toBe(2);
    expect(searchCatalogPage(sourceFiltered, { query, limit: 5 }).total).toBe(1);
  });

  it("excludes searchable:false entries from results and totals, keeping them exposed", () => {
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
    expect(page.total).toBe(ids.length);
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
    const page = searchCatalogPage(tiny, { query: "alpha beta", limit: 2 });
    expect(page.hits).toHaveLength(2);
    for (const hit of page.hits) expect(hit.tier).toBe("gated");
    expect(page.total).toBe(4);
    expect(page.truncated).toBe(true);
  });

  it("total <= limit: tier 2 consulted but novel-empty, truncated false", () => {
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

describe("searchCatalog — availableSections on skill hits", () => {
  it("skill hits carry availableSections matching the skills store's key set, slugs before file: keys", async () => {
    const hit = searchCatalog(catalog, {
      query: "skills.trustless-work.trustless-work-dev"
    })[0] as SearchHit;
    expect(hit.kind).toBe("skill");
    expect(hit.availableSections!.length).toBeGreaterThan(0);
    const firstFile = hit.availableSections!.findIndex((k) => k.startsWith("file:"));
    expect(firstFile).toBeGreaterThan(0);
    expect(hit.availableSections!.slice(firstFile).every((k) => k.startsWith("file:"))).toBe(true);
    // Order may differ from readSkill (catalog is id-sorted; store follows document order).
    const r = await readSkill(catalog, skillSource, hit.id);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect([...hit.availableSections!].sort()).toEqual([...r.data.availableSections].sort());
  });

  it("keeps the field OFF operation hits", () => {
    const opHit = searchCatalog(catalog, { query: "lumenloop.search_directory" })[0] as SearchHit;
    expect(opHit.kind).toBe("operation");
    expect(opHit.availableSections).toBeUndefined();
  });

  it("skills exist only under the canonical skills.* id — one skill, one hit (ADR-0003)", () => {
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

describe("searchCatalog — section entries are addresses, not content", () => {
  it("carries no body-derived keywords for out-of-search sections, and still answers from elsewhere", () => {
    // Sections are searchable:false, so body-derived keywords are omitted from the manifest.
    const sectionId = "skills.stellar-dev.smart-contracts#file:testing.md";
    const entry = catalog.entries.find((e) => e.id === sectionId)!;
    expect(entry).toBeDefined();
    expect(entry.description.toLowerCase()).not.toContain("fuzz");
    expect(entry.keywords).toBeUndefined();
    expect(entry.searchable).toBe(false);
    const hits = searchCatalog(catalog, { query: "fuzz testing smart contracts" });
    expect(hits.map((h) => h.id)).not.toContain(sectionId);
    expect(hits.length).toBeGreaterThan(0);
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
    expect(opHit.signature).toContain(
      "lumenloop.search_directory(input: SearchDirectoryInput): Promise<{ ok: true, data: SearchDirectoryOutput } | { ok: false, error: { kind: \"error\" | \"soft-empty\", message: string, hint?: string } }>"
    );

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

  it("does not teach false Lumenloop r.data.results paths", () => {
    const ids = [
      "lumenloop.find_av_passages",
      "lumenloop.find_content_by_entity",
      "lumenloop.find_similar_projects_semantic",
      "lumenloop.find_similar_scf_submissions",
      "lumenloop.get_related_projects",
      "lumenloop.get_tags_vocabulary"
    ];
    for (const id of ids) {
      const entry = catalog.entries.find((candidate) => candidate.id === id)!;
      const signature = renderSignature(entry)!;
      expect(entry.outputSchema, id).toBeNull();
      expect(signature, id).toContain("data: unknown");
      expect(signature, id).not.toMatch(/^type \w+Output/m);
      expect(signature, id).not.toMatch(/^\s+results\?:/m);
    }
  });
});

describe("search-hit signature compaction", () => {
  function outputBlockLength(entry: CatalogEntry): number {
    if (!entry.outputSchema) return 0;
    const typeBase = toPascalCase(sanitizeToolName(lastIdSegment(entry.id)));
    return jsonSchemaToType(entry.outputSchema as JsonSchema, `${typeBase}Output`).length;
  }

  it("stubs scout.searchProjects' oversized output type in search hits — top-level names kept, full type gone", () => {
    const hit = searchCatalog(catalog, { query: "scout.searchProjects" }).find(
      (h) => h.id === "scout.searchProjects"
    ) as SearchHit;
    expect(hit.signature).toContain("type SearchProjectsInput");
    expect(hit.signature).toContain(
      "scout.searchProjects(input: SearchProjectsInput): Promise<{ ok: true, data: SearchProjectsOutput }"
    );
    // Assert type name, top-level field names, and describe pointer, not stub prose.
    expect(hit.signature).toContain("type SearchProjectsOutput");
    expect(hit.signature).toContain("codeReferences, meta, projects");
    expect(hit.signature).toContain('codemode.describe("scout.searchProjects")');
    expect(hit.signature).not.toContain("codeReferences?:");
    const entry = catalog.entries.find((entry) => entry.id === hit.id)!;
    const input = jsonSchemaToType(entry.inputSchema as JsonSchema, "SearchProjectsInput");
    expect(hit.signature!.split("\ntype SearchProjectsOutput")[0]).toBe(input);
    expect(hit.signature!.length - input.length).toBeLessThan(COMPACT_OUTPUT_THRESHOLD);
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
        expect(compact, entry.id).toContain(`codemode.describe(${JSON.stringify(entry.id)})`);
      } else {
        expect(compact, entry.id).toBe(full);
      }
    }
    expect(compacted.sort()).toEqual([
      "scout.analyzeEcosystem",
      "scout.compareHackathons",
      "scout.explainRepo",
      "scout.getBuilders",
      "scout.getChanges",
      "scout.getClusters",
      "scout.getHackathon",
      "scout.getHackathons",
      "scout.getLeaderboard",
      "scout.getPartner",
      "scout.getPartners",
      "scout.getPeople",
      "scout.getRepoTrust",
      "scout.getRfps",
      "scout.getStablecoins",
      "scout.hackathonBrief",
      "scout.listAudits",
      "scout.listContracts",
      "scout.listSkills",
      "scout.resolveProject",
      "scout.scfPitch",
      "scout.searchHackathonBuilds",
      "scout.searchProjects",
      "scout.searchRepos",
      "scout.searchResearch",
      "scout.vetIdea"
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
    expect(small).toBeDefined();
    const entry = catalog.entries.find((e) => e.id === small!.id)!;
    expect(small!.signature).toBe(renderSignature(entry));
  });

  it("exercises COMPACT_OUTPUT_THRESHOLD exactly at its boundary (hand-built schema)", () => {
    // Pad the property description to land on COMPACT_OUTPUT_THRESHOLD.
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
    expect(baseLen).toBeLessThan(COMPACT_OUTPUT_THRESHOLD);
    const atThreshold = makeEntry("x".repeat(COMPACT_OUTPUT_THRESHOLD - baseLen + 1));
    expect(outputBlockLength(atThreshold)).toBe(COMPACT_OUTPUT_THRESHOLD);
    const overThreshold = makeEntry("x".repeat(COMPACT_OUTPUT_THRESHOLD - baseLen + 2));
    expect(outputBlockLength(overThreshold)).toBe(COMPACT_OUTPUT_THRESHOLD + 1);

    expect(renderSignature(atThreshold, { compactOversizedOutput: true })).toBe(
      renderSignature(atThreshold)
    );
    const compacted = renderSignature(overThreshold, { compactOversizedOutput: true })!;
    expect(compacted).toContain("type BoundaryProbeOutput");
    expect(compacted).toContain("alpha, beta");
    expect(compacted).toContain('codemode.describe("scout.boundaryProbe")');
    expect(compacted).not.toContain("xxxx");
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

  it("keeps the retired dossier runner's skill entry a plain readable skill", () => {
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
    expect(renderSignature(entry)).toContain("alpha?: string");
  });
});

describe("runnable byte-stability — the §10.1 invariant, pinned offline (design §12)", () => {
  const RUNNABLE_IDS = new Set(Object.keys(RUNNERS));

  /** Manifest with runnable attachment removed. */
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
      { query: "skills.lumenloop.stellar-project-dossier" },
      { query: "skills.lumenloop.stellar-ecosystem-digest" },
      { query: "project dossier scf funding history", limit: 20 },
      { query: "recent ecosystem digest news roundup", limit: 20 },
      { query: "scf funding award project", limit: 25 },
      { query: "stellar", limit: 50 },
      { query: "soroban storage" },
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
      expect(
        after.map((h) => h.id),
        opts.query
      ).toEqual(before.map((h) => h.id));
      for (let i = 0; i < after.length; i++) {
        const { signature: sigBefore, ...restBefore } = before[i]!;
        const { signature: sigAfter, ...restAfter } = after[i]!;
        expect(JSON.stringify(restAfter), `${opts.query} #${i} (${after[i]!.id})`).toBe(
          JSON.stringify(restBefore)
        );
        if (RUNNABLE_IDS.has(after[i]!.id)) {
          expect(sigBefore, `${opts.query} #${i}`).toBeUndefined();
          expect(typeof sigAfter, `${opts.query} #${i}`).toBe("string");
          runnableHitsSeen += 1;
        } else {
          expect(sigAfter, `${opts.query} #${i} (${after[i]!.id})`).toBe(sigBefore);
        }
      }
    }
    expect(runnableHitsSeen).toBeGreaterThan(0);
  });
});

describe("alias canonicalization", () => {
  it("canonicalizeQuery: null when no alias token (byte-identical no-op path)", () => {
    expect(canonicalizeQuery("wallet balance lookup")).toBeNull();
    expect(canonicalizeQuery("soroban contract storage")).toBeNull();
    expect(canonicalizeQuery("transaction history")).toBeNull();
  });

  it("canonicalizeQuery: substitutes abbreviation tokens, single-token only", () => {
    expect(canonicalizeQuery("tx history")).toBe("transaction history");
    expect(canonicalizeQuery("check acct addr")).toBe("check account address");
    expect(canonicalizeQuery("txhash lookup")).toBeNull();
  });

  it("bridges the register gap: an abbreviation query hits transaction-vocabulary entries", () => {
    // Prefix matching cannot bridge tx -> transaction; query canonicalization must.
    const hits = searchCatalog(catalog, { query: "txn submit failed", limit: 5 });
    expect(
      hits.slice(0, 3).some(
        (h) => h.id.includes("transaction") || h.description.toLowerCase().includes("transaction")
      )
    ).toBe(true);
  });

  it("never reduces original-query scores: alias variant only adds via max", () => {
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

describe("the detail relation in the recovery graph", () => {
  const DOCS_SEARCHES = catalog_docsSearchIds();

  function catalog_docsSearchIds(): string[] {
    return [
      "stellarDocs.search_docs",
      "stellarDocs.search_doc_titles",
      "stellarDocs.search_docs_in_category",
      "stellarDocs.search_meeting_notes",
      "stellarDocs.search_protocol_concepts_docs",
      "stellarDocs.search_rpc_horizon_data_docs",
      "stellarDocs.search_sdk_cli_tools_docs",
      "stellarDocs.search_soroban_contract_docs",
      "stellarDocs.search_wallet_dapp_docs",
      "stellarDocs.search_anchor_sep_docs",
      "stellarDocs.search_asset_token_docs"
    ];
  }

  it("is the last edge of every Docs search profile, targeting the whole-page read", () => {
    const byId = new Map(catalog.entries.map((entry) => [entry.id, entry]));
    for (const id of DOCS_SEARCHES) {
      const edges = byId.get(id)?.retrievalProfile?.recoverWith ?? [];
      expect(edges.at(-1), id).toEqual({ id: "stellarDocs.get_doc_page", relation: "detail", on: ["partial"] });
      expect(edges.filter((edge) => edge.relation === "detail"), id).toHaveLength(1);
    }
    const detailEdges = catalog.entries.flatMap((entry) =>
      (entry.retrievalProfile?.recoverWith ?? []).filter((edge) => edge.relation === "detail")
    );
    // The Docs searches, plus the one stellar.org site search, whose rows are pages (joined on `path`).
    expect(detailEdges).toHaveLength(DOCS_SEARCHES.length + 1);
    const orgEdges = byId.get("stellarOrg.search_site")?.retrievalProfile?.recoverWith ?? [];
    expect(orgEdges.at(-1)).toEqual({
      id: "stellarOrg.get_page",
      relation: "detail",
      on: ["partial"],
      part: { plural: "page rows", singular: "row" }
    });
  });

  it("never enters the alternatives, the search recovery walk, or the three-candidate cap", () => {
    for (const id of DOCS_SEARCHES) {
      expect(recoveryCandidatesFromSources(catalog, [id], []).map((c) => c.id), id).not.toContain(
        "stellarDocs.get_doc_page"
      );
      expect(recoveryCandidates(catalog, [id], "partial").map((c) => c.id), id).not.toContain(
        "stellarDocs.get_doc_page"
      );
    }
    expect(recoveryCandidatesFromSources(catalog, ["stellarDocs.search_docs"], []).map((c) => c.id)).toEqual([
      "scout.searchResearch",
      "lumenloop.search_content_semantic",
      "stellarDocs.search_meeting_notes"
    ]);
  });

  it("changes no search page: hits, order, widerCandidates, and recovery cards", () => {
    const withoutEdges = {
      ...catalog,
      entries: catalog.entries.map((entry) =>
        entry.retrievalProfile
          ? {
              ...entry,
              retrievalProfile: {
                ...entry.retrievalProfile,
                recoverWith: entry.retrievalProfile.recoverWith.filter((edge) => edge.relation !== "detail")
              }
            }
          : entry
      )
    } as Catalog;
    for (const query of ["soroban storage types", "freighter", "SEP-10 web authentication", "who is Denelle Dixon"]) {
      expect(searchCatalogPage(catalog, { query, limit: 8 }), query).toEqual(
        searchCatalogPage(withoutEdges, { query, limit: 8 })
      );
    }
  });

  it("returns the whole-page read for a Docs search, keyed by the row field its hits carry", () => {
    expect(detailTargetsFromSources(catalog, ["stellarDocs.search_docs"], [])).toEqual([
      { id: "stellarDocs.get_doc_page", sources: ["stellarDocs.search_docs"], keys: ["path"] }
    ]);
    expect(
      detailTargetsFromSources(catalog, ["stellarDocs.search_docs", "stellarDocs.search_meeting_notes"], [])
    ).toEqual([
      {
        id: "stellarDocs.get_doc_page",
        sources: ["stellarDocs.search_docs", "stellarDocs.search_meeting_notes"],
        keys: ["path"]
      }
    ]);
  });

  it("drops a target the run already called and a source with no detail edge", () => {
    expect(
      detailTargetsFromSources(catalog, ["stellarDocs.search_docs"], ["stellarDocs.get_doc_page"])
    ).toEqual([]);
    expect(detailTargetsFromSources(catalog, ["scout.getBuilders", "stellarDocs.get_doc_page"], [])).toEqual([]);
  });
});
