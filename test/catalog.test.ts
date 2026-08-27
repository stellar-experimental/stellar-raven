/**
 * Catalog builder tests — determinism, entry counts, schema validity,
 * build-time exposure filtering (ADR-0003: the manifest IS the exposed
 * surface; exclusions never emit). Runs scripts/build-catalog.mjs for real
 * (offline; it only reads inventory/ + ecosystem-skills/).
 */
import { describe, expect, it, beforeAll } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadManifest, type Catalog } from "../src/catalog/search.ts";
import { RUNNERS } from "../src/skills/runners/index.ts";
// Import-safe: build-catalog.mjs is main-guarded (see its footer).
import {
  assertNoNonExposedRefs,
  assertSideEffectingOpsExcluded,
  attachKnownAliases,
  attachRetrievalProfiles
} from "../scripts/build-catalog.mjs";
import { EXCLUDED_SCOUT_OPS } from "../scripts/exposure.mjs";
import { MICRO_MAP } from "../src/mcp/micro-map.ts";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_PATH = join(ROOT, "catalog", "manifest.json");
const VALID_ALIAS_RECEIPTS = [
  {
    path: "research/qa-deep-dive-2026-08-25/receipts/wisdomtree-live-sources.json",
    sha256: "49df01cdaaf1368881dd643ff53c93d2fa238bfa39fb7eaa6d4efea4eb8bedb6"
  },
  {
    path: "research/qa-deep-dive-2026-08-25/receipts/wisdomtree-toml.txt",
    sha256: "773b534176e3a9b7bdc9671568226d15978192fed4914725d786534a8168c156"
  }
] as const;

function runBuilder(): string {
  execFileSync(process.execPath, [join(ROOT, "scripts", "build-catalog.mjs")], {
    cwd: ROOT,
    stdio: "pipe"
  });
  return readFileSync(MANIFEST_PATH, "utf8");
}

// Capture the committed bytes BEFORE beforeAll rebuilds (which overwrites the
// file) — otherwise the staleness evidence is destroyed. Mirrors super-spec.test.ts.
const committed = readFileSync(MANIFEST_PATH, "utf8");

let raw: string;
let catalog: Catalog;

beforeAll(() => {
  raw = runBuilder();
  catalog = loadManifest(JSON.parse(raw));
});

describe("build-catalog.mjs", () => {
  it("the checked-in artifact is current — a rebuild is byte-identical", () => {
    expect(
      committed,
      "catalog/manifest.json is stale — run node scripts/build-catalog.mjs"
    ).toBe(raw);
  });

  it("is deterministic — a second run produces byte-identical output", () => {
    const second = runBuilder();
    expect(second).toBe(raw);
  });

  it("emits a manifest that passes loadManifest validation", () => {
    // beforeAll already parsed it; assert the envelope explicitly.
    expect(catalog.version).toBe(1);
    expect(typeof catalog.generatedAt).toBe("string");
    // generatedAt is derived from inputs, never wall clock: it must equal one
    // of the input snapshot timestamps, and re-running must not change it.
    expect(Date.parse(catalog.generatedAt)).not.toBeNaN();
  });

  it("has globally unique ids", () => {
    const ids = catalog.entries.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("attaches only the receipt-backed WisdomTree entity alias pack", () => {
    const aliased = catalog.entries.filter(
      (entry) => entry.knownAliases
    );
    expect(aliased.map((entry) => entry.id)).toEqual([
      "lumenloop.find_content_by_entity"
    ]);
    for (const entry of aliased) {
      expect(entry.knownAliases).toEqual([
        "CRDT",
        "CRDYX",
        "WisdomTree Private Credit and Alternative Income Digital Fund",
        "WisdomTree Private Credit"
      ]);
      expect(entry.knownAliasTriggers).toEqual([
        "CRDT",
        "CRDYX",
        "WisdomTree"
      ]);
    }
  });

  it("rejects invalid alias provenance, generic triggers, and orphaned targets", () => {
    const entries = catalog.entries;
    expect(() => attachKnownAliases(entries, [{
      provenance: [],
      aliases: ["one", "two"],
      triggers: ["one"],
      entryIds: ["lumenloop.search_directory"]
    }])).toThrow(/no receipt provenance/);
    expect(() => attachKnownAliases(entries, [{
      provenance: [null],
      aliases: ["one", "two"],
      triggers: ["one"],
      entryIds: ["lumenloop.search_directory"]
    }])).toThrow(/receipt objects/);
    expect(() => attachKnownAliases(entries, [{
      provenance: [{ path: "research/does-not-exist.txt" }],
      aliases: ["one", "two"],
      triggers: ["one"],
      entryIds: ["lumenloop.search_directory"]
    }])).toThrow(/does not exist/);
    expect(() => attachKnownAliases(entries, [{
      provenance: [{ path: "node_modules/.package-lock.json" }],
      aliases: ["one", "two"],
      triggers: ["one"],
      entryIds: ["lumenloop.search_directory"]
    }])).toThrow(/not checked in/);
    expect(() => attachKnownAliases(entries, [{
      provenance: [{ path: VALID_ALIAS_RECEIPTS[0].path }],
      aliases: ["one", "two"],
      triggers: ["one"],
      entryIds: ["lumenloop.search_directory"]
    }])).toThrow(/requires SHA-256/);
    expect(() => attachKnownAliases(entries, [{
      provenance: [{ ...VALID_ALIAS_RECEIPTS[0], sha256: "0".repeat(64) }],
      aliases: ["one", "two"],
      triggers: ["one"],
      entryIds: ["lumenloop.search_directory"]
    }])).toThrow(/SHA-256 does not match/);
    for (const trigger of [
      "credit",
      "token",
      "the",
      "private credit",
      "credit card",
      "CreditCard",
      "creditcard",
      "the and"
    ]) {
      expect(() => attachKnownAliases(entries, [{
        provenance: VALID_ALIAS_RECEIPTS,
        aliases: ["one", "two"],
        triggers: [trigger],
        entryIds: ["lumenloop.search_directory"]
      }]), trigger).toThrow(/generic or a stopword/);
    }
    expect(() => attachKnownAliases(entries, [{
      provenance: VALID_ALIAS_RECEIPTS,
      aliases: ["one", "two"],
      triggers: ["one"],
      entryIds: ["lumenloop.not_exposed"]
    }])).toThrow(/non-exposed catalog entry/);
  });

  it("rejects unpaired canonical alias fields", () => {
    const rawCatalog = JSON.parse(raw) as { entries: Array<Record<string, unknown>> };
    rawCatalog.entries[0]!.knownAliases = ["one", "two"];
    expect(() => loadManifest(rawCatalog)).toThrow(/must appear together/);
  });

  it("attaches only exact, exposed operation recovery edges", () => {
    const operations = new Set(
      catalog.entries.filter((entry) => entry.kind === "operation").map((entry) => entry.id)
    );
    const profiled = catalog.entries.filter((entry) => entry.retrievalProfile);
    expect(profiled.length).toBeGreaterThan(0);
    for (const entry of profiled) {
      const id = entry.id;
      const profile = entry.retrievalProfile!;
      expect(operations.has(id), id).toBe(true);
      for (const edge of profile.recoverWith) {
        expect(operations.has(edge.id), `${id} -> ${edge.id}`).toBe(true);
        expect(edge.id).not.toBe(id);
      }
    }
  });

  it("fails loud on orphaned, self, and non-exposed recovery edges", () => {
    const entries = catalog.entries.map(({ retrievalProfile: _profile, ...entry }) => entry);
    expect(() => attachRetrievalProfiles(entries, {
      "missing.operation": {
        lane: "directory",
        emptyScope: "operation",
        recoverWith: [{ id: "scout.searchResearch", relation: "cross-family", on: ["empty"] }]
      }
    })).toThrow(/matched no exposed operation/);
    expect(() => attachRetrievalProfiles(entries, {
      "scout.getBuilders": {
        lane: "directory",
        emptyScope: "operation",
        recoverWith: [{ id: "scout.getBuilders", relation: "cross-family", on: ["empty"] }]
      }
    })).toThrow(/self-edge/);
    expect(() => attachRetrievalProfiles(entries, {
      "scout.getBuilders": {
        lane: "directory",
        emptyScope: "operation",
        recoverWith: [{ id: "scout.notExposed", relation: "cross-family", on: ["empty"] }]
      }
    })).toThrow(/non-exposed operation/);
  });

  it("recovers weak RPC docs results through cited research and source-code explanation", () => {
    const rpcDocs = catalog.entries.find(
      (entry) => entry.id === "stellarDocs.search_rpc_horizon_data_docs"
    );
    expect(rpcDocs?.retrievalProfile?.recoverWith).toEqual(
      expect.arrayContaining([
        {
          id: "scout.searchResearch",
          relation: "cited-research",
          on: ["weak", "adjacent", "ambiguous", "partial"]
        },
        {
          id: "scout.explainRepo",
          relation: "source-code",
          on: ["weak", "adjacent", "ambiguous", "partial"]
        }
      ])
    );
  });

  it("attaches the live-derived Scout recovery profiles without profiling the change feed", () => {
    const byId = new Map(catalog.entries.map((entry) => [entry.id, entry]));
    const broadMiss = ["empty", "weak", "adjacent", "ambiguous"];
    const corroborate = ["weak", "adjacent", "ambiguous", "partial"];

    expect(byId.get("scout.listContracts")?.retrievalProfile).toEqual({
      lane: "directory",
      emptyScope: "operation",
      recoverWith: [
        { id: "scout.searchRepos", relation: "source-code", on: ["empty", "partial"] },
        { id: "lumenloop.search_content_semantic", relation: "broader-semantic", on: broadMiss },
        { id: "scout.searchResearch", relation: "cited-research", on: corroborate }
      ]
    });
    expect(byId.get("scout.getRepoTrust")?.retrievalProfile).toEqual({
      lane: "detail",
      emptyScope: "operation",
      recoverWith: [
        { id: "scout.searchRepos", relation: "source-code", on: ["empty", "partial"] },
        { id: "lumenloop.search_content_semantic", relation: "broader-semantic", on: broadMiss },
        { id: "scout.searchResearch", relation: "cited-research", on: corroborate }
      ]
    });
    for (const id of ["scout.scfPitch", "scout.vetIdea"]) {
      expect(byId.get(id)?.retrievalProfile, id).toEqual({
        lane: "research",
        emptyScope: "inconclusive",
        recoverWith: [
          {
            id: "lumenloop.find_similar_scf_submissions",
            relation: "broader-semantic",
            on: broadMiss
          },
          { id: "scout.searchHackathonBuilds", relation: "source-code", on: ["weak", "partial"] },
          { id: "scout.searchResearch", relation: "cited-research", on: corroborate }
        ]
      });
    }
    expect(byId.get("scout.getChanges")?.retrievalProfile).toBeUndefined();
  });

  it("has the expected entry counts per service/kind", () => {
    const count = (pred: (e: Catalog["entries"][number]) => boolean) =>
      catalog.entries.filter(pred).length;

    // Lumenloop: 18 exposed operations of 21 inventory tools — request_research
    // (metered paid trigger; PLAN §8: off by default) plus its read half
    // research_result and list_my_research (account-scoped dead ends without
    // the trigger) are excluded at build time and never emitted (ADR-0003).
    // list_research stays: public editorial pieces, independent of the paid lane.
    expect(count((e) => e.service === "lumenloop" && e.kind === "operation")).toBe(18);
    expect(count((e) => e.id === "lumenloop.request_research")).toBe(0);
    expect(count((e) => e.id === "lumenloop.research_result")).toBe(0);
    expect(count((e) => e.id === "lumenloop.list_my_research")).toBe(0);
    expect(count((e) => e.id === "lumenloop.list_research")).toBe(1);

    // Lumenloop's 14 API-served skills are never emitted: each duplicates a
    // canonical skills.* mirror entry (the lumenloop.skill.* twin namespace is
    // dead — assertLumenloopSkillsMirrored guards the assumption).
    expect(count((e) => e.service === "lumenloop" && e.kind === "skill")).toBe(0);
    expect(count((e) => e.id.startsWith("lumenloop.skill."))).toBe(0);
    expect(
      catalog.entries.filter((e) => e.service === "lumenloop" && e.kind === "skill-section")
    ).toHaveLength(0);

    // Scout: 29 exposed of 35 upstream OpenAPI operations — the 4 write/
    // side-effecting endpoints (submitFeedback, submitPartnerListing,
    // partnerAssistant, partnerOnboard) are excluded at build time, plus getFeedbackSchema:
    // read-only, but a dead end whose only purpose is to shape the excluded
    // feedback submission (its upstream description names the non-exposed
    // scout.submitFeedback). The read-only hackathonBrief and matchPartners
    // operations stay exposed. Their OpenAPI contracts describe no persistence.
    // resolveProject stays hidden until its nested response objects are typed.
    expect(count((e) => e.service === "scout" && e.kind === "operation")).toBe(29);
    expect(count((e) => e.id === "scout.submitFeedback")).toBe(0);
    expect(count((e) => e.id === "scout.getFeedbackSchema")).toBe(0);
    expect(count((e) => e.id === "scout.submitPartnerListing")).toBe(0);
    expect(count((e) => e.id === "scout.partnerAssistant")).toBe(0);
    expect(count((e) => e.id === "scout.partnerOnboard")).toBe(0);
    expect(count((e) => e.id === "scout.resolveProject")).toBe(0);
    expect(count((e) => e.id === "scout.hackathonBrief")).toBe(1);
    expect(count((e) => e.id === "scout.matchPartners")).toBe(1);
    for (const id of [
      "scout.listAudits",
      "scout.searchHackathonBuilds",
      "scout.getPeople",
      "scout.getStablecoins",
      "scout.getChanges",
      "scout.listContracts",
      "scout.getRepoTrust",
      "scout.scfPitch",
      "scout.vetIdea"
    ]) {
      expect(count((e) => e.id === id), id).toBe(1);
    }

    // Stellar Docs: 12 authored operations from specs/stellar-docs.json.
    const docs = catalog.entries.filter((e) => e.service === "stellarDocs");
    expect(docs).toHaveLength(12);
    expect(docs.every((e) => e.kind === "operation")).toBe(true);
    expect(docs.map((e) => e.id)).toContain("stellarDocs.search_docs");
    expect(docs.map((e) => e.id)).toContain("stellarDocs.search_docs_in_category");
    expect(docs.map((e) => e.id)).toContain("stellarDocs.search_meeting_notes");
    // Every docs operation carries its Algolia execution mapping.
    for (const op of docs) {
      expect(op.transport?.type, op.id).toBe("algolia");
      expect((op.transport as Record<string, unknown>).algolia, op.id).toBeDefined();
      expect(op.inputSchema).not.toBeNull();
    }

    // Skills mirror: 19 whole-skill entries — the 7 retired Lumenloop
    // API-onboarding skills are never emitted, skill or sections (see
    // build-catalog.mjs RETIRED_ONBOARDING_SKILLS + the rename-guard).
    expect(count((e) => e.service === "skills" && e.kind === "skill")).toBe(19);
    expect(count((e) => e.service === "skills" && e.kind === "skill-section")).toBeGreaterThan(0);
    expect(count((e) => e.id.includes("lumenloop-api-"))).toBe(0);
    expect(count((e) => e.id.includes("lumenloop-mcp-connect"))).toBe(0);

    // Grand total: 59 operations + 19 whole skills + 173 skill sections.
    expect(catalog.entries).toHaveLength(251);
  });

  it("carries exactly version/generatedAt/entries at the top level", () => {
    // No manifest-level corpus blobs: the stellarDocs taxonomy lives in
    // specs/stellar-docs.json and reaches the model via the super spec. A
    // `docs.taxonomy` copy lived here until 2026-07-03 with zero consumers —
    // anything added at this level must name who reads it. Asserted on the
    // RAW bytes (loadManifest's zod parse strips unknown keys).
    expect(Object.keys(JSON.parse(raw)).sort()).toEqual(["entries", "generatedAt", "version"]);
  });

  it("skill sections carry compact descriptions and file transports", () => {
    const sections = catalog.entries.filter(
      (e) => e.service === "skills" && e.kind === "skill-section"
    );
    for (const section of sections) {
      expect(section.id).toMatch(/#/);
      expect(section.description.length).toBeLessThanOrEqual(201); // 200 + ellipsis
      expect(section.transport?.type).toBe("file");
      expect(section.inputSchema).toBeNull();
    }
    // Multi-file skills: extra .md files become #file:<relpath> sections.
    expect(sections.some((e) => e.id.includes("#file:"))).toBe(true);
    expect(
      sections.some((e) => e.id === "skills.stellar-dev.smart-contracts#file:development.md")
    ).toBe(true);
  });

  it("operations carry input schemas and transports", () => {
    const ops = catalog.entries.filter((e) => e.kind === "operation");
    for (const op of ops) {
      expect(op.inputSchema, op.id).not.toBeNull();
      expect(op.transport, op.id).not.toBeNull();
      expect(op.provenance.source.length).toBeGreaterThan(0);
      expect(Date.parse(op.provenance.fetchedAt), op.id).not.toBeNaN();
    }
    // Spot-check transports.
    const searchDirectory = ops.find((e) => e.id === "lumenloop.search_directory");
    expect(searchDirectory?.transport).toMatchObject({
      type: "http",
      method: "POST",
      path: "/v1/tools/search_directory"
    });
    const searchProjects = ops.find((e) => e.id === "scout.searchProjects");
    expect(searchProjects?.transport).toMatchObject({
      type: "http",
      method: "GET",
      path: "/api/projects/search"
    });
  });

  it("preserves the evidence-backed model contracts", () => {
    const byId = new Map(catalog.entries.map((entry) => [entry.id, entry]));
    const entity = byId.get("lumenloop.find_content_by_entity")!;
    const related = byId.get("lumenloop.get_related_projects")!;
    const hackathon = byId.get("scout.searchHackathonBuilds")!;
    const rfps = byId.get("scout.getRfps")!;

    expect(entity.description).toContain("Content grouped by type in articles, av, events, proposals, and scf_submissions");
    expect(entity.description).not.toContain("Array of content items");
    expect(related.description).toContain("An object with content");
    expect(related.description).not.toContain("Array of mentioned projects");
    expect(Object.keys((hackathon.inputSchema as { properties: Record<string, unknown> }).properties).sort()).toEqual([
      "limit",
      "q",
      "track",
      "winnersOnly"
    ]);
    expect(rfps.description).toContain("the sponsor brief is still soliciting");
    expect(rfps.description).toContain("meta.scfRound.submissionWindow");
    expect(rfps.description).not.toContain("open briefs are fundable in the current SCF round");
    const statusDescription = (
      rfps.inputSchema as { properties: { status: { description: string } } }
    ).properties.status.description;
    expect(statusDescription).toContain("brief is still soliciting");
    expect(statusDescription).toContain("submissionWindow");
    expect(statusDescription).toContain("currentPhase");
    const rfpOutput = rfps.outputSchema as {
      properties: {
        funding: { description: string };
        meta: { properties: { scfRound: { properties: Record<string, { description?: string }> } } };
        rfps: { items: { properties: { status: { description: string } } } };
      };
    };
    expect(rfpOutput.properties.funding.description).toContain(
      "without asserting an open submission window"
    );
    expect(rfpOutput.properties.rfps.items.properties.status.description).toContain(
      "brief is still soliciting"
    );
    const round = rfpOutput.properties.meta.properties.scfRound.properties;
    expect(Object.keys(round)).toEqual(
      expect.arrayContaining(["currentPhase", "roundsInProgress", "verifyAt"])
    );
    expect(round.currentRound?.description).toContain("NOT a claim that submissions are open");
  });

  it("emits the authored object contract for Docs page sections", () => {
    const page = catalog.entries.find((entry) => entry.id === "stellarDocs.get_doc_page_sections")!;
    expect(page.description).toContain(
      "An object with page, sections, nbSections, complete, truncated"
    );
    const output = page.outputSchema as {
      required: string[];
      properties: {
        sections: { items: { required: string[]; properties: Record<string, unknown> } };
      };
    };
    expect(output.required).toEqual(["page", "sections", "nbSections", "complete", "truncated"]);
    expect(output.properties.sections.items.required).toEqual([
      "url",
      "url_without_anchor",
      "anchor",
      "type",
      "breadcrumb"
    ]);
    expect(output.properties.sections.items.properties).toHaveProperty("content");
    expect(output.properties.sections.items.properties).toHaveProperty("snippet");
    expect(output.properties.sections.items.required).not.toContain("content");
  });

  it("maps each design-stage build domain to exact Scout, skill, and Docs authority", () => {
    const expected = [
      ["Design/build/integrate", "skills.stellar-dev.smart-contracts", "stellarDocs.search_soroban_contract_docs"],
      ["Design/build/integrate", "skills.stellar-dev.dapp", "stellarDocs.search_wallet_dapp_docs"],
      ["Design/build/integrate", "skills.stellar-dev.dapp", "stellarDocs.search_sdk_cli_tools_docs"],
      ["Design/build/integrate", "skills.stellar-dev.standards", "stellarDocs.search_protocol_concepts_docs"],
      ["Design/build/integrate", "skills.stellar-dev.data", "stellarDocs.search_rpc_horizon_data_docs"]
    ] as const;
    for (const [title, skillId, docsId] of expected) {
      const line = MICRO_MAP.split("\n").find((candidate) => candidate.includes(title));
      expect(line, title).toBeDefined();
      expect(line, title).toContain("scout.searchProjects");
      expect(line, title).toContain("scout.searchRepos");
      expect(line, title).toContain(skillId);
      expect(line, title).toContain(docsId);
    }
  });

  it("declares build authority only on the exact whole-skill role map", () => {
    const roles = new Map(
      catalog.entries
        .filter((entry) => entry.buildAuthorityRoles)
        .map((entry) => [entry.id, entry.buildAuthorityRoles])
    );
    expect([...roles.entries()]).toEqual([
      ["skills.stellar-dev.dapp", ["dapp", "sdk-integration"]],
      ["skills.stellar-dev.data", ["infrastructure"]],
      ["skills.stellar-dev.smart-contracts", ["contract"]],
      ["skills.stellar-dev.standards", ["protocol"]]
    ]);
  });
});

describe("x-routing ingestion — routingKeywords field", () => {
  it("attaches routingKeywords to exactly the exposed scout ops that publish x-routing", () => {
    const withField = catalog.entries.filter((e) => (e.routingKeywords ?? []).length > 0);
    // 27 upstream ops carry x-routing; partnerAssistant and resolveProject are build-excluded.
    expect(withField).toHaveLength(25);
    for (const entry of withField) {
      expect(entry.service, entry.id).toBe("scout");
      expect(entry.kind, entry.id).toBe("operation");
    }
  });

  it("keeps routingKeywords disjoint from keywords and within the cap", () => {
    for (const entry of catalog.entries) {
      const routing = entry.routingKeywords ?? [];
      if (routing.length === 0) continue;
      expect(routing.length, entry.id).toBeLessThanOrEqual(256);
      const kw = new Set(entry.keywords ?? []);
      for (const token of routing) {
        expect(kw.has(token), `${entry.id}: token "${token}" rides both blends`).toBe(false);
      }
    }
  });

  it("drops notFor — cross-op routing clauses never become this op's vocabulary", () => {
    // Sentinel: getBuilders' upstream x-routing notFor routes stat questions
    // to getLeaderboard. Ingesting notFor would plant "leaderboard" here and
    // recreate the cross-capture the 1.7.16 fix removed.
    const builders = catalog.entries.find((e) => e.id === "scout.getBuilders");
    expect(builders?.routingKeywords ?? []).not.toContain("leaderboard");
  });

  it("ADR-0003 guard scans routingKeywords like any other emitted text", () => {
    const entries = catalog.entries.map((e) => ({ ...e }));
    const victim = entries.find((e) => e.id === "scout.getBuilders")!;
    victim.routingKeywords = [...(victim.routingKeywords ?? []), "scout.partnerAssistant"];
    expect(() => assertNoNonExposedRefs(entries)).toThrow(/ADR-0003 leak/);
  });
});

describe("x-side-effecting exposure gate (coverage review 2026-07-12)", () => {
  const specWith = (marked: boolean) => ({
    paths: {
      "/api/new-write": { post: { operationId: "newWrite", ...(marked ? { "x-side-effecting": true } : {}) } },
      "/api/read": { get: { operationId: "read" } }
    }
  });

  it("breaks the build when an upstream-marked op is not in the exclusion data", () => {
    expect(() => assertSideEffectingOpsExcluded(specWith(true), new Set())).toThrow(
      /exposure gate: upstream marks "POST \/api\/new-write" x-side-effecting/
    );
  });

  it("passes when the marked op is excluded, and ignores unmarked ops", () => {
    expect(() =>
      assertSideEffectingOpsExcluded(specWith(true), new Set(["POST /api/new-write"]))
    ).not.toThrow();
    expect(() => assertSideEffectingOpsExcluded(specWith(false), new Set())).not.toThrow();
  });

  it("holds on the committed inventory: every live-marked scout op is excluded", () => {
    const inv = JSON.parse(readFileSync(join(ROOT, "inventory", "stellar-light.json"), "utf8"));
    expect(() => assertSideEffectingOpsExcluded(inv.openapi, EXCLUDED_SCOUT_OPS)).not.toThrow();
    // The gate is live, not vacuous: the inventory really carries marked ops.
    const marked = Object.entries(inv.openapi.paths as Record<string, Record<string, unknown>>)
      .flatMap(([p, item]) =>
        Object.entries(item).filter(([, op]) => (op as Record<string, unknown>)?.["x-side-effecting"] === true).map(() => p)
      );
    expect(marked.length).toBeGreaterThanOrEqual(3);
  });
});

describe("runnable skills — flag + schemas attached from the RUNNERS registry (design §5)", () => {
  it("exactly the registry's ids carry runnable: true, kind skill, with the registry's schemas", () => {
    const runnable = catalog.entries.filter((e) => e.runnable === true);
    expect(runnable.map((e) => e.id).sort()).toEqual(Object.keys(RUNNERS).sort());
    for (const entry of runnable) {
      expect(entry.kind, entry.id).toBe("skill");
      // JSON round-trip equality (key order aside — the manifest is
      // sortKeysDeep'd): the same pinning assertRunnersWired makes at
      // provider build, checked here at the artifact level.
      expect(entry.inputSchema, entry.id).toEqual(
        JSON.parse(JSON.stringify(RUNNERS[entry.id]!.inputSchema))
      );
      expect(entry.outputSchema, entry.id).toEqual(
        JSON.parse(JSON.stringify(RUNNERS[entry.id]!.outputSchema))
      );
    }
  });

  it("every other entry is untouched: non-runnable skills keep null schemas; no flag leaks elsewhere", () => {
    for (const entry of catalog.entries) {
      if (entry.runnable === true) continue;
      expect(entry.runnable, entry.id).toBeUndefined();
      if (entry.kind === "skill" || entry.kind === "skill-section") {
        expect(entry.inputSchema, entry.id).toBeNull();
        expect(entry.outputSchema, entry.id).toBeNull();
      }
    }
  });

  it("declared ops all resolve to emitted operation entries (the drift guard's steady state)", () => {
    const opIds = new Set(catalog.entries.filter((e) => e.kind === "operation").map((e) => e.id));
    for (const [id, runner] of Object.entries(RUNNERS)) {
      for (const op of runner.ops) {
        expect(opIds.has(op), `${id} declares ${op}`).toBe(true);
      }
    }
  });
});

describe("loadManifest", () => {
  it("rejects malformed input", () => {
    expect(() => loadManifest(null)).toThrow();
    expect(() => loadManifest({ version: 1 })).toThrow();
    expect(() => loadManifest({ version: 1, generatedAt: "x", entries: [{}] })).toThrow();
    expect(() =>
      loadManifest({
        version: 1,
        generatedAt: "2026-07-01T00:00:00Z",
        entries: [
          {
            id: "x.y",
            service: "not-a-service",
            kind: "operation",
            description: "d",
            inputSchema: null,
            outputSchema: null,
            transport: null,
            provenance: { source: "s", fetchedAt: "t" }
          }
        ]
      })
    ).toThrow();
  });

  it("accepts a minimal well-formed catalog", () => {
    const minimal = {
      version: 1,
      generatedAt: "2026-07-01T00:00:00Z",
      entries: [
        {
          id: "scout.getStatus",
          service: "scout",
          kind: "operation",
          description: "Service health",
          inputSchema: { type: "object", properties: {} },
          outputSchema: null,
          transport: { type: "http", method: "GET", path: "/api/status" },
          provenance: { source: "https://example.com", fetchedAt: "2026-07-01T00:00:00Z" }
        }
      ]
    };
    expect(loadManifest(minimal).entries).toHaveLength(1);
  });
});
