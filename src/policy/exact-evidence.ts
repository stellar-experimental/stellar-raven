/**
 * Host guidance for a candidate-lane call whose result held the document the query names by
 * identifier (see `exactRowsOf` in src/executor/providers.ts). It adds one generated exception to
 * the CANDIDATE EVIDENCE block and changes nothing when no call carries an exact row.
 */

/** A candidate-lane call whose result held the document the query names by identifier. */
export type ExactEvidenceCall = {
  op: string;
  rows: Array<{ key: string; url?: string }>;
};

/**
 * One sentence per call, built from the call: the operation, each row's own slug, and its URL. It
 * states identity only. It makes no claim about status, version, or date, which stay with the text
 * the row returned.
 */
export function exactEvidenceSentences(exact: readonly ExactEvidenceCall[] | undefined): string {
  return (exact ?? [])
    .filter((call) => call.rows.length > 0)
    .map((call) => {
      const rows = call.rows.map(({ key, url }) => (url ? `\`${key}\`, \`${url}\`` : `\`${key}\``)).join("; ");
      return ` Exception: \`${call.op}\` returned the document the query names by identifier (${rows}). That row is the document itself, not a candidate. State only what its returned text shows. A status or version line that is not in the returned text is unverified. The other rows stay candidates.`;
    })
    .join("");
}

/**
 * The candidate block with its exception appended. An empty block (no candidate call, or the
 * build-stage suppression) stays empty, and a block with no exact row is returned unchanged.
 */
export function withExactEvidence(candidateBlock: string, exact: readonly ExactEvidenceCall[] | undefined): string {
  return candidateBlock === "" ? "" : `${candidateBlock}${exactEvidenceSentences(exact)}`;
}
