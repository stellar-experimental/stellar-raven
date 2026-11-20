/**
 * Output type blocks larger than this are stubbed to top-level field names in search hits
 * and the super spec; full shapes remain available via `codemode.describe(id)`.
 */
export const COMPACT_OUTPUT_THRESHOLD = 2000;

export function isOversizedOutputBlock(renderedOutputBlock: string): boolean {
  return renderedOutputBlock.length > COMPACT_OUTPUT_THRESHOLD;
}
