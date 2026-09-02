/**
 * Evidence-backed corrections for the model-facing service contracts.
 *
 * Inventory snapshots retain the upstream source data. Both generators apply
 * this one exact-id overlay before they emit a contract for the model.
 */
const CORRECTIONS = {
  "lumenloop.find_av_passages": {
    // ll-019: Upstream's `returns` text calls `created_at` the recording's date. Live rows contradict it. The field's real meaning is undocumented.
    description:
      "Find specific passages in long videos, podcasts, and recorded talks by semantic similarity. Returns parent recording metadata, AI summaries, and an opaque ordering offset.",
    returns:
      "Array of AV items with AI summaries, created_at (upstream metadata; do not treat it as the recording date or recency evidence), start_offset (an opaque transcript chunk offset for ordering passages within a recording — NOT playback seconds; do not render it as a timestamp or build a deep-link from it), and link. Transcript text itself is never returned — cite the link + the passage summary."
  },
  "lumenloop.find_content_by_entity": {
    returns:
      "Content grouped by type in articles, av, events, proposals, and scf_submissions, with matched-entity confidence and content metadata."
  },
  "lumenloop.get_related_projects": {
    returns:
      "An object with content, which contains mentioned projects with public info (slug, title, description, category)."
  }
};

/**
 * Apply the exact upstream corrections that affect a model-facing contract.
 * The caller can supply either a collapsed inputSchema or OpenAPI parameters.
 */
export function applyModelContractCorrection(id, contract) {
  const correction = CORRECTIONS[id];
  if (!correction) return contract;

  const corrected = { ...contract };
  if (correction.description) corrected.description = correction.description;
  if (correction.returns) corrected.returns = correction.returns;
  return corrected;
}
