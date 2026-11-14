// Ambient declaration for build-micro-map.mjs (plain JS, no build step) so
// test/mcp-instructions.test.ts can import its guard under `tsc --noEmit`.
// Keep in sync with the exported surface that TypeScript tests use.
export function assertGeneratedTextNoNonExposedRefs(
  text: string,
  entries: ReadonlyArray<{ kind: string; id: string }>,
  label: string
): void;
