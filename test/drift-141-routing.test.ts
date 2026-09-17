import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, isAbsolute, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadManifest,
  searchCatalog,
  searchCatalogPage,
  type Catalog
} from "../src/catalog/search.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const experimentalManifest = process.env.RAVEN_ROUTING_MANIFEST;
const manifestPath = experimentalManifest
  ? (isAbsolute(experimentalManifest) ? experimentalManifest : join(ROOT, experimentalManifest))
  : join(ROOT, "catalog", "manifest.json");
// Load during collection so test activation can depend on the exposed surface.
const catalog: Catalog = loadManifest(JSON.parse(readFileSync(manifestPath, "utf8")));
const exposesRwa = catalog.entries.some((entry) => entry.id === "scout.getRwaAssets");

function ids(query: string): string[] {
  return searchCatalog(catalog, { query, limit: 5 }).map((hit) => hit.id);
}

describe("issue #141 routing acceptance", () => {
  it("keeps the eight attributed rows clean", () => {
    const rows = [
      [
        "What happened in the YieldBlox/Reflector oracle-manipulation incident, roughly how much was lost/recovered, and what are the design lessons?",
        ["scout.searchResearch"]
      ],
      [
        "Has anything like tokenized real-world assets or on-chain funds been funded through the SCF?",
        ["scout.getRwaAssets", "lumenloop.find_similar_scf_submissions"]
      ],
      [
        "List the Stellar network passphrases for the public network, testnet, and futurenet — what is the exact passphrase string for each?",
        ["stellarDocs.search_protocol_concepts_docs"]
      ],
      ["How do I create my first Soroban smart contract?", ["skills.stellar-dev.smart-contracts"]],
      [
        "Does Stellar execute smart-contract transactions in parallel, and when did that capability ship?",
        ["stellarDocs.search_docs"]
      ],
      [
        "Is reentrancy a concern in Soroban smart contracts the way it is on Ethereum?",
        ["stellarDocs.search_soroban_contract_docs"]
      ],
      [
        "How does account merge work, what must I clear first, and can I use it to reclaim locked base-reserve XLM?",
        ["stellarDocs.search_docs_in_category"]
      ],
      [
        "Since XLM has no native protocol staking, how can I build a staking or yield feature for my own Soroban token?",
        ["stellarDocs.search_asset_token_docs"]
      ]
    ] as const;

    for (const [query, alternatives] of rows) {
      const ranked = ids(query);
      expect(alternatives.some((expected) => ranked.includes(expected)), query).toBe(true);
    }
  });

  it.each(["through", "network", "each", "walk through"])(
    "does not route searchResearch from generic wording: %s",
    (query) => expect(ids(query)).not.toContain("scout.searchResearch")
  );

  it("requires repository intent for explainRepo", () => {
    expect(ids("contract")).not.toContain("scout.explainRepo");
    expect(ids("explain the contract repository code")).toContain("scout.explainRepo");
  });

  it("keeps account-merge documentation above hackathonBrief", () => {
    const ranked = ids(
      "How does account merge work, what must I clear first, and can I use it to reclaim locked base-reserve XLM?"
    );
    expect(ranked.indexOf("stellarDocs.search_docs_in_category")).toBeGreaterThanOrEqual(0);
    expect(ranked.indexOf("scout.hackathonBrief")).toBe(-1);
  });

  it("keeps a strong ungated Docs result on a full page", () => {
    expect(ids(
      "Since XLM has no native protocol staking, how can I build a staking or yield feature for my own Soroban token?"
    )).toContain("stellarDocs.search_asset_token_docs");
  });

  it("keeps the leaderboard and RFP improvements", () => {
    expect(ids("top projects by GitHub activity")).toContain("scout.getLeaderboard");
    expect(ids(
      "Is there an open SCF RFP for developer tooling or indexing infrastructure I could build against?"
    )).toContain("scout.getRfps");
  });

  it.each([
    "How does SCF community voting work — what is Neural Quorum Governance and who can vote?",
    "Research SCF neural quorum governance and community vote mechanics.",
    "Find cited SCF research about neural quorum governance.",
    "What does the SCF handbook say about neural quorum governance?"
  ])("admits dense exact routing vocabulary: %s", (query) => {
    expect(ids(query)).toContain("scout.searchResearch");
  });

  it.each([
    "SCF community funding",
    "How do I deploy a Soroban contract?",
    "Rank GitHub source code projects by quality."
  ])("does not admit broad research from weak or excluded evidence: %s", (query) => {
    expect(ids(query)).not.toContain("scout.searchResearch");
  });

  it("does not admit an excluded operation with zero enum-property witnesses", () => {
    expect(ids("regional services directory")).not.toContain("scout.getPartners");
  });

  it("does not admit an excluded operation with one enum-property witness", () => {
    expect(ids("LatAm services")).not.toContain("scout.getPartners");
  });

  it("admits complete enum values from two distinct input properties", () => {
    expect(ids("LatAm asset issuers services")).toContain("scout.getPartners");
  });

  it("matches a multi-token enum value and a compact enum alias", () => {
    expect(ids("LatAm asset issuer services")).toContain("scout.getPartners");
  });

  it("lets a two-token notFor match reject before enum admission", () => {
    expect(ids("projects built by LatAm asset issuers"))
      .not.toContain("scout.getPartners");
  });

  it("does not count repeated enum evidence from one property twice", () => {
    expect(ids("LatAm and Europe services")).not.toContain("scout.getPartners");
  });

  it("does not count an incomplete multi-token enum value", () => {
    expect(ids("LatAm asset services")).not.toContain("scout.getPartners");
  });

  it.each([
    "What project categories does the Stellar ecosystem directory actually track — give me the controlled list of category values it uses.",
    "ecosystem project category filter",
    "directory project categories list"
  ])("keeps controlled vocabulary visible: %s", (query) => {
    expect(ids(query)).toContain("lumenloop.get_categories");
  });

  it("applies the vocabulary rule to another directory field", () => {
    expect(ids("List the exact region values allowed by the project directory."))
      .toContain("lumenloop.get_regions");
  });

  it("does not replace project search without vocabulary intent", () => {
    expect(ids("Show infrastructure category projects"))
      .not.toContain("lumenloop.get_categories");
  });

  it("keeps RWA excluded from the accepted-policy manifest", () => {
    if (experimentalManifest) return;
    expect(catalog.entries.some((entry) => entry.id === "scout.getRwaAssets")).toBe(false);
  });

  it.runIf(exposesRwa)("separates RWA discovery from implementation", () => {
    for (const query of [
      "Which tokenized real-world assets are live on Stellar?",
      "Show verified tokenized treasury funds and their issuers on Stellar.",
      "Are tokenized bonds and real estate assets live on Stellar?",
      "Is Franklin Templeton BENJI actually issued on Stellar?"
    ]) {
      expect(ids(query), query).toContain("scout.getRwaAssets");
    }
    for (const query of [
      "How do I get test XLM from Friendbot?",
      "What is Stellar RPC?",
      "How can I reduce a Soroban WASM binary size?",
      "How do I simulate a transaction?",
      "How do I fetch account balances?",
      "How do I create and issue a custom Stellar asset?",
      "How do I build a tokenization contract on Stellar?",
      "Walk me through issuing a new custom token on Stellar from scratch."
    ]) {
      expect(ids(query), query).not.toContain("scout.getRwaAssets");
    }
  });

  it.runIf(exposesRwa).each([
    "Simulate a transfer of a tokenized bond through Stellar RPC.",
    "How do I read a wallet balance for tokenized treasury assets?",
    "As a Stellar asset issuer, can I charge transfer fees, cap supply, or freeze a holder, and what is actually possible at the protocol level?"
  ])("keeps mixed implementation intent out of RWA discovery: %s", (query) => {
    expect(ids(query)).not.toContain("scout.getRwaAssets");
  });

  it("keeps fresh intent controls separate", () => {
    expect(ids("Which verified treasury tokens exist on Stellar today?"))
      .not.toContain("scout.explainRepo");
    expect(ids("Show the permitted region vocabulary before I filter the directory."))
      .toContain("lumenloop.get_regions");
    expect(ids("Help me develop a contract project"))
      .not.toContain("scout.explainRepo");
  });

  it("keeps a negated source modifier from rejecting stablecoin discovery", () => {
    expect(ids("Which stablecoins are issued or live on Stellar?")[0])
      .toBe("scout.getStablecoins");
    expect(ids("Which fiat-pegged stablecoins are issued on Stellar?")[0])
      .toBe("scout.getStablecoins");
    expect(ids("Which stablecoins issued assets?"))
      .toContain("scout.getStablecoins");
    expect(ids("Which stablecoins are issued as Stellar assets?"))
      .toContain("scout.getStablecoins");
    expect(ids("Which non-stablecoin issued assets exist?"))
      .not.toContain("scout.getStablecoins");
    expect(ids("Which non-stablecoin governance tokens are issued on Stellar?"))
      .not.toContain("scout.getStablecoins");
    expect(ids("List utility tokens issued on Stellar that are not stablecoins."))
      .not.toContain("scout.getStablecoins");
  });

  it.each([
    "soroswap compared with other stellar dexes",
    "SOROSWAP compared with other Stellar DEXes",
    "Soroswap: how does this Stellar DEX differ?"
  ])("admits directory lookup from positive phrase evidence without case dependence: %s", (query) => {
    expect(ids(query)).toContain("scout.searchProjects");
  });

  it("does not turn a named implementation question into directory lookup", () => {
    expect(ids("How do I use Soroswap SDK bindings?"))
      .not.toContain("scout.searchProjects");
  });

  it.each([
    "What's Blend's TVL today and how has it trended this quarter?",
    "Show Blend current TVL trend for this quarter.",
    "How has Blend TVL changed recently, and what is it today?"
  ])("places a selected dated semantic lane first for multi-token freshness: %s", (query) => {
    expect(ids(query)[0]).toBe("lumenloop.search_content_semantic");
  });

  it.each([
    ["What is Stellar RPC?", "stellarDocs.search_rpc_horizon_data_docs"],
    ["How do I use Stellar RPC to simulate a transaction?", "stellarDocs.search_rpc_horizon_data_docs"],
    ["How do I issue USDC on Stellar?", "stellarDocs.search_asset_token_docs"],
    ["What is the current Soroban CLI version today?", "stellarDocs.search_soroban_contract_docs"],
    ["What is the latest SEP this quarter?", "stellarDocs.search_anchor_sep_docs"]
  ])("keeps technical intent ahead of unrelated directory search: %s", (query, expectedFirst) => {
    const ranked = ids(query);
    expect(ranked[0]).toBe(expectedFirst);
    expect(ranked).not.toContain("scout.searchProjects");
  });

  it("keeps exact operation identities searchable", () => {
    expect(ids("scout.explainRepo")[0]).toBe("scout.explainRepo");
    expect(ids("scout.searchResearch")[0]).toBe("scout.searchResearch");
  });

  it("keeps the full-page total tied to the gated pool after a targeted admission", () => {
    const page = searchCatalogPage(catalog, {
      query: "What project categories does the Stellar ecosystem directory actually track — give me the controlled list of category values it uses.",
      limit: 5
    });
    expect(page.hits).toContainEqual(expect.objectContaining({
      id: "lumenloop.get_categories",
      tier: "backfill"
    }));
    expect(page.total).toBe(6);
    expect(page.truncated).toBe(true);
  });
});

describe("directory admission is independent of source field placement", () => {
  type Placement = "examples" | "purpose" | "keywords";
  const provenance = { source: "test://synthetic", fetchedAt: "2026-01-01T00:00:00Z" };

  // Each domain places an entity token found only in that entry in useWhen and
  // exampleQuestions. The purpose and keywords placements add the same token
  // as a separate phrase with no other query token, so phrase coverage stays
  // equal. Only the source field that carries the entity changes.
  const domains = [
    {
      id: "scout.findProjectListings",
      entity: "quillbridge",
      description: "Overview of listed projects by dex or lending type.",
      property: "type",
      values: ["dex", "lending"],
      positive: "quillbridge listing overview",
      unrelated: "zephyrine dex overview",
      enumOnly: "dex overview",
      context: "overview",
      phraseTokens: ["listing", "summary"]
    },
    {
      id: "scout.findBuilderProfiles",
      entity: "marisol",
      description: "Mentor profiles for latam and europe builders.",
      property: "region",
      values: ["latam", "europe"],
      positive: "marisol cohort mentor",
      unrelated: "oksana latam mentor",
      enumOnly: "latam mentor",
      context: "mentor",
      phraseTokens: ["cohort", "alumni"]
    }
  ] as const;

  function manifest(placement: Placement): Catalog {
    const directories = domains.map((domain) => {
      const phrases: { field: "purpose" | "useWhen" | "exampleQuestions" | "keywords"; tokens: string[] }[] = [
        { field: "useWhen", tokens: [domain.entity, domain.phraseTokens[0]] },
        { field: "exampleQuestions", tokens: [domain.entity, domain.phraseTokens[1]] }
      ];
      if (placement !== "examples") {
        phrases.push({ field: placement, tokens: [domain.entity, "registry"] });
      }
      return {
        id: domain.id,
        service: "scout" as const,
        kind: "operation" as const,
        description: domain.description,
        routingKeywords: [domain.entity, domain.context, ...domain.phraseTokens, "registry"],
        routingPhrases: phrases,
        routingExclusions: [{ tokens: ["deploy", "contract"] }],
        retrievalProfile: {
          lane: "directory" as const,
          emptyScope: "inconclusive" as const,
          recoverWith: [{ id: "scout.searchArchive", relation: "broader-semantic" as const, on: ["empty" as const] }]
        },
        inputSchema: {
          type: "object",
          properties: { [domain.property]: { type: "string", enum: [...domain.values] } }
        },
        outputSchema: null,
        transport: null,
        provenance
      };
    });
    return loadManifest({
      version: 1,
      generatedAt: provenance.fetchedAt,
      entries: [
        ...directories,
        {
          id: "scout.searchArchive",
          service: "scout",
          kind: "operation",
          description: "Search archived directory notes and mentor overview records.",
          inputSchema: null,
          outputSchema: null,
          transport: null,
          provenance
        },
        {
          id: "lumenloop.search_mentions",
          service: "lumenloop",
          kind: "operation",
          description: "Search mentions of dex projects and latam mentor programs.",
          inputSchema: null,
          outputSchema: null,
          transport: null,
          provenance
        },
        {
          id: "skills.test.directory-guide",
          service: "skills",
          kind: "skill",
          description: "Guide to dex listing overview and latam mentor directories.",
          inputSchema: null,
          outputSchema: null,
          transport: null,
          provenance
        }
      ]
    });
  }

  const catalogs = {
    examples: manifest("examples"),
    purpose: manifest("purpose"),
    keywords: manifest("keywords")
  };

  function projection(placement: Placement, options: Omit<Parameters<typeof searchCatalogPage>[1], "limit">) {
    const page = searchCatalogPage(catalogs[placement], { ...options, limit: 5 });
    return {
      hits: page.hits.map(({ id, score, tier }) => ({ id, score, tier })),
      total: page.total
    };
  }

  const controls = domains.flatMap((domain) => [
    [`${domain.id} entity with enum`, { query: `${domain.entity} ${domain.enumOnly}` }],
    [`${domain.id} positive phrase`, { query: domain.positive }],
    [`${domain.id} exact ID`, { query: domain.id }],
    [`${domain.id} exact service filter`, { query: `${domain.entity} ${domain.enumOnly}`, service: "scout" }],
    [`${domain.id} operation kind`, { query: `${domain.entity} ${domain.enumOnly}`, kind: "operation" }],
    [`${domain.id} skill kind`, { query: `${domain.entity} ${domain.enumOnly}`, kind: "skill" }],
    [`${domain.id} unrelated entity`, { query: domain.unrelated }],
    [`${domain.id} enum only`, { query: domain.enumOnly }]
  ] as const);

  it.each(controls)("keeps the same page for every entity placement: %s", (_label, options) => {
    const expected = projection("examples", options);
    expect(projection("purpose", options)).toEqual(expected);
    expect(projection("keywords", options)).toEqual(expected);
  });

  it.each(domains)("admits positive phrase evidence and exact IDs in every placement: $id", (domain) => {
    for (const placement of ["examples", "purpose", "keywords"] as const) {
      expect(projection(placement, { query: domain.positive }).hits.map((hit) => hit.id), placement)
        .toContain(domain.id);
      expect(projection(placement, { query: domain.id }).hits[0]?.id, placement).toBe(domain.id);
    }
  });

  it.each(domains)("does not admit an entity and enum without positive phrase evidence: $id", (domain) => {
    for (const placement of ["examples", "purpose", "keywords"] as const) {
      expect(
        projection(placement, { query: `${domain.entity} ${domain.enumOnly}` }).hits.map((hit) => hit.id),
        placement
      ).not.toContain(domain.id);
    }
  });
});
