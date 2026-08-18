import { readFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { fileURLToPath } from "node:url";
import { classifyRegister } from "../eval/discovery/mine-agent-queries.mjs";
import { aggregateAgentEvidence, classifyMiss } from "../eval/discovery/classify-misses.mjs";
import { capSearchEvidence, gradeVisibleSearches } from "../eval/discovery/lib.mjs";
import {
  ARTIFACT_PATH,
  MODEL,
  buildCatalogCards,
  cardSetHash,
  sha256
} from "../eval/vectorize/frontier-config.mjs";
import { loadFrontierArtifact } from "../eval/vectorize/retrieval.mjs";
import { shouldFailFrontier } from "../eval/vectorize/run-frontier.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MANIFEST_PATH = path.join(ROOT, "catalog/manifest.json");

function catalogMatchedFixture() {
  const artifact = JSON.parse(readFileSync(ARTIFACT_PATH, "utf8"));
  const manifest = {
    entries: artifact.cards.map(({ id, service, kind }) => ({
      id,
      service,
      kind,
      description: `Fixture description for ${id}`
    }))
  };
  const cards = buildCatalogCards(manifest);
  artifact.cardSetSha256 = cardSetHash(cards);
  artifact.cards = cards.map(({ id, service, kind, text }) => ({
    id,
    service,
    kind,
    textSha256: sha256(text)
  }));
  return { artifact, manifest };
}

async function importRetrievalWithFixture(artifact, manifest) {
  vi.resetModules();
  vi.doMock("node:fs", async () => {
    const actual = await vi.importActual("node:fs");
    return {
      ...actual,
      readFileSync(file, ...args) {
        if (file === ARTIFACT_PATH) return JSON.stringify(artifact);
        if (file === MANIFEST_PATH) return JSON.stringify(manifest);
        return actual.readFileSync(file, ...args);
      }
    };
  });
  return import("../eval/vectorize/retrieval.mjs");
}

afterEach(() => {
  vi.doUnmock("node:fs");
  vi.resetModules();
});

describe("discovery measurement extensions", () => {
  it("classifies one-shot misses from paired <=3-search evidence", () => {
    expect(classifyMiss({ familyHitAt3: true, usableOpAt5: true }, null)).toBe("downstream");
    expect(
      classifyMiss(
        { familyHitAt3: false, usableOpAt5: false },
        { familyHitAt3: true, usableOpAt5: true }
      )
    ).toBe("agent-behavior");
    expect(
      classifyMiss(
        { familyHitAt3: false, usableOpAt5: false },
        { familyHitAt3: true, usableOpAt5: false }
      )
    ).toBe("retrieval");
  });

  it("grades visibility across multiple searches without crediting final prose", () => {
    const c = { expectedFamilies: ["lumenloop"], acceptableOps: ["lumenloop.search_directory"] };
    const grade = gradeVisibleSearches(c, [
      { hits: [{ id: "scout.searchProjects", service: "scout" }] },
      { hits: [{ id: "lumenloop.search_directory", service: "lumenloop" }] }
    ]);
    expect(grade).toEqual({ familyHitAt3: true, usableOpAt5: true });
  });

  it("caps over-limit search evidence and rejects its final selection contract", () => {
    const capped = capSearchEvidence([{ hits: [] }, { hits: [] }, { hits: [] }, { hits: [] }]);
    expect(capped.searches).toHaveLength(3);
    expect(capped.observedSearchCount).toBe(4);
    expect(capped.searchContractValid).toBe(false);
  });

  it("requires family and operation recovery in the same agent run", () => {
    const split = aggregateAgentEvidence([
      { familyHitAt3: true, usableOpAt5: false },
      { familyHitAt3: false, usableOpAt5: true }
    ]);
    expect(split).toMatchObject({ familyHitAt3: true, usableOpAt5: true, recoveredTogether: false });
    expect(classifyMiss({ familyHitAt3: false, usableOpAt5: false }, split)).toBe("retrieval");
  });

  it("classifies the mined register with an explicit, deterministic rule", () => {
    expect(classifyRegister("Soroswap DEX project profile", "q-defi-soroswap-what-is")).toBe("mixed");
    expect(classifyRegister("Soroswap DEX Stellar", "q-defi-soroswap-what-is")).toBe("entity-only");
    expect(classifyRegister("weighted AMM research articles", "q-defi-comet-content")).toBe("capability");
  });

  it("keeps the committed replay lane PII-safe and provenance-bearing", () => {
    const lane = JSON.parse(readFileSync(path.join(ROOT, "eval/discovery/mined-lumenloop-queries.json"), "utf8"));
    expect(lane.summary.occurrenceCount).toBe(lane.occurrences.length);
    expect(lane.summary.caseCount).toBe(8);
    expect(lane.provenance).toHaveLength(3);
    for (const row of lane.occurrences) {
      expect(row.query).not.toMatch(/[A-Z2-7]{56}/);
      expect(row.query).not.toMatch(/\b[^\s@]+@[^\s@]+\.[^\s@]+\b/);
    }
  });
});

describe("pinned Vectorize frontier artifact", () => {
  it("fails the CLI whenever the composite trigger does not clear", () => {
    expect(shouldFailFrontier(false)).toBe(true);
    expect(shouldFailFrontier(true)).toBe(false);
  });

  it("is internally consistent and decodes fixed-width vectors", () => {
    // Self-consistency only. The strict live-catalog comparison still guards
    // anyone RUNNING the experiment (loadFrontierArtifact defaults to it) — but
    // asserting it HERE made every catalog description edit fail an unrelated
    // unit suite until a hazardous re-embed, which is how a false claim once
    // shipped instead of a one-word fix.
    const loaded = loadFrontierArtifact({ requireCatalogMatch: false });
    // Only searchable entries are embedded: the policy reranks searchCatalog
    // candidates, so a searchable:false card could never be reached.
    expect(loaded.cards).toHaveLength(72);
    expect(loaded.cards.every((card) => card.kind !== "skill-section")).toBe(true);
    // cardSetSha256 is computed over card TEXT, which the artifact stores only
    // as per-card textSha256 — so the live-catalog comparison is the only way
    // to recompute it, and that is exactly what the experiment path asserts.
    // Here: the payload hash and the decoded shape must hold on their own.
    expect(loaded.artifact.vectorsSha256).toBe(
      sha256(Buffer.from(loaded.artifact.vectors, "base64"))
    );
    expect(loaded.artifact.cards.every((card) => /^[0-9a-f]{64}$/.test(card.textSha256))).toBe(true);
    expect(loaded.vectors).toHaveLength(loaded.cards.length);
    expect(loaded.vectors.every((vector) => vector.length === MODEL.dimensions)).toBe(true);
    expect(loaded.artifact.model.revision).toBe("c25a394dd583836952667c12f008335071b3f43d");
    expect(loaded.artifact.model.runtime).toBe("@huggingface/transformers@4.2.0");
  });

  it("rejects a corrupt card hash in false-then-true order", async () => {
    const { artifact, manifest } = catalogMatchedFixture();
    artifact.cards[0].textSha256 = "0".repeat(64);
    const { loadFrontierArtifact: loadFixture } = await importRetrievalWithFixture(artifact, manifest);

    expect(loadFixture({ requireCatalogMatch: false }).cards[0].textSha256).toBe("0".repeat(64));
    expect(() => loadFixture({ requireCatalogMatch: true })).toThrow(
      `vector artifact card drift at ${artifact.cards[0].id}`
    );
  });

  it("keeps the decoded artifact cache separate in true-then-false order", async () => {
    const { artifact, manifest } = catalogMatchedFixture();
    const { loadFrontierArtifact: loadFixture } = await importRetrievalWithFixture(artifact, manifest);

    const verified = loadFixture({ requireCatalogMatch: true });
    const decoded = loadFixture({ requireCatalogMatch: false });

    expect(verified.cards[0]).toHaveProperty("text");
    expect(decoded.cards[0]).not.toHaveProperty("text");
    expect(decoded.cards[0]).toHaveProperty("textSha256");
    expect(decoded.vectors).toBe(verified.vectors);
  });
});
