import { beforeAll, describe, expect, it } from "vitest";
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
let catalog: Catalog;

function ids(query: string): string[] {
  return searchCatalog(catalog, { query, limit: 5 }).map((hit) => hit.id);
}

beforeAll(() => {
  catalog = loadManifest(JSON.parse(readFileSync(manifestPath, "utf8")));
});

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

  it.runIf(Boolean(experimentalManifest))("separates RWA discovery from implementation", () => {
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

  it.runIf(Boolean(experimentalManifest)).each([
    "Simulate a transfer of a tokenized bond through Stellar RPC.",
    "How do I read a wallet balance for tokenized treasury assets?"
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
    "What is Soroswap and what makes it different from other Stellar DEXes?",
    "soroswap compared with other stellar dexes",
    "SOROSWAP compared with other Stellar DEXes",
    "Soroswap: how does this Stellar DEX differ?"
  ])("uses repeated directory examples without case or word-order dependence: %s", (query) => {
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
