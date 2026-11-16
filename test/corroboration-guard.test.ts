/**
 * The corroboration guard (tuning loop 2, amendments A1 and A2): one frozen sentence that renders
 * at the end of the CANDIDATE EVIDENCE block, and as its own line when that block does not render
 * but the run returned rows from a family that is not an official record.
 */
import { describe, expect, it, vi } from "vitest";
// run.ts is Worker-only; the ledger summary is a pure function.
vi.mock("cloudflare:workers", () => ({ tracing: { trace: async (_name: string, fn: () => unknown) => fn() } }));
vi.mock("@cloudflare/codemode", () => ({ DynamicWorkerExecutor: class DynamicWorkerExecutor {} }));

import { CORROBORATION_GUARD } from "../src/policy/corroboration";
import {
  candidateEvidenceBlock,
  candidateEvidenceSection,
  type CandidateSectionInput
} from "../src/policy/evidence-checkpoint";
import { withExactEvidence } from "../src/policy/exact-evidence";
import { summarizeOperationLedger } from "../src/executor/run";
import type { OpLedgerCall } from "../src/executor/providers";
import { getCatalog } from "../src/catalog/load";

/** The candidate block as it read before the guard, so a test can prove only the sentence was added. */
const BLOCK_BEFORE_GUARD = (count: number) =>
  `\n\n--- CANDIDATE EVIDENCE ---\nThis run used ${count} semantic, research, A/V, or fallback-directory call(s). These rows are candidates, not identity or absence proof: require an exact identity or canonical slug plus source and date, date current or mutable claims by observation time, discard adjacent matches, and keep any non-verification source-scoped. For a closed-world directory answer, inspect match_mode and report only that source's exact result.`;

describe("the guard sentence", () => {
  it("names the record rather than the party, and requires attribution for the rest", () => {
    for (const kind of ["Audit", "incident", "governance", "standards-authorship"]) expect(CORROBORATION_GUARD).toContain(kind);
    expect(CORROBORATION_GUARD).toContain("are fact only when Stellar Docs, a skill or a primary record a result returned");
    expect(CORROBORATION_GUARD).toContain("the audit report itself, the standard's own file, the decision record");
    expect(CORROBORATION_GUARD).toContain("a party's statement about itself (its own audit claim, its post-mortem, its marketing)");
    expect(CORROBORATION_GUARD).toContain("name the source and date, and do not state it as fact");
    expect(CORROBORATION_GUARD).not.toMatch(/\b(?:lumenloop|scout|stellarDocs|skills)\./);
  });
});

describe("the CANDIDATE EVIDENCE block", () => {
  it("is the earlier block plus the guard, with its own text and render rule unchanged", () => {
    expect(candidateEvidenceBlock(2)).toBe(`${BLOCK_BEFORE_GUARD(2)} ${CORROBORATION_GUARD}`);
    expect(candidateEvidenceBlock(undefined)).toBe("");
    expect(candidateEvidenceBlock(0)).toBe("");
    expect(candidateEvidenceBlock(2, true)).toBe("");
  });

  it("puts the guard before any exact-row exception", () => {
    const block = candidateEvidenceBlock(1);
    const withException = withExactEvidence(block, [{ op: "scout.searchResearch", rows: [{ key: "sep-0043" }] }]);
    expect(withException.startsWith(block)).toBe(true);
    expect(withException.indexOf(CORROBORATION_GUARD)).toBeLessThan(withException.indexOf("Exception:"));
  });
});

describe("candidateEvidenceSection", () => {
  const base: CandidateSectionInput = { hasPriorArtPreflight: false, priorArtBlockRenders: false };

  it("renders the block, with the guard once and no standalone line, when a candidate call ran", () => {
    const text = candidateEvidenceSection({ ...base, candidateEvidence: 1, uncorroboratedEvidence: 3 });
    expect(text).toBe(candidateEvidenceBlock(1));
    expect(text.split(CORROBORATION_GUARD)).toHaveLength(2);
  });

  it("renders the guard as its own line when rows came from an uncorroborated family and no block renders", () => {
    expect(candidateEvidenceSection({ ...base, uncorroboratedEvidence: 1 })).toBe(`\n\n${CORROBORATION_GUARD}`);
  });

  it("renders nothing when every row came from a corroborating family, or the run had no rows", () => {
    expect(candidateEvidenceSection(base)).toBe("");
    expect(candidateEvidenceSection({ ...base, uncorroboratedEvidence: 0 })).toBe("");
  });

  it("is not added when the PRIOR-ART block renders, and the candidate block stays suppressed", () => {
    const input = { ...base, candidateEvidence: 1, uncorroboratedEvidence: 2, hasPriorArtPreflight: true, priorArtBlockRenders: true };
    expect(candidateEvidenceSection(input)).toBe("");
    expect(candidateEvidenceSection({ ...input, candidateEvidence: undefined })).toBe("");
  });

  it("keeps the line where the build-stage block is suppressed but no PRIOR-ART block renders", () => {
    const text = candidateEvidenceSection({ ...base, uncorroboratedEvidence: 1, hasPriorArtPreflight: true });
    expect(text).toBe(`\n\n${CORROBORATION_GUARD}`);
  });
});

describe("the call ledger", () => {
  const sectionOf = (summary: ReturnType<typeof summarizeOperationLedger>) =>
    candidateEvidenceSection({
      candidateEvidence: summary.candidateEvidence,
      uncorroboratedEvidence: summary.uncorroboratedEvidence,
      hasPriorArtPreflight: false,
      priorArtBlockRenders: false
    });

  const ok = (op: string, extra: Partial<OpLedgerCall> = {}): OpLedgerCall => ({
    op,
    outcome: "ok",
    hasServiceData: true,
    ms: 1,
    ...extra
  });

  it("counts a listAudits-only run: the audit directory is uncorroborated and carries no candidate block", () => {
    const summary = summarizeOperationLedger([ok("scout.listAudits")]);
    expect(summary.uncorroboratedEvidence).toBe(1);
    expect(summary.candidateEvidence).toBeUndefined();
    expect(sectionOf(summary)).toBe(`\n\n${CORROBORATION_GUARD}`);
  });

  it("counts a searchRepos-only run", () => {
    const summary = summarizeOperationLedger([ok("scout.searchRepos")]);
    expect(summary.uncorroboratedEvidence).toBe(1);
    expect(summary.priorArtCandidates).toBe(1);
  });

  it("counts the other directory and detail reads that never carry the candidate block", () => {
    for (const op of ["scout.getRepoTrust", "lumenloop.get_project", "lumenloop.get_document"]) {
      expect(summarizeOperationLedger([ok(op)]).uncorroboratedEvidence, op).toBe(1);
    }
  });

  it("counts nothing for a corroborating family, a failed call, a soft-empty call, or a call with no rows", () => {
    const summary = summarizeOperationLedger([
      ok("stellarDocs.search_docs"),
      ok("scout.listAudits", { outcome: "error" }),
      ok("scout.listAudits", { outcome: "soft-empty" }),
      ok("scout.listAudits", { hasServiceData: false })
    ]);
    expect(summary.uncorroboratedEvidence).toBeUndefined();
  });

  it("counts a candidate call both ways, so the block renders and the line does not", () => {
    const summary = summarizeOperationLedger([ok("scout.searchResearch", { caveat: "unverified-match" })]);
    expect(summary).toMatchObject({ candidateEvidence: 1, uncorroboratedEvidence: 1 });
    expect(sectionOf(summary)).toBe(candidateEvidenceBlock(1));
  });

  it("derives the family from the operation id, which every catalog operation id starts with", () => {
    for (const entry of getCatalog().entries.filter((e) => e.kind === "operation")) {
      expect(entry.id.split(".", 1)[0], entry.id).toBe(entry.service);
    }
  });
});
