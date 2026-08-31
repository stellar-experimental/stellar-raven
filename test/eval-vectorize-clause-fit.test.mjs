import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import manifestJson from "../catalog/manifest.json" with { type: "json" };
import originalContract from "../eval/protocol-history-cases.json" with { type: "json" };
import blindContract from "../eval/protocol-history-blind-cases.json" with { type: "json" };
import { loadManifest, searchCatalog } from "../src/catalog/search.ts";
import { scoreEntryWeighted } from "../src/catalog/scoring.ts";
import {
  CLAUSE_ARTIFACT_PATH,
  EXPECTED_UNMATCHED_SCOUT_OPS,
  MODEL,
  applyClauseHysteresis,
  buildClauses,
  clauseFit,
  loadClauseSource,
  splitDescription,
} from "../eval/vectorize/clause-config.mjs";
import {
  buildCandidateUnion,
  loadClauseArtifact,
  scoringProjection,
} from "../eval/vectorize/clause-retrieval.mjs";
import { shouldFail } from "../eval/vectorize/run-clause-fit.mjs";

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
    const source = loadClauseSource();
    expect(source.unmatchedScoutOps).toEqual(EXPECTED_UNMATCHED_SCOUT_OPS);
    for (const id of EXPECTED_UNMATCHED_SCOUT_OPS) {
      const clauses = source.clauses.filter((clause) => clause.entryId === id);
      expect(clauses.length).toBeGreaterThan(0);
      expect(new Set(clauses.map((clause) => clause.source))).toEqual(new Set(["description"]));
    }
  });
});

it("7. keeps frozen case ids and questions out of clauses", () => {
  const text = loadClauseSource().clauses.map((clause) => clause.text).join("\n");
  for (const contract of [originalContract, blindContract]) {
    for (const row of [...contract.positiveCases, ...contract.controlCases]) {
      expect(text).not.toContain(row.id);
      expect(text).not.toContain(row.question);
    }
  }
});

describe("candidate union membership", () => {
  const catalog = loadManifest(manifestJson);
  const contracts = [originalContract, blindContract];

  it("8. includes scout.searchResearch for all 19 frozen positives", () => {
    for (const row of contracts.flatMap((contract) => contract.positiveCases)) {
      const union = buildCandidateUnion(searchCatalog, catalog, row.question);
      expect(union.map((hit) => hit.id), row.id).toContain("scout.searchResearch");
    }
  });

  it("9. has no duplicates and marks every gated failure as backfill", () => {
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
  it("10. returns pos without a negative clause", () => expect(clauseFit([0.2, 0.5])).toBe(0.5));
  it("11. returns pos when neg is not greater", () => expect(clauseFit([0.5], [0.4])).toBe(0.5));
  it("12. subtracts excess negative evidence", () => expect(clauseFit([0.5], [0.8])).toBeCloseTo(0.2));
});

describe("hysteresis pass", () => {
  const items = [
    { id: "a", score: 10, tier: "gated" },
    { id: "b", score: 20, tier: "backfill" },
    { id: "c", score: 30, tier: "gated" },
  ];

  it("13. keeps identity at Infinity", () => expect(applyClauseHysteresis(items, new Map(), Infinity)).toEqual(items));
  it("14. swaps at the exact positive margin boundary only", () => {
    expect(applyClauseHysteresis(items.slice(0, 2), new Map([["a", 0.5], ["b", 0.53]]), 0.03).map((x) => x.id)).toEqual(["b", "a"]);
    expect(applyClauseHysteresis(items.slice(0, 2), new Map([["a", 0.5], ["b", 0.53 - 1e-9]]), 0.03).map((x) => x.id)).toEqual(["a", "b"]);
  });
  it("15. does not swap equal fit at zero", () => expect(applyClauseHysteresis(items, new Map(items.map((x) => [x.id, 1])), 0).map((x) => x.id)).toEqual(["a", "b", "c"]));
  it("16. stops at the first non-dominated preceding item", () => {
    const result = applyClauseHysteresis(items, new Map([["a", 0.2], ["b", 0.8], ["c", 0.7]]), 0).map((x) => x.id);
    expect(result).toEqual(["b", "c", "a"]);
  });
  it("17. preserves tier and lexical score on swapped backfill entries", () => {
    const result = applyClauseHysteresis(items, new Map([["a", 0.1], ["b", 0.9], ["c", 0.2]]), 0.03);
    expect(result.find((x) => x.id === "b")).toEqual({ id: "b", score: 20, tier: "backfill" });
  });
  it("18. keeps equal fit order at every registered margin", () => {
    for (const margin of [0, 0.03, 0.06, 0.10, Infinity]) {
      expect(applyClauseHysteresis(items, new Map(items.map((x) => [x.id, 1])), margin).map((x) => x.id)).toEqual(["a", "b", "c"]);
    }
  });
});

describe("artifact integrity", () => {
  const artifactExists = (() => {
    try { readFileSync(CLAUSE_ARTIFACT_PATH); return true; } catch { return false; }
  })();

  it.skipIf(!artifactExists)("19. validates artifact count, dimensions, model, and runtime", () => {
    const { artifact, vectors } = loadClauseArtifact({ requireCatalogMatch: false });
    expect(vectors).toHaveLength(artifact.clauses.length);
    expect(vectors.every((vector) => vector.length === 1024)).toBe(true);
    expect(artifact.model.revision).toBe("c25a394dd583836952667c12f008335071b3f43d");
    expect(artifact.runtime).toEqual({ package: "@huggingface/transformers", version: "4.2.0" });
    expect(artifact.model).toEqual(MODEL);
  });

  it.skipIf(!artifactExists)("20. accepts a corrupt text hash only without catalog matching", () => {
    const artifact = JSON.parse(readFileSync(CLAUSE_ARTIFACT_PATH, "utf8"));
    artifact.clauses[0].textSha256 = "0".repeat(64);
    const directory = mkdtempSync(path.join(tmpdir(), "clause-artifact-"));
    const artifactPath = path.join(directory, "artifact.json");
    writeFileSync(artifactPath, JSON.stringify(artifact));
    expect(() => loadClauseArtifact({ requireCatalogMatch: false, artifactPath })).not.toThrow();
    expect(() => loadClauseArtifact({ requireCatalogMatch: true, artifactPath })).toThrow(/clause artifact clause drift/);
  });
});

it("21. fails when no grid reading passes", () => {
  expect(shouldFail({ readings: [{ role: "identity", acceptance: { pass: true } }, { role: "grid", acceptance: { pass: false } }] })).toBe(true);
});
