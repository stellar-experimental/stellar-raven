import type { RetrievalReason } from "../catalog/types.ts";
import { CORROBORATION_GUARD } from "./corroboration.ts";
import { withExactEvidence, type ExactEvidenceCall } from "./exact-evidence.ts";

export type EvidenceRecoveryCandidate = {
  id: string;
  relation: string;
  reasons: RetrievalReason[];
};

/**
 * Query-independent advice derived only from successful operation ids and the
 * catalog recovery graph. It never claims that a returned payload is empty or
 * irrelevant; the model still owns that answer-level judgment.
 */
export type EvidenceRecoveryHint = {
  mode: "narrow-only" | "conditional-alternatives" | "detail-only";
  sourceOperations: string[];
  candidates: EvidenceRecoveryCandidate[];
  /** Whole-record reads that complete evidence the run already holds. Not alternatives. */
  detail?: EvidenceDetailPointer[];
};

/** A source whose rows are parts of records, and the operation that returns one whole record. */
export type EvidenceDetailPointer = {
  target: string;
  sourceOperations: string[];
  /** The target's required inputs, each carried by a source row. */
  keys: string[];
};

/** The hint with only its detail pointers, or null when it has none. */
export function detailOnlyHint(hint: EvidenceRecoveryHint | null | undefined): EvidenceRecoveryHint | null {
  if (!hint?.detail?.length) return null;
  return {
    mode: "detail-only",
    sourceOperations: [...new Set(hint.detail.flatMap((pointer) => pointer.sourceOperations))],
    candidates: [],
    detail: hint.detail
  };
}

/**
 * Runtime guidance for broad candidate lanes. Keeping this beside the narrow
 * checkpoint makes the MCP and playground expose the same evidence contract.
 * The operation ledger can identify the lane, but it cannot inspect arbitrary
 * model-authored projections, so the wording stays conditional.
 */
export function candidateEvidenceBlock(count: number | undefined, suppressed = false): string {
  if (!count || suppressed) return "";
  return `\n\n--- CANDIDATE EVIDENCE ---\nThis run used ${count} semantic, research, A/V, or fallback-directory call(s). These rows are candidates, not identity or absence proof: require an exact identity or canonical slug plus source and date, date current or mutable claims by observation time, discard adjacent matches, and keep any non-verification source-scoped. For a closed-world directory answer, inspect match_mode and report only that source's exact result. ${CORROBORATION_GUARD}`;
}

/** What the host observed about the run's calls that decides which candidate-side text renders. */
export type CandidateSectionInput = {
  /** Successful calls marked `unverified-match`. */
  candidateEvidence?: number;
  /** Successful calls that returned rows from a family outside the corroborating families. */
  uncorroboratedEvidence?: number;
  /** A build-stage run: the CANDIDATE EVIDENCE block stays suppressed. */
  hasPriorArtPreflight: boolean;
  /** The PRIOR-ART block renders in the result; it carries its own audit clause, so no standalone guard. */
  priorArtBlockRenders: boolean;
  exactEvidence?: readonly ExactEvidenceCall[];
};

/**
 * The text a result carries about candidate rows, in one place for the MCP tool and the
 * Playground. The CANDIDATE EVIDENCE block, when it renders, ends with the corroboration guard,
 * then any exact-row exception. When it does not render, the guard stands alone as its own line
 * whenever the run returned rows from a family that is not an official record, unless the
 * PRIOR-ART block renders. Both conditions come from the call ledger; no operation or topic is
 * named.
 */
export function candidateEvidenceSection(input: CandidateSectionInput): string {
  const block = candidateEvidenceBlock(input.candidateEvidence, input.hasPriorArtPreflight);
  if (block !== "") return withExactEvidence(block, input.exactEvidence);
  if (input.priorArtBlockRenders || !input.uncorroboratedEvidence) return "";
  return `\n\n${CORROBORATION_GUARD}`;
}

/** One sentence per target, built from the edge: its source operations, target, and join keys. */
function detailSentences(detail: readonly EvidenceDetailPointer[] | undefined): string {
  return (detail ?? [])
    .map(({ target, sourceOperations, keys }) => {
      const joined = keys.map((key) => `\`${key}\``).join(" and ");
      return `\`${sourceOperations.join(", ")}\` returned sections of pages, not whole pages. A section is exact evidence only for what it shows whole. Before you state a list, number, formula, code, or status it does not show whole, read the page: \`${target}({ ${keys.join(", ")} })\` with that hit's ${joined}.`;
    })
    .join(" ");
}

export function evidenceCheckpointBlock(hint: EvidenceRecoveryHint | undefined): string {
  if (!hint) return "";
  const detail = detailSentences(hint.detail);
  if (!hint.candidates.length) return detail ? `\n\n--- EVIDENCE CHECKPOINT ---\n${detail}` : "";
  const lead = detail ? `${detail} ` : "";
  const sources = hint.sourceOperations.join(", ");
  const candidates = hint.candidates
    .map((candidate) => `${candidate.id} (${candidate.relation}; ${candidate.reasons.join("/")})`)
    .join(", ");
  if (hint.mode === "conditional-alternatives") {
    return `\n\n--- EVIDENCE CHECKPOINT ---\n${lead}The host observed successful broad operation class(es) (${sources}); it did not inspect or judge the returned rows. If exact evidence already answers the request, or the user asked a closed-world question about a named source, stop at that scope without extra calls. If the open-world question remains unanswered, make at most one bounded alternative pass using an uncalled exact recovery candidate: ${candidates}. Candidate rows still require exact identity or canonical slug plus source and date before attribution.`;
  }
  return `\n\n--- EVIDENCE CHECKPOINT ---\n${lead}This run used successful narrow, operation-scoped lookup(s) only (${sources}); the host did not observe a semantic, research, A/V, or corpus-wide candidate lane. Inspect the returned projection before stopping. If it exactly answers the request, or the user asked a closed-world question about the named source, answer at that scope without extra calls. If an open-world identity, history, or footprint remains empty, weak, adjacent, ambiguous, or partial, make one bounded wider pass using an exact recovery candidate: ${candidates}. Candidate rows still require exact identity or canonical slug plus source and date before attribution.`;
}
