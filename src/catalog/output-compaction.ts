/**
 * Shared output-schema compaction threshold. A rendered output type block
 * above this size is replaced by a top-level-field stub in search hits and
 * the super spec. Why 2000: measurement over the whole manifest on
 * 2026-07-06 found every output block at or below 1,350 chars except three
 * Scout outliers. The threshold sat in the dead zone before those outliers.
 * Later Scout schemas expanded the compacted set without changing the rule.
 * The full schema remains available through codemode.describe(id).
 */
export const COMPACT_OUTPUT_THRESHOLD = 2000;

export function isOversizedOutputBlock(renderedOutputBlock: string): boolean {
  return renderedOutputBlock.length > COMPACT_OUTPUT_THRESHOLD;
}
