import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import manifestJson from "../catalog/manifest.json" with { type: "json" };
import originalContract from "../eval/protocol-history-cases.json" with { type: "json" };
import blindContract from "../eval/protocol-history-blind-cases.json" with { type: "json" };
import originalContractV2 from "../eval/protocol-history-cases-v2.json" with { type: "json" };
import blindContractV2 from "../eval/protocol-history-blind-cases-v2.json" with { type: "json" };
import { loadManifest, searchCatalog } from "../src/catalog/search.ts";
import { scoreEntryWeighted } from "../src/catalog/scoring.ts";
import {
  CLAUSE_ARTIFACT_PATH,
  MODEL,
  applyClauseHysteresis,
  buildClauses,
  clauseFit,
  splitDescription,
} from "../eval/vectorize/clause-config.mjs";
import {
  assertClauseArtifactInputEpoch,
  buildCandidateUnion,
  loadClauseArtifact,
  scoringProjection,
} from "../eval/vectorize/clause-retrieval.mjs";
import { loadBankedRerankClauseArtifact } from "../eval/vectorize/rerank-retrieval.mjs";
import { shouldFail } from "../eval/vectorize/run-clause-fit.mjs";
import { buildClauseArtifact } from "../eval/vectorize/build-clause-artifact.mjs";
import {
  containsNormalizedExactText,
  loadFrozenLeakageProjection,
  normalizeLeakageText,
} from "../eval/vectorize/leakage-projection.mjs";
import {
  CLAUSE_ARTIFACT_SHA256,
  CLAUSE_SET_SHA256,
  sha256,
} from "../eval/vectorize/rerank-config.mjs";

const familyPurposes = [{ family: "scout", label: "Scout", line: "Scout source line.", authority: "Scout authority." }];
const fixtureManifest = {
  entries: [
    {
      id: "scout.alpha",
      service: "scout",
      kind: "operation",
      description: "A sufficiently long first sentence. Returns: Internal output only. Another useful description sentence!",
      keywords: ["FORBIDDEN_MANIFEST_KEYWORD"],
      routingKeywords: ["FORBIDDEN_ROUTING_KEYWORD"],
    },
  ],
};
const fixtureInventory = {
  openapi: {
    paths: {
      "/alpha": {
        get: {
          operationId: "alpha",
          "x-routing": {
            purpose: "Research the alpha record.",
            useWhen: ["A user needs alpha history."],
            exampleQuestions: ["What happened to alpha?"],
            notFor: ["Current account balances."],
            keywords: ["FORBIDDEN_X_ROUTING_KEYWORD"],
          },
        },
      },
      "/absent": {
        get: {
          operationId: "absent",
          "x-routing": { purpose: "This operation is not exposed." },
        },
      },
    },
  },
};
const fixtureWorkflows = [{ title: "Alpha workflow", questionShape: "How did alpha change?", steps: ["scout.alpha"] }];

describe("clause extraction", () => {
  it("1. emits the expected ordered clause list", () => {
    const { clauses } = buildClauses(fixtureManifest, fixtureInventory, { familyPurposes, workflows: fixtureWorkflows });
    expect(clauses.map((clause) => [clause.role, clause.source, clause.index, clause.text.split("\n\n")[1]])).toEqual([
      ["positive", "purpose", 0, "Purpose: Research the alpha record."],
      ["positive", "useWhen", 0, "Use when: A user needs alpha history."],
      ["positive", "exampleQuestion", 0, "Example question: What happened to alpha?"],
      ["positive", "description", 0, "Description: A sufficiently long first sentence."],
      ["positive", "description", 1, "Description: Another useful description sentence!"],
      ["positive", "workflow", 0, "Workflow: Alpha workflow: How did alpha change?"],
      ["negative", "notFor", 0, "Not for: Current account balances."],
    ]);
  });

  it("2. ignores an inventory operation absent from the searchable manifest", () => {
    const { clauses } = buildClauses(fixtureManifest, fixtureInventory, { familyPurposes, workflows: [] });
    expect(clauses.some((clause) => clause.entryId === "scout.absent")).toBe(false);
  });

  it("3. excludes every keyword field from clause text", () => {
    const { clauses } = buildClauses(fixtureManifest, fixtureInventory, { familyPurposes, workflows: [] });
    const text = clauses.map((clause) => clause.text).join("\n");
    expect(text).not.toContain("FORBIDDEN_MANIFEST_KEYWORD");
    expect(text).not.toContain("FORBIDDEN_ROUTING_KEYWORD");
    expect(text).not.toContain("FORBIDDEN_X_ROUTING_KEYWORD");
  });

  it("4. drops short and Returns description pieces", () => {
    expect(splitDescription("Too short. This sentence is long enough. Returns: Hidden output. Another valid sentence.")).toEqual([
      "This sentence is long enough.",
      "Another valid sentence.",
    ]);
  });

  it("5. keeps clause order and indexes deterministic", () => {
    const first = buildClauses(fixtureManifest, fixtureInventory, { familyPurposes, workflows: fixtureWorkflows }).clauses;
    const second = buildClauses(fixtureManifest, fixtureInventory, { familyPurposes, workflows: fixtureWorkflows }).clauses;
    expect(second).toEqual(first);
  });

  it("6. gives unmatched Scout operations description clauses only", () => {
    const manifest = structuredClone(fixtureManifest);
    manifest.entries.push({
      id: "scout.unmatched",
      service: "scout",
      kind: "operation",
      description: "A long unmatched operation description.",
      keywords: [],
      routingKeywords: [],
    });
    const source = buildClauses(manifest, fixtureInventory, { familyPurposes, workflows: [] });
    expect(source.unmatchedScoutOps).toEqual(["scout.unmatched"]);
    expect(source.clauses.filter((clause) => clause.entryId === "scout.unmatched").map((clause) => clause.source))
      .toEqual(["description"]);
  });
});

it("7. excludes every frozen case from the pinned source projection after normalization", () => {
  const projection = loadFrozenLeakageProjection();
  const bankedTarget = loadBankedRerankClauseArtifact().artifact.clauses
    .filter((clause) => clause.entryId === projection.targetOperation);
  expect(projection.sourceEpoch).toMatchObject({
    manifestSha256: "4cd28f4bdfe8c73950e0a6d4dfa1a09dd2f82674859e93990fdd62daef24fe8b",
    clauseSetSha256: CLAUSE_SET_SHA256,
    artifactSha256: CLAUSE_ARTIFACT_SHA256,
  });
  expect(projection.clauses.map((clause) => clause.renderedTextSha256))
    .toEqual(bankedTarget.map((clause) => clause.textSha256));

  const cases = [originalContractV2, blindContractV2]
    .flatMap((contract) => [
      ...contract.requiredCases,
      ...contract.forbiddenCases,
      ...contract.neutralCases,
    ]);
  for (const row of cases) {
    const punctuationVariant = row.question.replace(/[^\p{L}\p{N}\s]/gu, " !!! ");
    const caseVariant = row.question.toLocaleUpperCase("en-US");
    const combinedVariant = punctuationVariant.toLocaleUpperCase("en-US");
    expect(normalizeLeakageText(punctuationVariant), `${row.id}: punctuation normalization`)
      .toBe(normalizeLeakageText(row.question));
    expect(normalizeLeakageText(caseVariant), `${row.id}: case normalization`)
      .toBe(normalizeLeakageText(row.question));
    for (const candidate of [
      row.id,
      row.id.toLocaleUpperCase("en-US"),
      row.question,
      punctuationVariant,
      caseVariant,
      combinedVariant,
    ]) {
      expect(
        projection.clauses.some((clause) => containsNormalizedExactText(clause.text, candidate)),
        `${row.id}: ${candidate}`,
      ).toBe(false);
    }
  }
});

it("8. detects punctuation and case variants of a frozen question", () => {
  const question = originalContractV2.requiredCases[0].question;
  const variant = question
    .replace(/[^\p{L}\p{N}\s]/gu, " !!! ")
    .toLocaleUpperCase("en-US");
  expect(containsNormalizedExactText(`Example question: ${variant}`, question)).toBe(true);
});

describe("candidate union membership", () => {
  const catalog = loadManifest(manifestJson);
  const contracts = [originalContract, blindContract];

  it("9. includes scout.searchResearch for all 19 frozen positives", () => {
    for (const row of contracts.flatMap((contract) => contract.positiveCases)) {
      const union = buildCandidateUnion(searchCatalog, catalog, row.question);
      expect(union.map((hit) => hit.id), row.id).toContain("scout.searchResearch");
    }
  });

  it("10. has no duplicates and marks every gated failure as backfill", () => {
    for (const row of contracts.flatMap((contract) => [...contract.positiveCases, ...contract.controlCases])) {
      const union = buildCandidateUnion(searchCatalog, catalog, row.question);
      expect(new Set(union.map((hit) => hit.id)).size, row.id).toBe(union.length);
      for (const hit of union.slice(5)) {
        const entry = catalog.entries.find((candidate) => candidate.id === hit.id);
        if (scoreEntryWeighted(scoringProjection(entry), row.question) === null) {
          expect(hit.tier, `${row.id}:${hit.id}`).toBe("backfill");
        }
      }
    }
  });
});

describe("fit formula", () => {
  it("11. returns pos without a negative clause", () => expect(clauseFit([0.2, 0.5])).toBe(0.5));
  it("12. returns pos when neg is not greater", () => expect(clauseFit([0.5], [0.4])).toBe(0.5));
  it("13. subtracts excess negative evidence", () => expect(clauseFit([0.5], [0.8])).toBeCloseTo(0.2));
});

describe("hysteresis pass", () => {
  const items = [
    { id: "a", score: 10, tier: "gated" },
    { id: "b", score: 20, tier: "backfill" },
    { id: "c", score: 30, tier: "gated" },
  ];

  it("14. keeps identity at Infinity", () => expect(applyClauseHysteresis(items, new Map(), Infinity)).toEqual(items));
  it("15. swaps at the exact positive margin boundary only", () => {
    expect(applyClauseHysteresis(items.slice(0, 2), new Map([["a", 0.5], ["b", 0.53]]), 0.03).map((x) => x.id)).toEqual(["b", "a"]);
    expect(applyClauseHysteresis(items.slice(0, 2), new Map([["a", 0.5], ["b", 0.53 - 1e-9]]), 0.03).map((x) => x.id)).toEqual(["a", "b"]);
  });
  it("16. does not swap equal fit at zero", () => expect(applyClauseHysteresis(items, new Map(items.map((x) => [x.id, 1])), 0).map((x) => x.id)).toEqual(["a", "b", "c"]));
  it("17. stops at the first non-dominated preceding item", () => {
    const result = applyClauseHysteresis(items, new Map([["a", 0.2], ["b", 0.8], ["c", 0.7]]), 0).map((x) => x.id);
    expect(result).toEqual(["b", "c", "a"]);
  });
  it("18. preserves tier and lexical score on swapped backfill entries", () => {
    const result = applyClauseHysteresis(items, new Map([["a", 0.1], ["b", 0.9], ["c", 0.2]]), 0.03);
    expect(result.find((x) => x.id === "b")).toEqual({ id: "b", score: 20, tier: "backfill" });
  });
  it("19. keeps equal fit order at every registered margin", () => {
    for (const margin of [0, 0.03, 0.06, 0.10, Infinity]) {
      expect(applyClauseHysteresis(items, new Map(items.map((x) => [x.id, 1])), margin).map((x) => x.id)).toEqual(["a", "b", "c"]);
    }
  });
});

describe("artifact integrity", () => {
  const artifactExists = (() => {
    try { readFileSync(CLAUSE_ARTIFACT_PATH); return true; } catch { return false; }
  })();

  it.skipIf(!artifactExists)("20. validates artifact count, dimensions, model, and runtime", () => {
    const { artifact, vectors } = loadBankedRerankClauseArtifact();
    expect(vectors).toHaveLength(artifact.clauses.length);
    expect(vectors.every((vector) => vector.length === 1024)).toBe(true);
    expect(artifact.model.revision).toBe("c25a394dd583836952667c12f008335071b3f43d");
    expect(artifact.runtime).toEqual({ package: "@huggingface/transformers", version: "4.2.0" });
    expect(artifact.model).toEqual(MODEL);
  });

  it.skipIf(!artifactExists)("21. rejects any mutation of the banked artifact file", () => {
    const artifact = JSON.parse(readFileSync(CLAUSE_ARTIFACT_PATH, "utf8"));
    artifact.clauses[0].textSha256 = "0".repeat(64);
    const directory = mkdtempSync(path.join(tmpdir(), "clause-artifact-"));
    const artifactPath = path.join(directory, "artifact.json");
    writeFileSync(artifactPath, JSON.stringify(artifact));
    expect(() => loadClauseArtifact({ requireCatalogMatch: false, artifactPath })).not.toThrow();
    expect(() => loadBankedRerankClauseArtifact({ artifactPath })).toThrow(/file SHA-256 drift/);
  });

  it("22. loads the frozen accepted epoch and expires isolated source drift before scoring", () => {
    const { sourceEpoch } = loadFrozenLeakageProjection();
    const acceptedInputs = {
      manifestSha256: sourceEpoch.manifestSha256,
      inventorySha256: sourceEpoch.inventorySha256,
      archetypesSha256: sourceEpoch.archetypesSha256,
    };
    const artifactInputs = JSON.parse(readFileSync(CLAUSE_ARTIFACT_PATH, "utf8")).inputs;
    expect(artifactInputs).toMatchObject(acceptedInputs);
    expect(() => assertClauseArtifactInputEpoch(artifactInputs, structuredClone(artifactInputs)))
      .not.toThrow();

    const score = vi.fn();
    const mismatchedInputs = { ...artifactInputs, manifestSha256: "0".repeat(64) };
    expect(() => {
      assertClauseArtifactInputEpoch(artifactInputs, mismatchedInputs);
      score();
    })
      .toThrow(/surface-expired: clause artifact input drift/);
    expect(score).not.toHaveBeenCalled();
  });

  it.skipIf(!artifactExists)("23. leaves the banked artifact unchanged after a builder source mismatch", async () => {
    const bytes = readFileSync(CLAUSE_ARTIFACT_PATH);
    const bytesSha256 = sha256(bytes);
    const artifact = JSON.parse(bytes.toString("utf8"));
    const directory = mkdtempSync(path.join(tmpdir(), "clause-build-"));
    const artifactPath = path.join(directory, "banked.json");
    writeFileSync(artifactPath, bytes);
    const embed = vi.fn();
    const write = vi.fn();
    const source = {
      inputs: { ...artifact.inputs, manifestSha256: "0".repeat(64) },
      unmatchedScoutOps: artifact.unmatchedScoutOps,
      clauses: [],
    };

    await expect(buildClauseArtifact({ source, artifactPath, embed, write }))
      .rejects.toThrow(/surface-expired: clause artifact input drift/);
    const unchangedBytes = readFileSync(artifactPath);
    expect(unchangedBytes).toHaveLength(bytes.length);
    expect(sha256(unchangedBytes)).toBe(bytesSha256);
    expect(embed).not.toHaveBeenCalled();
    expect(write).not.toHaveBeenCalled();
  });
});

it("24. fails when no grid reading passes", () => {
  expect(shouldFail({ readings: [{ role: "identity", acceptance: { pass: true } }, { role: "grid", acceptance: { pass: false } }] })).toBe(true);
});
