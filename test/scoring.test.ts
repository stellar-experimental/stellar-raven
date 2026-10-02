/**
 * Scoring-layer contracts (src/catalog/scoring.ts).
 *
 * 1. Replica drift guard: scoring.ts's `scoreEntryUngated` is a
 *    line-for-line copy of the vendored scorer with EXACTLY ONE difference —
 *    the coverage gate is absent. That gives a total-equality invariant this
 *    suite pins:
 *
 *      ∀ (entry, query): scoreEntry(e, q) !== null
 *                        ⇒ scoreEntryUngated(e, q) === scoreEntry(e, q)
 *
 *    If @cloudflare/codemode is ever re-vendored with changed field weights,
 *    tokenization, phrase/prefix multipliers, or bonuses, every gate-passing
 *    comparison here fails loudly instead of tier 2 silently desyncing from
 *    tier 1. The full re-vendor checklist lives beside the replica in
 *    src/catalog/scoring.ts.
 *
 * 2. Keyword blends (levers 4 + 7): how `scoreEntryWeighted` folds the
 *    build-time `keywords` / `routingKeywords` fields into the vendor score.
 *    (How those fields are DISTILLED at build time is pinned in
 *    test/extract-keywords.test.ts.)
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { scoreEntry, type ScorableEntry } from "../src/catalog/vendor/search-scoring.ts";
import {
  prepareScoringQuery,
  scoreEntryUngated,
  scoreEntryWeighted,
  scoreEntryWeightedUngated
} from "../src/catalog/scoring.ts";
import { loadManifest, searchCatalog } from "../src/catalog/search.ts";
import { lastIdSegment } from "../src/catalog/id.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = loadManifest(
  JSON.parse(readFileSync(join(ROOT, "catalog", "manifest.json"), "utf8"))
);

/** The same scorable projection searchCatalogPage feeds the scorers (sans keywords — both raw scorers ignore them). */
const scorables: ScorableEntry[] = catalog.entries.map((e) => ({
  id: e.id,
  name: lastIdSegment(e.id),
  service: e.service,
  kind: e.kind,
  description: e.description
}));

/**
 * Deliberately diverse battery: short/long, phrases, exact ids, abbreviation
 * register, filler-heavy natural language — chosen to exercise every scoring
 * branch (exact/prefix/phrase/token/prefix-overlap/substring matches, all
 * coverage-bonus tiers, first-token and exact-id bonuses) across the real
 * manifest, not to encode any routing expectation.
 */
const QUERY_BATTERY = [
  "wallet",
  "soroban contract storage",
  "list validators",
  "search projects",
  "lumenloop.get_project",
  "get_project",
  "stellar docs search",
  "transaction history for an address",
  "account trustlines",
  "how do I deploy a soroban smart contract to testnet with the CLI",
  "is there a live funded project doing cross border remittances on stellar",
  "skill sections for agentic payments",
  "scout",
  "anchor deposit SEP-24 interactive flow stuck pending trust",
  "x"
];

describe("source-witnessed acronym rescue", () => {
  const entry: ScorableEntry = {
    id: "svc.lookup",
    name: "lookup",
    service: "svc",
    kind: "operation",
    description: "DNS registry"
  };

  it.each([
    ["domain name system", "DNS"],
    ["uniform resource locator", "URL"],
    ["remote procedure call", "RPC"],
    ["model context protocol", "MCP"]
  ])("rejects pure %s collapse but accepts matching context", (query, acronym) => {
    const source = { ...entry, description: `${acronym} registry` };
    expect(scoreEntry(source, query)).toBeNull();
    expect(scoreEntryWeighted(source, query)).toBeNull();
    expect(scoreEntryWeighted(source, `${query} registry`)).toBe(
      scoreEntryWeighted(source, `${acronym} registry`)
    );
    expect(scoreEntryWeighted(source, `${query} unrelated`)).toBeNull();
  });

  it.each(["dns registry", "DNSSEC registry", "ADNS registry", "DnsRegistry"])(
    "does not infer an acronym from %s", (description) => {
      expect(scoreEntryWeighted({ ...entry, description }, "domain name system registry")).toBeNull();
    }
  );

  it("does not admit an acronym supplied only by derived keywords", () => {
    expect(scoreEntryWeighted({
      ...entry, description: "registry", keywords: ["DNS"], routingKeywords: ["DNS"]
    }, "domain name system registry")).toBeNull();
  });

  it("does not join through stopwords or numbers, or reduce two-word spans", () => {
    for (const query of ["domain of name system", "domain 2 name system", "domain system"]) {
      expect(scoreEntryWeighted(entry, query), query).toBeNull();
    }
  });

  it("preserves scores that already have sufficient lexical coverage", () => {
    const source = { ...entry, description: "Domain name system and DNS registry" };
    const query = "domain name system";
    expect(scoreEntry(source, query)).not.toBeNull();
    expect(scoreEntryWeighted(source, query)).toBe(scoreEntry(source, query));
    expect(scoreEntryWeightedUngated(source, query)).toBe(scoreEntryUngated(source, query));
  });

  it("combines ordinary token aliases with acronym rescue", () => {
    const source = { ...entry, description: "DNS account" };
    const query = "domain name system acct";
    expect(scoreEntryWeighted(source, query)).toBe(scoreEntryWeighted(source, "DNS account"));
  });

  it("preserves ungated scores when acronym forms exist", () => {
    const query = "domain name system registry";
    const prepared = prepareScoringQuery(query);
    expect(scoreEntryWeighted(entry, query, prepared)).toBe(scoreEntryWeighted(entry, query));
    expect(scoreEntryWeighted(entry, query, prepared)).not.toBeNull();
    expect(scoreEntryWeightedUngated(entry, query, prepared)).toBe(
      scoreEntryWeightedUngated(entry, query, { ...prepared, acronyms: [] })
    );
  });

  it.each([
    ["network operations team", "NOT"],
    ["offer new endpoints", "ONE"],
    ["account ledger lookup", "ALL"]
  ])("rejects the ordinary English shout-word %s", (query, word) => {
    const source = { ...entry, description: `${word} registry` };
    expect(scoreEntryWeighted(source, `${query} registry`)).toBeNull();
  });

  it("bounds acronym preparation for long letter-only queries", () => {
    const query = Array(120).fill("alpha bravo charlie delta echo foxtrot").join(" ");
    expect(prepareScoringQuery(query).acronyms).toHaveLength(32);
  });

  it("does not promote SEP documentation for unrelated payment initials", () => {
    const query = "send every payment";
    const hits = searchCatalog(catalog, { query, limit: 5 });
    expect(hits[0]?.id).not.toBe("stellarDocs.search_anchor_sep_docs");
    const source = scorables.find((e) => e.id === "stellarDocs.search_anchor_sep_docs")!;
    expect(scoreEntryWeighted(source, query)).toBeNull();
  });

  it.each([
    ["stella", "stellarDocs.search_anchor_sep_docs"],
    ["searc", "stellarDocs.search_anchor_sep_docs"],
    ["toke", "stellarDocs.search_asset_token_docs"]
  ])("rejects prefix-only acronym context %s", (context, id) => {
    const query = `send every payment ${context}`;
    const source = scorables.find((e) => e.id === id)!;
    expect(scoreEntryWeighted(source, query)).toBeNull();
    expect(searchCatalog(catalog, { query, limit: 5 })[0]?.id).not.toBe(id);
  });

  it("keeps exact canonical context matches", () => {
    const source = { ...entry, description: "DNS anchors" };
    expect(scoreEntryWeighted(source, "domain name system anchor")).not.toBeNull();
  });

  it("does not promote SAME as an acronym", () => {
    const query = "send alpha model every lumenloop";
    const hits = searchCatalog(catalog, { query, limit: 5 });
    expect(hits[0]?.id).not.toBe("lumenloop.list_documents");
    expect(hits.some((hit) => hit.id === "lumenloop.list_documents" && hit.tier === "gated")).toBe(false);
  });

  it.each(["description", "name"])(
    "uses lowercase %s evidence from the whole catalog before service filters", (field) => {
      const template = catalog.entries.find((e) => e.kind === "operation")!;
      const source: typeof template = {
        ...template, id: "scout.lookup", service: "scout", description: "BRAVE registry",
        keywords: [], routingKeywords: [], routingPhrases: []
      };
      const query = "bring red apple very early registry";
      const isolated = { ...catalog, entries: [source] };
      expect(searchCatalog(isolated, { query })[0]?.tier).toBe("gated");
      const ordinary: typeof template = {
        ...source, id: field === "name" ? "lumenloop.brave" : "lumenloop.lookup", service: "lumenloop",
        description: field === "description" ? "a brave example" : "an example"
      };
      const combined = { ...catalog, entries: [source, ordinary] };
      const hits = searchCatalog(combined, { query, service: "scout" });
      expect(hits[0]?.id).toBe(source.id);
      expect(hits[0]?.tier).toBe("backfill");
      // Cached vocabulary belongs to its catalog, not to a process-wide union.
      expect(searchCatalog(isolated, { query })[0]?.tier).toBe("gated");
    }
  );

  it("preserves the SAC entry's stronger ungated score", () => {
    const cases = JSON.parse(readFileSync(join(ROOT, "eval/routing-cases.json"), "utf8"));
    const query: string = cases.cases.find((c: { id: string }) => c.id === "q-soroban-sac-vs-custom-token").question;
    const sourceEntry = catalog.entries.find((e) => e.id === "stellarDocs.search_asset_token_docs")!;
    const source = { ...sourceEntry, name: lastIdSegment(sourceEntry.id) };
    expect(scoreEntryWeightedUngated(source, query)).toBe(812);
    expect(scoreEntryWeighted(source, query)).toBeNull();
  });

  it("returns skill discovery for the expanded protocol without an article match", () => {
    const query = "Are there any model context protocol skills for Stellar?";
    for (const options of [{ query, limit: 5 }, { query }]) {
      const hits = searchCatalog(catalog, options);
      expect(hits.slice(0, 5).some((hit) => hit.id === "scout.listSkills")).toBe(true);
    }
    const target = scorables.find((source) => source.id === "scout.listSkills")!;
    expect(scoreEntryWeighted(target, query)).not.toBeNull();
    expect(scoreEntryWeighted(target, query)).toBe(
      scoreEntryWeighted(target, "Are there any MCP skills for Stellar?")
    );
    const withoutArticles = {
      ...target, description: target.description.replace(/\b(?:a|an)\b/gi, "")
    };
    expect(scoreEntryWeighted(withoutArticles, query)).not.toBeNull();
  });
});

describe("ungated replica ⇔ vendored scorer drift guard", () => {
  it("scores identically to the vendor on every gate-passing (entry, query) pair", () => {
    let gatePassing = 0;
    let gateRescued = 0; // vendor null, replica non-null — the replica's raison d'être
    for (const query of QUERY_BATTERY) {
      for (const entry of scorables) {
        const vendor = scoreEntry(entry, query);
        const replica = scoreEntryUngated(entry, query);
        if (vendor !== null) {
          gatePassing++;
          expect(replica, `${entry.id} × "${query}"`).toBe(vendor);
        } else if (replica !== null) {
          gateRescued++;
        }
      }
    }
    // Anti-vacuity: the sweep must actually exercise both regimes, or a
    // battery/manifest drift could turn this suite into a no-op.
    expect(gatePassing).toBeGreaterThan(100);
    expect(gateRescued).toBeGreaterThan(100);
  });

  it("differs from the vendor ONLY where the coverage gate fires (fixture per branch)", () => {
    const entry: ScorableEntry = {
      id: "svc.fetch_thing",
      name: "fetch_thing",
      service: "svc",
      kind: "operation",
      description: "Fetch a thing by identifier from the widget registry"
    };
    // Exact-name query: passes the gate → identical scores (exact/prefix/
    // first-token/exact-name bonuses all in play).
    expect(scoreEntry(entry, "fetch_thing")).not.toBeNull();
    expect(scoreEntryUngated(entry, "fetch_thing")).toBe(scoreEntry(entry, "fetch_thing"));
    // Exact-phrase escape: multi-token phrase present verbatim passes the
    // gate even at partial coverage → identical.
    const phrase = "widget registry";
    expect(scoreEntry(entry, phrase)).not.toBeNull();
    expect(scoreEntryUngated(entry, phrase)).toBe(scoreEntry(entry, phrase));
    // Gate-failing: 2-token query with one unmatched token (≤2 tokens needs
    // 100% coverage) → vendor null, replica scores the partial match.
    const partial = "fetch zzzunmatchedzzz";
    expect(scoreEntry(entry, partial)).toBeNull();
    expect(scoreEntryUngated(entry, partial)).not.toBeNull();
    // Long query under 60% coverage, no phrase → vendor null, replica scores.
    const dilute = "fetch one of those things please with extra unrelated vocabulary everywhere";
    expect(scoreEntry(entry, dilute)).toBeNull();
    expect(scoreEntryUngated(entry, dilute)).not.toBeNull();
    // Zero matched tokens → BOTH null (the replica keeps that vendor rule).
    expect(scoreEntry(entry, "qqq www eee")).toBeNull();
    expect(scoreEntryUngated(entry, "qqq www eee")).toBeNull();
  });
});

describe("scoreEntryWeighted — low-weight keyword blend (lever 4)", () => {
  const base = {
    id: "skills.demo.widgets#tuning",
    name: "widgets",
    service: "skills",
    kind: "skill-section",
    description: "Tuning — how to tune widget output"
  };

  it("is a no-op for entries without keywords (undefined or empty)", () => {
    const q = "tune widget output";
    expect(scoreEntryWeighted({ ...base, keywords: [] }, q)).toBe(scoreEntryWeighted(base, q));
    expect(scoreEntryWeighted({ ...base, keywords: undefined }, q)).toBe(
      scoreEntryWeighted(base, q)
    );
  });

  it("rescues an entry only matchable via keywords, at a damped score", () => {
    const q = "widgets frobnicate flag";
    const without = scoreEntryWeighted(base, q);
    expect(without).toBeNull(); // coverage-gated: body terms invisible
    const withKw = scoreEntryWeighted({ ...base, keywords: ["frobnicate", "flag"] }, q);
    expect(withKw).not.toBeNull();
    // Low-weight: the same vocabulary carried in the DESCRIPTION (full
    // description weight) must outscore its keyword-carried form.
    const inDescription = scoreEntryWeighted(
      { ...base, description: `${base.description} frobnicate flag` },
      q
    );
    expect(withKw!).toBeLessThan(inDescription!);
  });

  it("never lowers a score that already passed without keywords", () => {
    const q = "tune widget output";
    const plain = scoreEntryWeighted(base, q)!;
    const withKw = scoreEntryWeighted({ ...base, keywords: ["frobnicate"] }, q)!;
    expect(withKw).toBeGreaterThanOrEqual(plain);
  });
});

describe("scoreEntryWeighted — routing-keyword blend (lever 7)", () => {
  const op = {
    id: "scout.getBuilders",
    name: "getBuilders",
    service: "scout",
    kind: "operation",
    description: "Search Stellar builders. The Stellar PEOPLE directory."
  };

  it("is a no-op for entries without routingKeywords (undefined or empty)", () => {
    const q = "search stellar builders directory";
    expect(scoreEntryWeighted({ ...op, routingKeywords: [] }, q)).toBe(scoreEntryWeighted(op, q));
    expect(scoreEntryWeighted({ ...op, routingKeywords: undefined }, q)).toBe(
      scoreEntryWeighted(op, q)
    );
  });

  it("weights curated routing vocabulary above lever-4 keywords, at most description weight", () => {
    const q = "builders recruiting latam";
    const viaKeywords = scoreEntryWeighted({ ...op, keywords: ["recruiting", "latam"] }, q)!;
    const viaRouting = scoreEntryWeighted({
      ...op,
      routingKeywords: ["recruiting", "latam"],
      routingPhrases: [{ field: "useWhen", tokens: ["recruiting", "latam"] }]
    }, q)!;
    const viaDescription = scoreEntryWeighted(
      { ...op, description: `${op.description} recruiting latam` },
      q
    )!;
    // The whole point of the field: hotter than schema-shrapnel keywords…
    expect(viaRouting).toBeGreaterThan(viaKeywords);
    // …but never hotter than the same vocabulary carried in the description
    // (equal at the current blend of 1.0).
    expect(viaRouting).toBeLessThanOrEqual(viaDescription);
  });

  it("rescues a gate-failed entry via routing vocabulary alone", () => {
    const q = "widgets recruiting latam hiring"; // no token overlaps op's scored fields enough
    const without = scoreEntryWeighted(op, q);
    expect(without).toBeNull();
    const withRouting = scoreEntryWeighted(
      {
        ...op,
        routingKeywords: ["recruiting", "latam", "hiring", "widgets"],
        routingPhrases: [{
          field: "useWhen",
          tokens: ["recruiting", "latam", "hiring", "widgets"]
        }]
      },
      q
    );
    expect(withRouting).not.toBeNull();
  });

  it("does not rescue routing vocabulary split across incoherent phrases", () => {
    const q = "widgets recruiting latam hiring";
    expect(scoreEntryWeighted({
      ...op,
      routingKeywords: ["recruiting", "latam", "hiring", "widgets"],
      routingPhrases: [
        { field: "useWhen", tokens: ["recruiting", "builders"] },
        { field: "keywords", tokens: ["latam", "region"] }
      ]
    }, q)).toBeNull();
  });

  it("blends both keyword fields additively without lowering the base", () => {
    const q = "search stellar builders recruiting flag";
    const plain = scoreEntryWeighted(op, q)!;
    const both = scoreEntryWeighted(
      { ...op, keywords: ["flag"], routingKeywords: ["recruiting"] },
      q
    )!;
    const keywordsOnly = scoreEntryWeighted({ ...op, keywords: ["flag"] }, q)!;
    const routingOnly = scoreEntryWeighted({ ...op, routingKeywords: ["recruiting"] }, q)!;
    expect(both).toBeGreaterThanOrEqual(Math.max(keywordsOnly, routingOnly));
    expect(both).toBeGreaterThanOrEqual(plain);
  });
});
