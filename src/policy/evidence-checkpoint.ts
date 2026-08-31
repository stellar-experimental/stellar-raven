import type { RetrievalReason } from "../catalog/types.ts";

export type EvidenceRecoveryCandidate = {
  id: string;
  relation: string;
  reasons: RetrievalReason[];
};

/**
 * Query-independent advice derived only from non-error operation ids and the
 * catalog recovery graph. It never claims that a returned payload is empty or
 * irrelevant; the model still owns that answer-level judgment.
 */
export type EvidenceRecoveryHint = {
  mode: "narrow-only" | "conditional-alternatives";
  sourceOperations: string[];
  candidates: EvidenceRecoveryCandidate[];
};

/**
 * Runtime guidance for broad candidate lanes. Keeping this beside the narrow
 * checkpoint makes the MCP and playground expose the same evidence contract.
 * The operation ledger can identify the lane, but it cannot inspect arbitrary
 * model-authored projections, so the wording stays conditional.
 */
export function candidateEvidenceBlock(count: number | undefined, suppressed = false): string {
  if (!count || suppressed) return "";
  return `\n\n--- CANDIDATE EVIDENCE ---\nThis run used ${count} semantic, research, A/V, or fallback-directory call(s). These rows are candidates, not identity or absence proof: require an exact identity or canonical slug plus source and date, date current or mutable claims by observation time, discard adjacent matches, and keep any non-verification source-scoped. For a closed-world directory answer, inspect match_mode and report only that source's exact result.`;
}

export function evidenceCheckpointBlock(hint: EvidenceRecoveryHint | undefined): string {
  if (!hint?.candidates.length) return "";
  const sources = hint.sourceOperations.join(", ");
  const repositoryRecovery = hint.candidates.some((candidate) => candidate.relation === "source-code")
    ? " Use a source-code candidate only when prior evidence identifies one exact repository. Pass its canonical owner/name and make only one repository explanation attempt."
    : "";
  const candidates = hint.candidates
    .map((candidate) => `${candidate.id} (${candidate.relation}; ${candidate.reasons.join("/")})`)
    .join(", ");
  if (hint.mode === "conditional-alternatives") {
    return `\n\n--- EVIDENCE CHECKPOINT ---\nThe host observed completed broad operation class(es) (${sources}); it did not inspect or judge the returned rows. If exact evidence already answers the request, or the user asked a closed-world question about a named source, stop at that scope without extra calls. If the open-world question remains unanswered, make at most one bounded alternative pass using an uncalled exact recovery candidate: ${candidates}.${repositoryRecovery} Candidate rows still require exact identity or canonical slug plus source and date before attribution.`;
  }
  return `\n\n--- EVIDENCE CHECKPOINT ---\nThis run used completed narrow, operation-scoped lookup(s) only (${sources}); the host did not observe a semantic, research, A/V, or corpus-wide candidate lane. Inspect the returned projection before stopping. If it exactly answers the request, or the user asked a closed-world question about the named source, answer at that scope without extra calls. If an open-world identity, history, or footprint remains empty, weak, adjacent, ambiguous, or partial, make one bounded wider pass using an exact recovery candidate: ${candidates}.${repositoryRecovery} Candidate rows still require exact identity or canonical slug plus source and date before attribution.`;
}
