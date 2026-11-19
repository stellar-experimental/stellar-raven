import { describe, expect, it } from "vitest";
import {
  detailOnlyHint,
  evidenceCheckpointBlock,
  type EvidenceRecoveryHint
} from "../src/policy/evidence-checkpoint";

describe("evidence checkpoint prose", () => {
  it("names only catalog-derived recovery candidates", () => {
    const block = evidenceCheckpointBlock({
      mode: "narrow-only",
      sourceOperations: ["scout.getBuilders"],
      candidates: [
        {
          id: "lumenloop.search_content_semantic",
          relation: "broader-semantic",
          reasons: ["empty", "weak"]
        }
      ]
    });
    expect(block).toContain("scout.getBuilders");
    expect(block).toContain("lumenloop.search_content_semantic (broader-semantic; empty/weak)");
    expect(block).toContain("If it exactly answers the request");
  });

  it("renders broad alternatives conditionally without judging payload relevance", () => {
    const block = evidenceCheckpointBlock({
      mode: "conditional-alternatives",
      sourceOperations: ["stellarDocs.search_docs"],
      candidates: [
        {
          id: "lumenloop.search_content_semantic",
          relation: "cross-family",
          reasons: ["weak", "adjacent", "ambiguous"]
        }
      ]
    });
    expect(block).toContain("successful broad operation class(es)");
    expect(block).toContain("did not inspect or judge the returned rows");
    expect(block).toContain("If exact evidence already answers");
    expect(block).toContain("closed-world question");
    expect(block).toContain("at most one bounded alternative pass");
    expect(block).not.toMatch(/rows (?:were|are) weak|irrelevant rows|non-match/i);
  });

  describe("detail pointers", () => {
    const alternatives: EvidenceRecoveryHint = {
      mode: "conditional-alternatives",
      sourceOperations: ["stellarDocs.search_docs"],
      candidates: [{ id: "scout.searchResearch", relation: "cited-research", reasons: ["weak"] }]
    };
    const detail = [
      {
        target: "stellarDocs.get_doc_page",
        sourceOperations: ["stellarDocs.search_docs"],
        keys: ["path"]
      }
    ];
    // The wording is frozen by amendment A7. Every operation name and key below comes from the edge.
    const SENTENCE =
      "`stellarDocs.search_docs` returned sections of pages, not whole pages. A section is exact evidence only for what it shows whole. Before you state a list, number, formula, code, or status it does not show whole, read the page: `stellarDocs.get_doc_page({ path })` with that hit's `path`.";

    it("renders the frozen sentence alone for a detail-only hint", () => {
      const block = evidenceCheckpointBlock({
        mode: "detail-only",
        sourceOperations: ["stellarDocs.search_docs"],
        candidates: [],
        detail
      });
      expect(block).toBe(`\n\n--- EVIDENCE CHECKPOINT ---\n${SENTENCE}`);
      expect(block).not.toContain("at most one bounded");
    });

    it("puts the sentence first and leaves the mode sentences byte-identical", () => {
      for (const mode of ["conditional-alternatives", "narrow-only"] as const) {
        const base: EvidenceRecoveryHint = { ...alternatives, mode };
        const plain = evidenceCheckpointBlock(base);
        const withDetail = evidenceCheckpointBlock({ ...base, detail });
        expect(withDetail).toBe(plain.replace("---\n", `---\n${SENTENCE} `));
      }
    });

    it("names its own rows when an edge says what its source returns, and leaves the Docs sentence alone", () => {
      const block = evidenceCheckpointBlock({
        mode: "detail-only",
        sourceOperations: ["stellarOrg.search_site"],
        candidates: [],
        detail: [
          {
            target: "stellarOrg.get_page",
            sourceOperations: ["stellarOrg.search_site"],
            keys: ["path"],
            part: { plural: "page rows", singular: "row" }
          }
        ]
      });
      expect(block).toBe(
        "\n\n--- EVIDENCE CHECKPOINT ---\n`stellarOrg.search_site` returned page rows, not whole pages. A row is exact evidence only for what it shows whole. Before you state a list, number, formula, code, or status it does not show whole, read the page: `stellarOrg.get_page({ path })` with that hit's `path`."
      );
      // The same edge shape without `part` is the Docs sentence, byte for byte.
      expect(evidenceCheckpointBlock({ mode: "detail-only", sourceOperations: ["stellarDocs.search_docs"], candidates: [], detail })).toContain(SENTENCE);
    });

    it("renders nothing for a hint with neither alternatives nor detail", () => {
      expect(evidenceCheckpointBlock({ ...alternatives, candidates: [] })).toBe("");
      expect(evidenceCheckpointBlock(undefined)).toBe("");
    });

    it("joins several source operations and several keys from the edge", () => {
      const block = evidenceCheckpointBlock({
        mode: "detail-only",
        sourceOperations: ["a.search", "a.search_in"],
        candidates: [],
        detail: [{ target: "a.get", sourceOperations: ["a.search", "a.search_in"], keys: ["id", "rev"] }]
      });
      expect(block).toContain("`a.search, a.search_in` returned sections of pages");
      expect(block).toContain("`a.get({ id, rev })` with that hit's `id` and `rev`.");
    });

    it("splits a hint into its detail-only part", () => {
      expect(detailOnlyHint(alternatives)).toBeNull();
      expect(detailOnlyHint(null)).toBeNull();
      expect(detailOnlyHint({ ...alternatives, detail })).toEqual({
        mode: "detail-only",
        sourceOperations: ["stellarDocs.search_docs"],
        candidates: [],
        detail
      });
    });
  });
});
